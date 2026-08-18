import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Zap,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  User,
  Crown,
  ShieldCheck,
  Mic,
  Target,
  Award,
  Layers,
  FileText,
} from "lucide-react";
import interviewService from "../../../services/user/interviewService";
import type { InterviewMode } from "../../../services/user/interviewService";
import profileService from "../../../services/user/profileService";
import type { ProfileSummary } from "../../../services/user/profileService";
import { getProfileTitle } from "../../../services/user/profileService";
import useInterviewStore from "../../../store/interviewStore";
import useUserStore from "../../../store/userStore";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../services/user/interviewService";
import UpgradeTierModal from "../../../components/user/UpgradeTierModal";

const InterviewsPage = () => {
  const { t } = useTranslation("Interview");
  const navigate = useNavigate();
  const location = useLocation();
  const setInterview = useInterviewStore((s) => s.setInterview);
  const resetStore = useInterviewStore((s) => s.reset);
  const userInfo = useUserStore((s) => s.userInfo);

  // Form state
  const [title, setTitle] = useState("");
  const [selectedMode, setSelectedMode] = useState<InterviewMode | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(
    () => typeof window !== "undefined" && window.location.hash === "#pricing"
  );

  useEffect(() => {
    if (location.hash === "#pricing") {
      setIsUpgradeModalOpen(true);
    }
  }, [location.hash]);

  // Loading & Error state
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch profiles on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await profileService.getProfiles();
        setProfiles(response.data?.data ?? []);
      } catch {
        // Silently fail, user will see empty list
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    fetchProfiles();
  }, []);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const handleCreate = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    if (!title.trim())
      newErrors.title = t("createPage.errors.titleRequired");
    if (!selectedMode)
      newErrors.mode = t("createPage.errors.modeRequired");
    if (!selectedProfileId)
      newErrors.profile = t("createPage.errors.profileRequired");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsCreating(true);
    setErrors({});

    try {
      const response = await interviewService.createInterview({
        mode: selectedMode!,
        title: title.trim(),
        profileId: selectedProfileId!,
      });

      const interviewId = response.data?.data?.interviewId;
      if (!interviewId) {
        setErrors({ general: t("errors.createFailed") });
        return;
      }

      // Reset and set new interview data in store
      resetStore();
      setInterview(interviewId, selectedMode!, title.trim());

      navigate(`/interviews/${interviewId}`, {
        state: {
          interviewTitle: title.trim(),
          interviewMode: selectedMode,
          profileName: selectedProfile
            ? getProfileTitle(selectedProfile)
            : "",
        },
      });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const data = axiosErr.response?.data;

      if (data?.data) {
        // Validation errors (400 with field-level messages)
        setErrors(data.data);
      } else if (data?.message) {
        setErrors({ general: data.message });
      } else {
        setErrors({ general: t("errors.createFailed") });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const modes = [
    {
      value: "INTERACTIVE_INTERVIEW" as InterviewMode,
      icon: MessageSquare,
      title: t("createPage.modes.interactive.title"),
      description: t("createPage.modes.interactive.description"),
      features: t("createPage.modes.interactive.features", {
        returnObjects: true,
      }) as string[],
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10",
      bgSelected: "bg-indigo-50/60",
      watermarkColor: "text-indigo-600",
    },
    {
      value: "STRESS_INTERVIEW" as InterviewMode,
      icon: Zap,
      title: t("createPage.modes.stress.title"),
      description: t("createPage.modes.stress.description"),
      features: t("createPage.modes.stress.features", {
        returnObjects: true,
      }) as string[],
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconColor: "text-amber-600",
      borderColor: "border-amber-500 ring-2 ring-amber-500/20 shadow-md shadow-amber-500/10",
      bgSelected: "bg-amber-50/60",
      watermarkColor: "text-amber-600",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-50/50">
      {/* ────────────────────────────────────────────────────────
          AMBIENT BACKGROUND AURA & GRID PATTERN
      ──────────────────────────────────────────────────────── */}
      {/* Subtle Dot Matrix grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Ambient Blur Orbs on Left & Right Sides */}
      <div className="pointer-events-none absolute -left-24 top-16 -z-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-200/35 via-indigo-100/25 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-36 -z-10 h-[420px] w-[420px] rounded-full bg-gradient-to-bl from-purple-200/30 via-rose-100/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 left-1/3 -z-10 h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-amber-100/20 via-indigo-50/30 to-transparent blur-3xl" />

      {/* ────────────────────────────────────────────────────────
          MAIN CONTAINER
      ──────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header & Quota Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>{t("createPage.badge")}</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t("createPage.title")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-3xl">
            {t("createPage.subtitle")}
          </p>

          {/* Daily Quota & Tier Status Banner */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-indigo-100/90 bg-gradient-to-r from-blue-50/80 via-white to-purple-50/50 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
                <Crown className="h-5 w-5 text-white-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-relaxed">
                  {(() => {
                    const tier = (userInfo?.activeTier || "BASIC").toUpperCase();
                    if (tier.startsWith("PRO")) {
                      return t("createPage.quota.pro", { tier: userInfo?.activeTier });
                    }
                    if (tier.startsWith("PLUS")) {
                      return t("createPage.quota.plus", { tier: userInfo?.activeTier });
                    }
                    return t("createPage.quota.basic");
                  })()}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {(() => {
                    const tier = (userInfo?.activeTier || "BASIC").toUpperCase();
                    if (tier.startsWith("PRO")) {
                      return t("createPage.quota.proHintPro");
                    }
                    if (tier.startsWith("PLUS")) {
                      return t("createPage.quota.proHintPlus");
                    }
                    return t("createPage.quota.proHintBasic");
                  })()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5 text-white-400" />
              <span>{t("createPage.quota.viewPlans")}</span>
            </button>
          </div>
        </motion.div>

        {/* General Error Banner */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-xs"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <p className="text-sm text-rose-700 font-medium">{errors.general}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ────────────────────────────────────────────────────────
            2-COLUMN RESPONSIVE LAYOUT
        ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Main Configuration Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* 1. Mode Selection Card Group */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-xs"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <label className="block text-base font-bold text-zinc-900">
                    {t("createPage.selectMode")}
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t("createPage.selectModeSubtitle")}
                  </p>
                </div>
              </div>

              {errors.mode && (
                <p className="mb-4 text-sm text-rose-600 font-medium">{errors.mode}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.value;

                  return (
                    <motion.button
                      key={mode.value}
                      type="button"
                      onClick={() => {
                        setSelectedMode(mode.value);
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.mode;
                          return next;
                        });
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative overflow-hidden rounded-2xl border-2 p-5 sm:p-6 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? `${mode.borderColor} ${mode.bgSelected}`
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Gradient Background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 transition-opacity duration-300 ${
                          isSelected ? "opacity-100" : "group-hover:opacity-50"
                        }`}
                      />

                      {/* WATERMARK MOTIF ICON IN BOTTOM-RIGHT CORNER */}
                      <div className="pointer-events-none absolute -bottom-4 -right-4 transition-all duration-500 transform group-hover:scale-110">
                        {mode.value === "INTERACTIVE_INTERVIEW" ? (
                          <MessageSquare
                            className={`h-28 w-28 ${mode.watermarkColor} transition-all duration-300 rotate-6 ${
                              isSelected
                                ? "opacity-[0.14] scale-105"
                                : "opacity-[0.05] group-hover:opacity-[0.10]"
                            }`}
                          />
                        ) : (
                          <Zap
                            className={`h-28 w-28 ${mode.watermarkColor} transition-all duration-300 -rotate-6 ${
                              isSelected
                                ? "opacity-[0.14] scale-105"
                                : "opacity-[0.05] group-hover:opacity-[0.10]"
                            }`}
                          />
                        )}
                      </div>

                      <div className="relative z-10">
                        {/* Header Row: Icon & Recommended Badge & Selected Check */}
                        <div className="mb-4 flex items-center justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              isSelected
                                ? mode.value === "INTERACTIVE_INTERVIEW"
                                  ? "bg-indigo-100"
                                  : "bg-amber-100"
                                : "bg-zinc-100"
                            } transition-colors duration-300`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                isSelected ? mode.iconColor : "text-zinc-600"
                              } transition-colors duration-300`}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            {mode.value === "INTERACTIVE_INTERVIEW" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/90 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 shadow-2xs">
                                <span>{t("createPage.modes.interactive.recommended")}</span>
                              </span>
                            )}

                            {/* Selected Check */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className={`flex h-6 w-6 items-center justify-center rounded-full shadow-xs ${
                                    mode.value === "INTERACTIVE_INTERVIEW"
                                      ? "bg-indigo-600"
                                      : "bg-amber-600"
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[2.5] text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="mb-1.5 text-base font-bold text-zinc-900">
                          {mode.title}
                        </h3>
                        <p className="mb-4 text-xs sm:text-sm leading-relaxed text-zinc-600">
                          {mode.description}
                        </p>

                        {/* Features Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {mode.features.map((feature, i) => (
                            <span
                              key={i}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isSelected
                                  ? mode.value === "INTERACTIVE_INTERVIEW"
                                    ? "bg-indigo-100/80 text-indigo-700 border border-indigo-200/60"
                                    : "bg-amber-100/80 text-amber-700 border border-amber-200/60"
                                  : "bg-zinc-100 text-zinc-600"
                              } transition-colors duration-300`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* 2. Interview Title Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-xs"
            >
              <div className="mb-3 flex items-center justify-between">
                <label
                  htmlFor="interview-title"
                  className="block text-base font-bold text-zinc-900"
                >
                  {t("createPage.interviewTitle")}
                </label>
                <span className="text-xs text-zinc-400">{t("createPage.required")}</span>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <FileText className="h-4 w-4" />
                </div>
                <input
                  id="interview-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                  }}
                  placeholder={t("createPage.interviewTitlePlaceholder")}
                  className={`w-full rounded-xl border bg-white pl-11 pr-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:ring-2 ${
                    errors.title
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100"
                  }`}
                />
              </div>
              {errors.title && (
                <p className="mt-2 text-sm text-rose-600 font-medium">{errors.title}</p>
              )}
            </motion.div>

            {/* 3. Profile Selection Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-xs"
            >
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-base font-bold text-zinc-900">
                  {t("createPage.selectProfile")}
                </label>
                <span className="text-xs text-zinc-400">{t("createPage.required")}</span>
              </div>

              {errors.profile && (
                <p className="mb-2 text-sm text-rose-600 font-medium">{errors.profile}</p>
              )}

              {isLoadingProfiles ? (
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  <span className="text-sm text-zinc-400 font-medium">
                    {t("createPage.loadingProfiles")}
                  </span>
                </div>
              ) : profiles.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                  <p className="mb-3 text-sm text-amber-800 font-medium">
                    {t("createPage.noProfiles")}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/profiles")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 active:scale-95 shadow-xs"
                  >
                    {t("createPage.goToProfiles")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-left text-sm transition-all cursor-pointer ${
                      errors.profile
                        ? "border-rose-300"
                        : isProfileDropdownOpen
                        ? "border-zinc-400 ring-2 ring-zinc-100 shadow-xs"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                        <User className="h-4 w-4" />
                      </div>
                      <span
                        className={`font-medium ${
                          selectedProfile ? "text-zinc-900" : "text-zinc-400"
                        }`}
                      >
                        {selectedProfile
                          ? getProfileTitle(selectedProfile)
                          : t("createPage.selectProfilePlaceholder")}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 transition-transform ${
                        isProfileDropdownOpen ? "rotate-180 text-zinc-700" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"
                      >
                        {profiles.map((profile) => {
                          const profileTitle = getProfileTitle(profile);
                          const isActive = selectedProfileId === profile.id;
                          return (
                            <button
                              key={profile.id}
                              type="button"
                              onClick={() => {
                                setSelectedProfileId(profile.id);
                                setIsProfileDropdownOpen(false);
                                setErrors((prev) => {
                                  const next = { ...prev };
                                  delete next.profile;
                                  return next;
                                });
                              }}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all cursor-pointer ${
                                isActive
                                  ? "bg-zinc-900 text-white font-medium"
                                  : "text-zinc-700 hover:bg-zinc-100/80"
                              }`}
                            >
                              <User
                                className={`h-4 w-4 shrink-0 ${
                                  isActive ? "text-white" : "text-zinc-400"
                                }`}
                              />
                              <span className="truncate">{profileTitle}</span>
                              {isActive && (
                                <Check className="ml-auto h-4 w-4 text-white shrink-0 stroke-[2.5]" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* 4. Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="pt-2"
            >
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-zinc-900 px-9 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:shadow-lg active:scale-98 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("createPage.creating")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("createPage.createButton")}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Interactive Preview & Readiness Checklist */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-6">
            {/* Card 1: Session Overview / Live Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/90 p-6 shadow-xs backdrop-blur-md"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />

              <div className="mb-5 flex items-center gap-2.5 border-b border-zinc-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-blue-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {t("createPage.sidebar.previewTitle")}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {t("createPage.sidebar.previewSubtitle")}
                  </p>
                </div>
              </div>

              {/* Live Preview List */}
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Session Name */}
                <div className="flex items-start justify-between gap-3">
                  <span className="text-zinc-500 shrink-0">
                    {t("createPage.sidebar.sessionName")}:
                  </span>
                  <span className="font-semibold text-zinc-900 text-right truncate max-w-[180px]">
                    {title.trim() ? title.trim() : (
                      <span className="text-zinc-400 italic">
                        {t("createPage.sidebar.notEntered")}
                      </span>
                    )}
                  </span>
                </div>

                {/* Selected Mode */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500 shrink-0">
                    {t("createPage.sidebar.selectedMode")}:
                  </span>
                  <div>
                    {selectedMode === "INTERACTIVE_INTERVIEW" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        <MessageSquare className="w-3 h-3" />
                        <span>{t("createPage.modes.interactive.title")}</span>
                      </span>
                    )}
                    {selectedMode === "STRESS_INTERVIEW" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Zap className="w-3 h-3" />
                        <span>{t("createPage.modes.stress.title")}</span>
                      </span>
                    )}
                    {!selectedMode && (
                      <span className="text-zinc-400 italic">
                        {t("createPage.sidebar.notSelected")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selected Profile */}
                <div className="flex items-start justify-between gap-3">
                  <span className="text-zinc-500 shrink-0">
                    {t("createPage.sidebar.selectedProfile")}:
                  </span>
                  <span className="font-semibold text-zinc-900 text-right truncate max-w-[180px]">
                    {selectedProfile ? (
                      getProfileTitle(selectedProfile)
                    ) : (
                      <span className="text-zinc-400 italic">
                        {t("createPage.sidebar.noProfileChosen")}
                      </span>
                    )}
                  </span>
                </div>

                {/* Evaluation Framework */}
                <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                  <span className="text-zinc-500 shrink-0">
                    {t("createPage.sidebar.evalFramework")}:
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t("createPage.sidebar.evalFrameworkValue")}</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Interview Readiness Checklist */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-6 shadow-xs"
            >
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  {t("createPage.sidebar.checklistTitle")}
                </h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-zinc-600">
                <li className="flex items-start gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 mt-0.5">
                    <Mic className="h-3 w-3" />
                  </div>
                  <span className="leading-snug">
                    {t("createPage.sidebar.checklistItem1")}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 mt-0.5">
                    <Award className="h-3 w-3" />
                  </div>
                  <span className="leading-snug">
                    {t("createPage.sidebar.checklistItem2")}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 mt-0.5">
                    <Layers className="h-3 w-3" />
                  </div>
                  <span className="leading-snug">
                    {t("createPage.sidebar.checklistItem3")}
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fullscreen Upgrade Tier Modal */}
      <UpgradeTierModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={userInfo?.activeTier ?? "BASIC"}
      />
    </div>
  );
};

export default InterviewsPage;
