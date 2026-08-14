import React from "react";
import { useTranslation } from "react-i18next";
import { X, Flame, Sparkles, Trophy } from "lucide-react";

interface StreakInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak?: number;
  longestStreak?: number;
}

const StreakInfoModal: React.FC<StreakInfoModalProps> = ({
  isOpen,
  onClose,
  currentStreak = 0,
  longestStreak = 0,
}) => {
  const { t } = useTranslation("Dashboard");

  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 top-full mt-2.5 z-40 w-[320px] sm:w-[360px] rounded-2xl border border-zinc-200 bg-[#fff9f0] p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes flameFlicker {
          0%, 100% {
            transform: scale(1) rotate(-1.5deg);
            filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.5)) drop-shadow(0 0 10px rgba(234, 88, 12, 0.3));
          }
          20% {
            transform: scale(1.06, 1.14) rotate(1.5deg) translateY(-1.5px);
            filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.85)) drop-shadow(0 0 14px rgba(234, 88, 12, 0.5));
          }
          40% {
            transform: scale(0.96, 0.98) rotate(-1deg);
            filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.6)) drop-shadow(0 0 8px rgba(234, 88, 12, 0.3));
          }
          60% {
            transform: scale(1.08, 1.18) rotate(2deg) translateY(-2px);
            filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.75)) drop-shadow(0 0 16px rgba(249, 115, 22, 0.6));
          }
          80% {
            transform: scale(0.98, 1.04) rotate(-0.5deg);
            filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.5)) drop-shadow(0 0 11px rgba(234, 88, 12, 0.4));
          }
        }
        @keyframes sparkRise1 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: translate(-8px, -24px) scale(1.1); opacity: 0; }
        }
        @keyframes sparkRise2 {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(7px, -28px) scale(1.2); opacity: 0; }
        }
        .animate-flame-flicker {
          animation: flameFlicker 1.4s ease-in-out infinite;
          transform-origin: 50% 90%;
        }
        .animate-spark-1 {
          animation: sparkRise1 1.8s ease-out infinite;
        }
        .animate-spark-2 {
          animation: sparkRise2 2.2s ease-out 0.6s infinite;
        }
      `}</style>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        title="Đóng"
        className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Top Big Streak Flame Icon */}
      <div className="text-center pt-1">
        <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 border border-orange-200/80 shadow-md shadow-orange-500/15 overflow-visible">
          {/* Flame Spark Particles */}
          <span className="animate-spark-1 pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 top-3 left-3" />
          <span className="animate-spark-2 pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-500 top-2 right-3" />

          <Flame className="animate-flame-flicker h-9 w-9 text-orange-500 fill-orange-500/40" />
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
            <Flame className="h-3 w-3 fill-current" />
          </div>
        </div>

        {/* Current Streak Count Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/90 px-3 py-0.5 text-xs font-bold text-orange-800 shadow-xs mb-2">
          <Flame className="h-3 w-3 text-orange-600 fill-current" />
          <span>
            {currentStreak} {t("streakModal.days", { count: currentStreak })}
          </span>
        </div>

        {/* Main Slogan & Subtitle */}
        <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight leading-snug">
          {t("streakModal.slogan")}
        </h3>
        <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
          {t("streakModal.subtitle")}
        </p>
      </div>

      {/* Numbered Rule Steps (1, 2, 3 in circles) */}
      <div className="mt-5 space-y-2.5 rounded-xl border border-zinc-100 bg-zinc-50/90 p-3.5">
        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-[11px] font-extrabold text-amber-900 shadow-xs mt-0.5">
            1
          </div>
          <div className="flex-1 text-xs font-medium text-zinc-700 leading-snug pt-0.5">
            {t("streakModal.steps.step1")}
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-[11px] font-extrabold text-orange-900 shadow-xs mt-0.5">
            2
          </div>
          <div className="flex-1 text-xs font-medium text-zinc-700 leading-snug pt-0.5">
            {t("streakModal.steps.step2")}
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-100 text-[11px] font-extrabold text-rose-900 shadow-xs mt-0.5">
            3
          </div>
          <div className="flex-1 text-xs font-medium text-zinc-700 leading-snug pt-0.5">
            {t("streakModal.steps.step3")}
          </div>
        </div>
      </div>

      {/* Stats footer (if longest streak available) */}
      {longestStreak > 0 && (
        <div className="mt-3.5 flex items-center justify-between px-1 text-[11px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>{t("streakModal.longestStreak")}:</span>
          </span>
          <span className="font-bold text-zinc-800">
            {longestStreak} {t("streakModal.days", { count: longestStreak })}
          </span>
        </div>
      )}
    </div>
  );
};

export default StreakInfoModal;
