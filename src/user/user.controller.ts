import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  InternalServerErrorException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  //get user profile
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req) {
    return req.user;
  }

  // get all users
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    return this.userService.findAll(req.user); //get only the authenticated user
  }

  //get user by uuid
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findById(id);
  }

  //update user by uuid
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.userService.update(id, updateUserDto);
    return 'user updated';
  }
  //soft delete by uuid
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.softDelete(id);
    return { message: `User with ID ${id} has been soft deleted.` };
  }
}
