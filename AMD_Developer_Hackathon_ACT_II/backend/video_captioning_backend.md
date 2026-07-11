# Video Captioning Backend — System Overview

## What We Are Building

A **multi-agent video captioning backend** powered by **LangGraph JS** and **Express.js**. The system takes a short video clip (30 seconds to 2 minutes), processes it through an intelligent agent graph, and returns **four distinct caption styles** for the same video.

---

## Core Purpose

Transform video content into creative, multi-style text summaries using AI agents. Each agent specializes in a different tone — from boardroom formal to internet-sarcastic — giving users a full spectrum of caption options for any short video.

---

## The Four Caption Styles

| Style                 | Description                                  | Audience                              |
| --------------------- | -------------------------------------------- | ------------------------------------- |
| **Formal**            | Professional, polished, business-appropriate | Corporate, LinkedIn, presentations    |
| **Sarcastic**         | Dry wit, eye-roll energy, clever jabs        | Social media, Twitter/X               |
| **Humorous Tech**     | Tech memes, developer jokes, jargon humor    | Developers, tech Twitter, Hacker News |
| **Humorous Non-Tech** | General humor, relatable, no jargon          | Instagram, TikTok, general audiences  |

---

## System Architecture

### High-Level Flow

```
User Request (Video URL)
    |
    v
[Express API] -----> [LangGraph Agent Graph]
                            |
                            v
                    [Input Validation]
                            |
                            v
                    [Video Processing Pipeline]
                    |-- Download Video
                    |-- Extract Audio
                    |-- Transcribe (Speech-to-Text)
                    |-- Extract Key Frames
                    |-- Analyze Visuals (Vision Model)
                            |
                            v
                    [Content Analysis]
                    (Merge transcript + visual context)
                            |
                            v
                    [Parallel Caption Generation]
                    |-- Formal Agent
                    |-- Sarcastic Agent
                    |-- Humorous Tech Agent
                    |-- Humorous Non-Tech Agent
                            |
                            v
                    [Quality Check]
                    (Validate length, tone, relevance)
                            |
                            v
                    [Return 4 Captions]
```

---

## Key Components

### 1. Express API Layer

- **HTTP server** handling incoming requests
- **Request validation** (URL format, video duration bounds)
- **Rate limiting** to prevent abuse
- **Error handling** with structured responses
- **Endpoints**:
  - `POST /api/v1/caption` — Submit a video URL for captioning
  - `GET /api/v1/caption/:jobId` — Retrieve caption results
  - `GET /health` — Health check

### 2. LangGraph Agent Graph

The brain of the system. A state machine where each node is an agent with a specific job.

#### Graph Nodes

| Node                        | Functionality                                                         |
| --------------------------- | --------------------------------------------------------------------- |
| ****start****               | Entry point — receives the video URL                                  |
| **validateInput**           | Validates URL format and enforces 30s–2min duration constraint        |
| **fetchVideo**              | Downloads the video from the provided URL to local temp storage       |
| **transcribeAudio**         | Converts video audio to text using a speech-to-text model (Whisper)   |
| **extractFrames**           | Samples key frames from the video using FFmpeg                        |
| **analyzeVisual**           | Describes visual scenes using a vision language model (GPT-4V / CLIP) |
| **analyzeContent**          | Merges transcript and visual summary into unified context             |
| **generateFormal**          | Generates a formal, professional caption                              |
| **generateSarcastic**       | Generates a sarcastic, witty caption                                  |
| **generateHumorousTech**    | Generates a tech-focused humorous caption                             |
| **generateHumorousNonTech** | Generates a general-audience humorous caption                         |
| **aggregateResults**        | Collects all 4 captions into a single response object                 |
| **qualityCheck**            | Validates each caption for length, tone consistency, and relevance    |
| **handleError**             | Manages retry logic or graceful failure if max retries exceeded       |
| ****end****                 | Exit point — returns the final caption set or error                   |

#### Graph Edges

| Edge Type            | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| **Direct Edge**      | Sequential flow (e.g., fetchVideo → transcribeAudio)                      |
| **Conditional Edge** | Branching logic based on state (e.g., validation pass/fail)               |
| **Parallel Edge**    | Dispatches all 4 caption generators simultaneously after content analysis |

### 3. Tool Nodes (I/O Operations)

Specialized agents that interact with external systems:

| Tool                | Functionality                                                  |
| ------------------- | -------------------------------------------------------------- |
| **fetchVideo**      | Downloads video via HTTP/HTTPS to temporary local storage      |
| **transcribeAudio** | Sends audio to Whisper API, returns full transcript text       |
| **extractFrames**   | Uses FFmpeg to extract evenly-spaced key frames from the video |
| **analyzeVisual**   | Sends frames to a vision model to generate scene descriptions  |

### 4. Services Layer

Business logic that bridges the API and the graph:

| Service             | Functionality                                                                |
| ------------------- | ---------------------------------------------------------------------------- |
| **Caption Service** | Orchestrates graph execution, manages job state, formats responses           |
| **Queue Service**   | (Optional) Background job processing using BullMQ + Redis for async handling |
| **Storage Service** | Manages temporary file lifecycle — download, process, cleanup                |
| **LLM Service**     | Singleton wrapper around the language model (OpenAI GPT-4o)                  |

