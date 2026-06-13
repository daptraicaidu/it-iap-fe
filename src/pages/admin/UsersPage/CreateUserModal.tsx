import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import adminUserService, {
  type CreateUserRequest,
  type ValidationErrorData,
} from "../../../services/admin/userService";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal = ({ isOpen, onClose, onSuccess }: CreateUserModalProps) => {
  const { t } = useTranslation("AdminUsers");
  const [form, setForm] = useState<CreateUserRequest>({
    email: "",
    fullName: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<ValidationErrorData>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (field: keyof CreateUserRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field as keyof ValidationErrorData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");
    setSubmitting(true);

    try {
      await adminUserService.createUser(form);
      setSuccessMsg(t("createModal.success"));
      // Reset form
      setForm({ email: "", fullName: "", phoneNumber: "" });
      // Delay close to show success briefly
      setTimeout(() => {
        setSuccessMsg("");
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { code?: number; data?: ValidationErrorData; message?: string } } };
      if (axiosErr.response?.data?.code === 400 && axiosErr.response.data.data) {
        setErrors(axiosErr.response.data.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setForm({ email: "", fullName: "", phoneNumber: "" });
    setErrors({});
    setSuccessMsg("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {t("createModal.title")}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {t("createModal.desc")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {t("createModal.email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("createModal.emailPlaceholder")}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 ${
                  errors.email ? "border-rose-300 bg-rose-50/50" : "border-zinc-200 bg-white"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {t("createModal.fullName")}
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder={t("createModal.fullNamePlaceholder")}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 ${
                  errors.fullName ? "border-rose-300 bg-rose-50/50" : "border-zinc-200 bg-white"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {t("createModal.phone")}
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder={t("createModal.phonePlaceholder")}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 ${
                  errors.phoneNumber ? "border-rose-300 bg-rose-50/50" : "border-zinc-200 bg-white"
                }`}
              />
              {errors.phoneNumber && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
            >
              {t("createModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? t("createModal.submitting") : t("createModal.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
