import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  ArrowLeft, 
  IdCard, 
  User, 
  Utensils, 
  Sun, 
  Moon, 
  AlertTriangle, 
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  getEmployeeRealtimeAllocations, 
  getCurrentActiveMealWindow 
} from '../utils/allocationEngine';
import logoAsset from '../assets/logo.png';

export default function EmployeeEntryPanel() {
  const { data, recordMealEntry } = useApp();

  // Inputs: ONLY Employee ID and Name
  const [idInput, setIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Selected meal: Only Breakfast, Lunch, Dinner
  const [currentTime] = useState(() => new Date());
  const initialActive = useMemo(() => {
    const act = getCurrentActiveMealWindow(new Date());
    return act && act.name ? act.name : 'Lunch';
  }, []);

  const [selectedMeal, setSelectedMeal] = useState(initialActive);

  // Result state
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = useCallback(() => {
    setIdInput('');
    setNameInput('');
    setResult(null);
  }, []);

  // Form submission
  const handleSubmit = (e, allowDuplicate = false) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanId = idInput.trim().toUpperCase();
    const cleanName = nameInput.trim();

    if (!cleanId || !cleanName) {
      setResult({
        approved: false,
        type: 'error',
        message: 'Please enter both Employee ID and Full Name to check in.'
      });
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const res = recordMealEntry({
      employeeId: cleanId,
      employeeName: cleanName,
      mealType: selectedMeal,
      facility: 'Main Camp Mess Hall',
      allowDuplicate,
      effectiveDate: now
    });

    setIsSubmitting(false);

    if (res.isDuplicate) {
      const alloc = getEmployeeRealtimeAllocations({
        employeeId: res.employee.id,
        mealEntries: data.mealEntries || [],
        currentDate: now
      });

      setResult({
        approved: false,
        isDuplicate: true,
        type: 'warning',
        employee: res.employee,
        mealType: selectedMeal,
        allocations: alloc,
        message: `${res.employee.name} has already logged a ${selectedMeal} meal today at ${res.prevEntry.timestamp}.`
      });
      return;
    }

    if (res.matched && res.success) {
      const updatedEntries = res.entry ? [res.entry, ...(data.mealEntries || [])] : (data.mealEntries || []);
      const liveAllocations = getEmployeeRealtimeAllocations({
        employeeId: res.employee.id,
        mealEntries: updatedEntries,
        currentDate: now
      });

      setResult({
        approved: true,
        type: 'success',
        employee: res.employee,
        entry: res.entry,
        mealType: selectedMeal,
        allocations: liveAllocations,
      });
    } else {
      setResult({
        approved: false,
        type: 'error',
        message: res.message || 'Verification Failed: Employee ID and Full Name do not match company records.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#071B2B] text-white flex flex-col justify-between font-sans selection:bg-brand-green selection:text-white">
      
      {/* Subtle Top Navigation Bar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="text-[11px] text-slate-400 font-mono">
          {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Main Centered Check-in Terminal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md mx-auto">
          
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800 relative overflow-hidden transition-all">
            
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#009B4D] via-[#1684AA] to-[#009B4D]" />

            {/* Card Header: Logo side-by-side with Employee Meal Check-In */}
            <div className="flex items-center justify-center gap-3.5 pb-5 border-b border-slate-100">
              <img 
                src={logoAsset} 
                alt="Al Haditha Energy" 
                className="h-10 sm:h-11 w-auto object-contain flex-shrink-0" 
              />
              <div className="h-9 w-px bg-slate-200 shrink-0" />
              <div className="flex flex-col justify-center text-left">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Employee Meal Check-In
                </h2>
                <span className="text-[11px] font-semibold text-brand-green uppercase tracking-wide block mt-0.5">
                  Al-Haditha Petroleum Services
                </span>
              </div>
            </div>

            {/* Meal Selector: ONLY Breakfast, Lunch, Dinner */}
            <div className="mt-5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
                Select Meal Service
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Breakfast', icon: Sun },
                  { name: 'Lunch', icon: Utensils },
                  { name: 'Dinner', icon: Moon },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMeal === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedMeal(m.name)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                        isSelected
                          ? 'bg-[#009B4D] text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Form is Approved: Show Clean, Non-Bulky Confirmation */}
            {result && result.approved && result.employee ? (
              <div className="mt-6 space-y-4 animate-fade-in">
                
                {/* Clean Status Badge with Tick Mark */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 mb-2">
                    <Check className="w-7 h-7 stroke-[3] text-white" />
                  </div>
                  <h3 className="text-base font-extrabold text-emerald-950">
                    Verified & Approved
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                    1 {result.mealType || selectedMeal} Meal Recorded
                  </span>
                </div>

                {/* Employee Details & Remaining Allocations */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                  
                  {/* Name and ID */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee Name</span>
                      <strong className="text-sm text-slate-900 font-bold block">{result.employee.name}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee ID</span>
                      <strong className="text-sm text-slate-800 font-mono font-bold block">{result.employee.id}</strong>
                    </div>
                  </div>

                  {/* Category and Allocations */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                      <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        result.employee.category === 'Junior'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : result.employee.category === 'Senior'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {result.employee.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Allocations</span>
                      <div className="flex items-baseline justify-end space-x-1 mt-0.5">
                        <strong className="text-lg font-black text-emerald-700">
                          {result.allocations?.remainingMonthlyAllocations ?? 0}
                        </strong>
                        <span className="text-[11px] text-slate-500 font-medium">
                          / {result.allocations?.totalMonthlyQuota ?? 66} Meals
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Back / Next Employee Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back / Check In Another Employee</span>
                  </button>
                </div>

              </div>
            ) : (
              /* Check-In Input Form */
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                
                {/* Employee ID Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="empId" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
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
                      placeholder="e.g. AHP-1004"
                      autoComplete="off"
                      autoFocus
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold text-sm placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all uppercase"
                    />
                  </div>
                </div>

                {/* Employee Name Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="empName" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                      Employee Name <span className="text-red-500">*</span>
                    </label>
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
                      placeholder="e.g. Mohammed Al-Harthy"
                      autoComplete="off"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                {/* Error / Warning Alert */}
                {result && !result.approved && (
                  <div className={`p-3 rounded-xl text-xs flex items-start space-x-2.5 ${
                    result.isDuplicate 
                      ? 'bg-amber-50 border border-amber-200 text-amber-900' 
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}>
                    {result.isDuplicate ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{result.message}</p>
                      {result.isDuplicate && (
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSubmit(null, true)}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold shadow-xs hover:bg-amber-700"
                          >
                            Authorize Second Meal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Verify Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-[#009B4D] hover:bg-[#008240] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isSubmitting ? 'Verifying...' : 'Verify & Check In'}</span>
                  </button>
                </div>

                {/* Reset / Clear Button */}
                {(idInput || nameInput) && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear inputs</span>
                    </button>
                  </div>
                )}

              </form>
            )}

            {/* Bottom Sync Indicator */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100 Staff Records Loaded</span>
              </span>
              <span className="text-emerald-700 font-semibold">Real-time sync</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-[11px] text-slate-400">
        Al-Haditha Petroleum Services S.A.O.C • Employee Mess Attendance
      </footer>

    </div>
  );
}
