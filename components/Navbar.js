'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/health-score', label: 'Health Score' },
    { href: '/fire-planner', label: 'FIRE Planner' },
    { href: '/tax-wizard', label: 'Tax Wizard' },
    { href: '/mf-xray', label: 'MF X-Ray' },
    { href: '/couples-planner', label: "Couple's Planner" },
    { href: '/audit-trail', label: 'Audit Trail' },
  ];

  return (
    <nav className="nav-blur fixed top-0 left-0 right-0 z-50 border-b border-navy-50/5 bg-navy-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-serif font-bold text-gradient-teal">FinSathi</span>
            <span className="text-[8px] text-navy-50/30 font-semibold tracking-wider">®</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-xs font-medium text-navy-50/60 hover:text-teal-200 transition-colors rounded-lg hover:bg-surface-container/50"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-navy-50/60 hover:text-teal-200" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-navy-50/5 bg-navy-900 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-navy-50/80 hover:text-teal-200 hover:bg-surface-container/50"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
