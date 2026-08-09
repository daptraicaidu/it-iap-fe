import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import type {
  NotificationResponse,
} from "../services/user/notificationService";
import useNotificationStore from "../store/notificationStore";

// ── Helpers ──
const getTimeAgo = (
  dateStr: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 1) return t("justNow");
  if (diffMinutes < 60) return t("minuteAgo", { count: diffMinutes });
  if (diffHours < 24) return t("hourAgo", { count: diffHours });
  if (diffDays < 7) return t("dayAgo", { count: diffDays });
  return t("weekAgo", { count: diffWeeks });
};

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case "SYSTEM":
      return "⚙️";
    case "ADMIN":
      return "🛡️";
    case "WARNING":
      return "⚠️";
    case "PROMO":
      return "🎁";
    case "REPORT":
      return "🚩";
    case "FEEDBACK":
      return "📝";
    case "STREAK":
      return "🔥";
    default:
      return "🔔";
  }
};

const getNotificationBadge = (
  type: string,
  t: (key: string) => string
): { label: string; className: string } => {
  switch (type) {
    case "SYSTEM":
      return { label: t("type.system"), className: "bg-zinc-100 text-zinc-600" };
    case "ADMIN":
      return { label: t("type.admin"), className: "bg-violet-50 text-violet-700" };
    case "WARNING":
      return { label: t("type.warning"), className: "bg-amber-50 text-amber-700" };
    case "PROMO":
      return { label: t("type.promo"), className: "bg-pink-50 text-pink-700" };
    case "REPORT":
      return { label: t("type.report"), className: "bg-sky-50 text-sky-700" };
    case "FEEDBACK":
      return { label: t("type.feedback"), className: "bg-cyan-50 text-cyan-700" };
    case "STREAK":
      return { label: t("type.streak"), className: "bg-orange-50 text-orange-700" };
    default:
      return { label: t("type.other"), className: "bg-zinc-100 text-zinc-600" };
  }
};

// ── Skeleton Component ──
const NotificationSkeleton = () => (
  <div className="flex gap-3 px-4 py-3 animate-pulse">
    <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-3/4 rounded-full bg-zinc-200" />
      <div className="h-3 w-full rounded-full bg-zinc-200" />
      <div className="h-2.5 w-1/3 rounded-full bg-zinc-200" />
    </div>
  </div>
);

// ── Main Component ──
const NotificationDropdown = () => {
  const { t } = useTranslation("Notification");
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const page = useNotificationStore((s) => s.page);
  const hasNext = useNotificationStore((s) => s.hasNext);
  const isLoadingMore = useNotificationStore((s) => s.isLoadingMore);

  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const readAll = useNotificationStore((s) => s.readAll);
  const flushReadQueue = useNotificationStore((s) => s.flushReadQueue);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Handle opening a notification item
  const handleNotificationView = useCallback(
    (notification: NotificationResponse) => {
      markAsRead(notification.id);
    },
    [markAsRead]
  );

  // Read all
  const handleReadAll = useCallback(() => {
    readAll();
  }, [readAll]);

  // Toggle dropdown
  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      fetchNotifications(1);
    }
  };

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!isOpen) return;

    const sentinel = sentinelRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isLoadingMore && !isLoading) {
          fetchNotifications(page + 1, true);
        }
      },
      { root: container, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, hasNext, isLoadingMore, isLoading, page, fetchNotifications]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Flush queue on unmount
  useEffect(() => {
    return () => {
      flushReadQueue();
    };
  }, [flushReadQueue]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        type="button"
        id="notification-bell"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="relative rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="menu"
          className="fixed inset-x-3 top-16 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[480px] sm:w-[380px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <h3 className="text-base font-semibold text-zinc-900">
              {t("title")}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleReadAll}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("readAll")}
              </button>
            )}
          </div>

          {/* Content */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              // Skeleton loading
              <div className="divide-y divide-zinc-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <NotificationSkeleton key={i} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                  <Bell className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-700">
                  {t("empty")}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {t("emptyDescription")}
                </p>
              </div>
            ) : (
              // Notification list
              <div className="divide-y divide-zinc-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onView={handleNotificationView}
                    t={t}
                  />
                ))}

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-1" />

                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("loadMore")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100">
            <a
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-sky-600 transition hover:bg-sky-50/50"
            >
              {t("showAll")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Notification Item ──
interface NotificationItemProps {
  notification: NotificationResponse;
  onView: (n: NotificationResponse) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const NotificationItem = ({
  notification,
  onView,
  t,
}: NotificationItemProps) => {
  const handleClick = () => {
    onView(notification);
  };

  return (
    <div
      className={`flex gap-3 px-4 py-3 transition cursor-pointer hover:bg-zinc-50 ${
        !notification.read ? "bg-blue-50/40" : ""
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
          !notification.read ? "bg-indigo-100" : "bg-zinc-100"
        }`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {(() => {
            const badge = getNotificationBadge(notification.type, t);
            return (
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${badge.className}`}>
                {badge.label}
              </span>
            );
          })()}
          <p
            className={`text-sm leading-snug truncate ${
              !notification.read
                ? "font-semibold text-zinc-900"
                : "font-normal text-zinc-700"
            }`}
          >
            {notification.title}
          </p>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2 break-words">
          {notification.content}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p
            className={`text-[11px] ${
              !notification.read
                ? "font-medium text-blue-600"
                : "text-zinc-400"
            }`}
          >
            {getTimeAgo(notification.createdAt, t)}
          </p>
          {notification.link && (
            <a
              href={notification.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {t("viewLink")}
            </a>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="flex items-center">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
