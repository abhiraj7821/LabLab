import { qualityCheck } from "../../../../src/graph/nodes/qualityCheck.node.js";
import { createInitialState } from "../../../../src/graph/state.js";

describe("qualityCheck node", () => {
  it("should pass if all captions are valid", async () => {
    const state = {
      ...createInitialState(),
      results: [
        { style: "formal", caption: "A well-formed formal caption" },
        { style: "sarcastic", caption: "A nice sarcastic comment here" },
      ],
    };
    const result = await qualityCheck(state);
    expect(result.status).toBe("completed");
    expect(result.error).toBeUndefined();
  });

  it("should fail if a caption is too short", async () => {
    const state = {
      ...createInitialState(),
      results: [{ style: "formal", caption: "Hi" }],
    };
    const result = await qualityCheck(state);
    expect(result.status).toBe("failed");
    expect(result.error).toBeDefined();
  });
});
