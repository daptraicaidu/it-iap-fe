import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  Loader2,
  AlertCircle,
  Plus,
  Briefcase,
  Calendar,
  UserCircle,
} from "lucide-react";
import interviewService from "../../../services/user/interviewService";
import type {
  InterviewHistoryItem,
  InterviewStatus,
  ApiErrorResponse,
} from "../../../services/user/interviewService";
import type { AxiosError } from "axios";
import Pagination from "../../../components/Pagination";
import ConfirmDialog from "../../../components/ConfirmDialog";

type StatusFilter = "ALL" | InterviewStatus;

const STATUS_FILTERS: StatusFilter[] = ["ALL", "COMPLETED", "IN_PROGRESS", "PENDING"];
const MODE_OPTIONS = ["", "INTERACTIVE_INTERVIEW", "STRESS_INTERVIEW"];

function getStatusConfig(status: InterviewStatus) {
  switch (status) {
    case "COMPLETED":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    case "IN_PROGRESS":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: PlayCircle,
      };
    case "PENDING":
      return {
        bg: "bg-zinc-100 text-zinc-600 border-zinc-200",
        icon: Clock,
      };
  }
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAutoCloseNotice(
  startAt: string,
  t: (key: string, options?: Record<string, any>) => string
): string | null {
  if (!startAt) return null;
  const startTime = new Date(startAt).getTime();
  if (isNaN(startTime)) return null;

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const remainingMs = startTime + SEVEN_DAYS_MS - now;

  if (remainingMs <= 0) {
    return t("historyPage.autoCloseExpired");
  }

  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  if (remainingMs > THREE_DAYS_MS) {
    return null;
  }

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  if (remainingMs > ONE_DAY_MS) {
    const days = Math.ceil(remainingMs / ONE_DAY_MS);
    return t("historyPage.autoCloseInDays", { count: days });
  } else {
    const hours = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));
    return t("historyPage.autoCloseInHours", { count: hours });
  }
}

const InterviewHistoryPage = () => {
  const { t } = useTranslation("Interview");
  const navigate = useNavigate();

  const [items, setItems] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [modeFilter, setModeFilter] = useState("");

  // Confirm dialog for IN_PROGRESS
  const [confirmItem, setConfirmItem] = useState<InterviewHistoryItem | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params: Record<string, string | number> = { pages: currentPage };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (modeFilter) params.mode = modeFilter;

      const res = await interviewService.getInterviewHistory(params);
      const data = res.data.data;
      setItems(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosErr.response?.data?.message || t("errors.historyFailed")
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, modeFilter, t]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, modeFilter]);

  const handleItemClick = (item: InterviewHistoryItem) => {
    switch (item.status) {
      case "COMPLETED":
        navigate(`/interviews/${item.interviewId}/result`);
        break;
      case "IN_PROGRESS":
        setConfirmItem(item);
        break;
      case "PENDING":
        navigate(`/interviews/${item.interviewId}`, {
          state: {
            interviewTitle: item.title,
            interviewMode: item.mode,
            profileName: item.profileTitle,
          },
        });
        break;
    }
  };

  const handleConfirmContinue = () => {
    if (confirmItem) {
      navigate(`/interviews/${confirmItem.interviewId}/session`);
      setConfirmItem(null);
    }
  };

  return (
    <div className="w-full">
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            {t("historyPage.title")}
          </h1>
          <p className="mt-2 text-base text-zinc-600">
            {t("historyPage.subtitle")}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1 [&::-webkit-scrollbar]:hidden">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf}
                type="button"
                onClick={() => setStatusFilter(sf)}
                className={[
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition",
                  statusFilter === sf
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700",
                ].join(" ")}
              >
                {sf === "ALL"
                  ? t("historyPage.filterAll")
                  : t(`historyPage.status.${sf}`)}
              </button>
            ))}
          </div>

          {/* Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          >
            <option value="">{t("historyPage.filterByMode")}: {t("historyPage.filterAll")}</option>
            {MODE_OPTIONS.filter(Boolean).map((mode) => (
              <option key={mode} value={mode}>
                {t(`historyPage.mode.${mode}`)}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-indigo-500" />
            </motion.div>
            <p className="mt-4 text-sm text-zinc-500">
              {t("resultPage.processing")}
            </p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-6 text-center"
          >
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-500" />
            <p className="text-sm text-rose-700">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-4 rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {t("errors.generic")}
            </button>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Briefcase className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">
              {t("historyPage.emptyTitle")}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {t("historyPage.emptyDescription")}
            </p>
            <button
              onClick={() => navigate("/interviews")}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              {t("historyPage.startNew")}
            </button>
          </motion.div>
        ) : (
          <>
            {/* Cards */}
            <div className="space-y-3">
              {items.map((item, index) => {
                const statusCfg = getStatusConfig(item.status);
                const StatusIcon = statusCfg.icon;
                const autoCloseNotice =
                  item.status === "IN_PROGRESS"
                    ? getAutoCloseNotice(item.startAt, t)
                    : null;

                return (
                  <motion.button
                    key={item.interviewId}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleItemClick(item)}
                    className="group flex w-full items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-zinc-300 hover:shadow-sm sm:items-center sm:p-5"
                  >
                    {/* Status Icon */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${statusCfg.bg}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-zinc-900 truncate">
                          {item.title}
                        </h3>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusCfg.bg}`}>
                          {t(`historyPage.status.${item.status}`)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {t(`historyPage.mode.${item.mode}`)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <UserCircle className="h-3.5 w-3.5" />
                          {item.profileTitle}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateTime(item.startAt)}
                        </span>
                      </div>

                      {/* Auto Close Notice */}
                      {autoCloseNotice && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-medium text-amber-700">
                          <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>{autoCloseNotice}</span>
                        </div>
                      )}
                    </div>

                    {/* Action hint */}
                    <div className="hidden sm:block shrink-0">
                      <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900">
                        {item.status === "COMPLETED"
                          ? t("historyPage.viewResult")
                          : item.status === "IN_PROGRESS"
                            ? t("historyPage.continueInterview")
                            : t("historyPage.startInterview")}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage - 1}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p + 1)}
              />
            </div>
          </>
        )}
      </section>

      {/* Continue Interview Confirm */}
      <ConfirmDialog
        isOpen={!!confirmItem}
        title={t("historyPage.confirmContinue.title")}
        message={t("historyPage.confirmContinue.message")}
        confirmText={t("historyPage.confirmContinue.confirm")}
        cancelText={t("historyPage.confirmContinue.cancel")}
        onConfirm={handleConfirmContinue}
        onCancel={() => setConfirmItem(null)}
        variant="warning"
      />
    </div>
  );
};

export default InterviewHistoryPage;
