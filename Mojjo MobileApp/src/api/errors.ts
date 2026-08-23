export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]> | string[];
  public errorCode?: string;
  public isNetworkError: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string[]> | string[],
    errorCode?: string,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;
    this.isNetworkError = isNetworkError;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Returns a friendly user-facing error message
   */
  public getDisplayMessage(): string {
    if (this.isNetworkError) {
      return 'Unable to connect to Mojjo servers. Please check your internet connection.';
    }

    if (this.errors) {
      if (Array.isArray(this.errors) && this.errors.length > 0) {
        return this.errors[0];
      }
      if (typeof this.errors === 'object') {
        const errorMap = this.errors as Record<string, string[]>;
        const keys = Object.keys(errorMap);
        if (keys.length > 0 && errorMap[keys[0]]?.length > 0) {
          return errorMap[keys[0]][0];
        }
      }
    }

    return this.message || 'An unexpected error occurred. Please try again.';
  }
}
