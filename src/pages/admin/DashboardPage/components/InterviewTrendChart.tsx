import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TrendItem, TimeFilter } from "../../../../services/admin/adminDashboardService";

interface InterviewTrendChartProps {
  data: TrendItem[];
  timeFilter: TimeFilter;
  isLoading: boolean;
}

interface TooltipPayloadItem {
  value: number;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  tooltipLabel,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  tooltipLabel: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900">
        {tooltipLabel}: {payload[0].value.toLocaleString("vi-VN")}
      </p>
    </div>
  );
};

const InterviewTrendChart = ({
  data,
  timeFilter,
  isLoading,
}: InterviewTrendChartProps) => {
  const { t } = useTranslation("AdminDashboard");

  const chartData = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, "0");

    // Normalize date string to "DD/MM" format
    const normalizeDateKey = (dateStr?: string): string => {
      if (!dateStr) return "";
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
          // YYYY-MM-DD -> DD/MM
          return `${pad(parseInt(parts[2], 10))}/${pad(parseInt(parts[1], 10))}`;
        }
      }
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        // DD/MM/YYYY or DD/MM
        return `${pad(parseInt(parts[0], 10))}/${pad(parseInt(parts[1], 10))}`;
      }
      return dateStr;
    };

    // Normalize hour string to number 0..23
    const normalizeHour = (timeStr?: string): number | null => {
      if (!timeStr) return null;
      const match = timeStr.match(/^(\d{1,2})/);
      return match ? parseInt(match[1], 10) : null;
    };

    // 1. 24h filter: Generate exactly 24 points (00:00 to 23:00)
    if (timeFilter === "DAY") {
      const hourMap = new Map<number, number>();
      data.forEach((item) => {
        const h = normalizeHour(item.time || item.date);
        if (h !== null && h >= 0 && h < 24) {
          hourMap.set(h, (hourMap.get(h) || 0) + (item.count || 0));
        }
      });

      return Array.from({ length: 24 }, (_, h) => ({
        label: `${pad(h)}:00`,
        count: hourMap.get(h) ?? 0,
      }));
    }

    // 2. 7 days filter (WEEK): Generate exactly 7 consecutive days
    if (timeFilter === "WEEK") {
      const dateMap = new Map<string, number>();
      data.forEach((item) => {
        const key = normalizeDateKey(item.date);
        if (key) {
          dateMap.set(key, (dateMap.get(key) || 0) + (item.count || 0));
        }
      });

      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
        return {
          label: key,
          count: dateMap.get(key) ?? 0,
        };
      });
    }

    // 3. 30 days filter (MONTH): Generate exactly 30 consecutive days
    if (timeFilter === "MONTH") {
      const dateMap = new Map<string, number>();
      data.forEach((item) => {
        const key = normalizeDateKey(item.date);
        if (key) {
          dateMap.set(key, (dateMap.get(key) || 0) + (item.count || 0));
        }
      });

      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const key = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
        return {
          label: key,
          count: dateMap.get(key) ?? 0,
        };
      });
    }

    // Default / All filter
    return data.map((item, index) => {
      let label: string;
      if (item.time) {
        label = item.time;
      } else if (item.date) {
        label = normalizeDateKey(item.date);
      } else {
        label = `#${index + 1}`;
      }
      return { label, count: item.count || 0 };
    });
  }, [data, timeFilter]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-5 w-48 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-[280px] animate-pulse rounded-lg bg-zinc-50" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <TrendingUp size={18} />
        </div>
        <h3 className="text-base font-semibold text-zinc-900">
          {t("trendChart.title")}
        </h3>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-zinc-400">
          {t("noData")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInterview" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={
                <CustomTooltip
                  tooltipLabel={t("trendChart.tooltipLabel")}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorInterview)"
              dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InterviewTrendChart;
