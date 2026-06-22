import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import adminQuestionService, {
  type QuestionEntity,
  type UpdateQuestionRequest,
  POSITION_OPTIONS,
  LEVEL_OPTIONS,
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
} from "../../../services/admin/questionService";

interface EditQuestionModalProps {
  isOpen: boolean;
  question: QuestionEntity | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditQuestionModal = ({ isOpen, question, onClose, onSuccess }: EditQuestionModalProps) => {
  const { t } = useTranslation("AdminQuestions");

  const [content, setContent] = useState("");
  const [suggestedAnswer, setSuggestedAnswer] = useState("");
  const [hintContent, setHintContent] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Delete toggle (replaces delete confirmation dialog)
  const [markDeleted, setMarkDeleted] = useState(false);

  // Prefill form on open
  useEffect(() => {
    if (question && isOpen) {
      setContent(question.content || "");
      setSuggestedAnswer(question.suggestedAnswer || "");
      setHintContent(question.hintContent ||"");
      setPosition(question.position || "");
      setLevel(question.level || "");
      setCategory(question.category || "");
      setStatus(question.status || "");
      setSkillTags(question.skillTag || []);
      setTimeLimit(question.timeLimitSeconds?.toString() || "");
      setMarkDeleted(!!question.deleteAt);
      setErrors({});
      setToast(null);
    }
  }, [question, isOpen]);

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!content.trim()) newErrors.content = t("createModal.validation.contentRequired");
    if (!suggestedAnswer.trim()) newErrors.suggestedAnswer = t("createModal.validation.suggestedAnswerRequired");
    if (!hintContent.trim()) newErrors.hintContent = t("createModal.validation.hintContentRequired");
    if (!position) newErrors.position = t("createModal.validation.positionRequired");
    if (!level) newErrors.level = t("createModal.validation.levelRequired");
    if (!category) newErrors.category = t("createModal.validation.categoryRequired");
    if (!status) newErrors.status = t("createModal.validation.statusRequired");
    if (!timeLimit) {
      newErrors.timeLimit = t("createModal.validation.timeLimitRequired");
    } else if (parseInt(timeLimit) < 1) {
      newErrors.timeLimit = t("createModal.validation.timeLimitMin");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = skillInput.trim();
      if (value && !skillTags.includes(value)) {
        setSkillTags([...skillTags, value]);
      }
      setSkillInput("");
    }
  };

  const removeSkillTag = (tag: string) => {
    setSkillTags(skillTags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!question || !validate()) return;
    setSubmitting(true);
    setToast(null);

    try {
      const payload: UpdateQuestionRequest = {
        content: content.trim(),
        suggestedAnswer: suggestedAnswer.trim(),
        hintContent: hintContent.trim(),
        position,
        level,
        category,
        skillTag: skillTags,
        timeLimitSeconds: parseInt(timeLimit),
        status,
        delete: markDeleted,
      };

      await adminQuestionService.updateQuestion(question.id, payload);
      setToast({ type: "success", message: t("editModal.success") });
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 800);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const resData = err.response.data as { data?: Record<string, string>; message?: string };
        if (resData.data && typeof resData.data === "object") {
          const fieldErrors = Object.values(resData.data).join(", ");
          setToast({ type: "error", message: fieldErrors });
        } else if (resData.message) {
          setToast({ type: "error", message: resData.message });
        } else {
          setToast({ type: "error", message: t("editModal.error") });
        }
      } else {
        setToast({ type: "error", message: t("editModal.error") });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative flex w-full max-w-5xl flex-col rounded-xl border border-zinc-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3.5">
          <h2 className="text-base font-semibold text-zinc-900">
            {t("editModal.title")}
            <span className="ml-2 text-sm font-normal text-zinc-400">#{question.id}</span>
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Toast — full-width above form */}
        {toast && (
          <div className="px-6 pt-4">
            <div
              className={`rounded-lg border px-4 py-2.5 text-sm ${
                toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        {/* Body — 2-column layout */}
        <div className="grid grid-cols-1 gap-6 px-6 py-5 lg:grid-cols-2">
          {/* ── Left Column: Text fields ── */}
          <div className="flex flex-col gap-3.5">
            {/* Content */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                {t("createModal.content")} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("createModal.contentPlaceholder")}
                rows={5}
                className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-1 ${
                  errors.content
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                }`}
              />
              {errors.content && (
                <p className="mt-0.5 text-xs text-rose-600">{errors.content}</p>
              )}
            </div>

            {/* Suggested Answer */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                {t("createModal.suggestedAnswer")} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={suggestedAnswer}
                onChange={(e) => setSuggestedAnswer(e.target.value)}
                placeholder={t("createModal.suggestedAnswerPlaceholder")}
                rows={18}
                className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-1 ${
                  errors.suggestedAnswer
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                }`}
              />
              {errors.suggestedAnswer && (
                <p className="mt-0.5 text-xs text-rose-600">{errors.suggestedAnswer}</p>
              )}
            </div>

            {/* Hint Content */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                {t("createModal.hintContent")} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={hintContent}
                onChange={(e) => setHintContent(e.target.value)}
                placeholder={t("createModal.hintContentPlaceholder")}
                rows={5}
                className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-1 ${
                  errors.hintContent
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                }`}
              />
              {errors.hintContent && (
                <p className="mt-0.5 text-xs text-rose-600">{errors.hintContent}</p>
              )}
            </div>

          </div>

          {/* ── Right Column: Selects, inputs & toggle ── */}
          <div className="flex flex-col gap-3.5">
            {/* Position + Level (2-col) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  {t("createModal.position")} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:ring-1 ${
                    errors.position
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                      : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                  }`}
                >
                  <option value="">{t("createModal.selectPosition")}</option>
                  {POSITION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(`position.${opt}`)}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="mt-0.5 text-xs text-rose-600">{errors.position}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  {t("createModal.level")} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:ring-1 ${
                    errors.level
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                      : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                  }`}
                >
                  <option value="">{t("createModal.selectLevel")}</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(`level.${opt}`)}
                    </option>
                  ))}
                </select>
                {errors.level && (
                  <p className="mt-0.5 text-xs text-rose-600">{errors.level}</p>
                )}
              </div>
            </div>

            {/* Category + Status (2-col) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  {t("createModal.category")} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:ring-1 ${
                    errors.category
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                      : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                  }`}
                >
                  <option value="">{t("createModal.selectCategory")}</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(`category.${opt}`)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-0.5 text-xs text-rose-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  {t("editModal.status")} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:ring-1 ${
                    errors.status
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                      : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                  }`}
                >
                  <option value="">{t("editModal.selectStatus")}</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(`status.${opt}`)}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-0.5 text-xs text-rose-600">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                {t("createModal.timeLimit")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder={t("createModal.timeLimitPlaceholder")}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 tabular-nums outline-none transition-colors placeholder:text-zinc-400 focus:ring-1 ${
                  errors.timeLimit
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400"
                }`}
              />
              {errors.timeLimit && (
                <p className="mt-0.5 text-xs text-rose-600">{errors.timeLimit}</p>
              )}
            </div>

            {/* Skill Tags */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                {t("createModal.skillTags")}
              </label>
              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-colors focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400">
                <div className="flex flex-wrap items-center gap-1.5">
                  {skillTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeSkillTag(tag)}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
                      >
                        <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder={skillTags.length === 0 ? t("createModal.skillTagsPlaceholder") : ""}
                    className="min-w-[120px] flex-1 border-none bg-transparent py-0.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Delete Toggle */}
            <div className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors ${
              markDeleted
                ? "border-rose-200 bg-rose-50/50"
                : "border-zinc-200 bg-zinc-50/50"
            }`}>
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {t("editModal.deleteLabel")}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {t("editModal.deleteDesc")}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={markDeleted}
                onClick={() => setMarkDeleted(!markDeleted)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  markDeleted
                    ? "bg-rose-500 focus:ring-rose-500"
                    : "bg-zinc-300 focus:ring-zinc-400"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    markDeleted ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-3.5">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
          >
            {t("editModal.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? t("editModal.saving") : t("editModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
