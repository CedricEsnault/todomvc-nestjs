import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm/dist";
import { Repository } from "typeorm";
import { Todo } from "../../../todos/entities/todo.entity";
import { TodosController } from "../../../todos/todos.controller";
import { TodosService } from "../../../todos/todos.service";
import { Request } from "express";
import {
  UpdatePartialTodoDto,
  UpdateTodoDto,
  TodoResponseDto,
} from "../../../todos/todos.dto";

describe("TodosController", () => {
  let todosService: TodosService;
  let todosController: TodosController;

  const requestMock = {
    protocol: "http",
    host: "localhost:3000",
    url: "/todos",
    get: jest.fn((x) => "localhost:3000"),
  } as unknown as Request;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [Todo],
      controllers: [TodosController],
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useClass: Repository,
        },
      ],
    }).compile();
    todosService = moduleRef.get<TodosService>(TodosService);
    todosController = moduleRef.get<TodosController>(TodosController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should be defined", () => {
    expect(todosController).toBeDefined();
  });

  describe("createTodo should", () => {
    it("call createTodo from todosService and return TodoResponseDto", async () => {
      const body = { title: "test" };
      const returnedValueServiceMock = {
        id: "id",
        title: "test",
        completed: false,
        order: 0,
        url: "",
      };
      const expectedControllerValueMock = {
        id: "id",
        title: "test",
        completed: false,
        order: 0,
        url: "http://localhost:3000/todos/id",
      };
      const spyService = jest
        .spyOn(todosService, "createTodo")
        .mockResolvedValue(returnedValueServiceMock);

      const returnedValueController = await todosController.createTodo(
        requestMock,
        body
      );

      expect(spyService).toHaveBeenCalledTimes(1);
      expect(spyService).toHaveBeenNthCalledWith(1, body.title);
      expect(returnedValueController).toStrictEqual(
        expectedControllerValueMock
      );
    });
  });

  describe("getList should return", () => {
    it("list of TodoResponseDto", async () => {
      const list: TodoResponseDto[] = [
        { title: "0", order: 1, completed: false, id: "id", url: "" },
      ];
      const spyService = jest
        .spyOn(todosService, "getListSortedByOrderAsc")
        .mockResolvedValue(list);
      const returnedValue = await todosController.getList(requestMock);

      expect(spyService).toHaveBeenCalledTimes(1);
      expect(spyService).toHaveBeenNthCalledWith(1);
      expect(returnedValue).toStrictEqual(list);
    });
  });

  describe("deleteAll should", () => {
    it("call deleteAll from todosService", async () => {
      const query = false;
      const spyService = jest
        .spyOn(todosService, "deleteAll")
        .mockImplementation(() => Promise.resolve());

      todosService.deleteAll(query);

      expect(spyService).toHaveBeenCalledTimes(1);
      expect(spyService).toHaveBeenNthCalledWith(1, false);
    });
  });

  describe("getTodo should", () => {
    it("call getTodo from todosService and return  a TodosResponseDto", async () => {
      const id = "uuid-number";
      const baseUrl = `${requestMock.protocol}://${requestMock.host}${requestMock.url}`;
      const returnValueMock: TodoResponseDto = {
        title: "test",
        id: "uuid-number",
        completed: false,
        order: 0,
        url: `${baseUrl}${id}`,
      };
      const spyService = jest
        .spyOn(todosService, "getTodo")
        .mockResolvedValue(returnValueMock);

      const returnedControllerValue = await todosController.getTodo(
        id,
        requestMock
      );

      expect(spyService).toHaveBeenCalledTimes(1);
      expect(spyService).toHaveBeenNthCalledWith(1, id);
      expect(returnedControllerValue).toStrictEqual(returnValueMock);
    });
  });

  describe("updateTodo should return", () => {
    it("TodoResponseDto with updated field", async () => {
      const id = "uuid-number";
      const baseUrl = `${requestMock.protocol}://${requestMock.host}${requestMock.url}`;
      const body: UpdateTodoDto = {
        title: "test",
        completed: false,
        order: 0,
      };
      const returnValueMock: TodoResponseDto = {
        title: "test",
        id: "uuid-number",
        completed: false,
        order: 0,
        url: `${baseUrl}${id}`,
      };
      const spyService = jest
        .spyOn(todosService, "updateTodo")
        .mockResolvedValue(returnValueMock);

      const returnedControllerValue = await todosController.updateTodo(
        requestMock,
        id,
        body
      );

      expect(spyService).toHaveBeenCalledTimes(1);
      expect(spyService).toHaveBeenNthCalledWith(1, id, body);
      expect(returnedControllerValue).toStrictEqual(returnValueMock);
    });
  });

  describe("updatePartialTodo should return", () => {
    it("TodoResponseDto with updated field", async () => {
      const id = "uuid-number";
      const baseUrl = `${requestMock.protocol}://${requestMock.host}${requestMock.url}`;
      const body: UpdatePartialTodoDto = {
        title: "test",
        order: 0,
      };
      const returnValueMock: TodoResponseDto = {
        title: "test",
        id: "uuid-number",
        completed: false,
        order: 0,
        url: `${baseUrl}${id}`,
      };
      const spyService = jest
        .spyOn(todosService, "updateTodo")
        .mockResolvedValue(returnValueMock);

      const returnedControllerValue = todosController.updatePartialTodo(
        requestMock,
        id,
        body
      );

      expect(spyService).toHaveBeenCalledTimes(1);
      expect(spyService).toHaveBeenNthCalledWith(1, id, body);
      expect(returnedControllerValue).resolves.toStrictEqual(returnValueMock);
    });
  });

  describe("deleteTodo should", () => {
    it("call deleteTodo from todosService", async () => {
      const id = "random-uuid";
      const onDeleteTodo = jest
        .spyOn(todosService, "deleteTodo")
        .mockImplementation(() => Promise.resolve());

      todosService.deleteTodo(id);

      expect(onDeleteTodo).toHaveBeenCalledTimes(1);
      expect(onDeleteTodo).toHaveBeenNthCalledWith(1, id);
    });
  });
});
