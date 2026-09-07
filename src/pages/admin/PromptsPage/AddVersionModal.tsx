import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import adminPromptService, {
  AI_MODELS,
  PROVIDERS,
} from "../../../services/admin/promptService";
import type { AxiosError } from "axios";

interface AddVersionModalProps {
  isOpen: boolean;
  adminPromptId: number;
  promptKey: string;
  onClose: () => void;
  onSuccess: () => void;
  /**
   * Render mode:
   * - "modal": renders with its own fixed overlay + backdrop (default, standalone)
   * - "inline": renders only the card element (for embedding in a shared container)
   */
  renderMode?: "modal" | "inline";
}

const AddVersionModal = ({
  isOpen,
  adminPromptId,
  promptKey,
  onClose,
  onSuccess,
  renderMode = "modal",
}: AddVersionModalProps) => {
  const { t } = useTranslation("AdminPrompts");

  // Form state
  const [version, setVersion] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [note, setNote] = useState("");
  const [active, setActive] = useState(true);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const resetForm = () => {
    setVersion("");
    setProvider("");
    setModel("");
    setPromptContent("");
    setNote("");
    setActive(true);
    setFieldErrors({});
    setGeneralError("");
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    setGeneralError("");
    setSubmitting(true);

    try {
      const response = await adminPromptService.addVersion(adminPromptId, {
        version,
        provider,
        model,
        promptContent,
        note,
        active,
      });
      if (response.data.code === 201 || response.data.code === 200) {
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        code: number;
        data?: Record<string, string>;
        message?: string;
      }>;
      if (axiosError.response?.status === 409) {
        setGeneralError(
          axiosError.response.data?.message || t("addVersionModal.conflictError")
        );
      } else if (axiosError.response?.data?.data) {
        setFieldErrors(axiosError.response.data.data);
      } else if (axiosError.response?.data?.message) {
        setGeneralError(axiosError.response.data.message);
      } else {
        setGeneralError(t("addVersionModal.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── Card content (shared between both render modes) ──
  const cardContent = (
    <div className="relative w-full max-w-4xl rounded-xl border border-zinc-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            {t("addVersionModal.title")}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {t("addVersionModal.forPrompt")}:{" "}
            <span className="font-medium text-zinc-700">{promptKey}</span>
          </p>
        </div>
        <button
          onClick={handleClose}
          disabled={submitting}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {generalError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {generalError}
          </div>
        )}

        <div className="space-y-4">
          {/* Version + Provider + Model row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Version */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                {t("addVersionModal.version")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder={t("addVersionModal.versionPlaceholder")}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
              {fieldErrors.version && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.version}
                </p>
              )}
            </div>

            {/* Provider */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                {t("addVersionModal.provider")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              >
                <option value="" disabled>
                  {t("addVersionModal.providerPlaceholder")}
                </option>
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {fieldErrors.provider && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.provider}
                </p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                {t("addVersionModal.model")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              >
                <option value="" disabled>
                  {t("addVersionModal.modelPlaceholder")}
                </option>
                {AI_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {fieldErrors.model && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.model}
                </p>
              )}
            </div>
          </div>

          {/* Prompt Content */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("addVersionModal.promptContent")}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder={t("addVersionModal.promptContentPlaceholder")}
              rows={29}
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
            {fieldErrors.promptContent && (
              <p className="mt-1 text-xs text-rose-600">
                {fieldErrors.promptContent}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              {t("addVersionModal.note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("addVersionModal.notePlaceholder")}
              rows={2}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                active ? "bg-emerald-500" : "bg-zinc-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                  active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-zinc-600">
              {t("addVersionModal.activeLabel")}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4">
        <button
          onClick={handleClose}
          disabled={submitting}
          className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
        >
          {t("addVersionModal.cancel")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting
            ? t("addVersionModal.submitting")
            : t("addVersionModal.submit")}
        </button>
      </div>
    </div>
  );

  // ── Inline mode: just the card, no overlay ──
  if (renderMode === "inline") {
    return cardContent;
  }

  // ── Modal mode: card wrapped in fixed overlay with backdrop ──
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 pt-16 pb-8">
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      {cardContent}
    </div>
  );
};

export default AddVersionModal;
