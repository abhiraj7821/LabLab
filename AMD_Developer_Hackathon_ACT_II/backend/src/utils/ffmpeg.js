import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import config from "../config/index.js";
import logger from "./logger.js";
import { AppError } from "../utils/errors.js";

// ------------------------------------------------------------------
// 1. Reliable static binaries – always resolve to an absolute path
// ------------------------------------------------------------------
let ffmpegPath = "ffmpeg";
let ffprobePath = "ffprobe";

try {
  const ffmpegInstaller = (await import("@ffmpeg-installer/ffmpeg")).default;
  ffmpegPath = ffmpegInstaller.path;
  logger.info({ ffmpegPath }, "Using @ffmpeg-installer/ffmpeg");
} catch (err) {
  logger.warn(
    "@ffmpeg-installer/ffmpeg not available, falling back to system ffmpeg",
  );
}

try {
  const ffprobeInstaller = (await import("@ffprobe-installer/ffprobe")).default;
  ffprobePath = ffprobeInstaller.path;
  logger.info({ ffprobePath }, "Using @ffprobe-installer/ffprobe");
} catch (err) {
  logger.warn(
    "@ffprobe-installer/ffprobe not available, falling back to system ffprobe",
  );
}

// Allow overriding via environment variables (optional)
if (config.ffmpegPath) ffmpegPath = config.ffmpegPath;
if (config.ffprobePath) ffprobePath = config.ffprobePath;

const execFileAsync = promisify(execFile);

// ------------------------------------------------------------------
// 2. Exported functions
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
      "-vsync",
      "vfr", // ← changed from -fps_mode to -vsync
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
