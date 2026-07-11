import fs from "fs";
import config from "./config/index.js";
import { createApp } from "./api/server.js";
import logger from "./utils/logger.js";

// Force production‑safe directories on Vercel
const isProduction = process.env.NODE_ENV === "production";
const uploadDir = isProduction ? "/tmp/uploads" : config.uploadDir;
const audioDir = isProduction ? "/tmp/audio" : config.audioDir;
const framesDir = isProduction ? "/tmp/frames" : config.framesDir;

// Create directories (recursive, no error if they already exist)
[uploadDir, audioDir, framesDir].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
  logger.info(`Ensured directory: ${dir}`);
});

const app = createApp();
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
