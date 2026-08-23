import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  RotateCcw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trophy,
  Target,
  CheckCircle2,
  Flag,
  History,
  User,
  Bot,
  X,
} from "lucide-react";
import interviewService from "../../../services/user/interviewService";
import type {
  InterviewFeedbackData,
  FeedbackQuestion,
  ApiErrorResponse,
  ChatMessage,
} from "../../../services/user/interviewService";
import ReportModal from "../../../components/ReportModal";
import type { AxiosError } from "axios";
import { RadarChart } from "../DashboardPage/DashboardPage";
import { getBenchmarkByTitleOrRole } from "../../../utils/benchmark";
import useInterviewStore from "../../../store/interviewStore";

// Animated counter component
function AnimatedScore({
  value,
  duration = 1.5,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        // Ease out
        const progress = 1 - Math.pow(1 - elapsed, 3);
        setDisplay(Math.round(progress * value * 10) / 10);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [value, duration]);

  return <>{display.toFixed(1)}</>;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-indigo-600";
  if (score >= 4) return "text-amber-600";
  return "text-rose-600";
}

function getScoreBg(score: number): string {
  if (score >= 8) return "bg-emerald-50 border-emerald-200";
  if (score >= 6) return "bg-indigo-50 border-indigo-200";
  if (score >= 4) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}

function getScoreLabel(score: number, t: (key: string) => string): string {
  if (score >= 8) return t("resultPage.scoreLevel.excellent");
  if (score >= 6) return t("resultPage.scoreLevel.good");
  if (score >= 4) return t("resultPage.scoreLevel.average");
  return t("resultPage.scoreLevel.needsWork");
}

