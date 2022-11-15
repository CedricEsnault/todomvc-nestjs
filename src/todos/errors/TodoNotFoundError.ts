export class TodoNotFoundError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, TodoNotFoundError.prototype);
  }
}
