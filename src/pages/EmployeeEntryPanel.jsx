import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft, 
  IdCard, 
  User, 
  Clock, 
  Check, 
  RotateCcw,
  Sparkles,
  Utensils,
  Sun,
  Moon,
  Calendar,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  getEmployeeRealtimeAllocations, 
  calculateMonthCalendar, 
  MEAL_WINDOWS, 
  getCurrentActiveMealWindow 
} from '../utils/allocationEngine';
import logoAsset from '../assets/logo.png';

// Preset simulation modes to easily verify Day 1, Day 2, and all 3 meal windows
const SIMULATION_MODES = [
  { id: 'REALTIME', label: '🟢 Live Real-Time', timeDesc: 'System Clock' },
  { id: 'DAY1_BF', label: '🌅 Day 1: 09:30 AM (Breakfast)', year: 2026, month: 10, day: 1, hour: 9, min: 30, meal: 'Breakfast' },
  { id: 'DAY1_LUNCH', label: '☀️ Day 1: 14:30 PM (Lunch)', year: 2026, month: 10, day: 1, hour: 14, min: 30, meal: 'Lunch' },
  { id: 'DAY1_DINNER', label: '🌙 Day 1: 19:30 PM (Dinner)', year: 2026, month: 10, day: 1, hour: 19, min: 30, meal: 'Dinner' },
  { id: 'DAY1_LATE', label: '⏳ Day 1: 20:30 PM (After Hours)', year: 2026, month: 10, day: 1, hour: 20, min: 30, meal: 'Dinner' },
  { id: 'DAY2_BF', label: '📅 Day 2: 09:30 AM (Breakfast)', year: 2026, month: 10, day: 2, hour: 9, min: 30, meal: 'Breakfast' },
];

