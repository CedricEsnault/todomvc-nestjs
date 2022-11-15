import { Controller, Get, ParseBoolPipe, Post } from "@nestjs/common";
import {
  Body,
  Delete,
  Header,
  HttpCode,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseInterceptors,
} from "@nestjs/common/decorators";
import { Request } from "express";

import {
  CreateTodoDto,
  UpdatePartialTodoDto,
  UpdateTodoDto,
  TodoResponseDto,
} from "./todos.dto";
import { TodosErrorsInterceptor } from "./todos.interceptor";
import { TodosService } from "./todos.service";

@Controller()
@UseInterceptors(TodosErrorsInterceptor)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(201)
  @Header("Content-Type", "application/json")
  async createTodo(
    @Req() req: Request,
    @Body() body: CreateTodoDto
  ): Promise<TodoResponseDto> {
    const createdTodoDto = await this.todosService.createTodo(body.title);
    createdTodoDto.url = `${req.protocol}://${req.get("host")}${req.url}/${
      createdTodoDto.id
    }`;

    return createdTodoDto;
  }

  @Get()
  @HttpCode(200)
  @Header("Content-Type", "application/json")
  async getList(@Req() req: Request): Promise<TodoResponseDto[]> {
    const baseUrl = `${req.protocol}://${req.get("host")}${req.url}/`;
    const todos = await this.todosService.getListSortedByOrderAsc();

    todos.forEach((todo) => {
      todo.url = baseUrl + todo.id;
    });

    return todos;
  }

  @Delete()
  @HttpCode(204)
  async deleteAll(
    @Query("completed", ParseBoolPipe) query: boolean
  ): Promise<void> {
    return this.todosService.deleteAll(query);
  }

  @Get("/:id")
  @HttpCode(200)
  @Header("Content-Type", "application/json")
  async getTodo(
    @Param("id") id: string,
    @Req() req: Request
  ): Promise<TodoResponseDto> {
    const url = `${req.protocol}://${req.get("host")}${req.url}${id}`;
    const resTodo = await this.todosService.getTodo(id);
    resTodo.url = url;
    return resTodo;
  }

  @Put("/:id")
  @HttpCode(200)
  @Header("Content-Type", "application/json")
  async updateTodo(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: UpdateTodoDto
  ): Promise<TodoResponseDto> {
    const url = `${req.protocol}://${req.get("host")}${req.url}${id}`;
    const resTodo = await this.todosService.updateTodo(id, body);
    resTodo.url = url;
    return resTodo;
  }

  @Patch("/:id")
  @HttpCode(200)
  @Header("Content-Type", "application/json")
  async updatePartialTodo(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: UpdatePartialTodoDto
  ): Promise<TodoResponseDto> {
    const url = `${req.protocol}://${req.get("host")}${req.url}${id}`;
    const resTodo = await this.todosService.updateTodo(id, body);
    resTodo.url = url;

    return resTodo;
  }

  @Delete("/:id")
  @HttpCode(204)
  async deleteTodo(@Param("id") id: string): Promise<void> {
    return this.todosService.deleteTodo(id);
  }
}
