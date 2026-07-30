import React, { useEffect, useState } from "react";
import { X, Clock, EyeOff } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-4">
          <h3 className="text-base font-bold text-zinc-900 tracking-tight pr-4 line-clamp-1">
            {banner.title || "Thông báo"}
          </h3>

          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Banner Image */}
          {banner.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 shadow-inner">
              <img
                src={banner.imageUrl}
                alt={banner.title || "Banner Image"}
                className="max-h-64 w-full object-cover"
              />
            </div>
          )}

          {/* Banner Body Text */}
          {banner.content && (
            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
              {banner.content}
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-zinc-100 bg-zinc-50/80 px-5 py-4">
          <button
            type="button"
            onClick={handleDismiss24h}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>Tắt trong 24h</span>
          </button>

          <button
            type="button"
            onClick={handleDismissPermanently}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98]"
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>Không hiển thị lại</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
