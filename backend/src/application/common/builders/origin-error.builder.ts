export type TOriginError = {
  origin: string;
  message: string;
};

export class OriginError {
  private error: Partial<TOriginError> = {};

  public static create() {
    return new OriginError();
  }

  public withOrigin(origin: string): OriginError {
    this.error.origin = origin;
    return this;
  }

  public withMessage(message: string): OriginError {
    this.error.message = message;
    return this;
  }

  public build(): TOriginError {
    return Object.assign(this.error);
  }
}
