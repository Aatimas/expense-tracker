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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { ParseIntPipe } from '@nestjs/common';
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
    console.log(request.user);
    return this.categoryService.create(createCategoryDto, request.user);
  }

  @Get()
  findAll(@Request() request): Promise<Category[]> {
    return this.categoryService.findAll(request.user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() request,
  ): Promise<Category> {
    return this.categoryService.findOne(id, request.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() request,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto, request.user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() request,
  ): Promise<void> {
    return this.categoryService.remove(id, request.user);
  }
}
