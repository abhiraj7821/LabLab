export async function extractKeyframes(videoPath, outputDir, intervalSec = 5) {
  await fs.mkdir(outputDir, { recursive: true });
  const outputPattern = path.join(outputDir, "frame-%04d.jpg");

  try {
    await execFileAsync(ffmpegPath, [
      "-i",
      videoPath,
      "-vf",
      `fps=1/${intervalSec}`,
      "-vsync",
      "vfr", // ← changed from -fps_mode to -vsync
      "-q:v",
      "2",
      outputPattern,
    ]);
    const files = await fs.readdir(outputDir);
    const framePaths = files
      .filter((f) => f.startsWith("frame-") && f.endsWith(".jpg"))
      .map((f) => path.join(outputDir, f))
      .sort();
    logger.info({ count: framePaths.length, videoPath }, "Keyframes extracted");
    return framePaths;
  } catch (error) {
    logger.error({ err: error, videoPath }, "Failed to extract keyframes");
    throw new AppError(`ffmpeg frame extraction error: ${error.message}`, 500);
  }
}
