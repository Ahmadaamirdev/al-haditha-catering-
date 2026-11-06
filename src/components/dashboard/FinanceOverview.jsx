import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, User, Users, Gem } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { computeCategoryFinance } from '../../utils/financeEngine';

export default function FinanceOverview() {
  const { data, currency } = useApp();
  const { financeOverview } = data;
  const mealEntries = data.mealEntries || [];
  const navigate = useNavigate();

  // Compute live synchronized finance metrics directly from real meal entries
  const fin = useMemo(() => {
    return computeCategoryFinance({
      financeOverview,
      mealEntries
    });
  }, [financeOverview, mealEntries]);

  const chartData = fin.budgetVsActual;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
            <Wallet className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-primary tracking-tight">
            Finance Overview
          </h2>
        </div>

        <button
          onClick={() => navigate('/finance')}
          className="group flex items-center space-x-1 text-xs font-medium text-slate-secondary hover:text-brand-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <span>View Report</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Top 3 Category Rate Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Junior Budget */}
        <div className="bg-[#E5F5EC] border border-[#009B4D]/10 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-brand-green flex-shrink-0 shadow-xs">
            <User className="w-4 h-4 text-brand-green" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-brand-green">Junior Budget</span>
            <span className="text-sm font-bold text-slate-primary">
              {financeOverview.categoryRates.junior.rate} {currency} / Person
            </span>
          </div>
        </div>

        {/* Senior Budget */}
        <div className="bg-[#E7F2F9] border border-[#1684AA]/10 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-brand-blue flex-shrink-0 shadow-xs">
            <Users className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-brand-blue">Senior Budget</span>
            <span className="text-sm font-bold text-slate-primary">
              {financeOverview.categoryRates.senior.rate} {currency} / Person
            </span>
          </div>
        </div>

        {/* VIP Budget */}
        <div className="bg-[#E5F5EC] border border-[#009B4D]/10 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-brand-green flex-shrink-0 shadow-xs">
            <Gem className="w-4 h-4 text-brand-green" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-brand-green">VIP Budget</span>
            <span className="text-sm font-bold text-slate-primary">
              {financeOverview.categoryRates.vip.rate} {currency} / Person
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Content: Budget vs Actual Chart + Budget Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Chart Column (7 cols) */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-primary">Budget vs Actual</span>
            <div className="flex items-center space-x-3 text-[11px] text-slate-secondary">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1684AA]" />
                <span>Budget</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#009B4D]" />
                <span>Actual</span>
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="category" 
                  tickLine={false} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  tickFormatter={(val) => `${val / 1000}K`}
                />
                <Bar dataKey="budget" fill="#1684AA" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="actual" fill="#009B4D" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Status Column (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 pt-2 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-primary">
              Category Spending Status
            </span>
            <span className="text-[10px] text-brand-green font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Total Spent: {fin.totalActual} {currency}
            </span>
          </div>

          {fin.budgetStatus.map((item) => (
            <div key={item.category} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-primary">
                  {item.category}
                </span>
                <span className="font-extrabold text-brand-green">
                  {item.remaining.toLocaleString()} {currency} Left
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Spent: <strong className="text-slate-800">{item.spent} {currency}</strong> ({item.meals} Meals)</span>
                <span>Pool: {item.budget.toLocaleString()} {currency}</span>
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-brand-green rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(parseFloat(item.utilization), item.spent > 0 ? 3 : 0))}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

