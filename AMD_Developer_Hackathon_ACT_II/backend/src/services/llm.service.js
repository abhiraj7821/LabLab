import fs from "fs";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptTemplate } from "@langchain/core/prompts";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/errors.js";
import axios from "axios";

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
      maxTokens: 300,
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

// Groq vision-capable model.
// NOTE: Groq deprecated meta-llama/llama-4-scout-17b-16e-instruct (announced
// June 17, 2026) — the same model this file uses for text via getGroqModel().
// qwen/qwen3.6-27b is currently Groq's only vision-capable (multimodal)
// model, but Groq serves it as a PREVIEW model: intended for evaluation, not
// guaranteed production stability, and can be swapped/discontinued with
// little notice. Keep this overridable via config so a future Groq
// deprecation doesn't require a code change.
// Reference: https://console.groq.com/docs/vision, https://console.groq.com/docs/deprecations
const GROQ_VISION_MODEL = config.groqVisionModel || "qwen/qwen3.6-27b";

/**
 * Analyze an image using Groq's vision-capable model (qwen/qwen3.6-27b).
 * @param {string} imagePath - Local file path to image
 * @param {string} [prompt] - Optional custom prompt
 * @returns {Promise<string>} Text description
 */
export async function analyzeImageWithGroq(imagePath, prompt) {
  if (!config.groqApiKey) {
    throw new AppError("Groq API key not configured", 500);
  }

  const imageBuffer = await fs.promises.readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = "image/jpeg"; // frames are JPEG

  const defaultPrompt =
    "Describe this video frame in detail. Focus on visible people, actions, objects, text overlays, and the overall mood. Be concise but thorough.";

  const payload = {
    model: GROQ_VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt || defaultPrompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_completion_tokens: 300,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.groqApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30 * 1000,
      },
    );

    const description = response.data.choices[0].message.content;
    logger.debug(
      { imagePath, model: GROQ_VISION_MODEL, textLength: description.length },
      "Groq vision analysis successful",
    );
    return description.trim();
  } catch (error) {
    logger.error(
      { err: error, imagePath, model: GROQ_VISION_MODEL },
      "Groq vision analysis failed",
    );
    if (error.response) {
      throw new AppError(
        `Groq vision error: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        502,
      );
    }
    throw new AppError(`Groq vision error: ${error.message}`, 500);
  }
}

// Anthropic vision-capable model for frame analysis.
// Using Claude Sonnet 5 — Anthropic's mid-tier model (cheaper than Opus,
// more capable than Haiku), a good cost/quality balance for describing
// video frames. Override via config.anthropicVisionModel if you want to
// move up to Opus or down to Haiku for cost reasons.
const ANTHROPIC_VISION_MODEL = config.anthropicVisionModel || "claude-sonnet-5";

/**
 * Analyze an image using Anthropic's Claude Sonnet 5 (vision capable).
 * @param {string} imagePath - Local file path to image
 * @param {string} [prompt] - Optional custom prompt
 * @returns {Promise<string>} Text description
 */
export async function analyzeImageWithAnthropic(imagePath, prompt) {
  if (!config.anthropicApiKey) {
    throw new AppError("Anthropic API key not configured", 500);
  }

  const imageBuffer = await fs.promises.readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mediaType = "image/jpeg"; // frames are JPEG

  const defaultPrompt =
    "Describe this video frame in detail. Focus on visible people, actions, objects, text overlays, and the overall mood. Be concise but thorough.";

  const payload = {
    model: ANTHROPIC_VISION_MODEL,
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: prompt || defaultPrompt,
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      payload,
      {
        headers: {
          "x-api-key": config.anthropicApiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        timeout: 30 * 1000,
      },
    );

    const description = response.data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    logger.debug(
      {
        imagePath,
        model: ANTHROPIC_VISION_MODEL,
        textLength: description.length,
      },
      "Anthropic vision analysis successful",
    );
    return description.trim();
  } catch (error) {
    logger.error(
      { err: error, imagePath, model: ANTHROPIC_VISION_MODEL },
      "Anthropic vision analysis failed",
    );
    if (error.response) {
      throw new AppError(
        `Anthropic vision error: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        502,
      );
    }
    throw new AppError(`Anthropic vision error: ${error.message}`, 500);
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
 * Simple sliding-window rate limiter. Queues callers instead of letting them
 * fire immediately, so a burst of frames (e.g. many video frames processed
 * in a loop/Promise.all) gets spaced out instead of slamming the API and
 * tripping 429s.
 */
class SlidingWindowRateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.timestamps = [];
    this.queue = [];
  }

  acquire() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this._drain();
    });
  }

  _drain() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    while (this.queue.length > 0 && this.timestamps.length < this.maxRequests) {
      this.timestamps.push(Date.now());
      this.queue.shift()();
    }

    if (this.queue.length > 0) {
      const oldest = this.timestamps[0];
      const waitMs = Math.max(this.windowMs - (Date.now() - oldest) + 50, 50);
      setTimeout(() => this._drain(), waitMs);
    }
  }
}

