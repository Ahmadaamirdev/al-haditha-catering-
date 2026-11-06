import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Calendar, ChevronDown, User, Check, Shield, Bell, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { data, currency, setCurrency, isMobileMenuOpen, setIsMobileMenuOpen, addToast } = useApp();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Monday, 3 Nov 2025');

  const availableDates = [
    'Monday, 3 Nov 2025',
    'Tuesday, 4 Nov 2025',
    'Wednesday, 5 Nov 2025',
    'Thursday, 6 Nov 2025',
    'Sunday, 9 Nov 2025',
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F5F8FB]/90 backdrop-blur-md px-6 lg:px-8 py-4 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Greeting & Welcome text */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-primary hover:bg-slate-200/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <span className="block text-xs font-normal text-slate-secondary tracking-wide">
              Welcome Back,
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-primary tracking-tight leading-none mt-0.5">
              Admin
            </h1>
          </div>
        </div>

        {/* Right: Kiosk Link + Currency Toggle + Date Picker Pill + Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Quick Access to Entry Panel */}
          <Link
            to="/entry"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all hover:scale-[1.02]"
            title="Open Entry Panel"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Entry Panel</span>
            <span className="sm:hidden">Entry</span>
          </Link>
          {/* Currency Display (OMR Only) */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-white border border-surface-border rounded-xl px-3 py-1.5 shadow-xs text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#009B4D]" />
            <span className="text-[#009B4D] font-bold">OMR</span>
            <span className="text-slate-400 font-normal">Omani Rial</span>
          </div>

          {/* Date Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                setIsProfileOpen(false);
              }}
              className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-surface-border rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-primary shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-brand-blue flex-shrink-0" />
              <span className="hidden xs:inline whitespace-nowrap">{selectedDate}</span>
              <span className="xs:hidden">3 Nov</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-muted" />
            </button>

            {/* Dropdown Menu */}
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-border py-1.5 z-40 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-muted uppercase tracking-wider border-b border-surface-border/60">
                  Select Working Date
                </div>
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setIsDatePickerOpen(false);
                      addToast(`Viewing data for ${date}`);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedDate === date ? 'text-brand-green font-semibold bg-brand-green-light/30' : 'text-slate-primary'
                    }`}
                  >
                    <span>{date}</span>
                    {selectedDate === date && <Check className="w-3.5 h-3.5 text-brand-green" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Profile Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsDatePickerOpen(false);
              }}
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

