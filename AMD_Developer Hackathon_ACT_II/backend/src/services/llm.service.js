import fs from "fs";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptTemplate } from "@langchain/core/prompts";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

let geminiClient = null;
let openaiModel = null;
let anthropicModel = null;
let groqModel = null;

/**
 * Initialize and return the Groq chat model (cached, default provider).
 * @returns {ChatGroq}
 */
export function getGroqModel() {
  if (!groqModel) {
    if (!config.groqApiKey) {
      throw new AppError("Groq API key not configured", 500);
    }
    groqModel = new ChatGroq({
      apiKey: config.groqApiKey,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      maxTokens: 1024,
    });
    logger.info(
      "Groq model initialized (meta-llama/llama-4-scout-17b-16e-instruct)",
    );
  }
  return groqModel;
}

/**
 * (Optional) OpenAI model – not used by default.
 * @returns {ChatOpenAI}
 */
export function getOpenAIModel() {
  if (!openaiModel) {
    if (!config.openaiApiKey) {
      throw new AppError("OpenAI API key not configured", 500);
    }
    openaiModel = new ChatOpenAI({
      openAIApiKey: config.openaiApiKey,
      modelName: "gpt-4o",
      temperature: 0.7,
      maxTokens: 1024,
    });
    logger.info("OpenAI model initialized");
  }
  return openaiModel;
}

/**
 * (Optional) Anthropic model – not used by default.
 * @returns {ChatAnthropic}
 */
export function getAnthropicModel() {
  if (!anthropicModel && config.anthropicApiKey) {
    anthropicModel = new ChatAnthropic({
      anthropicApiKey: config.anthropicApiKey,
      modelName: "claude-3-opus-20240229",
      temperature: 0.7,
      maxTokens: 1024,
    });
    logger.info("Anthropic model initialized");
  }
  if (!anthropicModel) {
    throw new AppError("Anthropic API key not configured", 500);
  }
  return anthropicModel;
}

/**
 * Call an LLM with a prompt template and variables.
 * @param {object} options
 * @param {string} options.systemMessage
 * @param {string} options.humanMessage - Template string
 * @param {Record<string, any>} options.variables
 * @param {'groq'|'openai'|'anthropic'} [options.provider='groq']  // default: groq
 * @returns {Promise<string>}
 */
export async function invokeLLM({
  systemMessage,
  humanMessage,
  variables = {},
  provider = "groq", // Groq is the default now
}) {
  let model;
  switch (provider) {
    case "groq":
      model = getGroqModel();
      break;
    case "openai":
      model = getOpenAIModel();
      break;
    case "anthropic":
      model = getAnthropicModel();
      break;
    default:
      throw new AppError(`Unknown LLM provider: ${provider}`, 400);
  }

  try {
    const prompt = PromptTemplate.fromTemplate(humanMessage);
    const formatted = await prompt.format(variables);

    const messages = [
      ["system", systemMessage],
      ["human", formatted],
    ];

    const response = await model.invoke(messages);
    const text =
      typeof response.content === "string"
        ? response.content
        : response.content.map((c) => c.text).join("");

    logger.debug(
      { provider, textLength: text.length },
      "LLM invocation successful",
    );
    return text.trim();
  } catch (error) {
    logger.error({ err: error, provider }, "LLM invocation failed");
    throw new AppError(`LLM error (${provider}): ${error.message}`, 500);
  }
}

function getGeminiClient() {
  if (!geminiClient) {
    if (!config.geminiApiKey) {
      throw new AppError("Gemini API key not configured", 500);
    }
    geminiClient = new GoogleGenerativeAI(config.geminiApiKey);
    logger.info("Gemini client initialized");
  }
  return geminiClient;
}

/**
 * Analyze an image using Gemini 2.5 Flash (vision capable).
 * @param {string} imagePath - Local file path to image
 * @param {string} [prompt] - Optional custom prompt
 * @returns {Promise<string>} Text description
 */
export async function analyzeImageWithGemini(imagePath, prompt) {
  const client = getGeminiClient();
  // Use gemini-2.5-flash (check exact model name for your account)
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const imageBuffer = await fs.promises.readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const defaultPrompt =
    "Describe this video frame in detail. Focus on visible people, actions, objects, text overlays, and the overall mood. Be concise but thorough.";

  const parts = [
    { text: prompt || defaultPrompt },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
  ];

  try {
    const result = await model.generateContent({ contents: [{ parts }] });
    const response = result.response;
    const text = response.text();
    logger.debug(
      { imagePath, textLength: text.length },
      "Gemini vision analysis successful",
    );
    return text.trim();
  } catch (error) {
    logger.error({ err: error, imagePath }, "Gemini vision analysis failed");
    throw new AppError(`Gemini vision error: ${error.message}`, 502);
  }
}
