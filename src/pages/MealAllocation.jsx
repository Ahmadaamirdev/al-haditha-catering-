import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Calendar, 
  Utensils, 
  RefreshCw, 
  Sliders, 
  CheckCircle, 
  Info, 
  Search, 
  Layers, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  User,
  CheckCircle2,
  Eye,
  Sparkles,
  Clock,
  ArrowDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';
import { calculateMonthCalendar, MEAL_WINDOWS, getEmployeesAllocationMap } from '../utils/allocationEngine';

export default function MealAllocation() {
  const { data, generateMonthlyAllocation, addToast } = useApp();
  const { mealAllocation } = data;

  const months = [
    { label: 'November 2026', year: 2026, monthIndex: 10 },
    { label: 'December 2026', year: 2026, monthIndex: 11 },
    { label: 'January 2027', year: 2027, monthIndex: 0 },
    { label: 'February 2027', year: 2027, monthIndex: 1 },
    { label: 'March 2027', year: 2027, monthIndex: 2 },
  ];

  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  
  // Dynamically calculate calendar statistics based on month day count & Friday/Saturday count
  const activeMonthObj = months.find((m) => m.label === selectedMonth) || months[0];
  const calendarStats = calculateMonthCalendar(activeMonthObj.year, activeMonthObj.monthIndex);

  const [workingDaysInput, setWorkingDaysInput] = useState(calendarStats.workingDaysCount);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Individual Employee Allocations table state
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeCategoryFilter, setEmployeeCategoryFilter] = useState('All');
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState(null);

  // Real-time allocation map for all 100 employees
  const employeeAllocationsMap = useMemo(() => {
    return getEmployeesAllocationMap(
      data.employees || [],
      data.mealEntries || [],
      new Date(),
      activeMonthObj.year,
      activeMonthObj.monthIndex
    );
  }, [data.employees, data.mealEntries, activeMonthObj]);

  const filteredEmployeesList = useMemo(() => {
    const list = data.employees || [];
    return list.filter((emp) => {
      const matchCat = employeeCategoryFilter === 'All' || emp.category === employeeCategoryFilter;
      const q = employeeSearch.toLowerCase().trim();
      const matchQuery = !q || emp.id.toLowerCase().includes(q) || emp.name.toLowerCase().includes(q) || (emp.department && emp.department.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [data.employees, employeeCategoryFilter, employeeSearch]);

  const handleMonthChange = (e) => {
    const m = e.target.value;
    setSelectedMonth(m);
    const found = months.find((x) => x.label === m);
    if (found) {
      const stats = calculateMonthCalendar(found.year, found.monthIndex);
      setWorkingDaysInput(stats.workingDaysCount);
    }
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    generateMonthlyAllocation(selectedMonth, workingDaysInput);
    setIsGenerateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Quota & Entitlements</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Employee Meal Allocation & Credit Entitlement
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Automated quota generation based on active working days, shift patterns, and calendar off-days.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-primary shadow-xs transition-colors"
          >
            <Sliders className="w-4 h-4 text-slate-secondary" />
            <span>Edit Allocation Rules</span>
          </button>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Allocation</span>
          </button>
        </div>
      </div>

      {/* Rules Notice Box */}
      <div className="bg-sky-50/70 border border-brand-blue/20 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5">
        <div className="p-2 bg-brand-blue text-white rounded-xl flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-white" />
        </div>
        <div className="text-xs text-slate-secondary space-y-1.5 flex-1">
          <p className="font-semibold text-slate-primary text-sm">
            Automated Shift Allocation & Real-Time Deduction Engine Policy
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-slate-700">
            <div className="bg-white/80 p-2 rounded-xl border border-sky-100">
              <span className="font-bold text-slate-900 block">1. Calendar Calculation:</span>
              <span>Based on {calendarStats.totalDays} days in month. Fridays ({calendarStats.fridaysCount}) & Saturdays ({calendarStats.saturdaysCount}) are camp off-days (0 credits).</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-sky-100">
              <span className="font-bold text-slate-900 block">2. 3 Meal Windows / Day:</span>
              <span>Breakfast (09:00 - 10:00), Lunch (14:00 - 15:00), Dinner (19:00 - 20:00) = {calendarStats.workingDaysCount} days × 3 = {calendarStats.allocationsPerEmployee} meals/staff.</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-sky-100">
              <span className="font-bold text-slate-900 block">3. Deduction & Expiration:</span>
              <span>1 allocation deducted per meal checked in. If a time window passes without entry, 1 allocation expires automatically.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Working Days & Schedule Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Selected Cycle</span>
            <Calendar className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-xl font-bold text-slate-primary mt-2">{selectedMonth}</p>
          <span className="text-[11px] text-brand-green font-medium">{calendarStats.totalDays} Days in Month</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Working Days</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-green-light text-brand-green">
              {calendarStats.offDaysCount} Weekend Days Off
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">{calendarStats.workingDaysCount} Days</p>
          <span className="text-[11px] text-slate-muted">{calendarStats.fridaysCount} Fri + {calendarStats.saturdaysCount} Sat (0 Credits)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Daily Allowance</span>
            <Utensils className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">3 Meals / Day</p>
          <span className="text-[11px] text-slate-muted">09:00-10:00 • 14:00-15:00 • 19:00-20:00</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Quota Per Staff</span>
            <Layers className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">
            {calendarStats.allocationsPerEmployee} Meals
          </p>
          <span className="text-[11px] text-slate-muted">
            {calendarStats.workingDaysCount} days × 3 meals (100 Staff Total)
          </span>
        </div>
      </div>

      {/* Category Quotas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mealAllocation.categories.map((cat) => {
          const totalCredits = cat.monthlyCredits || 0;
          const consumed = cat.consumedCredits || 0;
          const remaining = cat.remainingCredits || (totalCredits - consumed);
          const percentUsed = totalCredits ? Math.round((consumed / totalCredits) * 100) : 0;

          return (
            <div 
              key={cat.category}
              className="bg-white rounded-2xl p-5 border border-surface-border shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <h3 className="font-bold text-base text-slate-primary">{cat.category} Category</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-secondary bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cat.totalEmployees} Staff
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-secondary">Daily Allocation:</span>
                    <span className="font-semibold text-slate-primary">{cat.dailyAllocation}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-secondary">Total Monthly Credits:</span>
                    <span className="font-bold text-slate-primary">
                      {totalCredits.toLocaleString()} Credits
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-secondary">Credits Consumed:</span>
                    <span className="font-medium text-brand-blue">{consumed.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-secondary">Remaining This Month:</span>
                    <span className="font-bold text-brand-green">{remaining.toLocaleString()}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] text-slate-muted mb-1">
                      <span>Consumption Progress</span>
                      <span>{percentUsed}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentUsed}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-border flex justify-end">
                <button
                  onClick={() => setSelectedCategoryDetail(cat)}
                  className="flex items-center space-x-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Allocation Quota Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-primary">Shift-Wise Daily Distribution</h3>
            <p className="text-xs text-slate-secondary">Allocation quotas per meal window for the active month</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter shift or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-surface-border rounded-xl focus:outline-none focus:border-brand-blue w-52"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-surface-border text-slate-secondary uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Eligible Staff</th>
                <th className="px-6 py-3 text-right">Breakfast / Day</th>
                <th className="px-6 py-3 text-right">Lunch / Day</th>
                <th className="px-6 py-3 text-right">Dinner / Day</th>
                <th className="px-6 py-3 text-right">Total Daily Quota</th>
                <th className="px-6 py-3 text-right">Monthly Credits Total</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {mealAllocation.categories.map((c) => (
                <tr key={c.category} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-primary flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.category} Employees</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-secondary">{c.totalEmployees.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-primary">
                    {c.category === 'VIP' ? 'Event only' : c.totalEmployees.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-primary">
                    {c.category === 'VIP' ? 'Event only' : c.totalEmployees.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-primary">
                    {c.category === 'VIP' ? 'Event only' : c.totalEmployees.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-slate-primary">
                    {c.category === 'VIP' ? 'Flexible' : (c.totalEmployees * 3).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-brand-green">
                    {c.monthlyCredits ? c.monthlyCredits.toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green-light text-brand-green">
                      Active Quota
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Individual Allocation Details (100 Employees) */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-green" />
              <h3 className="text-base font-bold text-slate-primary">
                Individual Employee Allocations & Live Balances (100 Staff)
              </h3>
            </div>
            <p className="text-xs text-slate-secondary mt-0.5">
              Allocations are placed in each employee's details. Each entry minuses 1 allocation from the employee's balance in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
              {['All', 'Junior', 'Senior', 'VIP'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEmployeeCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    employeeCategoryFilter === cat
                      ? 'bg-white text-slate-primary shadow-xs font-bold'
                      : 'text-slate-secondary hover:text-slate-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-muted absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search staff ID or name..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-surface-border rounded-xl focus:outline-none focus:border-brand-blue w-52"
              />
            </div>
          </div>
        </div>

        {/* Table of 100 Employees */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-surface-border text-slate-secondary uppercase text-[10px] tracking-wider font-semibold sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th className="px-5 py-3">Employee ID</th>
                <th className="px-5 py-3">Staff Name & Department</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-center">Daily Allocation</th>
                <th className="px-5 py-3 text-center">Monthly Quota</th>
                <th className="px-5 py-3 text-center">Consumed Meals</th>
                <th className="px-5 py-3 text-center">Missed / Expired</th>
                <th className="px-5 py-3 text-center">Remaining Balance</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredEmployeesList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-secondary">
                    No employees matching filter "{employeeCategoryFilter}" or query "{employeeSearch}".
                  </td>
                </tr>
              ) : (
                filteredEmployeesList.map((emp) => {
                  const alloc = employeeAllocationsMap[emp.id] || {
                    totalMonthlyQuota: calendarStats.allocationsPerEmployee,
                    consumedCount: 0,
                    expiredCount: 0,
                    remainingMonthlyAllocations: calendarStats.allocationsPerEmployee
                  };

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-primary">
                        {emp.id}
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="font-semibold text-slate-primary block">{emp.name}</span>
                          <span className="text-[11px] text-slate-secondary">{emp.department} • {emp.designation}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          emp.category === 'Junior' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          emp.category === 'Senior' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                          'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {emp.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center font-medium text-slate-primary">
                        3 Meals / Day
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-slate-primary">
                        {alloc.totalMonthlyQuota} Meals
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`font-bold ${alloc.consumedCount > 0 ? 'text-brand-blue' : 'text-slate-400'}`}>
                          {alloc.consumedCount} Consumed
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-rose-600 font-medium">
                        {alloc.expiredCount} Missed
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-brand-green border border-emerald-300 shadow-xs">
                          <span>{alloc.remainingMonthlyAllocations} Meals</span>
                          {alloc.consumedCount > 0 && <span className="text-[10px] text-emerald-700 font-bold ml-1">(-{alloc.consumedCount})</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setSelectedEmployeeDetail({ emp, alloc })}
                          className="px-2.5 py-1 text-[11px] font-semibold text-brand-blue hover:text-brand-blue-dark bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ledger</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Allocation */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Meal Allocation"
        subtitle="Calculates token credits for Junior and Senior workforce based on calendar working days."
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Select Billing Month
            </label>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            >
              {months.map((m) => (
                <option key={m.label} value={m.label}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Working Days Count (Fri & Sat automatically excluded)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              required
              value={workingDaysInput}
              onChange={(e) => setWorkingDaysInput(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
            <p className="text-[11px] text-slate-muted mt-1">
              Calculated automatically based on 8 off-days.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-surface-border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-secondary">Junior Credits to Generate:</span>
              <span className="font-bold text-slate-primary">
                {((mealAllocation.categories.find(c => c.category === 'Junior')?.totalEmployees || 40) * workingDaysInput * 3).toLocaleString()} Credits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-secondary">Senior Credits to Generate:</span>
              <span className="font-bold text-slate-primary">
                {((mealAllocation.categories.find(c => c.category === 'Senior')?.totalEmployees || 40) * workingDaysInput * 3).toLocaleString()} Credits
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
            >
              Generate Quota
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Details */}
      {selectedCategoryDetail && (
        <Modal
          isOpen={!!selectedCategoryDetail}
          onClose={() => setSelectedCategoryDetail(null)}
          title={`${selectedCategoryDetail.category} Allocation Details`}
          subtitle="Detailed token breakdown and expiration rules"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-surface-border">
              <div className="flex justify-between">
                <span className="text-slate-secondary">Category:</span>
                <span className="font-bold text-slate-primary">{selectedCategoryDetail.category} Tier</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Total Personnel:</span>
                <span className="font-semibold text-slate-primary">{selectedCategoryDetail.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Monthly Credits:</span>
                <span className="font-bold text-brand-green">
                  {selectedCategoryDetail.monthlyCredits ? selectedCategoryDetail.monthlyCredits.toLocaleString() : 'On Demand'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-secondary">Daily Allowance:</span>
                <span className="font-semibold text-slate-primary">{selectedCategoryDetail.dailyAllocation}</span>
              </div>
            </div>

            <p className="text-slate-secondary text-[11px]">
              Tokens are refreshed daily at 00:00. Unconsumed tokens for previous shifts are purged daily to reflect accurate mess wastage data.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCategoryDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-brand-blue text-white rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Edit Rules */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Allocation Rules & Expiration"
        subtitle="Configure shift allotment limits and credit deduction rules."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Meals Allotted Per Working Day
            </label>
            <input
              type="number"
              defaultValue={3}
              min="1"
              max="5"
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="friSatOff" defaultChecked className="rounded text-brand-green" />
            <label htmlFor="friSatOff" className="text-slate-primary font-medium">
              Automatically exclude Fridays and Saturdays from allocation cycles
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="autoExpire" defaultChecked className="rounded text-brand-green" />
            <label htmlFor="autoExpire" className="text-slate-primary font-medium">
              Expire unused meal credits at the end of each meal window
            </label>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                addToast('Allocation rules updated successfully.');
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green rounded-xl shadow-pill"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Individual Employee Allocation Ledger */}
      {selectedEmployeeDetail && (
        <Modal
          isOpen={!!selectedEmployeeDetail}
          onClose={() => setSelectedEmployeeDetail(null)}
          title={`Employee Allocation Ledger: ${selectedEmployeeDetail.emp.name}`}
          subtitle={`Staff ID: ${selectedEmployeeDetail.emp.id} • ${selectedEmployeeDetail.emp.category} Tier • ${selectedEmployeeDetail.emp.department}`}
        >
          <div className="space-y-4 text-xs">
            {/* Macro Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-surface-border text-center">
                <span className="text-[10px] text-slate-secondary block">Monthly Quota</span>
                <span className="text-base font-bold text-slate-primary">{selectedEmployeeDetail.alloc.totalMonthlyQuota} Meals</span>
                <span className="text-[10px] text-slate-muted block">22 active days</span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-center">
                <span className="text-[10px] text-sky-800 block">Consumed</span>
                <span className="text-base font-bold text-brand-blue">{selectedEmployeeDetail.alloc.consumedCount} Meals</span>
                <span className="text-[10px] text-brand-blue/80 block">Logged entries</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                <span className="text-[10px] text-rose-800 block">Missed / Expired</span>
                <span className="text-base font-bold text-rose-600">{selectedEmployeeDetail.alloc.expiredCount} Meals</span>
                <span className="text-[10px] text-rose-500 block">Passed windows</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 block">Remaining</span>
                <span className="text-base font-black text-brand-green">{selectedEmployeeDetail.alloc.remainingMonthlyAllocations} Meals</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Live Balance</span>
              </div>
            </div>

            {/* Today's 3 Meal Windows */}
            <div className="p-3 bg-slate-50 rounded-xl border border-surface-border space-y-2">
              <span className="font-bold text-slate-primary text-xs block">Today's Service Schedule & Window Status:</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-700">Breakfast</span>
                  <span className="text-[10px] text-slate-400">09:00 - 10:00</span>
                  <span className="font-bold block mt-1 text-slate-900">
                    {selectedEmployeeDetail.alloc.todayMealsStatus.breakfast.status}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-700">Lunch</span>
                  <span className="text-[10px] text-slate-400">14:00 - 15:00</span>
                  <span className="font-bold block mt-1 text-slate-900">
                    {selectedEmployeeDetail.alloc.todayMealsStatus.lunch.status}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-700">Dinner</span>
                  <span className="text-[10px] text-slate-400">19:00 - 20:00</span>
                  <span className="font-bold block mt-1 text-slate-900">
                    {selectedEmployeeDetail.alloc.todayMealsStatus.dinner.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Log of recorded meals for this employee */}
            <div>
              <span className="font-bold text-slate-primary text-xs block mb-1.5">Recorded Attendance Entries:</span>
              {(() => {
                const empEntries = (data.mealEntries || []).filter(e => e.employeeId === selectedEmployeeDetail.emp.id);
                if (empEntries.length === 0) {
                  return (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-secondary text-xs">
                      No meals recorded yet for this employee. When this employee checks in at the Entry Panel, 1 allocation will be minused and recorded here.
                    </div>
                  );
                }
                return (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 border border-surface-border rounded-xl p-2 bg-white">
                    {empEntries.map((entry) => (
                      <div key={entry.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-green" />
                          <span className="font-semibold text-slate-primary">{entry.mealType}</span>
                          <span className="text-slate-400 text-[11px]">• {entry.date} at {entry.timestamp}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          -1 Allocation
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2 border-t border-surface-border">
              <button
                onClick={() => setSelectedEmployeeDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

