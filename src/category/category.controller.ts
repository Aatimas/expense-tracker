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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { Category } from './entities/category.entity';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() request,
  ): Promise<Category> {
    return this.categoryService.create(createCategoryDto, request.user);
  }

  @Get()
  findAll(@Request() request): Promise<Category[]> {
    return this.categoryService.findAll(request.user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() request,
  ): Promise<Category> {
    return this.categoryService.findOne(id, request.user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() request,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto, request.user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() request,
  ): Promise<{ message: string }> {
    return this.categoryService.remove(id, request.user);
  }
}
