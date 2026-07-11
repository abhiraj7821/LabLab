import { createApp } from "./api/server.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";
import { cleanTempFiles } from "./services/storage.service.js"; // optional cleanup on start

// ── Optional: Connect to database, initialize queues, etc. ────────────
// import mongoose from 'mongoose';
// await mongoose.connect(config.mongodbUri);

// ── Start server ──────────────────────────────────────────────────────
const app = createApp();

app.listen(config.port, () => {
  logger.info(`Server listening on http://localhost:${config.port}`);
  logger.info(`Health check: http://localhost:${config.port}/health`);
  logger.info(
    `Caption API: POST http://localhost:${config.port}/api/v1/caption`,
  );
});

// ── Periodic temp cleanup (every 30 minutes) ──────────────────────────
const CLEANUP_INTERVAL = 30 * 60 * 1000;
setInterval(() => {
  logger.info("Running scheduled temp file cleanup");
  cleanTempFiles(config.uploadDir).catch((err) => logger.error(err));
  cleanTempFiles(config.audioDir).catch((err) => logger.error(err));
  cleanTempFiles(config.framesDir).catch((err) => logger.error(err));
}, CLEANUP_INTERVAL);
