import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isProduction = process.env.NODE_ENV === "production";
const tempBase = isProduction ? "/tmp" : path.resolve(process.cwd(), "temp");

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/video-captioning",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  // Temp directories – safe for Vercel's read‑only filesystem
  tempDir: path.resolve(tempBase, "temp"),
  uploadDir: path.resolve(tempBase, "uploads"),
  audioDir: path.resolve(tempBase, "audio"),
  framesDir: path.resolve(tempBase, "frames"),

  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  fireworksApiKey: process.env.FIREWORKS_API_KEY,
  whisperModelPath: process.env.WHISPER_MODEL_PATH || "",
  logLevel: process.env.LOG_LEVEL || "info",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  corsOrigin: process.env.CORS_ORIGIN || "*",
  maxVideoDurationSeconds: 300,
  supportedVideoFormats: ["mp4", "avi", "mov", "mkv", "webm"],
};

export default config;
