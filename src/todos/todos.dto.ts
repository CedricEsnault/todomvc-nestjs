import { PartialType, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class UpdateTodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsBoolean()
  completed: boolean;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}

export class UpdatePartialTodoDto extends PartialType(UpdateTodoDto) {}

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class TodoDeleteAllDto {
  @IsBoolean()
  @IsOptional()
  completed: boolean;
}

export class TodoResponseDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsBoolean()
  completed: boolean;

  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsNotEmpty()
  @IsString()
  url: string;
}
