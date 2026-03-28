'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import ModuleCard from '@/components/ModuleCard';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 15, // Smooth deceleration 
    mass: 1,
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(target);
    }
  }, [isInView, target, springValue]);

  const displayValue = useTransform(springValue, (current) =>
    Math.round(current).toLocaleString('en-IN')
  );

  return (
    <span ref={ref} className="font-serif text-3xl md:text-4xl font-bold text-gradient-teal">
      {prefix}<motion.span>{displayValue}</motion.span>{suffix}
    </span>
  );
}

const modules = [
  { title: 'Money Health Score', description: 'A diagnostic scan of your entire financial landscape. Instant feedback on risks and growth gaps.', href: '/health-score', icon: '🫀', delay: 100 },
  { title: 'FIRE Path Planner', description: 'When can you realistically stop working? Calculate your Financial Independence date with AI precision.', href: '/fire-planner', icon: '🔥', badge: 'Most Popular', badgeColor: 'amber', delay: 200 },
  { title: 'Tax Wizard', description: 'Algorithmically find every legal deduction available under New & Old tax regimes for FY2024-25.', href: '/tax-wizard', icon: '🧙', delay: 300 },
  { title: 'MF Portfolio X-Ray', description: 'Find hidden overlap risks, expense ratio drag, and STCG-aware rebalancing for your mutual funds.', href: '/mf-xray', icon: '🔬', delay: 400 },
  { title: "Couple's Money Planner", description: 'Built for two. Sync goals, optimize joint taxes, and plan a unified financial future.', href: '/couples-planner', icon: '💑', badge: "India's first AI-powered joint planner", badgeColor: 'teal', delay: 500 },
  { title: 'Audit Trail', description: 'Full transparency into every AI decision. Track all agent activities, calculations, and compliance checks in real time.', href: '/audit-trail', icon: '📋', badge: 'Transparency', badgeColor: 'teal', delay: 600 },
];

// Reusable text reveal animation
const textRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen">
      {/* Hero with Background Video */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Cinematic Slow Zoom on Video */}
        <motion.video
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster=""
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </motion.video>

        {/* Dark gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001525]/70 via-[#001525]/40 to-[#001525]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001525] via-transparent to-[#001525]/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center w-full">
          <StaggerContainer staggerDelay={0.15} delayChildren={0.2} className="flex flex-col items-center">
            
            <motion.span 
              variants={textRevealVariants}
              className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400/90 mb-6 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur-sm"
            >
              AI-Powered Financial Intelligence
            </motion.span>
            
            <motion.h1 
              variants={textRevealVariants}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 drop-shadow-lg"
            >
              <span className="text-white">Your AI Financial</span><br />
              <span className="text-gradient-teal">Advisor</span>
              <span className="text-white"> — </span>
              <span className="text-gradient-amber italic">Free Forever</span>
            </motion.h1>
            
            <motion.p 
              variants={textRevealVariants}
              className="max-w-2xl mx-auto text-base md:text-lg text-white/60 leading-relaxed mb-10 drop-shadow-md"
            >
              Only 27% of Indian adults are financially literate. Get your AI-powered plan in 5 minutes.
            </motion.p>
            
            <motion.div variants={textRevealVariants}>
              <a href="/health-score" className="inline-flex items-center gap-2 gradient-cta text-white font-semibold px-8 py-3.5 rounded-full text-sm hover:shadow-glow-teal transition-all duration-300 shadow-lg">
                Get Started
                <motion.svg 
                  animate={{ x: [0, 5, 0] }} 
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </a>
            </motion.div>
          </StaggerContainer>

          {/* Stats — floating over video */}
          {mounted && (
            <StaggerContainer delayChildren={0.8} staggerDelay={0.2} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
              {[
                { target: 25.6, suffix: ' Cr+', label: 'MF Folios in India', tag: 'SCALE' },
                { target: 72, suffix: '%', label: 'Use New Tax Regime', tag: 'AWARENESS' },
                { target: 5, suffix: ' Min', label: 'To Your Personal Plan', tag: 'EFFICIENCY' },
              ].map((stat, idx) => (
                <StaggerItem key={idx} distance={30} direction="up" className="rounded-xl p-5 backdrop-blur-md bg-white/5 border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-teal-400/80 mb-1 block relative z-10">{stat.tag}</span>
                  <div className="relative z-10"><AnimatedCounter target={stat.target} suffix={stat.suffix} prefix={stat.prefix || ''} /></div>
                  <p className="text-xs text-white/40 mt-1 relative z-10">{stat.label}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <FadeIn className="text-center mb-12">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-50 mb-3">
            Precision Wealth Modules
          </h2>
          <p className="text-sm text-navy-50/40 max-w-lg mx-auto">
            Each tool designed to optimize one core pillar of your financial future.
          </p>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <StaggerItem key={module.href} distance={-20}>
              <ModuleCard {...module} delay={0} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 overflow-hidden">
        <FadeIn direction="up" distance={50} className="glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Subtle slow rotating ambient bg */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-radial from-teal-900/10 via-transparent to-transparent opacity-50 pointer-events-none" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <FadeIn delay={0.2} direction="right" distance={30}>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-50 mb-4">
                  Expert Advice,<br />Minus the Bias.
                </h2>
                <p className="text-sm text-navy-50/50 leading-relaxed mb-6">
                  Human advisors are often incentivized to sell you products. FinSathi uses deep AI models to analyze your data objectively. No commissions. No hidden agendas. Just pure math.
                </p>
              </FadeIn>
            </div>
            <div className="space-y-4">
              <StaggerContainer delayChildren={0.4} staggerDelay={0.1}>
                {[
                  { icon: '✅', text: 'SEBI (IA) Compliant Architecture' },
                  { icon: '🔒', text: 'Bank-Grade Data Security' },
                  { icon: '🎯', text: 'Hyper-Personalized Tax Advice' },
                  { icon: '🤖', text: 'Multi-Agent AI Transparency' },
                ].map((item, idx) => (
                  <StaggerItem key={idx} direction="left" distance={20} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-high/30 border border-transparent hover:border-teal-500/20 hover:bg-surface-container-high/50 transition-colors">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-navy-50/80">{item.text}</span>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
