import {
  processCaptionSync,
  submitCaptionJob,
  getCaptionJobStatus,
} from "../../services/caption.service.js";
import { AppError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";

/**
 * POST /api/v1/caption
 * Expects JSON: { videoUrl, styles?, duration? }
 * Returns job ID or directly processed result (depending on mode).
 */
export async function createCaption(req, res, next) {
  try {
    const { videoUrl, styles, duration } = req.body;
    // If a file was uploaded, use that path instead of URL (handled by upload middleware)
    const videoSource = req.file ? req.file.path : videoUrl;
    if (!videoSource) {
      return next(
        new AppError("Either videoUrl or file upload is required", 400),
      );
    }

    // Currently process synchronously (for immediate results).
    // To switch to async queue, use submitCaptionJob and return job ID.
    const finalState = await processCaptionSync(
      videoSource,
      styles || ["formal"],
    );

    if (finalState.status === "completed") {
      return res.status(200).json({
        status: "success",
        data: {
          results: finalState.results,
        },
      });
    } else {
      return res.status(422).json({
        status: "fail",
        message: finalState.error || "Processing failed",
        data: finalState,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/caption/:id
 * Retrieve caption job status and results.
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
