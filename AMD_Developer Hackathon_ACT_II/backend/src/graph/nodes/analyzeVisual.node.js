import { analyzeVisual } from "../tools/analyzeVisual.tool.js";
import logger from "../../utils/logger.js";

export async function analyzeVisualNode(state) {
  logger.info(`Analyzing ${state.framePaths?.length || 0} frames visually`);
  const descriptions = [];

  if (!state.framePaths || state.framePaths.length === 0) {
    return { visualDescriptions: [] };
  }

  for (const framePath of state.framePaths) {
    try {
      const desc = await analyzeVisual(framePath);
      descriptions.push(desc);
    } catch (err) {
      logger.error({ err, framePath }, "Visual analysis failed for frame");
      return {
        error: `Visual analysis failed: ${err.message}`,
        status: "failed",
      };
    }
  }

  return { visualDescriptions: descriptions };
}
