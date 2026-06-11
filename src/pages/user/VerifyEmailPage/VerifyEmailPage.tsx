import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Loader2, RotateCcw } from "lucide-react";
import useAuthStore from "../../../store/authStore";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

interface VerifyLocationState {
  userId?: string;
  email?: string;
  password?: string;
}

const VerifyEmailPage = () => {
  const { t } = useTranslation("Auth");
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, login, resendOtp, isLoading, error, clearError } =
    useAuthStore();

  const state = location.state as VerifyLocationState | null;
  const userId = state?.userId;
  const userEmail = state?.email;
  const userPassword = state?.password;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      navigate("/register", { replace: true });
    }
  }, [userId, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    setFieldError("");
    clearError();

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
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
    focusInput(Math.min(pastedData.length, OTP_LENGTH - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      setFieldError(t("validation.otpRequired"));
      return;
    }

    if (!userId) return;

    try {
      // Step 1: Verify OTP
      await verifyEmail(userId, otpString);

      // Step 2: Auto-login after successful verification
      if (userEmail && userPassword) {
        setIsAutoLogging(true);
        try {
          await login({ email: userEmail, password: userPassword });
          // GuestRoute will automatically redirect based on roles
        } catch {
          // If auto-login fails, redirect to login page
          navigate("/login", { replace: true });
        }
      } else {
        // No credentials available, redirect to login
        navigate("/login", { replace: true });
      }
    } catch {
      // Verification error is handled by the store
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !userId) return;

    clearError();
    setResendSuccess(false);

    try {
      await resendOtp(userId);
      setResendCooldown(RESEND_COOLDOWN);
      setResendSuccess(true);
      // Clear success message after 5s
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      // Error is handled by the store
    }
  };

  if (!userId) return null;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {t("verify.title")}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{t("verify.subtitle")}</p>
          {userEmail && (
            <p className="mt-1 text-sm font-medium text-zinc-900">
              {userEmail}
            </p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
          {/* Global Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Resend Success */}
          {resendSuccess && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {t("verify.resendSuccess")}
            </div>
          )}

          {/* Auto-login indicator */}
          {isAutoLogging && (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("verify.autoLogin")}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-2.5 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isAutoLogging}
                  className={`h-12 w-10 rounded-lg border text-center text-lg font-semibold text-zinc-900 outline-none transition focus:ring-2 focus:ring-zinc-900/10 sm:h-14 sm:w-12 disabled:opacity-50 ${
                    fieldError || error
                      ? "border-rose-300 focus:border-rose-400"
                      : digit
                        ? "border-zinc-400"
                        : "border-zinc-200 focus:border-zinc-400"
                  }`}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {fieldError && (
              <p className="text-center text-xs text-rose-600">{fieldError}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isAutoLogging}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {(isLoading || isAutoLogging) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isLoading ? t("verify.submitting") : t("verify.submit")}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading || isAutoLogging}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {isLoading
                ? t("verify.resending")
                : resendCooldown > 0
                  ? t("verify.resendIn", { seconds: resendCooldown })
                  : t("verify.resend")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
