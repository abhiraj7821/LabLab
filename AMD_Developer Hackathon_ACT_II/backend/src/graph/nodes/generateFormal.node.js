import { invokeLLM } from "../../services/llm.service.js";
import logger from "../../utils/logger.js";

export async function generateFormal(state) {
  logger.info("Generating formal caption");
  const systemMessage =
    "You are a professional caption writer. Write a concise, grammatically correct caption in a formal tone.";
  const humanMessage = `Based on the following content, create a formal caption:\n\n{content}`;

  try {
    const caption = await invokeLLM({
      systemMessage,
      humanMessage,
      variables: { content: state.contentSummary },
    });
    return { formalCaption: caption };
  } catch (err) {
    logger.error({ err }, "Formal caption generation failed");
    return { formalCaption: null };
  }
}
