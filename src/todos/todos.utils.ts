import { Todo } from "./entities/todo.entity";
import { TodoConflictError } from "./errors/TodoConflictError";
import { TodoNotFoundError } from "./errors/TodoNotFoundError";
import { UpdatePartialTodoDto, UpdateTodoDto } from "./todos.dto";

export function guardAgainstTodoNotFound(todo?: Todo) {
  if (!todo) throw new TodoNotFoundError();
}

export function guardAgainstTodoConflict(todoToUpdate: Todo, todoFound: Todo) {
  if (todoFound !== null && todoToUpdate.order !== todoFound.order)
    throw new TodoConflictError();
}

export function getUpdatedTodo(todoToUpdate: Todo, newUpdate: UpdateTodoDto);
export function getUpdatedTodo(
  todoToUpdate: Todo,
  newUpdate: UpdatePartialTodoDto
);
export function getUpdatedTodo(
  todoToUpdate: Todo,
  newUpdate: UpdateTodoDto | UpdatePartialTodoDto
) {
  return {
    id: todoToUpdate.id,
    title: newUpdate.title ?? todoToUpdate.title,
    completed: newUpdate.completed ?? todoToUpdate.completed,
    order: newUpdate.order ?? todoToUpdate.order,
  };
}
