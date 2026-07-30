import React, { useState } from "react";
import { X } from "lucide-react";

interface MarqueeBarProps {
  text: string;
}

const MarqueeBar: React.FC<MarqueeBarProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!text || !text.trim() || !isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: inline-flex;
          white-space: nowrap;
          animation: marqueeScroll 15s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="relative z-40 flex items-center overflow-hidden border-b border-zinc-200/80 bg-zinc-100/90 px-3 py-2 text-xs font-medium text-zinc-800 sm:px-4">
        {/* Marquee Track Container */}
        <div className="relative flex-1 overflow-hidden">
          <div className="marquee-track">
            <span className="mx-6 text-zinc-800 font-medium">{text}</span>
            <span className="mx-2 text-zinc-400">•</span>
            <span className="mx-6 text-zinc-800 font-medium">{text}</span>
            <span className="mx-2 text-zinc-400">•</span>
            <span className="mx-6 text-zinc-800 font-medium">{text}</span>
            <span className="mx-2 text-zinc-400">•</span>
            <span className="mx-6 text-zinc-800 font-medium">{text}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="z-10 shrink-0 ml-2 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-800"
          title="Ẩn thông báo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
};

export default MarqueeBar;
