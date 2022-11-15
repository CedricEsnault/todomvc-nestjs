import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { TodosModule } from "../../todos/todos.module";
import { TodosService } from "../../todos/todos.service";
import { INestApplication } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Todo } from "../../todos/entities/todo.entity";
import {
  DataSource,
  DataSourceOptions,
  getConnection,
  Repository,
} from "typeorm";
import { createConnection } from "net";

describe("Todos", () => {
  let app: INestApplication;
  let todosService: TodosService;
  let appConnection: DataSource;
  let todosRepository: Repository<Todo>;
  beforeAll(async () => {
    const options = {
      type: "sqlite",
      database: "todos-e2e-tests.db",
      synchronize: true, //should not be used in production
      logging: false,
      entities: [Todo],
    };
    appConnection = new DataSource(options as DataSourceOptions);
    const moduleRef = await Test.createTestingModule({
      imports: [
        TodosModule,
        RouterModule.register([{ path: "/todos", module: TodosModule }]),
        TypeOrmModule.forRoot(options as TypeOrmModule),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    todosService = moduleRef.get<TodosService>(TodosService);
    await appConnection.initialize();
    todosRepository = appConnection.getRepository(Todo);
    await app.init();
  });

  afterEach(async () => {
    await todosRepository.clear();
  });

  describe("/POST todos should", () => {
    it("return 201 when new todo is created", async () => {
      return request(app.getHttpServer())
        .post("/todos")
        .send({ title: "test" })
        .expect(201);
    });
  });

  describe("/GET todos should return", () => {
    it(`200 when list of todos is empty`, async () => {
      return request(app.getHttpServer())
        .get("/todos")
        .expect("Content-Type", /json/)
        .expect(200)
        .expect([]);
    });

    it("200 when list of todos is not empty ", async () => {
      await todosRepository.save({ title: "test", completed: false, order: 0 });
      return request(app.getHttpServer())
        .get("/todos")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("/DELETE todos should return", () => {
    beforeEach(async () => {
      await todosRepository.save([
        { title: "test", completed: false, order: 0 },
        { title: "test2", completed: true, order: 1 },
        { title: "test3", completed: false, order: 2 },
        { title: "test4", completed: true, order: 3 },
        { title: "test5", completed: false, order: 4 },
      ]);
    });
    it.each`
      expectedBoolean
      ${false}
      ${true}
    `("204 when completed is $expectedBoolean", async ({ expectedBoolean }) => {
      return request(app.getHttpServer())
        .delete(`/todos?completed=${expectedBoolean}`)
        .expect(204);
    });

    it("500 when completed is not a boolean string", async () => {
      return request(app.getHttpServer())
        .delete("/todos?completed=notABoolean")
        .expect(500);
    });
  });

  describe("/GET todos/:id should return", () => {
    beforeEach(async () => {
      await todosRepository.save({ title: "test", completed: false, order: 0 });
    });
    it("200 when todo is returned", async () => {
      const id = await (await todosRepository.findOneBy({ title: "test" })).id;

      return request(app.getHttpServer())
        .get(`/todos/${id}`)
        .expect("Content-Type", /json/)
        .expect(200);
    });
    it("404 when todo is not found", async () => {
      return request(app.getHttpServer())
        .get(`/todos/random-uuid`)
        .expect("Content-Type", /json/)
        .expect({ statusCode: 404, message: "Not Found" });
    });
    it("404 when there is no todo", async () => {
      return request(app.getHttpServer())
        .get(`/todos/random-uuid`)
        .expect("Content-Type", /json/)
        .expect({ statusCode: 404, message: "Not Found" });
    });
  });

  describe("/PUT todos/:id should return", () => {
    beforeEach(async () => {
      await todosRepository.save({ title: "test", completed: false, order: 0 });
    });
    it("200 when todo is update correctly", async () => {
      const id = (await todosRepository.findOneBy({ title: "test" })).id;

      return request(app.getHttpServer())
        .put(`/todos/${id}`)
        .send({ title: "test", completed: true, order: 0 })
        .expect("Content-Type", /json/)
        .expect(200);
    });

    it("404 when todo to update is not found", async () => {
      return request(app.getHttpServer())
        .put(`/todos/random-uuid`)
        .send({ title: "test", completed: true, order: 0 })
        .expect("Content-Type", /json/)
        .expect({ statusCode: 404, message: "Not Found" });
    });
    it("409 when todo's order conflict with another todo's order", async () => {
      await todosRepository.save({
        title: "test2",
        completed: false,
        order: 1,
      });
      const id = (await todosRepository.findOneBy({ title: "test" })).id;

      return request(app.getHttpServer())
        .put(`/todos/${id}`)
        .send({ title: "test", completed: true, order: 1 })
        .expect("Content-Type", /json/)
        .expect({ statusCode: 409, message: "Conflict" });
    });
  });

  describe("/PATCH todos/:id should return", () => {
    beforeEach(async () => {
      await todosRepository.save({ title: "test", completed: false, order: 0 });
    });
    it("200 when todo is  update correctly", async () => {
      const id = (await todosRepository.findOneBy({ title: "test" })).id;

      return request(app.getHttpServer())
        .patch(`/todos/${id}`)
        .send({ completed: true })
        .expect("Content-Type", /json/)
        .expect(200);
    });

    it("404 when todo to update is not found", async () => {
      return request(app.getHttpServer())
        .patch(`/todos/random-uuid`)
        .send({ title: "test" })
        .expect("Content-Type", /json/)
        .expect({ statusCode: 404, message: "Not Found" });
    });
    it("409 when todo's order conflict with another todo's order", async () => {
      await todosRepository.save({
        title: "test2",
        completed: false,
        order: 1,
      });
      const id = (await todosRepository.findOneBy({ title: "test" })).id;

      return request(app.getHttpServer())
        .patch(`/todos/${id}`)
        .send({ order: 1 })
        .expect("Content-Type", /json/)
        .expect({ statusCode: 409, message: "Conflict" });
    });
  });

  describe("/DELETE /todos/:id should return", () => {
    it("204 when todo is deleted", async () => {
      await todosRepository.save({ title: "test", completed: false, order: 0 });
      const id = (await todosRepository.findOneBy({ title: "test" })).id;

      return request(app.getHttpServer()).delete(`/todos/${id}`).expect(204);
    });

    it("404 when todo is not found", async () => {
      return request(app.getHttpServer())
        .delete(`/todos/random-uuid`)
        .expect({ statusCode: 404, message: "Not Found" });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
