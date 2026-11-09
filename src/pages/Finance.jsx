import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Info,
  Utensils,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeCategoryFinance } from '../utils/financeEngine';
import { calculateMonthCalendar } from '../utils/allocationEngine';
import Modal from '../components/common/Modal';

export default function Finance() {
  const navigate = useNavigate();
  const { data, currency, updateCategoryBudget, generateMonthlyAllocation, addToast } = useApp();
  const { financeOverview } = data;
  const events = data.events || [];
  const mealEntries = data.mealEntries || [];

  // Month navigation: support 2025, 2026, 2027
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const allMonths = useMemo(() => {
    const list = [];
    [2025, 2026, 2027].forEach((yr) => {
      monthNames.forEach((mName, mIdx) => {
        list.push({
          label: `${mName} ${yr}`,
          year: yr,
          monthIndex: mIdx,
          monthName: mName,
        });
      });
    });
    return list;
  }, []);

  // Synchronized selected month from AppContext
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return data.selectedMonth || 'November 2026';
  });

  useEffect(() => {
    if (data.selectedMonth) {
      setSelectedMonth(data.selectedMonth);
    }
  }, [data.selectedMonth]);

  const activeMonthObj = useMemo(() => {
    return allMonths.find((m) => m.label === selectedMonth) || {
      label: 'November 2026',
      year: 2026,
      monthIndex: 10,
      monthName: 'November',
    };
  }, [allMonths, selectedMonth]);

  const calendarYear = activeMonthObj.year;
  const calendarMonthIdx = activeMonthObj.monthIndex;

  // Real-time calculated month calendar stats (working days, off days, quotas)
  const calendarStats = useMemo(() => {
    return calculateMonthCalendar(activeMonthObj.year, activeMonthObj.monthIndex);
  }, [activeMonthObj]);

  // Calendar Month Picker Popover State
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(activeMonthObj.year);
  const calendarPickerRef = useRef(null);

  useEffect(() => {
    setPickerYear(activeMonthObj.year);
  }, [activeMonthObj.year]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarPickerRef.current && !calendarPickerRef.current.contains(event.target)) {
        setIsCalendarPickerOpen(false);
      }
    };
    if (isCalendarPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarPickerOpen]);

  // Handle month change and immediately synchronize allocations across the ERP
  const handleMonthChange = (monthLabel, isUserExplicit = true) => {
    setSelectedMonth(monthLabel);
    const targetMonth = allMonths.find((m) => m.label === monthLabel);
    if (targetMonth) {
      const stats = calculateMonthCalendar(targetMonth.year, targetMonth.monthIndex);
      if (generateMonthlyAllocation) {
        generateMonthlyAllocation(monthLabel, stats.workingDaysCount, true);
      }
    }
  };

  const selectMonthFromPicker = (monthIndex, yr) => {
    const targetLabel = `${monthNames[monthIndex]} ${yr}`;
    handleMonthChange(targetLabel, true);
    setIsCalendarPickerOpen(false);
  };

  const currentMonthIdx = allMonths.findIndex((m) => m.label === selectedMonth);
  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      handleMonthChange(allMonths[currentMonthIdx - 1].label, true);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < allMonths.length - 1) {
      handleMonthChange(allMonths[currentMonthIdx + 1].label, true);
    }
  };

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
  const [activePreset, setActivePreset] = useState('all'); // 'today' | 'month' | 'custom' | 'all'
  const todayStr = '2026-11-08';
  const startOfMonthStr = '2026-11-01';
  const endOfMonthStr = '2026-11-30';

  const handleSelectToday = () => {
    setActivePreset('today');
    setFilterStartDate(todayStr);
    setFilterEndDate(todayStr);
  };

  const handleSelectThisMonth = () => {
    setActivePreset('month');
    setFilterStartDate(startOfMonthStr);
    setFilterEndDate(endOfMonthStr);
  };

  const handleClearFilter = () => {
    setActivePreset('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Deduplicate and sanitize events strictly matching Events section
  const uniqueEvents = useMemo(() => {
    const map = new Map();
    events.forEach((ev) => {
      if (ev && ev.id && ev.id !== 'EVT-1000' && ev.id !== 'EVT-1002' && !map.has(ev.id)) {
        map.set(ev.id, ev);
      }
    });
    return Array.from(map.values());
  }, [events]);

  // Accurate event-month matcher matching Events module logic
  const isEventInCalendarMonth = (ev, year, monthIdx) => {
    const dateStr = ev.fullDate || ev.date;
    if (dateStr) {
      const matchYMD = String(dateStr).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (matchYMD) {
        return parseInt(matchYMD[1], 10) === year && (parseInt(matchYMD[2], 10) - 1) === monthIdx;
      }
      const matchDMY = String(dateStr).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (matchDMY) {
        return parseInt(matchDMY[3], 10) === year && (parseInt(matchDMY[2], 10) - 1) === monthIdx;
      }
    }
    const monthAbbr = monthNames[monthIdx].slice(0, 3).toLowerCase();
    const evMonth = (ev.month || '').toLowerCase();
    const evYear = ev.year ? parseInt(ev.year, 10) : 2026;
    return evMonth.startsWith(monthAbbr) && evYear === year;
  };

  const getEventDay = (ev) => {
    const dateStr = ev.fullDate || ev.date;
    if (dateStr) {
      const matchYMD = String(dateStr).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (matchYMD) return parseInt(matchYMD[3], 10);
      const matchDMY = String(dateStr).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (matchDMY) return parseInt(matchDMY[1], 10);
    }
    return parseInt(ev.day, 10);
  };

  // Events strictly scheduled in the viewed calendar month
  const calendarMonthEvents = useMemo(() => {
    return uniqueEvents.filter((ev) => isEventInCalendarMonth(ev, calendarYear, calendarMonthIdx));
  }, [uniqueEvents, calendarYear, calendarMonthIdx]);

  const calendarMonthEventBudget = useMemo(() => {
    return calendarMonthEvents.reduce((sum, ev) => sum + (ev.overallBudget || 0), 0);
  }, [calendarMonthEvents]);

  // Fast string-based range check without regex or Date allocations
  const isDateInRange = (dateStr, start, end) => {
    if (!start && !end) return true;
    if (!dateStr) return false;
    const d = String(dateStr).slice(0, 10);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };

  // Filtered Events within selected date range
  const filteredEvents = useMemo(() => {
    return uniqueEvents.filter((ev) => isDateInRange(ev.fullDate, filterStartDate, filterEndDate));
  }, [uniqueEvents, filterStartDate, filterEndDate]);

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

  // Pre-index only the events present in the active calendar month
  const eventsByDay = useMemo(() => {
    const map = {};
    calendarMonthEvents.forEach((ev) => {
      const d = getEventDay(ev);
      if (d && d >= 1 && d <= totalDaysInMonth) {
        if (!map[d]) map[d] = [];
        map[d].push(ev);
      }
    });
    return map;
  }, [calendarMonthEvents, totalDaysInMonth]);

  const handleCalendarDayClick = (dayNum) => {
    const formatted = `${calendarYear}-${String(calendarMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    if (filterStartDate === formatted && filterEndDate === formatted) {
      setActivePreset('all');
      setFilterStartDate('');
      setFilterEndDate('');
    } else {
      setActivePreset('custom');
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
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-surface-border shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-brand-blue shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-slate-primary whitespace-nowrap">
                Filter Financial Period & Events
              </h3>
            </div>
          </div>

          {/* Right-aligned Presets (Today & This Month) and Start / End Date Inputs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start lg:justify-end gap-2.5 w-full lg:w-auto">
            {/* Presets: Today and This Month */}
            <div className="inline-flex p-0.5 bg-slate-100/90 rounded-xl shrink-0">
              <button
                type="button"
                onClick={handleSelectToday}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer ${
                  activePreset === 'today'
                    ? 'bg-brand-green text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleSelectThisMonth}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer ${
                  activePreset === 'month'
                    ? 'bg-brand-green text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                This Month
              </button>
            </div>

            {/* Start and End Date Inputs */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-surface-border rounded-xl px-2.5 py-1.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0">From:</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => {
                    setFilterStartDate(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="text-xs bg-transparent focus:outline-none text-slate-800 w-full min-w-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-50 border border-surface-border rounded-xl px-2.5 py-1.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0">To:</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => {
                    setFilterEndDate(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="text-xs bg-transparent focus:outline-none text-slate-800 w-full min-w-0 cursor-pointer"
                />
              </div>

              {(filterStartDate || filterEndDate) && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Clear Filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Macro Monthly Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Allocated Regular Mess Budget (Excluding Events) */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Total Allocated Budget</span>
          <p className="text-2xl font-bold text-slate-primary mt-1">
            {(filterStartDate || filterEndDate ? periodAllocatedBenchmark : fin.totalBudget).toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-muted mt-2">
            <span>{filterStartDate || filterEndDate ? `Prorated Benchmark (${daysInScope} Days)` : 'Approved by Finance Board (Mess Only)'}</span>
          </div>
        </div>

        {/* 2. Daily Mess Realized Cost */}
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

        {/* 3. Remaining Operating Buffer (Regular Mess Only, Event Budget Not Subtracted) */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Remaining Operating Buffer</span>
          <p className="text-2xl font-bold text-[#009B4D] mt-1">
            {Math.max(0, (filterStartDate || filterEndDate ? periodAllocatedBenchmark : fin.totalBudget) - filteredMessSpent).toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-brand-green mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Available Operating Liquidity</span>
          </div>
        </div>

        {/* 4. Special Event Catering Budget - Moved to the Last Position */}
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
      </div>

      {/* Allocation Cycle & Quota Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Cycle & Working Days */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex flex-col justify-between relative">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
            <span className="text-xs font-semibold text-slate-secondary tracking-wide uppercase">Cycle & Working Days</span>
            <div className="relative" ref={calendarPickerRef}>
              <button
                type="button"
                onClick={() => setIsCalendarPickerOpen(!isCalendarPickerOpen)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  isCalendarPickerOpen
                    ? "border-brand-green bg-brand-green text-white shadow-pill font-bold"
                    : "border-brand-green/30 bg-brand-green-light/40 text-brand-green hover:bg-brand-green hover:text-white"
                }`}
                title="Select month from calendar"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Pick Month</span>
              </button>

              {/* Calendar Month Picker Popover */}
              {isCalendarPickerOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white rounded-2xl shadow-xl border border-surface-border p-3.5 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2.5 border-b border-surface-border mb-2.5">
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => Math.max(2024, y - 1))}
                      className="p-1 rounded-lg text-slate-secondary hover:text-slate-primary hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Previous Year"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-primary tracking-wide">
                      {pickerYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => Math.min(2030, y + 1))}
                      className="p-1 rounded-lg text-slate-secondary hover:text-slate-primary hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Next Year"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {monthNames.map((name, idx) => {
                      const isSelected = activeMonthObj.monthIndex === idx && activeMonthObj.year === pickerYear;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => selectMonthFromPicker(idx, pickerYear)}
                          className={`py-2 rounded-xl text-center font-semibold text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-green text-white shadow-pill font-bold"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {name.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-surface-border flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Current: {calendarStats.monthName}</span>
                    <button
                      type="button"
                      onClick={() => selectMonthFromPicker(10, 2026)}
                      className="text-brand-blue font-bold hover:underline cursor-pointer"
                    >
                      Nov 2026
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 flex-1 items-center">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-primary">{selectedMonth}</p>
              <span className="text-xs text-brand-green font-medium mt-1">
                {calendarStats.totalDays} Days in Month
              </span>
            </div>
            <div className="border-l border-surface-border/60 pl-4 flex flex-col items-center justify-center text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-primary">{calendarStats.workingDaysCount} Days</p>
              <span className="text-xs text-slate-muted mt-1">
                {calendarStats.fridaysCount} Fri + {calendarStats.saturdaysCount} Sat (0 Credits)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Meal Quotas & Timing */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
            <span className="text-xs font-semibold text-slate-secondary tracking-wide uppercase">Meal Allowance & Quotas</span>
            <div className="flex items-center space-x-2 text-slate-muted">
              <Utensils className="w-4 h-4 text-brand-green" />
              <Layers className="w-4 h-4 text-brand-blue" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 flex-1 items-center">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-primary">3 Meals / Day</p>
            </div>
            <div className="border-l border-surface-border/60 pl-4 flex flex-col items-center justify-center text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-primary">
                {calendarStats.allocationsPerEmployee} Meals
              </p>
            </div>
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
                    disabled={currentMonthIdx <= 0}
                    className="p-1 rounded-md text-slate-secondary hover:text-slate-primary hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={currentMonthIdx >= allMonths.length - 1}
                    className="p-1 rounded-md text-slate-secondary hover:text-slate-primary hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
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
            const dayEvents = eventsByDay[d] || [];
            const hasEvent = dayEvents.length > 0;

            return (
              <div
                key={d}
                onClick={() => handleCalendarDayClick(d)}
                className={`min-h-20 p-2.5 rounded-xl border transition-colors flex flex-col justify-between cursor-pointer select-none ${
                  isSelected
                    ? 'ring-2 ring-brand-green border-brand-green bg-emerald-50 shadow-xs'
                    : hasEvent
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-2xs hover:border-amber-400'
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

        <div className="pt-3 border-t border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-secondary">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-brand-green">Scheduled Events: {calendarMonthEvents.length}</span>
            <span>•</span>
            <span>Total Dedicated Event Budget: {calendarMonthEventBudget.toLocaleString()} {currency}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="flex items-center space-x-1 text-brand-green hover:text-brand-green-hover font-semibold transition-colors cursor-pointer"
          >
            <span>Manage in Events Module</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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

