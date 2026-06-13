import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Camera,
  Pencil,
  X,
  Save,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import userInfoService, {
  type UserInfo,
} from "../../../services/user/userInfoService";

// ── Toast Component ──
interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(1rem); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div
        className={[
          "fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg border",
          type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-rose-50 text-rose-700 border-rose-200",
        ].join(" ")}
        style={{ animation: "toastSlideIn 0.3s ease-out" }}
      >
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 rounded-full p-0.5 hover:bg-black/5 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
};

// ── Skeleton Loader ──
const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-zinc-200/60 ${className}`}
  />
);

const ProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Avatar skeleton */}
    <div className="flex items-center gap-6">
      <SkeletonBlock className="h-24 w-24 !rounded-full" />
      <div className="space-y-2">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-4 w-28" />
      </div>
    </div>
    {/* Form skeleton */}
    <div className="space-y-4">
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-full" />
      <SkeletonBlock className="h-12 w-3/4" />
    </div>
  </div>
);

// ── Email Change Modal ──
interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  t: (key: string) => string;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

const EmailChangeModal = ({
  isOpen,
  onClose,
  currentEmail,
  t,
  onSuccess,
  showToast,
}: EmailChangeModalProps) => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [newEmail, setNewEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetState = useCallback(() => {
    setStep("email");
    setNewEmail("");
    setOtpCode("");
    setError("");
    setIsLoading(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendOtp = async () => {
    if (!newEmail.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      await userInfoService.changeEmail({ newEmail: newEmail.trim() });
      showToast(t("info.emailChange.otpSent"), "success");
      setStep("otp");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { data?: { newEmail?: string }; message?: string } };
      };
      const fieldError = apiErr?.response?.data?.data?.newEmail;
      const generalError = apiErr?.response?.data?.message;
      setError(fieldError || generalError || t("info.emailChange.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      await userInfoService.verifyChangeEmail({ otp: otpCode.trim() });
      showToast(t("info.emailChange.success"), "success");
      handleClose();
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        apiErr?.response?.data?.message || t("info.emailChange.otpFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl border border-zinc-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold text-zinc-900">
            {step === "email"
              ? t("info.emailChange.title")
              : t("info.emailChange.otpTitle")}
          </h3>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="text-sm text-zinc-500 mb-1">
            {step === "email"
              ? t("info.emailChange.description")
              : t("info.emailChange.otpDescription")}
          </p>

          {step === "email" && (
            <p className="text-xs text-zinc-400 mb-4">
              {t("info.fields.email")}: <span className="font-medium text-zinc-600">{currentEmail}</span>
            </p>
          )}

          {step === "email" ? (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {t("info.emailChange.newEmail")}
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setError("");
                  }}
                  placeholder={t("info.emailChange.newEmailPlaceholder")}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 transition"
                />
                {error && (
                  <p className="mt-1.5 text-xs text-rose-600">{error}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98]"
                >
                  {t("info.actions.cancel")}
                </button>
                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || !newEmail.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isLoading
                    ? t("info.actions.sendingOtp")
                    : t("info.actions.sendOtp")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {t("info.emailChange.otpCode")}
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setError("");
                  }}
                  placeholder={t("info.emailChange.otpCodePlaceholder")}
                  maxLength={6}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 transition tracking-[0.3em] text-center font-mono text-lg"
                />
                {error && (
                  <p className="mt-1.5 text-xs text-rose-600">{error}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    setStep("email");
                    setOtpCode("");
                    setError("");
                  }}
                  className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98]"
                >
                  {t("info.actions.cancel")}
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || !otpCode.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isLoading
                    ? t("info.actions.verifyingOtp")
                    : t("info.actions.verifyOtp")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main UserInfoPage ──

const UserInfoPage = () => {
  const { t } = useTranslation("Profile");

  // State
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Form state
  const [formFullName, setFormFullName] = useState("");
  const [formPhoneNumber, setFormPhoneNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
    },
    []
  );

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userInfoService.getUserInfo();
      const data = res.data.data;
      if (data) {
        setUserInfo(data);
        setFormFullName(data.fullName || "");
        setFormPhoneNumber(data.phoneNumber || "");
      }
    } catch {
      showToast(t("info.messages.loadError"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [t, showToast]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Handlers
  const handleStartEdit = () => {
    if (userInfo) {
      setFormFullName(userInfo.fullName || "");
      setFormPhoneNumber(userInfo.phoneNumber || "");
      setFieldErrors({});
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFieldErrors({});
    if (userInfo) {
      setFormFullName(userInfo.fullName || "");
      setFormPhoneNumber(userInfo.phoneNumber || "");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFieldErrors({});
    try {
      const res = await userInfoService.updateUserInfo({
        fullName: formFullName.trim(),
        phoneNumber: formPhoneNumber.trim(),
      });
      const data = res.data.data;
      if (data) {
        setUserInfo(data);
        setFormFullName(data.fullName || "");
        setFormPhoneNumber(data.phoneNumber || "");
      }
      setIsEditing(false);
      showToast(t("info.messages.updateSuccess"), "success");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          data?: {
            data?: Record<string, string>;
            message?: string;
          };
        };
      };
      const validationErrors = apiErr?.response?.data?.data;
      if (validationErrors && typeof validationErrors === "object") {
        setFieldErrors(validationErrors);
      } else {
        showToast(
          apiErr?.response?.data?.message || t("info.messages.updateError"),
          "error"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      showToast(t("info.avatar.sizeError"), "error");
      e.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await userInfoService.uploadAvatar(file);
      if (res.data.data && userInfo) {
        setUserInfo({ ...userInfo, avatarUrl: res.data.data });
      }
      showToast(t("info.avatar.success"), "success");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { data?: { message?: string } };
      };
      showToast(
        apiErr?.response?.data?.message || t("info.avatar.error"),
        "error"
      );
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // ── Render ──

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {t("info.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{t("info.description")}</p>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-zinc-300 mb-4" />
        <p className="text-zinc-500 text-sm">{t("info.messages.loadError")}</p>
        <button
          onClick={fetchUserInfo}
          className="mt-4 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition active:scale-[0.98]"
        >
          {t("info.actions.edit")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {t("info.title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("info.description")}</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">
          {t("info.avatar.title")}
        </h2>
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-zinc-100 bg-zinc-100">
              {userInfo.avatarUrl ? (
                <img
                  src={userInfo.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                  <User className="h-10 w-10 text-zinc-400" />
                </div>
              )}
            </div>

            {/* Overlay on hover */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-all cursor-pointer"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Info beside avatar */}
          <div>
            <p className="font-medium text-zinc-900">
              {userInfo.fullName || "—"}
            </p>
            <p className="text-sm text-zinc-500 mt-0.5">{userInfo.email}</p>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
            >
              {isUploadingAvatar ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("info.avatar.uploading")}
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" />
                  {t("info.avatar.change")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {t("info.sections.basicInfo")}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {t("info.sections.basicInfoDesc")}
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98]"
            >
              <Pencil className="h-4 w-4" />
              {t("info.actions.edit")}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                {t("info.actions.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? t("info.actions.saving") : t("info.actions.save")}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
              <User className="h-4 w-4 text-zinc-400" />
              {t("info.fields.fullName")}
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => {
                    setFormFullName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  placeholder={t("info.fields.fullNamePlaceholder")}
                  className={[
                    "w-full rounded-xl border bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition",
                    fieldErrors.fullName
                      ? "border-rose-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-200"
                      : "border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300",
                  ].join(" ")}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-transparent bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900">
                {userInfo.fullName || "—"}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
              <Phone className="h-4 w-4 text-zinc-400" />
              {t("info.fields.phoneNumber")}
            </label>
            {isEditing ? (
              <div>
                <input
                  type="tel"
                  value={formPhoneNumber}
                  onChange={(e) => {
                    setFormPhoneNumber(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      phoneNumber: "",
                    }));
                  }}
                  placeholder={t("info.fields.phoneNumberPlaceholder")}
                  className={[
                    "w-full rounded-xl border bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition",
                    fieldErrors.phoneNumber
                      ? "border-rose-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-200"
                      : "border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300",
                  ].join(" ")}
                />
                {fieldErrors.phoneNumber && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.phoneNumber}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-transparent bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900">
                {userInfo.phoneNumber || "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {t("info.sections.emailSection")}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {t("info.sections.emailSectionDesc")}
            </p>
          </div>
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98]"
          >
            <Mail className="h-4 w-4" />
            {t("info.actions.changeEmail")}
          </button>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
            <Mail className="h-4 w-4 text-zinc-400" />
            {t("info.fields.email")}
          </label>
          <p className="rounded-xl border border-transparent bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900">
            {userInfo.email}
          </p>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-6">
          {t("info.sections.accountInfo")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Created At */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
              <Calendar className="h-4 w-4 text-zinc-400" />
              {t("info.fields.createdAt")}
            </label>
            <p className="rounded-xl border border-transparent bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900">
              {userInfo.createAt || "—"}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
              <Shield className="h-4 w-4 text-zinc-400" />
              {t("info.fields.status")}
            </label>
            <div className="px-4 py-3">
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border",
                  userInfo.active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    userInfo.active ? "bg-emerald-500" : "bg-rose-500",
                  ].join(" ")}
                />
                {userInfo.active
                  ? t("info.fields.active")
                  : t("info.fields.inactive")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Change Modal */}
      <EmailChangeModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        currentEmail={userInfo.email}
        t={t}
        onSuccess={fetchUserInfo}
        showToast={showToast}
      />
    </div>
  );
};

export default UserInfoPage;
