import {
  processCaptionSync,
  submitCaptionJob,
  getCaptionJobStatus,
} from "../../services/caption.service.js";
import { AppError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";

/**
 * Helper to process a batch of URLs with limited concurrency.
 * @param {string[]} urls
 * @param {string[]} styles
 * @returns {Promise<Array<{ videoUrl: string, results: any[] | null, error?: string }>>}
 */
async function processBatch(urls, styles) {
  const MAX_CONCURRENT = 2; // adjust based on your API keys / resources
  const results = [];
  const queue = [...urls];

  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      try {
        logger.info({ videoUrl: url }, "Processing video in batch");
        const finalState = await processCaptionSync(url, styles);
        if (finalState.status === "completed") {
          results.push({ videoUrl: url, results: finalState.results });
        } else {
          results.push({
            videoUrl: url,
            error: finalState.error || "Processing failed",
          });
        }
      } catch (error) {
        logger.error(
          { err: error, videoUrl: url },
          "Batch video processing failed",
        );
        results.push({ videoUrl: url, error: error.message });
      }
    }
  };

  // Run workers
  const workers = Array.from({ length: MAX_CONCURRENT }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * POST /api/v1/caption
 * Expects JSON: { videoUrl?, videoUrls?, styles?, duration? }
 */
export async function createCaption(req, res, next) {
  try {
    const { videoUrl, videoUrls, styles, duration } = req.body;

    // Determine the list of URLs to process
    const urls = videoUrls ? videoUrls : videoUrl ? [videoUrl] : null;

    if (!urls || urls.length === 0) {
      return next(new AppError("No video URLs provided", 400));
    }

    const captionStyles = styles || ["formal"];

    // If only one URL, keep existing simple response for backward compatibility
    if (urls.length === 1) {
      const finalState = await processCaptionSync(urls[0], captionStyles);
      if (finalState.status === "completed") {
        return res.status(200).json({
          status: "success",
          data: {
            videoUrl: urls[0],
            results: finalState.results,
          },
        });
      } else {
        return res.status(422).json({
          status: "fail",
          message: finalState.error || "Processing failed",
          data: { videoUrl: urls[0], ...finalState },
        });
      }
    }

    // Multiple URLs: process with concurrency limit
    const batchResults = await processBatch(urls, captionStyles);
    return res.status(200).json({
      status: "success",
      data: {
        processed: batchResults.length,
        results: batchResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/caption/:id
 * Retrieve caption job status and results (unchanged).
 */
export function getCaptionStatus(req, res, next) {
  const jobId = req.params.id;
  const job = getCaptionJobStatus(jobId);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: job,
  });
}
