// Full graph integration with mocked tools (as used in test-graph.js)
import { buildCaptionGraph } from "../../src/graph/index.js";
import { createInitialState } from "../../src/graph/state.js";

const mockNodes = {
  validateInput: async (state) => ({ ...state, duration: 120 }),
  extractAudioNode: async (state) => ({ audioPath: "/tmp/audio.wav" }),
  analyzeVisualNode: async (state) => ({ visualDescriptions: ["frame1 desc"] }),
  analyzeContent: async (state) => ({ contentSummary: "summary" }),
  generateFormal: async (state) => ({ formalCaption: "Formal" }),
  generateSarcastic: async (state) => ({ sarcasticCaption: "Sarcastic" }),
  generateHumorousTech: async (state) => ({ humorousTechCaption: "Tech" }),
  generateHumorousNonTech: async (state) => ({
    humorousNonTechCaption: "Nontech",
  }),
  aggregateResults: async (state) => ({
    results: [
      { style: "formal", caption: state.formalCaption },
      { style: "sarcastic", caption: state.sarcasticCaption },
    ],
  }),
  qualityCheck: async (state) => ({ status: "completed" }),
  handleError: async (state) => ({ status: "failed" }),
};

const mockTools = {
  fetchVideo: async (state) => ({ videoPath: "/tmp/video.mp4" }),
  transcribeAudio: async (state) => ({ transcript: "transcript" }),
  extractFrames: async (state) => ({ framePaths: ["/tmp/frame1.jpg"] }),
};

describe("Full graph integration", () => {
  it("should complete successfully for a valid input", async () => {
    const app = buildCaptionGraph({ nodes: mockNodes, tools: mockTools });
    const state = {
      ...createInitialState(),
      videoUrl:
        "https://storage.googleapis.com/amd-hackathon-clips/3044693-uhd_3840_2160_24fps.mp4",
      styles: ["formal", "sarcastic"],
    };
    const final = await app.invoke(state);
    expect(final.status).toBe("completed");
    expect(final.results).toHaveLength(2);
  });

  it("should route to error on validation failure", async () => {
    const nodesWithError = {
      ...mockNodes,
      validateInput: async (state) => ({
        error: "Invalid URL",
        status: "failed",
      }),
    };
    const app = buildCaptionGraph({ nodes: nodesWithError, tools: mockTools });
    const state = { ...createInitialState(), videoUrl: "bad-url" };
    const final = await app.invoke(state);
    expect(final.status).toBe("failed");
  });
});
