export class TimeoutError extends Error {
  constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, TimeoutError.prototype);
      this.name = 'TimeoutError';
      this.message = message;
      this.stack = (<any>new Error()).stack;
  }
}