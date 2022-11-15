import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
} from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";
import { TodoConflictError } from "./errors/TodoConflictError";
import { TodoNotFoundError } from "./errors/TodoNotFoundError";

@Injectable()
export class TodosErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof TodoNotFoundError)
          return throwError(() => new NotFoundException());
        else if (err instanceof TodoConflictError)
          return throwError(() => new ConflictException());
        return throwError(() => new InternalServerErrorException());
      })
    );
  }
}
