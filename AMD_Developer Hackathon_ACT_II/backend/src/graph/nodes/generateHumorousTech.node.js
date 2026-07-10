import { invokeLLM } from "../../services/llm.service.js";
import logger from "../../utils/logger.js";

export async function generateHumorousTech(state) {
  logger.info("Generating humorous‑tech caption");
  const systemMessage =
    "You are a caption writer who loves tech jokes. Write a humorous caption from a tech‑savvy perspective, using programming or IT references.";
  const humanMessage = `Content:\n{content}\n\nHumorous tech caption:`;

  try {
    const caption = await invokeLLM({
      systemMessage,
      humanMessage,
      variables: { content: state.contentSummary },
    });
    return { ...state, humorousTechCaption: caption, status: "generating" };
  } catch (err) {
    logger.error({ err }, "Humorous‑tech caption failed");
    return {
      ...state,
      error: `Humorous‑tech caption failed: ${err.message}`,
      status: "failed",
    };
  }
}
