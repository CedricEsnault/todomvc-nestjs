import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { TypeOrmModule } from "@nestjs/typeorm";
import { Todo } from "./todos/entities/todo.entity";
import { TodosModule } from "./todos/todos.module";

@Module({
  imports: [
    TodosModule,
    RouterModule.register([{ path: "/todos", module: TodosModule }]),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "todos.db",
      synchronize: true, //should not be used in production
      logging: false,
      entities: [Todo],
    }),
  ],
})
export class AppModule {}
