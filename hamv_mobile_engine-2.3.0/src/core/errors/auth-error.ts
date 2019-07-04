export class AuthError extends Error {
  constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, AuthError.prototype);
      this.name = 'AuthError';
      this.message = message;
      this.stack = (<any>new Error()).stack;
  }
}