### 5. Utilities

Shared helpers used across the system:

| Utility            | Functionality                                                            |
| ------------------ | ------------------------------------------------------------------------ |
| **Logger**         | Structured logging with Pino (request tracing, error tracking)           |
| **Error Handler**  | Custom error classes (ValidationError, VideoProcessingError)             |
| **Helpers**        | Duration parsing, URL cleaning, ID generation, duration bound validation |
| **FFmpeg Wrapper** | Child-process wrappers for ffprobe (duration) and ffmpeg (frames/audio)  |

---

## State Management

The graph maintains a single state object that flows through all nodes:

| State Field     | Description                                  |
| --------------- | -------------------------------------------- |
| `videoUrl`      | Original video URL submitted by user         |
| `transcript`    | Speech-to-text output from the video         |
| `visualSummary` | Scene description from vision model          |
| `duration`      | Video duration in seconds (validated 30–120) |
| `captions`      | Object containing all 4 generated captions   |
| `error`         | Error message if any step fails              |
| `retryCount`    | Number of retry attempts for failed captions |
| `tempPath`      | Local file path to downloaded video          |

---

## Processing Pipeline

### Step 1: Input Validation

- Verify URL is valid and accessible
- Confirm video duration is between 30 and 120 seconds
- Reject invalid inputs immediately with clear error messages

### Step 2: Video Acquisition

- Download video to temporary storage
- Generate a unique job ID for tracking

### Step 3: Content Extraction

- Extract audio track from video
- Transcribe audio to text using Whisper
- Sample key frames from the video
- Analyze frames with vision model to understand visual context

### Step 4: Content Analysis

- Merge transcript and visual summary into a unified context
- This context is shared with all 4 caption generators

### Step 5: Parallel Caption Generation

- All 4 style agents run **simultaneously** (not sequentially)
- Each agent receives the same unified context
- Each agent applies its own style prompt to generate a caption

### Step 6: Quality Assurance

- Check each caption meets minimum length (not too short)
- Check each caption does not exceed maximum length (not too long)
- Verify tone matches the requested style
- If any caption fails quality check, trigger retry logic

### Step 7: Result Aggregation

- Collect all 4 captions into a structured response
- Clean up temporary files
- Return the final caption set to the user

---

## Error Handling & Resilience

| Scenario                | Behavior                                      |
| ----------------------- | --------------------------------------------- |
| Invalid URL             | Immediate rejection with validation error     |
| Video too short/long    | Rejection with duration bounds message        |
| Download failure        | Retry up to max retries, then fail gracefully |
| Transcription failure   | Log error, retry or return partial results    |
| Caption quality failure | Retry generation for that specific style      |
| Max retries exceeded    | Return error state with available information |
| Vision analysis failure | Fall back to transcript-only captions         |

---

## Technology Stack

| Layer                | Technology                                            |
| -------------------- | ----------------------------------------------------- |
| **Runtime**          | Node.js (JavaScript)                                  |
| **Web Framework**    | Express.js                                            |
| **Agent Framework**  | LangGraph JS                                          |
| **LLM Integration**  | LangChain + OpenAI GPT-4o                             |
| **Speech-to-Text**   | OpenAI Whisper                                        |
| **Vision Analysis**  | GPT-4V or similar vision model or google gemini model |
| **Video Processing** | FFmpeg + ffprobe                                      |
| **Queue (Optional)** | BullMQ + Redis                                        |
| **Logging**          | Pino                                                  |
| **Testing**          | Jest + Supertest                                      |
| **Validation**       | Zod                                                   |
| **Rate Limiting**    | express-rate-limit                                    |

---

## API Endpoints

### Submit Video for Captioning

```
POST /api/v1/caption
Body: { "videoUrl": "https://example.com/video.mp4" }
Response: { "jobId": "job_123456", "status": "processing" }
```

### Retrieve Caption Results

```
GET /api/v1/caption/:jobId
Response: {
  "jobId": "job_123456",
  "status": "completed",
  "captions": {
    "formal": "A professional summary of the video content...",
    "sarcastic": "Oh great, another video about this...",
    "humorousTech": "When your code finally compiles but...",
    "humorousNonTech": "Me watching this video like..."
  }
}
```

### Health Check

```
GET /health
Response: { "status": "ok", "timestamp": "2026-07-10T15:46:00Z" }
```

---

## Key Design Principles

1. **Agent Separation**: Each caption style is a separate agent with its own prompt and personality
2. **Parallel Execution**: All 4 generators run simultaneously, not one after another
3. **State Immutability**: Each node receives state and returns new state — no side effects
4. **Conditional Routing**: The graph branches based on validation results and quality checks
5. **Retry Logic**: Failed captions are regenerated up to a configurable max retry count
6. **Temp File Hygiene**: All downloaded videos, audio, and frames are cleaned up after processing
7. **Test-Driven**: Every component is tested before the next layer is built

---

## What Makes This Different

Instead of a single generic caption, this system produces **four distinct personalities** for the same video — giving creators a full palette of caption options without re-running the entire pipeline. The multi-agent architecture means each style agent can be tuned, improved, or swapped independently without affecting the others.
