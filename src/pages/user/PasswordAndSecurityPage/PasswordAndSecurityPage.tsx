import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LockKeyhole,
  Mail,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import authService from "../../../services/user/authService";
import useUserStore from "../../../store/userStore";

// ── Password Change Section ──

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type PasswordFieldName = keyof PasswordForm;

const initialForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const PasswordAndSecurityPage = () => {
  const { t } = useTranslation("Profile");
  const userInfo = useUserStore((s) => s.userInfo);

  // ── Password State ──
  const [form, setForm] = useState<PasswordForm>(initialForm);
  const [visibleFields, setVisibleFields] = useState<
    Partial<Record<PasswordFieldName, boolean>>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Forgot Password Modal State ──
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<
    "confirm" | "otp" | "password" | "success"
  >("confirm");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState<string[]>(Array(6).fill(""));
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] =
    useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotFieldErrors, setForgotFieldErrors] = useState<
    Record<string, string>
  >({});
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);
  const [forgotResendSuccess, setForgotResendSuccess] = useState(false);

  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for forgot password OTP resend
  useEffect(() => {
    if (forgotResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotResendCooldown]);

  const handleOpenForgotModal = () => {
    setIsForgotModalOpen(true);
    setForgotStep("confirm");
    setForgotEmail(userInfo?.email || "");
    setForgotOtp(Array(6).fill(""));
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotError(null);
    setForgotFieldErrors({});
    setForgotResendCooldown(0);
    setForgotResendSuccess(false);
  };

  const handleCloseForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotError(null);
    setForgotFieldErrors({});
  };

  const handleSendForgotOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError(null);
    setForgotFieldErrors({});

    const targetEmail = forgotEmail.trim();
    if (!targetEmail) {
      setForgotFieldErrors({
        email: t("changePassword.forgotModal.emailRequired"),
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setForgotFieldErrors({
        email: t("changePassword.forgotModal.emailInvalid"),
      });
      return;
    }

    setForgotLoading(true);
    try {
      await authService.forgotPassword({ email: targetEmail });
      setForgotResendCooldown(60);
      setForgotStep("otp");
    } catch (err: unknown) {
      const apiMessage = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setForgotError(apiMessage || t("changePassword.messages.error"));
    } finally {
      setForgotLoading(false);
    }
  };

  const focusForgotOtpInput = useCallback((index: number) => {
    forgotOtpRefs.current[index]?.focus();
  }, []);

  const handleForgotOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    setForgotError(null);
    setForgotFieldErrors({});

    const newOtp = [...forgotOtp];
    newOtp[index] = value;
    setForgotOtp(newOtp);

    if (value && index < 5) {
      focusForgotOtpInput(index + 1);
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
      focusForgotOtpInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusForgotOtpInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusForgotOtpInput(index + 1);
    }
  };

  const handleForgotOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...forgotOtp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setForgotOtp(newOtp);
    focusForgotOtpInput(Math.min(pastedData.length, 5));
  };

  const handleResendForgotOtp = async () => {
    if (forgotResendCooldown > 0) return;
    setForgotError(null);
    setForgotResendSuccess(false);
    setForgotLoading(true);

    try {
      await authService.forgotPassword({ email: forgotEmail });
      setForgotResendCooldown(60);
      setForgotResendSuccess(true);
      setTimeout(() => setForgotResendSuccess(false), 5000);
    } catch (err: unknown) {
      const apiMessage = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setForgotError(apiMessage || t("changePassword.messages.error"));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotFieldErrors({});

    const otpString = forgotOtp.join("");
    const errors: Record<string, string> = {};

    if (otpString.length !== 6) {
      errors.otp = t("changePassword.forgotModal.otpLabel");
    }

    if (!forgotNewPassword) {
      errors.newPassword = t("changePassword.messages.invalid");
    } else {
      if (forgotNewPassword.length < 8)
        errors.newPassword = t("changePassword.rules.minLength");
      else if (!/[A-Z]/.test(forgotNewPassword))
        errors.newPassword = t("changePassword.rules.uppercase");
      else if (!/\d/.test(forgotNewPassword))
        errors.newPassword = t("changePassword.rules.number");
      else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forgotNewPassword))
        errors.newPassword = t("changePassword.rules.specialChar");
    }

    if (!forgotConfirmPassword) {
      errors.confirmPassword = t("changePassword.messages.mismatch");
    } else if (forgotNewPassword !== forgotConfirmPassword) {
      errors.confirmPassword = t("changePassword.messages.mismatch");
    }

    if (Object.keys(errors).length > 0) {
      setForgotFieldErrors(errors);
      return;
    }

    setForgotLoading(true);
    try {
      await authService.resetPassword({
        email: forgotEmail,
        otp: otpString,
        newPassword: forgotNewPassword,
      });
      setForgotStep("success");
    } catch (err: unknown) {
      const apiMessage = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setForgotError(apiMessage || t("changePassword.messages.error"));
    } finally {
      setForgotLoading(false);
    }
  };

  // ── 2FA State ──
  const [is2faEnabled, setIs2faEnabled] = useState<boolean | null>(null);
  const [is2faLoading, setIs2faLoading] = useState(true);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null);

  // Setup flow
  const [showSetupFlow, setShowSetupFlow] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupTotp, setSetupTotp] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  // Disable flow
  const [showDisableFlow, setShowDisableFlow] = useState(false);
  const [disableTotp, setDisableTotp] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

  // Reset 2FA via Email
  const [isRequestingReset2fa, setIsRequestingReset2fa] = useState(false);

  const handleRequestReset2fa = async () => {
    setIsRequestingReset2fa(true);
    setTwoFaError(null);
    setTwoFaSuccess(null);
    try {
      const res = await authService.requestReset2fa();
      setTwoFaSuccess(
        res.data?.message ||
          "Một email xác nhận khôi phục 2FA đã được gửi tới địa chỉ email của bạn"
      );
    } catch (err: unknown) {
      const apiMessage = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setTwoFaError(apiMessage || "Gửi yêu cầu gỡ 2FA thất bại");
    } finally {
      setIsRequestingReset2fa(false);
    }
  };

  // ── Fetch 2FA Status ──
  useEffect(() => {
    const fetch2faStatus = async () => {
      setIs2faLoading(true);
      try {
        const res = await authService.get2faStatus();
        setIs2faEnabled(res.data.data ?? false);
      } catch {
        setTwoFaError(t("twoFa.messages.loadError"));
      } finally {
        setIs2faLoading(false);
      }
    };
    fetch2faStatus();
  }, [t]);

  // ── Password Logic ──
  const passwordRules = useMemo(
    () => [
      {
        label: t("changePassword.rules.minLength"),
        isValid: form.newPassword.length >= 8,
      },
      {
        label: t("changePassword.rules.uppercase"),
        isValid: /[A-Z]/.test(form.newPassword),
      },
      {
        label: t("changePassword.rules.number"),
        isValid: /\d/.test(form.newPassword),
      },
      {
        label: t("changePassword.rules.specialChar"),
        isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.newPassword),
      },
      {
        label: t("changePassword.rules.different"),
        isValid:
          form.currentPassword.length > 0 &&
          form.newPassword.length > 0 &&
          form.currentPassword !== form.newPassword,
      },
    ],
    [form.currentPassword, form.newPassword, t]
  );

  const isFormValid =
    form.currentPassword.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword &&
    passwordRules.every((rule) => rule.isValid);

  const updateField = (name: PasswordFieldName, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setMessage(null);
    setError(null);
  };

  const toggleFieldVisibility = (name: PasswordFieldName) => {
    setVisibleFields((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      setError(t("changePassword.messages.invalid"));
      setMessage(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await authService.changePassword({
        oldPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm(initialForm);
      setMessage(response.data.message ?? t("changePassword.messages.success"));
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setError(apiMessage ?? t("changePassword.messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 2FA Setup Flow ──
  const handleStartSetup = async () => {
    setIsSettingUp(true);
    setTwoFaError(null);
    setTwoFaSuccess(null);
    try {
      const res = await authService.setup2fa();
      const data = res.data.data;
      setSecretKey(data?.secret ?? "");
      setSetupEmail(data?.email ?? "");
      setShowSetupFlow(true);
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setTwoFaError(apiMessage ?? t("twoFa.messages.error"));
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (setupTotp.length !== 6) return;
    setIsConfirming(true);
    setTwoFaError(null);
    try {
      const res = await authService.confirm2fa({ totp: setupTotp });
      setIs2faEnabled(true);
      setShowSetupFlow(false);
      setSetupTotp("");
      setSecretKey("");
      setTwoFaSuccess(res.data.message ?? t("twoFa.messages.enableSuccess"));
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setTwoFaError(apiMessage ?? t("twoFa.messages.error"));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelSetup = () => {
    setShowSetupFlow(false);
    setSetupTotp("");
    setSecretKey("");
    setTwoFaError(null);
  };

  // ── 2FA Disable Flow ──
  const handleConfirmDisable = async () => {
    if (disableTotp.length !== 6) return;
    setIsDisabling(true);
    setTwoFaError(null);
    try {
      const res = await authService.disable2fa({ totp: disableTotp });
      setIs2faEnabled(false);
      setShowDisableFlow(false);
      setDisableTotp("");
      setTwoFaSuccess(res.data.message ?? t("twoFa.messages.disableSuccess"));
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setTwoFaError(apiMessage ?? t("twoFa.messages.error"));
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCancelDisable = () => {
    setShowDisableFlow(false);
    setDisableTotp("");
    setTwoFaError(null);
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  // Build otpauth URI for QR code
  const otpauthUri = secretKey
    ? `otpauth://totp/${setupEmail}?secret=${secretKey}&issuer=IAP`
    : "";

  return (
    <div className="w-full space-y-6">
      {/* ── Password Change + Rules Grid ── */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-6 sm:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
              {t("changePassword.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              {t("changePassword.description")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
            {(message || error) && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  error
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {error ?? message}
              </div>
            )}

            <PasswordField
              label={t("changePassword.fields.currentPassword")}
              value={form.currentPassword}
              isVisible={Boolean(visibleFields.currentPassword)}
              onChange={(value) => updateField("currentPassword", value)}
              onToggleVisibility={() => toggleFieldVisibility("currentPassword")}
              rightAction={
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition"
                >
                  {t("changePassword.forgotPasswordLink")}
                </button>
              }
            />

            <div className="grid gap-5 md:grid-cols-2">
              <PasswordField
                label={t("changePassword.fields.newPassword")}
                value={form.newPassword}
                isVisible={Boolean(visibleFields.newPassword)}
                onChange={(value) => updateField("newPassword", value)}
                onToggleVisibility={() => toggleFieldVisibility("newPassword")}
              />
              <PasswordField
                label={t("changePassword.fields.confirmPassword")}
                value={form.confirmPassword}
                isVisible={Boolean(visibleFields.confirmPassword)}
                onChange={(value) => updateField("confirmPassword", value)}
                onToggleVisibility={() =>
                  toggleFieldVisibility("confirmPassword")
                }
              />
            </div>

            {form.confirmPassword.length > 0 &&
              form.newPassword !== form.confirmPassword && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {t("changePassword.messages.mismatch")}
                </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setForm(initialForm);
                  setError(null);
                  setMessage(null);
                }}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("changePassword.actions.reset")}
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {isSubmitting
                  ? t("changePassword.actions.submitting")
                  : t("changePassword.actions.submit")}
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <KeyRound className="h-4 w-4" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">
            {t("changePassword.rules.title")}
          </h2>
          <div className="mt-4 space-y-3">
            {passwordRules.map((rule) => (
              <div
                key={rule.label}
                className="flex items-start gap-3 text-sm text-zinc-600"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    rule.isValid
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-white text-zinc-400"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-700">
            {t("changePassword.securityNote")}
          </div>
        </aside>
      </div>

      {/* ── 2FA Management Card ── */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
                {t("twoFa.title")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                {t("twoFa.description")}
              </p>
            </div>
            {!is2faLoading && is2faEnabled !== null && (
              <span
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                  is2faEnabled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500"
                }`}
              >
                {is2faEnabled ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <ShieldOff className="h-3.5 w-3.5" />
                )}
                {is2faEnabled
                  ? t("twoFa.statusEnabled")
                  : t("twoFa.statusDisabled")}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Loading state */}
          {is2faLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          )}

          {/* Messages */}
          {(twoFaError || twoFaSuccess) && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                twoFaError
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {twoFaError ?? twoFaSuccess}
            </div>
          )}

          {/* ── 2FA Not Enabled: Show enable button or setup flow ── */}
          {!is2faLoading && is2faEnabled === false && !showSetupFlow && (
            <button
              onClick={handleStartSetup}
              disabled={isSettingUp}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSettingUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {t("twoFa.enableButton")}
            </button>
          )}

          {/* ── Setup Flow (QR + Secret + TOTP input) ── */}
          {showSetupFlow && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-zinc-900">
                {t("twoFa.setup.title")}
              </h3>

              {/* Step 1: QR Code */}
              <div>
                <p className="mb-3 text-sm text-zinc-600">
                  {t("twoFa.setup.step1")}
                </p>
                <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-4">
                  <QRCodeSVG
                    value={otpauthUri}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#18181b"
                    level="M"
                  />
                </div>
              </div>

              {/* Step 2: Secret key */}
              <div>
                <p className="mb-2 text-sm text-zinc-600">
                  {t("twoFa.setup.step2")}
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5">
                  <code className="select-all text-sm font-mono font-medium text-zinc-900 tracking-wider">
                    {secretKey}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label="Copy secret"
                  >
                    {secretCopied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <span className="text-xs text-zinc-400">
                    {secretCopied
                      ? t("twoFa.setup.copied")
                      : t("twoFa.setup.copySecret")}
                  </span>
                </div>
              </div>

              {/* Step 3: Enter TOTP */}
              <div>
                <p className="mb-2 text-sm text-zinc-600">
                  {t("twoFa.setup.step3")}
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={setupTotp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setSetupTotp(val);
                    setTwoFaError(null);
                  }}
                  placeholder={t("twoFa.setup.totpPlaceholder")}
                  className="w-48 rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-lg font-semibold tracking-[0.3em] text-zinc-900 outline-none transition placeholder:text-zinc-400 placeholder:text-sm placeholder:tracking-normal focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-zinc-200 pt-5">
                <button
                  type="button"
                  onClick={handleCancelSetup}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
                >
                  {t("twoFa.setup.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSetup}
                  disabled={setupTotp.length !== 6 || isConfirming}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isConfirming && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isConfirming
                    ? t("twoFa.setup.confirming")
                    : t("twoFa.setup.confirm")}
                </button>
              </div>
            </div>
          )}

          {/* ── 2FA Enabled: Show action buttons ── */}
          {!is2faLoading && is2faEnabled === true && !showDisableFlow && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setShowDisableFlow(true);
                  setTwoFaError(null);
                  setTwoFaSuccess(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98]"
              >
                <ShieldOff className="h-4 w-4" />
                {t("twoFa.disableButton")}
              </button>

              <button
                type="button"
                onClick={handleRequestReset2fa}
                disabled={isRequestingReset2fa}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-60"
              >
                {isRequestingReset2fa ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {t("twoFa.requestResetButton") || "Yêu cầu gỡ 2FA qua Email"}
              </button>
            </div>
          )}

          {/* ── Disable Flow ── */}
          {showDisableFlow && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">
                  {t("twoFa.disable.title")}
                </h3>
                <p className="mt-2 text-sm text-zinc-600">
                  {t("twoFa.disable.description")}
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableTotp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setDisableTotp(val);
                  setTwoFaError(null);
                }}
                placeholder={t("twoFa.disable.totpPlaceholder")}
                className="w-48 rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-lg font-semibold tracking-[0.3em] text-zinc-900 outline-none transition placeholder:text-zinc-400 placeholder:text-sm placeholder:tracking-normal focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
              />

              <div className="flex gap-3 border-t border-zinc-200 pt-5">
                <button
                  type="button"
                  onClick={handleCancelDisable}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
                >
                  {t("twoFa.disable.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisable}
                  disabled={disableTotp.length !== 6 || isDisabling}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDisabling && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isDisabling
                    ? t("twoFa.disable.confirming")
                    : t("twoFa.disable.confirm")}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Forgot Password Modal ── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4">
          <div
            className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dấu X góc phải to 1 xíu để tắt modal */}
            <button
              type="button"
              onClick={handleCloseForgotModal}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                {t("changePassword.forgotModal.title")}
              </h2>
              <p className="mt-1.5 text-xs text-zinc-600">
                {forgotStep === "confirm" &&
                  t("changePassword.forgotModal.subtitleConfirm")}
                {forgotStep === "otp" &&
                  t("changePassword.forgotModal.subtitleOtp")}
                {forgotStep === "password" &&
                  t("changePassword.forgotModal.subtitlePassword")}
              </p>
            </div>

            {/* Global Error Alert */}
            {forgotError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {forgotError}
              </div>
            )}

            {/* Resend Success Alert */}
            {forgotResendSuccess && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                {t("changePassword.forgotModal.resendOtp")}
              </div>
            )}

            {/* STEP 1: Confirm Send OTP / Email */}
            {forgotStep === "confirm" && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                {userInfo?.email ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs text-zinc-600">
                      {t("changePassword.forgotModal.confirmEmailText")}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-zinc-900">
                        {userInfo.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-700">
                      {t("changePassword.forgotModal.enterEmail")}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotFieldErrors.email) setForgotFieldErrors({});
                        }}
                        placeholder="you@example.com"
                        className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                          forgotFieldErrors.email
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-zinc-200 focus:border-zinc-400"
                        }`}
                      />
                    </div>
                    {forgotFieldErrors.email && (
                      <p className="mt-1 text-xs text-rose-600">
                        {forgotFieldErrors.email}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {forgotLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {forgotLoading
                    ? t("changePassword.forgotModal.sendingOtp")
                    : t("changePassword.forgotModal.sendOtp")}
                </button>
              </form>
            )}

            {/* STEP 2: OTP Input */}
            {forgotStep === "otp" && (
              <div className="space-y-5">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-medium text-zinc-900">
                    {forgotEmail}
                  </span>
                </div>

                <div className="flex justify-center gap-2">
                  {forgotOtp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        forgotOtpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleForgotOtpChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleForgotOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleForgotOtpPaste : undefined}
                      className={`h-12 w-10 rounded-lg border text-center text-lg font-semibold text-zinc-900 outline-none transition focus:ring-2 focus:ring-zinc-900/10 ${
                        forgotFieldErrors.otp
                          ? "border-rose-300 focus:border-rose-400"
                          : digit
                            ? "border-zinc-400"
                            : "border-zinc-200 focus:border-zinc-400"
                      }`}
                    />
                  ))}
                </div>

                {forgotFieldErrors.otp && (
                  <p className="text-center text-xs text-rose-600">
                    {forgotFieldErrors.otp}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const otpString = forgotOtp.join("");
                    if (otpString.length !== 6) {
                      setForgotFieldErrors({
                        otp: t("changePassword.forgotModal.otpLabel"),
                      });
                      return;
                    }
                    setForgotStep("password");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  {t("changePassword.forgotModal.continue")}
                </button>

                <div className="flex flex-col items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    disabled={forgotResendCooldown > 0 || forgotLoading}
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {forgotLoading
                      ? t("changePassword.forgotModal.resendingOtp")
                      : forgotResendCooldown > 0
                        ? t("changePassword.forgotModal.resendIn", {
                            seconds: forgotResendCooldown,
                          })
                        : t("changePassword.forgotModal.resendOtp")}
                  </button>

                  {!userInfo?.email && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotOtp(Array(6).fill(""));
                        setForgotStep("confirm");
                      }}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-600"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      {t("changePassword.forgotModal.wrongEmail")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Reset Password */}
            {forgotStep === "password" && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">
                    {t("changePassword.forgotModal.newPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showForgotNewPassword ? "text" : "password"}
                      value={forgotNewPassword}
                      onChange={(e) => {
                        setForgotNewPassword(e.target.value);
                        if (forgotFieldErrors.newPassword)
                          setForgotFieldErrors({});
                      }}
                      placeholder={t("changePassword.forgotModal.newPassword")}
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                        forgotFieldErrors.newPassword
                          ? "border-rose-300 focus:border-rose-400"
                          : "border-zinc-200 focus:border-zinc-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowForgotNewPassword(!showForgotNewPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      tabIndex={-1}
                    >
                      {showForgotNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {forgotFieldErrors.newPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {forgotFieldErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-700">
                    {t("changePassword.forgotModal.confirmPassword")}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showForgotConfirmPassword ? "text" : "password"}
                      value={forgotConfirmPassword}
                      onChange={(e) => {
                        setForgotConfirmPassword(e.target.value);
                        if (forgotFieldErrors.confirmPassword)
                          setForgotFieldErrors({});
                      }}
                      placeholder={t(
                        "changePassword.forgotModal.confirmPassword"
                      )}
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                        forgotFieldErrors.confirmPassword
                          ? "border-rose-300 focus:border-rose-400"
                          : "border-zinc-200 focus:border-zinc-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowForgotConfirmPassword(!showForgotConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      tabIndex={-1}
                    >
                      {showForgotConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {forgotFieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {forgotFieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep("otp")}
                    className="flex items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("changePassword.forgotModal.otpLabel")}
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {forgotLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {forgotLoading
                      ? t("changePassword.forgotModal.resettingPassword")
                      : t("changePassword.forgotModal.resetPassword")}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Success */}
            {forgotStep === "success" && (
              <div className="py-4 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {t("changePassword.forgotModal.successTitle")}
                  </h3>
                  <p className="mt-1.5 text-xs text-zinc-600">
                    {t("changePassword.forgotModal.successDesc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseForgotModal}
                  className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  {t("changePassword.forgotModal.close")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Password Field Component ──

interface PasswordFieldProps {
  label: string;
  value: string;
  isVisible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
  rightAction?: React.ReactNode;
}

const PasswordField = ({
  label,
  value,
  isVisible,
  onChange,
  onToggleVisibility,
  rightAction,
}: PasswordFieldProps) => (
  <label className="block">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      {rightAction}
    </div>
    <span className="flex h-11 items-center rounded-lg border border-zinc-200 bg-white px-3 transition focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100">
      <input
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </span>
  </label>
);

export default PasswordAndSecurityPage;
