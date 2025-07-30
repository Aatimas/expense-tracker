import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) // Injects the User repository for database interactions.
    private usersRepository: Repository<UserEntity>, //instantiates the Repository from typeORM
  ) {}

  //Checks if the email already exists, creates a new user entity from the DTO, and saves it
  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }
  //Retrieves a user by email
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  //finds and returns all users
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({ withDeleted: false });
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  //retrieve single user by id
  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: false,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  //update user by id
  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id); // throws NotFoundException if not found

    //if name is changed
    if (dto.name) {
      user.name = dto.name;
    }
    // Check for email uniqueness (if email is being changed)
    if (dto.email && dto.email !== user.email) {
      //check if email is given and if user is trying to change email
      const existingUser = await this.usersRepository.findOne({
        where: { email: dto.email }, //check if the given email already exists
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = dto.email;
    }

    // Only set password if provided
    if (dto.password) {
      user.password = dto.password; // hashed automatically via @BeforeUpdate
    }

    return this.usersRepository.save(user);
  }

  //delete a user
  async softDelete(id: string): Promise<void> {
    const result = await this.usersRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `User with ID ${id} not found or already deleted`,
      );
    }
  }
}