// Gemini free/lower-tier rate limits vary by account tier and have changed
// several times (Google cut quotas significantly in Dec 2025). Reported
// numbers for gemini-2.5-flash range roughly 8-15 RPM depending on source
// and tier — check https://ai.google.dev/gemini-api/docs/rate-limits for
// YOUR project's actual limit and tune via config.geminiRpmLimit.
// Defaulting conservatively below the lowest commonly-reported figure.
const GEMINI_RPM_LIMIT = config.geminiRpmLimit || 8;
const geminiRateLimiter = new SlidingWindowRateLimiter(
  GEMINI_RPM_LIMIT,
  60 * 1000,
);

/**
 * Retry a function with exponential backoff + jitter, specifically for
 * rate-limit (429) errors. Honors a Retry-After header/value if present.
 * Any other error is thrown immediately without retrying.
 */
async function withRateLimitRetry(
  fn,
  { retries = 5, baseDelayMs = 2000 } = {},
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const message = typeof error?.message === "string" ? error.message : "";
      const status =
        error?.status ??
        error?.response?.status ??
        (message.includes("429") ? 429 : undefined);
      const isRateLimit = status === 429 || /rate limit|quota/i.test(message);

      if (!isRateLimit || attempt >= retries) {
        throw error;
      }

      const retryAfterHeader = error?.response?.headers?.["retry-after"];
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : null;
      const backoffMs = retryAfterMs || baseDelayMs * 2 ** attempt;
      const jitterMs = Math.random() * 300;

      logger.warn(
        { attempt, waitMs: Math.round(backoffMs + jitterMs) },
        "Gemini rate limit hit, backing off before retry",
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs + jitterMs));
    }
  }
}

/**
 * Analyze an image using Gemini 2.5 Flash (vision capable).
 * Requests are throttled through a sliding-window rate limiter and retried
 * with backoff on 429s so bursts of video-frame analysis calls don't trip
 * Gemini's per-minute quota.
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
    await geminiRateLimiter.acquire();
    const result = await withRateLimitRetry(() =>
      model.generateContent({ contents: [{ parts }] }),
    );
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

// Fireworks vision-capable model, in priority order.
// Primary: Llama 4 Scout Instruct (Basic) — Meta's current natively multimodal
// model on Fireworks serverless (text + image), same Llama-4-Scout family
// already used for text on Groq.
// Fallback: Qwen2.5-VL 32B Instruct — solid alternative if Scout is ever
// unavailable/rate-limited on your account.
// Reference: https://docs.fireworks.ai/api-reference/introduction
// (model catalog: https://fireworks.ai/models — filter by "Vision")
const FIREWORKS_VISION_MODELS = [
  config.fireworksVisionModel ||
    "accounts/fireworks/models/llama4-scout-instruct-basic",
  "accounts/fireworks/models/qwen2p5-vl-32b-instruct",
];

/**
 * Analyze an image using Fireworks AI's vision model (Llama 4 Scout by default).
 * Tries each model in FIREWORKS_VISION_MODELS in order, falling back if a
 * model is not found/deployed (404) so a single deprecated model ID doesn't
 * take down the whole pipeline.
 */
export async function analyzeImageWithFireworks(imagePath, prompt) {
  if (!config.fireworksApiKey) {
    throw new AppError("Fireworks API key not configured", 500);
  }

  const imageBuffer = await fs.promises.readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = "image/jpeg"; // frames are JPEG

  const defaultPrompt =
    "Describe this video frame in detail. Focus on visible people, actions, objects, text overlays, and the overall mood. Be concise but thorough.";

  let lastError;

  for (const model of FIREWORKS_VISION_MODELS) {
    const payload = {
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt || defaultPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    };

    try {
      const response = await axios.post(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        payload,
        {
          headers: {
            Authorization: `Bearer ${config.fireworksApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30 * 1000,
        },
      );

      const description = response.data.choices[0].message.content;
      logger.debug(
        { imagePath, model, textLength: description.length },
        "Fireworks vision analysis successful",
      );
      return description.trim();
    } catch (error) {
      const status = error.response?.status;
      const isNotFound = status === 404;

      logger.error(
        { err: error, imagePath, model },
        "Fireworks vision analysis failed",
      );

      lastError = error;

      // Only fall through to the next candidate model on a "model not
      // found/inaccessible/not deployed" style error. Any other error
      // (auth, rate limit, bad request, timeout) should surface immediately.
      if (!isNotFound) {
        break;
      }
      logger.warn(
        { model },
        "Model unavailable on Fireworks, trying next fallback model",
      );
    }
  }

  if (lastError?.response) {
    throw new AppError(
      `Fireworks vision error: ${lastError.response.status} ${JSON.stringify(lastError.response.data)}`,
      502,
    );
  }
  throw new AppError(`Fireworks vision error: ${lastError?.message}`, 500);
}
