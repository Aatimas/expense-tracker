import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category, TransactionType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  //create a category
  async create(
    createCategoryDto: CreateCategoryDto,
    user: { userId: string; email: string },
  ): Promise<Category> {
    const { name, type, color, is_default = false } = createCategoryDto;

    if (is_default && user.email !== 'admin@gmail.com') {
      throw new ForbiddenException('Only admins can create default categories');
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: is_default
        ? { name, user: IsNull() }
        : { name, user: { id: user.userId } },
    });
    if (existingCategory) {
      throw new ConflictException(
        'Category name already exists for this scope',
      );
    }

    let categoryUser: User | undefined;
    if (!is_default) {
      const foundUser = await this.userRepository.findOne({
        where: { id: user.userId },
      });
      if (!foundUser) {
        throw new NotFoundException('User not found');
      }
      categoryUser = foundUser;
    }

    const category = this.categoryRepository.create({
      name,
      type,
      color,
      is_default,
      user: categoryUser,
    });
    return await this.categoryRepository.save(category);
  }

  //find all category
  async findAll(user: { userId: string; email: string }): Promise<Category[]> {
    return this.categoryRepository.find({
      where: [{ user: IsNull() }, { user: { id: user.userId } }],
      relations: ['user'],
    });
  }


  //get a single category by id
  async findOne(
    id: number,
    user: { userId: string; email: string },
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    if (
      category.user &&
      category.user.id !== user.userId &&
      user.email !== 'admin@gmail.com'
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this category',
      );
    }
    return category;
  }


  //update a category
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: { userId: string; email: string },
  ): Promise<Category> {
    const category = await this.findOne(id, user);
    if (category.is_default && user.email !== 'admin@gmail.com') {
      throw new ForbiddenException(
        'Default categories can only be modified by admins',
      );
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: category.is_default
          ? { name: updateCategoryDto.name, user: IsNull() }
          : { name: updateCategoryDto.name, user: { id: user.userId } },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Category name already exists for this scope',
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }


  //delete a category
  async remove(
    id: number,
    user: { userId: string; email: string },
  ): Promise<any> {
    const category = await this.findOne(id, user);
    if (category.is_default) {
      throw new ForbiddenException('Default categories cannot be deleted');
    }
    await this.categoryRepository.softDelete(id);
    return { message: 'Category deleted successfully' };

  }


  //initialize default categories
  async initializeDefaultCategories(): Promise<void> {
    const defaultCategories: Partial<Category>[] = [
      {
        name: 'Food',
        type: TransactionType.EXPENSE,
        color: '#FF0000',
        is_default: true,
      },
      {
        name: 'Rent',
        type: TransactionType.EXPENSE,
        color: '#FFA500',
        is_default: true,
      },
      {
        name: 'Utilities',
        type: TransactionType.EXPENSE,
        color: '#008000',
        is_default: true,
      },
      {
        name: 'Entertainment',
        type: TransactionType.EXPENSE,
        color: '#0000FF',
        is_default: true,
      },
      {
        name: 'Salary',
        type: TransactionType.INCOME,
        color: '#800080',
        is_default: true,
      },
    ];

    for (const cat of defaultCategories) {
      const exists = await this.categoryRepository.findOne({
        where: { name: cat.name, user: IsNull() },
      });
      if (!exists) {
        const category = this.categoryRepository.create({
          ...cat,
          user: undefined,
        });
        await this.categoryRepository.save(category);
      }
    }
  }
}
