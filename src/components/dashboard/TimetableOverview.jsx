import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, ArrowRight, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TimetableOverview() {
  const { data } = useApp();
  const { timetable } = data;
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
            <Utensils className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-primary tracking-tight">
            Timetable & Meals
          </h2>
        </div>

        <button
          onClick={() => navigate('/timetable')}
          className="group flex items-center space-x-1 text-xs font-medium text-slate-secondary hover:text-brand-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <span>Manage Schedule</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-surface-border text-[11px] font-semibold text-slate-secondary">
              <th className="pb-2.5 font-medium">Meal Time</th>
              <th className="pb-2.5 font-medium">Assigned Menu</th>
              <th className="pb-2.5 font-medium text-right sm:text-left">Applicable To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {timetable.map((meal) => (
              <tr key={meal.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 flex items-center space-x-2.5">
                  {meal.iconType === 'sun' ? (
                    <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  )}
                  <span className="font-medium text-slate-primary">{meal.mealTime}</span>
                </td>
                <td className="py-3 text-slate-primary font-normal">{meal.assignedMenu}</td>
                <td className="py-3 text-slate-secondary text-right sm:text-left">
                  {meal.applicableTo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

