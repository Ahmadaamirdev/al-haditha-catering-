import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Utensils, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Clock, 
  Filter, 
  Sun, 
  Moon,
  Info 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Format Date helper (YYYY-MM-DD)
function toIsoDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function WastageControl() {
  const { data } = useApp();
  const mealEntries = data.mealEntries || [];
  const employees = data.employees || [];

  const totalStaff = employees.length || 80;
  const juniorStaffCount = employees.filter((e) => (e.category || '').toLowerCase() === 'junior').length || 40;
  const seniorStaffCount = employees.filter((e) => (e.category || '').toLowerCase() === 'senior').length || 40;

  // Default to current month range
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIsoDate(today), [today]);

  const startOfMonthIso = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return toIsoDate(d);
  }, [today]);

  // Date range states
  const [startDate, setStartDate] = useState(startOfMonthIso);
  const [endDate, setEndDate] = useState(todayIso);
  const [activePreset, setActivePreset] = useState('month'); // 'today' | 'week' | 'month' | 'all' | 'custom'

  // Quick preset handlers
  const applyPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    if (preset === 'today') {
      const iso = toIsoDate(now);
      setStartDate(iso);
      setEndDate(iso);
    } else if (preset === 'week') {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      setStartDate(toIsoDate(past7));
      setEndDate(toIsoDate(now));
    } else if (preset === 'month') {
      setStartDate(startOfMonthIso);
      setEndDate(toIsoDate(now));
    } else if (preset === 'all') {
      let earliest = '2026-10-25';
      if (mealEntries && mealEntries.length > 0) {
        const sortedDates = mealEntries
          .map((e) => e.date)
          .filter(Boolean)
          .sort();
        if (sortedDates.length > 0) {
          earliest = sortedDates[0];
        }
      }
      setStartDate(earliest);
      setEndDate(toIsoDate(now));
    }
  };

  // Filter entries strictly within selected start and end dates
  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) return mealEntries;
    return mealEntries.filter((entry) => {
      const entryDate = entry.date || todayIso;
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;
      return true;
    });
  }, [mealEntries, startDate, endDate, todayIso]);

  // Calculate total working days in the selected date range (excluding Fridays and Saturdays)
  const workingDaysInRange = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 1;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
      if (day !== 5 && day !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, count);
  }, [startDate, endDate]);

  const totalConsumed = filteredEntries.length;
  const activeDaysCount = workingDaysInRange;

  // Helper for real-time meal stats (Breakfast, Lunch, Dinner)
  const getMealStats = (mealName) => {
    const mName = mealName.toLowerCase();
    const entries = filteredEntries.filter((e) => (e.mealType || '').toLowerCase() === mName);
    const totalTaken = entries.length;
    const juniorTaken = entries.filter((e) => (e.category || '').toLowerCase() === 'junior').length;
    const seniorTaken = entries.filter((e) => (e.category || '').toLowerCase() === 'senior').length;

    const avgTotal = activeDaysCount > 0 ? (totalTaken / activeDaysCount).toFixed(1) : '0';
    const avgJunior = activeDaysCount > 0 ? (juniorTaken / activeDaysCount).toFixed(1) : '0';
    const avgSenior = activeDaysCount > 0 ? (seniorTaken / activeDaysCount).toFixed(1) : '0';

    const totalPossible = totalStaff * activeDaysCount;
    const turnoutRate = totalPossible > 0 ? Math.min(100, Math.round((totalTaken / totalPossible) * 100)) : 0;

    return {
      totalTaken,
      juniorTaken,
      seniorTaken,
      avgTotal,
      avgJunior,
      avgSenior,
      turnoutRate,
    };
  };

  const breakfastStats = useMemo(() => getMealStats('breakfast'), [filteredEntries, activeDaysCount, totalStaff]);
  const lunchStats = useMemo(() => getMealStats('lunch'), [filteredEntries, activeDaysCount, totalStaff]);
  const dinnerStats = useMemo(() => getMealStats('dinner'), [filteredEntries, activeDaysCount, totalStaff]);

  // Dynamic recommendation for each specific service window (Professional Range)
  const getMealRecommendation = (stats) => {
    const avg = Number(stats.avgTotal) || 0;
    const avgJr = Number(stats.avgJunior) || 0;
    const avgSr = Number(stats.avgSenior) || 0;

    if (stats.totalTaken === 0) {
      return {
        target: '2 - 4',
        junior: '1 - 2',
        senior: '1 - 2',
      };
    }

    const minTarget = Math.max(1, Math.round(avg * 1.05));
    const maxTarget = Math.max(minTarget + 4, Math.ceil(avg * 1.25));

    const minJr = Math.max(0, Math.round(avgJr * 1.05));
    const maxJr = Math.max(minJr + 2, Math.ceil(avgJr * 1.25));

    const minSr = Math.max(0, minTarget - minJr);
    const maxSr = Math.max(minSr + 2, maxTarget - maxJr);

    return {
      target: `${minTarget} - ${maxTarget}`,
      junior: `${minJr} - ${maxJr}`,
      senior: `${minSr} - ${maxSr}`,
    };
  };

  const bfRec = useMemo(() => getMealRecommendation(breakfastStats), [breakfastStats]);
  const lunchRec = useMemo(() => getMealRecommendation(lunchStats), [lunchStats]);
  const dinnerRec = useMemo(() => getMealRecommendation(dinnerStats), [dinnerStats]);

  // Overall category counts across the period
  const juniorCount = filteredEntries.filter((e) => (e.category || '').toLowerCase() === 'junior').length;
  const seniorCount = filteredEntries.filter((e) => (e.category || '').toLowerCase() === 'senior').length;

  const avgDailyEmployees = activeDaysCount > 0 ? (totalConsumed / activeDaysCount).toFixed(1) : '0';
  const avgJuniorDaily = activeDaysCount > 0 ? (juniorCount / activeDaysCount).toFixed(1) : '0';
  const avgSeniorDaily = activeDaysCount > 0 ? (seniorCount / activeDaysCount).toFixed(1) : '0';

  const isDataSufficient = totalConsumed >= 3;

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight">
            Mess Intake & Wastage Control
          </h1>
        </div>
      </div>

      {/* Date Filter Bar - Professional Layout */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-brand-green" />
            <h3 className="text-sm sm:text-base font-bold text-slate-primary">
              Filter Attendance & Meal Period
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2.5">
            {/* Presets */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePreset === p.id
                      ? 'bg-brand-green text-white shadow-pill font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Date Inputs */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-surface-border p-1 rounded-xl shadow-2xs text-xs">
              <div className="flex items-center space-x-1.5 px-2 py-0.5">
                <span className="text-[11px] font-bold text-slate-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="text-xs bg-transparent focus:outline-none text-slate-800 font-semibold cursor-pointer"
                />
              </div>

              <span className="text-slate-400 font-bold">→</span>

              <div className="flex items-center space-x-1.5 px-2 py-0.5">
                <span className="text-[11px] font-bold text-slate-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="text-xs bg-transparent focus:outline-none text-slate-800 font-semibold cursor-pointer"
                />
              </div>

              {activePreset === 'custom' && (
                <button
                  type="button"
                  onClick={() => applyPreset('month')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Reset to This Month"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Real-Time Meal Cards: Breakfast, Lunch, Dinner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Breakfast */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card hover:border-amber-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                  Breakfast Service
                </span>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>09:00 - 10:00 AM</span>
                </span>
              </div>
              <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold shadow-2xs">
                <Sun className="w-4.5 h-4.5" />
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-primary tracking-tight">
                  {breakfastStats.totalTaken}
                </span>
                <span className="text-xs font-semibold text-slate-secondary">
                  Employees Taken Meal
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Overall Average: <strong className="text-amber-900 font-bold">{breakfastStats.avgTotal} employees / day</strong>
              </p>
            </div>
          </div>

          {/* Category-wise Average Daily Attendees */}
          <div className="mt-5 pt-3.5 border-t border-surface-border space-y-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Category-Wise Daily Attendees:
            </span>

            {/* Junior */}
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-brand-green flex-shrink-0" />
                <span>Junior ({juniorStaffCount} Staff):</span>
              </span>
              <span className="font-semibold text-slate-900 text-xs">
                Avg <strong className="text-brand-green font-bold text-sm">{breakfastStats.avgJunior}</strong> / day
                <span className="text-slate-400 font-normal ml-1">({breakfastStats.juniorTaken} total)</span>
              </span>
            </div>

            {/* Senior */}
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />
                <span>Senior ({seniorStaffCount} Staff):</span>
              </span>
              <span className="font-semibold text-slate-900 text-xs">
                Avg <strong className="text-brand-blue font-bold text-sm">{breakfastStats.avgSenior}</strong> / day
                <span className="text-slate-400 font-normal ml-1">({breakfastStats.seniorTaken} total)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Lunch */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card hover:border-sky-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue block">
                  Lunch Service
                </span>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>14:00 - 15:00 PM</span>
                </span>
              </div>
              <span className="w-9 h-9 rounded-xl bg-sky-50 text-brand-blue border border-sky-200 flex items-center justify-center font-bold shadow-2xs">
                <Utensils className="w-4.5 h-4.5" />
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-primary tracking-tight">
                  {lunchStats.totalTaken}
                </span>
                <span className="text-xs font-semibold text-slate-secondary">
                  Employees Taken Meal
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Overall Average: <strong className="text-brand-blue font-bold">{lunchStats.avgTotal} employees / day</strong>
              </p>
            </div>
          </div>

          {/* Category-wise Average Daily Attendees */}
          <div className="mt-5 pt-3.5 border-t border-surface-border space-y-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Category-Wise Daily Attendees:
            </span>

            {/* Junior */}
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-brand-green flex-shrink-0" />
                <span>Junior ({juniorStaffCount} Staff):</span>
              </span>
              <span className="font-semibold text-slate-900 text-xs">
                Avg <strong className="text-brand-green font-bold text-sm">{lunchStats.avgJunior}</strong> / day
                <span className="text-slate-400 font-normal ml-1">({lunchStats.juniorTaken} total)</span>
              </span>
            </div>

            {/* Senior */}
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />
                <span>Senior ({seniorStaffCount} Staff):</span>
              </span>
              <span className="font-semibold text-slate-900 text-xs">
                Avg <strong className="text-brand-blue font-bold text-sm">{lunchStats.avgSenior}</strong> / day
                <span className="text-slate-400 font-normal ml-1">({lunchStats.seniorTaken} total)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Dinner */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                  Dinner Service
                </span>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>19:00 - 20:00 PM</span>
                </span>
              </div>
              <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold shadow-2xs">
                <Moon className="w-4.5 h-4.5" />
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-primary tracking-tight">
                  {dinnerStats.totalTaken}
                </span>
                <span className="text-xs font-semibold text-slate-secondary">
                  Employees Taken Meal
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Overall Average: <strong className="text-indigo-900 font-bold">{dinnerStats.avgTotal} employees / day</strong>
              </p>
            </div>
          </div>

          {/* Category-wise Average Daily Attendees */}
          <div className="mt-5 pt-3.5 border-t border-surface-border space-y-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Category-Wise Daily Attendees:
            </span>

            {/* Junior */}
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-brand-green flex-shrink-0" />
                <span>Junior ({juniorStaffCount} Staff):</span>
              </span>
              <span className="font-semibold text-slate-900 text-xs">
                Avg <strong className="text-brand-green font-bold text-sm">{dinnerStats.avgJunior}</strong> / day
                <span className="text-slate-400 font-normal ml-1">({dinnerStats.juniorTaken} total)</span>
              </span>
            </div>

            {/* Senior */}
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />
                <span>Senior ({seniorStaffCount} Staff):</span>
              </span>
              <span className="font-semibold text-slate-900 text-xs">
                Avg <strong className="text-brand-blue font-bold text-sm">{dinnerStats.avgSenior}</strong> / day
                <span className="text-slate-400 font-normal ml-1">({dinnerStats.seniorTaken} total)</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Simplified Summary & Service Window Preparation Targets */}
      <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-card">
        <div>
          {!isDataSufficient ? (
            /* Insufficient Data State */
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Insufficient data for selected period
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Only <strong>{totalConsumed} meal attendance {totalConsumed === 1 ? 'entry' : 'entries'}</strong> recorded between {startDate} and {endDate}. 
                  Log meal attendance from the Entry Panel to generate statistical averages.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Clear Recommendations for EVERY Service Window */}
              <div>
                <div className="flex items-center space-x-2.5 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-primary tracking-tight">
                    Recommended Meal Preparation per Service Window
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Breakfast Recommendation Card */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center space-x-2 text-amber-900 mb-2">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Breakfast (09:00 - 10:00)</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                      Cook for {bfRec.target} Employees
                    </div>
                  </div>

                  {/* Lunch Recommendation Card */}
                  <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center space-x-2 text-brand-blue mb-2">
                      <Utensils className="w-4 h-4 text-brand-blue" />
                      <span className="text-xs font-bold uppercase tracking-wider">Lunch (14:00 - 15:00)</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-sky-950 tracking-tight">
                      Cook for {lunchRec.target} Employees
                    </div>
                  </div>

                  {/* Dinner Recommendation Card */}
                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center space-x-2 text-indigo-900 mb-2">
                      <Moon className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Dinner (19:00 - 20:00)</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                      Cook for {dinnerRec.target} Employees
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
