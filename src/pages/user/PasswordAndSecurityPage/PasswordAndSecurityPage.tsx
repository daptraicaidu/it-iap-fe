import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import authService from "../../../services/user/authService";

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

  // ── Password State ──
  const [form, setForm] = useState<PasswordForm>(initialForm);
  const [visibleFields, setVisibleFields] = useState<
    Partial<Record<PasswordFieldName, boolean>>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

          {/* ── 2FA Enabled: Show disable button or disable flow ── */}
          {!is2faLoading && is2faEnabled === true && !showDisableFlow && (
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

export default PasswordAndSecurityPage;
