import { TodosService } from "../../../todos/todos.service";
import { Todo } from "../../../todos/entities/todo.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Test } from "@nestjs/testing";
import { TodoResponseDto, UpdateTodoDto } from "../../../todos/todos.dto";
import { TodoNotFoundError } from "../../../todos/errors/TodoNotFoundError";
import { TodoConflictError } from "../../../todos/errors/TodoConflictError";
describe("TodosService", () => {
  let todosService: TodosService;
  let mockTodoRepo;
  beforeAll(async () => {
    mockTodoRepo = {
      data: [] as Todo[],
      save: jest.fn((todo: Todo) => {
        todo.id = "uuid";
        return todo;
      }),
      find: jest.fn((option?: any) => {}),
      findAll: jest.fn((option?: any) => {}),
      delete: jest.fn((criteria: any) => {}),
      clear: jest.fn(),
      findOneBy: jest.fn((criteria: any) => {}),
      remove: jest.fn((todoToRemove: Todo) => {}),
    } as unknown as Repository<Todo>;
    const moduleRef = await Test.createTestingModule({
      imports: [Todo],
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockTodoRepo,
        },
      ],
    }).compile();
    todosService = moduleRef.get<TodosService>(TodosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTodo should", () => {
    it("create a new Todo and return it", async () => {
      const expected = {
        title: "tout",
        completed: false,
        id: "uuid",
        order: 0,
      };
      jest.spyOn(mockTodoRepo, "find").mockResolvedValue([]);
      await expect(todosService.createTodo("tout")).resolves.toStrictEqual(
        expected
      );
    });
  });
  describe("getListSortedByOrderAsc should", () => {
    it("return todos", async () => {
      jest.spyOn(mockTodoRepo, "find").mockResolvedValue([
        { id: "1", title: "test", completed: false, order: 0 },
        { id: "2", title: "tes2", completed: false, order: 1 },
        { id: "3", title: "tes3", completed: false, order: 2 },
      ]);
      const expected = [
        { id: "1", title: "test", completed: false, order: 0 },
        { id: "2", title: "tes2", completed: false, order: 1 },
        { id: "3", title: "tes3", completed: false, order: 2 },
      ] as TodoResponseDto[];
      await expect(
        todosService.getListSortedByOrderAsc()
      ).resolves.toStrictEqual(expected);
    });
  });

  describe("deleteAll should call", () => {
    it("delete from todosRepository when completed is true", async () => {
      const onDeleteAll = jest
        .spyOn(mockTodoRepo, "delete")
        .mockImplementation((criteria = { completed: true }) => {});

      await todosService.deleteAll(true);
      expect(onDeleteAll).toHaveBeenCalledTimes(1);
      expect(onDeleteAll).toHaveBeenNthCalledWith(1, { completed: true });
    });

    it.each`
      expectedValue | expectedClearCalledTimes | expectedDeleteCalledTimes
      ${undefined}  | ${1}                     | ${0}
      ${false}      | ${1}                     | ${0}
    `(
      "clear from todosRepository when completed is $expectedValue",
      ({
        expectedValue,
        expectedClearCalledTimes,
        expectedDeleteCalledTimes,
      }) => {
        const onDeleteAll = jest
          .spyOn(mockTodoRepo, "delete")
          .mockImplementation((criteria = { completed: expectedValue }) => {});

        const onClear = jest
          .spyOn(mockTodoRepo, "clear")
          .mockImplementation(() => {});

        todosService.deleteAll(expectedValue);
        expect(onClear).toHaveBeenCalledTimes(expectedClearCalledTimes);
        expect(onDeleteAll).not.toHaveBeenCalled();
      }
    );
  });

  describe("getTodo should", () => {
    it("return  specific todo based on the id parameter", async () => {
      const todo: Todo = {
        id: "",
        title: "",
        completed: false,
        order: 0,
      };
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValue(todo);
      await expect(todosService.getTodo("123456789")).resolves.toStrictEqual(
        todo
      );
    });
    it("throw TodoNotFoundError when todo is not found", async () => {
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValue(null);

      await expect(todosService.getTodo("123456")).rejects.toThrow(
        TodoNotFoundError
      );
    });
  });

  describe("updateTodo should", () => {
    it("return updated todo", async () => {
      const body: UpdateTodoDto = {
        title: "",
        completed: false,
        order: 0,
      };
      const updatedTodo: TodoResponseDto = {
        id: "uuid",
        title: "test",
        completed: false,
        order: 4,
        url: "",
      };
      const todo: Todo = {
        id: "",
        title: "",
        completed: false,
        order: 0,
      };
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValueOnce(todo);
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValueOnce(null);
      jest.spyOn(mockTodoRepo, "save").mockResolvedValue(updatedTodo);

      await expect(
        todosService.updateTodo("uuid", body)
      ).resolves.toStrictEqual(updatedTodo);
    });
    it("throw when todo is not found", async () => {
      const body: UpdateTodoDto = {
        title: "",
        completed: false,
        order: 0,
      };

      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValue(null);

      await expect(todosService.updateTodo("uuid", body)).rejects.toThrow(
        TodoNotFoundError
      );
    });

    it("throw when order's todo is same as another todo", async () => {
      const body: UpdateTodoDto = {
        title: "",
        completed: false,
        order: 0,
      };
      const updatedTodo: TodoResponseDto = {
        id: "uuid",
        title: "test",
        completed: false,
        order: 4,
        url: "",
      };
      const todoToUpdate: Todo = {
        id: "",
        title: "",
        completed: false,
        order: 1,
      };
      const todo: Todo = {
        id: "",
        title: "",
        completed: false,
        order: 0,
      };
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValueOnce(todoToUpdate);
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValueOnce(todo);

      await expect(todosService.updateTodo("uuid", body)).rejects.toThrow(
        TodoConflictError
      );
    });
  });

  describe("deleteTodo should", () => {
    it("call delete from TodoRepository", async () => {
      const todo: Todo = {
        id: "id",
        title: "",
        completed: false,
        order: 0,
      };
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValue(todo);
      const onRemove = jest.spyOn(mockTodoRepo, "delete");

      await todosService.deleteTodo("id");

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenNthCalledWith(1, { id: "id" });
    });
    it("throw TodoNotFoundError when no todo is found", async () => {
      jest.spyOn(mockTodoRepo, "findOneBy").mockResolvedValue(null);
      jest.spyOn(mockTodoRepo, "remove");

      await expect(todosService.deleteTodo("id")).rejects.toThrow(
        TodoNotFoundError
      );
    });
  });
});
