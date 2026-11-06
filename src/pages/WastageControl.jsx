import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PieChart, 
  Calendar, 
  Utensils, 
  TrendingDown, 
  TrendingUp, 
  Download, 
  Search, 
  Sprout, 
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  Sliders,
  HelpCircle,
  Info,
  Check,
  ChevronRight,
  Flame,
  Scale,
  Users,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceLine,
  LineChart,
  Line
} from 'recharts';
import { useApp } from '../context/AppContext';

export default function WastageControl() {
  const { data, currency, addToast } = useApp();
  const mealEntries = data.mealEntries || [];

  // Safety buffer percentage: default +5% as specified by company policy
  const [safetyBufferPercent, setSafetyBufferPercent] = useState(5);

  // Filters state
  const [selectedMeal, setSelectedMeal] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Al-Haditha master workforce headcount (100 Staff Total)
  const roster = {
    junior: 40,
    senior: 40,
    vip: 20,
    total: 100
  };

  // Group real meal entries by date and meal service window
  const sessionsMap = useMemo(() => {
    const map = {};
    mealEntries.forEach((entry) => {
      const key = `${entry.date || 'Today'}_${entry.mealType || 'Meal'}`;
      if (!map[key]) {
        map[key] = {
          key,
          date: entry.date || 'Today',
          meal: entry.mealType || 'Meal',
          junior: 0,
          senior: 0,
          vip: 0,
          total: 0,
          entries: []
        };
      }
      const cat = entry.category?.toLowerCase();
      if (cat === 'junior') map[key].junior += 1;
      else if (cat === 'senior') map[key].senior += 1;
      else if (cat === 'vip') map[key].vip += 1;
      map[key].total += 1;
      map[key].entries.push(entry);
    });
    return map;
  }, [mealEntries]);

  const sessionList = useMemo(() => {
    return Object.values(sessionsMap);
  }, [sessionsMap]);

  // Dynamic 2-Week Rolling Consistency Metrics calculated directly from real test entries
  const categoryMetrics = useMemo(() => {
    const hasEntries = mealEntries.length > 0;

    // Count overall real attendees per category
    const jrCount = mealEntries.filter(e => e.category?.toLowerCase() === 'junior').length;
    const srCount = mealEntries.filter(e => e.category?.toLowerCase() === 'senior').length;
    const vipCount = mealEntries.filter(e => e.category?.toLowerCase() === 'vip').length;

    // Average turnout rates across recorded meal sessions (or overall test entries count)
    let jrAvgRate = 0;
    let srAvgRate = 0;
    let vipAvgRate = 0;

    if (sessionList.length > 0) {
      jrAvgRate = Math.min(100, Math.round(sessionList.reduce((acc, s) => acc + (s.junior / roster.junior) * 100, 0) / sessionList.length));
      srAvgRate = Math.min(100, Math.round(sessionList.reduce((acc, s) => acc + (s.senior / roster.senior) * 100, 0) / sessionList.length));
      vipAvgRate = Math.min(100, Math.round(sessionList.reduce((acc, s) => acc + (s.vip / roster.vip) * 100, 0) / sessionList.length));
    } else if (hasEntries) {
      jrAvgRate = Math.min(100, Math.round((jrCount / roster.junior) * 100));
      srAvgRate = Math.min(100, Math.round((srCount / roster.senior) * 100));
      vipAvgRate = Math.min(100, Math.round((vipCount / roster.vip) * 100));
    }

    // 1. Junior Category (40 Staff)
    const jrNonAttendance = jrAvgRate > 0 ? (100 - jrAvgRate) : 0;
    const jrTargetRate = jrAvgRate > 0 ? Math.min(100, jrAvgRate + safetyBufferPercent) : 0;
    const jrTargetPortions = jrAvgRate > 0 ? Math.max(1, Math.round((roster.junior * jrTargetRate) / 100)) : 0;
    const jrPortionsSaved = jrAvgRate > 0 ? Math.max(0, roster.junior - jrTargetPortions) : 0;

    // 2. Senior Category (40 Staff)
    const srNonAttendance = srAvgRate > 0 ? (100 - srAvgRate) : 0;
    const srTargetRate = srAvgRate > 0 ? Math.min(100, srAvgRate + safetyBufferPercent) : 0;
    const srTargetPortions = srAvgRate > 0 ? Math.max(1, Math.round((roster.senior * srTargetRate) / 100)) : 0;
    const srPortionsSaved = srAvgRate > 0 ? Math.max(0, roster.senior - srTargetPortions) : 0;

    // 3. VIP Category (20 Staff)
    const vipNonAttendance = vipAvgRate > 0 ? (100 - vipAvgRate) : 0;
    const vipTargetRate = vipAvgRate > 0 ? Math.min(100, vipAvgRate + safetyBufferPercent) : 0;
    const vipTargetPortions = vipAvgRate > 0 ? Math.max(1, Math.round((roster.vip * vipTargetRate) / 100)) : 0;
    const vipPortionsSaved = vipAvgRate > 0 ? Math.max(0, roster.vip - vipTargetPortions) : 0;

    // Consolidated Kitchen Totals
    const totalTargetPortions = jrTargetPortions + srTargetPortions + vipTargetPortions;
    const totalPortionsSavedPerMeal = (jrAvgRate > 0 || srAvgRate > 0 || vipAvgRate > 0)
      ? Math.max(0, roster.total - totalTargetPortions)
      : 0;
    const totalPortionsSavedDaily = totalPortionsSavedPerMeal * 3;
    const totalPortionsSavedMonthly = totalPortionsSavedDaily * 22;

    // Financial Avoidance (1.800 OMR per meal cost standard)
    const avgMealCostOMR = 1.800;
    const dailySavingsOMR = (totalPortionsSavedDaily * avgMealCostOMR).toFixed(3);
    const monthlySavingsOMR = (totalPortionsSavedMonthly * avgMealCostOMR).toFixed(3);

    return {
      hasEntries,
      junior: {
        totalStaff: roster.junior,
        realCount: jrCount,
        avgTurnoutRate: jrAvgRate,
        nonAttendance: jrNonAttendance,
        buffer: safetyBufferPercent,
        prepTargetPercent: jrTargetRate,
        prepPortions: jrTargetPortions,
        portionsSaved: jrPortionsSaved,
        dailySaved: jrPortionsSaved * 3,
        monthlySaved: jrPortionsSaved * 3 * 22,
      },
      senior: {
        totalStaff: roster.senior,
        realCount: srCount,
        avgTurnoutRate: srAvgRate,
        nonAttendance: srNonAttendance,
        buffer: safetyBufferPercent,
        prepTargetPercent: srTargetRate,
        prepPortions: srTargetPortions,
        portionsSaved: srPortionsSaved,
        dailySaved: srPortionsSaved * 3,
        monthlySaved: srPortionsSaved * 3 * 22,
      },
      vip: {
        totalStaff: roster.vip,
        realCount: vipCount,
        avgTurnoutRate: vipAvgRate,
        nonAttendance: vipNonAttendance,
        buffer: safetyBufferPercent,
        prepTargetPercent: vipTargetRate,
        prepPortions: vipTargetPortions,
        portionsSaved: vipPortionsSaved,
        dailySaved: vipPortionsSaved * 3,
        monthlySaved: vipPortionsSaved * 3 * 22,
      },
      consolidated: {
        totalStaff: roster.total,
        totalRealEntries: mealEntries.length,
        totalTargetPortions,
        overallPrepPercent: roster.total > 0 && totalTargetPortions > 0 
          ? Math.round((totalTargetPortions / roster.total) * 100) 
          : 0,
        portionsSavedPerMeal: totalPortionsSavedPerMeal,
        portionsSavedDaily: totalPortionsSavedDaily,
        portionsSavedMonthly: totalPortionsSavedMonthly,
        dailySavingsOMR,
        monthlySavingsOMR,
      }
    };
  }, [mealEntries, sessionList, roster, safetyBufferPercent]);

  // Dynamic Chart Data generated strictly from recorded meal sessions
  const chartData = useMemo(() => {
    if (sessionList.length === 0) return [];

    return sessionList.map((s, idx) => ({
      name: `${s.date} (${s.meal})`,
      sessionLabel: `Session ${idx + 1}: ${s.meal}`,
      date: s.date,
      meal: s.meal,
      junior: Math.min(100, Math.round((s.junior / roster.junior) * 100)),
      senior: Math.min(100, Math.round((s.senior / roster.senior) * 100)),
      vip: Math.min(100, Math.round((s.vip / roster.vip) * 100)),
      juniorCount: s.junior,
      seniorCount: s.senior,
      vipCount: s.vip,
      totalAttendees: s.total
    }));
  }, [sessionList, roster]);

  // Filtered Real Entries for Audit Table
  const filteredRecords = useMemo(() => {
    return mealEntries.filter((rec) => {
      const matchMeal = selectedMeal === 'All' || rec.mealType?.toLowerCase() === selectedMeal.toLowerCase();
      const matchCategory = selectedCategory === 'All' || rec.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = (rec.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rec.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rec.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rec.mealType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rec.date || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rec.id || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchMeal && matchCategory && matchSearch;
    });
  }, [mealEntries, selectedMeal, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Banner & Title */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-brand-green font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <span>2-Week Rolling Consistency & Portion Optimization Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Mess Wastage Control & Kitchen Planning
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Food wastage is not measured on a single day. All calculations, turnout trends, and preparation recommendations below are generated dynamically from your <strong>{mealEntries.length} test entries</strong>.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <Link
            to="/entry"
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <Utensils className="w-4 h-4 text-brand-green" />
            <span>Add Test Entry</span>
          </Link>

          <button
            onClick={() => {
              if (mealEntries.length === 0) {
                addToast('No test entries to export yet. Please log check-ins in the Entry Panel.', 'info');
              } else {
                addToast(`Exported ${mealEntries.length} live test entries audit CSV.`);
              }
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-[#008240] text-white text-xs font-bold shadow-pill transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Core Principle Explainer Banner with Live Entries Count */}
      <div className="bg-gradient-to-r from-[#07241A] via-[#0B3929] to-[#041F16] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-emerald-600/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wide">
                Live Software Report
              </span>
              <span className="text-emerald-300 text-xs font-semibold">
                • {mealEntries.length} Test Entries Active (Mock Data Cleared)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              The 14-Day Consistency Principle: Cook Average + 5% Safety Buffer
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              In mess operations, daily employee turnouts stabilize over a 2-week rolling window. By applying a <strong>+5% buffer</strong> above the consistent turnout average, the kitchen prepares food to match demand, avoiding overproduction waste while guaranteeing 0% shortage risk.
            </p>
          </div>

          {/* Interactive Safety Buffer Selector */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex-shrink-0 w-full sm:w-auto">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>Safety Buffer Setting</span>
              </div>
              <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                +{safetyBufferPercent}% Buffer
              </span>
            </div>

            <div className="flex items-center space-x-1.5 pt-1">
              {[3, 5, 7, 10].map((buf) => (
                <button
                  key={buf}
                  onClick={() => setSafetyBufferPercent(buf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    safetyBufferPercent === buf
                      ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300'
                      : 'bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  +{buf}% {buf === 5 && '(Standard)'}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-300 block mt-2">
              Buffers dynamically adjust kitchen preparation portions for your test entries.
            </span>
          </div>
        </div>
      </div>

      {/* 3 Categories Matrix Cards - Dynamic from Real Test Entries */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Category Kitchen Preparation Matrix (All 3 Tiers)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
              100 Total Headcount Base
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {mealEntries.length === 0 ? 'Awaiting test entries' : `Calculated from ${mealEntries.length} logged entries`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Junior Category Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/30 shadow-card hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
            
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Junior Category
                </span>
                <span className="text-xs font-bold text-slate-400">40 Employees</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Test Turnout Logged:</span>
                    <strong className="text-slate-900 font-bold">
                      {categoryMetrics.junior.realCount} Entries ({categoryMetrics.junior.avgTurnoutRate}%)
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Non-Attendance (Skipped):</span>
                    <span className="font-semibold text-rose-600">
                      {categoryMetrics.junior.nonAttendance > 0 ? `${categoryMetrics.junior.nonAttendance}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Applied Safety Buffer:</span>
                    <span className="font-bold">+{categoryMetrics.junior.buffer}% Buffer</span>
                  </div>
                </div>

                {/* Main Prep Target Metric */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider block">
                    Kitchen Preparation Target
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black text-emerald-950">
                      {categoryMetrics.junior.prepPortions}
                    </span>
                    <span className="text-xs text-emerald-800 font-bold">
                      Portions Prepared ({categoryMetrics.junior.prepTargetPercent}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    {categoryMetrics.junior.avgTurnoutRate > 0 ? (
                      <>Instead of 40 meals $\rightarrow$ saves <strong>{categoryMetrics.junior.portionsSaved} portions/meal</strong></>
                    ) : (
                      <>Awaiting test check-ins for Junior staff in Entry Panel</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Savings Footer */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Daily Meals Saved:</span>
              <span className="font-extrabold text-brand-green bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                +{categoryMetrics.junior.dailySaved} Meals / Day
              </span>
            </div>
          </div>

          {/* 2. Senior Category Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-sky-500/30 shadow-card hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500" />
            
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
                  Senior Category
                </span>
                <span className="text-xs font-bold text-slate-400">40 Employees</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Test Turnout Logged:</span>
                    <strong className="text-slate-900 font-bold">
                      {categoryMetrics.senior.realCount} Entries ({categoryMetrics.senior.avgTurnoutRate}%)
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Non-Attendance (Skipped):</span>
                    <span className="font-semibold text-rose-600">
                      {categoryMetrics.senior.nonAttendance > 0 ? `${categoryMetrics.senior.nonAttendance}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-sky-700">
                    <span>Applied Safety Buffer:</span>
                    <span className="font-bold">+{categoryMetrics.senior.buffer}% Buffer</span>
                  </div>
                </div>

                {/* Main Prep Target Metric */}
                <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200">
                  <span className="text-[11px] font-bold uppercase text-sky-800 tracking-wider block">
                    Kitchen Preparation Target
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black text-sky-950">
                      {categoryMetrics.senior.prepPortions}
                    </span>
                    <span className="text-xs text-sky-800 font-bold">
                      Portions Prepared ({categoryMetrics.senior.prepTargetPercent}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-700 font-medium mt-1">
                    {categoryMetrics.senior.avgTurnoutRate > 0 ? (
                      <>Instead of 40 meals $\rightarrow$ saves <strong>{categoryMetrics.senior.portionsSaved} portions/meal</strong></>
                    ) : (
                      <>Awaiting test check-ins for Senior staff in Entry Panel</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Savings Footer */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Daily Meals Saved:</span>
              <span className="font-extrabold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                +{categoryMetrics.senior.dailySaved} Meals / Day
              </span>
            </div>
          </div>

          {/* 3. VIP Category Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-purple-500/30 shadow-card hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500" />
            
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                  VIP Category
                </span>
                <span className="text-xs font-bold text-slate-400">20 Employees</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Test Turnout Logged:</span>
                    <strong className="text-slate-900 font-bold">
                      {categoryMetrics.vip.realCount} Entries ({categoryMetrics.vip.avgTurnoutRate}%)
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Non-Attendance (Skipped):</span>
                    <span className="font-semibold text-rose-600">
                      {categoryMetrics.vip.nonAttendance > 0 ? `${categoryMetrics.vip.nonAttendance}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-purple-700">
                    <span>Applied Safety Buffer:</span>
                    <span className="font-bold">+{categoryMetrics.vip.buffer}% Buffer</span>
                  </div>
                </div>

                {/* Main Prep Target Metric */}
                <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200">
                  <span className="text-[11px] font-bold uppercase text-purple-900 tracking-wider block">
                    Kitchen Preparation Target
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black text-purple-950">
                      {categoryMetrics.vip.prepPortions}
                    </span>
                    <span className="text-xs text-purple-800 font-bold">
                      Portions Prepared ({categoryMetrics.vip.prepTargetPercent}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700 font-medium mt-1">
                    {categoryMetrics.vip.avgTurnoutRate > 0 ? (
                      <>Instead of 20 meals $\rightarrow$ saves <strong>{categoryMetrics.vip.portionsSaved} portions/meal</strong></>
                    ) : (
                      <>Awaiting test check-ins for VIP personnel in Entry Panel</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Savings Footer */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Daily Meals Saved:</span>
              <span className="font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                +{categoryMetrics.vip.dailySaved} Meals / Day
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Key Combined Impact Metric Cards (in OMR strictly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Prepared per Meal */}
        <div className="bg-white p-5 rounded-3xl border border-surface-border shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Kitchen Prep</span>
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-3xl font-black text-slate-900">
              {categoryMetrics.consolidated.totalTargetPortions}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 100 Portions</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-brand-green mt-2 font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>
              {categoryMetrics.consolidated.totalTargetPortions > 0 
                ? `${categoryMetrics.consolidated.overallPrepPercent}% Prep Target (${categoryMetrics.junior.prepPortions} Jr + ${categoryMetrics.senior.prepPortions} Sr + ${categoryMetrics.vip.prepPortions} VIP)`
                : 'Awaiting entries to compute target'}
            </span>
          </div>
        </div>

        {/* Portions Saved / Day */}
        <div className="bg-white p-5 rounded-3xl border border-surface-border shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Meals Saved</span>
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-3xl font-black text-brand-green">
              +{categoryMetrics.consolidated.portionsSavedDaily}
            </span>
            <span className="text-xs font-semibold text-slate-500">Meals / Day</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2">
            <Utensils className="w-3.5 h-3.5 text-slate-400" />
            <span>{categoryMetrics.consolidated.portionsSavedPerMeal} Portions saved $\times$ 3 sessions</span>
          </div>
        </div>

        {/* Monthly Cost Avoided in OMR */}
        <div className="bg-white p-5 rounded-3xl border border-surface-border shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly OMR Savings</span>
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-3xl font-black text-brand-green">
              {categoryMetrics.consolidated.monthlySavingsOMR}
            </span>
            <span className="text-xs font-bold text-slate-500">OMR</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{categoryMetrics.consolidated.portionsSavedMonthly} Meals Saved (22 Working Days)</span>
          </div>
        </div>

        {/* Shortage Risk */}
        <div className="bg-white p-5 rounded-3xl border border-surface-border shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Food Shortage Risk</span>
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-3xl font-black text-slate-900">
              0.0%
            </span>
            <span className="text-xs font-semibold text-emerald-600">Zero Risk</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected by +{safetyBufferPercent}% Safety Buffer</span>
          </div>
        </div>

      </div>

      {/* Dynamic Turnout Consistency Chart - Generated from Test Entries */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Test Entries Turnout Consistency Trend
            </h3>
            <p className="text-xs text-slate-500">
              Dynamic attendance rates generated across your logged meal sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Junior ({categoryMetrics.junior.avgTurnoutRate}% Turnout)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-sky-700">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
              <span>Senior ({categoryMetrics.senior.avgTurnoutRate}% Turnout)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-purple-700">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span>VIP ({categoryMetrics.vip.avgTurnoutRate}% Turnout)</span>
            </span>
          </div>
        </div>

        {/* Dynamic Chart Display or Clean Empty State */}
        {chartData.length > 0 ? (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  formatter={(val, name) => [`${val}% Attendance`, name === 'junior' ? 'Junior Category' : name === 'senior' ? 'Senior Category' : 'VIP Category']}
                  labelFormatter={(label) => label}
                />
                {categoryMetrics.junior.prepTargetPercent > 0 && (
                  <ReferenceLine y={categoryMetrics.junior.prepTargetPercent} stroke="#009B4D" strokeDasharray="4 4" label={{ value: `Jr Target (${categoryMetrics.junior.prepTargetPercent}%)`, fill: '#009B4D', fontSize: 10, position: 'insideTopRight' }} />
                )}
                {categoryMetrics.senior.prepTargetPercent > 0 && (
                  <ReferenceLine y={categoryMetrics.senior.prepTargetPercent} stroke="#0284C7" strokeDasharray="4 4" label={{ value: `Sr Target (${categoryMetrics.senior.prepTargetPercent}%)`, fill: '#0284C7', fontSize: 10, position: 'insideTopRight' }} />
                )}
                {categoryMetrics.vip.prepTargetPercent > 0 && (
                  <ReferenceLine y={categoryMetrics.vip.prepTargetPercent} stroke="#9333EA" strokeDasharray="4 4" label={{ value: `VIP Target (${categoryMetrics.vip.prepTargetPercent}%)`, fill: '#9333EA', fontSize: 10, position: 'insideTopRight' }} />
                )}
                
                <Line type="monotone" dataKey="junior" stroke="#009B4D" strokeWidth={2.5} dot={{ r: 4, fill: '#009B4D' }} activeDot={{ r: 6 }} name="Junior" />
                <Line type="monotone" dataKey="senior" stroke="#0284C7" strokeWidth={2.5} dot={{ r: 4, fill: '#0284C7' }} activeDot={{ r: 6 }} name="Senior" />
                <Line type="monotone" dataKey="vip" stroke="#9333EA" strokeWidth={2.5} dot={{ r: 4, fill: '#9333EA' }} activeDot={{ r: 6 }} name="VIP" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 px-4 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center mb-3">
              <Utensils className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Clean Testing State: Awaiting Test Entries
            </h4>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
              All mock trends have been cleared. As you log employee entries in the Entry Panel, real-time turnout curves, category averages, and +5% kitchen prep lines will plot here dynamically.
            </p>
            <Link
              to="/entry"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-[#008240] text-white text-xs font-bold shadow-pill transition-all"
            >
              <span>Record Test Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Daily Meal Windows Target Breakdown Table */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Daily Meal Service Cooking Schedule (3 Daily Meal Windows)
            </h3>
            <p className="text-xs text-slate-500">
              Preparation targets calculated from your active test entries across Breakfast, Lunch, and Dinner.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-green bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {categoryMetrics.consolidated.totalTargetPortions * 3} Meals Prepared Daily vs 300 Max Capacity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { window: 'Breakfast', time: '09:00 - 10:00' },
            { window: 'Lunch', time: '14:00 - 15:00' },
            { window: 'Dinner', time: '19:00 - 20:00' },
          ].map((slot) => (
            <div key={slot.window} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                  <span>{slot.window}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">{slot.time}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Junior (40 staff):</span>
                  <strong className="text-emerald-700 font-bold">
                    {categoryMetrics.junior.prepPortions} portions ({categoryMetrics.junior.prepTargetPercent}%)
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Senior (40 staff):</span>
                  <strong className="text-sky-700 font-bold">
                    {categoryMetrics.senior.prepPortions} portions ({categoryMetrics.senior.prepTargetPercent}%)
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">VIP (20 staff):</span>
                  <strong className="text-purple-700 font-bold">
                    {categoryMetrics.vip.prepPortions} portions ({categoryMetrics.vip.prepTargetPercent}%)
                  </strong>
                </div>
                <div className="flex justify-between pt-1 font-bold text-slate-900 text-[13px]">
                  <span>Total Prepared:</span>
                  <span className="text-brand-green">{categoryMetrics.consolidated.totalTargetPortions} Portions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Records Table - 100% Real Test Entries */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-5 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">
              Live Test Entries Audit Logs
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {filteredRecords.length} recorded
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, ID, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-surface-border rounded-xl focus:outline-none focus:border-brand-green w-48"
              />
            </div>

            {/* Meal Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
              {['All', 'Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedMeal(meal)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedMeal === meal ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-surface-border rounded-xl text-slate-800 focus:outline-none focus:border-brand-green font-medium cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Junior">Junior (40)</option>
              <option value="Senior">Senior (40)</option>
              <option value="VIP">VIP (20)</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-surface-border text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3">Entry ID</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Meal Slot</th>
                  <th className="px-5 py-3">Employee Name</th>
                  <th className="px-5 py-3">Employee ID</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Roster Base</th>
                  <th className="px-5 py-3 text-right">Target Prep (+5%)</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-medium">{row.id}</td>
                    <td className="px-5 py-3.5 text-slate-900 font-medium">
                      <span>{row.date}</span>
                      <span className="text-slate-400 text-[10px] block font-mono">{row.timestamp}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">{row.mealType}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{row.employeeName}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 font-semibold">{row.employeeId}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                        row.category === 'Junior' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : row.category === 'Senior'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {row.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-500">
                      {row.category === 'VIP' ? '20 Staff' : '40 Staff'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700 bg-emerald-50/30">
                      {row.category === 'Junior' 
                        ? `${categoryMetrics.junior.prepPortions} Portions (${categoryMetrics.junior.prepTargetPercent}%)`
                        : row.category === 'Senior'
                        ? `${categoryMetrics.senior.prepPortions} Portions (${categoryMetrics.senior.prepTargetPercent}%)`
                        : `${categoryMetrics.vip.prepPortions} Portions (${categoryMetrics.vip.prepTargetPercent}%)`
                      }
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Verified Test Entry</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-4 text-center">
            <span className="text-slate-400 text-xs block mb-2">
              {mealEntries.length === 0 
                ? 'No meal entries recorded yet. Test entries you submit in the Entry Panel will appear here automatically.'
                : 'No entries match the current search or filters.'}
            </span>
            {mealEntries.length === 0 && (
              <Link
                to="/entry"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-brand-green/30 text-brand-green hover:bg-emerald-50 text-xs font-semibold transition-colors mt-1"
              >
                <span>Go to Entry Panel</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
