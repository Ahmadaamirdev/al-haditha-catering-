import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Edit3, 
  User, 
  Users, 
  Gem, 
  ArrowUpRight, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Filter,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeCategoryFinance } from '../utils/financeEngine';
import Modal from '../components/common/Modal';

export default function Finance() {
  const navigate = useNavigate();
  const { data, currency, updateCategoryBudget, addToast } = useApp();
  const { financeOverview } = data;
  const events = data.events || [];
  const mealEntries = data.mealEntries || [];

  // Compute live synchronized finance metrics directly from real meal entries
  const fin = useMemo(() => {
    return computeCategoryFinance({
      financeOverview,
      mealEntries
    });
  }, [financeOverview, mealEntries]);

  // Modals state
  const [isEditRatesOpen, setIsEditRatesOpen] = useState(false);

  // Edit rates form
  const [ratesForm, setRatesForm] = useState({
    junior: financeOverview?.categoryRates?.junior?.rate ?? 5,
    senior: financeOverview?.categoryRates?.senior?.rate ?? 10,
  });

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateCategoryBudget('junior', ratesForm.junior);
    updateCategoryBudget('senior', ratesForm.senior);
    setIsEditRatesOpen(false);
  };

  // Date Filtering State for Variance & Budget Difference
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Event Financial Calendar State
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonthIdx, setCalendarMonthIdx] = useState(10); // 10 = November
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Total Event Expenditure across all scheduled events
  const totalEventExpenditure = useMemo(() => {
    return events.reduce((sum, ev) => sum + (ev.overallBudget || 0), 0);
  }, [events]);

  // Helper to test if a date string falls inside the active date filter
  const isDateInRange = (dateStr, start, end) => {
    if (!start && !end) return true;
    if (!dateStr) return false;
    let normalized = dateStr;
    const match = String(dateStr).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        normalized = d.toISOString().split('T')[0];
      }
    }
    if (start && normalized < start) return false;
    if (end && normalized > end) return false;
    return true;
  };

  // Filtered Events within selected date range
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => isDateInRange(ev.fullDate, filterStartDate, filterEndDate));
  }, [events, filterStartDate, filterEndDate]);

  // Filtered Event Expenditure
  const filteredEventExpenditure = useMemo(() => {
    return filteredEvents.reduce((sum, ev) => sum + (ev.overallBudget || 0), 0);
  }, [filteredEvents]);

  // Filtered Meal Entries within selected date range
  const filteredEntries = useMemo(() => {
    return mealEntries.filter((m) => isDateInRange(m.date, filterStartDate, filterEndDate));
  }, [mealEntries, filterStartDate, filterEndDate]);

  // Realized Meal Spending within selected date range
  const filteredMessSpent = useMemo(() => {
    const jrRate = Number(financeOverview?.categoryRates?.junior?.rate ?? 5);
    const srRate = Number(financeOverview?.categoryRates?.senior?.rate ?? 10);
    return filteredEntries.reduce((sum, m) => {
      const cat = (m.category || '').toLowerCase();
      if (cat === 'junior') return sum + jrRate;
      if (cat === 'senior') return sum + srRate;
      return sum + jrRate;
    }, 0);
  }, [filteredEntries, financeOverview]);

  // Scope day count and benchmark for selected range
  const daysInScope = useMemo(() => {
    if (!filterStartDate && !filterEndDate) return 30;
    if (filterStartDate && filterEndDate) {
      const s = new Date(filterStartDate);
      const e = new Date(filterEndDate);
      const diffTime = Math.abs(e - s);
      return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
    return 1;
  }, [filterStartDate, filterEndDate]);

  const periodAllocatedBenchmark = useMemo(() => {
    if (!filterStartDate && !filterEndDate) return fin.totalBudget;
    return Math.round((fin.totalBudget / 30) * daysInScope);
  }, [filterStartDate, filterEndDate, daysInScope, fin.totalBudget]);

  const periodTotalActual = filteredMessSpent + filteredEventExpenditure;
  const periodVariance = periodAllocatedBenchmark - periodTotalActual;
  const isPeriodUnderBudget = periodVariance >= 0;

  // Calendar matrix calculations
  const firstDayOfWeek = new Date(calendarYear, calendarMonthIdx, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstDayOfWeek });
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    if (calendarMonthIdx === 0) {
      setCalendarMonthIdx(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonthIdx((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonthIdx === 11) {
      setCalendarMonthIdx(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonthIdx((m) => m + 1);
    }
  };

  const handleCalendarDayClick = (dayNum) => {
    const formatted = `${calendarYear}-${String(calendarMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    if (filterStartDate === formatted && filterEndDate === formatted) {
      setFilterStartDate('');
      setFilterEndDate('');
    } else {
      setFilterStartDate(formatted);
      setFilterEndDate(formatted);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Financial Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Mess Catering & Meal Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Per-head subsidies, vendor meal cost accounting, and monthly expenditure controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditRatesOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-primary shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-secondary" />
            <span>Edit Category Rates</span>
          </button>
        </div>
      </div>

      {/* Category Rates Overview Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Junior */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-all relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-green/5 rounded-bl-full pointer-events-none" />
          
          {/* Top: Icon, Tier Title & 5 OMR Rate */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green-light flex items-center justify-center text-brand-green shadow-xs flex-shrink-0">
                <User className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Junior Employee Tier
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Standard Mess Allowance
                </span>
              </div>
            </div>

            {/* 5 OMR at Top */}
            <div className="text-right">
              <span className="inline-flex items-baseline space-x-1 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <strong className="text-sm font-extrabold text-slate-900">{financeOverview.categoryRates.junior.rate} {currency}</strong>
                <span className="text-[11px] text-slate-500 font-medium">/ person / meal</span>
              </span>
            </div>
          </div>

          {/* Center: Main Metrics (Monthly Allocation Pool & Spent) with Bigger Font Size */}
          <div className="grid grid-cols-2 gap-4 py-1 text-center items-center">
            {/* Monthly Allocation */}
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Monthly Allocation
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                13,200 <span className="text-base font-bold text-slate-600">{currency}</span>
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5">Approved Category Pool</span>
            </div>

            {/* Realized Spent */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider block">
                Total Realized Spent
              </span>
              <p className="text-2xl sm:text-3xl font-black text-brand-green tracking-tight mt-1">
                {fin.jrSpent} <span className="text-base font-bold text-emerald-700">{currency}</span>
              </p>
              <span className="text-[10px] text-emerald-800 font-semibold mt-0.5">{fin.jrMeals} Meals Consumed</span>
            </div>
          </div>
        </div>

        {/* Senior */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-all relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-28 h-28 bg-brand-blue/5 rounded-bl-full pointer-events-none" />
          
          {/* Top: Icon, Tier Title & 10 OMR Rate */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue-light flex items-center justify-center text-brand-blue shadow-xs flex-shrink-0">
                <Users className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Senior Employee Tier
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Senior Staff Allowance
                </span>
              </div>
            </div>

            {/* 10 OMR at Top */}
            <div className="text-right">
              <span className="inline-flex items-baseline space-x-1 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <strong className="text-sm font-extrabold text-slate-900">{financeOverview.categoryRates.senior.rate} {currency}</strong>
                <span className="text-[11px] text-slate-500 font-medium">/ person / meal</span>
              </span>
            </div>
          </div>

          {/* Center: Main Metrics (Monthly Allocation Pool & Spent) with Bigger Font Size */}
          <div className="grid grid-cols-2 gap-4 py-1 text-center items-center">
            {/* Monthly Allocation */}
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Monthly Allocation
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                26,400 <span className="text-base font-bold text-slate-600">{currency}</span>
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5">Approved Category Pool</span>
            </div>

            {/* Realized Spent */}
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider block">
                Total Realized Spent
              </span>
              <p className="text-2xl sm:text-3xl font-black text-brand-blue tracking-tight mt-1">
                {fin.srSpent} <span className="text-base font-bold text-sky-800">{currency}</span>
              </p>
              <span className="text-[10px] text-sky-800 font-semibold mt-0.5">{fin.srMeals} Meals Consumed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Bar - Positioned directly at top of Macro Budget Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm sm:text-base font-bold text-slate-primary">
              Filter Financial Period & Events
            </h3>
            {(filterStartDate || filterEndDate) && (
              <span className="text-[11px] font-semibold text-brand-green bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full ml-1">
                Active Filter
              </span>
            )}
          </div>

          {/* Right-aligned Presets (All Dates & Today) and Start / End Date Inputs */}
          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2.5">
            {/* Presets: Only All Dates and Today */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  !filterStartDate && !filterEndDate
                    ? 'bg-brand-green text-white shadow-pill font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Dates
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setFilterStartDate(today);
                  setFilterEndDate(today);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterStartDate && filterStartDate === new Date().toISOString().split('T')[0] && filterEndDate === filterStartDate
                    ? 'bg-brand-green text-white shadow-pill font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Today
              </button>
            </div>

            {/* Start and End Date Inputs aligned to the right */}
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-surface-border rounded-xl px-2.5 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">From:</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="text-xs bg-transparent focus:outline-none text-slate-800"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-50 border border-surface-border rounded-xl px-2.5 py-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">To:</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="text-xs bg-transparent focus:outline-none text-slate-800"
                />
              </div>

              {(filterStartDate || filterEndDate) && (
                <button
                  type="button"
                  onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                  className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Clear Date Filter"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Macro Monthly Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Total Allocated Budget</span>
          <p className="text-2xl font-bold text-slate-primary mt-1">
            {(filterStartDate || filterEndDate ? periodAllocatedBenchmark : fin.totalBudget).toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-muted mt-2">
            <span>{filterStartDate || filterEndDate ? `Prorated Benchmark (${daysInScope} Days)` : 'Approved by Finance Board'}</span>
          </div>
        </div>

        {/* Special Event Catering Budget - Prominently Displayed */}
        <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-5 rounded-2xl border border-amber-200 shadow-card relative overflow-hidden">
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Special Event Budget</span>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-1">
            {filteredEventExpenditure.toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-amber-800 mt-2 font-medium">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Dedicated Banquet & Event Pool</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Daily Mess Realized Cost</span>
          <p className="text-2xl font-bold text-[#1684AA] mt-1">
            {filteredMessSpent.toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-brand-blue mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Staff Meal Intake ({filteredEntries.length} Meals)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Remaining Operating Buffer</span>
          <p className="text-2xl font-bold text-[#009B4D] mt-1">
            {Math.max(0, (filterStartDate || filterEndDate ? periodAllocatedBenchmark : fin.totalBudget) - filteredMessSpent - filteredEventExpenditure).toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-brand-green mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Available Operating Liquidity</span>
          </div>
        </div>
      </div>

      {/* Event Financial Calendar */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Calendar className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-primary">
                  Event Financial Calendar & Schedule: {monthNames[calendarMonthIdx]} {calendarYear}
                </h2>
                <div className="flex items-center space-x-1 ml-2 bg-slate-100 p-0.5 rounded-lg border border-surface-border">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-md text-slate-secondary hover:text-slate-primary hover:bg-white transition-colors cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-md text-slate-secondary hover:text-slate-primary hover:bg-white transition-colors cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-secondary mt-0.5">
                Clear monthly map showing scheduled banquets, guest attendance, and dedicated event budgets. Click any day to filter.
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="text-center py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-50 text-slate-600 border border-slate-100"
            >
              {d}
            </div>
          ))}

          {/* Blank Padding cells */}
          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className="min-h-20 rounded-xl bg-slate-50/40 border border-dashed border-slate-200/50" />
          ))}

          {/* Month Days */}
          {monthDays.map((d) => {
            const dateStr = `${calendarYear}-${String(calendarMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = filterStartDate === dateStr && filterEndDate === dateStr;
            const dayEvents = events.filter((ev) => {
              if (ev.fullDate && ev.fullDate.startsWith(dateStr)) return true;
              if (Number(ev.day) === d && (calendarMonthIdx === 10 || ev.month === 'Nov')) return true;
              return false;
            });
            const hasEvent = dayEvents.length > 0;

            return (
              <div
                key={d}
                onClick={() => handleCalendarDayClick(d)}
                className={`min-h-20 p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none ${
                  isSelected
                    ? 'ring-2 ring-brand-green border-brand-green bg-emerald-50/90 shadow-sm scale-[1.02]'
                    : hasEvent
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-xs hover:border-amber-400 hover:shadow-sm'
                    : 'bg-white border-surface-border hover:border-slate-300 hover:bg-slate-50/50'
                }`}
                title={hasEvent ? `Event on ${d} ${monthNames[calendarMonthIdx]}: Click to filter budget` : `Day ${d}: Click to filter budget`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    isSelected ? 'text-brand-green' : hasEvent ? 'text-amber-950 font-black' : 'text-slate-700'
                  }`}>
                    {d}
                  </span>
                  {hasEvent && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
                      EVENT
                    </span>
                  )}
                </div>

                {hasEvent ? (
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/events', { state: { highlightEventId: ev.id } });
                        }}
                        className="p-1 rounded-lg border border-amber-300 bg-white/95 hover:bg-amber-100 hover:border-amber-500 text-[10px] space-y-0.5 shadow-2xs transition-all cursor-pointer group"
                        title={`Click to open "${ev.title}" directly in Events module`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate block leading-tight group-hover:text-amber-950">
                            {ev.title}
                          </span>
                          <ArrowRight className="w-3 h-3 text-amber-700 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-amber-800 font-semibold">
                          <span>{ev.expectedCount || ev.invitedCount || 0} Guests</span>
                          <span className="text-amber-950 font-bold">{(ev.overallBudget || 0).toLocaleString()} {currency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-300 font-medium">Regular Mess</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-surface-border flex items-center justify-end text-xs text-slate-secondary">
          <span className="font-semibold text-brand-green">Total Events: {events.length}</span>
        </div>
      </div>

      {/* Modal: Edit Category Rates */}
      <Modal
        isOpen={isEditRatesOpen}
        onClose={() => setIsEditRatesOpen(false)}
        title="Edit Category Meal Budgets"
        subtitle="Set per-person meal allowance rate for each staff tier."
      >
        <form onSubmit={handleSaveRates} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Junior Budget ({currency} / person / meal)
            </label>
            <input
              type="number"
              min="1"
              required
              value={ratesForm.junior}
              onChange={(e) => setRatesForm({ ...ratesForm, junior: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
            <p className="text-[11px] text-slate-muted mt-1">Default benchmark: 5 {currency}/person</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Senior Budget ({currency} / person / meal)
            </label>
            <input
              type="number"
              min="1"
              required
              value={ratesForm.senior}
              onChange={(e) => setRatesForm({ ...ratesForm, senior: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
            <p className="text-[11px] text-slate-muted mt-1">Default benchmark: 10 {currency}/person</p>
          </div>



          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditRatesOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
            >
              Update Rates
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

