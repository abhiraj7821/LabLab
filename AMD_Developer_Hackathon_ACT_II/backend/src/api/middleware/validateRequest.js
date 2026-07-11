import { AppError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";

/**
 * Middleware to validate request data using a Zod schema.
 *
 * @param {object} options
 * @param {import('zod').ZodSchema} [options.body]   - schema for req.body
 * @param {import('zod').ZodSchema} [options.query]  - schema for req.query
 * @param {import('zod').ZodSchema} [options.params] - schema for req.params
 * @returns {Function} Express middleware
 */
export function validateRequest({ body, query, params }) {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      if (params) {
        req.params = params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        logger.warn({ validationError: message }, "Request validation failed");
        return next(new AppError(`Validation error: ${message}`, 400));
      }
      next(err);
    }
  };
}
