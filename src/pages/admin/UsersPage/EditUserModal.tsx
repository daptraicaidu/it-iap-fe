import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import adminUserService, {
  type UserEntity,
  type UpdateUserRequest,
  type ValidationErrorData,
} from "../../../services/admin/userService";

interface EditUserModalProps {
  isOpen: boolean;
  user: UserEntity | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal = ({ isOpen, user, onClose, onSuccess }: EditUserModalProps) => {
  const { t } = useTranslation("AdminUsers");
  const [form, setForm] = useState<UpdateUserRequest>({
    email: "",
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
    active: true,
  });
  const [errors, setErrors] = useState<ValidationErrorData>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Populate form when user data changes
  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl || "",
        active: user.active,
      });
      setErrors({});
      setSuccessMsg("");
    }
  }, [user]);

  const handleChange = (field: keyof UpdateUserRequest, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrorData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});
    setSuccessMsg("");
    setSubmitting(true);

    try {
      await adminUserService.updateUser(user.id, form);
      setSuccessMsg(t("editModal.success"));
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
    setErrors({});
    setSuccessMsg("");
    onClose();
  };

  if (!isOpen || !user) return null;

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
              {t("editModal.title")}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {t("editModal.desc")}
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
                {t("editModal.email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("editModal.emailPlaceholder")}
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
                {t("editModal.fullName")}
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder={t("editModal.fullNamePlaceholder")}
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
                {t("editModal.phone")}
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder={t("editModal.phonePlaceholder")}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 ${
                  errors.phoneNumber ? "border-rose-300 bg-rose-50/50" : "border-zinc-200 bg-white"
                }`}
              />
              {errors.phoneNumber && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {t("editModal.avatarUrl")}
              </label>
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) => handleChange("avatarUrl", e.target.value)}
                placeholder={t("editModal.avatarUrlPlaceholder")}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 ${
                  errors.avatarUrl ? "border-rose-300 bg-rose-50/50" : "border-zinc-200 bg-white"
                }`}
              />
              {errors.avatarUrl && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.avatarUrl}</p>
              )}
            </div>

            {/* Active Toggle */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-700">
                    {t("editModal.activeLabel")}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {form.active ? t("editModal.activeOn") : t("editModal.activeOff")}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.active}
                  onClick={() => handleChange("active", !form.active)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.active ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                      form.active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              {/* Deactivated since info */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  !form.active
                    ? "mt-2.5 max-h-12 opacity-100"
                    : "mt-0 max-h-0 opacity-0"
                }`}
              >
                <div className="flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <p className="text-xs font-medium text-amber-700">
                    {t("editModal.deactivatedSince", {
                      date: (() => {
                        // If user was originally deactivated and toggle is still off, show API date
                        if (user.deletedAt && !user.active) {
                          return user.deletedAt;
                        }
                        // Otherwise (user was active, admin just toggled off), show today
                        const now = new Date();
                        const dd = String(now.getDate()).padStart(2, "0");
                        const mm = String(now.getMonth() + 1).padStart(2, "0");
                        const yyyy = now.getFullYear();
                        const hh = String(now.getHours()).padStart(2, "0");
                        const min = String(now.getMinutes()).padStart(2, "0");
                        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
                      })(),
                    })}
                  </p>
                </div>
              </div>
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
              {t("editModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? t("editModal.submitting") : t("editModal.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
