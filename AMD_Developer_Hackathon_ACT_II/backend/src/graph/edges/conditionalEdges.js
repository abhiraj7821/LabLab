import { AppError } from "../../utils/errors.js";

/**
 * Conditional edge after the validateInput node.
 * Routes to either the fetchVideo tool or the error handler.
 *
 * @param {import('../../types/caption.types.js').GraphState} state
 * @returns {string} Next node name
 */
export function afterValidateInput(state) {
  if (state.error) {
    return "handleError";
  }
  // Input is valid → proceed to download the video
  return "fetchVideo";
}

/**
 * Conditional edge after the qualityCheck node.
 * Routes to the end of the graph or the error handler.
 *
 * @param {import('../../types/caption.types.js').GraphState} state
 * @returns {string} Next node name
 */
export function afterQualityCheck(state) {
  if (state.error) {
    return "handleError";
  }
  // Graph completes successfully
  return "__end__";
}

/**
 * Conditional edge for any general error encountered in intermediate nodes.
 * (Can be reused if needed)
 *
 * @param {import('../../types/caption.types.js').GraphState} state
 * @returns {string}
 */
export function onError(state) {
  return "handleError";
}
