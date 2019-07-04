export class AccountError extends Error {
  constructor(public message: string, public code: number = -1) {
      super(message);
      Object.setPrototypeOf(this, AccountError.prototype);
      this.name = 'AccountError';
      this.message = message;
      this.stack = (<any>new Error()).stack;
  }
}