import { useState, useRef } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Copy,
  RefreshCw,
  Star,
  Video,
  Mic,
  Camera,
  Brain,
  Sparkles,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Download,
  RotateCcw,
  Zap,
} from "lucide-react";

import { Link } from "react-router-dom";

import { API_ENDPOINTS } from "../config/api";

/**
 * The main Agent screen for video captioning.
 * Neo-brutalist design: thick borders, hard shadows, Space Grotesk, halftone backgrounds, sticker layering.
 */

// Simulated agentic steps matching the backend pipeline
const AGENT_STEPS = [
  { id: "validate", label: "Validator", icon: FileText },
  { id: "download", label: "Video Fetch", icon: Download },
  { id: "audio", label: "Audio Extract", icon: Mic },
  { id: "frames", label: "Frame Extractor", icon: Camera },
  { id: "transcribe", label: "Transcriber", icon: Mic },
  { id: "vision", label: "Vision Analyzer", icon: Camera },
  { id: "merge", label: "Content Merger", icon: Brain },
  { id: "generate", label: "Caption Generators", icon: Sparkles },
  { id: "quality", label: "Quality Check", icon: ClipboardCheck },
];

const STYLE_COLORS = {
  formal: { bg: "#FFD93D", text: "black", emoji: "📄" },
  sarcastic: { bg: "#FF6B6B", text: "white", emoji: "😏" },
  "humorous-tech": { bg: "#C4B5FD", text: "black", emoji: "💻" },
  "humorous-nontech": { bg: "#FFD93D", text: "black", emoji: "😂" },
};

const CAPTION_STYLES = [
  "formal",
  "sarcastic",
  "humorous-tech",
  "humorous-nontech",
];

