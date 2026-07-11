import multer from "multer";
import path from "path";
import config from "../../config/index.js";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload-${uuidv4()}${ext}`);
  },
});

/**
 * Multer instance for handling video uploads.
 * Limits: 500 MB, MP4/MOV/AVI only.
 */
export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(mp4|mov|avi|mkv|webm)$/i;
    if (!allowed.test(path.extname(file.originalname))) {
      return cb(new Error("Only video files are allowed"), false);
    }
    cb(null, true);
  },
});
