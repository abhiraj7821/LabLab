import { Router } from "express";
import healthRoutes from "./health.routes.js";
import captionRoutes from "./caption.routes.js";

const router = Router();

// Health endpoints
router.use(healthRoutes);

// API v1
router.use("/api/v1/caption", captionRoutes);

export default router;
