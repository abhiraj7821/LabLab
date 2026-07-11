import { buildCaptionGraph } from "../graph/index.js";
import { createInitialState } from "../graph/state.js";
import { storeFile } from "./storage.service.js"; // if needed
import { enqueueCaptionJob } from "./queue.service.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/errors.js";
import { generateJobId, cleanVideoUrl } from "../utils/helpers.js";

/**
 * Simple in-memory job store (replace with a real database later).
 * @type {Map<string, import('../types/caption.types.js').CaptionJob>}
 */
const jobStore = new Map();

/**
 * Process a caption request synchronously (invoke graph and return results).
 * @param {string} videoUrl
 * @param {string[]} styles
 * @returns {Promise<object>} final state containing results
 */
export async function processCaptionSync(videoUrl, styles) {
  const cleanedUrl = cleanVideoUrl(videoUrl);
  const initialState = createInitialState();
  initialState.videoUrl = cleanedUrl;
  initialState.styles = styles;

  const graph = buildCaptionGraph();
  logger.info({ videoUrl: cleanedUrl, styles }, "Invoking caption graph");

  try {
    const finalState = await graph.invoke(initialState);
    logger.info(
      { videoUrl: cleanedUrl, status: finalState.status },
      "Graph finished",
    );
    return finalState;
  } catch (error) {
    logger.error(
      { err: error, videoUrl: cleanedUrl },
      "Graph invocation failed",
    );
    throw new AppError(`Caption processing failed: ${error.message}`, 500);
  }
}

/**
 * Submit a caption job asynchronously (add to queue).
 * @param {string} videoUrl
 * @param {string[]} styles
 * @returns {Promise<object>} job metadata (id, status, etc.)
 */
export async function submitCaptionJob(videoUrl, styles) {
  const cleanedUrl = cleanVideoUrl(videoUrl);
  const jobId = generateJobId();

  // Create an in-memory job entry
  const job = {
    id: jobId,
    videoUrl: cleanedUrl,
    status: "pending",
    styles,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  jobStore.set(jobId, job);

  // Enqueue to BullMQ (optional; worker will process it)
  await enqueueCaptionJob(cleanedUrl, styles);

  return job;
}

/**
 * Get the status of a caption job by ID.
 * @param {string} jobId
 * @returns {object|null} job object
 */
export function getCaptionJobStatus(jobId) {
  return jobStore.get(jobId) || null;
}

/**
 * Update a job's status and result (called by the worker).
 * @param {string} jobId
 * @param {object} updates
 */
export function updateCaptionJob(jobId, updates) {
  const job = jobStore.get(jobId);
  if (job) {
    Object.assign(job, updates, { updatedAt: new Date() });
  }
}

/**
 * Worker processor: invokes the graph and updates the job.
 * @param {import('bullmq').Job} bullJob
 */
export async function captionWorkerProcessor(bullJob) {
  const { videoUrl, styles } = bullJob.data;
  const jobId = bullJob.id;

  updateCaptionJob(jobId, { status: "downloading" });
  const finalState = await processCaptionSync(videoUrl, styles);

  if (finalState.status === "completed") {
    updateCaptionJob(jobId, {
      status: "completed",
      results: finalState.results,
    });
  } else {
    updateCaptionJob(jobId, { status: "failed", error: finalState.error });
  }

  return finalState;
}
