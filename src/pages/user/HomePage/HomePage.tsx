import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import useAuthStore from "../../../store/authStore";
import logoImg from "../../../assets/logo/logo.png";
import step1Img from '../../../assets/walkthrough/step1-setup.png';
import step2Img from '../../../assets/walkthrough/step2-interview.png';
import step3Img from '../../../assets/walkthrough/step3-report.png';
import interactiveModeImg from '../../../assets/walkthrough/phongvantuongtac.png';
import pressureModeImg from '../../../assets/walkthrough/phongvanapluc.png';
import nv1 from '../../../assets/walkthrough/nv1.png';
import nv2 from '../../../assets/walkthrough/nv2.png';
import nv3 from '../../../assets/walkthrough/nv3.png';
import nv4 from '../../../assets/walkthrough/nv4.png';
import nv5 from '../../../assets/walkthrough/nv5.png';
import nv6 from '../../../assets/walkthrough/nv6.png';
import nv7 from '../../../assets/walkthrough/nv7.png';
import nv8 from '../../../assets/walkthrough/nv8.png';
import nv9 from '../../../assets/walkthrough/nv9.png';
import nv10 from '../../../assets/walkthrough/nv10.png';
import LogoCMC from '../../../assets/walkthrough/LogoCMC.png';
import LogoCODEGYM from '../../../assets/walkthrough/LogoCODEGYM.png';
import { Bot, Sparkles, Database, MessageCircle, ShieldCheck, Radar, RefreshCcw, Star } from "lucide-react";

const students = [
  { id: 1, name: 'Nguyễn Văn An', role: 'Frontend', score: 8.5, img: nv1 },
  { id: 2, name: 'Trần Thị Bình', role: 'Backend', score: 9.0, img: nv2 },
  { id: 3, name: 'Lê Hoàng Cường', role: 'Tester', score: 8.2, img: nv3 },
  { id: 4, name: 'Phạm Quỳnh Dung', role: 'Data Analyst', score: 9.5, img: nv4 },
  { id: 5, name: 'Hoàng Minh Ân', role: 'Frontend', score: 8.8, img: nv5 },
  { id: 6, name: 'Vũ Thị Phương', role: 'Backend', score: 8.4, img: nv6 },
  { id: 7, name: 'Đặng Tuấn Anh', role: 'Tester', score: 9.1, img: nv7 },
  { id: 8, name: 'Bùi Ngọc Linh', role: 'Data Analyst', score: 8.7, img: nv8 },
  { id: 9, name: 'Đỗ Hữu Trí', role: 'Frontend', score: 9.3, img: nv9 },
  { id: 10, name: 'Ngô Thanh Trà', role: 'Backend', score: 8.9, img: nv10 },
];
const row1 = students.slice(0, 5);
const row2 = students.slice(5, 10);

/* ─────────────── Icon Components ─────────────── */

const IconArrowRight = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 0 1 .75-.75h10.638l-3.96-3.96a.75.75 0 1 1 1.06-1.06l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.96-3.96H3.75A.75.75 0 0 1 3 10Z"
      clipRule="evenodd"
    />
  </svg>
);

