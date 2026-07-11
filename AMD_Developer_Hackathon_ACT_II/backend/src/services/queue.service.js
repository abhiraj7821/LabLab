import { Queue, Worker } from "bullmq";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

/**
 * The BullMQ Queue instance (lazy initialised).
 */
let captionQueue = null;

/**
 * Get (or create) the caption processing queue.
 * @returns {Queue}
 */
export function getCaptionQueue() {
  if (!captionQueue) {
    captionQueue = new Queue("caption-processing", {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
      },
    });
    logger.info("Caption queue initialized");
  }
  return captionQueue;
}

/**
 * Add a caption job to the queue.
 * @param {string} videoUrl
 * @param {string[]} styles
 * @returns {Promise<import('bullmq').Job>} The created job
 */
export async function enqueueCaptionJob(videoUrl, styles) {
  const queue = getCaptionQueue();
  const job = await queue.add("caption-job", { videoUrl, styles });
  logger.info({ jobId: job.id, videoUrl }, "Caption job enqueued");
  return job;
}

/**
 * Start a worker that processes caption jobs (to be called in server.js).
 * @param {function} processor - Async function that receives job and returns results
 */
export function startCaptionWorker(processor) {
  const worker = new Worker("caption-processing", processor, {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
    },
  });
  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Job completed");
  });
  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Job failed");
  });
  logger.info("Caption worker started");
  return worker;
}
