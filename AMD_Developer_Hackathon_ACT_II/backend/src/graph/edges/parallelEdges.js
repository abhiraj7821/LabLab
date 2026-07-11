import { Send } from "@langchain/langgraph";

/**
 * Build an array of Send objects to fan out to the requested caption generators.
 * Each Send receives a copy of the current state, so nodes write to distinct channels.
 *
 * @param {import('../../types/caption.types.js').GraphState} state
 * @returns {Send[]}
 */
export function getParallelGenerators(state) {
  const sends = [];
  const styles =
    state.styles && state.styles.length > 0
      ? state.styles
      : ["formal", "sarcastic", "humorous-tech", "humorous-nontech"];

  if (styles.includes("formal")) {
    sends.push(new Send("generateFormal", state));
  }
  if (styles.includes("sarcastic")) {
    sends.push(new Send("generateSarcastic", state));
  }
  if (styles.includes("humorous-tech")) {
    sends.push(new Send("generateHumorousTech", state));
  }
  if (styles.includes("humorous-nontech")) {
    sends.push(new Send("generateHumorousNonTech", state));
  }
  return sends;
}
