import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  X,
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  Loader2,
  Crown,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import tierService, {
  type TierItem,
  type ActivePromotion,
} from "../../services/user/tierService";

interface UpgradeTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
}

const BASIC_TIER_ITEM: TierItem = {
  tierCode: "BASIC",
  productName: "Gói Cơ Bản",
  description: "Tài khoản miễn phí trải nghiệm",
  originalPrice: 0,
  level: 0,
  activePromotion: null,
};

const UpgradeTierModal: React.FC<UpgradeTierModalProps> = ({
  isOpen,
  onClose,
  currentTier = "BASIC",
}) => {
  const { t, i18n } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<TierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when full screen overlay is active
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    setLoading(true);
    setError(null);

    tierService
      .getTiers()
      .then((res) => {
        const rawTiers = res.data?.data ?? [];
        // Ensure BASIC tier is included at the beginning
        const hasBasic = rawTiers.some(
          (t) => t.tierCode.toUpperCase() === "BASIC"
        );
        const combined = hasBasic ? rawTiers : [BASIC_TIER_ITEM, ...rawTiers];
        const sorted = [...combined].sort((a, b) => a.level - b.level);
        setTiers(sorted);
      })
      .catch((err) => {
        console.error("Failed to load tiers:", err);
        // Fallback to display at least the basic tier
        setTiers([BASIC_TIER_ITEM]);
        setError(err.message || "Không thể tải danh sách khuyến mãi mới nhất.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const calculateDiscountPrice = (
    originalPrice: number,
    promotion: ActivePromotion | null
  ): number => {
    if (!promotion || !promotion.isActive) return originalPrice;
    if (promotion.discountType === "PERCENTAGE") {
      const discount = (originalPrice * promotion.discountValue) / 100;
      return Math.max(0, Math.round(originalPrice - discount));
    }
    if (promotion.discountType === "FIXED_AMOUNT") {
      return Math.max(0, originalPrice - promotion.discountValue);
    }
    return originalPrice;
  };

  const getTierBenefits = (tierCode: string): React.ReactNode[] => {
    const code = tierCode.toUpperCase();
    const isEn = i18n.language?.startsWith("en");

    if (code.includes("PRO")) {
      return [
        isEn ? (
          <>
            Up to <strong className="font-semibold text-zinc-900">12</strong> interview profiles
          </>
        ) : (
          <>
            Tối đa <strong className="font-semibold text-zinc-900">12</strong> hồ sơ phỏng vấn
          </>
        ),
        isEn ? (
          <>
            <strong className="font-semibold text-zinc-900">20</strong> AI interviews per day
          </>
        ) : (
          <>
            <strong className="font-semibold text-zinc-900">20</strong> lượt phỏng vấn AI mỗi ngày
          </>
        ),
        isEn ? (
          <>
            Chatbot context window: <strong className="font-semibold text-zinc-900">48,000</strong> tokens
          </>
        ) : (
          <>
            Ngữ cảnh hội thoại Chatbot: <strong className="font-semibold text-zinc-900">48,000</strong> tokens
          </>
        ),
        isEn ? "Comprehensive 5-skill scoring & deep feedback" : "Chấm điểm & phân tích chuyên sâu 5 kỹ năng",
        isEn ? "Priority AI queue processing" : "Ưu tiên xử lý trên hạ tầng AI siêu tốc",
      ];
    }
    if (code.includes("PLUS")) {
      return [
        isEn ? (
          <>
            Up to <strong className="font-semibold text-zinc-900">6</strong> interview profiles
          </>
        ) : (
          <>
            Tối đa <strong className="font-semibold text-zinc-900">6</strong> hồ sơ phỏng vấn
          </>
        ),
        isEn ? (
          <>
            <strong className="font-semibold text-zinc-900">10</strong> AI interviews per day
          </>
        ) : (
          <>
            <strong className="font-semibold text-zinc-900">10</strong> lượt phỏng vấn AI mỗi ngày
          </>
        ),
        isEn ? (
          <>
            Chatbot context window: <strong className="font-semibold text-zinc-900">32,000</strong> tokens
          </>
        ) : (
          <>
            Ngữ cảnh hội thoại Chatbot: <strong className="font-semibold text-zinc-900">32,000</strong> tokens
          </>
        ),
        isEn ? "Detailed skill score & improvement suggestions" : "Chấm điểm chi tiết & gợi ý cải thiện",
        isEn ? "Full interview transcript storage" : "Lưu trữ toàn bộ lịch sử phỏng vấn",
      ];
    }
    return [
      isEn ? (
        <>
          Up to <strong className="font-semibold text-zinc-900">3</strong> interview profiles
        </>
      ) : (
        <>
          Tối đa <strong className="font-semibold text-zinc-900">3</strong> hồ sơ phỏng vấn
        </>
      ),
      isEn ? (
        <>
          <strong className="font-semibold text-zinc-900">5</strong> AI interviews per day
        </>
      ) : (
        <>
          <strong className="font-semibold text-zinc-900">5</strong> lượt phỏng vấn AI mỗi ngày
        </>
      ),
      isEn ? (
        <>
          Chatbot context window: <strong className="font-semibold text-zinc-900">16,000</strong> tokens
        </>
      ) : (
        <>
          Ngữ cảnh hội thoại Chatbot: <strong className="font-semibold text-zinc-900">16,000</strong> tokens
        </>
      ),
      isEn ? "Standard competency benchmark review" : "Đánh giá theo khung năng lực cơ bản",
      isEn ? "Daily quota resets at 00:00" : "Làm mới lượt phỏng vấn vào 00:00 mỗi ngày",
    ];
  };

  return (
    <div className="fixed inset-0 z-[999] flex flex-col bg-zinc-50 text-zinc-900 overflow-y-auto antialiased">
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        title="Đóng (Esc)"
        className="fixed top-4 right-4 sm:top-6 sm:right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-600 shadow-lg border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main Container — responsive max-width up to 1600px for large displays */}
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-10 sm:px-8 xl:px-12">
        {/* Top Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 shadow-xs mb-3">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>{t("subscription.badgeTitle")}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-zinc-900">
            {t("subscription.modalTitle")}
          </h1>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            {t("subscription.modalSubtitle")}
          </p>
        </div>

        {/* Content area */}
        <div className="mt-10 sm:mt-12 flex-1">
          {error && (
            <div className="mb-6 mx-auto max-w-xl flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 shadow-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="flex-1">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Đang tải danh sách các gói dịch vụ...</p>
            </div>
          ) : (
            <div className="pt-4 grid gap-4 xl:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-stretch">
              {tiers.map((tier) => {
                const isCurrent =
                  currentTier.toUpperCase() === tier.tierCode.toUpperCase();
                const isBasic = tier.tierCode.toUpperCase() === "BASIC";
                const isPro = tier.tierCode.toUpperCase().includes("PRO");
                const isYear = tier.tierCode.toUpperCase().includes("YEAR");
                const promotion = tier.activePromotion;
                const finalPrice = calculateDiscountPrice(
                  tier.originalPrice,
                  promotion
                );
                const hasDiscount =
                  promotion && promotion.isActive && finalPrice < tier.originalPrice;
                const benefits = getTierBenefits(tier.tierCode);

                return (
                  <div
                    key={tier.tierCode}
                    className={`relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 xl:p-5 2xl:p-6 transition-all duration-300 ${
                      isCurrent
                        ? "border-emerald-300 bg-emerald-50/40 shadow-md hover:border-emerald-400"
                        : isPro
                        ? "border-blue-300 bg-gradient-to-b from-blue-50/80 via-white to-white shadow-xl shadow-blue-100/60 hover:border-blue-400 hover:scale-[1.02]"
                        : isBasic
                        ? "border-zinc-200 bg-white shadow-sm hover:border-zinc-300"
                        : "border-rose-300 bg-gradient-to-b from-rose-50/80 via-white to-white shadow-xl shadow-rose-100/60 hover:border-rose-400 hover:scale-[1.02]"
                    }`}
                  >
                    {/* Floating Top Badge for Most Popular on top card border */}
                    {isPro && !isYear && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md shadow-blue-500/30 border border-blue-400/40">
                          <Crown className="h-3.5 w-3.5" />
                          {t("subscription.popularBadge")}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col flex-1">
                      {/* Product Name */}
                      <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center justify-between min-h-[32px]">
                        <span>{tier.productName}</span>
                      </h3>

                      {/* Product Description */}
                      <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 min-h-[40px] leading-relaxed line-clamp-2">
                        {tier.description}
                      </p>

                      {/* Price Section with uniform height */}
                      <div className="mt-4 mb-6 border-y border-zinc-100 py-3.5 min-h-[82px] flex flex-col justify-center">
                        <div className="flex items-baseline gap-1 flex-nowrap overflow-hidden">
                          <span className="text-2xl sm:text-3xl xl:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-zinc-900 truncate">
                            {isBasic ? t("subscription.free") : finalPrice.toLocaleString("vi-VN")}
                          </span>
                          {!isBasic && (
                            <span className="shrink-0 text-xs sm:text-sm text-zinc-500 font-medium whitespace-nowrap">
                              đ {isYear ? t("subscription.perYear") : t("subscription.perMonth")}
                            </span>
                          )}
                          {isBasic && (
                            <span className="shrink-0 text-xs sm:text-sm text-zinc-400 font-medium whitespace-nowrap">
                              /{t("subscription.forever")}
                            </span>
                          )}
                        </div>

                        {/* Strikethrough price slot to keep all cards perfectly aligned */}
                        <div className="h-4.5 mt-1 flex items-center">
                          {hasDiscount ? (
                            <span className="text-zinc-400 line-through text-xs sm:text-sm font-medium">
                              {tier.originalPrice.toLocaleString("vi-VN")} đ
                            </span>
                          ) : (
                            <span className="text-transparent select-none text-xs" aria-hidden="true">
                              &nbsp;
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Feature List */}
                      <div className="space-y-3 mb-6 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {t("subscription.features.title")}
                        </p>
                        <ul className="space-y-3 text-xs sm:text-sm text-zinc-600">
                          {benefits.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                                  isCurrent
                                    ? "bg-emerald-100 text-emerald-700"
                                    : isPro
                                    ? "bg-blue-100 text-blue-700"
                                    : isBasic
                                    ? "bg-zinc-100 text-zinc-600"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                              <span className="leading-snug font-normal text-zinc-600">
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-2">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 py-3 text-center text-xs sm:text-sm font-bold text-emerald-800 cursor-default"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>{t("subscription.buttons.current")}</span>
                        </button>
                      ) : isBasic ? (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-full border border-zinc-200 bg-zinc-100 py-3 text-center text-xs sm:text-sm font-semibold text-zinc-500 cursor-not-allowed"
                        >
                          {t("subscription.buttons.default")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate(`/checkout?tier=${tier.tierCode}`, {
                              state: { selectedTier: tier.tierCode },
                            });
                          }}
                          className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                            isPro
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                              : "bg-rose-600 hover:bg-rose-700 text-white"
                          }`}
                        >
                          <span>{t("subscription.buttons.subscribe")}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-14 border-t border-zinc-200 pt-8 text-center text-xs sm:text-sm text-zinc-500 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>{t("subscription.guarantee.secure")}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap className="h-5 w-5 text-orange-600" />
            <span>{t("subscription.guarantee.instant")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeTierModal;
