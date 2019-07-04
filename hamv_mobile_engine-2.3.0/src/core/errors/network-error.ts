export class NetworkError extends Error {
  constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, NetworkError.prototype);
      this.name = 'NetworkError';
      this.message = message;
      this.stack = (<any>new Error()).stack;
  }
}