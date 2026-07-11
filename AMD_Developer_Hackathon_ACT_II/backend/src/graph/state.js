import { Annotation } from "@langchain/langgraph";

export const GraphStateAnnotation = Annotation.Root({
  videoUrl: Annotation(),
  duration: Annotation(),
  styles: Annotation({
    default: () => ["formal", "sarcastic", "humorous-tech", "humorous-nontech"],
  }),
  videoPath: Annotation(),
  audioPath: Annotation(),
  framePaths: Annotation(),
  transcript: Annotation(),
  visualDescriptions: Annotation(),
  contentSummary: Annotation(), // added by analyzeContent
  formalCaption: Annotation(),
  sarcasticCaption: Annotation(),
  humorousTechCaption: Annotation(),
  humorousNonTechCaption: Annotation(),
  results: Annotation(),
  error: Annotation(),
  status: Annotation({
    default: () => "pending",
  }),
});

export function createInitialState() {
  return {
    videoUrl: "",
    duration: undefined,
    styles: ["formal", "sarcastic", "humorous-tech", "humorous-nontech"],
    videoPath: undefined,
    audioPath: undefined,
    framePaths: undefined,
    transcript: undefined,
    visualDescriptions: undefined,
    contentSummary: undefined,
    formalCaption: undefined,
    sarcasticCaption: undefined,
    humorousTechCaption: undefined,
    humorousNonTechCaption: undefined,
    results: undefined,
    error: undefined,
    status: "pending",
  };
}
