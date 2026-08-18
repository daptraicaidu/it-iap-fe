import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Crown,
  Layers,
  Coins,
  History,
  QrCode,
  Minus,
  Plus,
} from "lucide-react";
import tierService, {
  type OrderPreviewData,
  type CreateOrderData,
} from "../../../services/user/tierService";
import userInfoService from "../../../services/user/userInfoService";
import useUserStore from "../../../store/userStore";

const formatVND = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const TIERS_CONFIG = [
  {
    code: "PLUS_MONTH",
    nameVi: "Gói Plus (1 Tháng)",
    nameEn: "Plus Plan (1 Month)",
    badge: "Plus",
    isPro: false,
    isYear: false,
    benefitsVi: [
      "Tối đa 6 hồ sơ phỏng vấn",
      "10 lượt phỏng vấn AI mỗi ngày",
      "Ngữ cảnh hội thoại: 32,000 tokens",
      "Chấm điểm chi tiết & gợi ý cải thiện",
    ],
    benefitsEn: [
      "Up to 6 interview profiles",
      "10 AI interviews per day",
      "Chatbot context: 32,000 tokens",
      "Detailed skill score & feedback",
    ],
  },
  {
    code: "PLUS_YEAR",
    nameVi: "Gói Plus (1 Năm)",
    nameEn: "Plus Plan (1 Year)",
    badge: "Plus 1Y",
    isPro: false,
    isYear: true,
    benefitsVi: [
      "Tối đa 6 hồ sơ phỏng vấn",
      "10 lượt phỏng vấn AI mỗi ngày",
      "Tiết kiệm chi phí so với gói tháng",
      "Lưu trữ toàn bộ lịch sử phỏng vấn",
    ],
    benefitsEn: [
      "Up to 6 interview profiles",
      "10 AI interviews per day",
      "Cost-saving yearly billing",
      "Full interview transcript storage",
    ],
  },
  {
    code: "PRO_MONTH",
    nameVi: "Gói Pro (1 Tháng)",
    nameEn: "Pro Plan (1 Month)",
    badge: "Phổ biến",
    isPro: true,
    isYear: false,
    benefitsVi: [
      "Tối đa 12 hồ sơ phỏng vấn",
      "20 lượt phỏng vấn AI mỗi ngày",
      "Ngữ cảnh hội thoại: 48,000 tokens",
      "Chuyên sâu 5 kỹ năng & ưu tiên AI",
    ],
    benefitsEn: [
      "Up to 12 interview profiles",
      "20 AI interviews per day",
      "Chatbot context: 48,000 tokens",
      "Comprehensive 5 skills review",
    ],
  },
  {
    code: "PRO_YEAR",
    nameVi: "Gói Pro (1 Năm)",
    nameEn: "Pro Plan (1 Year)",
    badge: "Tối ưu nhất",
    isPro: true,
    isYear: true,
    benefitsVi: [
      "Tối đa 12 hồ sơ phỏng vấn",
      "20 lượt phỏng vấn AI mỗi ngày",
      "Ưu tiên tối đa hạ tầng AI siêu tốc",
      "Tiết kiệm chi phí tối đa",
    ],
    benefitsEn: [
      "Up to 12 interview profiles",
      "20 AI interviews per day",
      "Priority fast AI queue processing",
      "Best long-term value",
    ],
  },
];

