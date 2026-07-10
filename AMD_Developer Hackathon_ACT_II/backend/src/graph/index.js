import { StateGraph, END } from "@langchain/langgraph";
import { GraphStateAnnotation } from "./state.js";

// Real node imports (used as defaults)
import * as defaultNodes from "./nodes/index.js";

// Real tools
import {
  fetchVideo as defaultFetchVideo,
  transcribeAudio as defaultTranscribeAudio,
  extractFrames as defaultExtractFrames,
} from "./tools/index.js";

// Edges
import {
  afterValidateInput,
  afterQualityCheck,
  onError,
} from "./edges/conditionalEdges.js";
import { getParallelGenerators } from "./edges/parallelEdges.js";

/**
 * Build and compile the video captioning agent graph.
 * @param {object} [options] – optional overrides for nodes/tools
 * @param {object} [options.nodes] – override any node function
 * @param {object} [options.tools] – override fetchVideo, transcribeAudio, extractFrames
 * @returns {CompiledGraph}
 */
export function buildCaptionGraph(options = {}) {
  // Allow overriding any node
  const nodes = { ...defaultNodes, ...options.nodes };
  const tools = {
    fetchVideo: defaultFetchVideo,
    transcribeAudio: defaultTranscribeAudio,
    extractFrames: defaultExtractFrames,
    ...options.tools,
  };

  const graph = new StateGraph(GraphStateAnnotation);

  // --- Add Nodes ---
  graph.addNode("validateInput", nodes.validateInput);
  graph.addNode("fetchVideo", tools.fetchVideo);
  graph.addNode("extractAudio", nodes.extractAudioNode);
  graph.addNode("extractFrames", tools.extractFrames);
  graph.addNode("transcribeAudio", tools.transcribeAudio);
  graph.addNode("analyzeVisual", nodes.analyzeVisualNode);
  graph.addNode("analyzeContent", nodes.analyzeContent);
  graph.addNode("generateFormal", nodes.generateFormal);
  graph.addNode("generateSarcastic", nodes.generateSarcastic);
  graph.addNode("generateHumorousTech", nodes.generateHumorousTech);
  graph.addNode("generateHumorousNonTech", nodes.generateHumorousNonTech);
  graph.addNode("aggregateResults", nodes.aggregateResults);
  graph.addNode("qualityCheck", nodes.qualityCheck);
  graph.addNode("handleError", nodes.handleError);

  // Entry
  graph.setEntryPoint("validateInput");

  // Conditional: validate → fetchVideo or handleError
  graph.addConditionalEdges("validateInput", afterValidateInput, {
    fetchVideo: "fetchVideo",
    handleError: "handleError",
  });

  // Linear: fetchVideo → extractAudio → extractFrames
  graph.addEdge("fetchVideo", "extractAudio");
  graph.addEdge("extractAudio", "extractFrames");

  // Parallel: extractFrames → transcribeAudio & analyzeVisual
  graph.addEdge("extractFrames", "transcribeAudio");
  graph.addEdge("extractFrames", "analyzeVisual");

  // Both converge to analyzeContent
  graph.addEdge("transcribeAudio", "analyzeContent");
  graph.addEdge("analyzeVisual", "analyzeContent");

  // Fan-out from analyzeContent to generator nodes
  graph.addConditionalEdges("analyzeContent", getParallelGenerators, {
    generateFormal: "generateFormal",
    generateSarcastic: "generateSarcastic",
    generateHumorousTech: "generateHumorousTech",
    generateHumorousNonTech: "generateHumorousNonTech",
  });

  // All generators converge to aggregator
  graph.addEdge("generateFormal", "aggregateResults");
  graph.addEdge("generateSarcastic", "aggregateResults");
  graph.addEdge("generateHumorousTech", "aggregateResults");
  graph.addEdge("generateHumorousNonTech", "aggregateResults");

  // Aggregator → qualityCheck
  graph.addEdge("aggregateResults", "qualityCheck");

  // Conditional: qualityCheck → END or handleError
  graph.addConditionalEdges("qualityCheck", afterQualityCheck, {
    __end__: END,
    handleError: "handleError",
  });

  // Error handler → END
  graph.addEdge("handleError", END);

  return graph.compile();
}
