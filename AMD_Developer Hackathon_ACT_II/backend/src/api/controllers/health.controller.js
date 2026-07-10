/**
 * GET /health
 */
export function getHealth(req, res) {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /ready – checks if critical services (e.g., Redis) are reachable.
 */
export function getReady(req, res) {
  // You can add checks like Redis ping here
  res.status(200).json({ status: "ready" });
}
