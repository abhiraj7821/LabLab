import { randomUUID } from "crypto";
import config from "../config/index.js";
import logger from "./logger.js";

/**
 * Parse a duration string (e.g., "5:30", "90s", "1h2m", "120") into seconds.
 * Returns null if invalid.
 * @param {string|number} input
 * @returns {number|null}
 */
export function parseDuration(input) {
  if (typeof input === "number" && input > 0) return input;
  if (typeof input !== "string") return null;

  const trimmed = input.trim().toLowerCase();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // patterns: h, m, s; e.g., 1h2m30s
  const hmsRegex = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s?)?$/;
  const match = trimmed.match(hmsRegex);
  if (match) {
    const h = parseInt(match[1], 10) || 0;
    const m = parseInt(match[2], 10) || 0;
    const s = parseFloat(match[3]) || 0;
    return h * 3600 + m * 60 + s;
  }

  // MM:SS or HH:MM:SS
  const parts = trimmed.split(":");
  if (parts.length === 2) {
    const [min, sec] = parts.map(Number);
    if (!isNaN(min) && !isNaN(sec)) return min * 60 + sec;
  } else if (parts.length === 3) {
    const [hour, min, sec] = parts.map(Number);
    if (!isNaN(hour) && !isNaN(min) && !isNaN(sec))
      return hour * 3600 + min * 60 + sec;
  }

  return null;
}

/**
 * Clean a video URL (remove query params, trackers, etc.)
 * @param {string} url
 * @returns {string}
 */
export function cleanVideoUrl(url) {
  try {
    const parsed = new URL(url);
    // Remove known tracking params
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "feature",
      "t",
      "si",
    ];
    trackingParams.forEach((p) => parsed.searchParams.delete(p));
    return parsed.toString();
  } catch {
    // If not a valid URL, return as is (maybe a local path)
    return url;
  }
}

/**
 * Generate a unique job ID
 * @returns {string}
 */
export function generateJobId() {
  return randomUUID();
}

/**
 * Validate that video duration is within allowed limits
 * @param {number} durationSeconds
 * @returns {boolean}
 */
export function isValidDuration(durationSeconds) {
  return (
    durationSeconds > 0 && durationSeconds <= config.maxVideoDurationSeconds
  );
}

/**
 * Check if a file extension is a supported video format
 * @param {string} filename
 * @returns {boolean}
 */
export function isSupportedVideoFormat(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? config.supportedVideoFormats.includes(ext) : false;
}

/**
 * Delay (promise-based setTimeout)
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
