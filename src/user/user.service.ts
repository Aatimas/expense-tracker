import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) // Injects the User repository for database interactions.
    private userRepository: Repository<UserEntity>, //instantiates the Repository from typeORM
  ) {}

  // Hash password using bcrypt
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  //Retrieves a user by email
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
  }

  //Creates a user and saves to database
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return await this.userRepository.save(user);
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
    let users: UserEntity[];

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
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
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
  async softDelete(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `User with ID ${id} not found or already deleted`,
      );
    }
  }
}
