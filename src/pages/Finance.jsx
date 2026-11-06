import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Edit3, 
  User, 
  Users, 
  Gem, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { computeCategoryFinance } from '../utils/financeEngine';
import Modal from '../components/common/Modal';

export default function Finance() {
  const { data, currency, updateCategoryBudget, addExtraBudget, addToast } = useApp();
  const { financeOverview, events } = data;
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
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);

  // Edit rates form
  const [ratesForm, setRatesForm] = useState({
    junior: financeOverview.categoryRates.junior.rate,
    senior: financeOverview.categoryRates.senior.rate,
    vip: financeOverview.categoryRates.vip.rate,
  });

  // Add budget form
  const [budgetForm, setBudgetForm] = useState({
    amount: 5000,
    category: 'Junior',
    note: 'Camp workforce surge adjustment for solar expansion project.',
  });

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateCategoryBudget('junior', ratesForm.junior);
    updateCategoryBudget('senior', ratesForm.senior);
    updateCategoryBudget('vip', ratesForm.vip);
    setIsEditRatesOpen(false);
  };

  const handleAddBudgetSubmit = (e) => {
    e.preventDefault();
    addExtraBudget(budgetForm.amount, budgetForm.category, budgetForm.note);
    setIsAddBudgetOpen(false);
  };

  // Event expenditure calculation
  const totalEventExpenditure = events.reduce((sum, ev) => sum + (ev.overallBudget || 0), 0);

  // Synced 5-Month chart data ensuring current month reflects real actual expenditure
  const chartHistory = useMemo(() => {
    return (financeOverview.monthlyHistory || []).map((m) => {
      if (m.month === 'Nov') {
        return { ...m, budget: fin.totalBudget, actual: fin.totalActual };
      }
      return m;
    });
  }, [financeOverview.monthlyHistory, fin]);

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

          <button
            onClick={() => setIsAddBudgetOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Budget Allocation</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Utilization Rate</span>
          <p className="text-2xl font-bold text-slate-primary mt-1">
            {fin.utilizationRate}%
          </p>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-brand-green rounded-full" style={{ width: `${Math.min(100, Math.max(fin.utilizationRate, fin.totalActual > 0 ? 1 : 0))}%` }} />
          </div>
        </div>
      </div>

      {/* Charts Section: Historical Spending & Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-Month Historical Trend */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-primary">5-Month Budget vs Actual Trend</h3>
              <p className="text-xs text-slate-secondary">Monthly variance and budget caps</p>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-secondary">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1684AA]" />
                <span>Allocated</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#009B4D]" />
                <span>Actual</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  tickFormatter={(v) => `${v / 1000}K`} 
                />
                <Tooltip />
                <Bar dataKey="budget" fill="#1684AA" radius={[4, 4, 0, 0]} maxBarSize={30} name="Budget" />
                <Bar dataKey="actual" fill="#009B4D" radius={[4, 4, 0, 0]} maxBarSize={30} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown & Status List */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-surface-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-slate-primary">
                Category-Wise Spending Status
              </h3>
              <span className="text-[10px] font-bold text-brand-green bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Live Synced
              </span>
            </div>
            <p className="text-xs text-slate-secondary mb-4">Current month realized expenditure and remaining liquidity per tier</p>

            <div className="space-y-3.5">
              {fin.budgetStatus.map((item) => (
                <div key={item.category} className="p-4 rounded-xl border border-surface-border bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-slate-primary">{item.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.status === 'Healthy' 
                        ? 'text-brand-green bg-brand-green-light border border-brand-green/20' 
                        : 'text-rose-700 bg-rose-50 border border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1.5 border-t border-b border-slate-200/60 my-1.5">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Spent (Realized):</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {item.spent.toLocaleString()} {currency}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.meals} Meals @ {item.rate} {currency}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Remaining Liquidity:</span>
                      <span className="font-extrabold text-brand-green text-sm">
                        {item.remaining.toLocaleString()} {currency}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Pool: {item.budget.toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Spent: {item.utilization}%</span>
                      <span>Left: {(100 - parseFloat(item.utilization)).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          parseFloat(item.utilization) > 90 ? 'bg-rose-500' : 'bg-brand-green'
                        }`} 
                        style={{ width: `${Math.min(100, Math.max(parseFloat(item.utilization), item.spent > 0 ? 3 : 0))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-surface-border flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-secondary">Total Realized Category Spent:</span>
              <span className="font-bold text-slate-primary">{fin.totalActual.toLocaleString()} {currency} / {fin.totalBudget.toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-secondary">Special Event Expenditure:</span>
              <span className="font-semibold text-brand-blue">{totalEventExpenditure.toLocaleString()} {currency}</span>
            </div>
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
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-primary">{evt.title}</td>
                  <td className="px-6 py-3.5 text-slate-secondary">{evt.fullDate || `${evt.day} ${evt.month} 2025`}</td>
                  <td className="px-6 py-3.5 text-slate-secondary">{evt.category || 'VIP'}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-primary">{evt.expectedCount}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-secondary">{evt.perPersonBudget} {currency}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-slate-primary">{evt.overallBudget.toLocaleString()} {currency}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green-light text-brand-green">
                      {evt.status}
                    </span>
                  </td>
                </tr>
              ))}
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

      {/* Modal: Add Budget Allocation */}
      <Modal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        title="Add Emergency / Extra Budget"
        subtitle="Inject supplementary catering funds into category accounts."
      >
        <form onSubmit={handleAddBudgetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Allocation Amount ({currency})
            </label>
            <input
              type="number"
              min="500"
              step="500"
              required
              value={budgetForm.amount}
              onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Target Employee Category
            </label>
            <select
              value={budgetForm.category}
              onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            >
              <option value="Junior">Junior Tier</option>
              <option value="Senior">Senior Tier</option>
              <option value="VIP">VIP / Event Fund</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Justification Note
            </label>
            <textarea
              rows={3}
              value={budgetForm.note}
              onChange={(e) => setBudgetForm({ ...budgetForm, note: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddBudgetOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

