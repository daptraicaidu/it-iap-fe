import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TrendItem, TimeFilter } from "../../../../services/admin/adminDashboardService";

interface RevenueBarChartProps {
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
        {tooltipLabel}: {payload[0].value.toLocaleString("vi-VN")} đ
      </p>
    </div>
  );
};

const RevenueBarChart = ({
  data,
  timeFilter,
  isLoading,
}: RevenueBarChartProps) => {
  const { t } = useTranslation("AdminDashboard");

  const chartData = data.map((item, index) => {
    let label: string;
    if (timeFilter === "DAY" && item.time) {
      label = item.time;
    } else if (item.date) {
      if (item.date.includes("-")) {
        const parts = item.date.split("-");
        label = `${parts[2]}/${parts[1]}`;
      } else if (item.date.includes("/")) {
        label = item.date.substring(0, 5);
      } else {
        label = item.date;
      }
    } else {
      label = `#${index + 1}`;
    }
    return { label, revenue: item.count };
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-5 w-36 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-[280px] animate-pulse rounded-lg bg-zinc-50" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <BarChart3 size={18} />
        </div>
        <h3 className="text-base font-semibold text-zinc-900">
          {t("revenueChart.title")}
        </h3>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-zinc-400">
          {t("noData")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.45} />
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
            <Tooltip
              content={
                <CustomTooltip
                  tooltipLabel={t("revenueChart.tooltipLabel")}
                />
              }
              cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
            />
            <Bar
              dataKey="revenue"
              fill="url(#colorRevenue)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueBarChart;
