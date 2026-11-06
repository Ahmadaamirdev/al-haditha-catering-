import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ArrowRight, Calendar, Utensils } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AllocationOverview() {
  const { data } = useApp();
  const { mealAllocation } = data;
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
              <CalendarCheck className="w-5 h-5 text-brand-blue" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-primary tracking-tight">
              Meal Allocation
            </h2>
          </div>

          <button
            onClick={() => navigate('/allocation')}
            className="group flex items-center space-x-1 text-xs font-medium text-slate-secondary hover:text-brand-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-surface-border">
          {/* Working Days */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-secondary">Working Days (This Month)</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-bold text-slate-primary">
                  {mealAllocation.workingDays}
                </span>
                <span className="text-[11px] text-slate-secondary font-medium">
                  ({mealAllocation.offDaysNote})
                </span>
              </div>
            </div>
          </div>

          {/* Meals Per Person / Day */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center flex-shrink-0">
              <Utensils className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-secondary">Per Person / Day</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold text-slate-primary">
                  {mealAllocation.mealsPerPersonDay}
                </span>
                <span className="text-xs font-medium text-slate-secondary">Meals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-surface-border text-[11px] font-semibold text-slate-secondary">
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Daily Allocation</th>
              <th className="pb-2 font-medium text-right">Remaining (This Month)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {mealAllocation.categories.map((item) => (
              <tr key={item.category} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 flex items-center space-x-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-primary">{item.category}</span>
                </td>
                <td className="py-2.5 text-slate-secondary">{item.dailyAllocation}</td>
                <td className="py-2.5 text-right font-semibold text-slate-primary">
                  {item.remainingCredits ? `${item.remainingCredits.toLocaleString()} Credits` : item.remainingMonth}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

