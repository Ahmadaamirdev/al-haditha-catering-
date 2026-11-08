import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, User, Users } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
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
            className="group flex items-center space-x-1 text-xs font-medium text-slate-secondary hover:text-brand-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <span>View Report</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Category Rate Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 sm:mb-6">
          {/* Junior Budget */}
          <div className="bg-[#E5F5EC] border border-[#009B4D]/10 rounded-xl p-3.5 flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center text-brand-green flex-shrink-0 shadow-xs">
              <User className="w-4.5 h-4.5 text-brand-green" />
            </div>
            <div>
              <span className="block text-[11px] font-medium text-brand-green">Junior Budget</span>
              <span className="text-sm sm:text-base font-bold text-slate-primary">
                {financeOverview.categoryRates.junior.rate} {currency} / Person
              </span>
            </div>
          </div>

          {/* Senior Budget */}
          <div className="bg-[#E7F2F9] border border-[#1684AA]/10 rounded-xl p-3.5 flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center text-brand-blue flex-shrink-0 shadow-xs">
              <Users className="w-4.5 h-4.5 text-brand-blue" />
            </div>
            <div>
              <span className="block text-[11px] font-medium text-brand-blue">Senior Budget</span>
              <span className="text-sm sm:text-base font-bold text-slate-primary">
                {financeOverview.categoryRates.senior.rate} {currency} / Person
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Spending Status - Enlarged to Fill Space */}
      <div className="space-y-3 pt-1 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs sm:text-sm font-bold text-slate-primary">
            Category Spending Status
          </span>
          <span className="text-xs text-brand-green font-bold bg-emerald-100/70 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
            Total Spent: {fin.totalActual} {currency}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fin.budgetStatus.filter((item) => item.category?.toUpperCase() !== 'VIP').map((item) => (
            <div key={item.category} className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/80 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-slate-primary">
                    {item.category}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-brand-green tracking-tight">
                    {item.remaining.toLocaleString()} {currency} Left
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-[13px] text-slate-600 mt-2 sm:mt-2.5">
                  <span>Spent: <strong className="text-slate-800 font-bold">{item.spent} {currency}</strong> ({item.meals} Meals)</span>
                  <span>Pool: <strong className="text-slate-700 font-semibold">{item.budget.toLocaleString()} {currency}</strong></span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-200/90 rounded-full overflow-hidden mt-3 border border-slate-200">
                <div 
                  className="h-full bg-brand-green rounded-full shadow-2xs transition-all duration-300" 
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
