import { Router } from "express";
import {
  createCaption,
  getCaptionStatus,
} from "../controllers/caption.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { uploadVideo } from "../middleware/uploadHandler.js";
import {
  createCaptionSchema,
  getCaptionParamsSchema,
} from "../validators/caption.validator.js";

const router = Router();

// POST /api/v1/caption – accepts JSON body or multipart file upload
router.post(
  "/",
  uploadVideo.single("video"),
  validateRequest({ body: createCaptionSchema.shape.body }),
  createCaption,
);

// GET /api/v1/caption/:id
router.get("/:id", validateRequest(getCaptionParamsSchema), getCaptionStatus);

export default router;
