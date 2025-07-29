import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}
  //create new user
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
    return 'user created successfully';
  }
  // get all users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  //get user by uuid
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  //update user by uuid
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.usersService.update(id, updateUserDto);
    return 'user updated';
  }
  //soft delete by uuid
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.softDelete(id);
    return { message: `User with ID ${id} has been soft deleted.` };
  }
}
