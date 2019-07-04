export class ResponseError extends Error {
  constructor(public code: number, public message: string) {
      super(message);
      Object.setPrototypeOf(this, ResponseError.prototype);
      this.name = 'ResponseError';
      this.message = message;
      this.stack = (<any>new Error()).stack;
  }
}