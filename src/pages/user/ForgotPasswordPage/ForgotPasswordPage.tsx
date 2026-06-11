import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
  KeyRound,
  Check,
  X,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import authService from "../../../services/user/authService";

type Step = "email" | "otp" | "password";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

interface PasswordRule {
  key: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { key: "minLength", test: (pw) => pw.length >= 8 },
  { key: "uppercase", test: (pw) => /[A-Z]/.test(pw) },
  { key: "lowercase", test: (pw) => /[a-z]/.test(pw) },
  { key: "number", test: (pw) => /\d/.test(pw) },
  { key: "special", test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const ForgotPasswordPage = () => {
  const { t } = useTranslation("Auth");
  const navigate = useNavigate();

  // Multi-step state
  const [step, setStep] = useState<Step>("email");
  const [direction, setDirection] = useState(1);

  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Refs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const goToStep = (nextStep: Step, dir: number = 1) => {
    setDirection(dir);
    setError("");
    setFieldErrors({});
    setStep(nextStep);
  };

  // ── Step 1: Submit Email ──
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t("validation.emailInvalid");
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      setResendCooldown(RESEND_COOLDOWN);
      goToStep("otp");
    } catch {
      // API always returns 202, but handle network errors
      setError(t("forgotPassword.emailSendError"));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: OTP Input Handlers ──
  const focusOtpInput = useCallback((index: number) => {
    otpRefs.current[index]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    setError("");
    setFieldErrors({});

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      focusOtpInput(index + 1);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      focusOtpInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusOtpInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusOtpInput(index + 1);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    focusOtpInput(Math.min(pastedData.length, OTP_LENGTH - 1));
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setResendSuccess(false);
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setResendCooldown(RESEND_COOLDOWN);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      setError(t("forgotPassword.emailSendError"));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Password Validation & Submit ──
  const passwordStrength = PASSWORD_RULES.filter((rule) =>
    rule.test(newPassword)
  ).length;

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-rose-500";
    if (passwordStrength <= 2) return "bg-amber-500";
    if (passwordStrength <= 3) return "bg-amber-400";
    if (passwordStrength <= 4) return "bg-emerald-400";
    return "bg-emerald-500";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const otpString = otp.join("");
    const errors: Record<string, string> = {};

    if (otpString.length !== OTP_LENGTH) {
      errors.otp = t("validation.otpRequired");
    }

    if (!newPassword) {
      errors.newPassword = t("validation.passwordRequired");
    } else {
      if (newPassword.length < 8) errors.newPassword = t("validation.passwordMinLength");
      else if (!/[A-Z]/.test(newPassword)) errors.newPassword = t("validation.passwordUppercase");
      else if (!/\d/.test(newPassword)) errors.newPassword = t("validation.passwordNumber");
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword))
        errors.newPassword = t("validation.passwordSpecial");
    }

    if (!confirmPassword) {
      errors.confirmPassword = t("forgotPassword.confirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t("forgotPassword.passwordMismatch");
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: otpString,
        newPassword,
      });
      setResetSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err: unknown) {
      // Handle API error response
      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message;
        if (message) {
          setError(message);
        } else {
          setError(t("forgotPassword.resetError"));
        }
      } else {
        setError(t("forgotPassword.resetError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step Indicator ──
  const steps: Step[] = ["email", "otp", "password"];
  const currentStepIndex = steps.indexOf(step);

  if (resetSuccess) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-md text-center"
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-8 sm:p-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900">
              {t("forgotPassword.successTitle")}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              {t("forgotPassword.successMessage")}
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]"
              >
                {t("forgotPassword.backToLogin")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 py-12 relative">
      <Link
        to="/login"
        className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("forgotPassword.backToLogin")}
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <KeyRound className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {t("forgotPassword.title")}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {step === "email" && t("forgotPassword.subtitleEmail")}
            {step === "otp" && t("forgotPassword.subtitleOtp")}
            {step === "password" && t("forgotPassword.subtitlePassword")}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  i < currentStepIndex
                    ? "bg-emerald-500 text-white"
                    : i === currentStepIndex
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {i < currentStepIndex ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 rounded-full transition-all duration-300 ${
                    i < currentStepIndex ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 overflow-hidden">
          {/* Global Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </motion.div>
          )}

          {/* Resend Success */}
          {resendSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {t("forgotPassword.otpResent")}
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {/* ══ STEP 1: Email ══ */}
            {step === "email" && (
              <motion.form
                key="email-step"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-1.5 block text-sm font-medium text-zinc-900"
                  >
                    {t("forgotPassword.emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: "" }));
                        }
                      }}
                      placeholder={t("login.emailPlaceholder")}
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                        fieldErrors.email
                          ? "border-rose-300 focus:border-rose-400"
                          : "border-zinc-200 focus:border-zinc-400"
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-rose-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || resendCooldown > 0}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading
                    ? t("forgotPassword.sending")
                    : resendCooldown > 0
                      ? t("verify.resendIn", { seconds: resendCooldown })
                      : t("forgotPassword.sendOtp")}
                </button>
              </motion.form>
            )}

            {/* ══ STEP 2: OTP ══ */}
            {step === "otp" && (
              <motion.div
                key="otp-step"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-5"
              >
                {/* Email display */}
                <div className="flex items-center justify-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-700">
                    {email}
                  </span>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2.5 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className={`h-12 w-10 rounded-lg border text-center text-lg font-semibold text-zinc-900 outline-none transition focus:ring-2 focus:ring-zinc-900/10 sm:h-14 sm:w-12 ${
                        fieldErrors.otp
                          ? "border-rose-300 focus:border-rose-400"
                          : digit
                            ? "border-zinc-400"
                            : "border-zinc-200 focus:border-zinc-400"
                      }`}
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>

                {fieldErrors.otp && (
                  <p className="text-center text-xs text-rose-600">
                    {fieldErrors.otp}
                  </p>
                )}

                {/* Continue to password step */}
                <button
                  type="button"
                  onClick={() => {
                    const otpString = otp.join("");
                    if (otpString.length !== OTP_LENGTH) {
                      setFieldErrors({ otp: t("validation.otpRequired") });
                      return;
                    }
                    goToStep("password");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]"
                >
                  {t("forgotPassword.continue")}
                </button>

                {/* Resend & Wrong Email */}
                <div className="flex flex-col items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {isLoading
                      ? t("verify.resending")
                      : resendCooldown > 0
                        ? t("verify.resendIn", { seconds: resendCooldown })
                        : t("verify.resend")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtp(Array(OTP_LENGTH).fill(""));
                      goToStep("email", -1);
                    }}
                    className="flex items-center gap-1 text-xs text-zinc-500 transition hover:text-indigo-600"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    {t("forgotPassword.wrongEmail")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 3: New Password ══ */}
            {step === "password" && (
              <motion.form
                key="password-step"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                {/* New Password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-sm font-medium text-zinc-900"
                  >
                    {t("forgotPassword.newPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.newPassword) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            newPassword: "",
                          }));
                        }
                      }}
                      placeholder={t("forgotPassword.newPasswordPlaceholder")}
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                        fieldErrors.newPassword
                          ? "border-rose-300 focus:border-rose-400"
                          : "border-zinc-200 focus:border-zinc-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {fieldErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2.5"
                  >
                    {/* Strength Bar */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength
                              ? getStrengthColor()
                              : "bg-zinc-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Rules Checklist */}
                    <div className="grid grid-cols-1 gap-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(newPassword);
                        return (
                          <div
                            key={rule.key}
                            className="flex items-center gap-1.5"
                          >
                            {passed ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <X className="h-3 w-3 text-zinc-400" />
                            )}
                            <span
                              className={`text-xs ${passed ? "text-emerald-600" : "text-zinc-500"}`}
                            >
                              {t(`forgotPassword.rules.${rule.key}`)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-sm font-medium text-zinc-900"
                  >
                    {t("forgotPassword.confirmPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: "",
                          }));
                        }
                      }}
                      placeholder={t(
                        "forgotPassword.confirmPasswordPlaceholder"
                      )}
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                        fieldErrors.confirmPassword
                          ? "border-rose-300 focus:border-rose-400"
                          : "border-zinc-200 focus:border-zinc-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                  {confirmPassword &&
                    newPassword === confirmPassword &&
                    !fieldErrors.confirmPassword && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                        <Check className="h-3 w-3" />
                        {t("forgotPassword.passwordMatch")}
                      </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isLoading
                      ? t("forgotPassword.resetting")
                      : t("forgotPassword.resetPassword")}
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep("otp", -1)}
                    className="flex w-full items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("forgotPassword.editOtp")}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-600">
          {t("forgotPassword.rememberPassword")}{" "}
          <Link
            to="/login"
            className="font-medium text-zinc-900 underline underline-offset-2 transition hover:text-zinc-700"
          >
            {t("forgotPassword.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
