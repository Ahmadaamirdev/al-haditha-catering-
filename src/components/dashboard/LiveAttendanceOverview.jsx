import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ArrowRight, CheckCircle2, RotateCcw, Utensils, Trash2, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LiveAttendanceOverview() {
  const { data, resetAllEntriesToZero, deleteMealEntry, recordMealEntry } = useApp();
  const { mealEntries = [] } = data;

  const todayIso = '2026-11-08';
  const todayEntriesCount = mealEntries.filter(
    (e) => (e.date || '') === todayIso || (e.date || '').startsWith(todayIso)
  ).length;

  const handleQuickAdd = (empId, empName, cat) => {
    recordMealEntry({
      employeeId: empId,
      employeeName: empName,
      mealType: 'Lunch',
      facility: 'Main Camp Mess Hall'
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow space-y-3.5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-green-light text-brand-green">
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

        <div className="flex items-center space-x-2.5">
          {/* Reset to 0 Button for Testing */}
          <button
            onClick={resetAllEntriesToZero}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-secondary hover:text-slate-primary transition-colors"
            title="Reset all check-in entries to 0 for a clean test"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to 0</span>
          </button>

          {/* Open Kiosk Link */}
          <Link
            to="/entry"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all hover:scale-[1.02]"
          >
            <span>Open Entry Kiosk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* When Empty: Clean, simple, friendly testing prompt */}
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
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Check In Junior (AHP-1004)</span>
            </button>

            <button
              onClick={() => handleQuickAdd('AHP-1041', 'Eng. Tariq Al-Hashmi', 'Senior')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-700" />
              <span>+ Check In Senior (AHP-1041)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Table of Verified Entries */
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-surface-border text-slate-secondary text-[10px] uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Employee ID</th>
                <th className="px-4 py-2.5">Staff Name</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Meal Service</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {mealEntries.slice(0, 10).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                    {entry.timestamp}
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
                    {entry.mealType}
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
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
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
