import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env file (adjust path as needed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",

  // Database
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/video-captioning",

  // Redis
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // Temporary directories – use /tmp in production (Vercel/cloud), ./temp locally
  tempDir:
    process.env.TEMP_DIR ||
    (process.env.NODE_ENV === "production"
      ? "/tmp"
      : path.resolve(process.cwd(), "temp")),
  uploadDir:
    process.env.UPLOAD_DIR ||
    (process.env.NODE_ENV === "production"
      ? "/tmp/uploads"
      : path.resolve(process.cwd(), "temp/uploads")),
  audioDir:
    process.env.AUDIO_DIR ||
    (process.env.NODE_ENV === "production"
      ? "/tmp/audio"
      : path.resolve(process.cwd(), "temp/audio")),
  framesDir:
    process.env.FRAMES_DIR ||
    (process.env.NODE_ENV === "production"
      ? "/tmp/frames"
      : path.resolve(process.cwd(), "temp/frames")),

  // AI / LLM
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  fireworksApiKey: process.env.FIREWORKS_API_KEY,

  // Vision model overrides (optional)
  groqVisionModel: process.env.GROQ_VISION_MODEL,
  anthropicVisionModel: process.env.ANTHROPIC_VISION_MODEL,
  fireworksVisionModel: process.env.FIREWORKS_VISION_MODEL,

  // Rate limiting
  geminiRpmLimit: parseInt(process.env.GEMINI_RPM_LIMIT, 10) || 8,

  // Whisper
  whisperModelPath: process.env.WHISPER_MODEL_PATH || "",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Rate limiter (ms window and max requests)
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
