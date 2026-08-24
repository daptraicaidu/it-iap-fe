import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ActiveBanner } from "../../services/user/bannerService";

interface BannerModalProps {
  banner: ActiveBanner | null;
}

const isValidText = (str?: string | null): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
    return false;
  }
  return true;
};

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

  // Clicking 'X' button dismisses for 24 hours
  const handleDismiss24h = () => {
    const twentyFourHours = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(
      `banner_dismissed_until_${bannerId}`,
      twentyFourHours.toString()
    );
    setIsOpen(false);
  };

  // Clicking outside backdrop only closes for current session without saving 24h
  const handleBackdropClose = () => {
    setIsOpen(false);
  };

  const hasTitle = isValidText(banner.title);
  const hasContent = isValidText(banner.content);
  const hasImage = Boolean(banner.imageUrl && banner.imageUrl.trim());
  const isImageOnly = !hasTitle && !hasContent && hasImage;

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
          onClick={handleBackdropClose}
        />

        {/* Modal Card */}
        {isImageOnly ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.1 }}
            className="relative z-10 max-h-[85vh] max-w-[90vw] md:max-w-2xl lg:max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-zinc-950/30 p-1 shadow-2xl backdrop-blur-xs"
          >
            {/* Close button - Clicking X dismisses for 24h */}
            <button
              type="button"
              onClick={handleDismiss24h}
              className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/70 text-white backdrop-blur-md transition-all hover:bg-zinc-900 hover:scale-105 active:scale-95 shadow-lg border border-white/20"
              title="Đóng trong 24h"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Banner Full Image (Aspect ratio preserved, not cropped) */}
            <img
              src={banner.imageUrl}
              alt="Banner"
              className="h-auto max-h-[80vh] w-full object-contain rounded-2xl shadow-sm"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.1 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/90 bg-white pb-6 shadow-2xl"
          >
            {/* Subtle top decorative aura */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent blur-2xl" />

            {/* Close button top right - Clicking X dismisses for 24h */}
            <button
              type="button"
              onClick={handleDismiss24h}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100/80 text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
              title="Đóng trong 24h"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            {hasTitle && (
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 pr-8 leading-snug">
                  {banner.title}
                </h3>
              </div>
            )}

            {/* Modal Content */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-3 space-y-4">
              {/* Banner Image */}
              {hasImage && (
                <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 shadow-xs flex items-center justify-center">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || "Banner Image"}
                    className="max-h-72 w-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                </div>
              )}

              {/* Banner Body Text */}
              {hasContent && (
                <div className="rounded-2xl bg-zinc-50/80 border border-zinc-100 p-4">
                  <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                    {banner.content}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default BannerModal;
