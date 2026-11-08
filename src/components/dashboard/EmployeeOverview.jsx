import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Users, User, ChevronDown, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EmployeeOverview() {
  const { data, addToast } = useApp();
  const mealEntries = data.mealEntries || [];

  const todayIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [filter, setFilter] = useState('Today');
  const [customDate, setCustomDate] = useState('2026-11-08');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dateInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filters = ['Today', 'This Week', 'This Month', 'Last Month'];

  const handleSelectFilter = (opt) => {
    setFilter(opt);
    setIsOpen(false);
    addToast(`Filter updated to ${opt}`);
  };

  const handleCustomDateChange = (val) => {
    if (!val) return;
    setCustomDate(val);
    setFilter('Custom Date');
    addToast(`Filtered by custom date: ${val}`);
  };

  // Compute live filtered metrics based on selected filter or custom date
  const stats = useMemo(() => {
    let filtered = mealEntries;
    const refDate = '2026-11-08';

    if (filter === 'Today') {
      filtered = mealEntries.filter((e) => (e.date || '') === refDate || (e.date || '') === todayIso);
    } else if (filter === 'This Week') {
      const weekStart = '2026-11-02';
      filtered = mealEntries.filter((e) => {
        const d = e.date || '';
        return d >= weekStart && d <= refDate;
      });
    } else if (filter === 'This Month') {
      filtered = mealEntries.filter((e) => {
        const d = e.date || '';
        return d.startsWith('2026-11');
      });
    } else if (filter === 'Last Month') {
      filtered = mealEntries.filter((e) => {
        const d = e.date || '';
        return d.startsWith('2026-10');
      });
    } else if ((filter === 'Custom Date' || filter === 'Custom') && customDate) {
      filtered = mealEntries.filter((e) => (e.date || '') === customDate);
    }

    const jrEntries = filtered.filter((e) => (e.category || '').toLowerCase() === 'junior');
    const srEntries = filtered.filter((e) => (e.category || '').toLowerCase() === 'senior');

    const isSingleDay = filter === 'Today' || filter === 'Custom Date' || filter === 'Custom';

    let jrEating, srEating, jrPct, srPct;

    if (isSingleDay) {
      const distinctJr = new Set(jrEntries.map((e) => e.employeeId)).size;
      const distinctSr = new Set(srEntries.map((e) => e.employeeId)).size;
      jrEating = distinctJr;
      srEating = distinctSr;
      jrPct = Math.min(100, Math.round((distinctJr / 40) * 100));
      srPct = Math.min(100, Math.round((distinctSr / 40) * 100));
    } else {
      const uniqueDays = new Set(filtered.map((e) => e.date)).size || 1;
      const avgJr = Math.round(new Set(jrEntries.map((e) => `${e.date}-${e.employeeId}`)).size / uniqueDays);
      const avgSr = Math.round(new Set(srEntries.map((e) => `${e.date}-${e.employeeId}`)).size / uniqueDays);
      jrEating = avgJr;
      srEating = avgSr;
      jrPct = Math.min(100, Math.round((avgJr / 40) * 100));
      srPct = Math.min(100, Math.round((avgSr / 40) * 100));
    }

    return {
      junior: {
        total: 40,
        eating: jrEating,
        percentage: jrPct,
        meals: jrEntries.length,
      },
      senior: {
        total: 40,
        eating: srEating,
        percentage: srPct,
        meals: srEntries.length,
      },
      totalFilteredMeals: filtered.length,
    };
  }, [mealEntries, filter, customDate, todayIso]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow h-full flex flex-col justify-between font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
            <Users className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-primary tracking-tight">
            Employee Meal Overview
          </h2>
        </div>

        {/* Filter Controls: Custom Date Picker + Presets Dropdown */}
        <div className="flex items-center space-x-2">
          {/* Custom Date Picker with Calendar Icon */}
          <div 
            onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus()}
            className="flex items-center space-x-1.5 bg-slate-50 border border-surface-border px-2.5 py-1.5 rounded-xl shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
            title="Click calendar icon to pick custom date"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
            <input
              ref={dateInputRef}
              type="date"
              value={customDate}
              onChange={(e) => handleCustomDateChange(e.target.value)}
              className="text-xs bg-transparent focus:outline-none text-slate-700 font-semibold cursor-pointer w-24 sm:w-auto"
            />
          </div>

          {/* Preset Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-secondary transition-colors cursor-pointer shadow-2xs"
            >
              <span>{filter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-muted" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-surface-border rounded-xl shadow-lg py-1 z-30 animate-fade-in">
                {filters.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectFilter(opt)}
                    className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors cursor-pointer ${
                      filter === opt ? 'text-brand-green font-bold bg-brand-green-light/40' : 'text-slate-primary hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Cards Grid: Divided into two distinct blocks with equal full-width bar lengths */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1">
        {/* Junior Block */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 shadow-2xs space-y-3.5">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green flex-shrink-0">
              <User className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-secondary">Junior</span>
              <p className="text-2xl font-bold text-slate-primary tracking-tight leading-tight mt-0.5">
                {stats.junior.total}
              </p>
              <p className="text-xs text-slate-secondary mt-1">
                Eating: <span className="font-bold text-slate-primary">{stats.junior.eating}</span>{' '}
                <span className="text-brand-green font-semibold">({stats.junior.percentage}%)</span>
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full">
            <div className="h-2.5 w-full bg-slate-200/80 rounded-full border border-slate-300/90 shadow-2xs overflow-hidden p-[1px]">
              <div
                className="h-full bg-brand-green rounded-full shadow-xs transition-all duration-500"
                style={{ width: `${stats.junior.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Senior Block */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 shadow-2xs space-y-3.5">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-brand-blue-light flex items-center justify-center text-brand-blue flex-shrink-0">
              <Users className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-secondary">Senior</span>
              <p className="text-2xl font-bold text-slate-primary tracking-tight leading-tight mt-0.5">
                {stats.senior.total}
              </p>
              <p className="text-xs text-slate-secondary mt-1">
                Eating: <span className="font-bold text-slate-primary">{stats.senior.eating}</span>{' '}
                <span className="text-brand-blue font-semibold">({stats.senior.percentage}%)</span>
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full">
            <div className="h-2.5 w-full bg-slate-200/80 rounded-full border border-slate-300/90 shadow-2xs overflow-hidden p-[1px]">
              <div
                className="h-full bg-brand-blue rounded-full shadow-xs transition-all duration-500"
                style={{ width: `${stats.senior.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

