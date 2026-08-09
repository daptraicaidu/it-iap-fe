import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, ArrowLeft, ExternalLink, Loader2, X } from "lucide-react";
import type {
  NotificationResponse,
} from "../../../services/user/notificationService";
import useNotificationStore from "../../../store/notificationStore";

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

// ── Skeleton ──
const NotificationSkeleton = () => (
  <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 animate-pulse">
    <div className="h-11 w-11 shrink-0 rounded-full bg-zinc-200" />
    <div className="flex-1 space-y-2.5 py-0.5">
      <div className="h-4 w-2/3 rounded-full bg-zinc-200" />
      <div className="h-3.5 w-full rounded-full bg-zinc-200" />
      <div className="h-3 w-1/4 rounded-full bg-zinc-200" />
    </div>
  </div>
);

// ── Page Component ──
const NotificationPage = () => {
  const { t } = useTranslation("Notification");
  const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const hasFetched = useNotificationStore((s) => s.hasFetched);
  const page = useNotificationStore((s) => s.page);
  const hasNext = useNotificationStore((s) => s.hasNext);
  const isLoadingMore = useNotificationStore((s) => s.isLoadingMore);

  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const readAll = useNotificationStore((s) => s.readAll);
  const flushReadQueue = useNotificationStore((s) => s.flushReadQueue);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFetched) {
      fetchNotifications(1);
    }
  }, [hasFetched, fetchNotifications]);

  // Handle click on notification
  const handleNotificationView = useCallback(
    (notification: NotificationResponse) => {
      markAsRead(notification.id);
      setSelectedNotification(notification);
    },
    [markAsRead]
  );

  // Read all
  const handleReadAll = useCallback(() => {
    readAll();
  }, [readAll]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isLoadingMore && !isLoading) {
          fetchNotifications(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNext, isLoadingMore, isLoading, page, fetchNotifications]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      flushReadQueue();
    };
  }, [flushReadQueue]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              {t("page.title")}
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                  {unreadCount} {t("unread")}
                </span>
              )}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              {t("page.description")}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleReadAll}
            className="flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 border border-zinc-200 transition hover:bg-zinc-50 sm:self-auto"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            {t("readAll")}
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {isLoading ? (
          // Skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <Bell className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-base font-semibold text-zinc-700">
              {t("empty")}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationCard
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
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loadMore")}
              </div>
            )}

            {/* End of list */}
            {!hasNext && notifications.length > 0 && (
              <div className="flex justify-center pt-4 pb-2">
                <p className="text-sm text-zinc-400">{t("noMore")}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl">
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <div>
                  {(() => {
                    const badge = getNotificationBadge(selectedNotification.type, t);
                    return (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none ${badge.className}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                  <p className="mt-1 text-xs text-zinc-400">
                    {getTimeAgo(selectedNotification.createdAt, t)} • {new Date(selectedNotification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title & Body */}
            <div className="mt-4 space-y-3">
              <div className="max-h-24 overflow-y-auto pr-1">
                <h2 className="text-base font-bold text-zinc-900 leading-snug break-words">
                  {selectedNotification.title}
                </h2>
              </div>
              <div className="max-h-[45vh] overflow-y-auto pr-1 text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap break-words border-t border-zinc-100 pt-3">
                {selectedNotification.content}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
              {selectedNotification.link && (
                <a
                  href={selectedNotification.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t("viewLink")}
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Notification Card ──
interface NotificationCardProps {
  notification: NotificationResponse;
  onView: (n: NotificationResponse) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const NotificationCard = ({
  notification,
  onView,
  t,
}: NotificationCardProps) => {
  const handleClick = () => {
    onView(notification);
  };

  const cardContent = (
    <div
      className={`flex gap-4 rounded-xl border bg-white p-4 transition cursor-pointer hover:border-zinc-300 hover:shadow-sm ${
        !notification.read
          ? "border-indigo-200 bg-indigo-50/30"
          : "border-zinc-200"
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${
          !notification.read ? "bg-indigo-100" : "bg-zinc-100"
        }`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {(() => {
              const badge = getNotificationBadge(notification.type, t);
              return (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${badge.className}`}>
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
          {!notification.read && (
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500 line-clamp-2 break-words">
          {notification.content}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <p
            className={`text-xs ${
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
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {t("viewLink")}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return cardContent;
};

export default NotificationPage;
