import { ValidationError } from "../../utils/errors.js";
import { parseDuration } from "../../utils/helpers.js";
import logger from "../../utils/logger.js";

export async function validateInput(state) {
  logger.info({ videoUrl: state.videoUrl }, "Validating input");

  try {
    new URL(state.videoUrl);
  } catch {
    return { error: "Invalid video URL", status: "failed" };
  }

  if (state.duration !== undefined && state.duration !== null) {
    const dur = parseDuration(state.duration);
    if (dur === null || dur < 30 || dur > 120) {
      return {
        error: `Duration must be between 30 and 120 seconds, got: ${state.duration}`,
        status: "failed",
      };
    }
    return { duration: dur, status: "validating" };
  }

  return { status: "validating" };
}
