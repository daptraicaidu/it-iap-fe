import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Download,
  Flame,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Brain,
  Eye,
  Loader2,
  AlertCircle,
  Crown,
  CheckCircle2,
  ExternalLink,
  Share2,
  X,
  ArrowUp,
} from "lucide-react";
import axios from "axios";
import profileService, {
  type ProfileSummary,
  getProfileTitle,
} from "../../../services/user/profileService";
import dashboardService, {
  type ProgressData,
  type ProfileDashboardData,
} from "../../../services/user/dashboardService";
import forumService from "../../../services/user/forumService";
import useUserStore from "../../../store/userStore";
import UpgradeTierModal from "../../../components/user/UpgradeTierModal";
import StreakInfoModal from "./StreakInfoModal";

// ── Helpers ──
const getGreeting = (): "morning" | "afternoon" | "evening" => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
};

const getRankColor = (rank: string): string => {
  switch (rank?.toUpperCase()) {
    case "BRONZE":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "SILVER":
      return "text-zinc-500 bg-zinc-100 border-zinc-300";
    case "GOLD":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "PLATINUM":
      return "text-neutral-600 bg-neutral-50 border-neutral-200";
    case "DIAMOND":
      return "text-sky-600 bg-sky-50 border-sky-200";
    default:
      return "text-zinc-600 bg-zinc-100 border-zinc-200";
  }
};

const formatSubscriptionDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const dmyMatch = dateStr.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/
  );
  if (dmyMatch) {
    const [, day, month, year, hours, minutes] = dmyMatch;
    const formattedDay = day.padStart(2, "0");
    const formattedMonth = month.padStart(2, "0");
    if (hours && minutes) {
      return `${formattedDay}/${formattedMonth}/${year} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    }
    return `${formattedDay}/${formattedMonth}/${year}`;
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch {
    // Ignore fallback
  }

  return dateStr;
};

// ── Gauge Chart (SVG) — 5 discrete color segments semicircle ──
interface GaugeChartProps {
  value: number; // 0..100
  label: string;
}

const GaugeChart = ({ value, label }: GaugeChartProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Needle angle theta: Math.PI (180deg) when 0, 0 (0deg) when 100
  const needleFrac = clampedValue / 100;
  const theta = Math.PI * (1 - needleFrac);
  const needleLen = 108;
  const needleTipX = needleLen * Math.cos(theta);
  const needleTipY = -needleLen * Math.sin(theta);

  const getLevelLabel = (v: number) => {
    if (v < 20) return label.split('|')[0] ?? 'Novice';
    if (v < 40) return label.split('|')[1] ?? 'Beginner';
    if (v < 60) return label.split('|')[2] ?? 'Developing';
    if (v < 80) return label.split('|')[3] ?? 'Maturing';
    return label.split('|')[4] ?? 'Expert';
  };

  const getLevelColor = (v: number) => {
    if (v < 20) return '#EF5350';
    if (v < 40) return '#FF9800';
    if (v < 60) return '#d97706';
    if (v < 80) return '#65a30d';
    return '#16a34a';
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 200" className="w-full max-w-[300px]">
        {/* 5 Arc Segments */}
        <g transform="translate(150, 140)" fill="none" strokeWidth="32" strokeLinecap="butt">
          {/* Đoạn 1: Đỏ (180° - 145°) */}
          <path d="M -100,0 A 100,100 0 0,1 -81.92,-57.36" stroke="#EF5350" />
          
          {/* Đoạn 2: Cam (143° - 109°) */}
          <path d="M -79.86,-60.18 A 100,100 0 0,1 -32.56,-94.55" stroke="#FF9800" />
          
          {/* Đoạn 3: Vàng (107° - 73°) */}
          <path d="M -29.24,-95.63 A 100,100 0 0,1 29.24,-95.63" stroke="#FBC02D" />
          
          {/* Đoạn 4: Xanh lá nhạt (71° - 37°) */}
          <path d="M 32.56,-94.55 A 100,100 0 0,1 79.86,-60.18" stroke="#8BC34A" />
          
          {/* Đoạn 5: Xanh lá đậm (35° - 0°) */}
          <path d="M 81.92,-57.36 A 100,100 0 0,1 100,0" stroke="#4CAF50" />

          {/* Needle */}
          <line
            x1={0}
            y1={0}
            x2={needleTipX.toFixed(2)}
            y2={needleTipY.toFixed(2)}
            stroke="#18181b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Needle Pivot Circle */}
          <circle cx={0} cy={0} r={6} fill="#ffffff" stroke="#18181b" strokeWidth="3" />

          {/* Score text below center */}
          <text
            x={0}
            y={36}
            textAnchor="middle"
            fontSize="32"
            fontWeight="800"
            fill="#18181b"
            fontFamily="system-ui, sans-serif"
          >
            {Math.round(clampedValue)}
          </text>
        </g>
      </svg>
      <p
        className="-mt-2 text-base font-bold"
        style={{ color: getLevelColor(clampedValue) }}
      >
        {getLevelLabel(clampedValue)}
      </p>
    </div>
  );
};

// ── Spider/Radar Chart (SVG) — labels with line-wrapping & export room ──
interface RadarChartProps {
  userValues: number[]; // 0..10
  benchmarkValues: number[]; // 0..10
  labels: string[];
}

export const RadarChart = ({ userValues, benchmarkValues, labels }: RadarChartProps) => {
  // Expanded viewBox (500x370) for big, bold, prominent 17.5px labels
  const cx = 250;
  const cy = 185;
  const maxR = 110;
  const levels = 5;
  const n = labels.length;
  const labelOffset = 34;

  const angleFor = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;

  const pointOnAxis = (i: number, r: number) => ({
    x: cx + r * Math.cos(angleFor(i)),
    y: cy + r * Math.sin(angleFor(i)),
  });

  const toPath = (values: number[]) =>
    values
      .map((v, i) => {
        const p = pointOnAxis(i, (v / 10) * maxR);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  // Split long label into 2 lines if needed
  const splitLabel = (text: string): string[] => {
    const words = text.split(" ");
    if (words.length <= 2 || text.length <= 12) return [text];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  };

  return (
    <svg viewBox="0 0 500 370" className="w-full max-w-[420px] h-auto mx-auto">
      {/* Grid polygons */}
      {Array.from({ length: levels }).map((_, li) => {
        const r = ((li + 1) / levels) * maxR;
        const pts = Array.from({ length: n })
          .map((_, i) => {
            const p = pointOnAxis(i, r);
            return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
          })
          .join(" ");
        return (
          <polygon
            key={li}
            points={pts}
            fill={li % 2 === 0 ? "rgba(244,244,245,0.6)" : "none"}
            stroke="#e4e4e7"
            strokeWidth="1"
          />
        );
      })}

      {/* Axes */}
      {Array.from({ length: n }).map((_, i) => {
        const p = pointOnAxis(i, maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#d4d4d8"
            strokeWidth="1"
          />
        );
      })}

      {/* Benchmark (dashed yellow) */}
      <path
        d={toPath(benchmarkValues)}
        fill="rgba(234,179,8,0.08)"
        stroke="#eab308"
        strokeWidth="2"
        strokeDasharray="5,4"
      />

      {/* User (solid purple) */}
      <path
        d={toPath(userValues)}
        fill="rgba(109,40,217,0.15)"
        stroke="#7c3aed"
        strokeWidth="2.5"
      />

      {/* Data point dots for user */}
      {userValues.map((v, i) => {
        const p = pointOnAxis(i, (v / 10) * maxR);
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7c3aed" />;
      })}

      {/* Labels — multi-line, positioned at correct axis endpoints */}
      {labels.map((label, i) => {
        const p = pointOnAxis(i, maxR + labelOffset);
        const anchor =
          Math.abs(p.x - cx) < 10 ? "middle" : p.x < cx ? "end" : "start";
        const lines = splitLabel(label);
        const lineHeight = 19;
        // Center the text block vertically around p.y
        const startDy = -(((lines.length - 1) * lineHeight) / 2);

        return (
          <text
            key={i}
            x={p.x.toFixed(2)}
            y={p.y.toFixed(2)}
            textAnchor={anchor}
            fontSize="17.5"
            fill="#09090b"
            fontFamily="system-ui, sans-serif"
            fontWeight="500"
            dominantBaseline="middle"
          >
            {lines.map((line, li) => (
              <tspan
                key={li}
                x={p.x.toFixed(2)}
                dy={li === 0 ? startDy : lineHeight}
              >
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
};

// ── Activity Heatmap — 91 days aligned strictly to Mon..Sun ──
interface ActivityHeatmapProps {
  data: { date: string; totalQuestions: number }[];
  labelNoActivity: string;
  labelFew: string;
  labelModerate: string;
  labelMany: string;
  labelDays: string[];
}

const ActivityHeatmap = ({
  data,
  labelNoActivity,
  labelFew,
  labelModerate,
  labelMany,
  labelDays,
}: ActivityHeatmapProps) => {
  const totalDays = 91; // Exactly 91 days range from [today - 90 days ... today]

  // Build date→count map
  const map: Record<string, number> = {};
  data.forEach((d) => {
    map[d.date] = d.totalQuestions;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // startDate is 90 days before today
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (totalDays - 1));

  // Determine Monday of startDate's calendar week
  const startDayOfWeek = startDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const startAdjustedDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0=Mon .. 6=Sun
  const startWeekMonday = new Date(startDate);
  startWeekMonday.setDate(startDate.getDate() - startAdjustedDay);

  // Determine Sunday of today's calendar week
  const todayDayOfWeek = today.getDay();
  const todayAdjustedDay = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
  const endWeekSunday = new Date(today);
  endWeekSunday.setDate(today.getDate() + (6 - todayAdjustedDay));

  // Total calendar weeks (usually 14)
  const totalWeeks =
    Math.round(
      (endWeekSunday.getTime() - startWeekMonday.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    ) + 1;

  // Build cells: each column is a calendar week (Mon=row 0 .. Sun=row 6)
  const gridWeeks: {
    dateStr: string;
    formattedDate: string;
    count: number;
    weekIdx: number;
    dayIdx: number;
    isOutOfRange: boolean;
  }[][] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const weekColumn = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startWeekMonday);
      cellDate.setDate(startWeekMonday.getDate() + w * 7 + d);

      const isBeforeStart = cellDate.getTime() < startDate.getTime();
      const isAfterToday = cellDate.getTime() > today.getTime();
      const isOutOfRange = isBeforeStart || isAfterToday;

      const year = cellDate.getFullYear();
      const month = String(cellDate.getMonth() + 1).padStart(2, "0");
      const day = String(cellDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const formattedDate = `${day}/${month}/${year}`;

      const count = isOutOfRange ? 0 : (map[dateStr] ?? 0);

      weekColumn.push({
        dateStr,
        formattedDate,
        count,
        weekIdx: w,
        dayIdx: d,
        isOutOfRange,
      });
    }
    gridWeeks.push(weekColumn);
  }

  const getBgColor = (count: number) => {
    if (count === 0) return "#f4f4f5"; // zinc-100
    if (count < 3) return "#a1caff"; 
    if (count < 8) return "#6baafc"; 
    return "#3b82f6"; 
  };

  const getTextColor = (count: number) => {
    if (count === 0) return "#a1a1aa"; // zinc-400
    if (count < 3) return "#1e3a8a"; 
    return "#ffffff";
  };

  // Month labels (display month name on the first week column where the month changes)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < totalWeeks; w++) {
    // Find the first in-range cell in this week column (or first cell)
    const activeCell = gridWeeks[w].find((c) => !c.isOutOfRange) || gridWeeks[w][0];
    if (activeCell) {
      const parts = activeCell.dateStr.split("-");
      const m = parseInt(parts[1], 10) - 1;
      if (m !== lastMonth) {
        monthLabels.push({ label: monthNames[m], weekIdx: w });
        lastMonth = m;
      }
    }
  }

  // Dimensions
  const CELL_H = 38; // px height
  const GAP = 4;
  const DAY_LABEL_W = 36;

  return (
    <div className="w-full overflow-x-auto py-2">
      <div style={{ minWidth: DAY_LABEL_W + totalWeeks * (44 + GAP) }} className="pr-1">
        {/* Month header — columns aligned with grid columns */}
        <div className="mb-1 flex">
          {/* Spacer matching day-label column */}
          <div className="flex-shrink-0" style={{ width: DAY_LABEL_W }} />
          {/* Month columns */}
          <div className="flex flex-1" style={{ gap: GAP }}>
            {Array.from({ length: totalWeeks }).map((_, w) => {
              const ml = monthLabels.find((m) => m.weekIdx === w);
              return (
                <div
                  key={w}
                  style={{ flex: 1, minWidth: 0 }}
                  className="text-xs font-semibold text-zinc-500 pl-0.5"
                >
                  {ml?.label ?? ""}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex">
          {/* Fixed Day labels (Thứ 2 -> Chủ nhật) */}
          <div
            className="flex flex-shrink-0 flex-col"
            style={{ width: DAY_LABEL_W, gap: GAP }}
          >
            {labelDays.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-end pr-2 text-xs font-medium text-zinc-400"
                style={{ height: CELL_H }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid of Calendar Weeks */}
          <div className="flex flex-1" style={{ gap: GAP }}>
            {gridWeeks.map((weekColumn, w) => (
              <div
                key={w}
                className="flex flex-col"
                style={{ flex: 1, gap: GAP }}
              >
                {weekColumn.map((cell, d) => {
                  const { count, formattedDate, isOutOfRange } = cell;
                  const isTopRow = d <= 1;

                  if (isOutOfRange) {
                    return (
                      <div
                        key={d}
                        style={{ height: CELL_H }}
                        className="rounded-lg bg-transparent pointer-events-none"
                      />
                    );
                  }

                  return (
                    <div
                      key={d}
                      className="group relative flex items-center justify-center rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer hover:ring-2 hover:ring-blue-600/30 hover:brightness-95 hover:z-30"
                      style={{
                        height: CELL_H,
                        backgroundColor: getBgColor(count),
                        color: getTextColor(count),
                        fontSize: count >= 100 ? 10 : count >= 10 ? 11 : 12,
                      }}
                    >
                      {count > 0 ? count : ""}

                      {/* Instant 0ms Custom Tooltip with White Theme & Top/Bottom Auto-Placement */}
                      <div
                        className={`pointer-events-none absolute z-50 hidden group-hover:flex flex-col whitespace-nowrap animate-fadeIn duration-75 ${
                          isTopRow ? "top-full mt-2" : "bottom-full mb-2"
                        } ${
                          w === 0
                            ? "left-0 translate-x-0 items-start"
                            : w === totalWeeks - 1
                            ? "right-0 left-auto translate-x-0 items-end"
                            : "left-1/2 -translate-x-1/2 items-center"
                        }`}
                      >
                        {isTopRow && (
                          <div
                            className={`h-2 w-2 -mb-1 rotate-45 border-t border-l border-zinc-200 bg-white z-10 ${
                              w === 0 ? "ml-4" : w === totalWeeks - 1 ? "mr-4" : ""
                            }`}
                          />
                        )}
                        <div className="rounded-xl bg-white px-3 py-1.5 text-xs text-zinc-900 shadow-xl border border-zinc-200/90 flex items-center gap-2 font-medium">
                          <span className="text-zinc-500 font-normal">{formattedDate}</span>
                          <span className="h-3 w-px bg-zinc-200" />
                          <span className="font-bold text-blue-600">
                            {count} câu hỏi
                          </span>
                        </div>
                        {!isTopRow && (
                          <div
                            className={`h-2 w-2 -mt-1 rotate-45 border-b border-r border-zinc-200 bg-white z-10 ${
                              w === 0 ? "ml-4" : w === totalWeeks - 1 ? "mr-4" : ""
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-xs text-zinc-500">
          <span className="font-medium">{labelNoActivity}:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#f4f4f5" }} />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#a1caff" }} />
            <span>{labelFew}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#6baafc" }} />
            <span>{labelModerate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />
            <span>{labelMany}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import { getBenchmarkByTitleOrRole } from "../../../utils/benchmark";

const getBenchmark = (profile: ProfileSummary | null): number[] => {
  if (!profile) return getBenchmarkByTitleOrRole(null);
  return getBenchmarkByTitleOrRole(getProfileTitle(profile));
};

// ── Main Component ──
const DashboardPage = () => {
  const { t, i18n } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const userInfo = useUserStore((s) => s.userInfo);

  // Progress (streak, rank, daily stats)
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  // Profiles dropdown
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileSummary | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [profileSwitchError, setProfileSwitchError] = useState<string | null>(null);
  const profileErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Profile stats
  const [profileData, setProfileData] = useState<ProfileDashboardData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);

  // PDF export state
  const [isExportingImage, setIsExportingImage] = useState(false);

  // Upgrade Tier Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(
    () => typeof window !== "undefined" && window.location.hash === "#pricing"
  );

  useEffect(() => {
    if (location.hash === "#pricing") {
      setIsUpgradeModalOpen(true);
    }
  }, [location.hash]);

  // Streak Info Modal State
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const streakPopoverRef = useRef<HTMLDivElement>(null);

  // ── Share Feature State ──
  const [isSharing, setIsSharing] = useState(false);
  const [shareConfirmModal, setShareConfirmModal] = useState<{
    isOpen: boolean;
    type: "grade" | "streak" | null;
  }>({ isOpen: false, type: null });
  const [shareModalError, setShareModalError] = useState<string | null>(null);
  const [shareModalSuccess, setShareModalSuccess] = useState(false);

  const handleOpenShareModal = useCallback(
    (type: "grade" | "streak") => {
      setShareModalError(null);
      setShareModalSuccess(false);
      if (type === "grade" && !selectedProfile) {
        setShareModalError(t("share.selectProfileFirst"));
      }
      setShareConfirmModal({ isOpen: true, type });
    },
    [selectedProfile, t]
  );

  const handleExecuteShare = useCallback(async () => {
    if (!shareConfirmModal.type) return;
    setShareModalError(null);
    setIsSharing(true);
    try {
      if (shareConfirmModal.type === "grade") {
        if (!selectedProfile) {
          setShareModalError(t("share.selectProfileFirst"));
          setIsSharing(false);
          return;
        }
        await forumService.shareGrade(selectedProfile.id);
      } else if (shareConfirmModal.type === "streak") {
        await forumService.shareStreak();
      }
      setShareModalSuccess(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("share.errorMessage");
      setShareModalError(message);
    } finally {
      setIsSharing(false);
    }
  }, [shareConfirmModal.type, selectedProfile, t]);

  // ── Fetch progress on mount ──
  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardService.getProgress();
        setProgressData(res.data.data);
      } catch {
        // ignore
      } finally {
        setProgressLoading(false);
      }
    })();
  }, []);

  const handleSelectProfileDashboard = useCallback(
    async (targetProfile: ProfileSummary) => {
      setProfileDropdownOpen(false);
      setProfileLoading(true);
      setProfileError(false);

      try {
        const res = await dashboardService.getProfileStats(targetProfile.id);
        setProfileData(res.data.data);
        setSelectedProfile(targetProfile);
        setProfileSwitchError(null);
        if (profileErrorTimerRef.current) {
          clearTimeout(profileErrorTimerRef.current);
          profileErrorTimerRef.current = null;
        }
      } catch (err: unknown) {
        console.error("Failed to load profile stats:", err);
        let errorMsg = "Không thể tải dữ liệu hồ sơ này.";
        if (axios.isAxiosError(err)) {
          errorMsg = err.response?.data?.message || errorMsg;
        } else if (
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message
        ) {
          errorMsg = (
            err as { response?: { data?: { message?: string } } }
          ).response!.data!.message!;
        }
        setProfileSwitchError(errorMsg);

        // Auto dismiss error message after 10s
        if (profileErrorTimerRef.current) {
          clearTimeout(profileErrorTimerRef.current);
        }
        profileErrorTimerRef.current = setTimeout(() => {
          setProfileSwitchError(null);
        }, 10000);
      } finally {
        setProfileLoading(false);
      }
    },
    []
  );

  // ── Fetch profiles on mount ──
  useEffect(() => {
    (async () => {
      try {
        const res = await profileService.getProfiles();
        const list = res.data.data ?? [];
        setProfiles(list);
        if (list.length > 0) {
          void handleSelectProfileDashboard(list[0]);
        }
      } catch {
        // ignore
      }
    })();
  }, [handleSelectProfileDashboard]);

  useEffect(() => {
    return () => {
      if (profileErrorTimerRef.current) {
        clearTimeout(profileErrorTimerRef.current);
      }
    };
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        streakPopoverRef.current &&
        !streakPopoverRef.current.contains(e.target as Node)
      ) {
        setIsStreakModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExportImage = async () => {
    const el = dashboardRef.current;
    if (!el) return;
    setIsExportingImage(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fafafa',
      });

      // Convert to JPEG with 0.8 quality for much smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.8);

      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'dashboard-report.jpg';
      link.click();
    } catch {
      // fallback: open print dialog
      window.print();
    } finally {
      setIsExportingImage(false);
    }
  };

  // ── Greeting ──
  const greetingKey = getGreeting();

  // ── Stat calculations ──
  const interviewsThisWeek = profileData?.totalInterviewsThisWeek ?? 0;
  const interviewsLastWeek = profileData?.totalInterviewsLastWeek ?? 0;
  const weekChange =
    interviewsLastWeek === 0
      ? interviewsThisWeek > 0
        ? 100
        : 0
      : Math.round(
          ((interviewsThisWeek - interviewsLastWeek) / interviewsLastWeek) * 100
        );

  const avgScore = profileData?.averageTotalPoint ?? 0;
  const readinessScore = Math.min(100, Math.round(avgScore * 10));

  // ── Skill overview for radar ──
  const skillOverview = profileData?.skillOverview ?? {
    coreKnowledge: 0,
    problemSolving: 0,
    appliedExperience: 0,
    logicalArticulation: 0,
    focusAndCompleteness: 0,
  };

  const userRadarValues = [
    skillOverview.coreKnowledge,
    skillOverview.problemSolving,
    skillOverview.appliedExperience,
    skillOverview.logicalArticulation,
    skillOverview.focusAndCompleteness,
  ];

  const benchmarkValues = getBenchmark(selectedProfile);

  const radarLabels = [
    t("skills.coreKnowledge"),
    t("skills.problemSolving"),
    t("skills.appliedExperience"),
    t("skills.logicalArticulation"),
    t("skills.focusAndCompleteness"),
  ];

  // ── Gauge level label ──
  const gaugeLevelLabel = [
    t("readiness.levels.novice"),
    t("readiness.levels.beginner"),
    t("readiness.levels.developing"),
    t("readiness.levels.maturing"),
    t("readiness.levels.expert"),
  ].join("|");

  // ── Navigate to chatbot with prompt ──
  const handleViewResult = () => {
    const lang = i18n.language?.startsWith("vi") ? "vi" : "en";
    const profileTitle = selectedProfile
      ? getProfileTitle(selectedProfile)
      : "N/A";
    const improvementRate = profileData?.improvementRate;

    let prompt: string;
    if (lang === "vi") {
      prompt =
        `Đánh giá kết quả học tập của tôi trên hệ thống\n\n` +
        `Hồ sơ đang chọn: ${profileTitle}\n` +
        `Xếp hạng hiện tại: ${progressData?.currentRank ?? "N/A"}\n` +
        `Chuỗi luyện tập liên tiếp: ${progressData?.streak.currentStreak ?? 0} ngày\n` +
        `Số buổi phỏng vấn tuần này: ${interviewsThisWeek}\n` +
        `Số buổi phỏng vấn tuần trước: ${interviewsLastWeek}\n` +
        `Điểm trung bình 10 buổi gần nhất: ${avgScore.toFixed(2)}/10\n` +
        `Tỷ lệ cải thiện: ${improvementRate !== null && improvementRate !== undefined ? improvementRate + "%" : "Chưa đủ dữ liệu (cần ít nhất 10 buổi)"}\n` +
        `Độ sẵn sàng phỏng vấn: ${readinessScore}/100\n\n` +
        `Năng lực theo kỹ năng:\n` +
        `- Kiến thức nền tảng: ${skillOverview.coreKnowledge}/10\n` +
        `- Giải quyết vấn đề: ${skillOverview.problemSolving}/10\n` +
        `- Kinh nghiệm thực tiễn: ${skillOverview.appliedExperience}/10\n` +
        `- Diễn đạt logic: ${skillOverview.logicalArticulation}/10\n` +
        `- Tập trung & hoàn thiện: ${skillOverview.focusAndCompleteness}/10\n\n` +
        `Dựa trên các thông tin trên, hãy đưa ra nhận xét chi tiết về kết quả học tập của tôi, điểm mạnh, điểm yếu cần cải thiện và lộ trình phát triển phù hợp.`;
    } else {
      prompt =
        `Evaluate my learning progress on the system\n\n` +
        `Selected Profile: ${profileTitle}\n` +
        `Current Rank: ${progressData?.currentRank ?? "N/A"}\n` +
        `Practice Streak: ${progressData?.streak.currentStreak ?? 0} days\n` +
        `Interviews this week: ${interviewsThisWeek}\n` +
        `Interviews last week: ${interviewsLastWeek}\n` +
        `Average score (last 10 sessions): ${avgScore.toFixed(2)}/10\n` +
        `Improvement rate: ${improvementRate !== null && improvementRate !== undefined ? improvementRate + "%" : "Not enough data (need at least 10 sessions)"}\n` +
        `Interview readiness: ${readinessScore}/100\n\n` +
        `Skill overview:\n` +
        `- Core Knowledge: ${skillOverview.coreKnowledge}/10\n` +
        `- Problem Solving: ${skillOverview.problemSolving}/10\n` +
        `- Applied Experience: ${skillOverview.appliedExperience}/10\n` +
        `- Logical Articulation: ${skillOverview.logicalArticulation}/10\n` +
        `- Focus & Completeness: ${skillOverview.focusAndCompleteness}/10\n\n` +
        `Based on the data above, please provide a detailed evaluation of my learning results, strengths, areas to improve, and a suitable development roadmap.`;
    }

    navigate("/chatbot", { state: { initialPrompt: prompt } });
  };

  return (
    <div className="w-full" ref={dashboardRef}>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Row 1: Greeting + Rank + PDF ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              {t(`greeting.${greetingKey}`)},{" "}
              <span className="text-blue-600">
                {userInfo?.fullName || t("user.name", "User")}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            {progressLoading ? (
              <div className="h-9 w-28 animate-pulse rounded-full bg-zinc-100" />
            ) : (
              <div
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold ${getRankColor(progressData?.currentRank ?? "")}`}
              >
                <Trophy className="h-4 w-4" />
                {progressData?.currentRank ?? t("noRank")}
              </div>
            )}
            {/* Image export */}
            <button
              onClick={handleExportImage}
              disabled={isExportingImage}
              className="no-print flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isExportingImage ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              ) : (
                <Download className="h-4 w-4 text-zinc-500" />
              )}
              {t("exportImage")}
            </button>
          </div>
        </div>

        {/* ── Active Subscription Tier Banner ── */}
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/90 via-white to-purple-50/70 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-600 text-white shadow-md shadow-slate-200">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-600">
                  {t("subscription.currentTier")}
                </span>
                <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                  {userInfo?.activeTier || "BASIC"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                {userInfo?.subscriptionEndDate ? (
                  t("subscription.expiresAt", {
                    date: formatSubscriptionDate(userInfo.subscriptionEndDate),
                  })
                ) : (
                  t("subscription.freeTierDesc")
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <ArrowUp className="h-4 w-4 text-amber-400" />
            <span>
              {(() => {
                const tier = (userInfo?.activeTier || "BASIC").toUpperCase();
                if (tier.startsWith("PRO")) {
                  return t("subscription.viewPlans");
                }
                if (tier.startsWith("PLUS")) {
                  return t("subscription.switchTier");
                }
                return t("subscription.upgradePro");
              })()}
            </span>
          </button>
        </div>

        {/* ── Profile Switch Error Banner (Dismissable & Auto-dismiss in 10s) ── */}
        {profileSwitchError && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-rose-800 mt-0.5 leading-relaxed">
                  {profileSwitchError}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setProfileSwitchError(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-900 p-1 cursor-pointer shrink-0 ml-2 rounded-md hover:bg-rose-100 transition"
              title="Đóng thông báo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Row 2: Profile Dropdown + Share Buttons + Streak ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Profile dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen((p) => !p)}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] cursor-pointer"
            >
              <Brain className="h-4 w-4 text-blue-500" />
              <span>
                {selectedProfile
                  ? getProfileTitle(selectedProfile)
                  : t("selectProfile")}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-zinc-500 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileDropdownOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 min-w-[220px] rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl">
                {profiles.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-zinc-500">
                    {t("noProfiles")}
                  </p>
                ) : (
                  profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProfileDashboard(p)}
                      className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-zinc-50 cursor-pointer ${selectedProfile?.id === p.id ? "font-semibold text-sky-600" : "text-zinc-700"}`}
                    >
                      {getProfileTitle(p)}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Share Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenShareModal("grade")}
              disabled={isSharing}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-xs transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] cursor-pointer disabled:opacity-60"
              title={t("share.shareGrade")}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>{t("share.shareGrade")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenShareModal("streak")}
              disabled={isSharing}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-xs transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] cursor-pointer disabled:opacity-60"
              title={t("share.shareStreak")}
            >
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>{t("share.shareStreak")}</span>
            </button>
          </div>

          {/* Streak Popover Button & Card */}
          {!progressLoading && (
            <div className="relative" ref={streakPopoverRef}>
              <button
                type="button"
                onClick={() => setIsStreakModalOpen((prev) => !prev)}
                title={t("streakModal.title")}
                className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer ${
                  isStreakModalOpen
                    ? "border-amber-300 bg-amber-100/90 text-amber-900 shadow-sm ring-2 ring-amber-200"
                    : "border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/90 to-rose-50/90 text-amber-900 hover:border-amber-300 hover:from-amber-100 hover:via-orange-100 hover:to-rose-100 hover:shadow-sm active:scale-[0.98]"
                }`}
              >
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs group-hover:scale-110 transition-transform">
                  <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current animate-pulse" />
                </div>
                <span>
                  {t("streak", {
                    count: progressData?.streak.currentStreak ?? 0,
                  })}
                </span>
              </button>

              {/* Popover Card directly below button */}
              <StreakInfoModal
                isOpen={isStreakModalOpen}
                onClose={() => setIsStreakModalOpen(false)}
                currentStreak={progressData?.streak.currentStreak ?? 0}
                longestStreak={progressData?.streak.longestStreak ?? 0}
              />
            </div>
          )}
        </div>

        {/* ── Row 3: 3 small stat cards ── */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1: Interviews this week */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-zinc-600">
                {t("stats.interviewsThisWeek")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            {profileLoading ? (
              <div className="h-12 w-20 animate-pulse rounded-lg bg-zinc-100" />
            ) : (
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
                  {interviewsThisWeek}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold border ${
                    weekChange >= 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  <TrendingUp
                    className={`h-3 w-3 ${weekChange < 0 ? "rotate-180" : ""}`}
                  />
                  {weekChange >= 0 ? "+" : ""}
                  {weekChange}%
                </span>
              </div>
            )}
            <p className="mt-2 text-xs text-zinc-400 font-medium">
              {t("stats.vsLastWeek")}
            </p>
          </div>

          {/* Card 2: Average score */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-200">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-zinc-600">
                {t("stats.avgScore")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs">
                <Brain className="h-4 w-4" />
              </div>
            </div>
            {profileLoading ? (
              <div className="h-12 w-20 animate-pulse rounded-lg bg-zinc-100" />
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
                  {avgScore.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-zinc-400">/ 10</span>
              </div>
            )}
            <p className="mt-2 text-xs text-zinc-400 font-medium">
              {t("stats.last10Sessions")}
            </p>
          </div>

          {/* Card 3: Improvement rate */}
          {(() => {
            const rate = profileData?.improvementRate;
            const hasRate = rate !== null && rate !== undefined;
            const isPos = hasRate && rate > 0;
            const isNeg = hasRate && rate < 0;

            const cardBorderHover = isPos
              ? "hover:border-emerald-200"
              : isNeg
              ? "hover:border-rose-200"
              : "hover:border-zinc-300";

            return (
              <div
                className={`rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md ${cardBorderHover} transition-all duration-200`}
              >
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-zinc-600">
                    {t("stats.improvementRate")}
                  </span>
                  {isPos ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  ) : isNeg ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 border border-zinc-200 shadow-xs">
                      <Minus className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {profileLoading ? (
                  <div className="h-12 w-24 animate-pulse rounded-lg bg-zinc-100" />
                ) : hasRate ? (
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                        isPos
                          ? "text-emerald-600"
                          : isNeg
                          ? "text-rose-600"
                          : "text-zinc-600"
                      }`}
                    >
                      {isPos ? `+${rate}` : rate}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50/90 border border-amber-200/70 p-2.5">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                    <p className="text-xs font-medium text-amber-800 leading-snug">
                      {t("stats.notEnoughData")}
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-zinc-400 font-medium">
                  {t("stats.improvementDesc")}
                </p>
              </div>
            );
          })()}
        </div>

        {/* ── Row 4: 3 large cards ── */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Card A: Readiness Gauge */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-zinc-900">
              {t("readiness.title")}
            </h2>
            {profileLoading ? (
              <div className="flex h-56 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <GaugeChart value={readinessScore} label={gaugeLevelLabel} />
            )}
          </div>

          {/* Card B: Skill Radar */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-2 text-base font-semibold text-zinc-900">
              {t("radar.title")}
            </h2>
            {profileLoading ? (
              <div className="flex h-56 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <RadarChart
                    userValues={userRadarValues}
                    benchmarkValues={benchmarkValues}
                    labels={radarLabels}
                  />
                </div>
                {/* Legend */}
                <div className="mt-1 flex items-center justify-center gap-5 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <svg width="20" height="8">
                      <line
                        x1="0"
                        y1="4"
                        x2="20"
                        y2="4"
                        stroke="#eab308"
                        strokeWidth="2"
                        strokeDasharray="4,3"
                      />
                    </svg>
                    <span>{t("radar.benchmark")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="20" height="8">
                      <line
                        x1="0"
                        y1="4"
                        x2="20"
                        y2="4"
                        stroke="#7c3aed"
                        strokeWidth="2.5"
                      />
                      <circle cx="10" cy="4" r="3" fill="#7c3aed" />
                    </svg>
                    <span>{t("radar.yourScore")}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Card C: View result */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
              <Eye className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="mb-2 text-base font-semibold text-zinc-900">
              {t("review.title")}
            </h2>
            <p className="mb-8 max-w-[220px] text-sm leading-6 text-zinc-500">
              {t("review.description")}
            </p>
            <button
              onClick={handleViewResult}
              className="rounded-full bg-zinc-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
            >
              {t("review.cta")}
            </button>
          </div>
        </div>

        {/* ── Row 5: Activity Heatmap ── */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">
              {t("heatmap.title")}
            </h2>
          </div>
          {progressLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            </div>
          ) : profileError ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-zinc-400">
              <AlertCircle className="h-5 w-5" />
              {t("heatmap.error")}
            </div>
          ) : (
            <ActivityHeatmap
              data={progressData?.dailyStats ?? []}
              labelNoActivity={t("heatmap.legend.noActivity")}
              labelFew={t("heatmap.legend.few")}
              labelModerate={t("heatmap.legend.moderate")}
              labelMany={t("heatmap.legend.many")}
              labelDays={[
                t("heatmap.days.mon"),
                t("heatmap.days.tue"),
                t("heatmap.days.wed"),
                t("heatmap.days.thu"),
                t("heatmap.days.fri"),
                t("heatmap.days.sat"),
                t("heatmap.days.sun"),
              ]}
            />
          )}
        </div>
      </section>

      {/* Fullscreen Upgrade Tier Modal */}
      <UpgradeTierModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={userInfo?.activeTier ?? "BASIC"}
      />

      {/* ── Share Confirm / Success Modal ── */}
      {shareConfirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => {
            if (!isSharing) {
              setShareConfirmModal({ isOpen: false, type: null });
              setShareModalError(null);
              setShareModalSuccess(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {shareModalSuccess ? (
              /* ── Success State View inside Modal ── */
              <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">
                  {t("share.shareSuccessTitle")}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                  {t("share.shareSuccessDesc")}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShareConfirmModal({ isOpen: false, type: null });
                      setShareModalSuccess(false);
                      setShareModalError(null);
                      navigate("/forum");
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98] cursor-pointer"
                  >
                    <span>{t("share.viewForum")}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShareConfirmModal({ isOpen: false, type: null });
                      setShareModalSuccess(false);
                      setShareModalError(null);
                    }}
                    className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] cursor-pointer"
                  >
                    {t("share.closeBtn")}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Confirm State View inside Modal ── */
              <>
                {/* Header Icon + Title */}
                <div className="mb-4 flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      shareConfirmModal.type === "grade"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}
                  >
                    {shareConfirmModal.type === "grade" ? (
                      <Trophy className="h-6 w-6" />
                    ) : (
                      <Flame className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      {shareConfirmModal.type === "grade"
                        ? t("share.confirmTitleGrade")
                        : t("share.confirmTitleStreak")}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {shareConfirmModal.type === "grade"
                        ? t("share.confirmDescGrade", {
                            title: selectedProfile
                              ? getProfileTitle(selectedProfile)
                              : "",
                            score: (profileData?.averageTotalPoint ?? 0).toFixed(1),
                          })
                        : t("share.confirmDescStreak", {
                            count: progressData?.streak.currentStreak ?? 0,
                          })}
                    </p>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  {shareConfirmModal.type === "grade" ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-zinc-500">
                          {t("selectProfile")}
                        </p>
                        <p className="text-sm font-bold text-zinc-900 mt-0.5">
                          {selectedProfile
                            ? getProfileTitle(selectedProfile)
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-zinc-500">
                          {t("stats.avgScore")}
                        </p>
                        <p className="text-base font-extrabold text-amber-600 mt-0.5">
                          {(profileData?.averageTotalPoint ?? 0).toFixed(1)} / 10
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-zinc-500">
                          {t("streak", { count: 0 }).replace(/\d+/, "").trim()}
                        </p>
                        <p className="text-sm font-bold text-zinc-900 mt-0.5">
                          {progressData?.streak.currentStreak ?? 0} ngày liên tiếp
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Flame className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message inside Modal */}
                {shareModalError && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <p className="flex-1 leading-relaxed">{shareModalError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSharing}
                    onClick={() => {
                      setShareConfirmModal({ isOpen: false, type: null });
                      setShareModalError(null);
                      setShareModalSuccess(false);
                    }}
                    className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {t("share.cancelBtn")}
                  </button>
                  <button
                    type="button"
                    disabled={isSharing}
                    onClick={handleExecuteShare}
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{t("share.sharing")}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        <span>{t("share.confirmBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
