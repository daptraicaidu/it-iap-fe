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
import type { InterviewTrendsData, TimeFilter } from "../../../../services/admin/adminDashboardService";

interface InterviewTrendChartProps {
  data?: InterviewTrendsData | null;
  timeFilter: TimeFilter;
  isLoading: boolean;
}

interface TooltipPayloadItem {
  dataKey?: string;
  name?: string;
  value?: number;
  color?: string;
  stroke?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  t,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  t: (key: string) => string;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const interactiveItem = payload.find((p) => p.dataKey === "interactive");
  const stressItem = payload.find((p) => p.dataKey === "stress");

  const interactiveVal = Number(interactiveItem?.value ?? 0);
  const stressVal = Number(stressItem?.value ?? 0);
  const totalVal = interactiveVal + stressVal;

  return (
    <div className="min-w-[190px] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-zinc-500">{label}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            <span className="text-zinc-600">{t("trendChart.interactive")}</span>
          </div>
          <span className="font-semibold text-zinc-900">
            {interactiveVal.toLocaleString("vi-VN")}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-zinc-600">{t("trendChart.stress")}</span>
          </div>
          <span className="font-semibold text-zinc-900">
            {stressVal.toLocaleString("vi-VN")}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4 border-t border-zinc-100 pt-2 font-semibold">
          <span className="text-zinc-700">{t("trendChart.total")}</span>
          <span className="text-zinc-900">{totalVal.toLocaleString("vi-VN")}</span>
        </div>
      </div>
    </div>
  );
};

