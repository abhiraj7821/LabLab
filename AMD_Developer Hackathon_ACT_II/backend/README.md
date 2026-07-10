# 🎬 Video Captioning Agent

An intelligent multi-agent system built with **LangGraph**, **LangChain**, and **Express.js** that automatically generates creative captions for videos in multiple styles using LLMs and vision models.

---

## 🧠 Agentic Architecture

This project implements a **stateful agent graph** where multiple specialized agents (nodes) collaborate in a directed workflow to process videos and generate captions.

### The Agent Team

### How Agents Work Together

#### 1. **Validator Agent** (`validateInput.node.js`)

- **Role**: Gatekeeper
- **Task**: Validates video URL format and duration constraints (30-120 seconds)
- **Decision**: Routes to Downloader or Error Handler

#### 2. **Downloader Agent** (`fetchVideo.tool.js`)

- **Role**: Content Acquisition
- **Task**: Downloads video from URL to local storage
- **Output**: Local file path of the video

#### 3. **Audio Extractor Agent** (`extractAudio.node.js`)

- **Role**: Audio Processing
- **Task**: Extracts audio track from video using FFmpeg
- **Smart**: Gracefully handles videos without audio streams

#### 4. **Parallel Processing (Dual Agents)**

**a) Frame Extractor Agent** (`extractFrames.tool.js`)

- Extracts keyframes every 5 seconds using FFmpeg
- Creates image snapshots for visual analysis

**b) Transcription Agent** (`transcribeAudio.tool.js`)

- Converts speech to text using OpenAI Whisper
- Handles mute videos gracefully

#### 5. **Vision Analyzer Agent** (`analyzeVisual.node.js`)

- **Model**: Gemini 2.5 Flash (vision-capable)
- **Task**: Describes each keyframe - people, actions, objects, mood
- **Output**: Textual descriptions of visual scenes

#### 6. **Content Merger Agent** (`analyzeContent.node.js`)

- **Role**: Context Aggregation
- **Task**: Combines transcript + visual descriptions into unified context
- **Output**: Rich content summary for caption generation

#### 7. **Caption Generator Agents** (Parallel)

All four run simultaneously for maximum speed:

| Agent                     | Style         | Model                | Tone                          |
| ------------------------- | ------------- | -------------------- | ----------------------------- |
| `generateFormal`          | Professional  | Groq (LLaMA 3.3 70B) | Formal, grammatically correct |
| `generateSarcastic`       | Witty         | Groq (LLaMA 3.3 70B) | Sarcastic, clever mockery     |
| `generateHumorousTech`    | Tech Humor    | Groq (LLaMA 3.3 70B) | Programming/IT jokes          |
| `generateHumorousNonTech` | General Humor | Groq (LLaMA 3.3 70B) | Light-hearted, non-technical  |

#### 8. **Aggregator Agent** (`aggregateResults.node.js`)

- **Role**: Collector
- **Task**: Gathers all generated captions into structured results
- **Filter**: Only includes non-null captions

#### 9. **Quality Checker Agent** (`qualityCheck.node.js`)

- **Role**: Gatekeeper
- **Task**: Validates caption length (10-1000 characters) and content
- **Decision**: Routes to success output or error handler

#### 10. **Error Handler Agent** (`handleError.node.js`)

- **Role**: Safety Net
- **Task**: Gracefully handles failures, logs errors
- **Fallback**: Can be extended with retry logic

---

## 🚀 Quick Start Guide

### Prerequisites

```bash
# Install FFmpeg
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg

Installation

# Clone the repository
git clone <your-repo-url>
cd video-captioning-backend

# Install dependencies
npm install


Configuration
Create .env file from the example:
cp .env.example .env

Add your API keys to .env:
# Required
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=sk-your_openai_key_here

# Optional
PORT=3000
NODE_ENV=development

Run the Server

# Development mode with auto-reload
npm run dev

# Production mode
npm start

Test the API


# POST a video URL for captioning
curl -X POST http://localhost:3000/api/v1/caption \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://storage.googleapis.com/amd-hackathon-clips/1860079-uhd_2560_1440_25fps.mp4",
    "styles": ["formal", "sarcastic"],
    "duration": 60
  }'


  Expected Response
{
  {
  "status": "success",
  "data": {
    "results": [
      {
        "style": "formal",
        "caption": "A professional formal caption describing the video content..."
      },
      {
        "style": "sarcastic",
        "caption": "A witty sarcastic take on the video content..."
      }
    ]
  }
}

Available Routes
Method	Endpoint	Description
POST	/api/v1/caption	Submit video for captioning
GET	/api/v1/caption/:id	Get job status & results
GET	/health	Health check



Testing


# Run all tests
npm test

# Run graph integration test (mocked)
node test-graph.js

🏗️ Project Structure

video-captioning-backend/
├── src/
│   ├── api/              # Express.js API layer
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, rate limiting
│   │   ├── routes/       # Route definitions
│   │   └── validators/   # Request schemas
│   ├── config/           # Environment configuration
│   ├── graph/            # LangGraph agent system
│   │   ├── nodes/        # Agent implementations
│   │   ├── edges/        # Routing logic
│   │   └── tools/        # External integrations
│   ├── services/         # Business logic
│   ├── types/            # JSDoc type definitions
│   └── utils/            # Helpers & utilities
├── tests/                # Test suites
├── temp/                 # Runtime storage
└── scripts/              # Maintenance scripts


🔧 Tech Stack
Backend: Node.js, Express.js

Agent Framework: LangGraph (Stateful multi-agent orchestration)

LLM Integration: LangChain

Text Generation: Groq (LLaMA 3.3 70B Versatile)

Visual Analysis: Google Gemini 2.5 Flash

Speech-to-Text: OpenAI Whisper

Video Processing: FFmpeg

Queue System: BullMQ + Redis

Validation: Zod

Logging: Pino

🎯 Key Features
Multi-Style Captions: Generate formal, sarcastic, and humorous captions

Parallel Processing: 4 caption styles generated simultaneously

Visual Understanding: Frame extraction + vision model analysis

Audio Transcription: Automatic speech-to-text conversion

Quality Assurance: Automatic validation of generated captions

Error Resilience: Graceful handling of edge cases

Stateful Workflow: LangGraph maintains context across all agents

REST API: Simple integration with any frontend

🤖 How the Agent Graph Works
State Management: A shared state object flows through all agents

Conditional Routing: Decisions based on state determine the next agent

Parallel Execution: Independent agents run concurrently for speed

Error Recovery: Failed agents redirect to error handler

Deterministic Flow: Same input always produces the same processing path

📝 License
MIT

👤 Author
Abhishek Rajput

🙏 Acknowledgments
LangChain & LangGraph teams for the agent orchestration framework
Groq for fast LLM inference
Google for Gemini vision capabilities
OpenAI for Whisper transcription
Happy Captioning! 🎬✨
```
