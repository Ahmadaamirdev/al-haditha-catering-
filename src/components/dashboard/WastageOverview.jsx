import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart as PieIcon, ArrowRight, Sprout } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';

export default function WastageOverview() {
  const { data } = useApp();
  const { wastageOverview } = data;
  const navigate = useNavigate();

  const chartData = [
    { name: 'Consumed', value: wastageOverview.consumedMeals, color: '#009B4D' },
    { name: 'Wasted', value: wastageOverview.wastedMeals, color: '#E2E8F0' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
            <PieIcon className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-primary tracking-tight">
            Wastage Control
          </h2>
        </div>

        <button
          onClick={() => navigate('/wastage')}
          className="group flex items-center space-x-1 text-xs font-medium text-slate-secondary hover:text-brand-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Body: Donut Chart + Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-2">
        {/* Donut Chart */}
        <div className="relative h-40 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={68}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-primary tracking-tight">
              {wastageOverview.consumptionPercentage}%
            </span>
            <span className="text-[11px] font-medium text-slate-secondary -mt-0.5">
              Consumed
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green flex-shrink-0" />
              <span className="text-xs text-slate-secondary">Consumed Meals</span>
            </div>
            <span className="text-sm font-bold text-slate-primary">
              {wastageOverview.consumedMeals.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0" />
              <span className="text-xs text-slate-secondary">Wasted / Skipped</span>
            </div>
            <span className="text-sm font-bold text-slate-primary">
              {wastageOverview.wastedMeals.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable insight badge */}
      <div className="mt-4 bg-[#E5F5EC] border border-[#009B4D]/20 rounded-xl px-3.5 py-2.5 flex items-center space-x-2.5 text-xs text-slate-primary">
        <Sprout className="w-4 h-4 text-brand-green flex-shrink-0" />
        <span className="font-normal text-[12px]">{wastageOverview.insight}</span>
      </div>
    </div>
  );
}

