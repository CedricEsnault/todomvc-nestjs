export class TodoConflictError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, TodoConflictError.prototype);
  }
}
