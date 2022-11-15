import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotFoundError } from "rxjs";
import { DeleteResult, Repository } from "typeorm";
import {
  TodoResponseDto,
  UpdatePartialTodoDto,
  UpdateTodoDto,
} from "./todos.dto";
import { Todo } from "./entities/todo.entity";
import { TodoConflictError } from "./errors/TodoConflictError";
import { TodoNotFoundError } from "./errors/TodoNotFoundError";
import {
  getUpdatedTodo,
  guardAgainstTodoConflict,
  guardAgainstTodoNotFound,
} from "./todos.utils";

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>
  ) {}

  async createTodo(title: string): Promise<TodoResponseDto> {
    const todos = await this.todoRepository.find({ order: { order: "ASC" } });
    let newTodo: Todo = {
      id: undefined,
      title: title,
      completed: false,
      order: !!todos.length ? todos[todos.length - 1].order + 1 : 0,
    };

    return (await this.todoRepository.save(newTodo)) as TodoResponseDto;
  }

  async getListSortedByOrderAsc(): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.find({ order: { order: "ASC" } });

    return todos as TodoResponseDto[];
  }

  async deleteAll(completed?: boolean) {
    if (completed && completed === true)
      this.todoRepository.delete({ completed: true });
    else this.todoRepository.clear();
  }

  async getTodo(id: string): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findOneBy({ id: id });
    guardAgainstTodoNotFound(todo);

    return todo as TodoResponseDto;
  }
  async updateTodo(id: string, newUpdate: UpdateTodoDto);
  async updateTodo(id: string, newUpdate: UpdatePartialTodoDto);
  async updateTodo(
    id: string,
    newUpdate: UpdateTodoDto | UpdatePartialTodoDto
  ): Promise<TodoResponseDto> {
    const todoToUpdate = await this.todoRepository.findOneBy({ id: id });
    const todoFound =
      newUpdate.order !== undefined
        ? await this.todoRepository.findOneBy({ order: newUpdate.order })
        : null;

    guardAgainstTodoNotFound(todoToUpdate);
    guardAgainstTodoConflict(todoToUpdate, todoFound);

    const updatedTodo = getUpdatedTodo(todoToUpdate, newUpdate);

    return this.todoRepository.save(updatedTodo) as Promise<TodoResponseDto>;
  }
  async deleteTodo(id: string) {
    const todo = await this.todoRepository.findOneBy({ id: id });
    guardAgainstTodoNotFound(todo);

    this.todoRepository.delete({ id: id });
  }
}
