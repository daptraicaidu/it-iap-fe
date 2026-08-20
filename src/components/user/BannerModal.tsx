import React, { useEffect, useState } from "react";
import { X, Clock, EyeOff, Sparkles, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ActiveBanner } from "../../services/user/bannerService";

interface BannerModalProps {
  banner: ActiveBanner | null;
}

const BannerModal: React.FC<BannerModalProps> = ({ banner }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!banner || (!banner.title && !banner.content && !banner.imageUrl)) {
      setIsOpen(false);
      return;
    }

    const bannerId = banner.id ? banner.id.toString() : "active";

    // 1. Check if permanently dismissed for this bannerId
    const isPermanentlyDismissed = localStorage.getItem(
      `banner_dismissed_permanently_${bannerId}`
    );
    if (isPermanentlyDismissed === "true") {
      setIsOpen(false);
      return;
    }

    // 2. Check if dismissed for 24 hours for this bannerId
    const dismissedUntil = localStorage.getItem(
      `banner_dismissed_until_${bannerId}`
    );
    if (dismissedUntil) {
      const untilTimestamp = parseInt(dismissedUntil, 10);
      if (!isNaN(untilTimestamp) && Date.now() < untilTimestamp) {
        setIsOpen(false);
        return;
      }
    }

    // Otherwise, display banner
    setIsOpen(true);
  }, [banner]);

  if (!isOpen || !banner) return null;

  const bannerId = banner.id ? banner.id.toString() : "active";

  const handleDismiss24h = () => {
    const twentyFourHours = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(
      `banner_dismissed_until_${bannerId}`,
      twentyFourHours.toString()
    );
    setIsOpen(false);
  };

  const handleDismissPermanently = () => {
    localStorage.setItem(`banner_dismissed_permanently_${bannerId}`, "true");
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop Overlay with refined blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md"
          onClick={handleClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.1 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-2xl"
        >
          {/* Subtle top decorative aura */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent blur-2xl" />

          {/* Close button top right */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100/80 text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            title="Đóng"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="px-6 pt-6 pb-2">
            {/* <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Thông báo từ hệ thống</span>
            </div> */}

            <h3 className="text-xl font-bold tracking-tight text-zinc-900 pr-8 leading-snug">
              {banner.title || "Welcome"}
            </h3>
          </div>

          {/* Modal Content */}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-3 space-y-4">
            {/* Banner Image */}
            {banner.imageUrl && (
              <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 shadow-xs">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Banner Image"}
                  className="max-h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}

            {/* Banner Body Text */}
            {banner.content && (
              <div className="rounded-2xl bg-zinc-50/80 border border-zinc-100 p-4">
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {banner.content}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4">
            <button
              type="button"
              onClick={handleDismiss24h}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
            >
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span>Tắt trong 24h</span>
            </button>

            <button
              type="button"
              onClick={handleDismissPermanently}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 active:scale-95"
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span>Không hiển thị lại</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BannerModal;