const IconMenu = ({ white }: { white?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={white ? "white" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const IconClose = ({ white }: { white?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={white ? "white" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─────────────── HomePage Component ─────────────── */

const HomePage = () => {
  const { t, i18n } = useTranslation("HomePage");
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'interactive' | 'pressure'>('interactive');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const [isOnHero, setIsOnHero] = useState(true);

  useEffect(() => {
    const update = () => {
      setIsOnHero(window.scrollY < window.innerHeight * 0.72);
    };
    window.addEventListener("scroll", update, { passive: true });
    update(); // run on mount
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleCTA = useCallback(() => {
    if (isAuthenticated) {
      navigate(roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard");
    } else {
      navigate("/register");
    }
  }, [isAuthenticated, roles, navigate]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi");
  };

  const features3D = [
    {
      icon: <Database className="w-12 h-12 md:w-16 md:h-16 text-white mb-4 md:mb-6 drop-shadow-md" />,
      title: t("features3D.card1.title"),
      backContent: t("features3D.card1.backContent"),
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      icon: <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-white mb-4 md:mb-6 drop-shadow-md" />,
      title: t("features3D.card2.title"),
      backContent: t("features3D.card2.backContent"),
      gradient: "from-indigo-600 to-purple-600"
    },
    {
      icon: <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-white mb-4 md:mb-6 drop-shadow-md" />,
      title: t("features3D.card3.title"),
      backContent: t("features3D.card3.backContent"),
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Radar className="w-12 h-12 md:w-16 md:h-16 text-white mb-4 md:mb-6 drop-shadow-md" />,
      title: t("features3D.card4.title"),
      backContent: t("features3D.card4.backContent"),
      gradient: "from-[#0B2A6B] to-blue-700"
    }
  ];

  const reviewsList = [
    { id: 1, name: 'Hoàng Nguyễn', role: 'Frontend', text: t("testimonials.review1"), stars: 5 },
    { id: 2, name: 'Lưu Xuân Trường', role: 'Backend', text: t("testimonials.review2"), stars: 5 },
    { id: 3, name: 'Trần Mỹ Linh', role: 'Tester', text: t("testimonials.review3"), stars: 5 },
    { id: 4, name: 'Phương Uyên', role: 'Data Analyst', text: t("testimonials.review4"), stars: 5 },
    { id: 5, name: 'Đức Phát', role: 'Frontend', text: t("testimonials.review5"), stars: 5 },
    { id: 6, name: 'Quốc Bảo', role: 'Backend', text: t("testimonials.review6"), stars: 5 },
    { id: 7, name: 'Hải Yến', role: 'Data Analyst', text: t("testimonials.review7"), stars: 5 },
    { id: 8, name: 'Thanh Hùng', role: 'Tester', text: t("testimonials.review8"), stars: 5 },
  ];
  const column1 = reviewsList.filter((_, i) => i % 2 === 0);
  const column2 = reviewsList.filter((_, i) => i % 2 !== 0);

  return (
    <div className="min-h-screen">
      {/* ════════════════════════════════════════════════════
          FIXED NAVIGATION — Scroll-aware color transition
      ════════════════════════════════════════════════════ */}
      <nav
        id="top-nav"
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          isOnHero
            ? "border-b border-white/10"
            : "bg-canvas/95 backdrop-blur-lg border-b border-hairline-soft"
        }`}
        style={isOnHero ? { backgroundColor: "transparent" } : undefined}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center no-underline cursor-pointer"
            style={{ gap: "var(--hp-space-3)" }}
          >
            <img
              src={logoImg}
              alt="Interview with AI Logo"
              className="h-8 w-auto object-contain transition-all duration-300"
              style={{ filter: isOnHero ? "brightness(0) invert(1)" : "none" }}
            />
            <span
              className="font-display text-lg sm:text-xl font-light tracking-tight transition-colors duration-300"
              style={{ color: isOnHero ? "white" : "var(--color-ink)" }}
            >
              {t("nav.brand")}
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {(["nav.features", "nav.howItWorks", "nav.pricing"] as const).map((key, i) => {
              if (key === "nav.pricing") {
                return (
                  <Link
                    key={key}
                    to="/pricing"
                    className="font-body text-[15px] font-medium transition-colors duration-200 no-underline"
                    style={{
                      color: isOnHero ? "rgba(255,255,255,0.80)" : "var(--color-body)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = isOnHero ? "white" : "var(--color-ink)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = isOnHero
                        ? "rgba(255,255,255,0.80)"
                        : "var(--color-body)")
                    }
                  >
                    {t(key)}
                  </Link>
                );
              }
              return (
                <a
                  key={key}
                  href={i === 0 ? "#features" : "#how-it-works"}
                  className="font-body text-[15px] font-medium transition-colors duration-200 no-underline"
                  style={{
                    color: isOnHero ? "rgba(255,255,255,0.80)" : "var(--color-body)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = isOnHero ? "white" : "var(--color-ink)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = isOnHero
                      ? "rgba(255,255,255,0.80)"
                      : "var(--color-body)")
                  }
                >
                  {t(key)}
                </a>
              );
            })}

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="font-body text-[15px] font-medium transition-colors duration-200 bg-transparent border-none cursor-pointer uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: isOnHero ? "rgba(255,255,255,0.80)" : "var(--color-body)" }}
            >
              {i18n.language === "vi" ? "EN" : "VI"}
            </button>

            {/* Nav CTA */}
            <button
              id="nav-cta"
              onClick={handleCTA}
              className="font-body text-[15px] font-medium px-5 py-2 border cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]"
              style={
                isOnHero
                  ? {
                      backgroundColor: "rgba(255,255,255,0.14)",
                      color: "white",
                      borderColor: "rgba(255,255,255,0.30)",
                      borderRadius: "var(--hp-radius-full)",
                      backdropFilter: "blur(8px)",
                    }
                  : {
                      backgroundColor: "var(--hp-color-primary-blue)",
                      color: "white",
                      borderColor: "transparent",
                      borderRadius: "var(--hp-radius-full)",
                    }
              }
              onMouseEnter={(e) => {
                if (isOnHero) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)";
                else e.currentTarget.style.backgroundColor = "#003fd4";
              }}
              onMouseLeave={(e) => {
                if (isOnHero) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.14)";
                else e.currentTarget.style.backgroundColor = "var(--hp-color-primary-blue)";
              }}
            >
              {isAuthenticated ? "Dashboard" : t("nav.getStarted")}
            </button>
          </div>

          {/* Mobile right controls (Language + Menu Toggle) */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleLanguage}
              className="font-body text-sm font-semibold transition-colors bg-transparent border border-white/30 rounded-full px-2.5 py-1 uppercase focus-visible:outline-2"
              style={{ color: isOnHero ? "white" : "var(--color-ink)", borderColor: isOnHero ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)" }}
            >
              {i18n.language === "vi" ? "EN" : "VI"}
            </button>
            <button
              id="mobile-menu-toggle"
              className="bg-transparent border-none cursor-pointer p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <IconClose white={isOnHero} /> : <IconMenu white={isOnHero} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden absolute top-16 left-0 right-0 border-b z-40 shadow-xl"
            style={
              isOnHero
                ? { backgroundColor: "rgba(0,50,180,0.95)", borderColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(16px)" }
                : { backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)" }
            }
          >
            <div className="flex flex-col p-6 gap-4">
              <a
                href="#features"
                className="font-body text-[15px] font-medium no-underline transition-colors"
                style={{ color: isOnHero ? "rgba(255,255,255,0.85)" : "var(--color-body)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.features")}
              </a>
              <a
                href="#how-it-works"
                className="font-body text-[15px] font-medium no-underline transition-colors"
                style={{ color: isOnHero ? "rgba(255,255,255,0.85)" : "var(--color-body)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.howItWorks")}
              </a>
              <Link
                to="/pricing"
                className="font-body text-[15px] font-medium no-underline transition-colors"
                style={{ color: isOnHero ? "rgba(255,255,255,0.85)" : "var(--color-body)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.pricing")}
              </Link>
              <button
                className="font-body text-[15px] font-medium px-5 py-2.5 h-11 transition-all cursor-pointer border-none w-full active:scale-[0.97]"
                style={{
                  backgroundColor: isOnHero ? "white" : "var(--hp-color-primary-blue)",
                  color: isOnHero ? "var(--hp-color-primary-blue)" : "white",
                  borderRadius: "var(--hp-radius-full)",
                }}
                onClick={() => { setMobileMenuOpen(false); handleCTA(); }}
              >
                {isAuthenticated ? "Dashboard" : t("nav.getStarted")}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════════════════════
          HERO BAND — Responsive & Immersive Design
      ════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="w-full flex flex-col justify-between items-center relative overflow-hidden bg-gradient-to-b from-[#0052FF] to-[#0038BC] min-h-[100dvh] pt-20 sm:pt-24 pb-12"
      >
        {/* ── Concentric Ripple Effect ── */}
        <div className="absolute inset-x-0 bottom-[-15vh] flex justify-center items-center pointer-events-none" aria-hidden="true">
          <div className="absolute w-[40vw] min-w-[300px] aspect-square rounded-full bg-white/5" />
          <div className="absolute w-[65vw] min-w-[500px] aspect-square rounded-full bg-white/5" />
          <div className="absolute w-[100vw] min-w-[800px] aspect-square rounded-full bg-white/5" />
          <div className="absolute w-[140vw] min-w-[1200px] aspect-square rounded-full bg-white/5" />
        </div>

        {/* ── Central Content Block ── */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-4 w-full my-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* RESPONSIVE TYPOGRAPHY */}
          <h1 className="flex flex-col items-center justify-center font-sans font-extrabold tracking-tight leading-[1.15] text-3xl sm:text-5xl md:text-[72px] lg:text-[80px] text-center w-full px-2">
            {/* Line 1 */}
            <span className="text-blue-100 block mb-1 sm:mb-2">
              {t("hero.line1")}
            </span>
            
            {/* Line 2 with INLINE MASCOT */}
            <span className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-1 sm:my-2">
              <span className="inline-flex items-center align-middle bg-white/20 backdrop-blur-xl border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-full px-3 py-1 sm:px-5 sm:py-2 gap-1.5 sm:gap-2 text-white/90">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                <motion.div
                  animate={{ rotate: [0, 15, -10, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="origin-bottom"
                >
                  <Bot className="w-6 h-6 sm:w-10 sm:h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                </motion.div>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                {t("hero.line2")}
              </span>
            </span>

            {/* Line 3 */}
            <span className="text-white block mt-1 sm:mt-2">
              {t("hero.line3")}
            </span>
          </h1>
        </motion.div>

        {/* ── Centerpiece CTA ── */}
        <motion.div 
          className="relative pb-6 sm:pb-12 flex flex-col items-center z-20 w-full px-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <button
            id="hero-cta-primary"
            onClick={() =>
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
            }
            className="font-sans font-extrabold text-base sm:text-xl md:text-2xl tracking-wide uppercase px-8 sm:px-12 py-3.5 sm:py-5 rounded-full text-[#0051F9] bg-white shadow-[0_0_50px_rgba(255,255,255,0.6)] hover:scale-105 transition-all inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 active:scale-95 cursor-pointer border-none"
          >
            {t("hero.ctaButton")}
          </button>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES SECTION — 3D Flip Cards
      ════════════════════════════════════════════════════ */}
      <section id="features" className="py-16 sm:py-24 bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.h2 
            className="text-center mb-12 sm:mb-16 font-sans font-extrabold text-2xl sm:text-4xl lg:text-5xl tracking-tight text-[#0A2558]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {t("features3D.title").split(" ").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block mr-1.5 sm:mr-2 md:mr-3"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features3D.map((feature, index) => {
              const isFlipped = !!flippedCards[index];
              return (
                <div
                  key={index}
                  className="group h-[320px] sm:h-[340px] w-full [perspective:1000px] cursor-pointer"
                  onClick={() => setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }))}
                >
                  <div
                    className={`relative h-full w-full rounded-2xl transition-all duration-[800ms] ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${
                      isFlipped ? "[transform:rotateY(180deg)]" : ""
                    } shadow-xl`}
                  >
                    {/* Front Face */}
                    <div className={`absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] bg-gradient-to-br ${feature.gradient} flex flex-col items-start justify-between p-6 text-white`}>
                      <div>
                        {feature.icon}
                        <h3 className="font-sans font-bold text-xl sm:text-2xl leading-snug">
                          {feature.title}
                        </h3>
                      </div>
                      <div className="self-end w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <RefreshCcw className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {/* Back Face */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-[#0A1A3A] text-white [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center p-6 text-left">
                      <h4 className="font-sans font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-blue-200">
                        {feature.title}
                      </h4>
                      <p className="font-sans text-sm sm:text-[16px] leading-relaxed text-blue-50/90">
                        {feature.backContent}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS — STAGE 3 (GIANT WALKTHROUGH CARDS)
      ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-10 flex flex-col items-center">
            <motion.h2 
              className="text-[#0A2558] font-sans font-bold text-2xl sm:text-3xl md:text-[44px] tracking-tight max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {t("walkthrough.title").split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block mr-1.5 md:mr-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p 
              className="text-[#0071F9] font-sans font-medium text-base sm:text-lg md:text-xl mt-3 sm:mt-4 mb-8 sm:mb-10 max-w-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
            >
              {t("walkthrough.subtitle").split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block mr-1"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>
          </div>

          {/* Cards Container */}
          <div className="w-full max-w-full lg:max-w-[1440px] mx-auto relative pb-[15vh]">
            
            {/* ── GIANT CARD 1 ── */}
            <div className="sticky top-[80px] sm:top-[100px] z-10 bg-gradient-to-br from-[#23242D] to-[#0071F9] flex flex-col lg:flex-row gap-8 lg:gap-20 items-center w-full rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-24 shadow-2xl min-h-[60vh] sm:min-h-[75vh]">
              {/* Text Side (Left) */}
              <div className="flex flex-col justify-center w-full lg:w-[45%]">
                <span className="text-[#A4CAFE]/30 text-4xl sm:text-6xl md:text-7xl font-black mb-3 sm:mb-6 block">
                  {t("walkthrough.stepLabel")} 1
                </span>
                <h3 className="text-xl sm:text-[30px] lg:text-[44px] text-[#FFFFFF] font-bold mb-3 sm:mb-6 leading-tight">
                  {t("walkthrough.step1.title")}
                </h3>
                <p className="text-[#FFFFFF]/90 text-sm sm:text-[20px] lg:text-[24px] leading-relaxed">
                  {t("walkthrough.step1.description")}
                </p>
              </div>
              {/* Image Side (Right) */}
              <div className="w-full lg:w-[55%] aspect-video rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10 bg-black/5">
                <img src={step1Img} alt="Step 1" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            </div>

            {/* ── GIANT CARD 2 ── */}
            <div className="sticky top-[110px] sm:top-[140px] z-20 bg-gradient-to-br from-[#23242D] to-[#0071F9] flex flex-col lg:flex-row-reverse gap-8 lg:gap-20 items-center shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[40vh] sm:mt-[60vh] w-full rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-24 min-h-[60vh] sm:min-h-[75vh]">
              {/* Text Side (Right) */}
              <div className="flex flex-col justify-center w-full lg:w-[45%]">
                <span className="text-[#A4CAFE]/30 text-4xl sm:text-6xl md:text-7xl font-black mb-3 sm:mb-6 block">
                  {t("walkthrough.stepLabel")} 2
                </span>
                <h3 className="text-xl sm:text-[30px] lg:text-[44px] text-[#FFFFFF] font-bold mb-3 sm:mb-6 leading-tight">
                  {t("walkthrough.step2.title")}
                </h3>
                <p className="text-[#FFFFFF]/90 text-sm sm:text-[20px] lg:text-[24px] leading-relaxed">
                  {t("walkthrough.step2.description")}
                </p>
              </div>
              {/* Image Side (Left) */}
              <div className="w-full lg:w-[55%] aspect-video rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10 bg-black/5">
                <img src={step2Img} alt="Step 2" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            </div>

            {/* ── GIANT CARD 3 ── */}
            <div className="sticky top-[140px] sm:top-[180px] z-30 bg-gradient-to-br from-[#23242D] to-[#0071F9] flex flex-col lg:flex-row gap-8 lg:gap-20 items-center shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[40vh] sm:mt-[60vh] w-full rounded-3xl sm:rounded-[48px] p-6 sm:p-10 lg:p-24 min-h-[60vh] sm:min-h-[75vh]">
              {/* Text Side (Left) */}
              <div className="flex flex-col justify-center w-full lg:w-[45%]">
                <span className="text-[#A4CAFE]/30 text-4xl sm:text-6xl md:text-7xl font-black mb-3 sm:mb-6 block">
                  {t("walkthrough.stepLabel")} 3
                </span>
                <h3 className="text-xl sm:text-[30px] lg:text-[44px] text-[#FFFFFF] font-bold mb-3 sm:mb-6 leading-tight">
                  {t("walkthrough.step3.title")}
                </h3>
                <p className="text-[#FFFFFF]/90 text-sm sm:text-[20px] lg:text-[24px] leading-relaxed">
                  {t("walkthrough.step3.description")}
                </p>
              </div>
              {/* Image Side (Right) */}
              <div className="w-full lg:w-[55%] aspect-video rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10 bg-black/5">
                <img src={step3Img} alt="Step 3" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STAGE 4: INTERVIEW MODES OVERVIEW
      ════════════════════════════════════════════════════ */}
      <section id="interview-modes" className="w-full relative z-40 -mt-[10vh] lg:-mt-[20vh] pb-16 sm:pb-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center">
            <motion.h2 
              className="text-[#23242D] font-bold text-2xl sm:text-3xl md:text-[44px] tracking-tight max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {t("modes.title").split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block mr-1.5 md:mr-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p 
              className="text-[#0071F9] font-sans font-medium text-base sm:text-lg md:text-xl mt-3 sm:mt-4 mb-8 sm:mb-12 max-w-3xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
            >
              {t("modes.subtitle").split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block mr-1 md:mr-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>
          </div>

          {/* Folder Tab UI */}
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Tab Navigation (Responsive padding & text for mobile) */}
            <div className="flex justify-center items-end relative z-10 w-full max-w-full sm:max-w-[95%] lg:max-w-[1200px] mx-auto px-2 sm:px-0">
              <div 
                className={`px-3 sm:px-10 py-2.5 sm:py-4 font-bold text-xs sm:text-base md:text-lg rounded-t-xl sm:rounded-t-[32px] cursor-pointer transition-colors text-center ${activeTab === 'interactive' ? 'bg-[#0071F9] text-[#FFFFFF] relative z-10 shadow-md' : 'bg-[#F3F4F6] text-[#23242D] font-semibold hover:bg-[#E5E7EB] relative z-0 -mx-1.5 sm:-mx-4'}`}
                onClick={() => setActiveTab('interactive')}
              >
                {t("modes.interactiveTab")}
              </div>
              <div 
                className={`px-3 sm:px-10 py-2.5 sm:py-4 font-bold text-xs sm:text-base md:text-lg rounded-t-xl sm:rounded-t-[32px] cursor-pointer transition-colors text-center ${activeTab === 'pressure' ? 'bg-[#0071F9] text-[#FFFFFF] relative z-10 shadow-md' : 'bg-[#F3F4F6] text-[#23242D] font-semibold hover:bg-[#E5E7EB] relative z-0 -mx-1.5 sm:-mx-4'}`}
                onClick={() => setActiveTab('pressure')}
              >
                {t("modes.pressureTab")}
              </div>
            </div>
            
            {/* Main Container */}
            <div className="bg-[#0071F9] w-full max-w-full sm:max-w-[95%] lg:max-w-[1200px] mx-auto p-4 sm:p-6 md:p-8 rounded-3xl sm:rounded-[48px] shadow-2xl relative z-10 -mt-px">
              <h3 className="text-[#FFFFFF] text-lg sm:text-2xl md:text-[30px] font-bold text-center mb-4 sm:mb-6">
                {t("modes.featureHeadline")}
              </h3>
              
              <div className="bg-[#FFFFFF] w-full rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-10 overflow-hidden min-h-[280px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'interactive' && (
                    <motion.div
                      key="interactive"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-center w-full"
                    >
                      <img src={interactiveModeImg} alt={t("modes.interactive.title")} className="w-full lg:w-[45%] h-auto max-h-[260px] sm:max-h-[450px] object-contain rounded-xl sm:rounded-[24px] border border-[#F3F4F6] shadow-sm" loading="lazy" />
                      <div className="w-full lg:w-[55%] flex flex-col justify-center">
                        <h4 className="text-[#23242D] text-lg sm:text-2xl md:text-[30px] font-bold mb-3 sm:mb-4">
                          {t("modes.interactive.title")}
                        </h4>
                        <p className="text-[#23242D]/80 text-sm sm:text-lg md:text-[20px] leading-relaxed">
                          {t("modes.interactive.description")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'pressure' && (
                    <motion.div
                      key="pressure"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-center w-full"
                    >
                      <img src={pressureModeImg} alt={t("modes.pressure.title")} className="w-full lg:w-[45%] h-auto max-h-[260px] sm:max-h-[450px] object-contain rounded-xl sm:rounded-[24px] border border-[#F3F4F6] shadow-sm" loading="lazy" />
                      <div className="w-full lg:w-[55%] flex flex-col justify-center">
                        <h4 className="text-[#23242D] text-lg sm:text-2xl md:text-[30px] font-bold mb-3 sm:mb-4">
                          {t("modes.pressure.title")}
                        </h4>
                        <p className="text-[#23242D]/80 text-sm sm:text-lg md:text-[20px] leading-relaxed">
                          {t("modes.pressure.description")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STAGE 5: SUCCESS STORIES MARQUEE
      ════════════════════════════════════════════════════ */}
      <section id="success-stories" className="pt-12 lg:pt-16 pb-16 sm:pb-24 bg-[#FFFFFF] overflow-hidden relative">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
        </style>
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="text-center flex flex-col items-center">
            <motion.h2 
              className="text-[#0071F9] font-black text-3xl sm:text-5xl md:text-[64px] tracking-tight mb-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {t("stats.count").split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block mr-2 md:mr-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p 
              className="text-[#23242D] text-lg sm:text-xl md:text-2xl font-semibold"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
            >
              {t("stats.label").split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block mr-1.5 md:mr-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.p>
          </div>
        </div>

        {/* Marquee Tracks */}
        <div className="relative flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-[100vw]">
          
          {/* Top Track */}
          <div className="flex w-max animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] will-change-transform">
            {[...row1, ...row1].map((student, idx) => (
              <div key={`row1-${idx}`} className="relative w-[280px] sm:w-[380px] md:w-[420px] h-[180px] sm:h-[240px] md:h-[280px] shrink-0 rounded-2xl sm:rounded-[32px] overflow-hidden mx-2 sm:mx-4 shadow-xl hover:shadow-[0_0_20px_rgba(0,113,249,0.6)] transition-all duration-300 hover:-translate-y-1">
                <img src={student.img} alt={student.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 flex items-end justify-between gap-2">
                  <div className="bg-[#FFFFFF] text-[#23242D] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-base font-bold truncate flex-1 shadow-md text-center">
                    {student.name}
                  </div>
                  <div className="bg-[#0071F9] text-[#FFFFFF] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-base font-bold shrink-0 shadow-md whitespace-nowrap">
                    {student.score} {student.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Track (Staggered offset) */}
          <div className="flex w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] will-change-transform ml-[80px] sm:ml-[150px] md:ml-[200px]">
            {[...row2, ...row2].map((student, idx) => (
              <div key={`row2-${idx}`} className="relative w-[280px] sm:w-[380px] md:w-[420px] h-[180px] sm:h-[240px] md:h-[280px] shrink-0 rounded-2xl sm:rounded-[32px] overflow-hidden mx-2 sm:mx-4 shadow-xl hover:shadow-[0_0_20px_rgba(0,113,249,0.6)] transition-all duration-300 hover:-translate-y-1">
                <img src={student.img} alt={student.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 flex items-end justify-between gap-2">
                  <div className="bg-[#FFFFFF] text-[#23242D] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-base font-bold truncate flex-1 shadow-md text-center">
                    {student.name}
                  </div>
                  <div className="bg-[#0071F9] text-[#FFFFFF] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-base font-bold shrink-0 shadow-md whitespace-nowrap">
                    {student.score} {student.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STAGE 6: USER TESTIMONIALS
      ════════════════════════════════════════════════════ */}
      <section id="user-testimonials" className="bg-[#FFFFFF] w-full py-12 sm:py-16 md:py-24 px-4 sm:px-6">
        <style>
          {`
            @keyframes vertical-marquee {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
          `}
        </style>
        <div className="w-full max-w-7xl mx-auto p-6 sm:p-12 md:p-16 bg-[#0071F9] rounded-3xl sm:rounded-[48px] text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
            
            {/* Left Column (Static Text) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
              <h2 className="font-black text-2xl sm:text-4xl md:text-[44px] leading-tight mb-4 sm:mb-6 text-[#FFFFFF]">
                {t("testimonials.title")}
              </h2>
              <p className="text-white/80 text-base sm:text-lg md:text-xl font-medium">
                {t("testimonials.subtitle")}
              </p>
            </div>

            {/* Right Column (Vertical Marquees) */}
            <div className="col-span-1 lg:col-span-7 relative h-[420px] sm:h-[500px] md:h-[600px] overflow-hidden flex gap-4 sm:gap-6 justify-center" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
              
              {/* Track 1 */}
              <div className="flex flex-col gap-4 sm:gap-6 animate-[vertical-marquee_15s_linear_infinite] hover:[animation-play-state:paused] will-change-transform">
                {[...column1, ...column1].map((review, idx) => (
                  <div key={`col1-${idx}`} className="bg-[#FFFFFF] rounded-2xl sm:rounded-[24px] p-4 sm:p-6 text-[#23242D] w-full max-w-[280px] sm:max-w-[320px] shrink-0 shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-[#0071F9] text-lg sm:text-xl shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base">{review.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{review.role}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base mt-3 sm:mt-4 line-clamp-5">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-1 mt-3 sm:mt-4">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Track 2 */}
              <div className="flex flex-col gap-4 sm:gap-6 animate-[vertical-marquee_20s_linear_infinite] hover:[animation-play-state:paused] will-change-transform mt-12 sm:mt-16 md:mt-24">
                {[...column2, ...column2].map((review, idx) => (
                  <div key={`col2-${idx}`} className="bg-[#FFFFFF] rounded-2xl sm:rounded-[24px] p-4 sm:p-6 text-[#23242D] w-full max-w-[280px] sm:max-w-[320px] shrink-0 shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-[#0071F9] text-lg sm:text-xl shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base">{review.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{review.role}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base mt-3 sm:mt-4 line-clamp-5">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-1 mt-3 sm:mt-4">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STAGE 7: PARTNERS & MENTORS SHOUTOUT
      ════════════════════════════════════════════════════ */}
      <section id="partners-mentors" className="bg-[#FFFFFF] pt-12 sm:pt-16 md:pt-24 pb-8 md:pb-12 w-full flex flex-col items-center overflow-hidden">
        <motion.h2
          className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-[#0A2558] text-center mb-8 sm:mb-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {t("partners.title")}
        </motion.h2>

        <style>
          {`
            @keyframes logo-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
        </style>

        <div className="overflow-hidden flex w-full relative">
          <div className="flex w-max items-center gap-4 sm:gap-6 md:gap-8 animate-[logo-marquee_30s_linear_infinite] will-change-transform">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 sm:gap-6 md:gap-8 shrink-0">
                <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl flex items-center justify-center shrink-0 w-[140px] h-[70px] sm:w-[180px] sm:h-[90px] md:w-[220px] md:h-[110px]">
                  <img src={LogoCMC} alt="CMC University" className="h-8 sm:h-12 md:h-16 w-auto object-contain" loading="lazy" />
                </div>
                <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl flex items-center justify-center shrink-0 w-[140px] h-[70px] sm:w-[180px] sm:h-[90px] md:w-[220px] md:h-[110px]">
                  <img src={LogoCODEGYM} alt="CodeGym" className="h-8 sm:h-12 md:h-16 w-auto object-contain" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA BAND — Floating Card Design
      ════════════════════════════════════════════════════ */}
      <section id="cta-band" className="relative py-8 md:py-12 px-4 bg-[#FFFFFF]">
        <div className="bg-gradient-to-r from-[#0A2558] to-[#1e3a8a] rounded-3xl shadow-2xl py-8 sm:py-12 px-6 md:px-12 max-w-5xl mx-auto text-center relative overflow-hidden">
          <div
            className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full opacity-30 blur-[60px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
          />
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 relative z-10">
            {t("cta.title")}
          </h2>
          <p className="font-sans text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 relative z-10">
            {t("cta.subtitle")}
          </p>
          <button
            id="cta-button"
            onClick={handleCTA}
            className="group font-sans font-bold text-[#0A2558] bg-white h-11 sm:h-12 px-6 sm:px-8 rounded-full transition-colors duration-300 hover:bg-gray-100 cursor-pointer border-none inline-flex items-center justify-center gap-2 relative z-10 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 active:scale-95 text-sm sm:text-base"
          >
            {t("cta.button")}
            <span className="inline-flex transition-transform group-hover:translate-x-0.5">
              <IconArrowRight />
            </span>
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER — Dark Theme
      ════════════════════════════════════════════════════ */}
      <footer id="footer" className="py-12 sm:py-16 px-6 bg-[#0A2558] font-sans">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2">
              <div className="flex items-center mb-3" style={{ gap: "var(--hp-space-3)" }}>
                <img src={logoImg} alt="Interview with AI Logo" className="h-6 w-auto object-contain brightness-0 invert" />
                <h3 className="font-sans text-lg sm:text-xl font-bold text-white">{t("footer.brand")}</h3>
              </div>
              <p className="font-sans text-sm sm:text-[15px] leading-relaxed text-gray-400 max-w-sm">
                {t("footer.description")}
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {t("footer.product")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li><a href="#features" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.features")}</a></li>
                <li><Link to="/pricing" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.pricing")}</Link></li>
                <li><a href="#" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.changelog")}</a></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {t("footer.company")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li><Link to="/introduction" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.about")}</Link></li>
                <li><a href="#" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.blog")}</a></li>
                <li><a href="#" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.careers")}</a></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {t("footer.legal")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li><Link to="/privacy-policy" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.privacy")}</Link></li>
                <li><Link to="/terms-of-service" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.terms")}</Link></li>
                <li><a href="#" className="font-sans text-sm sm:text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.cookies")}</a></li>
              </ul>
            </div>
          </div>
          {/* Copyright */}
          <div className="pt-8 border-t border-gray-700">
            <p className="font-sans text-xs sm:text-sm text-gray-400 text-center">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
