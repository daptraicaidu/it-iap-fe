import { useEffect, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Flame,
  Trophy,
  Heart,
  Laugh,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  MessageCircle,
  ChevronDown,
  Brain,
  Crown,
  ThumbsUp,
  Zap,
  Filter,
} from "lucide-react";
import useForumStore from "../../../store/forumStore";
import type {
  ForumPost,
  ReactionType,
  GradeSharedData,
  StreakSharedData,
  UserRank,
  SkillOverviewDTO,
} from "../../../services/user/forumService";
import profileService, {
  type ProfileSummary,
  getProfileTitle,
} from "../../../services/user/profileService";

// ── Time Ago Helper ──
const useTimeAgo = () => {
  const { t } = useTranslation("Forum");

  return useCallback(
    (dateStr: string) => {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffMin < 1) return t("justNow");
      if (diffMin < 60) return t("minutesAgo", { count: diffMin });
      if (diffHr < 24) return t("hoursAgo", { count: diffHr });
      return t("daysAgo", { count: diffDay });
    },
    [t]
  );
};

// ── Rank Helpers ──
const getRankGradient = (rank: UserRank): string => {
  switch (rank) {
    case "DIAMOND":
      return "from-sky-50 via-indigo-50/50 to-blue-50 border-sky-200";
    case "GOLD":
      return "from-yellow-50 via-amber-50/50 to-orange-50 border-yellow-200";
    case "SILVER":
      return "from-zinc-50 via-slate-100/50 to-zinc-100 border-zinc-300";
    case "BRONZE":
      return "from-amber-50 via-orange-50/50 to-stone-50 border-amber-200";
    default:
      return "from-zinc-50 to-zinc-100 border-zinc-200";
  }
};

const getRankTextColor = (rank: UserRank): string => {
  switch (rank) {
    case "DIAMOND":
      return "text-sky-700";
    case "GOLD":
      return "text-yellow-700";
    case "SILVER":
      return "text-zinc-600";
    case "BRONZE":
      return "text-amber-700";
    default:
      return "text-zinc-600";
  }
};

const getRankIcon = (rank: UserRank): string => {
  switch (rank) {
    case "DIAMOND":
      return "💎";
    case "GOLD":
      return "🥇";
    case "SILVER":
      return "🥈";
    case "BRONZE":
      return "🥉";
    default:
      return "🏅";
  }
};

// ── Radar Chart SVG Component (from Dashboard) ──
interface RadarChartProps {
  userValues: number[]; // 5 skills 0..10
  benchmarkValues: number[]; // 5 skills 0..10
  labels: string[];
}

