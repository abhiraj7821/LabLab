import logger from "../../utils/logger.js";

export async function aggregateResults(state) {
  logger.info("Aggregating caption results");
  const results = [];
  if (state.formalCaption)
    results.push({ style: "formal", caption: state.formalCaption });
  if (state.sarcasticCaption)
    results.push({ style: "sarcastic", caption: state.sarcasticCaption });
  if (state.humorousTechCaption)
    results.push({
      style: "humorous-tech",
      caption: state.humorousTechCaption,
    });
  if (state.humorousNonTechCaption)
    results.push({
      style: "humorous-nontech",
      caption: state.humorousNonTechCaption,
    });

  if (results.length === 0) {
    return { error: "No captions were generated", status: "failed" };
  }
  return { results, status: "aggregated" };
}
