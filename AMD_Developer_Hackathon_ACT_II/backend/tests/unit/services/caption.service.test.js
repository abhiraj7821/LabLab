// We can't easily mock the whole graph without a test double framework,
// so we just verify that the service functions exist and return expected shapes.
import {
  submitCaptionJob,
  getCaptionJobStatus,
} from "../../../src/services/caption.service.js";

describe("Caption service", () => {
  it("submitCaptionJob returns a job object with an id", async () => {
    const job = await submitCaptionJob(
      "https://storage.googleapis.com/amd-hackathon-clips/3044693-uhd_3840_2160_24fps.mp4",
      ["formal"],
    );
    expect(job).toHaveProperty("id");
    expect(job.status).toBe("pending");
  });

  it("getCaptionJobStatus returns the job after submission", async () => {
    const job = await submitCaptionJob("https://example.com/video2.mp4", [
      "sarcastic",
    ]);
    const retrieved = getCaptionJobStatus(job.id);
    expect(retrieved).toEqual(job);
  });
});
