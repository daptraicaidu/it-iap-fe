import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  Loader2,
  PlusCircle,
  RefreshCw,
  Trash2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import adminNotificationService, {
  type AdminNotificationItem,
  type CreateNotificationPayload,
  type NotificationValidationErrorData,
} from "../../../services/admin/adminNotificationService";
import ConfirmDialog from "../../../components/ConfirmDialog";

const AdminNotificationsPage = () => {
  const { t } = useTranslation("AdminNotifications");

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<NotificationValidationErrorData>({});
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  // List & Pagination State
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Delete Dialog State
  const [deletingItem, setDeletingItem] = useState<AdminNotificationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Fetch Notifications
  const fetchNotifications = useCallback(
    async (pageToFetch: number, isInitial = false) => {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await adminNotificationService.getAdminNotifications(pageToFetch, pageSize);
        const data = response.data?.data;

        if (data) {
          if (isInitial) {
            setNotifications(data.content || []);
          } else {
            setNotifications((prev) => [...prev, ...(data.content || [])]);
          }
          setTotalElements(data.totalElements || 0);
          setHasMore(!data.last);
          setPage(pageToFetch);
        }
      } catch (err) {
        console.error("Failed to fetch admin notifications:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccessMsg(null);
    setFormErrorMsg(null);
    setFieldErrors({});

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedLink = link.trim();

    // Client-side validation check
    const errors: NotificationValidationErrorData = {};
    if (!trimmedTitle) {
      errors.title = t("createCard.titlePlaceholder");
    }
    if (!trimmedContent) {
      errors.content = t("createCard.contentPlaceholder");
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Build payload: if link is empty string, send null explicitly as requested
    const payload: CreateNotificationPayload = {
      title: trimmedTitle,
      content: trimmedContent,
      link: trimmedLink === "" ? null : trimmedLink,
    };

    try {
      const res = await adminNotificationService.createNotification(payload);
      if (res.data?.code === 201 || res.status === 201) {
        setFormSuccessMsg(t("createCard.successMessage"));
        setTitle("");
        setContent("");
        setLink("");
        setFieldErrors({});
        // Reload first page to show new notification
        fetchNotifications(1, true);
      }
    } catch (err: unknown) {
      console.error("Failed to create notification:", err);
      const axiosErr = err as {
        response?: {
          status?: number;
          data?: {
            code?: number;
            data?: NotificationValidationErrorData;
            message?: string;
          };
        };
      };

      const resData = axiosErr.response?.data;
      if (resData?.data) {
        setFieldErrors(resData.data);
      }
      setFormErrorMsg(resData?.message || t("createCard.errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Load More
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(page + 1, false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setDeleteErrorMsg(null);

    try {
      await adminNotificationService.deleteNotification(deletingItem.identifyCode);
      setNotifications((prev) =>
        prev.filter((item) => item.identifyCode !== deletingItem.identifyCode)
      );
      setTotalElements((prev) => Math.max(0, prev - 1));
      setDeletingItem(null);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setDeleteErrorMsg(t("deleteModal.errorMessage"));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t("title")}</h1>
          <p className="text-sm text-zinc-600">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchNotifications(1, true)}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-95 disabled:opacity-50 md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Đang tải..." : "Làm mới"}</span>
        </button>
      </div>

      {/* Main Grid: Form (Left) & Notification List (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Create Notification Form */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">{t("createCard.title")}</h2>
                <p className="text-xs text-zinc-500">{t("createCard.subtitle")}</p>
              </div>
            </div>

            {/* Success Message Banner */}
            {formSuccessMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{formSuccessMsg}</span>
              </div>
            )}

            {/* General Error Message Banner */}
            {formErrorMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-800 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{formErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Field */}
              <div>
                <label htmlFor="notif-title" className="block text-xs font-semibold text-zinc-700">
                  {t("createCard.fieldTitle")} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="notif-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder={t("createCard.titlePlaceholder")}
                  className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:ring-2 ${
                    fieldErrors.title
                      ? "border-rose-300 bg-rose-50/50 focus:ring-rose-500"
                      : "border-zinc-200 bg-zinc-50/50 focus:border-zinc-900 focus:bg-white focus:ring-zinc-900"
                  }`}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" />
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* Content Field */}
              <div>
                <label htmlFor="notif-content" className="block text-xs font-semibold text-zinc-700">
                  {t("createCard.fieldContent")} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="notif-content"
                  rows={4}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (fieldErrors.content) setFieldErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  placeholder={t("createCard.contentPlaceholder")}
                  className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:ring-2 ${
                    fieldErrors.content
                      ? "border-rose-300 bg-rose-50/50 focus:ring-rose-500"
                      : "border-zinc-200 bg-zinc-50/50 focus:border-zinc-900 focus:bg-white focus:ring-zinc-900"
                  }`}
                />
                {fieldErrors.content && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" />
                    {fieldErrors.content}
                  </p>
                )}
              </div>

              {/* Link Field */}
              <div>
                <label htmlFor="notif-link" className="block text-xs font-semibold text-zinc-700">
                  {t("createCard.fieldLink")}
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="notif-link"
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder={t("createCard.linkPlaceholder")}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("createCard.submittingBtn")}</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>{t("createCard.submitBtn")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Admin Notifications List */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">{t("listCard.title")}</h2>
                <p className="text-xs text-zinc-500">
                  {t("listCard.count", { total: totalElements })}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                ADMIN
              </span>
            </div>

            {/* List Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-600 mb-2" />
                <p className="text-xs">{t("listCard.loadingMore")}</p>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">{t("listCard.emptyTitle")}</h3>
                <p className="mt-1 text-xs text-zinc-500 max-w-xs">{t("listCard.emptyDescription")}</p>
              </div>
            ) : (
              /* Notification Items List */
              <div className="space-y-4">
                {notifications.map((item) => (
                  <div
                    key={item.identifyCode}
                    className="group relative flex flex-col justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 border border-zinc-200">
                          #{item.identifyCode}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        title={t("listCard.delete")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                      <p className="mt-1 text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    {/* Link badge or link anchor */}
                    <div className="pt-1 flex items-center justify-between border-t border-zinc-100 text-xs">
                      {item.link ? (
                        <a
                          href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="truncate max-w-xs">{item.link}</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                          <LinkIcon className="h-3 w-3" />
                          <span>{t("listCard.noLink")}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-95 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t("listCard.loadingMore")}</span>
                        </>
                      ) : (
                        <span>{t("listCard.loadMore")}</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title={t("deleteModal.title")}
        message={
          deleteErrorMsg
            ? deleteErrorMsg
            : `${t("deleteModal.message")} (${deletingItem ? deletingItem.title : ""})`
        }
        confirmText={isDeleting ? t("deleteModal.deleting") : t("deleteModal.confirm")}
        cancelText={t("deleteModal.cancel")}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!isDeleting) {
            setDeletingItem(null);
            setDeleteErrorMsg(null);
          }
        }}
        variant="warning"
      />
    </div>
  );
};

export default AdminNotificationsPage;
