import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PositionItem, LevelFilter } from "../../../../services/admin/adminDashboardService";

interface PositionPieChartProps {
  data: PositionItem[];
  levelFilter: LevelFilter;
  onLevelFilterChange: (level: LevelFilter) => void;
  isLoading: boolean;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];

const LEVEL_OPTIONS: { value: LevelFilter; labelKey: string }[] = [
  { value: "--", labelKey: "pieChart.levelOptions.all" },
  { value: "INTERN", labelKey: "pieChart.levelOptions.intern" },
  { value: "FRESHER", labelKey: "pieChart.levelOptions.fresher" },
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { fill: string };
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.payload.fill }}
        />
        <span className="text-xs font-medium text-zinc-600">{item.name}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900">
        {item.value.toLocaleString("vi-VN")} lượt
      </p>
    </div>
  );
};

const PositionPieChart = ({
  data,
  levelFilter,
  onLevelFilterChange,
  isLoading,
}: PositionPieChartProps) => {
  const { t } = useTranslation("AdminDashboard");

  const chartData = data.map((item) => ({
    name: t(`pieChart.positions.${item.position}`, { defaultValue: item.position }),
    value: item.totalInterviews,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-5 w-32 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-100" />
        </div>
        <div className="flex h-[280px] items-center justify-center">
          <div className="h-44 w-44 animate-pulse rounded-full bg-zinc-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <Briefcase size={18} />
          </div>
          <h3 className="text-base font-semibold text-zinc-900">
            {t("pieChart.title")}
          </h3>
        </div>
        <select
          value={levelFilter}
          onChange={(e) => onLevelFilterChange(e.target.value as LevelFilter)}
          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 outline-none transition-colors hover:border-zinc-300 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {chartData.length === 0 || total === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-zinc-400">
          {t("noData")}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-zinc-900">
                  {total.toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-zinc-500">{t("pieChart.total")}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2.5">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-zinc-600 whitespace-nowrap">
                  {item.name}
                </span>
                <span className="text-xs font-medium text-zinc-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionPieChart;
