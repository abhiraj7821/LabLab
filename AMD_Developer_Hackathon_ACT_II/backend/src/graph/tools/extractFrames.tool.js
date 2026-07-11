import { extractKeyframes as ffmpegExtractKeyframes } from "../../utils/ffmpeg.js";
import config from "../../config/index.js";
import logger from "../../utils/logger.js";

/**
 * Extract keyframes from video and return image paths.
 * @param {object} state - Graph state
 * @param {number} [intervalSec=5] - Interval between frames in seconds
 * @returns {Promise<object>} Partial state update with framePaths
 */
export async function extractFrames(state) {
  const videoPath = state.videoPath;
  const outputDir = config.framesDir;

  logger.info({ videoPath, outputDir }, "Extracting keyframes");

  try {
    const framePaths = await ffmpegExtractKeyframes(videoPath, outputDir);
    logger.info(
      { frameCount: framePaths.length },
      "Frames extracted successfully",
    );
    return { framePaths };
  } catch (error) {
    logger.error({ err: error, videoPath }, "Frame extraction failed");
    return {
      error: `Frame extraction failed: ${error.message}`,
      status: "failed",
    };
  }
}
