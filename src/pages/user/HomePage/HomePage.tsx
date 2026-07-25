import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion, useInView, AnimatePresence } from "motion/react";
import useAuthStore from "../../../store/authStore";
import {
  Bot,
  Code2,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Pencil,
  Award,
  Brain,
  ShieldAlert,
  Timer,
  CheckCircle2,
  Zap,
} from "lucide-react";

// Step mockup images
import step1Img from "../../../assets/step1-questions.png";
import step2Img from "../../../assets/step2-interview.png";
import step3Img from "../../../assets/step3-scoring.png";

/* ─────────────── Types ─────────────── */

interface FloatingIconProps {
  icon: React.ReactNode;
  className: string;
  delay: number;
  amplitude: number;
  duration: number;
}

interface StudentCardData {
  name: string;
  role: string;
  avatar: string;
  score: number;
}

/* ─────────────── Floating Icon (Frosted-glass circles) ─────────────── */

const FloatingIcon = ({
  icon,
  className,
  delay,
  amplitude,
  duration,
}: FloatingIconProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={
        reduce
          ? { opacity: 0.8 }
          : { y: [-amplitude, amplitude] }
      }
      transition={
        reduce
          ? undefined
          : {
              duration,
              delay,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
            }
      }
    >
      {/* Frosted-glass circular container */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/40 backdrop-blur-md border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex items-center justify-center">
        {icon}
      </div>
    </motion.div>
  );
};

/* ─────────────── Student Card ─────────────── */

const StudentCard = ({ name, role, avatar, score }: StudentCardData) => (
  <div className="group/card flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl border border-zinc-200 bg-white p-5 mx-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center gap-4">
      <img
        src={avatar}
        alt={name}
        className="w-14 h-14 rounded-full object-cover bg-zinc-100 flex-shrink-0"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm font-semibold text-zinc-900 truncate">
          {name}
        </p>
        <p className="font-body text-xs text-zinc-500 truncate">{role}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 transition-colors group-hover/card:bg-emerald-100">
          <span className="font-body text-sm font-bold text-emerald-700">
            {score}
          </span>
        </span>
      </div>
    </div>
  </div>
);

/* ─────────────── Marquee Row (with hover pause) ─────────────── */

interface MarqueeRowProps {
  students: StudentCardData[];
  reverse?: boolean;
  durationSeconds: number;
}

const MarqueeRow = ({
  students,
  reverse = false,
  durationSeconds,
}: MarqueeRowProps) => {
  const reduce = useReducedMotion();
  const animClass = reverse ? "animate-marquee-reverse" : "animate-marquee";

  return (
    <div className="overflow-hidden w-full" aria-hidden="true">
      <div
        className={`flex w-max ${reduce ? "" : animClass} hover:[animation-play-state:paused]`}
        style={
          reduce
            ? undefined
            : ({
                "--marquee-duration": `${durationSeconds}s`,
                willChange: "transform",
              } as React.CSSProperties)
        }
      >
        {[...students, ...students, ...students].map((student, i) => (
          <StudentCard key={`${student.name}-${i}`} {...student} />
        ))}
      </div>
    </div>
  );
};

/* ─────────────── Student Data ─────────────── */

const STUDENTS_ROW1: StudentCardData[] = [
  { name: "Nguyen Minh Tuan", role: "Frontend Intern", avatar: "https://picsum.photos/seed/tuan1/112/112", score: 92 },
  { name: "Tran Thi Mai", role: "Backend Fresher", avatar: "https://picsum.photos/seed/mai1/112/112", score: 88 },
  { name: "Le Hoang Khoa", role: "Tester Intern", avatar: "https://picsum.photos/seed/khoa1/112/112", score: 85 },
  { name: "Pham Ngoc Anh", role: "Data Analyst Intern", avatar: "https://picsum.photos/seed/anh1/112/112", score: 91 },
  { name: "Vo Thanh Dat", role: "Frontend Fresher", avatar: "https://picsum.photos/seed/dat1/112/112", score: 87 },
  { name: "Hoang Thu Ha", role: "Backend Intern", avatar: "https://picsum.photos/seed/ha1/112/112", score: 94 },
];

