import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import config from "../../config/index.js";
import logger from "../../utils/logger.js";
import { AppError } from "../../utils/errors.js";

/**
 * Transcribe audio file using OpenAI Whisper API.
 * @param {object} state - Graph state
 * @returns {Promise<object>} Partial state update with transcript
 */
export async function transcribeAudio(state) {
  const audioFilePath = state.audioPath;

  if (!audioFilePath) {
    // No audio – return empty transcript without error
    logger.info("No audio path, returning empty transcript");
    return { transcript: "" };
  }

  if (!audioFilePath) {
    return {
      error: "No audio file path provided for transcription",
      status: "failed",
    };
  }

  if (!config.openaiApiKey) {
    return {
      error: "OpenAI API key is required for transcription",
      status: "failed",
    };
  }

  logger.info({ audioFilePath }, "Starting audio transcription");

  try {
    const form = new FormData();
    form.append("model", "whisper-1");
    form.append("file", fs.createReadStream(audioFilePath));
    form.append("response_format", "text");
    form.append("language", "en");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 5 * 60 * 1000,
      },
    );

    const transcript = response.data;
    logger.info(
      { audioFilePath, transcriptLength: transcript.length },
      "Transcription completed",
    );
    return { transcript };
  } catch (error) {
    logger.error({ err: error, audioFilePath }, "Transcription failed");
    return {
      error: `Transcription failed: ${error.message}`,
      status: "failed",
    };
  }
}
