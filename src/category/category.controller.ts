import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { Category } from './entities/category.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: CurrentUserPayload, // full payload from token
  ) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload): Promise<Category[]> {
    return this.categoryService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Category> {
    return this.categoryService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.categoryService.remove(id, user);
  }
}
