import React, { useState } from "react";
import { X, Megaphone } from "lucide-react";

interface MarqueeBarProps {
  text: string;
}

const MarqueeBar: React.FC<MarqueeBarProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!text || !text.trim() || !isVisible) return null;

  // Render multiple copies per track so it always covers ultrawide screens (>2560px)
  const repeatCount = 4;
  const items = Array.from({ length: repeatCount });

  return (
    <>
      <style>{`
        @keyframes marqueeLoop {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .marquee-track-smooth {
          display: flex;
          flex-shrink: 0;
          min-width: 100%;
          align-items: center;
          justify-content: space-around;
          animation: marqueeLoop 28s linear infinite;
        }
        .marquee-wrapper:hover .marquee-track-smooth {
          animation-play-state: paused;
        }
      `}</style>
      <div className="relative z-40 flex items-center overflow-hidden border-b border-zinc-800 bg-zinc-900 py-2 text-xs font-medium text-zinc-200">
        {/* Left Fade Gradient Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-16 bg-gradient-to-r from-zinc-900 to-transparent" />

        {/* Marquee Infinite Track Wrapper */}
        <div className="marquee-wrapper relative flex flex-1 overflow-hidden select-none">
          {/* Primary Track */}
          <div className="marquee-track-smooth">
            {items.map((_, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-zinc-700/60">
                  {/* <Megaphone className="h-3 w-3 shrink-0" /> */}
                  <span>Welcome</span>
                </span>
                <span className="text-xs font-medium text-zinc-100 tracking-wide">
                  {text}
                </span>
                <span className="ml-4 text-zinc-600 font-bold">•</span>
              </div>
            ))}
          </div>

          {/* Secondary Track (Cloned for seamless infinite loop without stutter) */}
          <div className="marquee-track-smooth" aria-hidden="true">
            {items.map((_, idx) => (
              <div key={`copy-${idx}`} className="flex items-center gap-2.5 px-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-zinc-700/60">
                  {/* <Megaphone className="h-3 w-3 shrink-0" /> */}
                  <span>Xin chào</span>
                </span>
                <span className="text-xs font-medium text-zinc-100 tracking-wide">
                  {text}
                </span>
                <span className="ml-4 text-zinc-600 font-bold">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Fade Gradient Mask */}
        <div className="pointer-events-none absolute right-10 top-0 bottom-0 z-10 w-8 sm:w-16 bg-gradient-to-l from-zinc-900 to-transparent" />

        {/* Dismiss Button */}
        <div className="relative z-20 flex items-center px-3 bg-zinc-900">
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            title="Ẩn thông báo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default MarqueeBar;
