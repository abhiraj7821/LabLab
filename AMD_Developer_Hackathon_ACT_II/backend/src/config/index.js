import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isProduction = process.env.NODE_ENV === "production";

// In production (Vercel), /tmp is the only writable directory.
// We ignore any .env overrides that might point to project‑relative paths.
const tempBase = isProduction
  ? "/tmp"
  : process.env.TEMP_DIR || path.resolve(process.cwd(), "temp");

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,

  // Database
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/video-captioning",

  // Redis
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // Temporary directories – safe for production (Vercel) and local development
  tempDir: path.resolve(tempBase, "temp"),
  uploadDir: isProduction
    ? "/tmp/uploads"
    : process.env.UPLOAD_DIR || path.resolve(tempBase, "uploads"),
  audioDir: isProduction
    ? "/tmp/audio"
    : process.env.AUDIO_DIR || path.resolve(tempBase, "audio"),
  framesDir: isProduction
    ? "/tmp/frames"
    : process.env.FRAMES_DIR || path.resolve(tempBase, "frames"),

  // AI / LLM
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  fireworksApiKey: process.env.FIREWORKS_API_KEY,

  // Whisper
  whisperModelPath: process.env.WHISPER_MODEL_PATH || "",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Rate limiter
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // Captioning limits
  maxVideoDurationSeconds: 300,
  supportedVideoFormats: ["mp4", "avi", "mov", "mkv", "webm"],
};

export default config;
