import { cleanTempFiles } from "../src/services/storage.service.js";
import config from "../src/config/index.js";
import logger from "../src/utils/logger.js";

async function run() {
  logger.info("Manual temp file cleanup started");

  await Promise.all([
    cleanTempFiles(config.uploadDir),
    cleanTempFiles(config.audioDir),
    cleanTempFiles(config.framesDir),
  ]);

  logger.info("Cleanup complete");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
