import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  Edit3, 
  User, 
  Users, 
  Gem, 
  ArrowUpRight, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeCategoryFinance } from '../utils/financeEngine';
import Modal from '../components/common/Modal';

export default function Finance() {
  const { data, currency, updateCategoryBudget, addToast } = useApp();
  const { financeOverview } = data;
  const events = data.events || [];
  const mealEntries = data.mealEntries || [];

  // Compute live synchronized finance metrics directly from real meal entries
  const fin = useMemo(() => {
    return computeCategoryFinance({
      financeOverview,
      mealEntries
    });
  }, [financeOverview, mealEntries]);

  // Modals state
  const [isEditRatesOpen, setIsEditRatesOpen] = useState(false);

  // Edit rates form
  const [ratesForm, setRatesForm] = useState({
    junior: financeOverview.categoryRates.junior.rate,
    senior: financeOverview.categoryRates.senior.rate,
    vip: financeOverview.categoryRates.vip.rate,
  });

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateCategoryBudget('junior', ratesForm.junior);
    updateCategoryBudget('senior', ratesForm.senior);
    updateCategoryBudget('vip', ratesForm.vip);
    setIsEditRatesOpen(false);
  };

  // Event expenditure calculation
  const totalEventExpenditure = events.reduce((sum, ev) => sum + (ev.overallBudget || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Financial Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Mess Catering & Meal Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Per-head subsidies, vendor meal cost accounting, and monthly expenditure controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditRatesOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-primary shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-secondary" />
            <span>Edit Category Rates</span>
          </button>
        </div>
      </div>

      {/* Category Rates Overview Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Junior */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-green-light flex items-center justify-center text-brand-green">
              <User className="w-5 h-5 text-brand-green" />
            </div>
            <span className="text-[11px] font-semibold text-brand-green bg-brand-green-light px-2.5 py-0.5 rounded-full">
              Standard Daily
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-secondary">Junior Employee Tier</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-primary">
                {financeOverview.categoryRates.junior.rate} {currency}
              </span>
              <span className="text-xs text-slate-muted">/ person / meal</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Monthly Pool: <strong>13,200 {currency}</strong></span>
              <span className="text-brand-green font-bold">Spent: {fin.jrSpent} {currency} ({fin.jrMeals} Meals)</span>
            </div>
          </div>
        </div>

        {/* Senior */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-blue-light flex items-center justify-center text-brand-blue">
              <Users className="w-5 h-5 text-brand-blue" />
            </div>
            <span className="text-[11px] font-semibold text-brand-blue bg-brand-blue-light px-2.5 py-0.5 rounded-full">
              Senior Grade
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-secondary">Senior Employee Tier</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-primary">
                {financeOverview.categoryRates.senior.rate} {currency}
              </span>
              <span className="text-xs text-slate-muted">/ person / meal</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Monthly Pool: <strong>26,400 {currency}</strong></span>
              <span className="text-brand-blue font-bold">Spent: {fin.srSpent} {currency} ({fin.srMeals} Meals)</span>
            </div>
          </div>
        </div>

        {/* VIP */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-green-light flex items-center justify-center text-brand-green">
              <Gem className="w-5 h-5 text-brand-green" />
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              Executive / Events
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-secondary">VIP / Executive Banquets</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-primary">
                {financeOverview.categoryRates.vip.rate} {currency}
              </span>
              <span className="text-xs text-slate-muted">/ person / event meal</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Monthly Pool: <strong>25,400 {currency}</strong></span>
              <span className="text-amber-700 font-bold">Spent: {fin.vipSpent} {currency} ({fin.vipMeals} Meals)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Monthly Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Total Allocated Budget</span>
          <p className="text-2xl font-bold text-slate-primary mt-1">
            {fin.totalBudget.toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-muted mt-2">
            <span>Approved by Finance Board</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Actual Expenditure</span>
          <p className="text-2xl font-bold text-[#1684AA] mt-1">
            {fin.totalActual.toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-brand-blue mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>M-T-D Realized Cost</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Remaining Buffer</span>
          <p className="text-2xl font-bold text-[#009B4D] mt-1">
            {fin.totalRemaining.toLocaleString()} {currency}
          </p>
          <div className="flex items-center space-x-1 text-xs text-brand-green mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Healthy Cashflow ({fin.totalBudget > 0 ? ((fin.totalRemaining / fin.totalBudget) * 100).toFixed(1) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Event Expenditure Breakdown Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-primary">Special Event Catering Expenditure</h3>
            <p className="text-xs text-slate-secondary">Banquets and celebrations billed to VIP/event budget pool</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-brand-green-light text-brand-green text-xs font-semibold">
            {events.length} Events Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-surface-border text-slate-secondary uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Event Title</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Headcount</th>
                <th className="px-6 py-3 text-right">Per-Head Rate</th>
                <th className="px-6 py-3 text-right">Total Expenditure</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No Special Event Expenditures</p>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        No events recorded yet. Go to the Events module to create an event, select invited personnel, and calculate catering expenditures.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-primary">{evt.title}</td>
                    <td className="px-6 py-3.5 text-slate-secondary">{evt.fullDate || `${evt.day} ${evt.month} 2025`}</td>
                    <td className="px-6 py-3.5 text-slate-secondary">{evt.category || 'VIP'}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-primary">{evt.expectedCount || evt.invitedCount || 0}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-secondary">{evt.perPersonBudget} {currency}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-primary">{(evt.overallBudget || 0).toLocaleString()} {currency}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green-light text-brand-green">
                        {evt.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Category Rates */}
      <Modal
        isOpen={isEditRatesOpen}
        onClose={() => setIsEditRatesOpen(false)}
        title="Edit Category Meal Budgets"
        subtitle="Set per-person meal allowance rate for each staff tier."
      >
        <form onSubmit={handleSaveRates} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Junior Budget ({currency} / person / meal)
            </label>
            <input
              type="number"
              min="1"
              required
              value={ratesForm.junior}
              onChange={(e) => setRatesForm({ ...ratesForm, junior: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
            <p className="text-[11px] text-slate-muted mt-1">Default benchmark: 5 {currency}/person</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Senior Budget ({currency} / person / meal)
            </label>
            <input
              type="number"
              min="1"
              required
              value={ratesForm.senior}
              onChange={(e) => setRatesForm({ ...ratesForm, senior: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
            <p className="text-[11px] text-slate-muted mt-1">Default benchmark: 10 {currency}/person</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              VIP Event Budget ({currency} / person / meal)
            </label>
            <input
              type="number"
              min="1"
              required
              value={ratesForm.vip}
              onChange={(e) => setRatesForm({ ...ratesForm, vip: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
            <p className="text-[11px] text-slate-muted mt-1">Default benchmark: 20 {currency}/person</p>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditRatesOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
            >
              Update Rates
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

