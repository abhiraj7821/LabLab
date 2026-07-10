// test-graph.js
import { buildCaptionGraph } from "./src/graph/index.js";
import { createInitialState } from "./src/graph/state.js";

const videoUrls = [
  "https://storage.googleapis.com/amd-hackathon-clips/3044693-uhd_3840_2160_24fps.mp4",
  "https://storage.googleapis.com/amd-hackathon-clips/13825391-uhd_3840_2160_30fps.mp4",
  "https://storage.googleapis.com/amd-hackathon-clips/1860079-uhd_2560_1440_25fps.mp4",
];

const mockNodes = {
  validateInput: async (state) => ({
    duration: 120,
    status: "validating",
  }),
  extractAudioNode: async (state) => ({
    audioPath: "/tmp/mock-audio.wav",
    // No status here
  }),
  analyzeVisualNode: async (state) => ({
    visualDescriptions: ["A person talking", "A chart on screen"],
    // No status here
  }),
  analyzeContent: async (state) => ({
    contentSummary: "Combined context",
    status: "analyzing",
  }),
  generateFormal: async (state) => ({ formalCaption: "Formal caption" }),
  generateSarcastic: async (state) => ({
    sarcasticCaption: "Sarcastic caption",
  }),
  generateHumorousTech: async (state) => ({
    humorousTechCaption: "Tech humor caption",
  }),
  generateHumorousNonTech: async (state) => ({
    humorousNonTechCaption: "Non‑tech humor caption",
  }),
  aggregateResults: async (state) => {
    const results = [];
    if (state.formalCaption)
      results.push({ style: "formal", caption: state.formalCaption });
    if (state.sarcasticCaption)
      results.push({ style: "sarcastic", caption: state.sarcasticCaption });
    if (state.humorousTechCaption)
      results.push({
        style: "humorous-tech",
        caption: state.humorousTechCaption,
      });
    if (state.humorousNonTechCaption)
      results.push({
        style: "humorous-nontech",
        caption: state.humorousNonTechCaption,
      });
    return { results, status: "aggregated" };
  },
  qualityCheck: async (state) => ({ status: "completed" }),
  handleError: async (state) => ({ status: "failed" }),
};

const mockTools = {
  fetchVideo: async (state) => ({
    videoPath: "/tmp/mock-video.mp4",
    status: "downloading",
  }),
  transcribeAudio: async (state) => ({
    transcript: "Mock transcript of the video.",
    // No status here (runs parallel to analyzeVisual)
  }),
  extractFrames: async (state) => ({
    framePaths: ["/tmp/frame-0001.jpg", "/tmp/frame-0002.jpg"],
    status: "extracting_frames", // This is fine (not parallel)
  }),
};

const app = buildCaptionGraph({
  nodes: mockNodes,
  tools: mockTools,
});

(async () => {
  for (const [index, url] of videoUrls.entries()) {
    console.log(`\n▶ Testing video ${index + 1}: ${url}`);
    const initialState = createInitialState();
    initialState.videoUrl = url;
    initialState.styles = ["formal", "sarcastic"];

    try {
      const finalState = await app.invoke(initialState);
      console.log(
        `✅ Video ${index + 1} finished. Status: ${finalState.status}`,
      );
      console.log(`   Generated captions: ${finalState.results?.length ?? 0}`);
      console.log(
        `   Captions: ${JSON.stringify(finalState.results, null, 2)}`,
      );
    } catch (err) {
      console.error(`❌ Video ${index + 1} error:`, err.message);
    }
  }
})();