export default function Agent() {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedStyles, setSelectedStyles] = useState(["formal", "sarcastic"]);
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(-1); // for visual flow
  const flowTimer = useRef(null);

  const handleStyleToggle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  };

  const startStepAnimation = () => {
    // Advance through steps sequentially to simulate the agentic flow
    let i = 0;
    setActiveStepIndex(0);
    flowTimer.current = setInterval(() => {
      i++;
      if (i >= AGENT_STEPS.length) {
        clearInterval(flowTimer.current);
        setActiveStepIndex(AGENT_STEPS.length - 1);
        return;
      }
      setActiveStepIndex(i);
    }, 500); // each step ~0.5s, roughly matches 4-5s processing time
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return alert("Please enter a video URL.");
    if (selectedStyles.length === 0)
      return alert("Select at least one caption style.");

    setLoading(true);
    setError(null);
    setResults(null);
    startStepAnimation();

    const payload = {
      videoUrl: videoUrl.trim(),
      styles: selectedStyles,
      ...(duration && { duration: parseInt(duration, 10) || 60 }),
    };

    try {
      const res = await fetch(API_ENDPOINTS.CAPTION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      clearInterval(flowTimer.current);
      if (data.status === "success") {
        setResults(data.data.results);
        setActiveStepIndex(AGENT_STEPS.length - 1); // all steps done
      } else {
        setError(data.message || "Captioning failed");
        setActiveStepIndex(-1); // hide flow
      }
    } catch (err) {
      clearInterval(flowTimer.current);
      setError("Network error. Is the backend running?");
      setActiveStepIndex(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (caption) => {
    navigator.clipboard.writeText(caption);
    alert("Caption copied!");
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setActiveStepIndex(-1);
    setVideoUrl("");
    setSelectedStyles(["formal", "sarcastic"]);
    setDuration("");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-['Space_Grotesk',sans-serif]">
      {/* Inject halftone pattern for specific backgrounds */}
      <style>{`
        .dot-bg { background-image: radial-gradient(#000 1.5px, transparent 1.5px); background-size: 20px 20px; }
        .grid-bg { background-size: 40px 40px; background-image: linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px); }
      `}</style>

      {/* ── Header (minimal, just logo) ── */}
      <header className="border-b-4 border-black bg-[#FFFDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="border-4 border-black bg-[#FFD93D] px-4 py-2 font-black text-lg uppercase tracking-tight select-none"
          >
            Caption<span className="text-[#FF6B6B]">AI</span>
          </Link>
          <Link
            to={"/"}
            className="border-4 border-black bg-white px-4 py-2 font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] rotate-1"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* ── Input Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Form */}
          <div>
            <div className="inline-block border-4 border-black bg-[#FF6B6B] px-4 py-2 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] -rotate-2 mb-6">
              Upload & Generate
            </div>
            <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl uppercase leading-none mb-8">
              Turn{" "}
              <span className="bg-[#C4B5FD] px-3 border-4 border-black inline-block rotate-1">
                Video
              </span>{" "}
              into Captions
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Video URL Input */}
              <div>
                <label className="block font-black text-lg uppercase mb-2">
                  Video URL <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full h-16 px-4 border-4 border-black font-bold text-lg placeholder:text-black/40 bg-white focus:bg-[#FFD93D] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:ring-0 transition-colors duration-100"
                  required
                />
              </div>

              {/* Duration (optional) */}
              <div>
                <label className="block font-black text-lg uppercase mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="w-full sm:w-1/2 h-16 px-4 border-4 border-black font-bold text-lg placeholder:text-black/40 bg-white focus:bg-[#FFD93D] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:ring-0 transition-colors duration-100"
                />
              </div>

              {/* Caption Styles */}
              <div>
                <label className="block font-black text-lg uppercase mb-4">
                  Caption Styles
                </label>
                <div className="flex flex-wrap gap-3">
                  {CAPTION_STYLES.map((style) => {
                    const isSelected = selectedStyles.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => handleStyleToggle(style)}
                        className={`px-4 py-2 border-4 border-black font-bold text-sm uppercase shadow-[4px_4px_0px_0px_#000] transition-all duration-100 ${
                          isSelected
                            ? "bg-[#FFD93D] -translate-x-[1px] -translate-y-[1px] shadow-none"
                            : "bg-white"
                        }`}
                      >
                        {style.replace("-", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading}
                className="h-16 px-8 bg-[#FF6B6B] border-4 border-black font-black text-lg uppercase text-white shadow-[8px_8px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    Generate Captions{" "}
                    <Zap className="w-6 h-6" strokeWidth={3} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Decorative chaos or Agent Flow Visualization */}
          <div className="relative min-h-[400px]">
            {loading || activeStepIndex >= 0 ? (
              <div className="p-6 bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] rotate-1">
                <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-2">
                  <Brain className="w-8 h-8" strokeWidth={3} /> Agentic Flow
                </h2>
                <div className="space-y-2">
                  {AGENT_STEPS.map((step, idx) => {
                    const isCompleted = idx < activeStepIndex;
                    const isCurrent = idx === activeStepIndex && loading;
                    const isPending = idx > activeStepIndex;
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 px-3 py-2 border-2 border-black font-bold text-sm uppercase transition-all duration-100 ${
                          isCompleted
                            ? "bg-[#C4B5FD] line-through decoration-2"
                            : isCurrent
                              ? "bg-[#FFD93D] shadow-[4px_4px_0px_0px_#000]"
                              : "bg-white"
                        }`}
                      >
                        <step.icon className="w-5 h-5" strokeWidth={3} />
                        <span className="flex-1">{step.label}</span>
                        {isCompleted && (
                          <Check
                            className="w-5 h-5 text-green-600"
                            strokeWidth={3}
                          />
                        )}
                        {isCurrent && (
                          <Loader2
                            className="w-5 h-5 animate-spin"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-32 h-32 border-4 border-black bg-[#FF6B6B] shadow-[8px_8px_0px_0px_#000] rotate-12 flex items-center justify-center">
                    <Star
                      className="w-16 h-16 text-white"
                      strokeWidth={3}
                      fill="white"
                    />
                  </div>
                  <div className="w-32 h-32 border-4 border-black bg-[#C4B5FD] shadow-[8px_8px_0px_0px_#000] -rotate-6 flex items-center justify-center">
                    <Video className="w-16 h-16" strokeWidth={3} />
                  </div>
                  <div className="w-32 h-32 border-4 border-black bg-[#FFD93D] shadow-[8px_8px_0px_0px_#000] rotate-45 flex items-center justify-center">
                    <Mic className="w-16 h-16" strokeWidth={3} />
                  </div>
                  <div className="w-32 h-32 border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] -rotate-12 flex items-center justify-center">
                    <Camera className="w-16 h-16" strokeWidth={3} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Error Alert ── */}
        {error && (
          <div className="mb-16 p-6 border-4 border-black bg-[#FF6B6B] text-white font-bold text-xl shadow-[8px_8px_0px_0px_#000] flex items-center gap-4">
            <AlertTriangle className="w-10 h-10" strokeWidth={3} />
            <span>{error}</span>
            <button
              onClick={handleReset}
              className="ml-auto h-12 px-4 border-4 border-white font-black uppercase shadow-[4px_4px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <RotateCcw className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
        )}

        {/* ── Results Grid ── */}
        {results && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-4xl sm:text-5xl uppercase leading-none">
                Your{" "}
                <span className="bg-[#FFD93D] px-3 border-4 border-black inline-block rotate-2">
                  Captions
                </span>
              </h2>
              <button
                onClick={handleReset}
                className="h-14 px-6 bg-white border-4 border-black font-black text-sm uppercase shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" strokeWidth={3} /> New Video
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map((item, idx) => {
                const styleConfig = STYLE_COLORS[item.style] || {
                  bg: "#FFF",
                  text: "black",
                  emoji: "🎬",
                };
                return (
                  <div
                    key={idx}
                    className="group relative p-8 bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#000] transition-all duration-200"
                  >
                    {/* Style Badge */}
                    <div
                      className="absolute -top-6 -right-6 border-4 border-black px-4 py-2 font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] rotate-3 z-10"
                      style={{
                        backgroundColor: styleConfig.bg,
                        color: styleConfig.text,
                      }}
                    >
                      {styleConfig.emoji} {item.style.replace("-", " ")}
                    </div>

                    {/* Caption Text */}
                    <p className="font-bold text-xl leading-relaxed mt-4 mb-6">
                      {item.caption}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopy(item.caption)}
                        className="h-12 px-4 border-4 border-black bg-[#FFD93D] font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" strokeWidth={3} /> Copy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
