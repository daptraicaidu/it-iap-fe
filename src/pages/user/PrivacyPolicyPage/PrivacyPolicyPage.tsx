import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'motion/react';
import { Link } from 'react-router-dom';

/* Icons */
const IconDatabase = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M3 5V19C3 20.6569 7.02944 22 12 22C16.9706 22 21 20.6569 21 19V5"></path>
    <path d="M3 12C3 13.6569 7.02944 15 12 15C16.9706 15 21 13.6569 21 12"></path>
  </svg>
);

const IconCpu = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <path d="M9 1V4"></path>
    <path d="M15 1V4"></path>
    <path d="M9 20V23"></path>
    <path d="M15 20V23"></path>
    <path d="M20 9H23"></path>
    <path d="M20 14H23"></path>
    <path d="M1 9H4"></path>
    <path d="M1 14H4"></path>
  </svg>
);

const IconShield = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const IconUser = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function PrivacyPolicyPage() {
  const { t } = useTranslation('FooterPages');
  const [activeSection, setActiveSection] = useState('section1');

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const isClickScrolling = useRef(false);
  const clickScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Intersection Observer to update active menu item based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -40% 0px', threshold: 0.1 }
    );

    const sections = document.querySelectorAll('section[id^="section"]');
    sections.forEach((s) => observer.observe(s));

    // Handle scroll to the very bottom of the page
    const handleScroll = () => {
      if (isClickScrolling.current) return;
      if (window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 50) {
        setActiveSection('section4');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    isClickScrolling.current = true;
    
    if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current);
    clickScrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);

    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <div className="absolute top-8 left-8 sm:left-12 lg:left-16 z-50 hidden lg:block">
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

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-48 lg:pb-64">
        {/* Mobile Back Button */}
        <div className="lg:hidden mb-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          {/* Left Column: Sticky Menu */}
          <aside className="hidden lg:block relative">
            <div className="sticky top-24 space-y-2">
              <nav className="flex flex-col space-y-1">
                {[
                  { id: 'section1', label: t('privacy.menu.section1') },
                  { id: 'section2', label: t('privacy.menu.section2') },
                  { id: 'section3', label: t('privacy.menu.section3') },
                  { id: 'section4', label: t('privacy.menu.section4') }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id 
                        ? 'bg-white border border-zinc-200 text-zinc-900 shadow-sm' 
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Column: Content */}
          <main>
            {/* Header */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={sectionVariants}
              className="mb-20 space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">
                {t('privacy.header.title')}
              </h1>
              <p className="font-mono text-sm text-zinc-400">
                {t('privacy.header.date')}
              </p>
              <p className="text-lg text-zinc-600 leading-relaxed mt-8">
                {t('privacy.header.promise')}
              </p>
            </motion.div>

            <div className="space-y-20">
              {/* Section 1 */}
              <motion.section
                id="section1"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-4">
                  <IconDatabase />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('privacy.section1.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('privacy.section1.body')}
                </p>
              </motion.section>

              {/* Section 2 */}
              <motion.section
                id="section2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-4">
                  <IconCpu />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('privacy.section2.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('privacy.section2.body')}
                </p>
                
                {/* Highlighted Callout Card */}
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 md:p-8">
                  <p className="text-zinc-800 leading-relaxed font-medium">
                    {t('privacy.section2.callout')}
                  </p>
                </div>
              </motion.section>

              {/* Section 3 */}
              <motion.section
                id="section3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-4">
                  <IconShield />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('privacy.section3.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('privacy.section3.body')}
                </p>
              </motion.section>

              {/* Section 4 */}
              <motion.section
                id="section4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-4">
                  <IconUser />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('privacy.section4.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('privacy.section4.body')}
                </p>
              </motion.section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