const CheckoutPage: React.FC = () => {
  const { t, i18n } = useTranslation("Orders");
  const isEn = i18n.language?.startsWith("en");
  const location = useLocation();
  const navigate = useNavigate();
  const setUserInfo = useUserStore((s) => s.setUserInfo);

  // Extract initial tier from query or state
  const queryParams = new URLSearchParams(location.search);
  const tierFromQuery = queryParams.get("tier");
  const tierFromState = (location.state as { selectedTier?: string })?.selectedTier;
  const initialTier = tierFromQuery || tierFromState || "PRO_MONTH";

  const [selectedTier, setSelectedTier] = useState<string>(initialTier);
  const [quantity, setQuantity] = useState<number>(1);
  const [preview, setPreview] = useState<OrderPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Order submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch preview whenever selected tier or quantity changes
  useEffect(() => {
    let isCancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    tierService
      .previewOrder({ accountTier: selectedTier, quantity: Math.max(1, quantity) })
      .then((res) => {
        if (!isCancelled) {
          if (res.data?.data) {
            setPreview(res.data.data);
          } else {
            setPreviewError(res.data?.message || t("checkout.errorPreview"));
          }
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.error("Preview order failed:", err);
          const axiosErr = err as {
            response?: {
              data?: {
                message?: string;
                data?: Record<string, string>;
              };
            };
          };

          const respData = axiosErr.response?.data;
          const msg = respData?.message || t("checkout.errorPreview");
          const extraInfo = respData?.data
            ? Object.entries(respData.data)
                .map(([_, v]) => v)
                .join(" - ")
            : "";

          setPreviewError(extraInfo ? `${msg} (${extraInfo})` : msg);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedTier, quantity, t]);

  const currentConfig = TIERS_CONFIG.find((t) => t.code === selectedTier) || TIERS_CONFIG[2];

  const handleCreateOrder = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Dynamic origin for returnUrl and cancelUrl
      const origin = window.location.origin;
      const payload = {
        accountTier: selectedTier,
        quantity: Math.max(1, quantity),
        returnUrl: `${origin}/orders?status=success`,
        cancelUrl: `${origin}/orders?status=cancelled`,
      };

      const res = await tierService.createOrder(payload);

      if (res.data?.code === 200 && res.data?.data) {
        const orderData: CreateOrderData = res.data.data;

        // Case 1: Free order (0 VND)
        if (orderData.amount === 0 || !orderData.checkoutUrl || orderData.checkoutUrl === "string") {
          // Refresh user info
          try {
            const userRes = await userInfoService.getUserInfo();
            if (userRes.data?.data) {
              setUserInfo({
                fullName: userRes.data.data.fullName,
                avatarUrl: userRes.data.data.avatarUrl || null,
                email: userRes.data.data.email,
                activeTier: userRes.data.data.activeTier || "PLUS_MONTH",
                subscriptionEndDate: userRes.data.data.subscriptionEndDate || null,
              });
            }
          } catch {
            // Ignore user refresh error
          }
          navigate("/orders?status=success&code=" + orderData.orderCode, { replace: true });
        } else {
          // Case 2: Paid order (> 0 VND) -> Redirect directly to PayOS checkoutUrl
          window.location.href = orderData.checkoutUrl;
        }
      } else {
        setSubmitError(res.data?.message || t("checkout.errorCreate"));
      }
    } catch (err: unknown) {
      console.error("Create order failed:", err);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSubmitError(axiosErr.response?.data?.message || t("checkout.errorCreate"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isZeroAmount = preview?.finalAmount === 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {t("checkout.title")}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">{t("checkout.subtitle")}</p>
        </div>

        <Link
          to="/orders"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-[0.98] shadow-xs w-fit cursor-pointer"
        >
          <History className="h-4 w-4 text-zinc-500" />
          <span>{t("checkout.backToHistory")}</span>
        </Link>
      </div>

      {/* Main Grid: Left Plan Selection, Right Price Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Select Tier Cards */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <span>{t("checkout.selectTier")}</span>
          </h2>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {TIERS_CONFIG.map((tier) => {
              const isSelected = selectedTier === tier.code;

              return (
                <div
                  key={tier.code}
                  onClick={() => setSelectedTier(tier.code)}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all ${
                    isSelected
                      ? tier.isPro
                        ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600 shadow-md"
                        : "border-rose-500 bg-rose-50/40 ring-2 ring-rose-500 shadow-md"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50 shadow-xs"
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div
                      className={`absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full text-white ${
                        tier.isPro ? "bg-blue-600" : "bg-rose-500"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          tier.isPro
                            ? "bg-blue-100 text-blue-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900">
                      {isEn ? tier.nameEn : tier.nameVi}
                    </h3>

                    <ul className="mt-3.5 space-y-2 text-xs text-zinc-600">
                      {(isEn ? tier.benefitsEn : tier.benefitsVi).map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                              tier.isPro ? "bg-blue-600" : "bg-rose-500"
                            }`}
                          />
                          <span className="leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantees Box */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-xs text-zinc-600 space-y-2.5">
            <div className="flex items-center gap-2.5 font-medium text-zinc-800">
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{t("checkout.benefits.instant")}</span>
            </div>
            <div className="flex items-center gap-2.5 font-medium text-zinc-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{t("checkout.benefits.secure")}</span>
            </div>
            <div className="flex items-center gap-2.5 font-medium text-zinc-800">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              <span>{t("checkout.benefits.support")}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Card */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            <span>{t("checkout.orderSummary")}</span>
          </h2>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            {/* Selected Plan Details */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs text-zinc-400 uppercase font-semibold">
                  {t("checkout.tierInfo")}
                </span>
                <p className="text-base font-bold text-zinc-900 mt-0.5">
                  {isEn ? currentConfig.nameEn : currentConfig.nameVi}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                  currentConfig.isPro
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                <Crown className="h-3 w-3" />
                {currentConfig.isPro ? "PRO" : "PLUS"}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase text-zinc-500">
                  {t("checkout.quantity")}
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {currentConfig.isYear
                    ? isEn
                      ? "Duration (Years)"
                      : "Thời hạn (Năm)"
                    : isEn
                    ? "Duration (Months)"
                    : "Thời hạn (Tháng)"}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1">
                <button
                  type="button"
                  disabled={quantity <= 1 || previewLoading || isSubmitting}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-700 shadow-xs hover:bg-zinc-100 disabled:opacity-40 transition-all cursor-pointer"
                  title="Giảm số lượng"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= 24 || previewLoading || isSubmitting}
                  onClick={() => setQuantity((q) => Math.min(24, q + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-700 shadow-xs hover:bg-zinc-100 disabled:opacity-40 transition-all cursor-pointer"
                  title="Tăng số lượng"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Price Preview Breakdown */}
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-xs font-medium">{t("checkout.processing")}</p>
              </div>
            ) : previewError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{t("checkout.errorPreview")}</p>
                  <p className="mt-0.5">{previewError}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-zinc-600">
                {/* Original Price */}
                <div className="flex items-center justify-between">
                  <span>{t("checkout.originalPrice")}</span>
                  <span className="font-semibold text-zinc-900">
                    {formatVND(preview?.originalPrice)}
                  </span>
                </div>

                {/* Promotion Discount */}
                {preview && preview.promotionDiscount > 0 && (
                  <div className="flex items-center justify-between text-rose-600 font-medium">
                    <span>{t("checkout.promotionDiscount")}</span>
                    <span>-{formatVND(preview.promotionDiscount)}</span>
                  </div>
                )}

                {/* Upgrade Remaining Value Discount */}
                {preview && preview.remainingValue > 0 && (
                  <div className="flex items-center justify-between text-blue-600 font-medium">
                    <span>{t("checkout.remainingValue")}</span>
                    <span>-{formatVND(preview.remainingValue)}</span>
                  </div>
                )}

                {/* Final Total Amount */}
                <div className="border-t border-zinc-100 pt-3 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-zinc-900">
                    {t("checkout.finalAmount")}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold tracking-tight text-emerald-700">
                      {formatVND(preview?.finalAmount)}
                    </span>
                    {isZeroAmount && (
                      <span className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                        {t("checkout.freePlan")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Action CTA Button */}
            <button
              type="button"
              disabled={isSubmitting || previewLoading || !!previewError}
              onClick={handleCreateOrder}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                isZeroAmount
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                  : currentConfig.isPro
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-200"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("checkout.processing")}</span>
                </>
              ) : isZeroAmount ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t("checkout.confirmFree")}</span>
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  <span>{t("checkout.confirmPay")}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