export default function EmployeeEntryPanel() {
  const { data, recordMealEntry } = useApp();

  // Inputs: ONLY Employee ID and Name (no dropdowns or prefills)
  const [idInput, setIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Manual meal slot override if outside window or testing
  const [selectedMealWindow, setSelectedMealWindow] = useState('auto');

  // Simulation mode for testing Day 1 / time windows
  const [simMode, setSimMode] = useState('REALTIME');

  // UI feedback states
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoResetTimer, setAutoResetTimer] = useState(null);

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute effective date/time based on simulation or real-time
  const effectiveDate = useMemo(() => {
    if (simMode === 'REALTIME') return currentTime;
    const found = SIMULATION_MODES.find((m) => m.id === simMode);
    if (!found || !found.year) return currentTime;
    return new Date(found.year, found.month, found.day, found.hour, found.min, 0);
  }, [simMode, currentTime]);

  // Determine active meal window
  const activeWindowData = useMemo(() => {
    return getCurrentActiveMealWindow(effectiveDate);
  }, [effectiveDate]);

  // Active meal name
  const effectiveMealName = useMemo(() => {
    if (selectedMealWindow !== 'auto') return selectedMealWindow;
    return activeWindowData.name;
  }, [selectedMealWindow, activeWindowData]);

  // Calendar statistics for effective month
  const monthStats = useMemo(() => {
    return calculateMonthCalendar(effectiveDate.getFullYear(), effectiveDate.getMonth());
  }, [effectiveDate]);

  // Check if today is weekend off-day (Friday or Saturday)
  const isWeekendOffDay = useMemo(() => {
    const dow = effectiveDate.getDay();
    return dow === 5 || dow === 6; // 5 = Fri, 6 = Sat
  }, [effectiveDate]);

  const handleReset = useCallback(() => {
    setIdInput('');
    setNameInput('');
    setResult(null);
    setAutoResetTimer(null);
  }, []);

  // Auto-clear success banner after 10 seconds (or manual reset)
  useEffect(() => {
    if (autoResetTimer === null) return;
    if (autoResetTimer <= 0) {
      handleReset();
      return;
    }
    const t = setTimeout(() => {
      setAutoResetTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(t);
  }, [autoResetTimer, handleReset]);

  // Form submission: requires BOTH ID and Name collectively
  const handleSubmit = (e, allowDuplicate = false) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanId = idInput.trim().toUpperCase();
    const cleanName = nameInput.trim();

    if (!cleanId || !cleanName) {
      setResult({
        approved: false,
        type: 'error',
        message: 'Both Employee ID and Employee Name are required to verify access.'
      });
      return;
    }

    setIsSubmitting(true);

    const mealTypeToRecord = effectiveMealName;
    const simPreset = SIMULATION_MODES.find((m) => m.id === simMode);
    const customDate = simPreset && simPreset.year 
      ? `${simPreset.year}-${String(simPreset.month + 1).padStart(2, '0')}-${String(simPreset.day).padStart(2, '0')}`
      : null;
    const customTimestamp = simPreset && simPreset.hour 
      ? `${String(simPreset.hour).padStart(2, '0')}:${String(simPreset.min).padStart(2, '0')}`
      : null;

    const res = recordMealEntry({
      employeeId: cleanId,
      employeeName: cleanName,
      mealType: mealTypeToRecord,
      facility: 'Main Camp Mess Hall',
      allowDuplicate,
      customDate,
      customTimestamp,
      effectiveDate
    });

    setIsSubmitting(false);

    if (res.isDuplicate) {
      // Calculate latest allocations even on duplicate
      const alloc = getEmployeeRealtimeAllocations({
        employeeId: res.employee.id,
        mealEntries: data.mealEntries || [],
        currentDate: effectiveDate
      });

      setResult({
        approved: false,
        isDuplicate: true,
        type: 'warning',
        employee: res.employee,
        prevEntry: res.prevEntry,
        mealType: mealTypeToRecord,
        allocations: alloc,
        message: `Employee ${res.employee.name} has already logged a ${mealTypeToRecord} meal today at ${res.prevEntry.timestamp}.`
      });
      return;
    }

    if (res.matched && res.success) {
      // Re-compute live allocation stats with this newly recorded entry
      const updatedEntries = res.entry ? [res.entry, ...(data.mealEntries || [])] : (data.mealEntries || []);
      const liveAllocations = getEmployeeRealtimeAllocations({
        employeeId: res.employee.id,
        mealEntries: updatedEntries,
        currentDate: effectiveDate
      });

      setResult({
        approved: true,
        type: 'success',
        employee: res.employee,
        entry: res.entry,
        mealType: mealTypeToRecord,
        allocations: liveAllocations,
        message: `APPROVED: 1 Meal Allocation Deducted (-1)`
      });
      setAutoResetTimer(10); // Display for 10 seconds
    } else {
      setResult({
        approved: false,
        type: 'error',
        message: res.message || 'Verification Failed: Employee ID and Full Name do not match company records.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05131F] via-[#071B2B] to-[#0A263D] text-white flex flex-col justify-between font-sans selection:bg-brand-green selection:text-white">
      
      {/* Top Header */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-white/10 backdrop-blur-md bg-[#071B2B]/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              to="/" 
              className="bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center hover:opacity-95 transition-opacity"
              title="Return to Admin Dashboard"
            >
              <img src={logoAsset} alt="Al-Haditha" className="h-8 sm:h-9 w-auto object-contain" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Mess Attendance Terminal
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Al-Haditha Petroleum Services S.A.O.C
              </h1>
            </div>
          </div>

          {/* Quick Simulation & Live Clock Controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            {/* Live Clock / Simulated Time */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-right">
              <div className="text-xs font-mono font-bold text-white tracking-wider flex items-center space-x-1.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {effectiveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: simMode === 'REALTIME' ? '2-digit' : undefined })}
                </span>
              </div>
              <div className="text-[10px] text-slate-300">
                {effectiveDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                {simMode !== 'REALTIME' && <span className="text-amber-400 font-bold ml-1">(Test Mode)</span>}
              </div>
            </div>

            {/* Return to Dashboard */}
            <Link
              to="/"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#009B4D] hover:bg-[#008240] text-white rounded-xl text-xs font-semibold shadow-pill transition-all hover:scale-[1.02]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Real-time Allocation Schedule Info Bar */}
        <div className="max-w-6xl mx-auto mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          
          {/* Active Windows Legend */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Daily Schedule (3 Meals / Working Day):</span>
            
            {MEAL_WINDOWS.map((win) => {
              const isWinActive = activeWindowData.id === win.id && activeWindowData.status === 'ACTIVE';
              return (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => setSelectedMealWindow(win.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1.5 ${
                    effectiveMealName === win.name
                      ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-300'
                      : isWinActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {win.id === 'breakfast' && <Sun className="w-3 h-3" />}
                  {win.id === 'lunch' && <Utensils className="w-3 h-3" />}
                  {win.id === 'dinner' && <Moon className="w-3 h-3" />}
                  <span>{win.name} ({win.timeSlot})</span>
                  {isWinActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                </button>
              );
            })}

            {selectedMealWindow !== 'auto' && (
              <button
                type="button"
                onClick={() => setSelectedMealWindow('auto')}
                className="text-[10px] text-amber-300 hover:text-amber-200 underline ml-1"
              >
                Reset to Auto
              </button>
            )}
          </div>

          {/* Time & Day Test Selector */}
          <div className="flex items-center space-x-1.5 text-[11px]">
            <span className="text-slate-400">Test Preset:</span>
            <select
              value={simMode}
              onChange={(e) => {
                setSimMode(e.target.value);
                setResult(null);
              }}
              className="bg-slate-900 text-emerald-400 font-semibold border border-white/20 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {SIMULATION_MODES.map((sm) => (
                <option key={sm.id} value={sm.id}>
                  {sm.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </header>

      {/* Main Centered Kiosk Terminal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg mx-auto">
          
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800 relative overflow-hidden transition-all">
            
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#009B4D] via-[#1684AA] to-[#009B4D]" />

            {/* Terminal Header */}
            <div className="text-center pb-5 border-b border-slate-100">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center shadow-xs border border-emerald-100 mb-3">
                <ShieldCheck className="w-7 h-7 text-brand-green" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Employee Meal Check-In
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Type your Employee ID and Full Name. Upon verification, 1 meal allocation will be deducted in real-time.
              </p>
            </div>

            {/* Weekend Notice (if Friday or Saturday) */}
            {isWeekendOffDay && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Camp Weekend Off-Day (Friday / Saturday)</span>
                  <span>Standard allocation is 0 credits today. Entry will still be logged if on-call duty applies.</span>
                </div>
              </div>
            )}

            {/* Entry Form: ONLY ID and Full Name (No dropdowns, no prefills) */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {/* Employee ID Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="empId" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">e.g. AHP-1004, AHP-1041</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    id="empId"
                    type="text"
                    value={idInput}
                    onChange={(e) => {
                      setIdInput(e.target.value.toUpperCase());
                      setResult(null);
                    }}
                    placeholder="Enter Employee ID"
                    autoComplete="off"
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 font-semibold text-sm placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all uppercase tracking-wide"
                  />
                  {idInput && (
                    <button
                      type="button"
                      onClick={() => { setIdInput(''); setResult(null); }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Employee Full Name Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="empName" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Employee Full Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">e.g. Mohammed Al-Harthy</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="empName"
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      setResult(null);
                    }}
                    placeholder="Enter Employee Full Name"
                    autoComplete="off"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all"
                  />
                  {nameInput && (
                    <button
                      type="button"
                      onClick={() => { setNameInput(''); setResult(null); }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Meal Window Badge indicator */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Logging For Meal Service:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md flex items-center space-x-1.5">
                  <Utensils className="w-3.5 h-3.5 text-brand-green" />
                  <span>{effectiveMealName} Window</span>
                </span>
              </div>

              {/* Submit / Verify Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#009B4D] hover:bg-[#008240] text-white text-sm font-bold shadow-pill hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Verifying Details...' : 'Verify & Approve Meal Entry'}</span>
                </button>
              </div>

              {/* Clear Form */}
              {(idInput || nameInput || result) && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear form</span>
                  </button>
                </div>
              )}
            </form>

            {/* Verification Result Card with Real-time Allocations */}
            {result && (
              <div 
                className={`mt-5 rounded-2xl p-5 sm:p-6 border-2 transition-all animate-fade-in shadow-xl ${
                  result.approved
                    ? 'bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 border-emerald-500 text-emerald-950'
                    : result.isDuplicate
                    ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/50 border-amber-400 text-amber-950'
                    : 'bg-gradient-to-b from-rose-50 via-white to-rose-50/50 border-rose-400 text-rose-950'
                }`}
              >
                {/* Result Status Header with Prominent Green Tick Mark */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 pb-4 border-b border-slate-200/80">
                  {result.approved ? (
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-100">
                      {/* Bold Green Tick Mark */}
                      <Check className="w-8 h-8 stroke-[3.5] text-white" />
                    </div>
                  ) : result.isDuplicate ? (
                    <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30 ring-4 ring-amber-100">
                      <AlertTriangle className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30 ring-4 ring-rose-100">
                      <XCircle className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                  )}

                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center space-x-1 ${
                          result.approved 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : result.isDuplicate 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-rose-600 text-white'
                        }`}>
                          {result.approved ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                              <span>Verified & Approved</span>
                            </>
                          ) : result.isDuplicate ? (
                            <span>Duplicate Entry</span>
                          ) : (
                            <span>Verification Rejected</span>
                          )}
                        </span>

                        {result.approved && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            -1 Allocation Deducted
                          </span>
                        )}
                      </div>

                      {autoResetTimer !== null && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Auto resets in {autoResetTimer}s
                        </span>
                      )}
                    </div>

                    <p className="text-base font-extrabold mt-1 text-slate-900 leading-snug">
                      {result.approved 
                        ? `Access Granted for ${result.mealType || effectiveMealName}`
                        : result.message
                      }
                    </p>
                    {result.approved && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        1 meal entry successfully logged into dashboard ledger.
                      </p>
                    )}
                  </div>
                </div>

                {/* Approved Employee Profile & Real-time Allocation Display */}
                {result.employee && (
                  <div className="mt-4 space-y-3.5 text-xs">
                    
                    {/* Employee Profile Pill with Prominent Category */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                          {result.employee.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {result.employee.name}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            ID: <strong className="text-slate-800">{result.employee.id}</strong> • {result.employee.department}
                          </span>
                        </div>
                      </div>

                      {/* Prominent Employee Category Badge */}
                      <div className="flex flex-col items-center sm:items-end">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                          Employee Category
                        </span>
                        <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide uppercase shadow-xs flex items-center space-x-1.5 ${
                          result.employee.category === 'Junior' 
                            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400' :
                          result.employee.category === 'Senior' 
                            ? 'bg-sky-100 text-sky-800 border-2 border-sky-400' :
                            'bg-purple-100 text-purple-900 border-2 border-purple-400'
                        }`}>
                          <span>{result.employee.category} Category</span>
                        </span>
                      </div>
                    </div>

                    {/* Real-Time Remaining Allocations Box */}
                    {result.allocations && (
                      <div className="bg-gradient-to-br from-[#07241A] via-[#093526] to-[#041B13] text-white p-4 rounded-2xl shadow-lg border border-emerald-600/40 space-y-3">
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span>Remaining Allocations</span>
                          </span>
                          <span className="text-[10px] bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                            {monthStats.monthName} ({monthStats.workingDaysCount} Working Days)
                          </span>
                        </div>

                        {/* Large Remaining Allocation Counter */}
                        <div className="bg-black/25 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-emerald-300 block font-medium">Remaining Allocations:</span>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                {result.allocations.remainingMonthlyAllocations}
                              </span>
                              <span className="text-emerald-300 text-xs font-bold">
                                Meals Left
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-300 block">Total Quota:</span>
                            <span className="text-sm font-bold text-white">
                              {result.allocations.totalMonthlyQuota} Meals
                            </span>
                            <div className="mt-1">
                              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold px-2 py-0.5 rounded-md">
                                Consumed: {result.allocations.consumedCount} (-1)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] text-emerald-300 mb-1 font-medium">
                            <span>Balance Utilization</span>
                            <span>{Math.round((result.allocations.remainingMonthlyAllocations / (result.allocations.totalMonthlyQuota || 66)) * 100)}% Available</span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-emerald-800">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700 shadow-sm"
                              style={{ 
                                width: `${Math.min(100, Math.round((result.allocations.remainingMonthlyAllocations / (result.allocations.totalMonthlyQuota || 66)) * 100))}%` 
                              }}
                            />
                          </div>
                        </div>

                        {/* Today's 3 Meals Real-Time Tracker */}
                        <div className="pt-2 border-t border-emerald-800/60">
                          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-1.5">
                            Today's 3 Meal Windows & Expiration Tracker:
                          </span>

                          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                            
                            {/* Breakfast */}
                            <div className={`p-2 rounded-xl border ${
                              result.allocations.todayMealsStatus.breakfast.status === 'CONSUMED'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                : result.allocations.todayMealsStatus.breakfast.status === 'EXPIRED'
                                ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                                : result.allocations.todayMealsStatus.breakfast.status === 'ACTIVE_NOW'
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                              <span className="font-bold block text-[11px]">Breakfast</span>
                              <span className="text-[9px] opacity-75">09:00 - 10:00</span>
                              <span className="mt-1 block font-extrabold uppercase">
                                {result.allocations.todayMealsStatus.breakfast.status === 'CONSUMED' && 'Claimed ✓'}
                                {result.allocations.todayMealsStatus.breakfast.status === 'EXPIRED' && 'Expired (-1)'}
                                {result.allocations.todayMealsStatus.breakfast.status === 'ACTIVE_NOW' && 'Active Now'}
                                {result.allocations.todayMealsStatus.breakfast.status === 'UPCOMING' && 'Upcoming'}
                                {result.allocations.todayMealsStatus.breakfast.status === 'OFF_DAY' && 'Off Day'}
                              </span>
                            </div>

                            {/* Lunch */}
                            <div className={`p-2 rounded-xl border ${
                              result.allocations.todayMealsStatus.lunch.status === 'CONSUMED'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                : result.allocations.todayMealsStatus.lunch.status === 'EXPIRED'
                                ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                                : result.allocations.todayMealsStatus.lunch.status === 'ACTIVE_NOW'
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                              <span className="font-bold block text-[11px]">Lunch</span>
                              <span className="text-[9px] opacity-75">14:00 - 15:00</span>
                              <span className="mt-1 block font-extrabold uppercase">
                                {result.allocations.todayMealsStatus.lunch.status === 'CONSUMED' && 'Claimed ✓'}
                                {result.allocations.todayMealsStatus.lunch.status === 'EXPIRED' && 'Expired (-1)'}
                                {result.allocations.todayMealsStatus.lunch.status === 'ACTIVE_NOW' && 'Active Now'}
                                {result.allocations.todayMealsStatus.lunch.status === 'UPCOMING' && 'Upcoming'}
                                {result.allocations.todayMealsStatus.lunch.status === 'OFF_DAY' && 'Off Day'}
                              </span>
                            </div>

                            {/* Dinner */}
                            <div className={`p-2 rounded-xl border ${
                              result.allocations.todayMealsStatus.dinner.status === 'CONSUMED'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                : result.allocations.todayMealsStatus.dinner.status === 'EXPIRED'
                                ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                                : result.allocations.todayMealsStatus.dinner.status === 'ACTIVE_NOW'
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                              <span className="font-bold block text-[11px]">Dinner</span>
                              <span className="text-[9px] opacity-75">19:00 - 20:00</span>
                              <span className="mt-1 block font-extrabold uppercase">
                                {result.allocations.todayMealsStatus.dinner.status === 'CONSUMED' && 'Claimed ✓'}
                                {result.allocations.todayMealsStatus.dinner.status === 'EXPIRED' && 'Expired (-1)'}
                                {result.allocations.todayMealsStatus.dinner.status === 'ACTIVE_NOW' && 'Active Now'}
                                {result.allocations.todayMealsStatus.dinner.status === 'UPCOMING' && 'Upcoming'}
                                {result.allocations.todayMealsStatus.dinner.status === 'OFF_DAY' && 'Off Day'}
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* Ledger Breakdown Row */}
                        <div className="pt-2 border-t border-emerald-800/40 flex justify-between text-[10px] text-emerald-200/90">
                          <span>Total Quota: <strong>{result.allocations.totalMonthlyQuota}</strong></span>
                          <span>Consumed: <strong className="text-white">{result.allocations.consumedCount}</strong></span>
                          <span>Expired (Missed): <strong className="text-rose-300">{result.allocations.expiredCount}</strong></span>
                          <span>Remaining: <strong className="text-emerald-300">{result.allocations.remainingMonthlyAllocations}</strong></span>
                        </div>

                      </div>
                    )}

                    {/* Action button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full py-2.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        Check In Next Employee
                      </button>
                    </div>

                  </div>
                )}

                {/* Duplicate Override Option */}
                {result.isDuplicate && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit(null, true)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      Authorize Second Meal
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Sync Reassurance */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>100 Staff Records (40 Jr • 40 Sr • 20 VIP)</span>
              </span>
              <span className="text-emerald-600 font-medium">Real-time sync active</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-400 border-t border-white/5 bg-[#071B2B]/60">
        <p>Al-Haditha Petroleum Services S.A.O.C • Employee Mess Attendance & Allocation System</p>
      </footer>

    </div>
  );
}
