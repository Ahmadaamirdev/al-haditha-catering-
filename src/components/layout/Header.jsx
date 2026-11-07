import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, User, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === '/' || location.pathname === '';

  return (
    <header className="sticky top-0 z-30 bg-[#F5F8FB]/90 backdrop-blur-md px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between min-h-[40px]">
        {/* Left: Greeting & Welcome text (Only on Dashboard) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-primary hover:bg-slate-200/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {isDashboard && (
            <div>
              <span className="block text-xs font-normal text-slate-secondary tracking-wide">
                Welcome Back,
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-primary tracking-tight leading-none mt-0.5">
                Admin
              </h1>
            </div>
          )}
        </div>

        {/* Right: Admin Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-[#1684AA] flex items-center justify-center text-white ring-2 ring-white shadow-xs hover:opacity-95 transition-opacity"
              aria-label="Admin Profile"
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-surface-border py-2 z-40 animate-fade-in">
                <div className="px-4 py-3 border-b border-surface-border">
                  <p className="text-xs font-semibold text-slate-primary">Mess Operations Admin</p>
                  <p className="text-[11px] text-slate-secondary">admin@alhadithaenergy.com</p>
                  <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-brand-green-light text-brand-green text-[10px] font-semibold">
                    <Shield className="w-3 h-3" />
                    <span>Full Access Administrator</span>
                  </div>
                </div>
                <div className="px-4 py-2 text-xs text-slate-secondary space-y-1">
                  <div className="flex justify-between">
                    <span>Base Location:</span>
                    <span className="font-medium text-slate-primary">Central Camp Mess</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Facility:</span>
                    <span className="font-medium text-slate-primary">Hall 01 (Main)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
