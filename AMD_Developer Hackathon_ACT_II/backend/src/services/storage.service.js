import fs from "fs/promises";
import path from "path";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

/**
 * Save a file from a local path to the designated storage location.
 * Currently just moves the file to the upload directory (local mode).
 * In production, you might upload to S3 instead.
 *
 * @param {string} sourcePath - Current location of the file
 * @param {string} [destinationName] - Desired filename (if not provided, keep original)
 * @returns {Promise<string>} Final path (or S3 URL) of the stored file
 */
export async function storeFile(sourcePath, destinationName) {
  const destDir = config.uploadDir;
  await fs.mkdir(destDir, { recursive: true });
  const destName = destinationName || path.basename(sourcePath);
  const destPath = path.join(destDir, destName);

  try {
    await fs.copyFile(sourcePath, destPath);
    logger.info({ sourcePath, destPath }, "File stored successfully");
    return destPath;
  } catch (err) {
    logger.error({ err, sourcePath }, "Failed to store file");
    throw new AppError(`File storage failed: ${err.message}`, 500);
  }
}

/**
 * Delete temporary files/folders older than a certain age.
 * @param {string} directory - The directory to clean
 * @param {number} [maxAgeMs=3600000] - Max age in milliseconds (default 1 hour)
 */
export async function cleanTempFiles(directory, maxAgeMs = 60 * 60 * 1000) {
  try {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const now = Date.now();
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      const stats = await fs.stat(fullPath);
      if (now - stats.mtimeMs > maxAgeMs) {
        if (file.isDirectory()) {
          await fs.rm(fullPath, { recursive: true });
        } else {
          await fs.unlink(fullPath);
        }
        logger.debug({ fullPath }, "Deleted old temp file");
      }
    }
  } catch (err) {
    logger.error({ err, directory }, "Error cleaning temp files");
  }
}

/**
 * Delete a specific file.
 * @param {string} filePath
 */
export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    logger.debug({ filePath }, "File deleted");
  } catch (err) {
    logger.warn({ err, filePath }, "Failed to delete file");
  }
}
