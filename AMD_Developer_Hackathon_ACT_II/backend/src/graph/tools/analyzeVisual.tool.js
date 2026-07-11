import {
  analyzeImageWithAnthropic,
  analyzeImageWithGemini,
} from "../../services/llm.service.js";
import logger from "../../utils/logger.js";
import { AppError } from "../../utils/errors.js";

/**
 * Describe a single frame using Gemini 2.5 Flash (vision‑capable).
 *
 * @param {string} imagePath - Path to the frame image
 * @returns {Promise<string>} Textual description
 */
export async function analyzeVisual(imagePath) {
  logger.info({ imagePath }, "Analyzing frame with Gemini");

  try {
    const description = await analyzeImageWithGemini(imagePath);
    return description;
  } catch (error) {
    logger.error({ err: error, imagePath }, "Visual analysis failed");
    throw new AppError(`Visual analysis failed: ${error.message}`, 500);
  }
}

// ANTHROPIC CODE:
// /**
//  * Describe a single frame using Anthropic's Claude Sonnet 5 (vision
//  * capable). Sonnet is the mid-tier model — a cost/quality balance between
//  * cheaper Haiku and pricier Opus. Override via config.anthropicVisionModel
//  * (see llm.service.js) if you need to change tiers.
//  *
//  * @param {string} imagePath - Path to the frame image
//  * @returns {Promise<string>} Textual description
//  */
// export async function analyzeVisual(imagePath) {
//   logger.info({ imagePath }, "Analyzing frame with Anthropic");

//   try {
//     const description = await analyzeImageWithAnthropic(imagePath);
//     return description;
//   } catch (error) {
//     logger.error({ err: error, imagePath }, "Visual analysis failed");
//     throw new AppError(`Visual analysis failed: ${error.message}`, 500);
//   }
// }
