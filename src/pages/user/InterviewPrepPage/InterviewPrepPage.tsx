import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  Play,
  MessageSquare,
  Zap,
  User,
  FileText,
  Shield,
  Loader2,
  AlertCircle,
  Wifi,
  Mic,
  BookOpen,
  Monitor,
} from "lucide-react";
import interviewService from "../../../services/user/interviewService";
import type { AxiosError } from "axios";
import type { ApiErrorResponse, InterviewQuestion } from "../../../services/user/interviewService";

interface LocationState {
  interviewTitle?: string;
  interviewMode?: string;
  profileName?: string;
  firstQuestion?: InterviewQuestion; // Passed from /start API response to skip current-question call
}

const InterviewPrepPage = () => {
  const { t } = useTranslation("Interview");
  const navigate = useNavigate();
  const { interviewId } = useParams<{ interviewId: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  // If no state (direct access / reload), redirect to create page
  useEffect(() => {
    if (!state?.interviewTitle) {
      navigate("/interviews", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.interviewTitle) {
    return null;
  }

  const isInteractive = state.interviewMode === "INTERACTIVE_INTERVIEW";

  const handleStart = async () => {
    if (!interviewId) return;

    setIsStarting(true);
    setError("");

    try {
      const response = await interviewService.startInterview(
        Number(interviewId)
      );
      const firstQuestion = response.data.data;

      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {
        // Ignore if blocked
      }

      // Pass the first question via navigation state so InterviewSessionPage
      // can use it directly without calling current-question API again
      navigate(`/interviews/${interviewId}/session`, {
        replace: true,
        state: { firstQuestion },
      });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const message = axiosErr.response?.data?.message;

      // If already started, redirect to session
      if (
        axiosErr.response?.status === 400 &&
        message?.includes("đã bắt đầu")
      ) {
        navigate(`/interviews/${interviewId}/session`, { replace: true });
        return;
      }

      setError(message || t("errors.startFailed"));
    } finally {
      setIsStarting(false);
    }
  };

  const tips = t("prepPage.tips.items", { returnObjects: true }) as string[];
  const tipIcons = [Wifi, Mic, BookOpen, Monitor];

  return (
    <div className="w-full">
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100"
          >
            <Shield className="h-10 w-10 text-600" />
          </motion.div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            {t("prepPage.title")}
          </h1>
          <p className="mt-2 text-base text-zinc-600">
            {t("prepPage.subtitle")}
          </p>
        </motion.div>

        {/* Interview Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 rounded-xl border border-zinc-200 bg-white p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <FileText className="h-5 w-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  {t("prepPage.interviewName")}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                  {state.interviewTitle}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isInteractive ? "bg-indigo-50" : "bg-amber-50"}`}
              >
                {isInteractive ? (
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                ) : (
                  <Zap className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  {t("prepPage.mode")}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                  {isInteractive
                    ? t("prepPage.interactiveMode")
                    : t("prepPage.stressMode")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <User className="h-5 w-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  {t("prepPage.profile")}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                  {state.profileName}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-8 rounded-xl border border-zinc-200 bg-white p-6"
        >
          <h3 className="mb-4 text-sm font-semibold text-zinc-900">
            {t("prepPage.tips.title")}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tips.map((tip, i) => {
              const TipIcon = tipIcons[i] || Shield;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3"
                >
                  <TipIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <p className="text-sm leading-relaxed text-zinc-600">{tip}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <p className="text-sm text-rose-700">{error}</p>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={handleStart}
            disabled={isStarting}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-zinc-900 px-10 py-4 text-base font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Pulse effect */}
            {!isStarting && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white/10"
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}

            <span className="relative flex items-center gap-3">
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("prepPage.starting")}
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  {t("prepPage.startButton")}
                </>
              )}
            </span>
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default InterviewPrepPage;
