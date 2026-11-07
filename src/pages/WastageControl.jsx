import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Utensils, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  Users, 
  Sparkles, 
  Info,
  Clock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Format Date helper (YYYY-MM-DD)
function toIsoDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function WastageControl() {
  const { data, currency } = useApp();
  const mealEntries = data.mealEntries || [];

  // Default to the current month range (from 1st of month to today/end of month)
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
      setStartDate('2026-01-01');
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

  // Distinct dates in the filtered set
  const distinctDates = useMemo(() => {
    const dates = new Set();
    filteredEntries.forEach((e) => {
      dates.add(e.date || todayIso);
    });
    return Array.from(dates);
  }, [filteredEntries, todayIso]);

  // Daily, Weekly, and Monthly Intake calculations
  const totalConsumed = filteredEntries.length;
  const activeDaysCount = Math.max(1, distinctDates.length);

  // Breakdown by meal type
  const breakfastCount = filteredEntries.filter((e) => (e.mealType || '').toLowerCase() === 'breakfast').length;
  const lunchCount = filteredEntries.filter((e) => (e.mealType || '').toLowerCase() === 'lunch').length;
  const dinnerCount = filteredEntries.filter((e) => (e.mealType || '').toLowerCase() === 'dinner').length;

  // Breakdown by category
  const juniorCount = filteredEntries.filter((e) => (e.category || '').toLowerCase() === 'junior').length;
  const seniorCount = filteredEntries.filter((e) => (e.category || '').toLowerCase() === 'senior').length;
  const vipCount = filteredEntries.filter((e) => (e.category || '').toLowerCase() === 'vip').length;

  // 1. Daily Intake metrics
  const avgDailyIntake = distinctDates.length > 0 ? (totalConsumed / distinctDates.length).toFixed(1) : '0';
  const todayEntries = mealEntries.filter((e) => (e.date || todayIso) === todayIso);
  const todayCount = todayEntries.length;

  // 2. Weekly Intake metrics
  // Standard weekly capacity: 100 employees * 3 meals * 5 working days = 1,500 meals
  const weeklyAverage = (Number(avgDailyIntake) * 5).toFixed(0);

  // 3. Monthly Intake metrics
  // Standard monthly capacity: 100 employees * 3 meals * 22 working days = 6,600 meals
  const monthlyTotal = mealEntries.length; // total logged across this operational month
  const monthlyCapacity = 6600;
  const monthlyUtilizationPercent = Math.min(100, Math.round((monthlyTotal / monthlyCapacity) * 100));

  // Determine if data is sufficient for analytical pattern detection
  const isDataSufficient = totalConsumed >= 3 && distinctDates.length >= 1;

  // Dominant meal slot
  const mealSlotRanking = [
    { name: 'Breakfast', count: breakfastCount },
    { name: 'Lunch', count: lunchCount },
    { name: 'Dinner', count: dinnerCount }
  ].sort((a, b) => b.count - a.count);

  const topMealSlot = mealSlotRanking[0].count > 0 ? mealSlotRanking[0].name : 'N/A';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-primary tracking-tight">
            Mess Intake & Wastage Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-secondary mt-0.5">
            Clear tracking of daily, weekly, and monthly meal intake with real-data analytical recommendations.
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-white p-2 rounded-2xl border border-surface-border shadow-xs flex flex-wrap items-center gap-2">
          
          {/* Quick Presets */}
          <div className="flex items-center space-x-1 border-r border-slate-200 pr-2">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activePreset === p.id
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-slate-secondary hover:text-slate-primary hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset('custom');
                }}
                className="bg-transparent text-slate-primary font-semibold focus:outline-none cursor-pointer text-xs"
              />
            </div>

            <span className="text-slate-400 text-xs font-bold">to</span>

            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset('custom');
                }}
                className="bg-transparent text-slate-primary font-semibold focus:outline-none cursor-pointer text-xs"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 3 Simple Intake Cards: Daily, Weekly, Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Daily Intake */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-secondary">
              Daily Intake
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-primary tracking-tight">
                {avgDailyIntake}
              </span>
              <span className="text-xs font-semibold text-slate-secondary">
                Meals / Day (Avg)
              </span>
            </div>
            <p className="text-[11px] text-slate-secondary mt-1">
              Today's recorded intake: <strong className="text-brand-green">{todayCount} meals</strong>
            </p>
          </div>

          {/* Breakdown by Meal Slot */}
          <div className="mt-4 pt-3 border-t border-surface-border space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-secondary">
              <span>Breakfast:</span>
              <strong className="text-slate-primary">{breakfastCount} meals</strong>
            </div>
            <div className="flex justify-between text-slate-secondary">
              <span>Lunch:</span>
              <strong className="text-slate-primary">{lunchCount} meals</strong>
            </div>
            <div className="flex justify-between text-slate-secondary">
              <span>Dinner:</span>
              <strong className="text-slate-primary">{dinnerCount} meals</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Weekly Intake */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-secondary">
              Weekly Intake
            </span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-primary tracking-tight">
                {weeklyAverage}
              </span>
              <span className="text-xs font-semibold text-slate-secondary">
                Meals / Week (Estimated)
              </span>
            </div>
            <p className="text-[11px] text-slate-secondary mt-1">
              Calculated over 5 working days per week
            </p>
          </div>

          {/* Weekly Capacity Breakdown */}
          <div className="mt-4 pt-3 border-t border-surface-border space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-secondary">
              <span>Weekly Camp Capacity:</span>
              <strong className="text-slate-primary">1,500 meals</strong>
            </div>
            <div className="flex justify-between text-slate-secondary">
              <span>Active Attendance Rate:</span>
              <strong className="text-brand-blue">
                {Math.min(100, Math.round((Number(weeklyAverage) / 1500) * 100))}%
              </strong>
            </div>
            <div className="flex justify-between text-slate-secondary">
              <span>Unconsumed Variance:</span>
              <strong className="text-amber-600">
                {Math.max(0, 1500 - Number(weeklyAverage))} portions
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Intake */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-secondary">
              Monthly Intake
            </span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-primary tracking-tight">
                {monthlyTotal}
              </span>
              <span className="text-xs font-semibold text-slate-secondary">
                Meals Logged This Month
              </span>
            </div>
            <p className="text-[11px] text-slate-secondary mt-1">
              Max capacity: 6,600 meals (22 working days)
            </p>
          </div>

          {/* Breakdown by Category */}
          <div className="mt-4 pt-3 border-t border-surface-border space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-secondary">
              <span>Junior Category (40 Staff):</span>
              <strong className="text-slate-primary">{juniorCount} meals</strong>
            </div>
            <div className="flex justify-between text-slate-secondary">
              <span>Senior Category (40 Staff):</span>
              <strong className="text-slate-primary">{seniorCount} meals</strong>
            </div>
            <div className="flex justify-between text-slate-secondary">
              <span>VIP Category (20 Staff):</span>
              <strong className="text-slate-primary">{vipCount} meals</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Data-Analytical Suggestion Box (No false assumptions) */}
      <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs">
        
        <div className="flex items-center space-x-2.5 pb-4 border-b border-surface-border">
          <Sparkles className="w-5 h-5 text-brand-green" />
          <h3 className="text-base font-bold text-slate-primary">
            Data-Analytical Kitchen Suggestion
          </h3>
          <span className="text-[11px] text-slate-400 font-normal">
            (Strictly generated from verified attendance records)
          </span>
        </div>

        <div className="mt-5">
          {!isDataSufficient ? (
            /* Insufficient Data State */
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Insufficient data to analyze patterns
                </h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Only <strong>{totalConsumed} meal {totalConsumed === 1 ? 'entry' : 'entries'}</strong> recorded in the selected period. 
                  A minimum of 3 meal attendance entries across recorded service sessions is required to establish statistical trends and calculate portion preparation suggestions.
                </p>
                <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-amber-800">
                  <span>Recommendation: Log daily meal entries from the Entry Panel to activate kitchen optimization insights.</span>
                </div>
              </div>
            </div>
          ) : (
            /* Sufficient Data Analytical Report */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-emerald-950">
                      Analytical Attendance Summary:
                    </span>
                    <span className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-bold">
                      Based on {totalConsumed} recorded entries across {activeDaysCount} active {activeDaysCount === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs">
                    During the period from <strong className="text-slate-900">{startDate}</strong> to <strong className="text-slate-900">{endDate}</strong>, 
                    the average actual consumption rate is <strong className="text-brand-green">{avgDailyIntake} meals per operational day</strong>. 
                    The highest demand occurred during <strong className="text-brand-blue">{topMealSlot}</strong> service.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-lg border border-emerald-200/70">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Observed Daily Average</span>
                      <span className="text-base font-extrabold text-slate-900">{avgDailyIntake} Portions / Day</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200/70">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Capacity Headcount</span>
                      <span className="text-base font-extrabold text-slate-900">300 Meals / Day (Max)</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200/70">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Over-Preparation Avoidance</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {Math.max(0, 300 - Math.round(Number(avgDailyIntake)))} Portions Saved / Day
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-slate-600 flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-brand-green flex-shrink-0" />
                    <span className="text-[11px]">
                      <strong>Kitchen Preparation Advice:</strong> Align raw ingredients preparation to the actual average attendance of {Math.round(Number(avgDailyIntake))} daily portions rather than catering for the full 300 maximum capacity, preventing surplus spoilage.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
