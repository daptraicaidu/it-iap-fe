import React, { useEffect, useState, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Tag,
  Calendar,
  Percent,
  Coins,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Calculator,
} from "lucide-react";
import adminPromotionService, {
  type CreatePromotionPayload,
  type ApplicableTierType,
  type DiscountType,
  TIER_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
  calculateDiscountPrice,
} from "../../../../services/admin/adminPromotionService";
import useTierStore from "../../../../store/tierStore";

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

interface VietnamDateTimeInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

const VietnamDateTimeInput: React.FC<VietnamDateTimeInputProps> = ({
  id,
  value,
  onChange,
  required,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDisplay = (isoStr: string): string => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        try {
          inputRef.current.showPicker();
        } catch {
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="group relative flex w-full cursor-pointer items-center rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 transition-all hover:border-zinc-300 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900"
    >
      {/* Visual Input Displaying Vietnam Date Format */}
      <input
        type="text"
        readOnly
        value={formatDisplay(value)}
        placeholder="DD/MM/YYYY HH:mm"
        className="w-full cursor-pointer bg-transparent text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
      />

      {/* Calendar Icon */}
      <div className="pointer-events-none flex items-center pl-2 text-zinc-400 group-hover:text-zinc-600 transition-colors">
        <Calendar className="h-4 w-4" />
      </div>

      {/* Native datetime-local input for picker popup */}
      <input
        ref={inputRef}
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
        tabIndex={-1}
        required={required}
      />
    </div>
  );
};

const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation("AdminPromotions");
  const isEn = i18n.language?.startsWith("en");

  // Form IDs for accessibility
  const codeId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const tierId = useId();
  const discountTypeId = useId();
  const discountValueId = useId();
  const startDateId = useId();
  const endDateId = useId();

  // Tier store to obtain original prices
  const { tiers, fetchTiers, getOriginalPrice } = useTierStore();

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [applicableTier, setApplicableTier] = useState<ApplicableTierType>("PRO_YEAR");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch tiers if not loaded yet
  useEffect(() => {
    if (isOpen) {
      fetchTiers();
      // Set default start/end dates
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const toLocalISO = (d: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setStartDate(toLocalISO(now));
      setEndDate(toLocalISO(nextMonth));
      setErrorMsg(null);
    }
  }, [isOpen, fetchTiers]);

  if (!isOpen) return null;

  // Compute live price preview
  const originalPrice = getOriginalPrice(applicableTier);
  const estimatedPrice = calculateDiscountPrice(originalPrice, discountType, discountValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg(t("modal.errors.codeRequired"));
      return;
    }
    if (!name.trim()) {
      setErrorMsg(t("modal.errors.nameRequired"));
      return;
    }
    if (!applicableTier) {
      setErrorMsg(t("modal.errors.tierRequired"));
      return;
    }
    if (discountType === "PERCENTAGE" && (discountValue <= 0 || discountValue > 100)) {
      setErrorMsg(t("modal.errors.percentageRange"));
      return;
    }
    if (discountType === "FIXED_AMOUNT" && discountValue <= 0) {
      setErrorMsg(t("modal.errors.fixedAmountMin"));
      return;
    }
    if (
      discountType === "FIXED_AMOUNT" &&
      originalPrice !== null &&
      discountValue > originalPrice
    ) {
      setErrorMsg(t("modal.errors.fixedAmountExceed"));
      return;
    }
    if (!startDate) {
      setErrorMsg(t("modal.errors.startDateRequired"));
      return;
    }
    if (!endDate) {
      setErrorMsg(t("modal.errors.endDateRequired"));
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setErrorMsg(t("modal.errors.endDateBeforeStart"));
      return;
    }

    setLoading(true);

    const formatToApiDate = (dateVal: string): string => {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      return d.toISOString();
    };

    try {
      const payload: CreatePromotionPayload = {
        code: cleanCode,
        name: name.trim(),
        description: description.trim(),
        applicableTier,
        discountType,
        discountValue: Number(discountValue),
        startDate: formatToApiDate(startDate),
        endDate: formatToApiDate(endDate),
      };

      const res = await adminPromotionService.createPromotion(payload);

      if (res.data?.code === 200 || res.status === 200 || res.status === 201) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.data?.message || t("toast.createError"));
      }
    } catch (err: unknown) {
      // Handle 409 conflict
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 409 || axiosErr.response?.data?.message?.includes("tồn tại")) {
        setErrorMsg(t("toast.conflictError"));
      } else {
        setErrorMsg(
          axiosErr.response?.data?.message || t("toast.createError")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl transition-all my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {t("modal.createTitle")}
              </h2>
              <p className="text-xs text-zinc-500">{t("modal.createDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Code */}
            <div>
              <label
                htmlFor={codeId}
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                {t("modal.codeLabel")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id={codeId}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder={t("modal.codePlaceholder")}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">{t("modal.codeHelp")}</p>
            </div>

            {/* Campaign Name */}
            <div>
              <label
                htmlFor={nameId}
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                {t("modal.nameLabel")} <span className="text-rose-500">*</span>
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("modal.namePlaceholder")}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor={descriptionId}
              className="block text-xs font-medium text-zinc-700 mb-1"
            >
              {t("modal.descriptionLabel")}
            </label>
            <textarea
              id={descriptionId}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("modal.descriptionPlaceholder")}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all resize-none"
            />
          </div>

          {/* Tier & Discount Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Applicable Tier */}
            <div>
              <label
                htmlFor={tierId}
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                {t("modal.tierLabel")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id={tierId}
                  value={applicableTier}
                  onChange={(e) => setApplicableTier(e.target.value as ApplicableTierType)}
                  className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                >
                  {TIER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isEn ? opt.labelEn : opt.labelVi}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Discount Type */}
            <div>
              <label
                htmlFor={discountTypeId}
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                {t("modal.discountTypeLabel")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id={discountTypeId}
                  value={discountType}
                  onChange={(e) => {
                    const newType = e.target.value as DiscountType;
                    setDiscountType(newType);
                    if (newType === "PERCENTAGE" && discountValue > 100) {
                      setDiscountValue(20);
                    }
                  }}
                  className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                >
                  {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isEn ? opt.labelEn : opt.labelVi}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                  {discountType === "PERCENTAGE" ? (
                    <Percent className="h-4 w-4" />
                  ) : (
                    <Coins className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Discount Value */}
            <div>
              <label
                htmlFor={discountValueId}
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                {t("modal.discountValueLabel")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id={discountValueId}
                  type="number"
                  min={1}
                  max={discountType === "PERCENTAGE" ? 100 : undefined}
                  step={discountType === "PERCENTAGE" ? 1 : 1000}
                  value={discountValue || ""}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder={
                    discountType === "PERCENTAGE"
                      ? t("modal.discountValuePercentagePlaceholder")
                      : t("modal.discountValueFixedPlaceholder")
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                  required
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-zinc-400">
                  {discountType === "PERCENTAGE" ? "%" : "VNĐ"}
                </span>
              </div>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={startDateId}
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                {t("modal.startDateLabel")} <span className="text-rose-500">*</span>
              </label>
              <VietnamDateTimeInput
                id={startDateId}
                value={startDate}
                onChange={setStartDate}
                required
              />
            </div>

            <div>
              <label
                htmlFor={endDateId}
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                {t("modal.endDateLabel")} <span className="text-rose-500">*</span>
              </label>
              <VietnamDateTimeInput
                id={endDateId}
                value={endDate}
                onChange={setEndDate}
                required
              />
            </div>
          </div>

          {/* Live Price Preview Box */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-700">
              <Calculator className="h-4 w-4" />
              <span className="text-xs font-semibold">{t("modal.previewSection")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-white/80 p-2.5 border border-rose-100/60">
                <p className="text-zinc-500">{t("modal.originalPriceText")}</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                  {originalPrice !== null ? formatVND(originalPrice) : (
                    <span className="text-zinc-400 font-normal italic">
                      {tiers.length === 0 ? "Đang tải giá..." : "Chưa có giá gốc"}
                    </span>
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-white/80 p-2.5 border border-rose-100/60">
                <p className="text-zinc-500">{t("modal.discountAmountText")}</p>
                <p className="text-sm font-semibold text-rose-600 mt-0.5">
                  {discountType === "PERCENTAGE"
                    ? `-${discountValue}%`
                    : `-${formatVND(discountValue)}`}
                </p>
              </div>

              <div className="rounded-lg bg-white/90 p-2.5 border border-indigo-200">
                <p className="text-zinc-500 font-medium">{t("modal.finalPriceText")}</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">
                  {estimatedPrice !== null ? formatVND(estimatedPrice) : "--"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98]"
            >
              {t("buttons.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("buttons.saving")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t("buttons.save")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromotionModal;
