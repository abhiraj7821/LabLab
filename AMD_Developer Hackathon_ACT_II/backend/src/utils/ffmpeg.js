import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import config from "../config/index.js";
import logger from "./logger.js";
import { AppError, ValidationError } from "./errors.js";

const execFileAsync = promisify(execFile);

/**
 * Get video duration in seconds using ffprobe.
 */
export async function getVideoDuration(filePath) {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    const duration = parseFloat(stdout.trim());
    if (isNaN(duration))
      throw new ValidationError("Could not parse video duration");
    logger.debug({ duration, filePath }, "Video duration extracted");
    return duration;
  } catch (error) {
    logger.error({ err: error, filePath }, "Failed to get video duration");
    throw new AppError(`ffprobe error: ${error.message}`, 500);
  }
}

/**
 * Extract audio as 16kHz mono WAV.
 * Returns `null` if ffmpeg fails (e.g. no audio stream).
 */
export async function extractAudio(videoPath, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await execFileAsync("ffmpeg", [
      "-i",
      videoPath,
      "-vn",
      "-acodec",
      "pcm_s16le",
      "-ar",
      "16000",
      "-ac",
      "1",
      outputPath,
    ]);
    logger.debug({ videoPath, outputPath }, "Audio extracted");
    return outputPath;
  } catch (error) {
    // Video likely has no audio – not a fatal error
    logger.warn(
      { err: error, videoPath },
      "No audio stream – skipping audio extraction",
    );
    return null;
  }
}

/**
 * Extract keyframes (I-frames) every `intervalSec` seconds.
 */
export async function extractKeyframes(videoPath, outputDir, intervalSec = 5) {
  await fs.mkdir(outputDir, { recursive: true });
  const outputPattern = path.join(outputDir, "frame-%04d.jpg");

  try {
    await execFileAsync("ffmpeg", [
      "-i",
      videoPath,
      "-vf",
      `fps=1/${intervalSec}`,
      "-fps_mode",
      "vfr", // modern equivalent of -vsync
      "-q:v",
      "2",
      outputPattern,
    ]);
    const files = await fs.readdir(outputDir);
    const framePaths = files
      .filter((f) => f.startsWith("frame-") && f.endsWith(".jpg"))
      .map((f) => path.join(outputDir, f))
      .sort();
    logger.info({ count: framePaths.length, videoPath }, "Keyframes extracted");
    return framePaths;
  } catch (error) {
    logger.error({ err: error, videoPath }, "Failed to extract keyframes");
    throw new AppError(`ffmpeg frame extraction error: ${error.message}`, 500);
  }
}
