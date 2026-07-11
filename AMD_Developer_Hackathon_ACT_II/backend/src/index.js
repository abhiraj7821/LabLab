import fs from "fs";
import config from "./config/index.js";
import { createApp } from "./api/server.js";
import logger from "./utils/logger.js";

// Create all required temp directories
[config.uploadDir, config.audioDir, config.framesDir].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

const app = createApp();
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
