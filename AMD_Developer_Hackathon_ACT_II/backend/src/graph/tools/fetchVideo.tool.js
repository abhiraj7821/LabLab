import fs from "fs";
import path from "path";
import axios from "axios";
import { randomUUID } from "crypto";
import config from "../../config/index.js";
import logger from "../../utils/logger.js";
import { AppError } from "../../utils/errors.js";
import { isSupportedVideoFormat } from "../../utils/helpers.js";

const tempDir = config.uploadDir;
await fs.promises.mkdir(tempDir, { recursive: true });

/**
 * Download video from URL and save to temp storage.
 * @param {object} state - Graph state
 * @returns {Promise<object>} Partial state update with videoPath
 */
export async function fetchVideo(state) {
  const videoUrl = state.videoUrl;

  // Validate URL before downloading
  try {
    new URL(videoUrl);
  } catch {
    logger.error({ videoUrl }, "Invalid video URL in fetchVideo");
    return { error: `Invalid video URL: ${videoUrl}`, status: "failed" };
  }

  const tempDir = config.uploadDir;
  await fs.promises.mkdir(tempDir, { recursive: true });

  // Derive file extension from URL or default to mp4
  const urlObj = new URL(videoUrl);
  const ext = path.extname(urlObj.pathname) || ".mp4";
  const filename = `video-${randomUUID()}${ext}`;
  const outputPath = path.join(tempDir, filename);

  logger.info({ videoUrl }, "Downloading video");

  const writer = fs.createWriteStream(outputPath);

  try {
    const response = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
      timeout: 5 * 60 * 1000, // 5 minutes
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
      response.data.on("error", reject);
    });

    // Validate file exists and is supported
    const stats = await fs.promises.stat(outputPath);
    if (stats.size === 0) {
      await fs.promises.unlink(outputPath).catch(() => {});
      return { error: "Downloaded file is empty", status: "failed" };
    }

    if (!isSupportedVideoFormat(filename)) {
      logger.warn(
        { filename },
        "Unsupported video format, keeping file anyway",
      );
    }

    logger.info(
      { outputPath, size: stats.size },
      "Video downloaded successfully",
    );
    return { videoPath: outputPath };
  } catch (error) {
    // Clean up partial file
    await fs.promises.unlink(outputPath).catch(() => {});
    logger.error({ err: error, videoUrl }, "Video download failed");
    return {
      error: `Video download failed: ${error.message}`,
      status: "failed",
    };
  }
}
