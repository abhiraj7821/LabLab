import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import config from "../config/index.js";
import logger from "./logger.js";
import { AppError } from "../utils/errors.js";

// ------------------------------------------------------------------
// 1. Try to load the static binaries (bundled executables)
// ------------------------------------------------------------------
let ffmpegPath = "ffmpeg";
let ffprobePath = "ffprobe";

try {
  // ffmpeg-static exports an object with a `path` property
  const ffmpegStatic = (await import("ffmpeg-static")).default;
  ffmpegPath = ffmpegStatic?.path ?? ffmpegPath;
  logger.info({ ffmpegPath }, "Loaded static ffmpeg binary");
} catch {
  logger.warn("ffmpeg-static not available, falling back to system ffmpeg");
}

try {
  const ffprobeStatic = (await import("ffprobe-static")).default;
  ffprobePath = ffprobeStatic?.path ?? ffprobePath;
  logger.info({ ffprobePath }, "Loaded static ffprobe binary");
} catch {
  logger.warn("ffprobe-static not available, falling back to system ffprobe");
}

// Allow overriding via environment variables (optional)
if (config.ffmpegPath) ffmpegPath = config.ffmpegPath;
if (config.ffprobePath) ffprobePath = config.ffprobePath;

const execFileAsync = promisify(execFile);

// ------------------------------------------------------------------
// 2. Exported functions (unchanged logic)
// ------------------------------------------------------------------
export async function getVideoDuration(filePath) {
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    const duration = parseFloat(stdout.trim());
    if (isNaN(duration)) throw new Error("Could not parse duration");
    return duration;
  } catch (error) {
    logger.error({ err: error, filePath }, "Failed to get video duration");
    throw new AppError(`ffprobe error: ${error.message}`, 500);
  }
}

export async function extractAudio(videoPath, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await execFileAsync(ffmpegPath, [
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
    logger.warn(
      { err: error, videoPath },
      "No audio stream – skipping audio extraction",
    );
    return null;
  }
}

export async function extractKeyframes(videoPath, outputDir, intervalSec = 5) {
  await fs.mkdir(outputDir, { recursive: true });
  const outputPattern = path.join(outputDir, "frame-%04d.jpg");

  try {
    await execFileAsync(ffmpegPath, [
      "-i",
      videoPath,
      "-vf",
      `fps=1/${intervalSec}`,
      "-fps_mode",
      "vfr",
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
