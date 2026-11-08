import React from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useApp();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-[#F5F8FB]/95 backdrop-blur-md px-4 py-2.5 border-b border-surface-border flex items-center justify-between">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 rounded-xl text-slate-primary hover:bg-slate-200/60 transition-colors cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      <span className="text-xs font-bold text-slate-700">Al-Haditha Mess</span>
    </header>
  );
}
