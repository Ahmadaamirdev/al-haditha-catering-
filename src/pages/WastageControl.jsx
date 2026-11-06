import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Filter, 
  Calendar, 
  Utensils, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Download, 
  Search, 
  Sprout, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

export default function WastageControl() {
  const { data, currency, logWasteRecord, addToast } = useApp();
  const { wastageOverview } = data;

  // Filters state
  const [selectedMeal, setSelectedMeal] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('2025-11-03');

  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    date: '2025-11-04',
    meal: 'Breakfast',
    category: 'Junior',
    allocated: 450,
    consumed: 410,
    wasted: 40,
  });

  const handleCreateLog = (e) => {
    e.preventDefault();
    logWasteRecord({
      ...newLog,
      allocated: Number(newLog.allocated),
      consumed: Number(newLog.consumed),
      wasted: Number(newLog.wasted),
    });
    setIsLogModalOpen(false);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return wastageOverview.records.filter((rec) => {
      const matchMeal = selectedMeal === 'All' || rec.meal === selectedMeal;
      const matchCategory = selectedCategory === 'All' || rec.category === selectedCategory;
      const matchSearch = rec.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.meal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMeal && matchCategory && matchSearch;
    });
  }, [wastageOverview.records, selectedMeal, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <PieChart className="w-4 h-4" />
            <span>Operational Efficiency</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Wastage Control & Kitchen Optimization
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Historical consumption analytics, portion forecasting, and food waste reduction for mess halls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              addToast('Exported consumption & wastage CSV report.');
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-primary shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-secondary" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Consumption</span>
          </button>
        </div>
      </div>

      {/* Actionable Kitchen Insight Notification */}
      <div className="bg-[#E5F5EC] border border-[#009B4D]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-green text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-primary">
              AI Kitchen Portion Recommendation
            </h4>
            <p className="text-xs text-slate-secondary mt-0.5">
              Based on a consistent 88% show-up rate for Junior lunch, reduce rice & stew prep by 70 portions to prevent food discard.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-green bg-white px-3 py-1.5 rounded-xl border border-brand-green/20 shadow-xs">
          <span>Estimated Savings: +450 {currency}/Day</span>
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Total Meals Allocated</span>
          <p className="text-2xl font-bold text-slate-primary mt-1">2,500</p>
          <div className="flex items-center space-x-1 text-xs text-slate-muted mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Daily standard capacity</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Meals Consumed</span>
          <p className="text-2xl font-bold text-brand-green mt-1">
            {wastageOverview.consumedMeals.toLocaleString()}
          </p>
          <div className="flex items-center space-x-1 text-xs text-brand-green mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>88% Show-up Rate</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Meals Skipped / Wasted</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {wastageOverview.wastedMeals.toLocaleString()}
          </p>
          <div className="flex items-center space-x-1 text-xs text-amber-600 mt-2 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>12% Waste margin</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <span className="text-xs font-medium text-slate-secondary">Food Scrap Weight</span>
          <p className="text-2xl font-bold text-slate-primary mt-1">
            {wastageOverview.estimatedWastageKg} <span className="text-sm font-normal text-slate-muted">kg</span>
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-secondary mt-2">
            <span>Eco compliance: Satisfactory</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-primary">
                Weekly Meal Consumption & Waste Trend
              </h3>
              <p className="text-xs text-slate-secondary">Daily portions delivered vs uncollected</p>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-secondary">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
                <span>Consumed</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Wasted</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wastageOverview.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009B4D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#009B4D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWasted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="consumed" stroke="#009B4D" strokeWidth={2} fillOpacity={1} fill="url(#colorConsumed)" name="Consumed" />
                <Area type="monotone" dataKey="wasted" stroke="#94A3B8" strokeWidth={2} fillOpacity={1} fill="url(#colorWasted)" name="Skipped" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meal Breakdown Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-primary mb-1">
              Meal-wise Waste Distribution
            </h3>
            <p className="text-xs text-slate-secondary mb-4">Breakfast vs Lunch vs Dinner variance</p>

            <div className="space-y-4">
              {wastageOverview.mealBreakdown.map((item) => (
                <div key={item.meal} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-primary">{item.meal}</span>
                    <span className="text-slate-secondary">
                      {item.consumed} / {item.allocated} ({item.rate}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-brand-green h-full" style={{ width: `${item.rate}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${100 - item.rate}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-muted">
                    <span>Wasted: {item.wasted} portions</span>
                    <span className="text-brand-green font-medium">Optimal prep target: {Math.round(item.consumed * 1.05)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-border text-center">
            <span className="text-xs text-slate-secondary">
              Kitchen prep threshold set to +5% buffer over 7-day median.
            </span>
          </div>
        </div>
      </div>

      {/* Consumption Table with Search & Filters */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-5 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-slate-primary">
              Consumption Logs by Date & Category
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-brand-blue text-xs font-semibold">
              {filteredRecords.length} records
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search category or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-surface-border rounded-xl focus:outline-none focus:border-brand-blue w-48"
              />
            </div>

            {/* Meal Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
              {['All', 'Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedMeal(meal)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedMeal === meal ? 'bg-white text-slate-primary shadow-xs font-semibold' : 'text-slate-secondary hover:text-slate-primary'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-surface-border rounded-xl text-slate-primary focus:outline-none focus:border-brand-blue"
            >
              <option value="All">All Categories</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-surface-border text-slate-secondary uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Log ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Meal Slot</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Allocated</th>
                <th className="px-6 py-3 text-right">Consumed</th>
                <th className="px-6 py-3 text-right">Skipped</th>
                <th className="px-6 py-3 text-right">Show-up Rate</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredRecords.map((row) => {
                const rate = Math.round((row.consumed / row.allocated) * 100);
                const isOptimal = row.status === 'Optimal' || rate >= 90;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-secondary font-medium">{row.id}</td>
                    <td className="px-6 py-3.5 text-slate-primary font-medium">{row.date}</td>
                    <td className="px-6 py-3.5 text-slate-primary">{row.meal}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        row.category === 'Junior' 
                          ? 'bg-brand-green-light text-brand-green' 
                          : row.category === 'Senior'
                          ? 'bg-brand-blue-light text-brand-blue'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {row.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-secondary">{row.allocated}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-primary">{row.consumed}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-amber-600">{row.wasted}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="font-semibold text-slate-primary">{rate}%</span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isOptimal 
                          ? 'bg-brand-green-light text-brand-green' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Consumption Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Kitchen Meal Consumption"
        subtitle="Record meal intake and uncollected meals to update portion forecasts."
      >
        <form onSubmit={handleCreateLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Date</label>
              <input
                type="date"
                required
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Meal</label>
              <select
                value={newLog.meal}
                onChange={(e) => setNewLog({ ...newLog, meal: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Employee Category</label>
            <select
              value={newLog.category}
              onChange={(e) => setNewLog({ ...newLog, category: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            >
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Allocated</label>
              <input
                type="number"
                min="1"
                required
                value={newLog.allocated}
                onChange={(e) => {
                  const alloc = Number(e.target.value);
                  setNewLog({
                    ...newLog,
                    allocated: alloc,
                    wasted: Math.max(0, alloc - Number(newLog.consumed)),
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Consumed</label>
              <input
                type="number"
                min="0"
                required
                value={newLog.consumed}
                onChange={(e) => {
                  const cons = Number(e.target.value);
                  setNewLog({
                    ...newLog,
                    consumed: cons,
                    wasted: Math.max(0, Number(newLog.allocated) - cons),
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Skipped / Wasted</label>
              <input
                type="number"
                readOnly
                value={newLog.wasted}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-surface-border rounded-xl text-slate-secondary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

