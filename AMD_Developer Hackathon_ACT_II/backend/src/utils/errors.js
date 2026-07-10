/**
 * Base custom application error.
 * All operational errors should extend this class.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} [isOperational=true] - Distinguish programming errors from expected failures
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400 Bad Request).
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message
   */
  constructor(message = "Validation failed") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

/**
 * Not found error (404).
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} message
   */
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Unauthorized error (401).
 */
export class UnauthorizedError extends AppError {
  /**
   * @param {string} message
   */
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
