import { validateInput } from "../../../../src/graph/nodes/validateInput.node.js";
import { createInitialState } from "../../../../src/graph/state.js";

describe("validateInput node", () => {
  it("should accept a valid URL and duration (as number)", async () => {
    const state = createInitialState();
    state.videoUrl =
      "https://storage.googleapis.com/amd-hackathon-clips/3044693-uhd_3840_2160_24fps.mp4";
    state.duration = 60;
    const result = await validateInput(state);
    expect(result.error).toBeUndefined();
    expect(result.duration).toBe(60);
    expect(result.status).toBe("validating");
  });

  it("should reject an invalid URL", async () => {
    const state = createInitialState();
    state.videoUrl = "not-a-url";
    const result = await validateInput(state);
    expect(result.error).toBeDefined();
    expect(result.status).toBe("failed");
  });

  it("should reject duration outside 30–120s", async () => {
    const state = createInitialState();
    state.videoUrl =
      "https://storage.googleapis.com/amd-hackathon-clips/3044693-uhd_3840_2160_24fps.mp4";
    state.duration = 10;
    const result = await validateInput(state);
    expect(result.error).toBeDefined();
    expect(result.status).toBe("failed");
  });

  it('should accept valid duration string "90s"', async () => {
    const state = createInitialState();
    state.videoUrl =
      "https://storage.googleapis.com/amd-hackathon-clips/3044693-uhd_3840_2160_24fps.mp4";
    state.duration = "90s";
    const result = await validateInput(state);
    expect(result.error).toBeUndefined();
    expect(result.duration).toBe(90);
  });
});