const STUDENTS_ROW2: StudentCardData[] = [
  { name: "Dang Quoc Bao", role: "Fullstack Intern", avatar: "https://picsum.photos/seed/bao2/112/112", score: 89 },
  { name: "Bui Khanh Linh", role: "Tester Fresher", avatar: "https://picsum.photos/seed/linh2/112/112", score: 86 },
  { name: "Nguyen Thanh Son", role: "Backend Fresher", avatar: "https://picsum.photos/seed/son2/112/112", score: 93 },
  { name: "Do Minh Hieu", role: "Data Analyst Fresher", avatar: "https://picsum.photos/seed/hieu2/112/112", score: 90 },
  { name: "Ly Phuong Thao", role: "Frontend Intern", avatar: "https://picsum.photos/seed/thao2/112/112", score: 88 },
  { name: "Truong Van Duc", role: "Tester Intern", avatar: "https://picsum.photos/seed/duc2/112/112", score: 84 },
];

/* ─────────────── Step Images Map ─────────────── */

const STEP_IMAGES = [step1Img, step2Img, step3Img];

/* ─────────────── Roadmap Step Item ─────────────── */

const RoadmapStepItem = ({ 
  step, 
  index, 
  isActive, 
  setActiveStep,
  imageSrc
}: { 
  step: any; 
  index: number; 
  isActive: boolean; 
  setActiveStep: (idx: number) => void;
  imageSrc: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // useInView margin ensures only the item near the center of the viewport triggers
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (isInView) {
      setActiveStep(index);
    }
  }, [isInView, index, setActiveStep]);

  return (
    <div
      ref={ref}
      className={`min-h-[70vh] flex flex-col justify-center py-20 transition-opacity duration-700 ease-out ${
        isActive ? "opacity-100" : "opacity-40"
      }`}
    >
      <div className="max-w-[400px]">
        <div className="flex items-center gap-4 mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-zinc-200 bg-white shadow-sm text-zinc-900 text-lg font-bold">
            {step.number}
          </span>
          <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-700 shadow-sm">
            {step.icon}
          </div>
        </div>

        <h3 className="text-2xl font-bold leading-tight text-zinc-900 mb-4">
          {step.title}
        </h3>

        <p className="text-[17px] leading-relaxed text-zinc-500">
          {step.description}
        </p>

        {/* Mobile inline image fallback - Rendered under text below lg breakpoint */}
        <div className="lg:hidden mt-8 w-full">
          <div className="rounded-2xl overflow-hidden border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white aspect-[4/3] relative">
            <img
              src={imageSrc}
              alt={step.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── Interview Modes Section ─────────────── */

const InterviewModesSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: "Luyện tập Tương tác" },
    { id: 1, label: "Thi thử Áp lực" },
  ];

  return (
    <section className="py-24 lg:py-32 bg-white border-b border-zinc-200/70 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 mb-8">
            Lựa chọn chế độ học - Cá nhân hóa hành trình của bạn
          </h2>
          
          <div className="inline-flex items-center p-1.5 bg-zinc-100 rounded-full border border-zinc-200/80">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2.5 text-[15px] font-semibold rounded-full transition-colors duration-300 cursor-pointer border-none bg-transparent ${
                  activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-blue-600 rounded-full shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[500px]">
          {/* LEFT: Content */}
          <div className="flex flex-col relative h-full justify-center">
            <AnimatePresence mode="wait">
              {activeTab === 0 ? (
                <motion.div
                  key="tab1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Brain size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 mb-2">Bản chất</h4>
                      <p className="text-[15px] text-zinc-600 leading-relaxed">Là chế độ học tập chủ động, mang tính chất thảo luận và xây dựng phản xạ.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <MessageSquare size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 mb-2">Cơ chế vận hành</h4>
                      <p className="text-[15px] text-zinc-600 leading-relaxed">Người học đối đáp trực tiếp với AI Mentor theo thời gian thực. Hệ thống duy trì ngữ cảnh hội thoại đa lượt, cho phép AI đặt các câu hỏi đào sâu ("hỏi xoáy") dựa trên câu trả lời trước đó.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 mb-2">Điểm cốt lõi</h4>
                      <p className="text-[15px] text-zinc-600 leading-relaxed">AI nắm toàn quyền kiểm soát phiên học; phải đạt đủ tiêu chuẩn của câu hỏi mới được sang câu tiếp theo.</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="tab2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                      <ShieldAlert size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 mb-2">Bản chất</h4>
                      <p className="text-[15px] text-zinc-600 leading-relaxed">Là chế độ giả lập phòng thi nghiêm ngặt, rèn luyện bản lĩnh và tâm lý thực chiến.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Timer size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 mb-2">Cơ chế vận hành</h4>
                      <p className="text-[15px] text-zinc-600 leading-relaxed">Hệ thống đặt người học vào môi trường phỏng vấn khắc nghiệt với thời gian đếm ngược (countdown timer) nghiêm ngặt. Toàn bộ điểm số, nhận xét bị ẩn cho đến khi kết thúc. Bắt buộc hoàn thành lượt trả lời, không được sửa.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Zap size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 mb-2">Điểm cốt lõi</h4>
                      <p className="text-[15px] text-zinc-600 leading-relaxed">Tập trung tối đa vào quản lý thời gian, rèn luyện tư duy nhanh nhạy và phản xạ chịu áp lực cao như phỏng vấn thực tế.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Mockup */}
          <div className="relative">
            <div className="w-full relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] bg-zinc-50 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {activeTab === 0 ? (
                  <motion.div
                    key="mockup1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 p-6 sm:p-8 flex flex-col gap-4"
                  >
                     <div className="w-[85%] bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-zinc-100 self-start">
                       <p className="text-[13px] sm:text-[14px] text-zinc-800 font-medium leading-relaxed">Bạn có thể giải thích chi tiết hơn về cách React Fiber hoạt động không?</p>
                     </div>
                     <div className="w-[85%] bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm self-end">
                       <p className="text-[13px] sm:text-[14px] leading-relaxed">Dạ, React Fiber là kiến trúc core mới của React, cho phép chia nhỏ quá trình render thành các chunk nhỏ hơn để ưu tiên tác vụ quan trọng...</p>
                     </div>
                     <div className="w-[85%] bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-zinc-100 self-start">
                       <p className="text-[13px] sm:text-[14px] text-zinc-800 font-medium leading-relaxed">Rất tốt. Vậy sự khác biệt cốt lõi giữa Stack Reconciler cũ và Fiber là gì?</p>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mockup2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 p-6 sm:p-8 flex flex-col"
                  >
                     <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                         <span className="text-sm font-bold text-rose-600">Recording</span>
                       </div>
                       <div className="px-4 py-2 bg-rose-50 rounded-lg border border-rose-100 shadow-sm">
                         <span className="font-mono text-xl font-bold text-rose-600 tracking-wider">01:45</span>
                       </div>
                     </div>
                     <div className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col justify-center items-center text-center">
                       <h3 className="text-lg font-bold text-zinc-900 mb-4 uppercase tracking-wider text-rose-600">Câu hỏi 3/10</h3>
                       <p className="text-[16px] sm:text-[18px] text-zinc-800 font-semibold mb-10 max-w-sm leading-relaxed">"Hãy kể về một lần bạn phải đối mặt với một lỗi hệ thống nghiêm trọng trên production. Bạn đã xử lý thế nào?"</p>
                       <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                         <div className="w-[30%] bg-blue-600 h-full rounded-full transition-all duration-1000" />
                       </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────── HomePage Component ─────────────── */

const HomePage = () => {
  const { t, i18n } = useTranslation("HomePage");
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const reduce = useReducedMotion();

  // InView logic is now handled internally by RoadmapStepItem components

  const handleCTA = useCallback(() => {
    if (isAuthenticated) {
      navigate(roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard");
    } else {
      navigate("/register");
    }
  }, [isAuthenticated, roles, navigate]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const roadmapSteps = [
    {
      number: t("roadmap.step1.number"),
      title: t("roadmap.step1.title"),
      description: t("roadmap.step1.description"),
      icon: <Sparkles size={24} strokeWidth={1.5} />,
    },
    {
      number: t("roadmap.step2.number"),
      title: t("roadmap.step2.title"),
      description: t("roadmap.step2.description"),
      icon: <Pencil size={24} strokeWidth={1.5} />,
    },
    {
      number: t("roadmap.step3.number"),
      title: t("roadmap.step3.title"),
      description: t("roadmap.step3.description"),
      icon: <Award size={24} strokeWidth={1.5} />,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas font-body text-zinc-900 selection:bg-zinc-200">
      {/* ════════ TOP NAVIGATION ════════ */}
      <nav
        id="top-nav"
        className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/70"
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <a
            href="/"
            className="font-display text-2xl font-semibold tracking-tight text-zinc-950 no-underline"
          >
            {t("nav.brand")}
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#roadmap"
              className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors no-underline"
            >
              {t("nav.howItWorks")}
            </a>
            <a
              href="#carousel"
              className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors no-underline"
            >
              {t("nav.features")}
            </a>
            <button
              onClick={toggleLanguage}
              className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer uppercase"
            >
              {i18n.language === "vi" ? "EN" : "VI"}
            </button>
            <button
              id="nav-cta"
              onClick={handleCTA}
              className="bg-zinc-950 text-white text-[15px] font-medium rounded-full px-6 py-2.5 hover:bg-zinc-800 transition-colors cursor-pointer border-none shadow-sm"
            >
              {isAuthenticated ? "Dashboard" : t("nav.getStarted")}
            </button>
          </div>

          <button
            id="mobile-menu-toggle"
            className="md:hidden bg-transparent border-none cursor-pointer text-zinc-900 p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} strokeWidth={2} />
            ) : (
              <Menu size={24} strokeWidth={2} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-zinc-200/70 shadow-sm">
            <div className="flex flex-col p-6 gap-5">
              <a
                href="#roadmap"
                className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.howItWorks")}
              </a>
              <a
                href="#carousel"
                className="text-[15px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.features")}
              </a>
              <button
                className="bg-zinc-950 text-white text-[15px] font-medium rounded-full px-6 py-3 hover:bg-zinc-800 transition-colors cursor-pointer border-none w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCTA();
                }}
              >
                {isAuthenticated ? "Dashboard" : t("nav.getStarted")}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ════════ HERO SECTION (Clean, Minimalist, Pure Canvas) ════════ */}
      <section
        id="hero"
        className="relative overflow-hidden bg-white pt-20 pb-28 sm:pt-28 sm:pb-36 lg:pt-36 lg:pb-48 border-b border-zinc-200/70"
      >
        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Typography Focus */}
            <div>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 bg-zinc-100/80 text-zinc-800 text-xs font-semibold uppercase tracking-[0.96px] rounded-full px-4 py-1.5 mb-8 border border-zinc-200/50 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                {t("hero.badge")}
              </motion.div>

              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-950 leading-[1.05] mb-6 whitespace-pre-line"
              >
                {t("hero.title")}
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-lg sm:text-[21px] leading-relaxed text-zinc-500 max-w-lg mb-10 tracking-tight"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4"
              >
                <button
                  id="hero-cta-primary"
                  onClick={handleCTA}
                  className="group w-full sm:w-auto bg-zinc-950 text-white text-[15px] font-semibold rounded-full px-8 py-3.5 hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none flex justify-center items-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                >
                  {t("hero.cta")}
                  <span className="inline-flex transition-transform group-hover:translate-x-1">
                    <ArrowRight size={18} strokeWidth={2} />
                  </span>
                </button>
                <button
                  id="hero-cta-secondary"
                  className="group w-full sm:w-auto bg-white text-zinc-900 text-[15px] font-medium rounded-full px-8 py-3.5 border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100 transition-all cursor-pointer flex justify-center items-center"
                >
                  {t("hero.ctaSecondary")}
                </button>
              </motion.div>
            </div>

            {/* Right: Floating Icons */}
            <div className="relative hidden lg:flex items-center justify-center min-h-[440px]">
              {/* Subtle background glow to anchor the floating icons visually */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/40 via-white to-sky-50/30 rounded-full blur-[80px] -z-10" />
              
              {/* Center anchor */}
              <div className="w-24 h-24 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex items-center justify-center z-10">
                <Bot size={44} strokeWidth={1.2} className="text-zinc-800" />
              </div>

              {/* Orbital icons with varying subtle amplitudes */}
              <FloatingIcon
                icon={<Code2 size={26} strokeWidth={1.5} className="text-indigo-600" />}
                className="top-[10%] left-[18%]"
                delay={0}
                amplitude={8}
                duration={4.5}
              />
              <FloatingIcon
                icon={<MessageSquare size={24} strokeWidth={1.5} className="text-emerald-500" />}
                className="top-[20%] right-[12%]"
                delay={1.2}
                amplitude={6}
                duration={5}
              />
              <FloatingIcon
                icon={<BarChart3 size={26} strokeWidth={1.5} className="text-amber-500" />}
                className="bottom-[15%] left-[10%]"
                delay={0.6}
                amplitude={10}
                duration={5.5}
              />
              <FloatingIcon
                icon={<Sparkles size={22} strokeWidth={1.5} className="text-rose-400" />}
                className="bottom-[22%] right-[18%]"
                delay={2.1}
                amplitude={5}
                duration={4}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════ INTERVIEW MODES SECTION (Tabbed Layout) ════════ */}
      <InterviewModesSection />

      {/* ════════ ROADMAP SECTION (Sticky Pinned Track) ════════ */}
      <section id="roadmap" className="bg-canvas border-b border-zinc-200/70">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="pt-20 lg:pt-32 mb-8 lg:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
              {t("roadmap.title")}
            </h2>
          </motion.div>

          {/* Natural scroll container (no overflow-y-auto limits) */}
          <div className="grid lg:grid-cols-2 gap-12 relative pb-20 lg:pb-32">
            
            {/* LEFT COLUMN: Scrolling Step Descriptions */}
            <div className="flex flex-col relative z-10">
              {roadmapSteps.map((step, index) => (
                <RoadmapStepItem
                  key={index}
                  step={step}
                  index={index}
                  isActive={activeStep === index}
                  setActiveStep={setActiveStep}
                  imageSrc={STEP_IMAGES[index]}
                />
              ))}
            </div>

            {/* RIGHT COLUMN: Pinned Mockup Display (Sticky) */}
            <div className="hidden lg:block relative">
              <div className="sticky top-32 h-[60vh] flex items-center justify-center">
                <div className="w-full relative aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] bg-zinc-50/50">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeStep}
                      src={STEP_IMAGES[activeStep]}
                      alt={`Step ${activeStep + 1} Mockup`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ════════ STUDENT CAROUSEL (Double-Row Seamless Marquee) ════════ */}
      <section id="carousel" className="py-24 sm:py-32 bg-white border-b border-zinc-200/70 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
              {t("carousel.title")}
            </h2>
          </motion.div>
        </div>

        {/* Full-width marquee rows - Extend edge to edge */}
        <div className="w-full space-y-6 flex flex-col">
          {/* Row 1: Left to Right (marquee) */}
          <MarqueeRow students={STUDENTS_ROW1} durationSeconds={45} />
          {/* Row 2: Right to Left (marquee-reverse) */}
          <MarqueeRow students={STUDENTS_ROW2} reverse durationSeconds={50} />
        </div>
      </section>

      {/* ════════ CTA BAND ════════ */}
      <section id="cta-band" className="relative py-28 sm:py-36 bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Faint elegant glow for pure dark theme */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-800/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        </div>

        <div className="relative max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-[17px] leading-relaxed text-zinc-400 mb-10 max-w-lg mx-auto">
            {t("cta.subtitle")}
          </p>
          <button
            id="cta-button"
            onClick={handleCTA}
            className="group bg-white text-zinc-950 text-[16px] font-semibold rounded-full px-10 py-4 hover:bg-zinc-100 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none inline-flex items-center gap-3 shadow-[0_8px_30px_rgba(255,255,255,0.12)]"
          >
            {t("cta.button")}
            <span className="inline-flex transition-transform group-hover:translate-x-1">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer
        id="footer"
        className="py-16 px-6 bg-canvas"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 sm:col-span-4 lg:col-span-2 lg:pr-12">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 mb-4">
                {t("footer.brand")}
              </h3>
              <p className="text-[15px] leading-relaxed text-zinc-500">
                {t("footer.description")}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1px] text-zinc-900 mb-5">
                {t("footer.product")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                <li>
                  <a
                    href="#roadmap"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.pricing")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.changelog")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1px] text-zinc-900 mb-5">
                {t("footer.company")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                <li>
                  <Link
                    to="/introduction"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.about")}
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.blog")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.careers")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1px] text-zinc-900 mb-5">
                {t("footer.legal")}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-of-service"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.terms")}
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[15px] text-zinc-500 hover:text-zinc-900 transition-colors no-underline"
                  >
                    {t("footer.cookies")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-200/70 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-400">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
