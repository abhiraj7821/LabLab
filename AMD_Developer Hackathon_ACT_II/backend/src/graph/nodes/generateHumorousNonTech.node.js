import { invokeLLM } from "../../services/llm.service.js";
import logger from "../../utils/logger.js";

export async function generateHumorousNonTech(state) {
  logger.info("Generating humorous‑non‑tech caption");
  const systemMessage =
    "You are a caption writer who creates light‑hearted, non‑technical humour. Write a funny caption that appeals to a general audience without tech jargon.";
  const humanMessage = `Content:\n{content}\n\nFunny caption:`;

  try {
    const caption = await invokeLLM({
      systemMessage,
      humanMessage,
      variables: { content: state.contentSummary },
    });
    return { ...state, humorousNonTechCaption: caption, status: "generating" };
  } catch (err) {
    logger.error({ err }, "Humorous‑non‑tech caption failed");
    return {
      ...state,
      error: `Humorous‑non‑tech caption failed: ${err.message}`,
      status: "failed",
    };
  }
}
