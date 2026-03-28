'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ModuleCard({ title, description, href, icon, badge, badgeColor = 'teal', delay = 0 }) {
  const badgeColors = {
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    amber: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    purple: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
  };

  return (
    <Link href={href} className="block group h-full">
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="glass-card rounded-2xl p-6 h-full transition-colors duration-500
        hover:shadow-glow-teal hover:bg-surface-container-high/80
        border border-transparent hover:border-teal-500/20 w-full"
      >
        {badge && (
          <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full border mb-4 ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}

        <div className="flex items-start gap-4">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex-shrink-0 w-12 h-12 rounded-xl gradient-cta flex items-center justify-center text-xl
            group-hover:shadow-glow-teal transition-shadow duration-500"
          >
            {icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-semibold text-navy-50 group-hover:text-teal-200 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-navy-50/50 mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-teal-400/60 group-hover:text-teal-300 transition-colors">
          <span>Open Module</span>
          <motion.svg 
            className="w-3.5 h-3.5 transform group-hover:translate-x-1" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </motion.svg>
        </div>
      </motion.div>
    </Link>
  );
}
