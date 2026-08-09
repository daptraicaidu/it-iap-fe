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
        <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 border border-orange-200/80 shadow-md shadow-orange-500/10">
          <Flame className="h-8 w-8 text-orange-500 fill-orange-400/20 animate-pulse" />
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
            <Flame className="h-3 w-3" />
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
