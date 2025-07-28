import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,  //instantiates the Repository from typeORM
  ) {}
   async create(createUserDto: CreateUserDto):Promise<UserEntity> {
    const user = this.usersRepository.create(createUserDto); // Prepares the object before sending to db
    return this.usersRepository.save(user); // Inserts into DB
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
