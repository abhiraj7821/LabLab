import logger from "../../utils/logger.js";
import { AppError } from "../../utils/errors.js";

/**
 * Express global error handler.
 */
export function errorHandler(err, req, res, next) {
  // Default status & message
  let statusCode = 500;
  let message = "Internal server error";
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else {
    // Unexpected error – log full stack
    logger.error({ err, stack: err.stack }, "Unexpected error");
  }

  if (isOperational) {
    logger.warn({ statusCode, message }, "Operational error");
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
