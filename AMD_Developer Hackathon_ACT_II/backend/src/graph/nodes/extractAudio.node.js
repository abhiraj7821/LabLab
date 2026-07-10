import { extractAudio as ffmpegExtractAudio } from "../../utils/ffmpeg.js";
import path from "path";
import config from "../../config/index.js";
import logger from "../../utils/logger.js";

export async function extractAudioNode(state) {
  logger.info("Extracting audio from video");
  const outputPath = path.join(config.audioDir, `audio-${Date.now()}.wav`);
  try {
    const audioPath = await ffmpegExtractAudio(state.videoPath, outputPath);
    // audioPath may be null if no audio stream – that’s ok
    return { audioPath: audioPath ?? null };
  } catch (err) {
    // Only real errors (permissions, etc.) reach here
    logger.error({ err }, "Audio extraction failed");
    return {
      error: `Audio extraction failed: ${err.message}`,
      status: "failed",
    };
  }
}
