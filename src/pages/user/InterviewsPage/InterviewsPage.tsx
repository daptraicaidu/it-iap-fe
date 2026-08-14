import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Loading & Error state
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch profiles on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await profileService.getProfiles();
        setProfiles(response.data.data);
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

      const interviewId = response.data.data.interviewId;

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
      borderColor: "border-indigo-400",
      bgSelected: "bg-indigo-50/50",
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
      borderColor: "border-amber-400",
      bgSelected: "bg-amber-50/50",
    },
  ];

  return (
    <div className="w-full">
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-blue-100 px-3 py-1 text-xs font-medium text-zinc-600">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            {t("createPage.badge")}
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
            {t("createPage.title")}
          </h1>
          <p className="mt-2 text-base text-zinc-600">
            {t("createPage.subtitle")}
          </p>

          {/* Daily Quota & Tier Status Banner */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/90 via-white to-purple-50/60 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-600 text-white shadow-sm shadow-slate-200">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-zinc-800 leading-relaxed">
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>{t("createPage.quota.viewPlans")}</span>
            </button>
          </div>
        </motion.div>

        {/* General Error */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <p className="text-sm text-rose-700">{errors.general}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <label className="mb-4 block text-sm font-semibold text-zinc-900">
            {t("createPage.selectMode")}
          </label>
          {errors.mode && (
            <p className="mb-3 text-sm text-rose-600">{errors.mode}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  className={`group relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-300 ${isSelected
                      ? `${mode.borderColor} ${mode.bgSelected} shadow-sm`
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                    }`}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 transition-opacity duration-300 ${isSelected ? "opacity-100" : "group-hover:opacity-50"}`}
                  />

                  <div className="relative">
                    {/* Header Row: Icon & Recommended Badge & Selected Check */}
                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSelected
                            ? mode.value === "INTERACTIVE_INTERVIEW"
                              ? "bg-indigo-100"
                              : "bg-amber-100"
                            : "bg-zinc-100"
                          } transition-colors duration-300`}
                      >
                        <Icon
                          className={`h-6 w-6 ${isSelected ? mode.iconColor : "text-zinc-500"} transition-colors duration-300`}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {mode.value === "INTERACTIVE_INTERVIEW" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/90 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 shadow-xs">
                            {/* <Sparkles className="h-3 w-3 text-indigo-600" /> */}
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
                              className={`flex h-6 w-6 items-center justify-center rounded-full ${mode.value === "INTERACTIVE_INTERVIEW"
                                  ? "bg-indigo-600"
                                  : "bg-amber-600"
                                }`}
                            >
                              <Check className="h-3.5 w-3.5 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                      {mode.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-zinc-600">
                      {mode.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {mode.features.map((feature, i) => (
                        <span
                          key={i}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${isSelected
                              ? mode.value === "INTERACTIVE_INTERVIEW"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-amber-100 text-amber-700"
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

        {/* Interview Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <label
            htmlFor="interview-title"
            className="mb-2 block text-sm font-semibold text-zinc-900"
          >
            {t("createPage.interviewTitle")}
          </label>
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
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:ring-2 ${errors.title
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100"
              }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-sm text-rose-600">{errors.title}</p>
          )}
        </motion.div>

        {/* Profile Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            {t("createPage.selectProfile")}
          </label>
          {errors.profile && (
            <p className="mb-1.5 text-sm text-rose-600">{errors.profile}</p>
          )}

          {isLoadingProfiles ? (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              <span className="text-sm text-zinc-400">Loading...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-sm text-amber-700">
                {t("createPage.noProfiles")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/profiles")}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700 active:scale-[0.98]"
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
                className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm transition-all ${errors.profile
                    ? "border-rose-300"
                    : isProfileDropdownOpen
                      ? "border-zinc-400 ring-2 ring-zinc-100"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-zinc-400" />
                  <span
                    className={
                      selectedProfile ? "text-zinc-900" : "text-zinc-400"
                    }
                  >
                    {selectedProfile
                      ? getProfileTitle(selectedProfile)
                      : t("createPage.selectProfilePlaceholder")}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
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
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${isActive
                              ? "bg-zinc-900 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                            }`}
                        >
                          <User
                            className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-400"}`}
                          />
                          {profileTitle}
                          {isActive && (
                            <Check className="ml-auto h-4 w-4 text-white" />
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

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="group inline-flex items-center gap-2.5 rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("createPage.creating")}
              </>
            ) : (
              <>
                {t("createPage.createButton")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </motion.div>
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
