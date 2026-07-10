/**
 * Mapping from caption styles to their generator node names.
 */
const STYLE_TO_NODE = {
  formal: "generateFormal",
  sarcastic: "generateSarcastic",
  "humorous-tech": "generateHumorousTech",
  "humorous-nontech": "generateHumorousNonTech",
};

/**
 * After the analyzeContent node, return the generator nodes that should be
 * executed in parallel, based on the requested caption styles.
 *
 * @param {import('../../types/caption.types.js').GraphState} state
 * @returns {string[]} Array of node names to fan out to
 */
export function getParallelGenerators(state) {
  // Default to all styles if none specified
  const requestedStyles =
    state.styles && state.styles.length > 0
      ? state.styles
      : ["formal", "sarcastic", "humorous-tech", "humorous-nontech"];

  return requestedStyles.map((style) => STYLE_TO_NODE[style]).filter(Boolean);
}

/**
 * Static list of all four generator nodes (used if dynamic filtering is not needed).
 */
export const ALL_GENERATOR_NODES = [
  "generateFormal",
  "generateSarcastic",
  "generateHumorousTech",
  "generateHumorousNonTech",
];
