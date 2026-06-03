import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import useAuthStore from "../../../store/authStore";

const RegisterPage = () => {
  const { t } = useTranslation("Auth");
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = t("validation.fullNameRequired");
    }

    if (!email.trim()) {
      errors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t("validation.emailInvalid");
    }

    if (!password) {
      errors.password = t("validation.passwordRequired");
    } else {
      if (password.length < 8) {
        errors.password = t("validation.passwordMinLength");
      } else if (!/[A-Z]/.test(password)) {
        errors.password = t("validation.passwordUppercase");
      } else if (!/[0-9]/.test(password)) {
        errors.password = t("validation.passwordNumber");
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        errors.password = t("validation.passwordSpecial");
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      const userId = await register({
        email,
        password,
        fullName,
        phoneNumber: phoneNumber || undefined,
      });
      navigate("/verify-email", {
        state: { userId, email, password },
        replace: true,
      });
    } catch {
      // Error is handled by the store
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {t("register.title")}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {t("register.subtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
          {/* Global Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-fullname"
                className="mb-1.5 block text-sm font-medium text-zinc-900"
              >
                {t("register.fullName")}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="register-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  placeholder={t("register.fullNamePlaceholder")}
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                    fieldErrors.fullName
                      ? "border-rose-300 focus:border-rose-400"
                      : "border-zinc-200 focus:border-zinc-400"
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-sm font-medium text-zinc-900"
              >
                {t("register.email")}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  placeholder={t("register.emailPlaceholder")}
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

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-medium text-zinc-900"
              >
                {t("register.password")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  placeholder={t("register.passwordPlaceholder")}
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10 ${
                    fieldErrors.password
                      ? "border-rose-300 focus:border-rose-400"
                      : "border-zinc-200 focus:border-zinc-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.password}
                </p>
              )}
              {/* Password strength hints */}
              {password && !fieldErrors.password && (
                <div className="mt-2 space-y-1">
                  {[
                    { test: password.length >= 8, label: "8+ characters" },
                    { test: /[A-Z]/.test(password), label: "Uppercase" },
                    { test: /[0-9]/.test(password), label: "Number" },
                    {
                      test: /[^A-Za-z0-9]/.test(password),
                      label: "Special char",
                    },
                  ].map((rule) => (
                    <div
                      key={rule.label}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className={`h-1 w-1 rounded-full ${
                          rule.test ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      />
                      <span
                        className={
                          rule.test ? "text-emerald-600" : "text-zinc-400"
                        }
                      >
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Number (optional) */}
            <div>
              <label
                htmlFor="register-phone"
                className="mb-1.5 block text-sm font-medium text-zinc-900"
              >
                {t("register.phone")}{" "}
                <span className="text-zinc-400">
                  {t("register.phoneOptional")}
                </span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="register-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("register.phonePlaceholder")}
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t("register.submitting") : t("register.submit")}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-400">
              {t("register.orContinueWith")}
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("register.google")}
          </button>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-zinc-600">
          {t("register.hasAccount")}{" "}
          <Link
            to="/login"
            className="font-medium text-zinc-900 underline underline-offset-2 transition hover:text-zinc-700"
          >
            {t("register.login")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
