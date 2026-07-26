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

const reviews = [
  { id: 1, name: 'Hoàng Nguyễn', role: 'Frontend', text: 'Luyện tập với AI của hệ thống giúp mình bớt run hẳn. Các câu hỏi bám sát thực tế, AI phản hồi cực kỳ chi tiết. Mình đã pass phỏng vấn ngay sau 2 tuần ôn luyện!', stars: 5 },
  { id: 2, name: 'Lưu Xuân Trường', role: 'Backend', text: 'Chế độ phỏng vấn áp lực thực sự hardcore! AI liên tục ngắt lời và vặn vẹo kiến thức system design. Nhờ vậy mà mình tự tin hơn hẳn khi đối mặt với Technical Lead.', stars: 5 },
  { id: 3, name: 'Trần Mỹ Linh', role: 'Tester', text: 'Hệ thống đánh giá rất sát sao, chỉ ra chính xác lỗ hổng kiến thức của mình về Automation Test. Trải nghiệm rất đáng giá.', stars: 5 },
  { id: 4, name: 'Phương Uyên', role: 'Data Analyst', text: 'Mình là người hướng nội nên rất ngại phỏng vấn (mock interview) với người thật. IAP tạo ra môi trường an toàn để mình thoải mái vấp ngáp và sửa sai.', stars: 5 },
  { id: 5, name: 'Đức Phát', role: 'Frontend', text: 'Giao diện thân thiện, AI hỏi mượt như người thật. Phần report sau phỏng vấn giúp mình biết cần cải thiện thuật toán React nào. Quá tuyệt vời!', stars: 5 },
  { id: 6, name: 'Quốc Bảo', role: 'Backend', text: 'Cảm ơn IAP, nhờ những câu hỏi xoáy vào database optimization của AI mà mình đã không bị bí ý tưởng khi phỏng vấn công ty hiện tại.', stars: 5 },
  { id: 7, name: 'Hải Yến', role: 'Data Analyst', text: 'Mình đánh giá cao việc AI có thể hiểu và nhận xét chính xác các luồng suy nghĩ khi giải quyết bài toán data. Chấm 10/10.', stars: 5 },
  { id: 8, name: 'Thanh Hùng', role: 'Tester', text: 'Rất tiện lợi, có thể luyện tập bất cứ lúc nào. Từ làm quen cơ bản đến thực chiến đều có đủ.', stars: 5 },
];
const column1 = reviews.filter((_, i) => i % 2 === 0);
const column2 = reviews.filter((_, i) => i % 2 !== 0);

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

  /*
    Scroll-aware nav:
    - While on the deep-blue Hero (scrollY < 70% of viewport height):
      nav is TRANSPARENT with white text, overlaying the blue hero.
    - After scrolling past the hero:
      nav becomes solid canvas/off-white with ink text.
  */
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
      icon: <Database className="w-16 h-16 text-white mb-6 drop-shadow-md" />,
      title: "Hệ thống Câu hỏi Đa chiều",
      backContent: "AI tự động sinh câu hỏi bám sát CV theo 3 trục: Kỹ năng chuyên môn (Technical), Xử lý tình huống (Situational) và Hành vi thực tế (Behavioral). Kèm giới hạn thời gian và Gợi ý thông minh.",
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      icon: <MessageCircle className="w-16 h-16 text-white mb-6 drop-shadow-md" />,
      title: "2 Chế độ Thực chiến",
      backContent: "Lựa chọn đối mặt với Technical Lead \"khó tính\" (Áp lực cao) hoặc trải nghiệm \"Hỏi xoáy đáp xoay\" liên tục từ 2-4 lượt để khai phá tận cùng tư duy logic của bạn (Tương tác).",
      gradient: "from-indigo-600 to-purple-600"
    },
    {
      icon: <ShieldCheck className="w-16 h-16 text-white mb-6 drop-shadow-md" />,
      title: "Chấm điểm Chống Gian lận",
      backContent: "Tích hợp cơ chế Anti-Cheat. Chấm điểm khắt khe dựa trên 3 tiêu chí: Độ chính xác chuyên môn, Tư duy trình bày mạch lạc, và Độ sâu trọng tâm cốt lõi.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Radar className="w-16 h-16 text-white mb-6 drop-shadow-md" />,
      title: "Báo cáo & Trợ lý Ảo",
      backContent: "Nhận báo cáo năng lực 5 trục chuyên sâu chỉ rõ Điểm mạnh/Yếu. Kèm theo Trợ lý Ảo 24/7 luôn sẵn sàng hỗ trợ bạn thiết lập phòng thi và giải quyết sự cố kỹ thuật.",
      gradient: "from-[#0B2A6B] to-blue-700"
    }
  ];



  return (
    <div className="min-h-screen">
      {/* ════════════════════════════════════════════════════
          FIXED NAVIGATION — Scroll-aware color transition
          On hero (blue): transparent bg, white text
          Off hero (canvas): solid bg, ink text
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
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center no-underline"
            style={{ gap: "var(--hp-space-3)" }}
          >
            <img
              src={logoImg}
              alt="Interview with AI Logo"
              className="h-8 w-auto object-contain transition-all duration-300"
              style={{ filter: isOnHero ? "brightness(0) invert(1)" : "none" }}
            />
            <span
              className="font-display text-xl font-light tracking-tight transition-colors duration-300"
              style={{ color: isOnHero ? "white" : "var(--color-ink)" }}
            >
              {t("nav.brand")}
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {(["nav.features", "nav.howItWorks"] as const).map((key, i) => (
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
            ))}

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

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden bg-transparent border-none cursor-pointer p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <IconClose white={isOnHero} /> : <IconMenu white={isOnHero} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden absolute top-16 left-0 right-0 border-b z-40"
            style={
              isOnHero
                ? { backgroundColor: "rgba(0,60,200,0.95)", borderColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(16px)" }
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
          HERO BAND — Ultimate Prep-Style Immersive Redesign
          ──────────────────────────────────────────────────
          Design philosophy:
          • Deep electric blue gradient
          • Massive typography with inline AI Mascot
          • Perfectly centered concentric ripples from the bottom
          • Glowing white CTA button
      ════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="w-full flex flex-col justify-between items-center relative overflow-hidden bg-gradient-to-b from-[#0052FF] to-[#0038BC] min-h-[100dvh]"
      >
        <div className="w-full h-16 pointer-events-none" aria-hidden="true" />
        {/* ── Concentric Ripple Effect ── */}
        <div className="absolute inset-x-0 bottom-[-15vh] flex justify-center items-center pointer-events-none" aria-hidden="true">
          <div className="absolute w-[40vw] min-w-[400px] aspect-square rounded-full bg-white/5" />
          <div className="absolute w-[65vw] min-w-[700px] aspect-square rounded-full bg-white/5" />
          <div className="absolute w-[100vw] min-w-[1000px] aspect-square rounded-full bg-white/5" />
          <div className="absolute w-[140vw] min-w-[1400px] aspect-square rounded-full bg-white/5" />
        </div>

        {/* ── Central Content Block ── */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-4 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* MASSIVE TYPOGRAPHY */}
          <h1 className="flex flex-col items-center justify-center font-sans font-extrabold tracking-tight leading-[1.1] text-6xl md:text-[80px] text-center w-full">
            {/* Line 1 */}
            <span className="text-blue-100 block mb-2">
              Nền tảng Luyện
            </span>
            
            {/* Line 2 with INLINE MASCOT */}
            <span className="block relative whitespace-nowrap">
              <span className="inline-flex items-center align-middle mr-4 md:mr-6 bg-white/20 backdrop-blur-xl border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-full px-4 md:px-5 py-2 gap-2 text-white/90">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-300" />
                <motion.div
                  animate={{ rotate: [0, 15, -10, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="origin-bottom"
                >
                  <Bot className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                </motion.div>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                Phỏng vấn IT
              </span>
            </span>

            {/* Line 3 */}
            <span className="text-white block mt-2">
              thông minh
            </span>
          </h1>
        </motion.div>

        {/* ── Centerpiece CTA ── */}
        <motion.div 
          className="relative pb-12 flex flex-col items-center z-20 w-full px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <button
            id="hero-cta-primary"
            onClick={() =>
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
            }
            className="font-sans font-extrabold text-xl md:text-2xl tracking-wide uppercase px-12 py-5 rounded-full text-[#0051F9] bg-white shadow-[0_0_50px_rgba(255,255,255,0.6)] hover:scale-105 transition-all inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 active:scale-95"
          >
            KHÁM PHÁ NGAY
          </button>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES SECTION — 3D Flip Cards (GIAI ĐOẠN 2)
      ════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 
            className="text-center mb-16 font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0A2558]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {"Trải nghiệm Phỏng vấn IT Toàn diện".split(" ").map((word, idx) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features3D.map((feature, index) => (
              <div key={index} className="group h-[340px] w-full [perspective:1000px] cursor-pointer">
                <div className="relative h-full w-full rounded-2xl transition-all duration-[1200ms] ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-xl">
                  {/* Front Face */}
                  <div className={`absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] bg-gradient-to-br ${feature.gradient} flex flex-col items-start justify-between p-6 text-white`}>
                    <div>
                      {feature.icon}
                      <h3 className="font-sans font-bold text-2xl leading-snug">
                        {feature.title}
                      </h3>
                    </div>
                    <div className="self-end w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <RefreshCcw className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {/* Back Face */}
                  <div className="absolute inset-0 h-full w-full rounded-2xl bg-[#0A1A3A] text-white [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center p-6 text-left">
                    <h4 className="font-sans font-bold text-xl mb-4 text-blue-200">
                      {feature.title}
                    </h4>
                    <p className="font-sans text-[16px] leading-relaxed text-blue-50/90">
                      {feature.backContent}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS — STAGE 3 (GIANT WALKTHROUGH CARDS)
      ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-10 flex flex-col items-center">
            <motion.h2 
              className="text-[#0A2558] font-sans font-bold text-3xl md:text-[44px] tracking-tight max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {"Tối ưu hành trình luyện tập phỏng vấn với 3 bước dễ dàng".split(" ").map((word, idx) => (
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
              className="text-[#0071F9] font-sans font-medium text-lg md:text-xl mt-4 mb-10 max-w-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
            >
              {"IAP sẽ luôn đồng hành cùng bạn xuyên suốt hành trình khổ luyện cho đến ngày 'có job đầu tiên'".split(" ").map((word, idx) => (
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

          {/* Cards Container with extra padding for sticky stacking */}
          <div className="w-full max-w-[95%] lg:max-w-[1440px] mx-auto relative pb-[20vh]">
            
            {/* ── GIANT CARD 1 ── */}
            <div className="sticky top-[100px] z-10 bg-gradient-to-br from-[#23242D] to-[#0071F9] flex flex-col lg:flex-row gap-16 lg:gap-20 items-center w-full rounded-[48px] p-8 md:p-12 lg:p-24 shadow-2xl min-h-[75vh]">
              {/* Text Side (Left) */}
              <div className="flex flex-col justify-center w-full lg:w-[45%]">
                <span className="text-[#A4CAFE]/30 text-6xl md:text-7xl font-black mb-6 block">Bước 1</span>
                <h3 className="text-[30px] lg:text-[44px] text-[#FFFFFF] font-bold mb-6 leading-tight">
                  Thiết kế lộ trình phỏng vấn cá nhân hóa
                </h3>
                <p className="text-[#FFFFFF]/90 text-[20px] lg:text-[24px] leading-relaxed">
                  Hệ thống quét CV, cho phép bạn tự do lựa chọn vị trí (Frontend, Backend...) và độ khó. Lộ trình được 'may đo' theo đúng thông số riêng của bạn.
                </p>
              </div>
              {/* Image Side (Right) */}
              <div className="w-full lg:w-[55%] aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/10 bg-black/5">
                <img src={step1Img} alt="Step 1" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            </div>

            {/* ── GIANT CARD 2 ── */}
            <div className="sticky top-[140px] z-20 bg-gradient-to-br from-[#23242D] to-[#0071F9] flex flex-col lg:flex-row-reverse gap-16 lg:gap-20 items-center shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[60vh] w-full rounded-[48px] p-8 md:p-12 lg:p-24 min-h-[75vh]">
              {/* Text Side (Right) */}
              <div className="flex flex-col justify-center w-full lg:w-[45%]">
                <span className="text-[#A4CAFE]/30 text-6xl md:text-7xl font-black mb-6 block">Bước 2</span>
                <h3 className="text-[30px] lg:text-[44px] text-[#FFFFFF] font-bold mb-6 leading-tight">
                  Đối mặt với 'Trưởng phòng Kỹ thuật' AI
                </h3>
                <p className="text-[#FFFFFF]/90 text-[20px] lg:text-[24px] leading-relaxed">
                  Trải nghiệm áp lực phỏng vấn thật. AI liên tục đặt câu hỏi đào sâu, phản biện qua cả Text và Voice theo sát tiến trình câu trả lời của bạn.
                </p>
              </div>
              {/* Image Side (Left) */}
              <div className="w-full lg:w-[55%] aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/10 bg-black/5">
                <img src={step2Img} alt="Step 2" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            </div>

            {/* ── GIANT CARD 3 ── */}
            <div className="sticky top-[180px] z-30 bg-gradient-to-br from-[#23242D] to-[#0071F9] flex flex-col lg:flex-row gap-16 lg:gap-20 items-center shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[60vh] w-full rounded-[48px] p-8 md:p-12 lg:p-24 min-h-[75vh]">
              {/* Text Side (Left) */}
              <div className="flex flex-col justify-center w-full lg:w-[45%]">
                <span className="text-[#A4CAFE]/30 text-6xl md:text-7xl font-black mb-6 block">Bước 3</span>
                <h3 className="text-[30px] lg:text-[44px] text-[#FFFFFF] font-bold mb-6 leading-tight">
                  Học và theo dõi tiến bộ toàn diện
                </h3>
                <p className="text-[#FFFFFF]/90 text-[20px] lg:text-[24px] leading-relaxed">
                  Nhận báo cáo 360 độ ngay khi kết thúc. Hệ thống chấm chữa toàn diện, phân tích điểm yếu và theo dõi sự tiến bộ của bạn qua từng ngày.
                </p>
              </div>
              {/* Image Side (Right) */}
              <div className="w-full lg:w-[55%] aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/10 bg-black/5">
                <img src={step3Img} alt="Step 3" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STAGE 4: INTERVIEW MODES OVERVIEW
      ════════════════════════════════════════════════════ */}
      <section id="interview-modes" className="w-full relative z-40 -mt-[15vh] lg:-mt-[20vh] pb-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12 flex flex-col items-center">
            <motion.h2 
              className="text-[#23242D] font-bold text-3xl md:text-[44px] tracking-tight max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {"Linh hoạt lựa chọn chế độ luyện tập".split(" ").map((word, idx) => (
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
              className="text-[#0071F9] font-sans font-medium text-lg md:text-xl mt-4 mb-12 max-w-3xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
            >
              {"Từ làm quen cơ bản đến thực chiến áp lực cao, IT-IAP cung cấp môi trường hoàn hảo để bạn rèn luyện bản lĩnh.".split(" ").map((word, idx) => (
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

          {/* Folder Tab UI */}
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Tab Navigation */}
            <div className="flex justify-center items-end relative z-10 w-full max-w-[95%] lg:max-w-[1200px] mx-auto">
              <div 
                className={`px-10 py-4 font-bold text-lg rounded-t-[32px] cursor-pointer transition-colors ${activeTab === 'interactive' ? 'bg-[#0071F9] text-[#FFFFFF] relative z-10' : 'bg-[#F3F4F6] text-[#23242D] font-semibold hover:bg-[#E5E7EB] relative z-0 -mx-4'}`}
                onClick={() => setActiveTab('interactive')}
              >
                Phỏng vấn Tương tác
              </div>
              <div 
                className={`px-10 py-4 font-bold text-lg rounded-t-[32px] cursor-pointer transition-colors ${activeTab === 'pressure' ? 'bg-[#0071F9] text-[#FFFFFF] relative z-10' : 'bg-[#F3F4F6] text-[#23242D] font-semibold hover:bg-[#E5E7EB] relative z-0 -mx-4'}`}
                onClick={() => setActiveTab('pressure')}
              >
                Phỏng vấn Áp lực
              </div>
            </div>
            
            {/* Main Container */}
            <div className="bg-[#0071F9] w-full max-w-[95%] lg:max-w-[1200px] mx-auto p-6 md:p-8 rounded-[48px] shadow-2xl relative z-10 -mt-px">
              <h3 className="text-[#FFFFFF] text-2xl md:text-[30px] font-bold text-center mb-6">Tính năng nổi bật của chế độ</h3>
              
              <div className="bg-[#FFFFFF] w-full rounded-[32px] p-6 md:p-10 overflow-hidden min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'interactive' && (
                    <motion.div
                      key="interactive"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col lg:flex-row gap-10 items-center w-full"
                    >
                      <img src={interactiveModeImg} alt="Phỏng vấn Tương tác" className="w-full lg:w-[45%] h-auto max-h-[350px] md:max-h-[450px] object-contain rounded-[24px] border border-[#F3F4F6] shadow-sm" loading="lazy" />
                      <div className="w-full lg:w-[55%] flex flex-col justify-center">
                        <h4 className="text-[#23242D] text-[30px] font-bold mb-4">Phỏng vấn Tương tác Cơ bản</h4>
                        <p className="text-[#23242D]/80 text-[20px] leading-relaxed">
                          Chế độ hoàn hảo để làm quen với nhịp độ phỏng vấn. AI sẽ đưa ra câu hỏi và kiên nhẫn chờ đợi, cho phép bạn thoải mái suy nghĩ và trau chuốt câu trả lời. Đặc biệt phù hợp cho giai đoạn đầu ôn luyện, giúp bạn củng cố kiến thức mà không bị áp lực thời gian.
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
                      className="flex flex-col lg:flex-row gap-10 items-center w-full"
                    >
                      <img src={pressureModeImg} alt="Phỏng vấn Áp lực" className="w-full lg:w-[45%] h-auto max-h-[350px] md:max-h-[450px] object-contain rounded-[24px] border border-[#F3F4F6] shadow-sm" loading="lazy" />
                      <div className="w-full lg:w-[55%] flex flex-col justify-center">
                        <h4 className="text-[#23242D] text-[30px] font-bold mb-4">Phỏng vấn Áp lực Thực chiến</h4>
                        <p className="text-[#23242D]/80 text-[20px] leading-relaxed">
                          Mô phỏng 100% sức ép từ các vòng phỏng vấn kỹ thuật cam go nhất. Giới hạn thời gian đếm ngược, AI liên tục ngắt lời, phản biện gắt gao và đào sâu vào các lỗ hổng trong câu trả lời của bạn. Vượt qua chế độ này, bạn sẽ sở hữu tâm lý thép trước bất kỳ nhà tuyển dụng nào.
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
      <section id="success-stories" className="pt-12 lg:pt-16 pb-24 bg-[#FFFFFF] overflow-hidden relative">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
        </style>
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center flex flex-col items-center">
            <motion.h2 
              className="text-[#0071F9] font-black text-5xl md:text-[64px] tracking-tight mb-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {"3.600+ học viên".split(" ").map((word, idx) => (
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
              className="text-[#23242D] text-xl md:text-2xl font-semibold"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
            >
              {"đậu phỏng vấn sau khi luyện tập tại IAP".split(" ").map((word, idx) => (
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
        <div className="relative flex flex-col gap-6 lg:gap-8 w-full max-w-[100vw]">
          
          {/* Top Track */}
          <div className="flex w-max animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] will-change-transform">
            {[...row1, ...row1].map((student, idx) => (
              <div key={`row1-${idx}`} className="relative w-[380px] md:w-[420px] h-[240px] md:h-[280px] shrink-0 rounded-[32px] overflow-hidden mx-3 lg:mx-4 shadow-xl hover:shadow-[0_0_20px_rgba(0,113,249,0.6)] transition-all duration-300 hover:-translate-y-1">
                <img src={student.img} alt={student.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 inset-x-4 flex items-end justify-between gap-2">
                  <div className="bg-[#FFFFFF] text-[#23242D] px-4 py-2 rounded-full text-sm md:text-base font-bold truncate flex-1 shadow-md text-center">
                    {student.name}
                  </div>
                  <div className="bg-[#0071F9] text-[#FFFFFF] px-4 py-2 rounded-full text-sm md:text-base font-bold shrink-0 shadow-md whitespace-nowrap">
                    {student.score} {student.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Track (Staggered offset) */}
          <div className="flex w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] will-change-transform ml-[150px] md:ml-[200px]">
            {[...row2, ...row2].map((student, idx) => (
              <div key={`row2-${idx}`} className="relative w-[380px] md:w-[420px] h-[240px] md:h-[280px] shrink-0 rounded-[32px] overflow-hidden mx-3 lg:mx-4 shadow-xl hover:shadow-[0_0_20px_rgba(0,113,249,0.6)] transition-all duration-300 hover:-translate-y-1">
                <img src={student.img} alt={student.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 inset-x-4 flex items-end justify-between gap-2">
                  <div className="bg-[#FFFFFF] text-[#23242D] px-4 py-2 rounded-full text-sm md:text-base font-bold truncate flex-1 shadow-md text-center">
                    {student.name}
                  </div>
                  <div className="bg-[#0071F9] text-[#FFFFFF] px-4 py-2 rounded-full text-sm md:text-base font-bold shrink-0 shadow-md whitespace-nowrap">
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
      <section id="user-testimonials" className="bg-[#FFFFFF] w-full py-16 md:py-24">
        <style>
          {`
            @keyframes vertical-marquee {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
          `}
        </style>
        <div className="w-full max-w-7xl mx-auto p-8 md:p-16 bg-[#0071F9] rounded-[32px] md:rounded-[48px] text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Left Column (Static Text) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
              <h2 className="font-black text-4xl md:text-[44px] leading-tight mb-6 text-[#FFFFFF]">
                Được đánh giá cao bởi hàng nghìn học viên đã và đang luyện tập
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-medium">
                Đây chính là sự ghi nhận tuyệt vời để IAP có động lực cải tiến không ngừng và đem đến trải nghiệm luyện tập để có được công việc đầu tiên
              </p>
            </div>

            {/* Right Column (Vertical Marquees) */}
            <div className="col-span-1 lg:col-span-7 relative h-[500px] md:h-[600px] overflow-hidden flex gap-6 justify-center" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
              
              {/* Track 1 */}
              <div className="flex flex-col gap-6 animate-[vertical-marquee_15s_linear_infinite] hover:[animation-play-state:paused] will-change-transform">
                {[...column1, ...column1].map((review, idx) => (
                  <div key={`col1-${idx}`} className="bg-[#FFFFFF] rounded-[24px] p-6 text-[#23242D] w-full max-w-[320px] shrink-0 shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-[#0071F9] text-xl shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.role}</p>
                      </div>
                    </div>
                    <p className="text-sm md:text-base mt-4 line-clamp-5">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-1 mt-4">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Track 2 */}
              <div className="flex flex-col gap-6 animate-[vertical-marquee_20s_linear_infinite] hover:[animation-play-state:paused] will-change-transform mt-16 md:mt-24">
                {[...column2, ...column2].map((review, idx) => (
                  <div key={`col2-${idx}`} className="bg-[#FFFFFF] rounded-[24px] p-6 text-[#23242D] w-full max-w-[320px] shrink-0 shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-[#0071F9] text-xl shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.role}</p>
                      </div>
                    </div>
                    <p className="text-sm md:text-base mt-4 line-clamp-5">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-1 mt-4">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
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
      <section id="partners-mentors" className="bg-[#FFFFFF] pt-16 md:pt-24 pb-8 md:pb-12 w-full flex flex-col items-center overflow-hidden">
        <motion.h2
          className="font-sans text-2xl md:text-3xl font-bold text-[#0A2558] text-center mb-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Được đồng hành bởi Giảng viên hướng dẫn CMC UNIVERSITY và Mentor CODEGYM
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
          <div className="flex w-max items-center gap-6 md:gap-8 animate-[logo-marquee_30s_linear_infinite] will-change-transform">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 md:gap-8 shrink-0">
                <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl flex items-center justify-center shrink-0 w-[180px] h-[90px] md:w-[220px] md:h-[110px]">
                  <img src={LogoCMC} alt="CMC University" className="h-12 md:h-16 w-auto object-contain" loading="lazy" />
                </div>
                <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl flex items-center justify-center shrink-0 w-[180px] h-[90px] md:w-[220px] md:h-[110px]">
                  <img src={LogoCODEGYM} alt="CodeGym" className="h-12 md:h-16 w-auto object-contain" loading="lazy" />
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
        <div className="bg-gradient-to-r from-[#0A2558] to-[#1e3a8a] rounded-3xl shadow-2xl py-12 px-6 md:px-12 max-w-5xl mx-auto text-center relative overflow-hidden">
          <div
            className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full opacity-30 blur-[60px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
          />
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
            {t("cta.title")}
          </h2>
          <p className="font-sans text-lg text-blue-100 mb-8 relative z-10">
            {t("cta.subtitle")}
          </p>
          <button
            id="cta-button"
            onClick={handleCTA}
            className="group font-sans font-bold text-[#0A2558] bg-white h-12 px-8 rounded-full transition-colors duration-300 hover:bg-gray-100 cursor-pointer border-none inline-flex items-center justify-center gap-2 relative z-10 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 active:scale-95"
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
      <footer id="footer" className="py-16 px-6 bg-[#0A2558] font-sans">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2">
              <div className="flex items-center mb-3" style={{ gap: "var(--hp-space-3)" }}>
                <img src={logoImg} alt="Interview with AI Logo" className="h-6 w-auto object-contain brightness-0 invert" />
                <h3 className="font-sans text-xl font-bold text-white">{t("footer.brand")}</h3>
              </div>
              <p className="font-sans text-[15px] leading-relaxed text-gray-400 max-w-sm">
                {t("footer.description")}
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {t("footer.product")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li><a href="#features" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.features")}</a></li>
                <li><a href="#" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.pricing")}</a></li>
                <li><a href="#" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.changelog")}</a></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {t("footer.company")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li><Link to="/introduction" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.about")}</Link></li>
                <li><a href="#" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.blog")}</a></li>
                <li><a href="#" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.careers")}</a></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {t("footer.legal")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                <li><Link to="/privacy-policy" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.privacy")}</Link></li>
                <li><Link to="/terms-of-service" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.terms")}</Link></li>
                <li><a href="#" className="font-sans text-[15px] text-gray-300 hover:text-white transition-colors duration-200 no-underline">{t("footer.cookies")}</a></li>
              </ul>
            </div>
          </div>
          {/* Copyright */}
          <div className="pt-8 border-t border-gray-700">
            <p className="font-sans text-sm text-gray-400 text-center">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
