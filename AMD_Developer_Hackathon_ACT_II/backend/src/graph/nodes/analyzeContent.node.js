import logger from "../../utils/logger.js";

export async function analyzeContent(state) {
  logger.info("Analyzing content (merging transcript + visuals)");

  const transcript = state.transcript || "";
  const visuals = (state.visualDescriptions || []).join(" ");

  const contentSummary = `
Transcript: ${transcript}

Visual scenes: ${visuals}
`.trim();

  return { contentSummary, status: "analyzing" };
}
