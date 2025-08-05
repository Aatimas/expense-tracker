import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { CategoryService } from 'src/category/category.service';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // Injects the User repository for database interactions.
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    //instantiates the Repository from typeORM
    private categoryService: CategoryService,
  ) {}

  // Hash password using bcrypt
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  //Retrieves a user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: true, //allows finding soft deleted users
    });
  }

  //Creates a user and saves to database
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(user);
      await this.categoryService.initializeDefaultCategoriesForUser(user);
      return savedUser;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('unique constraint')
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
  //Finds and returns all users
  async findAll(user: {
    userId: string;
    email: string;
  }): Promise<UserResponseDto[]> {
    let users: User[];

    if (user.email === 'admin@gmail.com') {
      // Admin gets all users
      users = await this.userRepository.find();
    } else {
      // Normal user gets only their own data
      const singleUser = await this.userRepository.findOne({
        where: { id: user.userId },
      });

      if (!singleUser) {
        throw new NotFoundException(`User not found`);
      }

      users = [singleUser]; // wrap in array to match return type
    }

    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  //Retrieve single user by id
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  //update user by id
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } }); // throws NotFoundException if not found

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    //if name is changed
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    // Check for email uniqueness (if email is being changed)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      //check if email is given and if user is trying to change email
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }, //check if the given email already exists
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = updateUserDto.email;
    }

    // Only set password if provided
    if (updateUserDto.password) {
      const hashedPassword = await this.hashPassword(updateUserDto.password);
      user.password = hashedPassword;
    }

    return this.userRepository.save(user);
  }

  //delete a user
  // user.service.ts

  async softDelete(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories'], // load related categories
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete related categories first
    await this.categoryRepository.softDelete({ user: { id: userId } });

    // Then soft delete the user
    await this.userRepository.softDelete(userId);
  }
}