const RadarChart = ({ userValues, benchmarkValues, labels }: RadarChartProps) => {
  const cx = 200;
  const cy = 140;
  const maxR = 85;
  const levels = 5;
  const n = labels.length;
  const labelOffset = 24;

  const angleFor = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;

  const pointOnAxis = (i: number, r: number) => ({
    x: cx + r * Math.cos(angleFor(i)),
    y: cy + r * Math.sin(angleFor(i)),
  });

  const toPath = (values: number[]) =>
    values
      .map((v, i) => {
        const clamped = Math.max(0, Math.min(10, v));
        const p = pointOnAxis(i, (clamped / 10) * maxR);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  return (
    <svg viewBox="0 0 400 280" className="w-full max-w-[340px] h-auto mx-auto drop-shadow-sm">
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
            fill={li % 2 === 0 ? "rgba(244,244,245,0.5)" : "none"}
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
        fill="rgba(234,179,8,0.06)"
        stroke="#eab308"
        strokeWidth="1.5"
        strokeDasharray="4,3"
      />

      {/* User (solid indigo) */}
      <path
        d={toPath(userValues)}
        fill="rgba(99,102,241,0.2)"
        stroke="#6366f1"
        strokeWidth="2.2"
      />

      {/* Dots */}
      {userValues.map((v, i) => {
        const clamped = Math.max(0, Math.min(10, v));
        const p = pointOnAxis(i, (clamped / 10) * maxR);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4f46e5" stroke="#ffffff" strokeWidth="1" />;
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const p = pointOnAxis(i, maxR + labelOffset);
        const anchor =
          Math.abs(p.x - cx) < 10 ? "middle" : p.x < cx ? "end" : "start";

        return (
          <text
            key={i}
            x={p.x.toFixed(2)}
            y={p.y.toFixed(2)}
            textAnchor={anchor}
            fontSize="12.5"
            fill="#3f3f46"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
            dominantBaseline="middle"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

// ── Streak Content Card (With Special Effects for Large Streaks) ──
const StreakCard = ({ data, t }: { data: StreakSharedData; t: (key: string, opts?: Record<string, unknown>) => string }) => {
  const streak = data.currentStreak;

  // Determine streak tier for special styling
  let containerStyle = "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50";
  let badgeTitle = t("streakTitle");
  let badgeTag: string | null = null;
  let iconEffect = "text-orange-500";

  if (streak >= 30) {
    containerStyle = "border-purple-300 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white shadow-xl shadow-purple-500/20 ring-2 ring-purple-400/50";
    badgeTitle = t("streakTitle");
    badgeTag = t("masterStreak");
    iconEffect = "text-amber-400 animate-bounce";
  } else if (streak >= 14) {
    containerStyle = "border-amber-300 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/20 ring-2 ring-amber-300/60";
    badgeTitle = t("streakTitle");
    badgeTag = t("legendaryStreak");
    iconEffect = "text-yellow-200 animate-pulse";
  } else if (streak >= 7) {
    containerStyle = "border-orange-300 bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 text-orange-950 shadow-md shadow-orange-300/30";
    badgeTag = t("superStreak");
    iconEffect = "text-orange-600 animate-pulse";
  }

  const isDark = streak >= 14;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all ${containerStyle}`}>
      {/* Background glow effect for large streaks */}
      {streak >= 14 && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-yellow-400/20 blur-2xl pointer-events-none" />
      )}

      {/* Special Badge Tag */}
      {badgeTag && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-300 border border-white/30">
          <Zap className="h-3.5 w-3.5 fill-current" />
          {badgeTag}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isDark ? "bg-white/20 backdrop-blur-md" : "bg-orange-100"}`}>
          <Flame className={`h-8 w-8 ${iconEffect}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-orange-200" : "text-orange-600/90"}`}>
            {badgeTitle}
          </p>
          <p className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-orange-700"}`}>
            {t("streakDays", { count: streak })}
          </p>
        </div>
      </div>

      {/* Streak visual progress bar */}
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: Math.min(streak, 14) }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-all ${isDark ? "bg-amber-300" : "bg-orange-400"}`}
            style={{ opacity: 0.4 + (i / Math.min(streak, 14)) * 0.6 }}
          />
        ))}
        {streak > 14 && (
          <span className={`ml-1 text-xs font-bold ${isDark ? "text-amber-300" : "text-orange-600"}`}>
            +{streak - 14}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Grade Content Card (Using Radar Chart) ──
const GradeCard = ({ data, t, lang }: { data: GradeSharedData; t: (key: string, opts?: Record<string, unknown>) => string; lang: string }) => {
  const rank: UserRank = data.userRank ?? "BRONZE";
  const rankLower = rank.charAt(0) + rank.slice(1).toLowerCase();
  const rankKey = `rank${rankLower}` as
    | "rankDiamond"
    | "rankGold"
    | "rankSilver"
    | "rankBronze";

  const skills: SkillOverviewDTO | null = data.profileSkillsOverview;

  const radarLabels = lang.startsWith("vi")
    ? ["Kiến thức nền", "Giải quyết VĐ", "Kinh nghiệm", "Diễn đạt logic", "Tập trung"]
    : ["Core Tech", "Problem Solving", "Experience", "Logic", "Completeness"];

  const userValues = skills
    ? [
        skills.coreKnowledge ?? 0,
        skills.problemSolving ?? 0,
        skills.appliedExperience ?? 0,
        skills.logicalArticulation ?? 0,
        skills.focusAndCompleteness ?? 0,
      ]
    : [0, 0, 0, 0, 0];

  const benchmarkValues = [5, 5, 5, 5, 5];

  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-5 ${getRankGradient(rank)}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-sm">
            <Trophy className={`h-6 w-6 ${getRankTextColor(rank)}`} />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${getRankTextColor(rank)} opacity-80`}>
              {t("gradeTitle")}
            </p>
            <p className={`text-2xl font-bold ${getRankTextColor(rank)}`}>
              {t("gradeScore", { score: (data.profileGpa ?? 0).toFixed(1) })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl">{getRankIcon(rank)}</span>
          <p className={`text-xs font-bold ${getRankTextColor(rank)}`}>
            {t(rankKey)}
          </p>
        </div>
      </div>

      {/* Radar Chart Display */}
      {skills && (
        <div className="mt-4 rounded-xl border border-white/60 bg-white/40 p-2 backdrop-blur-xs">
          <p className={`text-center text-xs font-semibold ${getRankTextColor(rank)} opacity-90 mb-1`}>
            {t("radarTitle", "Biểu đồ tổng quan năng lực")}
          </p>
          <RadarChart
            userValues={userValues}
            benchmarkValues={benchmarkValues}
            labels={radarLabels}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <MessageCircle className={`h-3.5 w-3.5 ${getRankTextColor(rank)} opacity-60`} />
          <p className={`${getRankTextColor(rank)} opacity-80`}>
            {t("completedInterviews", { count: data.totalCompletedInterviews ?? 0 })}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Facebook-style Reaction Hover Popover Component ──
interface FacebookReactionPopoverProps {
  myReaction: ReactionType | null;
  totalLove: number;
  totalHaha: number;
  totalWow: number;
  onReact: (type: ReactionType) => void;
}

const FacebookReactionPopover = ({
  myReaction,
  totalLove,
  totalHaha,
  totalWow,
  onReact,
}: FacebookReactionPopoverProps) => {
  const { t } = useTranslation("Forum");
  const [showPopover, setShowPopover] = useState(false);
  const popoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleMouseEnter = () => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    popoverTimeoutRef.current = setTimeout(() => {
      setShowPopover(false);
    }, 250);
  };

  const reactionsList: Array<{ type: ReactionType; icon: string; label: string; color: string }> = [
    { type: "LOVE", icon: "❤️", label: "Love", color: "text-rose-500" },
    { type: "HAHA", icon: "😂", label: "Haha", color: "text-amber-500" },
    { type: "WOW", icon: "😮", label: "Wow", color: "text-indigo-500" },
  ];

  const totalCount = totalLove + totalHaha + totalWow;

  const getMyReactionLabel = () => {
    switch (myReaction) {
      case "LOVE":
        return { text: "❤️ Love", color: "text-rose-600 font-bold" };
      case "HAHA":
        return { text: "😂 Haha", color: "text-amber-600 font-bold" };
      case "WOW":
        return { text: "😮 Wow", color: "text-indigo-600 font-bold" };
      default:
        return { text: t("react", "Bày tỏ cảm xúc"), color: "text-zinc-600 font-medium" };
    }
  };

  const currentLabel = getMyReactionLabel();

  return (
    <div className="flex items-center justify-between w-full border-t border-zinc-100 pt-2.5">
      {/* Reaction Hover Container */}
      <div
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Floating Facebook Popover */}
        {showPopover && (
          <div className="absolute bottom-full left-0 mb-2 z-40 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
            {reactionsList.map((r) => (
              <button
                key={r.type}
                type="button"
                onClick={() => {
                  onReact(r.type);
                  setShowPopover(false);
                }}
                className="group relative text-2xl transition-transform duration-200 hover:scale-135 active:scale-110"
                title={r.label}
              >
                <span>{r.icon}</span>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main React Action Button */}
        <button
          type="button"
          onClick={() => onReact(myReaction || "LOVE")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-all active:scale-95 ${
            myReaction
              ? "border-zinc-300 bg-zinc-100/80 shadow-xs"
              : "border-zinc-200 bg-white hover:bg-zinc-50"
          }`}
        >
          {myReaction ? (
            <span className="text-base">
              {myReaction === "LOVE" ? "❤️" : myReaction === "HAHA" ? "😂" : "😮"}
            </span>
          ) : (
            <ThumbsUp className="h-4 w-4 text-zinc-500" />
          )}
          <span className={currentLabel.color}>{currentLabel.text}</span>
        </button>
      </div>

      {/* Reactions Summary Counters */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
          {totalLove > 0 && (
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
              ❤️ {totalLove}
            </span>
          )}
          {totalHaha > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
              😂 {totalHaha}
            </span>
          )}
          {totalWow > 0 && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              😮 {totalWow}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ── Forum Post Card ──
interface PostCardProps {
  post: ForumPost;
  isMineTab: boolean;
  lang: string;
  onReact: (postId: number, type: ReactionType) => void;
  onToggleVisibility: (postId: number) => void;
}

const PostCard = ({ post, isMineTab, lang, onReact, onToggleVisibility }: PostCardProps) => {
  const { t } = useTranslation("Forum");
  const timeAgo = useTimeAgo();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isStreak = post.postType === "STREAK";
  const authorName = post.userFullName || t("anonymousUser", "Thành viên ẩn danh");

  return (
    <article className="rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      {/* Header with User Info */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 shadow-xs">
            {post.userAvatarUrl ? (
              <img
                src={post.userAvatarUrl}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400 bg-zinc-100 font-bold text-sm">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* User Name + Badge + Time */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-zinc-900 truncate max-w-[180px]">
                {authorName}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isStreak
                    ? "bg-orange-100 text-orange-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {isStreak ? (
                  <Flame className="h-3 w-3" />
                ) : (
                  <Trophy className="h-3 w-3" />
                )}
                {isStreak ? t("streakTitle") : t("gradeTitle")}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Visibility toggle (only for own posts) */}
        {isMineTab && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
            >
              {post.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4 text-rose-500" />
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onToggleVisibility(post.postId);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50"
                >
                  {post.visible ? (
                    <>
                      <EyeOff className="h-4 w-4 text-zinc-400" />
                      {t("postHidden")}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 text-zinc-400" />
                      {t("postVisible")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`px-4 pb-3 ${!post.visible && isMineTab ? "opacity-50" : ""}`}>
        {isStreak ? (
          <StreakCard data={post.sharedData as StreakSharedData} t={t} />
        ) : (
          <GradeCard data={post.sharedData as GradeSharedData} t={t} lang={lang} />
        )}
      </div>

      {/* Facebook Reaction Hover Popover Bar */}
      <div className="px-4 pb-3">
        <FacebookReactionPopover
          myReaction={post.myReaction}
          totalLove={post.totalLove}
          totalHaha={post.totalHaha}
          totalWow={post.totalWow}
          onReact={(type) => onReact(post.postId, type)}
        />
      </div>
    </article>
  );
};

// ── Skeleton Loader ──
const PostSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-zinc-200 bg-white">
    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
      <div className="h-10 w-10 rounded-full bg-zinc-200" />
      <div className="flex-1">
        <div className="h-5 w-24 rounded-full bg-zinc-200" />
        <div className="mt-1 h-3 w-16 rounded bg-zinc-100" />
      </div>
    </div>
    <div className="px-4 pb-3">
      <div className="h-28 rounded-xl bg-zinc-100" />
    </div>
    <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-3">
      <div className="h-8 w-16 rounded-full bg-zinc-100" />
      <div className="h-8 w-16 rounded-full bg-zinc-100" />
    </div>
  </div>
);

// ── Empty State ──
const EmptyState = ({ isMine }: { isMine: boolean }) => {
  const { t } = useTranslation("Forum");
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
        <MessageCircle className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-700">
        {isMine ? t("noMyPostsYet") : t("noPostsYet")}
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        {isMine ? t("noMyPostsYetDesc") : t("noPostsYetDesc")}
      </p>
    </div>
  );
};

// ── Streak Leaderboard ──
const StreakLeaderboard = () => {
  const { t } = useTranslation("Forum");
  const { leaderboard, isLoadingLeaderboard } = useForumStore();

  if (isLoadingLeaderboard) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 rounded bg-zinc-200" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-200" />
              <div className="h-4 flex-1 rounded bg-zinc-100" />
              <div className="h-4 w-10 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) return null;

  const getMedalIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-xs">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-4">
        <Crown className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-bold text-zinc-900">
          {t("leaderboardTitle")}
        </h3>
      </div>
      <div className="divide-y divide-zinc-100">
        {leaderboard.map((entry, index) => (
          <div
            key={`${entry.fullName}-${index}`}
            className={`flex items-center gap-3 px-4 py-3 transition hover:bg-zinc-50 ${index < 3 ? "bg-amber-50/20" : ""}`}
          >
            {/* Rank number / medal */}
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
              {getMedalIcon(index) ? (
                <span className="text-base">{getMedalIcon(index)}</span>
              ) : (
                <span className="text-xs font-bold text-zinc-400">
                  {index + 1}
                </span>
              )}
            </div>
            {/* Avatar */}
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100">
              {entry.avatarUrl ? (
                <img
                  src={entry.avatarUrl}
                  alt={entry.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-400 font-bold text-xs">
                  {entry.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Name */}
            <span className="flex-1 truncate text-sm font-semibold text-zinc-800">
              {entry.fullName}
            </span>
            {/* Streak */}
            <div className="flex items-center gap-1 text-sm font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              <Flame className="h-3.5 w-3.5" />
              {entry.currentStreak}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Forum Page ──
const ForumPage = () => {
  const { t, i18n } = useTranslation("Forum");
  const {
    posts,
    hasNext,
    filter,
    visibleFilter,
    isLoading,
    isLoadingMore,
    isSharing,
    fetchPosts,
    loadMore,
    setFilter,
    setVisibleFilter,
    shareStreak,
    shareGrade,
    reactPost,
    toggleVisibility,
    fetchLeaderboard,
    reset,
  } = useForumStore();

  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Profile selector state for Share GPA
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const profilePickerRef = useRef<HTMLDivElement>(null);

  // Fetch on mount
  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch profiles for Share GPA
  useEffect(() => {
    (async () => {
      try {
        const res = await profileService.getProfiles();
        setProfiles(res.data.data ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Close profile picker on outside click
  useEffect(() => {
    if (!showProfilePicker) return;
    const handler = (e: MouseEvent) => {
      if (profilePickerRef.current && !profilePickerRef.current.contains(e.target as Node)) {
        setShowProfilePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfilePicker]);

  const showFeedback = useCallback(
    (type: "success" | "error", message: string) => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (type === "success") {
        setShareSuccess(message);
        setShareError(null);
      } else {
        setShareError(message);
        setShareSuccess(null);
      }
      feedbackTimerRef.current = setTimeout(() => {
        setShareSuccess(null);
        setShareError(null);
      }, 3000);
    },
    []
  );

  const handleShareStreak = useCallback(async () => {
    try {
      await shareStreak();
      showFeedback("success", t("shareSuccess"));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("shareError");
      showFeedback("error", message);
    }
  }, [shareStreak, showFeedback, t]);

  const handleShareGrade = useCallback(
    async (profileId: number) => {
      setShowProfilePicker(false);
      try {
        await shareGrade(profileId);
        showFeedback("success", t("shareSuccess"));
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? t("shareError");
        showFeedback("error", message);
      }
    },
    [shareGrade, showFeedback, t]
  );

  const handleReact = useCallback(
    (postId: number, reactType: ReactionType) => {
      reactPost(postId, reactType);
    },
    [reactPost]
  );

  const handleToggleVisibility = useCallback(
    (postId: number) => {
      toggleVisibility(postId);
    },
    [toggleVisibility]
  );

  return (
    <div className="w-full">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ── Main Feed Column ── */}
          <div className="flex-1 min-w-0 max-w-xl mx-auto lg:mx-0 w-full">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {t("title")}
              </h1>
            </div>

            {/* Filter Tabs & Visible Filter */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-0.5">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`relative px-4 py-3 text-sm font-semibold transition ${
                    filter === "all"
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {t("filterAll")}
                  {filter === "all" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-zinc-900" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("mine")}
                  className={`relative px-4 py-3 text-sm font-semibold transition ${
                    filter === "mine"
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {t("filterMine")}
                  {filter === "mine" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-zinc-900" />
                  )}
                </button>
              </div>

              {/* Sub-filter for My Posts (Visible / Hidden) */}
              {filter === "mine" && (
                <div className="flex items-center gap-1 pb-1">
                  <Filter className="h-3.5 w-3.5 text-zinc-400" />
                  <select
                    value={visibleFilter === undefined ? "all" : visibleFilter ? "true" : "false"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "all") setVisibleFilter(undefined);
                      else if (val === "true") setVisibleFilter(true);
                      else if (val === "false") setVisibleFilter(false);
                    }}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 cursor-pointer focus:outline-hidden"
                  >
                    <option value="all">{t("allVisible", "Tất cả bài")}</option>
                    <option value="true">{t("onlyVisible", "Đang hiện")}</option>
                    <option value="false">{t("onlyHidden", "Đã ẩn")}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Feed */}
            <div className="flex flex-col gap-5">
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : posts.length === 0 ? (
                <EmptyState isMine={filter === "mine"} />
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.postId}
                    post={post}
                    isMineTab={filter === "mine"}
                    lang={i18n.language}
                    onReact={handleReact}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))
              )}
            </div>

            {/* Load More */}
            {hasNext && !isLoading && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-60 shadow-xs"
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {isLoadingMore ? t("loading") : t("loadMore")}
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar: Leaderboard ── */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-20">
              <StreakLeaderboard />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ForumPage;
