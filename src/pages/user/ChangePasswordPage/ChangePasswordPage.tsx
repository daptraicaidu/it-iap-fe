import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import authService from "../../../services/user/authService";

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

const ChangePasswordPage = () => {
  const { t } = useTranslation("Profile");
  const [form, setForm] = useState<PasswordForm>(initialForm);
  const [visibleFields, setVisibleFields] = useState<
    Partial<Record<PasswordFieldName, boolean>>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <main className="min-h-[100dvh] bg-zinc-50 text-zinc-900">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to="/info"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-500" />
          {t("changePassword.backToInfo")}
        </Link>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
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
      </section>
    </main>
  );
};

interface PasswordFieldProps {
  label: string;
  value: string;
  isVisible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

const PasswordField = ({
  label,
  value,
  isVisible,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) => (
  <label className="block">
    <span className="text-xs font-medium text-zinc-700">{label}</span>
    <span className="mt-1 flex h-11 items-center rounded-lg border border-zinc-200 bg-white px-3 transition focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100">
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

export default ChangePasswordPage;
