import rateLimit from "express-rate-limit";
import config from "../../config/index.js";

/**
 * Rate limiter middleware using configuration from config.
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests, please try again later.",
  },
});
