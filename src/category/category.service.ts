import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
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

  // create a new category
  async create(
    createCategoryDto: CreateCategoryDto,
    user: { userId: string; email: string },
  ): Promise<Category> {
    try {
      if (!user?.userId || !user?.email) {
        //check if the user and email field are provided or not checks for null or undefined
        throw new BadRequestException('Invalid user data');
      }

      const { name, type, color, is_default = false } = createCategoryDto; //destructure category fields from the dto

      if (is_default && user.email !== 'admin@gmail.com') {
        //checks if the category is default and user is admin
        throw new ForbiddenException(
          'Only admins can create default categories',
        );
      }

      const existingCategory = await this.categoryRepository.findOne({
        //checks if the category with same name already exists
        where: is_default
          ? { name, user: IsNull() } // checks for default
          : { name, user: { id: user.userId } }, // checks for user, user id is get from token
        select: { id: true, name: true },
      });
      if (existingCategory) {
        throw new ConflictException(
          'Category name already exists for this scope',
        );
      }

      let categoryUser: User | undefined; //variable to hold an instance of user or undefined
      if (!is_default) {
        // check for default
        const foundUser = await this.userRepository.findOne({
          //find user in database to associate with category
          where: { id: user.userId },
          select: { id: true },
        });
        if (!foundUser) {
          //in case user does not exist
          throw new NotFoundException('User not found');
        }
        categoryUser = foundUser; //assign the found user data to categoryUser
      }

      const category = this.categoryRepository.create({
        //create a category with select fields and user is categoryUser
        name,
        type,
        color,
        is_default,
        user: categoryUser,
      });
      const savedCategory = await this.categoryRepository.save(category); //saves data to database
      const result = await this.categoryRepository.findOne({
        //checks if the category we saved still exists in db
        where: { id: savedCategory.id },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          is_default: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
        },
      });
      if (!result) { 
        throw new NotFoundException(
          `Category with ID ${savedCategory.id} not found after creation`,
        );
      }
      return result;                      //returns result
    } catch (error) {                    //other errors
      console.error('Error in CategoryService.create:', {
        message: error.message,
        stack: error.stack,
        user,
        createCategoryDto,
      });
      throw new InternalServerErrorException(
        `Failed to create category: ${error.message}`,
      );
    }
  }

  async findAll(user: { userId: string; email: string }): Promise<Category[]> {
    try {
      if (!user?.userId || !user?.email) {
        throw new BadRequestException('Invalid user data');
      }
      return this.categoryRepository.find({
        where: [{ user: IsNull() }, { user: { id: user.userId } }],
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          is_default: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
        },
      });
    } catch (error) {
      console.error('Error in CategoryService.findAll:', {
        message: error.message,
        stack: error.stack,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch categories: ${error.message}`,
      );
    }
  }

  async findOne(
    id: string,
    user: { userId: string; email: string },
  ): Promise<Category> {
    try {
      if (!user?.userId || !user?.email) {
        throw new BadRequestException('Invalid user data');
      }
      const category = await this.categoryRepository.findOne({
        where: { id },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          is_default: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
          user: { id: true },
        },
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
    } catch (error) {
      console.error('Error in CategoryService.findOne:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to fetch category: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: { userId: string; email: string },
  ): Promise<Category> {
    try {
      if (!user?.userId || !user?.email) {
        throw new BadRequestException('Invalid user data');
      }
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
          select: { id: true, name: true },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(
            'Category name already exists for this scope',
          );
        }
      }

      Object.assign(category, updateCategoryDto);
      const savedCategory = await this.categoryRepository.save(category);
      const result = await this.categoryRepository.findOne({
        where: { id: savedCategory.id },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          is_default: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
        },
      });
      if (!result) {
        throw new NotFoundException(
          `Category with ID ${savedCategory.id} not found after update`,
        );
      }
      return result;
    } catch (error) {
      console.error('Error in CategoryService.update:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
        updateCategoryDto,
      });
      throw new InternalServerErrorException(
        `Failed to update category: ${error.message}`,
      );
    }
  }

  async remove(
    id: string,
    user: { userId: string; email: string },
  ): Promise<{ message: string }> {
    try {
      if (!user?.userId || !user?.email) {
        throw new BadRequestException('Invalid user data');
      }
      const category = await this.findOne(id, user);
      if (category.is_default) {
        throw new ForbiddenException('Default categories cannot be deleted');
      }
      await this.categoryRepository.softDelete(id);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Error in CategoryService.remove:', {
        message: error.message,
        stack: error.stack,
        id,
        user,
      });
      throw new InternalServerErrorException(
        `Failed to delete category: ${error.message}`,
      );
    }
  }

  async initializeDefaultCategories(): Promise<void> {
    try {
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
          select: { id: true, name: true },
        });
        if (!exists) {
          const category = this.categoryRepository.create({
            ...cat,
            user: undefined,
          });
          await this.categoryRepository.save(category);
        }
      }
    } catch (error) {
      console.error('Error in CategoryService.initializeDefaultCategories:', {
        message: error.message,
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        `Failed to initialize default categories: ${error.message}`,
      );
    }
  }
}
