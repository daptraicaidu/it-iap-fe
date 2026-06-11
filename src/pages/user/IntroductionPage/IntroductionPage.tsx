import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'outline' }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === 'default' ? "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80" : "border border-zinc-200 text-zinc-950 bg-white",
        className
      )}
      {...props}
    />
  );
}

const MEMBERS = [
  {
    name: "Bùi Tiến Thành",
    id: "BIT230385",
    role: "Frontend Developer",
    src: "src/assets/avatar/TienThanh.jpg"
  },
  {
    name: "Nguyễn Quang Thái",
    id: "BIT230373",
    role: "Frontend Developer",
    src: "src/assets/avatar/QuangThai.png"
  },
  {
    name: "Trần Phạm Minh Sơn",
    id: "BIT230367",
    role: "Frontend Developer",
    src: "src/assets/avatar/Son.png"
  },
  {
    name: "Mai Thanh Tùng",
    id: "BIT230434",
    role: "Backend Developer",
    src: "src/assets/avatar/ThanhTung.png"
  },
  {
    name: "Vũ Minh Thắng",
    id: "BIT230377",
    role: "Backend Developer",
    src: "src/assets/avatar/MinhThang.png"
  }
];

export default function IntroductionPage() {
  const { t } = useTranslation('FooterPages');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-indigo-100 selection:text-indigo-900 py-24 relative">
      {/* Navigation */}
      <div className="absolute top-8 left-8 sm:left-12 lg:left-16 z-50">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {t('back_home')}
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-32">
        {/* Hero Section */}
        <motion.section 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 tracking-tighter leading-tight">
              {t('hero.headline_prefix')}
              <span className="text-indigo-600">{t('hero.headline_highlight')}</span>
              {t('hero.headline_suffix')}
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 max-w-lg leading-relaxed">
              {t('hero.subtext')}
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden aspect-video lg:aspect-auto h-full min-h-[300px]">
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-70 pointer-events-none" />
             <div className="relative z-10 h-full flex flex-col justify-center space-y-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900">AI Powered</h3>
                <div className="h-2 w-1/3 bg-zinc-200 rounded-full"></div>
                <div className="h-2 w-1/2 bg-zinc-100 rounded-full"></div>
             </div>
          </motion.div>
        </motion.section>

        {/* Tech Section */}
        <motion.section
          className="space-y-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
            {/* Feature 1 */}
            <motion.div 
              variants={itemVariants}
              className="md:col-span-2 lg:col-span-2 bg-white border border-zinc-200 rounded-[2rem] p-8 lg:p-10 xl:p-12 shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 hover:-translate-y-1.5 hover:border-zinc-300 transition-all duration-500 ease-out group"
            >
              <h3 className="text-2xl font-bold text-zinc-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">{t('tech.feature1.title')}</h3>
              <p className="text-zinc-600 leading-relaxed max-w-md">{t('tech.feature1.description')}</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              variants={itemVariants}
              className="md:col-span-1 lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 lg:p-10 xl:p-12 shadow-lg hover:shadow-2xl hover:shadow-zinc-900/50 hover:-translate-y-1.5 hover:border-zinc-700 transition-all duration-500 ease-out"
            >
              <h3 className="text-2xl font-bold text-white mb-4">{t('tech.feature2.title')}</h3>
              <p className="text-zinc-400 leading-relaxed">{t('tech.feature2.description')}</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              variants={itemVariants}
              className="md:col-span-1 lg:col-span-1 bg-zinc-100/50 border border-zinc-200/50 hover:bg-zinc-100 hover:border-zinc-300/50 rounded-[2rem] p-8 lg:p-10 xl:p-12 hover:shadow-xl hover:shadow-zinc-200/40 hover:-translate-y-1.5 transition-all duration-500 ease-out"
            >
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">{t('tech.feature3.title')}</h3>
              <p className="text-zinc-600 leading-relaxed">{t('tech.feature3.description')}</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              variants={itemVariants}
              className="md:col-span-2 lg:col-span-2 bg-indigo-50/50 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1.5 rounded-[2rem] p-8 lg:p-10 xl:p-12 transition-all duration-500 ease-out relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-indigo-900 mb-4">{t('tech.feature4.title')}</h3>
                <p className="text-indigo-900/80 leading-relaxed max-w-md">{t('tech.feature4.description')}</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          className="space-y-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">{t('team.headline')}</h2>
            <p className="text-lg text-zinc-600">{t('team.subtext')}</p>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-12 lg:gap-16" variants={containerVariants}>
            {/* Top row: 3 members */}
            <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
              {MEMBERS.slice(0, 3).map((member) => (
                <MemberCard key={member.id} member={member} variants={itemVariants} />
              ))}
            </div>
            {/* Bottom row: 2 members */}
            <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
              {MEMBERS.slice(3, 5).map((member) => (
                <MemberCard key={member.id} member={member} variants={itemVariants} />
              ))}
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

function MemberCard({ member, variants }: { member: typeof MEMBERS[0], variants: any }) {
  return (
    <motion.div 
      variants={variants}
      className="flex flex-col items-center space-y-5 group w-48 hover:-translate-y-1.5 transition-transform duration-500 ease-out"
    >
      <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-zinc-100 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
        <img 
          src={member.src} 
          alt={member.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-center flex flex-col items-center space-y-3">
        <h3 className="text-xl font-bold text-zinc-900 leading-tight whitespace-nowrap">{member.name}</h3>
        <span className="font-mono text-sm font-bold tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md">
          {member.id}
        </span>
        <Badge variant="outline" className="text-zinc-600 border-zinc-200">
          {member.role}
        </Badge>
      </div>
    </motion.div>
  );
}
