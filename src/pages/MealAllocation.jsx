import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

export default function MealAllocation() {
  const { data, generateMonthlyAllocation, addToast } = useApp();
  const { mealAllocation } = data;

  const [selectedMonth, setSelectedMonth] = useState('November 2025');
  const [workingDaysInput, setWorkingDaysInput] = useState(22);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const months = [
    { label: 'October 2025', days: 23 },
    { label: 'November 2025', days: 22 },
    { label: 'December 2025', days: 22 },
    { label: 'January 2026', days: 21 },
  ];

  const handleMonthChange = (e) => {
    const m = e.target.value;
    setSelectedMonth(m);
    const found = months.find((x) => x.label === m);
    if (found) setWorkingDaysInput(found.days);
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
        <div className="text-xs text-slate-secondary space-y-1">
          <p className="font-semibold text-slate-primary text-sm">
            Standard Shift Allocation Policy
          </p>
          <p>
            • Junior & Senior personnel receive <strong>3 meal tokens per active working day</strong> (Breakfast, Lunch, Dinner).
          </p>
          <p>
            • Friday and Saturday are recognized camp off-days (0 credits assigned unless on-call duty approved).
          </p>
          <p>
            • VIP and Executive visitors are allotted on-demand catering credits through scheduled event bookings.
          </p>
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
          <span className="text-[11px] text-brand-green font-medium">Active Billing Cycle</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Working Days</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-green-light text-brand-green">
              Fri & Sat Off
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">{mealAllocation.workingDays} Days</p>
          <span className="text-[11px] text-slate-muted">8 Weekend Off-Days Excluded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Daily Allowance</span>
            <Utensils className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">3 Meals / Day</p>
          <span className="text-[11px] text-slate-muted">Breakfast, Lunch, Dinner</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-secondary">Total Headcount</span>
            <Layers className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold text-slate-primary mt-1">2,040 Staff</p>
          <span className="text-[11px] text-slate-muted">1,240 Jr • 680 Sr • 120 VIP</span>
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
                {(1240 * workingDaysInput * 3).toLocaleString()} Credits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-secondary">Senior Credits to Generate:</span>
              <span className="font-bold text-slate-primary">
                {(680 * workingDaysInput * 3).toLocaleString()} Credits
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
    </div>
  );
}

