import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CalendarCheck, 
  Calendar, 
  Utensils, 
  RefreshCw, 
  Sliders, 
  ChevronRight, 
  ChevronLeft,
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Users,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';
import { calculateMonthCalendar, isEntryInMonthOrDate } from '../utils/allocationEngine';

export default function MealAllocation() {
  const { data, generateMonthlyAllocation, addToast } = useApp();
  const { mealAllocation } = data;

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

  // Initialize selected month from AppContext or default to November 2026
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return data.selectedMonth || 'November 2026';
  });

  useEffect(() => {
    if (data.selectedMonth) {
      setSelectedMonth(data.selectedMonth);
    }
  }, [data.selectedMonth]);

  // Find active month object
  const activeMonthObj = useMemo(() => {
    return allMonths.find((m) => m.label === selectedMonth) || {
      label: 'November 2026',
      year: 2026,
      monthIndex: 10,
      monthName: 'November',
    };
  }, [allMonths, selectedMonth]);

  // Dynamically calculate calendar statistics based on month day count & Friday/Saturday count
  const calendarStats = useMemo(() => {
    return calculateMonthCalendar(activeMonthObj.year, activeMonthObj.monthIndex);
  }, [activeMonthObj]);

  const [workingDaysInput, setWorkingDaysInput] = useState(calendarStats.workingDaysCount);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState(null);

  // Day filter state: null = entire month, number (1-31) = specific day
  const [selectedDay, setSelectedDay] = useState(null);

  // Calendar Picker Popover State
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(activeMonthObj.year);
  const calendarPickerRef = useRef(null);

  // Filter meal entries specifically for this active month/year and optional day
  const filteredMealEntries = useMemo(() => {
    return (data.mealEntries || []).filter((entry) =>
      isEntryInMonthOrDate(entry, activeMonthObj.year, activeMonthObj.monthIndex, selectedDay)
    );
  }, [data.mealEntries, activeMonthObj.year, activeMonthObj.monthIndex, selectedDay]);

  // Compute category metrics dynamically from filteredMealEntries
  const getCategoryMetrics = (cat) => {
    const totalEmp = cat.totalEmployees || (cat.category === 'VIP' ? 20 : 40);
    const computedTotalCredits = totalEmp * calendarStats.workingDaysCount * 3;
    const totalCredits = cat.monthlyCredits || computedTotalCredits;

    // Filter consumed credits specifically for the active month/year/day
    const consumed = filteredMealEntries.filter((entry) => {
      const entryCat = (entry.category || data.employees?.find((e) => e.id === entry.employeeId)?.category || '').toLowerCase();
      return entryCat === cat.category.toLowerCase();
    }).length;

    const remaining = Math.max(0, totalCredits - consumed);
    const percentUsed = totalCredits ? Math.round((consumed / totalCredits) * 100) : 0;

    return { totalCredits, consumed, remaining, percentUsed };
  };

  // Sync picker year when activeMonthObj changes
  useEffect(() => {
    setPickerYear(activeMonthObj.year);
  }, [activeMonthObj.year]);

  // Close calendar picker on outside click
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

  // Sync workingDaysInput whenever calendarStats changes
  useEffect(() => {
    setWorkingDaysInput(calendarStats.workingDaysCount);
  }, [calendarStats.workingDaysCount]);

  // Handle month change and immediately synchronize allocations in real time
  const handleMonthChange = (monthLabel, isUserExplicit = true) => {
    setSelectedMonth(monthLabel);
    setSelectedDay(null); // Reset day filter on month change
    const targetMonth = allMonths.find((m) => m.label === monthLabel);
    if (targetMonth) {
      const stats = calculateMonthCalendar(targetMonth.year, targetMonth.monthIndex);
      setWorkingDaysInput(stats.workingDaysCount);
      // Automatically generate & sync allocations for the selected month
      generateMonthlyAllocation(monthLabel, stats.workingDaysCount, !isUserExplicit);
    }
  };

  const selectMonthFromPicker = (monthIndex, yr) => {
    const targetLabel = `${monthNames[monthIndex]} ${yr}`;
    handleMonthChange(targetLabel, true);
    setIsCalendarPickerOpen(false);
  };

  const currentIndex = allMonths.findIndex((m) => m.label === selectedMonth);
  const handlePrevMonth = () => {
    if (currentIndex > 0) {
      handleMonthChange(allMonths[currentIndex - 1].label, true);
    }
  };
  const handleNextMonth = () => {
    if (currentIndex < allMonths.length - 1) {
      handleMonthChange(allMonths[currentIndex + 1].label, true);
    }
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    generateMonthlyAllocation(selectedMonth, workingDaysInput, false);
    setIsGenerateModalOpen(false);
  };

  // Prepare calendar matrix with first day offset padding
  const firstDayOfWeek = new Date(activeMonthObj.year, activeMonthObj.monthIndex, 1).getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const leadingBlanks = Array.from({ length: firstDayOfWeek });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with Clean Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Quota & Entitlements</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Employee Meal Allocation & Credit Entitlement
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Automated quota generation based on active working days, shift patterns, and calendar off-days.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-primary shadow-xs transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-secondary" />
            <span>Edit Allocation Rules</span>
          </button>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Allocation</span>
          </button>
        </div>
      </div>

      {/* Working Days & Schedule Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selected Cycle Card with Interactive Calendar Picker */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Selected Cycle</span>

            {/* Interactive Calendar Month Picker Widget */}
            <div className="relative" ref={calendarPickerRef}>
              <button
                type="button"
                onClick={() => setIsCalendarPickerOpen(!isCalendarPickerOpen)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  isCalendarPickerOpen
                    ? 'bg-brand-green text-white border-brand-green shadow-pill'
                    : 'bg-sky-50 hover:bg-sky-100 text-brand-blue border-brand-blue/30'
                }`}
                title="Select month from calendar"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold">Pick Month</span>
              </button>

              {/* Calendar Month Picker Popover */}
              {isCalendarPickerOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-surface-border p-3.5 z-40 animate-fade-in">
                  {/* Year Header with Prev/Next */}
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

                  {/* 12 Months Calendar Grid */}
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
                              ? 'bg-brand-green text-white shadow-pill font-bold'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {name.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Shortcut Row */}
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

          <div className="mt-2">
            <p className="text-xl font-bold text-slate-primary">{selectedMonth}</p>
            <span className="text-[11px] text-brand-green font-semibold">
              {calendarStats.totalDays} Days in Month
            </span>
          </div>
        </div>

        {/* Working Days Card */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Working Days</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-green-light text-brand-green">
              {calendarStats.offDaysCount} Weekend Days Off
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">{calendarStats.workingDaysCount} Days</p>
          <span className="text-[11px] text-slate-muted">
            {calendarStats.fridaysCount} Fri + {calendarStats.saturdaysCount} Sat (0 Credits)
          </span>
        </div>

        {/* Daily Allowance Card */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Daily Allowance</span>
            <Utensils className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">3 Meals / Day</p>
          <span className="text-[11px] text-slate-muted">09:00-10:00 • 14:00-15:00 • 19:00-20:00</span>
        </div>

        {/* Quota Per Staff Card */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Quota Per Staff</span>
            <Layers className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">
            {calendarStats.allocationsPerEmployee} Meals
          </p>
          <span className="text-[11px] text-slate-muted">
            {calendarStats.workingDaysCount} days × 3 meals (80 Staff Total)
          </span>
        </div>
      </div>

      {/* Interactive Month Operational Calendar Breakdown */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-green-light text-brand-green">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-primary">
                  {calendarStats.monthName} {calendarStats.year} Operational Calendar & Camp Off-Days
                </h2>
                <div className="flex items-center space-x-1 ml-1 bg-slate-100 p-0.5 rounded-lg border border-surface-border">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={currentIndex <= 0}
                    className="p-1 rounded-md text-slate-secondary hover:text-slate-primary hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={currentIndex >= allMonths.length - 1}
                    className="p-1 rounded-md text-slate-secondary hover:text-slate-primary hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-secondary mt-0.5">
                Fridays & Saturdays automatically designated as Camp Off-Days (0 credits). Sunday through Thursday are active working days (3 meals/day).
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day of week headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
            <div
              key={d}
              className={`text-center py-2 text-xs font-bold uppercase tracking-wider rounded-xl ${
                idx === 5 || idx === 6
                  ? 'bg-amber-50/80 text-amber-800 border border-amber-200/60'
                  : 'bg-slate-50 text-slate-600 border border-slate-100'
              }`}
            >
              {d}
            </div>
          ))}

          {/* Blank padding cells before 1st day of month */}
          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className="min-h-14 rounded-xl bg-slate-50/30 border border-dashed border-slate-200/50" />
          ))}

          {/* Actual days of the month */}
          {calendarStats.calendarDays.map((day) => {
            const isSelected = selectedDay === day.dayNumber;
            return (
              <div
                key={day.dayNumber}
                onClick={() => setSelectedDay(isSelected ? null : day.dayNumber)}
                className={`min-h-14 p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none ${
                  isSelected
                    ? 'ring-2 ring-brand-green border-brand-green bg-emerald-50/80 shadow-sm scale-[1.02]'
                    : day.isOffDay
                    ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                    : 'bg-white border-surface-border hover:border-brand-green/40 hover:shadow-xs'
                }`}
                title={isSelected ? 'Click to clear filter and view full month' : `Click to filter allocations for Day ${day.dayNumber}`}
              >
                <div className="flex items-center justify-start">
                  <span
                    className={`text-xs font-bold ${
                      isSelected
                        ? 'text-brand-green font-black'
                        : day.isOffDay
                        ? 'text-amber-900 font-black'
                        : 'text-slate-primary'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>

                <div className="mt-1 text-center">
                  {day.isOffDay ? (
                    <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-200 px-1.5 py-0.5 rounded-md">
                      OFF (0)
                    </span>
                  ) : (
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                      isSelected ? 'bg-brand-green text-white border-brand-green' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}>
                      3 Meals
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Filtered Day Indicator if selected */}
        {selectedDay !== null && (
          <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
            <span className="px-3 py-1 bg-brand-green text-white font-bold rounded-lg flex items-center space-x-1.5 shadow-xs">
              <span>Filtered Date: {selectedDay} {calendarStats.monthName} {calendarStats.year}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDay(null);
                }}
                className="hover:bg-white/20 p-0.5 rounded transition-colors cursor-pointer"
                title="View full month"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Modal: Generate Allocation */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Meal Allocation"
        subtitle="Calculates token credits for Junior and Senior workforce based on calendar working days."
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Select Billing Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value, false)}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            >
              {allMonths.map((m) => (
                <option key={m.label} value={m.label}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Working Days Count (Fri & Sat automatically excluded)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              required
              value={workingDaysInput}
              onChange={(e) => setWorkingDaysInput(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
            <p className="text-[11px] text-slate-muted mt-1">
              {calendarStats.offDaysCount} off-days ({calendarStats.fridaysCount} Fridays + {calendarStats.saturdaysCount} Saturdays) excluded automatically.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-surface-border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-secondary">Junior Credits to Generate (40 Staff):</span>
              <span className="font-bold text-slate-primary">
                {(40 * workingDaysInput * 3).toLocaleString()} Credits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-secondary">Senior Credits to Generate (40 Staff):</span>
              <span className="font-bold text-slate-primary">
                {(40 * workingDaysInput * 3).toLocaleString()} Credits
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
              <span className="text-slate-800">Total Workforce Allocation:</span>
              <span className="text-brand-green">
                {(80 * workingDaysInput * 3).toLocaleString()} Credits
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all cursor-pointer"
            >
              Confirm & Generate Quota
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details */}
      {selectedCategoryDetail && (
        <Modal
          isOpen={!!selectedCategoryDetail}
          onClose={() => setSelectedCategoryDetail(null)}
          title={`${selectedCategoryDetail.category} Allocation Details`}
          subtitle="Detailed token breakdown and expiration rules"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-surface-border">
              <div className="flex justify-between">
                <span className="text-slate-secondary">Category:</span>
                <span className="font-bold text-slate-primary">{selectedCategoryDetail.category} Tier</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Total Personnel:</span>
                <span className="font-semibold text-slate-primary">{selectedCategoryDetail.totalEmployees} Staff</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Active Working Days:</span>
                <span className="font-semibold text-slate-primary">{calendarStats.workingDaysCount} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Quota Per Employee:</span>
                <span className="font-semibold text-slate-primary">{calendarStats.allocationsPerEmployee} Meals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Monthly Credits:</span>
                <span className="font-bold text-brand-green">
                  {selectedCategoryDetail.monthlyCredits ? selectedCategoryDetail.monthlyCredits.toLocaleString() : 'N/A'} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Daily Allowance:</span>
                <span className="font-semibold text-slate-primary">{selectedCategoryDetail.dailyAllocation}</span>
              </div>
            </div>

            <p className="text-slate-secondary text-[11px]">
              Tokens are refreshed daily at 00:00. Unconsumed tokens for previous shifts are purged daily to reflect accurate mess wastage data. Camp off-days (Fridays and Saturdays) are strictly excluded with 0 credits allotted.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCategoryDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-brand-blue text-white rounded-xl shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Edit Rules */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Allocation Rules & Expiration"
        subtitle="Configure shift allotment limits and credit deduction rules."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Meals Allotted Per Working Day
            </label>
            <input
              type="number"
              defaultValue={3}
              min="1"
              max="5"
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="friSatOff" defaultChecked className="rounded text-brand-green" />
            <label htmlFor="friSatOff" className="text-slate-primary font-medium">
              Automatically exclude Fridays and Saturdays from allocation cycles
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="autoExpire" defaultChecked className="rounded text-brand-green" />
            <label htmlFor="autoExpire" className="text-slate-primary font-medium">
              Expire unused meal credits at the end of each meal window
            </label>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                addToast('Allocation rules updated successfully.');
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green rounded-xl shadow-pill cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
