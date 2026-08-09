import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import adminQuestionService, {
  POSITION_OPTIONS,
  LEVEL_OPTIONS,
  type AIGenerateQuestionErrorData,
} from "../../../services/admin/questionService";
import type { AxiosError } from "axios";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  quantity?: string;
  level?: string;
  position?: string;
}

const AIGenerateModal = ({ isOpen, onClose, onSuccess }: AIGenerateModalProps) => {
  const { t } = useTranslation("AdminQuestions");

  const [quantity, setQuantity] = useState<number | "">(5);
  const [level, setLevel] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const resetForm = () => {
    setQuantity(5);
    setLevel("");
    setPosition("");
    setErrors({});
    setSuccessMessage("");
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const numQuantity = Number(quantity);

    if (!quantity || isNaN(numQuantity) || numQuantity < 1 || numQuantity > 10) {
      newErrors.quantity = t("aiModal.validation.quantityInvalid");
    }
    if (!level) {
      newErrors.level = t("aiModal.validation.levelRequired");
    }
    if (!position) {
      newErrors.position = t("aiModal.validation.positionRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      await adminQuestionService.generateQuestionByAI({
        quantity: Number(quantity),
        level,
        position,
      });

      setSuccessMessage(t("aiModal.success"));
      onSuccess();

      // Auto close after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{
        code: number;
        data: AIGenerateQuestionErrorData;
        message: string;
      }>;
      if (axiosError.response?.data?.data) {
        const serverErrors = axiosError.response.data.data;
        setErrors({
          quantity: serverErrors.quantity,
          level: serverErrors.level,
          position: serverErrors.position,
        });
      } else {
        setErrors({ quantity: t("aiModal.error") });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md animate-[fadeInScale_0.2s_ease-out] rounded-xl border border-zinc-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {t("aiModal.title")}
              </h2>
              <p className="text-xs text-zinc-500">{t("aiModal.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Quantity */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t("aiModal.quantity")}
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setQuantity("");
                } else {
                  const parsed = parseInt(val, 10);
                  setQuantity(isNaN(parsed) ? "" : parsed);
                }
              }}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-1 ${
                errors.quantity
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                  : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
              }`}
              placeholder="1 - 10"
            />
            {errors.quantity && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.quantity}</p>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t("aiModal.position")}
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:ring-1 ${
                errors.position
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                  : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
              }`}
            >
              <option value="">{t("aiModal.selectPosition")}</option>
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`position.${opt}`)}
                </option>
              ))}
            </select>
            {errors.position && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.position}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t("aiModal.level")}
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:ring-1 ${
                errors.level
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                  : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
              }`}
            >
              <option value="">{t("aiModal.selectLevel")}</option>
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`level.${opt}`)}
                </option>
              ))}
            </select>
            {errors.level && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.level}</p>
            )}
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4">
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            {t("aiModal.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-sm font-medium text-white transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {/* Animated gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 bg-[length:200%_100%] transition-all duration-500 group-hover:animate-[shimmer_2s_linear_infinite]" />
            <span className="relative flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              )}
              {loading ? t("aiModal.generating") : t("aiModal.generate")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateModal;
