import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { Flag, X, Loader2, CheckCircle2 } from "lucide-react";
import userReportService from "../services/user/reportService";
import type { ReportType } from "../services/user/reportService";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../services/user/interviewService";

const REPORT_TYPES: ReportType[] = [
  "INACCURATE_CONTENT",
  "OUTDATED",
  "DUPLICATE",
  "POOR_FORMATTING",
  "SPAM_OR_IRRELEVANT",
  "INAPPROPRIATE",
  "OTHER",
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewQuestionId: number;
}

const ReportModal = ({ isOpen, onClose, interviewQuestionId }: ReportModalProps) => {
  const { t } = useTranslation("Interview");
  const [reportType, setReportType] = useState<ReportType>("INACCURATE_CONTENT");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError(t("reportModal.descriptionRequired"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await userReportService.createReport({
        interviewQuestionId,
        description: description.trim(),
        reportType,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const fieldErrors = axiosErr.response?.data?.data;
      if (fieldErrors) {
        const messages = Object.values(fieldErrors).join(". ");
        setError(messages);
      } else {
        setError(axiosErr.response?.data?.message || t("errors.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportType("INACCURATE_CONTENT");
    setDescription("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border border-zinc-200 bg-white shadow-xl max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-4 rounded-t-2xl sm:rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                  <Flag className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">
                  {t("reportModal.title")}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-700">
                    {t("reportModal.success")}
                  </p>
                </motion.div>
              ) : (
                <>
                  <p className="text-sm text-zinc-500">
                    {t("reportModal.description")}
                  </p>

                  {/* Report Type Select */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      {t("reportModal.typeLabel")}
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    >
                      {REPORT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t(`reportModal.types.${type}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                      {t("reportModal.detailLabel")}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={t("reportModal.detailPlaceholder")}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-rose-600"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98]"
                    >
                      {t("reportModal.cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t("reportModal.submit")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
