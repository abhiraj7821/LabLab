import express from "express";
import cors from "cors";
import config from "../config/index.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import logger from "../utils/logger.js";

/**
 * Create and configure Express app.
 * @returns {express.Application}
 */
export function createApp() {
  const app = express();

  // Trust proxy (if behind reverse proxy)
  app.set("trust proxy", 1);

  // CORS
  app.use(cors({ origin: config.corsOrigin }));

  // Rate limiter (apply to all routes)
  app.use(rateLimiter);

  // Body parsing (JSON and URL-encoded)
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Serve uploaded files (optional, for testing)
  app.use("/temp/uploads", express.static(config.uploadDir));

  // All routes
  app.use(routes);

  // 404 catch-all (fixed for path-to-regexp v8+)
  // 404 catch-all (works with any Express/path-to-regexp version)
  app.use((req, res, next) => {
    res
      .status(404)
      .json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server`,
      });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
