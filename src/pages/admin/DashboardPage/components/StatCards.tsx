import { Users, ClipboardList, BrainCircuit, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OverviewData } from "../../../../services/admin/adminDashboardService";

interface StatCardsProps {
  data: OverviewData | null;
  isLoading: boolean;
}

const StatCards = ({ data, isLoading }: StatCardsProps) => {
  const { t } = useTranslation("AdminDashboard");

  const cards = [
    {
      key: "users",
      label: t("stats.users"),
      icon: Users,
      value: data?.userStats.total ?? 0,
      sub: data ? t("stats.new", { count: data.userStats.newCount }) : "",
      isPositive: (data?.userStats.newCount ?? 0) >= 0,
      cardBg: "bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/30 border-indigo-200/80 hover:border-indigo-300 hover:shadow-indigo-100/50",
      iconBg: "bg-indigo-600 text-white shadow-md shadow-indigo-200",
      labelColor: "text-indigo-950 font-medium",
      watermarkColor: "text-indigo-600/10",
    },
    {
      key: "interviews",
      label: t("stats.interviews"),
      icon: ClipboardList,
      value: data?.interviewStats.total ?? 0,
      sub: data ? t("stats.new", { count: data.interviewStats.newCount }) : "",
      isPositive: (data?.interviewStats.newCount ?? 0) >= 0,
      cardBg: "bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 border-emerald-200/80 hover:border-emerald-300 hover:shadow-emerald-100/50",
      iconBg: "bg-emerald-600 text-white shadow-md shadow-emerald-200",
      labelColor: "text-emerald-950 font-medium",
      watermarkColor: "text-emerald-600/10",
    },
    {
      key: "aiGrading",
      label: t("stats.aiGrading"),
      icon: BrainCircuit,
      value: data?.aiGradingStats.total ?? 0,
      sub: data ? t("stats.new", { count: data.aiGradingStats.newCount }) : "",
      isPositive: (data?.aiGradingStats.newCount ?? 0) >= 0,
      cardBg: "bg-gradient-to-br from-violet-50/90 via-white to-violet-50/30 border-violet-200/80 hover:border-violet-300 hover:shadow-violet-100/50",
      iconBg: "bg-violet-600 text-white shadow-md shadow-violet-200",
      labelColor: "text-violet-950 font-medium",
      watermarkColor: "text-violet-600/10",
    },
    {
      key: "revenue",
      label: t("stats.revenue"),
      icon: DollarSign,
      value: data?.revenueStats.totalRevenue ?? 0,
      sub: data
        ? t("stats.change", {
            value:
              data.revenueStats.percentageChange >= 0
                ? `+${data.revenueStats.percentageChange.toFixed(1)}`
                : data.revenueStats.percentageChange.toFixed(1),
          })
        : "",
      isPositive: (data?.revenueStats.percentageChange ?? 0) >= 0,
      isRevenue: true,
      cardBg: "bg-gradient-to-br from-amber-50/90 via-white to-amber-50/30 border-amber-200/80 hover:border-amber-300 hover:shadow-amber-100/50",
      iconBg: "bg-amber-500 text-white shadow-md shadow-amber-200",
      labelColor: "text-amber-950 font-medium",
      watermarkColor: "text-amber-600/10",
    },
  ];

  const formatValue = (value: number, isRevenue?: boolean) => {
    if (isRevenue) {
      return value.toLocaleString("vi-VN") + " đ";
    }
    return value.toLocaleString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-zinc-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-zinc-100" />
              <div className="h-9 w-9 rounded-lg bg-zinc-100" />
            </div>
            <div className="mt-4 h-8 w-20 rounded bg-zinc-100" />
            <div className="mt-2 h-3 w-16 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const ChangeIcon = card.isPositive ? TrendingUp : TrendingDown;
        return (
          <div
            key={card.key}
            className={`group relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-md ${card.cardBg}`}
          >
            {/* Watermark Icon in bottom-right background */}
            <div className="pointer-events-none absolute -bottom-3 -right-3">
              <Icon size={84} className={`${card.watermarkColor} transition-transform group-hover:scale-110`} />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <p className={`text-sm ${card.labelColor}`}>{card.label}</p>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${card.iconBg}`}
              >
                <Icon size={20} />
              </div>
            </div>

            <p className="relative z-10 mt-4 text-2xl font-bold tracking-tight text-zinc-900">
              {formatValue(card.value, card.isRevenue)}
            </p>

            {card.sub && (
              <div className="relative z-10 mt-2 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    card.isPositive
                      ? "bg-emerald-100/80 text-emerald-700"
                      : "bg-rose-100/80 text-rose-700"
                  }`}
                >
                  <ChangeIcon size={13} />
                  {card.sub}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;

