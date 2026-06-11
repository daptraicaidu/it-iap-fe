import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'motion/react';
import { Link } from 'react-router-dom';

/* Icons */
const IconClipboardCheck = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const IconMessageCircle = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconAlertTriangle = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconFileCode = () => (
  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export default function TermsOfServicePage() {
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
    <div className="min-h-screen bg-zinc-50 selection:bg-amber-100 selection:text-amber-900">
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
                  { id: 'section1', label: t('terms.menu.section1') },
                  { id: 'section2', label: t('terms.menu.section2') },
                  { id: 'section3', label: t('terms.menu.section3') },
                  { id: 'section4', label: t('terms.menu.section4') }
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
                {t('terms.header.title')}
              </h1>
              <p className="font-mono text-sm text-zinc-400">
                {t('terms.header.date')}
              </p>
              <p className="text-lg text-zinc-600 leading-relaxed mt-8">
                {t('terms.header.promise')}
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
                  <IconClipboardCheck />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('terms.section1.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('terms.section1.body')}
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
                  <IconMessageCircle />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('terms.section2.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('terms.section2.body')}
                </p>
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
                  <IconAlertTriangle />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('terms.section3.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('terms.section3.body')}
                </p>
                
                {/* Warning Callout Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <p className="text-amber-700 leading-relaxed font-medium">
                    {t('terms.section3.callout')}
                  </p>
                </div>
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
                  <IconFileCode />
                  <h2 className="text-2xl font-bold text-zinc-900">
                    {t('terms.section4.title')}
                  </h2>
                </div>
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {t('terms.section4.body')}
                </p>
              </motion.section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
