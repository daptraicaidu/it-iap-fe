import { useState, useEffect } from "react";
import { X, Zap, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import adminPromptService, {
  type PromptVersionDetail,
} from "../../../services/admin/promptService";
import type { AxiosError } from "axios";

interface VersionDetailModalProps {
  isOpen: boolean;
  promptKey: string;
  version: string;
  onClose: () => void;
  onActivateSuccess: () => void;
  onAddVersion: (promptId: number, promptKey: string) => void;
  /** In-memory cache map managed by parent (survives until page reload) */
  cache: Map<string, PromptVersionDetail>;
  /**
   * Render mode:
   * - "modal": renders with its own fixed overlay + backdrop (default, standalone)
   * - "inline": renders only the card element (for embedding in a shared container)
   */
  renderMode?: "modal" | "inline";
}

const VersionDetailModal = ({
  isOpen,
  promptKey,
  version,
  onClose,
  onActivateSuccess,
  onAddVersion,
  cache,
  renderMode = "modal",
}: VersionDetailModalProps) => {
  const { t } = useTranslation("AdminPrompts");

  const [detail, setDetail] = useState<PromptVersionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Activate state
  const [activating, setActivating] = useState(false);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && promptKey && version) {
      fetchDetail();
    }
    return () => {
      setDetail(null);
      setError("");
      setShowActivateConfirm(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, promptKey, version]);

  const fetchDetail = async () => {
    const cacheKey = `${promptKey}::${version}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      setDetail(cached);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await adminPromptService.getVersionDetail({
        promptKey,
        version,
      });
      if (response.data.data) {
        setDetail(response.data.data);
        cache.set(cacheKey, response.data.data);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load detail");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      await adminPromptService.activateVersion({ promptKey, version });
      // Invalidate cache for this item since active status changed
      const cacheKey = `${promptKey}::${version}`;
      cache.delete(cacheKey);
      setShowActivateConfirm(false);
      onActivateSuccess();
      onClose();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || t("detailModal.activateError"));
    } finally {
      setActivating(false);
    }
  };

  if (!isOpen) return null;

  // ── Card content (shared between both render modes) ──
  const cardContent = (
    <div className="relative w-full max-w-4xl rounded-xl border border-zinc-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-900">
          {t("detailModal.title")}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-1 h-3 w-20 rounded bg-zinc-200" />
                <div className="h-5 w-full rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : detail ? (
          <div className="space-y-5">
            {/* Prompt Key + Version row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-zinc-500">
                  {t("detailModal.promptKey")}
                </span>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {detail.promptKey}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-500">
                  {t("detailModal.version")}
                </span>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {detail.version}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-medium text-zinc-500">
                {t("detailModal.description")}
              </span>
              <p className="mt-1 text-sm text-zinc-600">
                {detail.description || "—"}
              </p>
            </div>

            {/* Provider + Model + ApplyFor row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs font-medium text-zinc-500">
                  {t("detailModal.provider")}
                </span>
                <p className="mt-1 text-sm text-zinc-900">{detail.provider}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-500">
                  {t("detailModal.model")}
                </span>
                <p className="mt-1 text-sm text-zinc-900">{detail.model}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-500">
                  {t("detailModal.applyFor")}
                </span>
                <p className="mt-1 text-sm text-zinc-900">
                  {t(`applyForLabels.${detail.applyFor}`)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <span className="text-xs font-medium text-zinc-500">
                {t("detailModal.status")}
              </span>
              <div className="mt-1">
                {detail.active ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {t("detailModal.active")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                    {t("detailModal.inactive")}
                  </span>
                )}
              </div>
            </div>

            {/* Prompt Content */}
            <div>
              <span className="text-xs font-medium text-zinc-500">
                {t("detailModal.promptContent")}
              </span>
              <div className="mt-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm text-zinc-800">
                  {detail.promptContent}
                </pre>
              </div>
            </div>

            {/* Note */}
            <div>
              <span className="text-xs font-medium text-zinc-500">
                {t("detailModal.note")}
              </span>
              <p className="mt-1 text-sm text-zinc-600">
                {detail.note || t("detailModal.noNote")}
              </p>
            </div>

            {/* Activate confirmation inline */}
            {showActivateConfirm && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">
                  {t("confirmActivate.title")}
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  {t("confirmActivate.message")}
                </p>
                <p className="mt-1 text-xs font-medium text-amber-600">
                  {t("confirmActivate.promptInfo", {
                    promptKey: detail.promptKey,
                    version: detail.version,
                  })}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setShowActivateConfirm(false)}
                    disabled={activating}
                    className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {t("confirmActivate.cancel")}
                  </button>
                  <button
                    onClick={handleActivate}
                    disabled={activating}
                    className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {activating
                      ? t("detailModal.activating")
                      : t("confirmActivate.confirm")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {detail && !loading && (
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
          <button
            onClick={() =>
              onAddVersion(detail.id, detail.promptKey)
            }
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            {t("detailModal.addVersionBtn")}
          </button>

          <div className="flex items-center gap-3">
            {!detail.active && !showActivateConfirm && (
              <button
                onClick={() => setShowActivateConfirm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                {t("detailModal.activateBtn")}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-[0.98]"
            >
              {t("detailModal.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Inline mode: just the card, no overlay ──
  if (renderMode === "inline") {
    return cardContent;
  }

  // ── Modal mode: card wrapped in fixed overlay with backdrop ──
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-16 pb-8">
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {cardContent}
    </div>
  );
};

export default VersionDetailModal;
