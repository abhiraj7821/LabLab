import { useState } from "react";
import {
  Star,
  ArrowRight,
  Menu,
  X,
  Play,
  Zap,
  Eye,
  Palette,
  Download,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

// Inline keyframes for marquee and spin-slow
const style = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 10s linear infinite;
  }
  .animate-marquee {
    animation: marquee 20s linear infinite;
  }
`;

const features = [
  {
    icon: <Play className="w-8 h-8" strokeWidth={3} />,
    title: "Multi‑Style Captions",
    desc: "Generate formal, sarcastic, tech‑humor, and general‑humor captions in parallel.",
  },
  {
    icon: <Zap className="w-8 h-8" strokeWidth={3} />,
    title: "AI‑Powered Vision",
    desc: "Gemini 2.5 Flash describes every keyframe – no more guessing what’s in the video.",
  },
  {
    icon: <Eye className="w-8 h-8" strokeWidth={3} />,
    title: "Speech‑to‑Text",
    desc: "OpenAI Whisper transcribes every word. Works even with background noise.",
  },
  {
    icon: <Palette className="w-8 h-8" strokeWidth={3} />,
    title: "Bold & Playful UI",
    desc: "Neo‑brutalist design meets powerful AI. Visual feedback that feels like a game.",
  },
  {
    icon: <Download className="w-8 h-8" strokeWidth={3} />,
    title: "Instant Export",
    desc: "Copy captions, download as text, or share directly from the app.",
  },
  {
    icon: <Star className="w-8 h-8" strokeWidth={3} />,
    title: "Quality Assured",
    desc: "Every caption passes a quality check – length, relevance, and tone verified.",
  },
];

const stats = [
  { value: "4", label: "Caption Styles" },
  { value: "12s", label: "Avg Processing Time" },
  { value: "99%", label: "Uptime" },
  { value: "2k+", label: "Videos Processed" },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-['Space_Grotesk',sans-serif]">
      {/* Inject keyframe styles */}
      <style>{style}</style>

      {/* ────────── Navbar ────────── */}
      <nav className="sticky top-0 z-50 bg-[#FFFDF5] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="border-4 border-black bg-[#FFD93D] px-4 py-2 font-black text-lg uppercase tracking-tight select-none">
              Caption<span className="text-[#FF6B6B]">AI</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6 font-bold uppercase tracking-wide text-sm">
              {["Features", "How it works", "Stats", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="hover:border-black hover:bg-[#FF6B6B] hover:px-2 hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-100"
                >
                  {item}
                </a>
              ))}
              <Link
                to={"/agent"}
                className="h-12 px-6 bg-[#FF6B6B] border-4 flex justify-center items-center border-black font-bold text-sm uppercase shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X strokeWidth={3} /> : <Menu strokeWidth={3} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="lg:hidden border-t-4 border-black pb-4 flex flex-col gap-2">
              {["Features", "How it works", "Stats", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block w-full py-3 px-4 border-4 border-black bg-white font-bold uppercase text-sm shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button className="w-full py-3 px-4 bg-[#FF6B6B] border-4 border-black font-bold text-sm uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ────────── Hero ────────── */}
      <section
        className="relative overflow-hidden border-b-4 border-black bg-[#FFFDF5]"
        style={{
          backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-block border-4 border-black bg-white px-4 py-2 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] -rotate-2 mb-6">
                AI‑Powered Caption Generator
              </div>

              <h1 className="font-black text-5xl sm:text-7xl lg:text-8xl leading-[0.9] uppercase tracking-tight">
                <span
                  className="block"
                  style={{
                    WebkitTextStroke: "2px black",
                    color: "transparent",
                  }}
                >
                  TURN
                </span>
                <span className="block text-[#FF6B6B] -mt-2">VIDEOS</span>
                <span className="block text-black mt-1">INTO CAPTIONS</span>
              </h1>

              <p className="mt-8 font-bold text-xl sm:text-2xl leading-relaxed text-black">
                Drop a video URL, pick your style, and let our multi‑agent AI
                generate
                <strong className="bg-[#FFD93D] px-2 border-2 border-black inline-block mx-1">
                  formal
                </strong>
                ,
                <strong className="bg-[#C4B5FD] px-2 border-2 border-black inline-block mx-1">
                  sarcastic
                </strong>
                , and
                <strong className="bg-[#FF6B6B] px-2 border-2 border-black inline-block mx-1">
                  humorous
                </strong>
                captions in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link
                  to={"/agent"}
                  className="h-16 px-8 bg-[#FF6B6B] border-4 border-black font-black text-lg uppercase shadow-[8px_8px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 flex items-center gap-2 justify-center"
                >
                  Try It Free <ArrowRight strokeWidth={3} className="w-6 h-6" />
                </Link>
                <button className="h-16 px-8 bg-white border-4 border-black font-black text-lg uppercase shadow-[8px_8px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100">
                  Watch Demo
                </button>
              </div>

              {/* Trust marquee */}
              <div className="mt-12 overflow-hidden border-4 border-black bg-[#FFD93D] p-3 relative">
                <div className="flex whitespace-nowrap animate-marquee">
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className="font-black text-sm uppercase tracking-widest mx-8"
                    >
                      ✦ Trusted by 2k+ creators ✦
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: decorative chaos */}
            <div className="hidden lg:flex justify-center items-center relative h-full min-h-[500px]">
              {/* Floating shapes */}
              <div className="absolute top-0 left-10 w-32 h-32 border-4 border-black bg-[#FF6B6B] shadow-[8px_8px_0px_0px_#000] rotate-12 z-20 flex items-center justify-center">
                <Star
                  className="w-16 h-16 text-white"
                  strokeWidth={3}
                  fill="white"
                />
              </div>
              <div className="absolute bottom-10 right-5 w-40 h-40 border-4 border-black bg-[#C4B5FD] shadow-[12px_12px_0px_0px_#000] -rotate-6 z-10 flex items-center justify-center">
                <Play className="w-20 h-20 text-black" strokeWidth={3} />
              </div>
              <div className="absolute top-40 right-20 w-24 h-24 border-4 border-black bg-[#FFD93D] shadow-[6px_6px_0px_0px_#000] rotate-45 z-30" />
              <div className="absolute bottom-20 left-20 border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_#000] rotate-3 z-30">
                <p className="font-black text-5xl">AI</p>
              </div>
              <div className="absolute top-20 right-40 border-4 border-black bg-[#FF6B6B] px-4 py-2 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] -rotate-3 z-40">
                🤖 Agentic
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Features ────────── */}
      <section
        id="features"
        className="py-24 sm:py-32 border-b-4 border-black bg-white relative"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block border-4 border-black bg-[#FF6B6B] px-4 py-2 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] rotate-1 mb-6">
            Features
          </div>
          <h2 className="font-black text-4xl sm:text-6xl lg:text-7xl uppercase leading-none mb-16">
            What Makes It{" "}
            <span className="bg-[#FFD93D] px-4 border-4 border-black inline-block rotate-2">
              Special
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#000] transition-all duration-200"
              >
                <div className="mb-4 border-4 border-black bg-[#C4B5FD] p-3 inline-block shadow-[4px_4px_0px_0px_#000]">
                  {feature.icon}
                </div>
                <h3 className="font-black text-2xl uppercase mb-2">
                  {feature.title}
                </h3>
                <p className="font-bold text-lg leading-relaxed">
                  {feature.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 font-black text-sm uppercase border-2 border-black p-2 w-fit hover:bg-[#FFD93D] transition-colors duration-100 cursor-pointer">
                  Learn More <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── How it works ────────── */}
      <section
        id="how-it-works"
        className="py-24 sm:py-32 border-b-4 border-black bg-[#FFFDF5]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block border-4 border-black bg-[#C4B5FD] px-4 py-2 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] -rotate-2 mb-6">
            How It Works
          </div>
          <h2 className="font-black text-4xl sm:text-6xl lg:text-7xl uppercase leading-none mb-16">
            The Agentic{" "}
            <span className="bg-[#FF6B6B] px-4 border-4 border-black inline-block text-white rotate-1">
              Pipeline
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Video",
                desc: "Drop a URL or upload a file. Our validator checks duration & format.",
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Whisper transcribes audio. Gemini 2.5 Flash describes every frame.",
              },
              {
                step: "03",
                title: "Generate Captions",
                desc: "4 Groq‑powered agents create captions in parallel. Quality check included.",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -top-6 -left-6 border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_#000] rotate-6 z-10 font-black text-4xl">
                  {item.step}
                </div>
                <div className="p-8 pt-16 bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#000] transition-all duration-200">
                  <h3 className="font-black text-3xl uppercase mb-4">
                    {item.title}
                  </h3>
                  <p className="font-bold text-lg leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-6 w-full border-t-4 border-black" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── Stats ────────── */}
      <section
        id="stats"
        className="py-24 sm:py-32 border-b-4 border-black bg-[#FFD93D] relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] text-center hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-200"
              >
                <span className="font-black text-5xl sm:text-6xl uppercase">
                  {stat.value}
                </span>
                <p className="font-bold text-lg mt-2 uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative background dots */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 2px, transparent 2.5px)",
            backgroundSize: "30px 30px",
            opacity: 0.1,
          }}
        />
      </section>

      {/* ────────── CTA ────────── */}
      <section className="py-24 sm:py-32 bg-black text-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="font-black text-4xl sm:text-6xl lg:text-7xl uppercase leading-none mb-8"
            style={{
              textShadow: "6px 6px 0px #FF6B6B",
            }}
          >
            Ready to caption your videos?
          </h2>
          <p className="font-bold text-xl sm:text-2xl mb-12 text-white">
            Join thousands of creators who already automate their captions.
          </p>
          <Link
            to={"/agent"}
            className="h-16 px-8 bg-[#FF6B6B] border-4 border-white font-black text-lg uppercase shadow-[8px_8px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 flex items-center gap-2 justify-center mx-auto"
          >
            Start Captioning <ArrowRight strokeWidth={3} className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* ────────── Footer ────────── */}
      <footer className="bg-[#FFFDF5] border-t-4 border-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="border-4 border-black bg-[#FFD93D] px-4 py-2 font-black text-lg uppercase tracking-tight inline-block mb-4">
                Caption<span className="text-[#FF6B6B]">AI</span>
              </div>
              <p className="font-bold text-lg leading-relaxed">
                Multi‑agent AI that turns your videos into creative captions.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Product",
                items: ["Features", "Pricing", "API", "Changelog"],
              },
              {
                title: "Company",
                items: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Legal",
                items: ["Privacy", "Terms", "Cookies", "Licenses"],
              },
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-black text-lg uppercase border-b-4 border-black pb-2 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-bold text-lg hover:bg-[#C4B5FD] hover:px-2 hover:border-2 hover:border-black transition-all duration-100"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t-4 border-black flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-bold text-lg">
              © 2026 CaptionAI. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["Twitter", "GitHub", "Discord"].map((s) => (
                <div
                  key={s}
                  className="border-4 border-black p-3 bg-white shadow-[4px_4px_0px_0px_#000] hover:bg-[#FFD93D] transition-colors duration-100 cursor-pointer"
                >
                  <span className="font-black text-sm uppercase">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
