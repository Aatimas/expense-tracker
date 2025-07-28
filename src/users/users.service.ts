import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) // Injects the User repository for database interactions.
    private usersRepository: Repository<UserEntity>, //instantiates the Repository from typeORM
  ) {}

  //Checks if the email already exists, creates a new user entity from the DTO, and saves it
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.findUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }
  //Retrieves a user by email
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