const InterviewTrendChart = ({
  data,
  timeFilter,
  isLoading,
}: InterviewTrendChartProps) => {
  const { t } = useTranslation("AdminDashboard");

  // Calculate totals for quick overview in chart header
  const { totalInteractive, totalStress, totalAll } = useMemo(() => {
    const interactiveList = data?.interactiveInterviewTrends ?? [];
    const stressList = data?.stressInterviewTrends ?? [];

    const totalInteractive = interactiveList.reduce(
      (acc, cur) => acc + (cur.count || 0),
      0
    );
    const totalStress = stressList.reduce(
      (acc, cur) => acc + (cur.count || 0),
      0
    );

    return {
      totalInteractive,
      totalStress,
      totalAll: totalInteractive + totalStress,
    };
  }, [data]);

  const chartData = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const interactiveList = data?.interactiveInterviewTrends ?? [];
    const stressList = data?.stressInterviewTrends ?? [];

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

    // Parse date string to timestamp for chronological ordering
    const parseDateToTimestamp = (dateStr: string): number => {
      if (!dateStr) return 0;
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          return new Date(
            parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10)
          ).getTime();
        }
        if (parts.length === 2) {
          return new Date(
            new Date().getFullYear(),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10)
          ).getTime();
        }
      }
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
          return new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10)
          ).getTime();
        }
      }
      return 0;
    };

    // 1. 24h filter: Generate exactly 24 points (00:00 to 23:00)
    if (timeFilter === "DAY") {
      const interactiveHourMap = new Map<number, number>();
      const stressHourMap = new Map<number, number>();

      interactiveList.forEach((item) => {
        const h = normalizeHour(item.time || item.date);
        if (h !== null && h >= 0 && h < 24) {
          interactiveHourMap.set(
            h,
            (interactiveHourMap.get(h) || 0) + (item.count || 0)
          );
        }
      });

      stressList.forEach((item) => {
        const h = normalizeHour(item.time || item.date);
        if (h !== null && h >= 0 && h < 24) {
          stressHourMap.set(
            h,
            (stressHourMap.get(h) || 0) + (item.count || 0)
          );
        }
      });

      return Array.from({ length: 24 }, (_, h) => {
        const interactive = interactiveHourMap.get(h) ?? 0;
        const stress = stressHourMap.get(h) ?? 0;
        return {
          label: `${pad(h)}:00`,
          interactive,
          stress,
          total: interactive + stress,
        };
      });
    }

    // 2. 7 days filter (WEEK): Generate exactly 7 consecutive days
    if (timeFilter === "WEEK") {
      const interactiveMap = new Map<string, number>();
      const stressMap = new Map<string, number>();

      interactiveList.forEach((item) => {
        const key = normalizeDateKey(item.date);
        if (key) {
          interactiveMap.set(
            key,
            (interactiveMap.get(key) || 0) + (item.count || 0)
          );
        }
      });

      stressList.forEach((item) => {
        const key = normalizeDateKey(item.date);
        if (key) {
          stressMap.set(
            key,
            (stressMap.get(key) || 0) + (item.count || 0)
          );
        }
      });

      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
        const interactive = interactiveMap.get(key) ?? 0;
        const stress = stressMap.get(key) ?? 0;
        return {
          label: key,
          interactive,
          stress,
          total: interactive + stress,
        };
      });
    }

    // 3. 30 days filter (MONTH): Generate exactly 30 consecutive days
    if (timeFilter === "MONTH") {
      const interactiveMap = new Map<string, number>();
      const stressMap = new Map<string, number>();

      interactiveList.forEach((item) => {
        const key = normalizeDateKey(item.date);
        if (key) {
          interactiveMap.set(
            key,
            (interactiveMap.get(key) || 0) + (item.count || 0)
          );
        }
      });

      stressList.forEach((item) => {
        const key = normalizeDateKey(item.date);
        if (key) {
          stressMap.set(
            key,
            (stressMap.get(key) || 0) + (item.count || 0)
          );
        }
      });

      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const key = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
        const interactive = interactiveMap.get(key) ?? 0;
        const stress = stressMap.get(key) ?? 0;
        return {
          label: key,
          interactive,
          stress,
          total: interactive + stress,
        };
      });
    }

    // 4. Default / All filter: Merge all distinct dates and sort chronologically
    const interactiveMap = new Map<string, number>();
    const stressMap = new Map<string, number>();
    const allRawDates = new Set<string>();

    interactiveList.forEach((item) => {
      const rawDate = item.date || item.time || "";
      if (rawDate) {
        allRawDates.add(rawDate);
        interactiveMap.set(
          rawDate,
          (interactiveMap.get(rawDate) || 0) + (item.count || 0)
        );
      }
    });

    stressList.forEach((item) => {
      const rawDate = item.date || item.time || "";
      if (rawDate) {
        allRawDates.add(rawDate);
        stressMap.set(
          rawDate,
          (stressMap.get(rawDate) || 0) + (item.count || 0)
        );
      }
    });

    const sortedDates = Array.from(allRawDates).sort((a, b) => {
      const timeA = parseDateToTimestamp(a);
      const timeB = parseDateToTimestamp(b);
      return timeA - timeB;
    });

    return sortedDates.map((rawDate) => {
      const interactive = interactiveMap.get(rawDate) ?? 0;
      const stress = stressMap.get(rawDate) ?? 0;
      return {
        label: normalizeDateKey(rawDate),
        interactive,
        stress,
        total: interactive + stress,
      };
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
      {/* Header with Title and Summary Badges */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp size={18} />
          </div>
          <h3 className="text-base font-semibold text-zinc-900">
            {t("trendChart.title")}
          </h3>
        </div>

        {/* Legend & Period Summary Counts */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Total Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
            <span>{t("trendChart.totalBadge")}:</span>
            <span className="font-semibold text-zinc-900">
              {totalAll.toLocaleString("vi-VN")}
            </span>
          </div>

          {/* Interactive Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            <span>{t("trendChart.interactiveBadge")}:</span>
            <span className="font-semibold text-indigo-900">
              {totalInteractive.toLocaleString("vi-VN")}
            </span>
          </div>

          {/* Stress Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{t("trendChart.stressBadge")}:</span>
            <span className="font-semibold text-amber-900">
              {totalStress.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-zinc-400">
          {t("noData")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInteractive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
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
            <Tooltip content={<CustomTooltip t={t} />} />
            {/* Interactive Interview Line (Indigo) */}
            <Area
              type="monotone"
              dataKey="interactive"
              name={t("trendChart.interactive")}
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#colorInteractive)"
              dot={{ r: 3, fill: "#4f46e5", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: "#4f46e5",
                strokeWidth: 2,
                stroke: "#fff",
              }}
            />
            {/* Stress Interview Line (Amber) */}
            <Area
              type="monotone"
              dataKey="stress"
              name={t("trendChart.stress")}
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#colorStress)"
              dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: "#f59e0b",
                strokeWidth: 2,
                stroke: "#fff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default InterviewTrendChart;

