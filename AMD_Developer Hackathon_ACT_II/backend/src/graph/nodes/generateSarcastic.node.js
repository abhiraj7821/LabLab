import { invokeLLM } from "../../services/llm.service.js";
import logger from "../../utils/logger.js";

export async function generateSarcastic(state) {
  logger.info("Generating sarcastic caption");
  const systemMessage =
    "You are a witty caption writer. Write a sarcastic, clever caption that subtly mocks the content in a humorous way.";
  const humanMessage = `Content:\n{content}\n\nSarcastic caption:`;

  try {
    const caption = await invokeLLM({
      systemMessage,
      humanMessage,
      variables: { content: state.contentSummary },
    });
    return { sarcasticCaption: caption };
  } catch (err) {
    logger.error({ err }, "Sarcastic caption failed");
    return { sarcasticCaption: null };
  }
}
