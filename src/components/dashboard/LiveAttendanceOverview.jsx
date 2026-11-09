import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  Utensils, 
  Trash2, 
  PlusCircle, 
  Calendar, 
  Filter, 
  Coffee, 
  Sun, 
  Moon, 
  RotateCcw,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LiveAttendanceOverview() {
  const { data, deleteMealEntry, recordMealEntry } = useApp();
  const { mealEntries = [] } = data;

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Filter States
  const [selectedDate, setSelectedDate] = useState(''); // '' means All / any date
  const [selectedMeal, setSelectedMeal] = useState('ALL'); // 'ALL' | 'Breakfast' | 'Lunch' | 'Dinner'
  const [searchQuery, setSearchQuery] = useState('');

  const mealOptions = [
    { id: 'ALL', label: 'All Meals', icon: Utensils },
    { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'Lunch', label: 'Lunch', icon: Sun },
    { id: 'Dinner', label: 'Dinner', icon: Moon }
  ];

  // Distinct available dates in mealEntries sorted descending
  const availableDates = useMemo(() => {
    const dates = new Set();
    mealEntries.forEach((e) => {
      if (e.date) dates.add(e.date);
    });
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [mealEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return mealEntries.filter((entry) => {
      // Date filter
      if (selectedDate && entry.date !== selectedDate) {
        return false;
      }
      // Meal type filter
      if (selectedMeal !== 'ALL') {
        const entryMeal = (entry.mealType || '').trim().toLowerCase();
        const targetMeal = selectedMeal.trim().toLowerCase();
        if (entryMeal !== targetMeal) {
          return false;
        }
      }
      // Search query (Employee ID or Name)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchId = (entry.employeeId || '').toLowerCase().includes(q);
        const matchName = (entry.employeeName || '').toLowerCase().includes(q);
        if (!matchId && !matchName) {
          return false;
        }
      }
      return true;
    });
  }, [mealEntries, selectedDate, selectedMeal, searchQuery]);

  const exactTodayCount = mealEntries.filter(
    (e) => (e.date || '') === todayIso || (e.date || '').startsWith(todayIso)
  ).length;
  const latestDate = mealEntries[0]?.date;
  const todayEntriesCount = exactTodayCount > 0 
    ? exactTodayCount 
    : (latestDate ? mealEntries.filter((e) => e.date === latestDate).length : 0);

  const hasActiveFilters = Boolean(selectedDate || selectedMeal !== 'ALL' || searchQuery.trim());

  const handleResetFilters = () => {
    setSelectedDate('');
    setSelectedMeal('ALL');
    setSearchQuery('');
  };

  const handleQuickAdd = (empId, empName, cat) => {
    recordMealEntry({
      employeeId: empId,
      employeeName: empName,
      mealType: selectedMeal !== 'ALL' ? selectedMeal : 'Lunch',
      facility: 'Main Camp Mess Hall'
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-green-light text-brand-green shadow-xs">
            <UserCheck className="w-5 h-5 text-brand-green" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-primary tracking-tight">
                Live Mess Check-In Stream
              </h2>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Feed</span>
              </span>
            </div>
            <p className="text-xs text-slate-secondary">
              Real-time attendance recorded from the Entry Kiosk ({todayEntriesCount} logged today)
            </p>
          </div>
        </div>

        {/* Status / Count Badge */}
        <div className="flex items-center space-x-2 self-start lg:self-auto">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
            Showing <strong className="text-slate-900">{filteredEntries.length}</strong> of {mealEntries.length} entries
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-surface-border space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Meal Service Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center space-x-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Meal:</span>
            </span>
            {mealOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedMeal === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedMeal(opt.id)}
                  type="button"
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-green text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date Selector & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Date Picker / Quick Selector */}
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green transition-all"
                title="Select Specific Date"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="ml-1 text-[11px] text-slate-400 hover:text-slate-700 font-bold px-1.5 py-1 rounded bg-slate-200/60"
                  title="Clear Date"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex items-center flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search staff or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* When Empty: Clean, simple, friendly testing prompt or no matches state */}
      {mealEntries.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
            <Utensils className="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-primary">0 Meals Recorded Today (Clean Testing State)</h3>
            <p className="text-xs text-slate-secondary mt-0.5 max-w-md mx-auto">
              All 80 employees (40 Junior, 40 Senior) are loaded with 0 entries. Click a button below to test check-in:
            </p>
          </div>

          {/* 1-Click Fast Test Buttons right on the Dashboard */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => handleQuickAdd('AHP-1004', 'Mohammed Al-Harthy', 'Junior')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Check In Junior (AHP-1004)</span>
            </button>

            <button
              onClick={() => handleQuickAdd('AHP-1041', 'Eng. Tariq Al-Hashmi', 'Senior')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-700" />
              <span>+ Check In Senior (AHP-1041)</span>
            </button>
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-700">No Check-Ins Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            No meal records match the selected date ({selectedDate || 'Any'}) and meal type ({selectedMeal}).
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center space-x-1 px-3 py-1.5 mt-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        /* Table of Verified Entries */
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-surface-border text-slate-secondary text-[10px] uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Date & Time</th>
                <th className="px-4 py-2.5">Employee ID</th>
                <th className="px-4 py-2.5">Staff Name</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Meal Service</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredEntries.slice(0, 15).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                    <span className="font-semibold">{entry.date || todayIso}</span>{' '}
                    <span className="text-slate-400">{entry.timestamp}</span>
                  </td>
                  <td className="px-4 py-2.5 font-bold font-mono text-slate-primary">
                    {entry.employeeId}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-primary">
                    {entry.employeeName}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      entry.category === 'Junior' ? 'bg-emerald-100 text-emerald-800' :
                      entry.category === 'Senior' ? 'bg-sky-100 text-sky-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-primary">
                    <span className="inline-flex items-center space-x-1">
                      {entry.mealType === 'Breakfast' ? <Coffee className="w-3 h-3 text-amber-600" /> :
                       entry.mealType === 'Lunch' ? <Sun className="w-3 h-3 text-amber-500" /> :
                       entry.mealType === 'Dinner' ? <Moon className="w-3 h-3 text-indigo-500" /> :
                       <Utensils className="w-3 h-3 text-slate-400" />}
                      <span>{entry.mealType}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-brand-green bg-brand-green-light px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => deleteMealEntry(entry.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove this entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