function getQuestionTypeBadge(type: string) {
  switch (type) {
    case "TECHNICAL":
      return "bg-blue-50 text-sky-700";
    case "BEHAVIORAL":
      return "bg-emerald-50 text-emerald-700";
    case "SITUATIONAL":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

const InterviewResultPage = () => {
  const { t } = useTranslation("Interview");
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId } = useParams<{ interviewId: string }>();
  const [searchParams] = useSearchParams();
  const highlightQuestionId = searchParams.get("highlightQuestionId");
  const viewMode = searchParams.get("viewMode");
  const resetStore = useInterviewStore((s) => s.reset);

  const [feedbackData, setFeedbackData] =
    useState<InterviewFeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  // Chat messages per question
  const [questionMessages, setQuestionMessages] = useState<
    Record<number, ChatMessage[]>
  >({});
  const [loadingMessages, setLoadingMessages] = useState<Set<number>>(new Set());

  // Report modal
  const [reportQuestionId, setReportQuestionId] = useState<number | null>(null);

  const fetchFeedback = useCallback(async () => {
    if (!interviewId) return;

    try {
      const res = await interviewService.getInterviewFeedback(
        Number(interviewId)
      );
      const data = res.data.data;
      if (!data) return;

      if (data.processing) {
        // Poll again after 5 seconds
        setTimeout(fetchFeedback, 5000);
        setFeedbackData(data);
      } else {
        setFeedbackData(data);
        // Expand all questions by default
        const allIndexes = new Set(
          (data.feedbackForQuestions || []).map((_: FeedbackQuestion, i: number) => i)
        );
        setExpandedQuestions(allIndexes);

        // Load messages for interactive interview questions
        if (data.interviewMode === "INTERACTIVE_INTERVIEW" && data.feedbackForQuestions) {
          data.feedbackForQuestions.forEach((q: FeedbackQuestion) => {
            fetchMessages(q.interviewQuestionId);
          });
        }
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosErr.response?.data?.message || t("errors.feedbackFailed")
      );
    } finally {
      setIsLoading(false);
    }
  }, [interviewId, t]);

  const fetchMessages = async (questionId: number) => {
    setLoadingMessages((prev) => new Set(prev).add(questionId));
    try {
      const res = await interviewService.getInteractiveMessages(questionId);
      if (res.data?.data) {
        setQuestionMessages((prev) => ({
          ...prev,
          [questionId]: res.data.data ?? [],
        }));
      }
    } catch {
      // Silently fail - messages are supplementary
    } finally {
      setLoadingMessages((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  };

  useEffect(() => {
    fetchFeedback();
    return () => {
      // Cleanup store when leaving result page
    };
  }, [fetchFeedback]);

  useEffect(() => {
    if (feedbackData && highlightQuestionId) {
      setTimeout(() => {
        const el = document.getElementById(`question-${highlightQuestionId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [feedbackData, highlightQuestionId]);

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allExpanded =
    feedbackData !== null &&
    feedbackData.feedbackForQuestions.length > 0 &&
    expandedQuestions.size === feedbackData.feedbackForQuestions.length;

  const toggleExpandAll = () => {
    if (!feedbackData) return;
    if (allExpanded) {
      setExpandedQuestions(new Set());
    } else {
      const allIndexes = new Set(
        feedbackData.feedbackForQuestions.map((_, i) => i)
      );
      setExpandedQuestions(allIndexes);
    }
  };

  const handleRetry = () => {
    resetStore();
    navigate("/interviews");
  };

  // ── Loading ──
  // ── Loading & Processing ──
  if (isLoading || feedbackData?.processing) {
    return (
      <div className="w-full">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="h-10 w-10 text-blue-600" />
            </motion.div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-900">
              {t("resultPage.processing")}
            </h2>
            <p className="text-sm text-zinc-500">
              {t("resultPage.processingDesc")}
            </p>
            <div className="mt-6 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-blue-400"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="w-full">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-6 text-center"
          >
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-500" />
            <p className="text-sm text-rose-700">{error}</p>
            <button
              onClick={() => navigate("/interviews")}
              className="mt-4 rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {t("resultPage.retryInterview")}
            </button>
          </motion.div>
        </section>
      </div>
    );
  }

  if (!feedbackData) return null;

  const isInteractive = feedbackData.interviewMode === "INTERACTIVE_INTERVIEW";

  const userRadarValues = [
    feedbackData.overallResult.coreKnowledge ?? 0,
    feedbackData.overallResult.problemSolving ?? 0,
    feedbackData.overallResult.appliedExperience ?? 0,
    feedbackData.overallResult.logicalArticulation ?? 0,
    feedbackData.overallResult.focusAndCompleteness ?? 0,
  ];

  const interviewTitle =
    (location.state as { profileName?: string; profileTitle?: string; interviewTitle?: string } | null)?.profileName ||
    (location.state as { profileName?: string; profileTitle?: string; interviewTitle?: string } | null)?.profileTitle ||
    (location.state as { profileName?: string; profileTitle?: string; interviewTitle?: string } | null)?.interviewTitle ||
    useInterviewStore.getState().interviewTitle ||
    "";

  const benchmarkValues = getBenchmarkByTitleOrRole(interviewTitle);

  const radarLabels = [
    t("skills.coreKnowledge", { defaultValue: "Kiến thức nền" }),
    t("skills.problemSolving", { defaultValue: "Giải quyết vấn đề" }),
    t("skills.appliedExperience", { defaultValue: "Kinh nghiệm thực tiễn" }),
    t("skills.logicalArticulation", { defaultValue: "Diễn đạt logic" }),
    t("skills.focusAndCompleteness", { defaultValue: "Tập trung & hoàn thiện" }),
  ];

  return (
    <div className="w-full">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                {t("resultPage.title")}
              </h1>
              {feedbackData.interviewMode === "INTERACTIVE_INTERVIEW" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  {t("resultPage.interactiveMode")}
                </span>
              ) : feedbackData.interviewMode === "STRESS_INTERVIEW" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                  {t("resultPage.stressMode")}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-base text-zinc-600">
              {t("resultPage.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Main Content */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Overall Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8"
            >
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* Score Circle */}
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                  {/* Background ring */}
                  <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#f4f4f5"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={
                        feedbackData.overallResult.totalPoint >= 8
                          ? "#059669"
                          : feedbackData.overallResult.totalPoint >= 6
                            ? "#4f46e5"
                            : feedbackData.overallResult.totalPoint >= 4
                              ? "#d97706"
                              : "#dc2626"
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 52 * (1 - feedbackData.overallResult.totalPoint / 10),
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(feedbackData.overallResult.totalPoint)}`}
                    >
                      <AnimatedScore
                        value={feedbackData.overallResult.totalPoint}
                      />
                    </div>
                    <div className="text-xs text-zinc-400">
                      {t("resultPage.outOf")}
                    </div>
                  </div>
                </div>

                {/* Overall Feedback */}
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {t("resultPage.overallFeedback")}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getScoreBg(feedbackData.overallResult.totalPoint)}`}
                    >
                      {getScoreLabel(feedbackData.overallResult.totalPoint, t)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    {feedbackData.overallResult.feedback}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Question Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  {t("resultPage.questionResults")}
                </h2>
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-95 shadow-2xs"
                >
                  {allExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{t("resultPage.collapseAll")}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{t("resultPage.expandAll")}</span>
                    </>
                  )}
                </button>
              </div>

          <div className="space-y-3">
            {feedbackData.feedbackForQuestions.map(
              (q: FeedbackQuestion, index: number) => {
                const isExpanded = expandedQuestions.has(index);
                const messages = questionMessages[q.interviewQuestionId];
                const isLoadingMsgs = loadingMessages.has(q.interviewQuestionId);

                return (
                  <motion.div
                    key={index}
                    id={`question-${q.interviewQuestionId}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + index * 0.08 }}
                    className={`rounded-xl border bg-white overflow-hidden transition-all ${
                      highlightQuestionId === String(q.interviewQuestionId)
                        ? "border-amber-300 ring-4 ring-amber-50 shadow-md"
                        : "border-zinc-200"
                    }`}
                  >
                    {/* Question Header (Clickable) */}
                    <button
                      type="button"
                      onClick={() => toggleQuestion(index)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-zinc-50"
                    >
                      {/* Order Number */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                        {q.orderIndex}
                      </div>

                      {/* Question Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                          {q.questionContent}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 ${getScoreBg(q.feedback.point)}`}
                      >
                        <Trophy
                          className={`h-3.5 w-3.5 ${getScoreColor(q.feedback.point)}`}
                        />
                        <span
                          className={`text-sm font-semibold ${getScoreColor(q.feedback.point)}`}
                        >
                          {q.feedback.point}
                        </span>
                      </div>

                      {/* Type Badge */}
                      <span
                        className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getQuestionTypeBadge(q.questionType)}`}
                      >
                        {t(`resultPage.questionType.${q.questionType}`, {
                          defaultValue: q.questionType,
                        })}
                      </span>

                      {/* Expand Icon */}
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-zinc-100 px-5 py-4 space-y-4">
                            {/* Mobile type badge */}
                            <span
                              className={`sm:hidden inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getQuestionTypeBadge(q.questionType)}`}
                            >
                              {t(
                                `resultPage.questionType.${q.questionType}`,
                                { defaultValue: q.questionType }
                              )}
                            </span>

                            {/* Question Text with Report Flag */}
                            <div className="relative group/question">
                              <div className="mb-2 flex items-center gap-1.5">
                                <MessageSquare className="h-4 w-4 text-blue-400" />
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                  {t("resultPage.questionLabel")}
                                </span>
                                {/* Report flag for question */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReportQuestionId(q.interviewQuestionId);
                                  }}
                                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-zinc-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                                  title={t("resultPage.reportTooltip")}
                                >
                                  <Flag className="h-3 w-3" />
                                  <span className="text-[11px] font-medium">Báo cáo</span>
                                </button>
                              </div>
                              <div className="rounded-lg bg-zinc-50 p-3">
                                <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                                  {q.questionContent}
                                </p>
                              </div>
                            </div>

                            {/* Interactive: Conversation History */}
                            {isInteractive && (
                              <div>
                                <div className="mb-2 flex items-center gap-1.5">
                                  <History className="h-4 w-4 text-red-400" />
                                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                    {t("resultPage.conversationHistory")}
                                  </span>
                                </div>

                                {isLoadingMsgs ? (
                                  <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                    <span className="text-xs text-zinc-500">
                                      {t("resultPage.loadingMessages")}
                                    </span>
                                  </div>
                                ) : (() => {
                                  // Exclude the last message (AI feedback) to prevent duplication with the AI feedback card below
                                  const displayMessages =
                                    messages && messages.length > 0
                                      ? messages.slice(0, -1)
                                      : [];

                                  return displayMessages.length > 0 ? (
                                    <div className="space-y-2">
                                      {displayMessages.map((msg, msgIdx) => (
                                        <div
                                          key={msgIdx}
                                          className={`flex gap-2 ${msg.role === "USER" ? "" : ""}`}
                                        >
                                          {/* Avatar */}
                                          <div
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                              msg.role === "USER"
                                                ? "bg-zinc-200"
                                                : "bg-blue-100"
                                            }`}
                                          >
                                            {msg.role === "USER" ? (
                                              <User className="h-3.5 w-3.5 text-zinc-600" />
                                            ) : (
                                              <Bot className="h-3.5 w-3.5 text-blue-600" />
                                            )}
                                          </div>

                                          {/* Message */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                              <span className="text-xs font-semibold text-zinc-600">
                                                {msg.role === "USER"
                                                  ? t("resultPage.you")
                                                  : t("resultPage.ai")}
                                              </span>
                                              {/* Report flag for AI messages */}
                                              {msg.role === "ASSISTANT" && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReportQuestionId(q.interviewQuestionId);
                                                  }}
                                                  className="rounded-full p-0.5 text-zinc-300 transition hover:bg-amber-50 hover:text-amber-500"
                                                  title={t("resultPage.reportTooltip")}
                                                >
                                                  <Flag className="h-3 w-3" />
                                                </button>
                                              )}
                                            </div>
                                            <div
                                              className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                                                msg.role === "USER"
                                                  ? "bg-zinc-100 text-zinc-700"
                                                  : "border border-blue-100 bg-blue-50/50 text-zinc-700"
                                              }`}
                                            >
                                              <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : !isInteractive ? null : (
                                    <div className="rounded-lg bg-zinc-50 p-3">
                                      <p className="text-xs text-zinc-400 italic">
                                        {t("resultPage.loadingMessages")}
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Non-interactive: User Answer */}
                            {!isInteractive && q.userAnswer && (
                              <div>
                                <div className="mb-2 flex items-center gap-1.5">
                                  <MessageSquare className="h-4 w-4 text-blue-400" />
                                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                    {t("resultPage.yourAnswer")}
                                  </span>
                                </div>
                                <div className="rounded-lg bg-zinc-50 p-3">
                                  <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                                    {q.userAnswer}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* AI Feedback */}
                            <div className="relative">
                              <div className="mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                  {t("resultPage.aiFeedback")}
                                </span>
                                {/* Report flag for AI feedback */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReportQuestionId(q.interviewQuestionId);
                                  }}
                                  className="ml-auto rounded-full p-1 text-zinc-300 transition hover:bg-amber-50 hover:text-amber-500"
                                  title={t("resultPage.reportTooltip")}
                                >
                                  <Flag className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                                <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                                  {q.feedback.feedback}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        {viewMode === "admin" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={() => window.close()}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98]"
            >
              <X className="h-4 w-4" />
              {t("resultPage.closeTab", { defaultValue: "Đóng tab này" })}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              onClick={handleRetry}
              className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" />
              {t("resultPage.retryInterview")}
            </button>
            <button
              onClick={() => {
                resetStore();
                navigate("/history");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("resultPage.backToHistory")}
            </button>
          </motion.div>
        )}
      </div>

          {/* Right Sticky Sidebar: Skill Radar Chart */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-base font-semibold text-zinc-900">
                  {t("radar.title", { defaultValue: "Đánh giá 5 nhóm kỹ năng" })}
                </h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {t("radar.aiAssessment", { defaultValue: "AI Assessment" })}
                </span>
              </div>

              {/* Shared Skill Radar SVG */}
              <RadarChart
                userValues={userRadarValues}
                benchmarkValues={benchmarkValues}
                labels={radarLabels}
              />

              {/* Legend */}
              <div className="mt-1 mb-2 flex items-center justify-center gap-5 text-xs text-zinc-500">
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
                  <span>{t("radar.benchmark", { defaultValue: "Chuẩn mục tiêu" })}</span>
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
                  <span>{t("radar.userScore", { defaultValue: "Điểm của bạn" })}</span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-xs">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>{t("skills.coreKnowledge")}:</span>
                  <span className="font-semibold text-zinc-900">
                    {(feedbackData.overallResult.coreKnowledge ?? 0).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>{t("skills.problemSolving")}:</span>
                  <span className="font-semibold text-zinc-900">
                    {(feedbackData.overallResult.problemSolving ?? 0).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>{t("skills.appliedExperience")}:</span>
                  <span className="font-semibold text-zinc-900">
                    {(feedbackData.overallResult.appliedExperience ?? 0).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>{t("skills.logicalArticulation")}:</span>
                  <span className="font-semibold text-zinc-900">
                    {(feedbackData.overallResult.logicalArticulation ?? 0).toFixed(1)} / 10
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>{t("skills.focusAndCompleteness")}:</span>
                  <span className="font-semibold text-zinc-900">
                    {(feedbackData.overallResult.focusAndCompleteness ?? 0).toFixed(1)} / 10
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportQuestionId !== null}
        onClose={() => setReportQuestionId(null)}
        interviewQuestionId={reportQuestionId ?? 0}
      />
    </div>
  );
};

export default InterviewResultPage;
