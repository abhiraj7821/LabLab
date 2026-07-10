import logger from "../../utils/logger.js";
import { AppError } from "../../utils/errors.js";

export async function qualityCheck(state) {
  logger.info("Running quality check");
  const results = state.results || [];
  for (const item of results) {
    if (!item.caption || item.caption.trim().length < 10) {
      return {
        error: `Caption for style '${item.style}' is too short or empty`,
        status: "failed",
      };
    }
    if (item.caption.length > 1000) {
      return {
        error: `Caption for style '${item.style}' exceeds maximum length`,
        status: "failed",
      };
    }
  }
  return { status: "completed" };
}
