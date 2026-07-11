import fs from "fs";
import { createApp } from "./api/server.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";

// Ensure writable directories exist (critical for Vercel)
[config.uploadDir, config.audioDir, config.framesDir].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
  logger.info(`Ensured directory exists: ${dir}`);
});

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Server listening on http://localhost:${config.port}`);
});

// Periodic cleanup (still works for /tmp)
const CLEANUP_INTERVAL = 30 * 60 * 1000;
setInterval(() => {
  logger.info("Running scheduled temp file cleanup");
  [config.uploadDir, config.audioDir, config.framesDir].forEach((dir) => {
    cleanTempFiles(dir).catch((err) => logger.error(err));
  });
}, CLEANUP_INTERVAL);
