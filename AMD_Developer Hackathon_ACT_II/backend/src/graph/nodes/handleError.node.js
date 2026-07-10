import logger from "../../utils/logger.js";

export async function handleError(state) {
  logger.error({ error: state.error }, "Graph ended with error");
  return { status: "failed" };
}
