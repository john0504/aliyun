export class HttpError extends Error {
  constructor(public code: number, public message: string) {
      super(message);
      Object.setPrototypeOf(this, HttpError.prototype);
      this.name = 'HttpError';
      this.message = message;
      this.stack = (<any>new Error()).stack;
  }
}