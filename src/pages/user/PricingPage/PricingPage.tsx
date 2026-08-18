import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Check,
  ChevronDown,
  ArrowRight,
  Loader2,
  Building2,
  BadgeCheck,
  Crown,
  X,
} from "lucide-react";
import useAuthStore from "../../../store/authStore";
import tierService, {
  type TierItem,
  type ActivePromotion,
} from "../../../services/user/tierService";
import logoImg from "../../../assets/logo/logo.png";

const BASIC_FALLBACK_ITEM: TierItem = {
  tierCode: "BASIC",
  productName: "Gói Cơ Bản",
  description: "Tài khoản miễn phí trải nghiệm",
  originalPrice: 0,
  level: 0,
  activePromotion: null,
};

const PricingPage: React.FC = () => {
  const { t, i18n } = useTranslation(["Pricing", "HomePage"]);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [tiers, setTiers] = useState<TierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setLoading(true);

    tierService
      .getTiers()
      .then((res) => {
        const rawTiers = res.data?.data ?? [];
        const hasBasic = rawTiers.some(
          (item) => item.tierCode.toUpperCase() === "BASIC"
        );
        const combined = hasBasic ? rawTiers : [BASIC_FALLBACK_ITEM, ...rawTiers];
        const sorted = [...combined].sort((a, b) => a.level - b.level);
        setTiers(sorted);
      })
      .catch((err) => {
        console.error("Failed to load tiers for PricingPage:", err);
        setTiers([BASIC_FALLBACK_ITEM]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi");
  };

  const handleNavCTA = () => {
    if (isAuthenticated) {
      navigate(roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard");
    } else {
      navigate("/register");
    }
  };

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

  // Helper to find tier by code prefix and cycle
  const getTierForCycle = (prefix: "PLUS" | "PRO"): TierItem | undefined => {
    const targetCode =
      billingCycle === "monthly" ? `${prefix}_MONTH` : `${prefix}_YEAR`;
    return (
      tiers.find((tier) => tier.tierCode.toUpperCase() === targetCode) ||
      tiers.find((tier) => tier.tierCode.toUpperCase().startsWith(prefix))
    );
  };

  const plusTier = getTierForCycle("PLUS");
  const proTier = getTierForCycle("PRO");

  const plusOriginalPrice = plusTier?.originalPrice ?? "Login";
  const plusFinalPrice = plusTier
    ? calculateDiscountPrice(plusTier.originalPrice, plusTier.activePromotion)
    : "Login";
  const plusHasDiscount =
    plusTier?.activePromotion?.isActive && plusFinalPrice < plusOriginalPrice;

  const proOriginalPrice = proTier?.originalPrice ?? "Login";
  const proFinalPrice = proTier
    ? calculateDiscountPrice(proTier.originalPrice, proTier.activePromotion)
    : "Login";
  const proHasDiscount =
    proTier?.activePromotion?.isActive && proFinalPrice < proOriginalPrice;

  const handleSelectTier = (tierCode: string) => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }
    if (tierCode === "BASIC") {
      navigate("/dashboard");
      return;
    }
    navigate(`/checkout?tier=${tierCode}`, {
      state: { selectedTier: tierCode },
    });
  };

  const faqList = (t("faq.items", { returnObjects: true }) as Array<{
    q: string;
    a: string;
  }>) || [];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* ────────────────────────────────────────────────────────
          NAVIGATION BAR
      ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <img
              src={logoImg}
              alt="Interview AI Practice Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-semibold text-lg text-zinc-900 tracking-tight">
              {t("nav.brand")}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {t("nav.home")}
            </Link>
            <span className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-0.5">
              {t("nav.pricing")}
            </span>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {i18n.language === "vi" ? "EN" : "VI"}
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleNavCTA}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-800 transition-all shadow-xs cursor-pointer"
              >
                <span>{t("nav.dashboard")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all shadow-xs"
                >
                  <span>{t("nav.register")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2 py-1 text-xs font-bold uppercase rounded-lg border border-zinc-200 text-zinc-600"
            >
              {i18n.language === "vi" ? "EN" : "VI"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-zinc-200 bg-white px-4 py-4 space-y-3"
            >
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-zinc-700 hover:text-zinc-900"
              >
                {t("nav.home")}
              </Link>
              <span className="block text-base font-bold text-blue-600">
                {t("nav.pricing")}
              </span>
              <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavCTA();
                    }}
                    type="button"
                    className="w-full py-2.5 rounded-full bg-zinc-900 text-white text-sm font-semibold text-center"
                  >
                    {t("nav.dashboard")}
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2 text-center text-sm font-medium text-zinc-700"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-full bg-zinc-900 text-white text-sm font-semibold text-center"
                    >
                      {t("nav.register")}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ────────────────────────────────────────────────────────
          HERO & BILLING CYCLE TOGGLE
      ──────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-100/40 via-indigo-100/30 to-purple-100/40 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-700 shadow-xs mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-tight">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-10 inline-flex items-center p-1.5 bg-zinc-200/70 rounded-full border border-zinc-200">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {t("hero.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <span>{t("hero.yearly")}</span>
              <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                {t("hero.yearlyBadge")}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          PRICING CARDS GRID
      ──────────────────────────────────────────────────────── */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">{t("loading")}</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-stretch">
            {/* 1. GÓI BASIC (FREE) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-7 sm:p-8 shadow-xs hover:border-zinc-300 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-zinc-900">
                    {t("tiers.basic.name")}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-zinc-500 min-h-[40px]">
                  {t("tiers.basic.tagline")}
                </p>

                {/* Price */}
                <div className="mt-6 mb-8 border-y border-zinc-100 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">
                      {t("tiers.basic.price")}
                    </span>
                    <span className="text-sm text-zinc-500 font-medium">
                      /{t("tiers.basic.period")}
                    </span>
                  </div>
                  <div className="h-5 mt-1 text-xs text-zinc-400">
                    {t("tiers.basic.coreNote")}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {t("tiers.benefitLabel")}
                  </p>
                  <ul className="space-y-3.5 text-sm text-zinc-600">
                    {(
                      (t("tiers.basic.features", { returnObjects: true }) as string[]) || []
                    ).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 mt-0.5">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectTier("BASIC")}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 py-3.5 text-center text-sm font-semibold text-zinc-800 transition-colors cursor-pointer"
                >
                  {t("tiers.basic.cta")}
                </button>
              </div>
            </motion.div>

            {/* 2. GÓI PLUS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col justify-between rounded-3xl border border-rose-200/90 bg-gradient-to-b from-rose-50/40 via-white to-white p-7 sm:p-8 shadow-md hover:border-rose-300 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-zinc-900">
                    {t("tiers.plus.name")}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                    {t("tiers.plus.badge")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500 min-h-[40px]">
                  {t("tiers.plus.tagline")}
                </p>

                {/* Price */}
                <div className="mt-6 mb-8 border-y border-rose-100/60 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">
                      {plusFinalPrice.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-sm text-zinc-500 font-medium">
                      đ /{billingCycle === "monthly" ? t("tiers.plus.periodMonth") : t("tiers.plus.periodYear")}
                    </span>
                  </div>
                  <div className="h-5 mt-1 flex items-center gap-2">
                    {plusHasDiscount ? (
                      <>
                        <span className="text-zinc-400 line-through text-xs font-medium">
                          {plusOriginalPrice.toLocaleString("vi-VN")} đ
                        </span>
                        <span className="text-[11px] font-semibold text-rose-600">
                          {t("tiers.plus.discountLabel")}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {billingCycle === "yearly" ? t("tiers.plus.yearlyNote") : t("tiers.plus.monthlyNote")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {t("tiers.benefitLabel")}
                  </p>
                  <ul className="space-y-3.5 text-sm text-zinc-600">
                    {(
                      (t("tiers.plus.features", { returnObjects: true }) as string[]) || []
                    ).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 mt-0.5">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectTier(plusTier?.tierCode || (billingCycle === "monthly" ? "PLUS_MONTH" : "PLUS_YEAR"))
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 text-center text-sm font-bold transition-all shadow-md shadow-rose-200 cursor-pointer active:scale-98"
                >
                  <span>{t("tiers.plus.cta")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* 3. GÓI PRO (POPULAR CHOICE) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative flex flex-col justify-between rounded-3xl border-2 border-blue-500/80 bg-gradient-to-b from-blue-50/70 via-white to-white p-7 sm:p-8 shadow-xl shadow-blue-100/50 hover:border-blue-600 transition-all duration-300"
            >
              {/* Floating Top Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/30">
                  <Crown className="h-3.5 w-3.5" />
                  {t("tiers.pro.popularBadge")}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-zinc-900">
                    {t("tiers.pro.name")}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {t("tiers.pro.badge")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500 min-h-[40px]">
                  {t("tiers.pro.tagline")}
                </p>

                {/* Price */}
                <div className="mt-6 mb-8 border-y border-blue-100 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900">
                      {proFinalPrice.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-sm text-zinc-500 font-medium">
                      đ /{billingCycle === "monthly" ? t("tiers.pro.periodMonth") : t("tiers.pro.periodYear")}
                    </span>
                  </div>
                  <div className="h-5 mt-1 flex items-center gap-2">
                    {proHasDiscount ? (
                      <>
                        <span className="text-zinc-400 line-through text-xs font-medium">
                          {proOriginalPrice.toLocaleString("vi-VN")} đ
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600">
                          {t("tiers.pro.discountLabel")}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-blue-600 font-medium">
                        {billingCycle === "yearly" ? t("tiers.pro.yearlyNote") : t("tiers.pro.monthlyNote")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-900/60">
                    {t("tiers.vipBenefitLabel")}
                  </p>
                  <ul className="space-y-3.5 text-sm text-zinc-600">
                    {(
                      (t("tiers.pro.features", { returnObjects: true }) as string[]) || []
                    ).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 mt-0.5">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug font-medium text-zinc-800">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectTier(proTier?.tierCode || (billingCycle === "monthly" ? "PRO_MONTH" : "PRO_YEAR"))
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 text-center text-sm font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer active:scale-98"
                >
                  <span>{t("tiers.pro.cta")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────
          FEATURE COMPARISON MATRIX TABLE
      ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-semibold text-zinc-700 mb-3 shadow-2xs">
              <BadgeCheck className="w-4 h-4 text-blue-600" />
              <span>{t("comparison.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              {t("comparison.title")}
            </h2>
            <p className="mt-3 text-zinc-600 text-sm sm:text-base">
              {t("comparison.subtitle")}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="p-4 sm:p-5 font-bold text-zinc-900 w-2/5">
                    {t("comparison.columns.feature")}
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-zinc-900 text-center w-1/5">
                    {t("comparison.columns.basic")}
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-rose-600 text-center w-1/5 bg-rose-50/50">
                    {t("comparison.columns.plus")}
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-blue-600 text-center w-1/5 bg-blue-50/50">
                    {t("comparison.columns.pro")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {/* Group 1: Interviews */}
                <tr className="bg-zinc-100/70 font-semibold text-zinc-800 text-xs uppercase tracking-wider">
                  <td colSpan={4} className="px-5 py-2.5">
                    {t("comparison.categories.interviews")}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.profiles")}
                  </td>
                  <td className="p-4 text-center font-medium text-zinc-800">3</td>
                  <td className="p-4 text-center font-bold text-rose-600 bg-rose-50/20">6</td>
                  <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/20">
                    12
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.dailyQuota")}
                  </td>
                  <td className="p-4 text-center font-medium text-zinc-800">
                    5 {t("comparison.sessionsPerDay")}
                  </td>
                  <td className="p-4 text-center font-bold text-rose-600 bg-rose-50/20">
                    10 {t("comparison.sessionsPerDay")}
                  </td>
                  <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/20">
                    20 {t("comparison.sessionsPerDay")}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.interactiveMode")}
                  </td>
                  <td className="p-4 text-center text-emerald-600 font-medium">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-blue-600 font-bold bg-blue-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.pressureMode")}
                  </td>
                  <td className="p-4 text-center text-emerald-600 font-medium">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-blue-600 font-bold bg-blue-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                </tr>

                {/* Group 2: Analysis & Scoring */}
                <tr className="bg-zinc-100/70 font-semibold text-zinc-800 text-xs uppercase tracking-wider">
                  <td colSpan={4} className="px-5 py-2.5">
                    {t("comparison.categories.analysis")}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.radarScoring")}
                  </td>
                  <td className="p-4 text-center text-emerald-600 font-medium">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-blue-600 font-bold bg-blue-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.antiCheat")}
                  </td>
                  <td className="p-4 text-center text-emerald-600 font-medium">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-blue-600 font-bold bg-blue-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.transcriptHistory")}
                  </td>
                  <td className="p-4 text-center text-zinc-700 font-medium">
                    {t("comparison.values.unlimited")}
                  </td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">
                    {t("comparison.values.unlimited")}
                  </td>
                  <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/20">
                    {t("comparison.values.unlimited")}
                  </td>
                </tr>

                {/* Group 3: Chatbot & Support */}
                <tr className="bg-zinc-100/70 font-semibold text-zinc-800 text-xs uppercase tracking-wider">
                  <td colSpan={4} className="px-5 py-2.5">
                    {t("comparison.categories.chatbot")}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.chatbotTokens")}
                  </td>
                  <td className="p-4 text-center text-zinc-700 font-medium">16,000 tokens</td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">32,000 tokens</td>
                  <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/20">
                    48,000 tokens
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.priorityQueue")}
                  </td>
                  <td className="p-4 text-center text-emerald-600 font-medium">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-blue-600 font-bold bg-blue-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-5 text-zinc-700">
                    {t("comparison.items.supportLevel")}
                  </td>
                  <td className="p-4 text-center text-emerald-600 font-medium">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-rose-600 font-bold bg-rose-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                  <td className="p-4 text-center text-blue-600 font-bold bg-blue-50/20">
                    <Check className="w-4 h-4 mx-auto stroke-[3]" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          FAQ ACCORDION SECTION
      ──────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-semibold text-zinc-700 mb-3 shadow-2xs">
            <span>{t("faq.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-zinc-600 text-sm sm:text-base">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {faqList.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-colors shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm sm:text-base text-zinc-600 leading-relaxed border-t border-zinc-100 pt-4"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          ENTERPRISE / CAMPUS BANNER
      ──────────────────────────────────────────────────────── */}
      <section className="pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{t("ctaBanner.badge")}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight">
              {t("ctaBanner.title")}
            </h3>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
              {t("ctaBanner.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={() => handleSelectTier("PRO_MONTH")}
              type="button"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer text-center active:scale-98"
            >
              {t("ctaBanner.primaryBtn")}
            </button>
            <a
              href="mailto:contact@tpmson.com"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm transition-all text-center no-underline shadow-2xs active:scale-98"
            >
              {t("ctaBanner.secondaryBtn")}
            </a>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          FOOTER
      ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-zinc-100">
            {/* Logo and Slogan */}
            <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
              <Link to="/" className="flex items-center gap-2.5 no-underline">
                <img src={logoImg} alt="Interview AI Practice Logo" className="h-7 w-auto" />
                <span className="font-bold text-base text-zinc-900">
                  {t("nav.brand")}
                </span>
              </Link>
              <p className="text-xs text-zinc-500 max-w-sm">
                {t("footer.brandDesc")}
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-600">
              <Link to="/pricing" className="font-semibold text-zinc-900">
                {t("footer.links.pricing")}
              </Link>
              <Link to="/introduction" className="hover:text-zinc-900 transition-colors">
                {t("footer.links.about")}
              </Link>
              <Link to="/terms-of-service" className="hover:text-zinc-900 transition-colors">
                {t("footer.links.terms")}
              </Link>
              <Link to="/privacy-policy" className="hover:text-zinc-900 transition-colors">
                {t("footer.links.privacy")}
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-zinc-400">
            {t("footer.copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
