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
  constructor(private readonly userService: UserService) {}
  //create new user
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.userService.createUser(createUserDto);
    return 'user created successfully';
  }
  // get all users
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  //get user by uuid
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  //update user by uuid
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.userService.update(id, updateUserDto);
    return 'user updated';
  }
  //soft delete by uuid
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.softDelete(id);
    return { message: `User with ID ${id} has been soft deleted.` };
  }
}
