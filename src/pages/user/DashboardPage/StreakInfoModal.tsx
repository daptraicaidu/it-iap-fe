import React from "react";
import { useTranslation } from "react-i18next";
import { X, Flame, Sparkles, Trophy } from "lucide-react";

interface StreakInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak?: number;
  longestStreak?: number;
}

const MILESTONES = [1, 3, 7, 14, 30];

const StreakInfoModal: React.FC<StreakInfoModalProps> = ({
  isOpen,
  onClose,
  currentStreak = 0,
  longestStreak = 0,
}) => {
  const { t, i18n } = useTranslation("Dashboard");
  const isEn = i18n.language?.startsWith("en");

  if (!isOpen) return null;

  const nextMilestone = MILESTONES.find((m) => m > currentStreak) ?? null;

  // Calculate progress percent along milestone nodes (0%, 25%, 50%, 75%, 100%)
  const calculateProgress = (): number => {
    if (currentStreak <= 0) return 0;
    if (currentStreak >= 30) return 100;
    for (let i = 0; i < MILESTONES.length - 1; i++) {
      const start = MILESTONES[i];
      const end = MILESTONES[i + 1];
      if (currentStreak >= start && currentStreak < end) {
        const stepFraction = (currentStreak - start) / (end - start);
        return (i / (MILESTONES.length - 1)) * 100 + stepFraction * (100 / (MILESTONES.length - 1));
      }
    }
    return 0;
  };

  const progressPercent = calculateProgress();

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

      {/* Milestone Journey Roadmap */}
      <div className="mt-4 rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 to-orange-50/50 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-2.5">
          <span className="flex items-center gap-1.5 text-amber-950">
            <Sparkles className="h-3.5 w-3.5 text-orange-500 fill-orange-500/30" />
            <span>{t("streakModal.milestonesTitle", { defaultValue: "Hành trình cột mốc" })}</span>
          </span>
          {nextMilestone ? (
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100/90 border border-orange-200 px-2 py-0.5 rounded-full">
              {t("streakModal.targetLabel", { defaultValue: "Mục tiêu" })}: {nextMilestone} {isEn ? "days" : "ngày"}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full">
              Max 🏆
            </span>
          )}
        </div>

        {/* Track Line and Milestone Circular Nodes */}
        <div className="relative flex items-center justify-between px-2 pt-1 pb-1">
          {/* Background Gray Track */}
          <div className="absolute top-4 left-5 right-5 h-1 -translate-y-1/2 bg-zinc-200/80 rounded-full z-0" />

          {/* Active Orange Track */}
          <div
            className="absolute top-4 left-5 h-1 -translate-y-1/2 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full z-0 transition-all duration-500"
            style={{ width: `calc(${progressPercent}% * (100% - 40px) / 100)` }}
          />

          {MILESTONES.map((m) => {
            const isAchieved = currentStreak >= m;
            const isNext = m === nextMilestone;

            return (
              <div key={m} className="relative z-10 flex flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                    isAchieved
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs ring-2 ring-orange-200/90"
                      : isNext
                      ? "border-2 border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-300 shadow-xs animate-pulse"
                      : "border border-zinc-200 bg-white text-zinc-400 font-bold"
                  }`}
                >
                  {m}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight ${
                    isAchieved
                      ? "text-orange-700"
                      : isNext
                      ? "text-orange-600 font-extrabold"
                      : "text-zinc-400"
                  }`}
                >
                  {m}{isEn ? "d" : "N"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Motivational Status Footer */}
        <p className="mt-2.5 text-center text-[11px] font-semibold text-orange-900 bg-orange-100/50 py-1.5 px-2.5 rounded-lg border border-orange-200/60 leading-tight">
          {nextMilestone
            ? isEn
              ? `${nextMilestone - currentStreak} more day${nextMilestone - currentStreak > 1 ? "s" : ""} to reach the ${nextMilestone}-day milestone! 🔥`
              : `Còn ${nextMilestone - currentStreak} ngày nữa để chạm mốc ${nextMilestone} ngày liên tiếp! 🔥`
            : isEn
            ? "Awesome! You have achieved all major milestones! 🏆"
            : "Xuất sắc! Bạn đã chinh phục mọi cột mốc thử thách! 🏆"}
        </p>
      </div>

      {/* Numbered Rule Steps (1, 2, 3 in circles) */}
      <div className="mt-3.5 space-y-2.5 rounded-xl border border-zinc-100 bg-zinc-50/90 p-3.5">
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
