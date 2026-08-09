import { RefreshCw, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TimeFilter } from "../../../../services/admin/adminDashboardService";

interface DashboardHeaderProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  onReloadAll: () => void;
  isLoading: boolean;
}

const TIME_FILTER_OPTIONS: { value: TimeFilter; labelKey: string }[] = [
  { value: "--", labelKey: "timeFilter.all" },
  { value: "DAY", labelKey: "timeFilter.day" },
  { value: "WEEK", labelKey: "timeFilter.week" },
  { value: "MONTH", labelKey: "timeFilter.month" },
];

const getDateRangeText = (filter: TimeFilter): string => {
  const now = new Date();
  const formatDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  switch (filter) {
    case "DAY": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return `${formatDate(yesterday)} – ${formatDate(now)}`;
    }
    case "WEEK": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return `${formatDate(weekAgo)} – ${formatDate(now)}`;
    }
    case "MONTH": {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return `${formatDate(monthAgo)} – ${formatDate(now)}`;
    }
    default:
      return "";
  }
};

const DashboardHeader = ({
  timeFilter,
  onTimeFilterChange,
  onReloadAll,
  isLoading,
}: DashboardHeaderProps) => {
  const { t } = useTranslation("AdminDashboard");
  const dateRange = getDateRangeText(timeFilter);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {t("header.title")}
        </h1>
        {dateRange && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-xs">
            <Calendar size={13} className="text-blue-600" />
            <span>{t("header.dateRange", { range: dateRange })}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value as TimeFilter)}
          className="rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 outline-none transition-colors hover:border-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 shadow-xs"
        >
          {TIME_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>

        <button
          onClick={onReloadAll}
          disabled={isLoading}
          title={t("header.reload")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={isLoading ? "animate-spin" : ""}
          />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
