import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Download,
  Flame,
  Trophy,
  TrendingUp,
  BarChart3,
  Brain,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import profileService, {
  type ProfileSummary,
  getProfileTitle,
} from "../../../services/user/profileService";
import dashboardService, {
  type ProgressData,
  type ProfileDashboardData,
} from "../../../services/user/dashboardService";

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
      return "text-indigo-600 bg-indigo-50 border-indigo-200";
    case "DIAMOND":
      return "text-sky-600 bg-sky-50 border-sky-200";
    default:
      return "text-zinc-600 bg-zinc-100 border-zinc-200";
  }
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

// ── Activity Heatmap — 13 weeks, large cells with numbers ──
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
  const today = new Date();
  const weeks = 13; // max 91 days from API
  const totalDays = weeks * 7;

  // Build date→count map
  const map: Record<string, number> = {};
  data.forEach((d) => {
    map[d.date] = d.totalQuestions;
  });

  // Build cells: earliest first
  const cells: {
    date: string;
    count: number;
    weekIdx: number;
    dayIdx: number;
  }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0..Sun=6
    const weekIdx = Math.floor((totalDays - 1 - i) / 7);
    cells.push({ date: dateStr, count: map[dateStr] ?? 0, weekIdx, dayIdx: adjustedDay });
  }

  const getBgColor = (count: number) => {
    if (count === 0) return "#f4f4f5"; // zinc-100
    if (count < 3) return "#a5b4fc"; // indigo-300
    if (count < 8) return "#6366f1"; // indigo-500
    return "#3730a3"; // indigo-800
  };

  const getTextColor = (count: number) => {
    if (count === 0) return "#a1a1aa"; // zinc-400
    if (count < 3) return "#3730a3"; // dark indigo
    return "#ffffff";
  };

  // Month labels
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const cell = cells.find((c) => c.weekIdx === w && c.dayIdx === 0);
    if (cell) {
      const m = new Date(cell.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: monthNames[m], weekIdx: w });
        lastMonth = m;
      }
    }
  }

  const gridByWeekDay: Record<string, (typeof cells)[0]> = {};
  cells.forEach((c) => {
    gridByWeekDay[`${c.weekIdx}-${c.dayIdx}`] = c;
  });

  // Cell dimensions — large enough to fit numbers
  const CELL = 46; // px width
  const CELL_H = 38; // px height
  const GAP = 4;
  const DAY_LABEL_W = 36;

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: DAY_LABEL_W + weeks * (CELL + GAP) }}>
        {/* Month header — uses same flex layout as the grid so columns align */}
        <div className="mb-1 flex">
          {/* Spacer matching day-label column */}
          <div className="flex-shrink-0" style={{ width: DAY_LABEL_W }} />
          {/* Month columns matching grid columns */}
          <div className="flex flex-1" style={{ gap: GAP }}>
            {Array.from({ length: weeks }).map((_, w) => {
              const ml = monthLabels.find((m) => m.weekIdx === w);
              return (
                <div key={w} style={{ flex: 1, minWidth: 0 }} className="text-xs font-medium text-zinc-500">
                  {ml?.label ?? ""}
                </div>
              );
            })}
          </div>
        </div>

      <div className="flex">
        {/* Day labels */}
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

        {/* Grid */}
        <div className="flex flex-1" style={{ gap: GAP }}>
          {Array.from({ length: weeks }).map((_, w) => (
            <div
              key={w}
              className="flex flex-col"
              style={{ flex: 1, gap: GAP }}
            >
              {Array.from({ length: 7 }).map((_, d) => {
                const cell = gridByWeekDay[`${w}-${d}`];
                const count = cell?.count ?? 0;
                const isEmpty = !cell;

                return (
                  <div
                    key={d}
                    title={cell ? `${cell.date}: ${count} câu hỏi` : ""}
                    className="flex items-center justify-center rounded-md text-xs font-bold transition-transform hover:scale-105"
                    style={{
                      height: CELL_H,
                      backgroundColor: isEmpty ? "transparent" : getBgColor(count),
                      color: isEmpty ? "transparent" : getTextColor(count),
                      fontSize: count >= 100 ? 10 : count >= 10 ? 11 : 12,
                    }}
                  >
                    {!isEmpty && count > 0 ? count : !isEmpty ? "" : ""}
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
          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#a5b4fc" }} />
          <span>{labelFew}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#6366f1" }} />
          <span>{labelModerate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: "#3730a3" }} />
          <span>{labelMany}</span>
        </div>
      </div>
      </div>
    </div>
  );
};

// ── Benchmark data by position+level ──
const BENCHMARK_MAP: Record<string, number[]> = {
  default: [5, 5, 5, 5, 5],
  INTERN_FRONTEND: [5, 4, 3, 5, 5],
  INTERN_BACKEND: [5, 5, 3, 5, 5],
  INTERN_TESTER: [4, 4, 3, 5, 6],
  INTERN_DATA_ANALYST: [5, 5, 3, 5, 5],
  FRESHER_FRONTEND: [6, 5, 4, 6, 6],
  FRESHER_BACKEND: [7, 6, 4, 6, 6],
  FRESHER_TESTER: [5, 5, 4, 6, 7],
  FRESHER_DATA_ANALYST: [6, 6, 4, 6, 6],
};

const getBenchmark = (profile: ProfileSummary | null): number[] => {
  if (!profile) return BENCHMARK_MAP["default"];
  const title = getProfileTitle(profile).toUpperCase();
  for (const key of Object.keys(BENCHMARK_MAP)) {
    if (key === "default") continue;
    const parts = key.split("_");
    if (parts.every((p) => title.includes(p))) return BENCHMARK_MAP[key];
  }
  return BENCHMARK_MAP["default"];
};

// ── Main Component ──
const DashboardPage = () => {
  const { t, i18n } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Progress (streak, rank, daily stats)
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  // Profiles dropdown
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileSummary | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Profile stats
  const [profileData, setProfileData] = useState<ProfileDashboardData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);

  // PDF export state
  const [isExportingImage, setIsExportingImage] = useState(false);

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

  // ── Fetch profiles on mount ──
  useEffect(() => {
    (async () => {
      try {
        const res = await profileService.getProfiles();
        const list = res.data.data ?? [];
        setProfiles(list);
        if (list.length > 0) setSelectedProfile(list[0]);
      } catch {
        // ignore
      }
    })();
  }, []);

  // ── Fetch profile stats when selected profile changes ──
  const fetchProfileStats = useCallback(async (id: number) => {
    setProfileLoading(true);
    setProfileError(false);
    try {
      const res = await dashboardService.getProfileStats(id);
      setProfileData(res.data.data);
    } catch {
      setProfileError(true);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      fetchProfileStats(selectedProfile.id);
    }
  }, [selectedProfile, fetchProfileStats]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
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
              <span className="text-indigo-600">Nguyễn Văn A</span>
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
              className="no-print flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-60"
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

        {/* ── Row 2: Profile Dropdown + Streak ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Profile dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen((p) => !p)}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
            >
              <Brain className="h-4 w-4 text-indigo-500" />
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
                      onClick={() => {
                        setSelectedProfile(p);
                        setProfileDropdownOpen(false);
                      }}
                      className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-zinc-50 ${selectedProfile?.id === p.id ? "font-semibold text-indigo-600" : "text-zinc-700"}`}
                    >
                      {getProfileTitle(p)}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Streak */}
          {!progressLoading && (
            <div className="flex items-center gap-2 text-base font-semibold text-orange-600">
              <Flame className="h-5 w-5 animate-pulse" />
              {t("streak", {
                count: progressData?.streak.currentStreak ?? 0,
              })}
            </div>
          )}
        </div>

        {/* ── Row 3: 3 small stat cards ── */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1: Interviews this week */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
              <BarChart3 className="h-4 w-4" />
              {t("stats.interviewsThisWeek")}
            </div>
            {profileLoading ? (
              <div className="h-12 w-20 animate-pulse rounded-lg bg-zinc-100" />
            ) : (
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold text-zinc-900">
                  {interviewsThisWeek}
                </span>
                <span
                  className={`mb-2 flex items-center gap-0.5 text-sm font-semibold ${weekChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  <TrendingUp
                    className={`h-4 w-4 ${weekChange < 0 ? "rotate-180" : ""}`}
                  />
                  {weekChange >= 0 ? "+" : ""}
                  {weekChange}%
                </span>
              </div>
            )}
            <p className="mt-2 text-sm text-zinc-400">{t("stats.vsLastWeek")}</p>
          </div>

          {/* Card 2: Average score */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Brain className="h-4 w-4" />
              {t("stats.avgScore")}
            </div>
            {profileLoading ? (
              <div className="h-12 w-20 animate-pulse rounded-lg bg-zinc-100" />
            ) : (
              <span className="text-5xl font-bold text-zinc-900">
                {avgScore.toFixed(1)}
              </span>
            )}
            <p className="mt-2 text-sm text-zinc-400">
              {t("stats.last10Sessions")}
            </p>
          </div>

          {/* Card 3: Improvement rate */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
              <TrendingUp className="h-4 w-4" />
              {t("stats.improvementRate")}
            </div>
            {profileLoading ? (
              <div className="h-12 w-24 animate-pulse rounded-lg bg-zinc-100" />
            ) : profileData?.improvementRate !== null &&
              profileData?.improvementRate !== undefined ? (
              <span className="text-5xl font-bold text-zinc-900">
                {profileData.improvementRate}%
              </span>
            ) : (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <p className="text-sm text-amber-700">
                  {t("stats.notEnoughData")}
                </p>
              </div>
            )}
            <p className="mt-2 text-sm text-zinc-400">
              {t("stats.improvementDesc")}
            </p>
          </div>
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
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
              <Eye className="h-10 w-10 text-indigo-600" />
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
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
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
    </div>
  );
};

export default DashboardPage;
