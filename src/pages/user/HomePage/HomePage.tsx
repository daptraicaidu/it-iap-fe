import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../../store/authStore";

/* ─────────────── SVG Icon Components ─────────────── */

const IconAI = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
  >
    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
    <path d="M16 10.5V12a4 4 0 0 1-8 0v-1.5" />
    <line x1="12" y1="16" x2="12" y2="20" />
    <line x1="8" y1="20" x2="16" y2="20" />
    <circle cx="5" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="19" cy="5" r="1" fill="currentColor" stroke="none" />
    <path d="M5 5v3a2 2 0 0 0 2 2" />
    <path d="M19 5v3a2 2 0 0 1-2 2" />
  </svg>
);

const IconFeedback = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 10h6" />
    <path d="M9 14h4" />
  </svg>
);

const IconRoles = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconMenu = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className="w-6 h-6"
  >
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const IconClose = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className="w-6 h-6"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 0 1 .75-.75h10.638l-3.96-3.96a.75.75 0 1 1 1.06-1.06l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.96-3.96H3.75A.75.75 0 0 1 3 10Z"
      clipRule="evenodd"
    />
  </svg>
);

/* ─────────────── HomePage Component ─────────────── */

const HomePage = () => {
  const { t } = useTranslation("HomePage");
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCTA = useCallback(() => {
    if (isAuthenticated) {
      navigate(roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard");
    } else {
      navigate("/register");
    }
  }, [isAuthenticated, roles, navigate]);

  const features = [
    {
      icon: <IconAI />,
      title: t("features.aiInterview.title"),
      description: t("features.aiInterview.description"),
      gradient: "from-gradient-mint/40 to-gradient-sky/20",
    },
    {
      icon: <IconFeedback />,
      title: t("features.feedback.title"),
      description: t("features.feedback.description"),
      gradient: "from-gradient-peach/40 to-gradient-rose/20",
    },
    {
      icon: <IconRoles />,
      title: t("features.industries.title"),
      description: t("features.industries.description"),
      gradient: "from-gradient-lavender/40 to-gradient-sky/20",
    },
  ];

  const steps = [
    {
      number: "01",
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      number: "02",
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      number: "03",
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* ════════ TOP NAVIGATION ════════ */}
      <nav
        id="top-nav"
        className="sticky top-0 z-50 h-16 bg-canvas/80 backdrop-blur-lg border-b border-hairline-soft"
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="font-display text-xl font-light tracking-tight text-ink no-underline"
          >
            {t("nav.brand")}
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="font-body text-[15px] font-medium text-body hover:text-ink transition-colors no-underline"
            >
              {t("nav.features")}
            </a>
            <a
              href="#how-it-works"
              className="font-body text-[15px] font-medium text-body hover:text-ink transition-colors no-underline"
            >
              {t("nav.howItWorks")}
            </a>
            <button
              id="nav-cta"
              onClick={handleCTA}
              className="bg-primary text-on-primary font-body text-[15px] font-medium rounded-pill px-5 py-2.5 h-10 hover:bg-primary-active transition-colors cursor-pointer border-none"
            >
              {t("nav.getStarted")}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden bg-transparent border-none cursor-pointer text-ink p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-canvas border-b border-hairline shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col p-6 gap-4">
              <a
                href="#features"
                className="font-body text-[15px] font-medium text-body hover:text-ink transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.features")}
              </a>
              <a
                href="#how-it-works"
                className="font-body text-[15px] font-medium text-body hover:text-ink transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.howItWorks")}
              </a>
              <button
                className="bg-primary text-on-primary font-body text-[15px] font-medium rounded-pill px-5 py-2.5 h-10 hover:bg-primary-active transition-colors cursor-pointer border-none w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCTA();
                }}
              >
                {t("nav.getStarted")}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ════════ HERO BAND ════════ */}
      <section
        id="hero"
        className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
      >
        {/* Atmospheric Gradient Orbs */}
        <div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-50 blur-[100px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-gradient-mint) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-40 blur-[120px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-gradient-lavender) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[30%] w-[400px] h-[400px] rounded-full opacity-35 blur-[100px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-gradient-peach) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-surface-strong text-ink font-body text-xs font-semibold uppercase tracking-[0.96px] rounded-pill px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-semantic-success inline-block" />
            {t("hero.badge")}
          </div>

          {/* Headline */}
          <h1 className="font-display text-[40px] sm:text-5xl lg:text-[64px] font-light leading-[1.05] tracking-[-1.92px] text-ink max-w-3xl mx-auto mb-6 whitespace-pre-line">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-[17px] leading-relaxed text-body max-w-2xl mx-auto mb-10 tracking-[0.16px]">
            {t("hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-cta-primary"
              onClick={handleCTA}
              className="group bg-primary text-on-primary font-body text-[15px] font-medium rounded-pill px-7 py-3 h-12 hover:bg-primary-active transition-all cursor-pointer border-none flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              {t("hero.cta")}
              <span className="inline-flex transition-transform group-hover:translate-x-0.5">
                <IconArrowRight />
              </span>
            </button>
            <button
              id="hero-cta-secondary"
              className="bg-transparent text-ink font-body text-[15px] font-medium rounded-pill px-7 py-3 h-12 border border-hairline-strong hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              {t("hero.ctaSecondary")}
            </button>
          </div>
        </div>
      </section>

      {/* ════════ FEATURES SECTION ════════ */}
      <section id="features" className="py-24 bg-canvas-soft">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.96px] text-muted mb-4">
              {t("features.label")}
            </span>
            <h2 className="font-display text-[28px] sm:text-4xl font-light leading-[1.17] tracking-[-0.36px] text-ink">
              {t("features.title")}
            </h2>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                id={`feature-card-${index}`}
                className="group relative bg-surface-card rounded-xl p-6 border border-hairline hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Subtle gradient background on hover */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-surface-strong flex items-center justify-center text-ink mb-5">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-body text-xl font-medium leading-[1.35] text-ink mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-base leading-relaxed text-body tracking-[0.16px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS SECTION ════════ */}
      <section id="how-it-works" className="py-24 bg-canvas">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.96px] text-muted mb-4">
              {t("howItWorks.label")}
            </span>
            <h2 className="font-display text-[28px] sm:text-4xl font-light leading-[1.17] tracking-[-0.36px] text-ink">
              {t("howItWorks.title")}
            </h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} id={`step-${index}`} className="relative">
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px bg-hairline-strong" />
                )}

                <div className="text-center">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-card border-2 border-hairline-strong mb-6">
                    <span className="font-display text-2xl font-light text-ink tracking-[-0.32px]">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-display text-2xl font-light leading-[1.2] text-ink mb-3">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="font-body text-base leading-relaxed text-body tracking-[0.16px] max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA BAND ════════ */}
      <section id="cta-band" className="relative py-24 overflow-hidden">
        {/* Atmospheric orbs */}
        <div
          className="absolute top-[10%] right-[-5%] w-[350px] h-[350px] rounded-full opacity-40 blur-[80px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-gradient-sky) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-35 blur-[80px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-gradient-rose) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="font-display text-[28px] sm:text-4xl font-light leading-[1.17] tracking-[-0.36px] text-ink mb-4">
            {t("cta.title")}
          </h2>
          <p className="font-body text-base text-body tracking-[0.16px] mb-10">
            {t("cta.subtitle")}
          </p>
          <button
            id="cta-button"
            onClick={handleCTA}
            className="group bg-primary text-on-primary font-body text-[15px] font-medium rounded-pill px-8 py-3 h-12 hover:bg-primary-active transition-all cursor-pointer border-none inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          >
            {t("cta.button")}
            <span className="inline-flex transition-transform group-hover:translate-x-0.5">
              <IconArrowRight />
            </span>
          </button>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer
        id="footer"
        className="py-16 px-6 border-t border-hairline-soft bg-canvas"
      >
        <div className="max-w-[1200px] mx-auto">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2">
              <h3 className="font-display text-xl font-light text-ink mb-3">
                {t("footer.brand")}
              </h3>
              <p className="font-body text-[15px] leading-relaxed text-body tracking-[0.15px] max-w-sm">
                {t("footer.description")}
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-body text-xs font-semibold uppercase tracking-[0.96px] text-muted mb-4">
                {t("footer.product")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li>
                  <a
                    href="#features"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.pricing")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.changelog")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-body text-xs font-semibold uppercase tracking-[0.96px] text-muted mb-4">
                {t("footer.company")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.about")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.blog")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.careers")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-body text-xs font-semibold uppercase tracking-[0.96px] text-muted mb-4">
                {t("footer.legal")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.privacy")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.terms")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[15px] text-body hover:text-ink transition-colors no-underline tracking-[0.15px]"
                  >
                    {t("footer.cookies")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-hairline-soft">
            <p className="font-body text-sm text-muted-soft tracking-[0.15px] text-center">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
