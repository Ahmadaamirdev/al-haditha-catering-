import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  ShieldCheck, 
  User, 
  Gem, 
  Building2, 
  Briefcase, 
  Check, 
  X,
  AlertTriangle,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Sparkles,
  Utensils,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';
import { getEmployeesAllocationMap, calculateMonthCalendar } from '../utils/allocationEngine';
import { getCurrentMonthLabel, getCurrentMonthObj } from '../utils/harmonizeEngine';
import { CONTRACT_EMPLOYEE_IDS } from '../data/employeesData';

export default function Employees() {
  const { data, addEmployee, deleteEmployee, addToast } = useApp();
  const { employees = [] } = data;

  // Month navigation: support 2025, 2026, 2027
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const allMonths = useMemo(() => {
    const list = [];
    [2025, 2026, 2027].forEach((yr) => {
      monthNames.forEach((mName, mIdx) => {
        list.push({
          label: `${mName} ${yr}`,
          year: yr,
          monthIndex: mIdx,
          monthName: mName,
        });
      });
    });
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return data.selectedMonth || getCurrentMonthLabel();
  });

  const activeMonthObj = useMemo(() => {
    return allMonths.find((m) => m.label === selectedMonth) || getCurrentMonthObj();
  }, [allMonths, selectedMonth]);

  const monthStats = useMemo(() => {
    return calculateMonthCalendar(activeMonthObj.year, activeMonthObj.monthIndex);
  }, [activeMonthObj]);

  // Small Calendar Month Picker State
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(activeMonthObj.year);
  const calendarPickerRef = useRef(null);

  useEffect(() => {
    setPickerYear(activeMonthObj.year);
  }, [activeMonthObj.year]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarPickerRef.current && !calendarPickerRef.current.contains(event.target)) {
        setIsCalendarPickerOpen(false);
      }
    };
    if (isCalendarPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarPickerOpen]);

  const selectMonthFromPicker = (monthIndex, yr) => {
    const targetLabel = `${monthNames[monthIndex]} ${yr}`;
    setSelectedMonth(targetLabel);
    setIsCalendarPickerOpen(false);
  };

  const currentMonthIdx = allMonths.findIndex((m) => m.label === selectedMonth);
  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) setSelectedMonth(allMonths[currentMonthIdx - 1].label);
  };
  const handleNextMonth = () => {
    if (currentMonthIdx < allMonths.length - 1) setSelectedMonth(allMonths[currentMonthIdx + 1].label);
  };

  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Employee Ledger Modal State
  const [selectedEmployeeLedger, setSelectedEmployeeLedger] = useState(null);

  // Real-time allocation map synchronized with selected month and meal entries
  const allocationsMap = useMemo(() => {
    return getEmployeesAllocationMap(
      employees, 
      data.mealEntries || [], 
      new Date(),
      activeMonthObj.year,
      activeMonthObj.monthIndex
    );
  }, [employees, data.mealEntries, activeMonthObj]);

  // Add Employee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Junior');
  const [newDepartment, setNewDepartment] = useState('Field Operations');
  const [newDesignation, setNewDesignation] = useState('');
  const [newShift, setNewShift] = useState('Day Shift');

  // Delete Confirmation State
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Category counts
  const juniorCount = employees.filter((e) => e.category === 'Junior').length;
  const seniorCount = employees.filter((e) => e.category === 'Senior').length;

  // Auto-suggest next ID when opening modal
  const handleOpenAddModal = () => {
    // Find highest AHP-xxxx number
    let maxNum = 1100;
    employees.forEach((e) => {
      const match = e.id.match(/^AHP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    setNewId(`AHP-${maxNum + 1}`);
    setNewName('');
    setNewCategory('Junior');
    setNewDepartment('Field Operations');
    setNewDesignation('');
    setNewShift('Day Shift');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) {
      addToast('Employee ID and Full Name are required.', 'error');
      return;
    }

    const res = addEmployee({
      id: newId,
      name: newName,
      category: newCategory,
      department: newDepartment,
      designation: newDesignation || (newCategory === 'Junior' ? 'Junior Technician' : newCategory === 'Senior' ? 'Senior Engineer' : 'Executive Director'),
      shift: newShift,
    });

    if (res.success) {
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
    }
  };

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchesCategory = selectedCategory === 'All' || emp.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (emp.id && emp.id.toLowerCase().includes(query)) ||
      (emp.name && emp.name.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query)) ||
      (emp.designation && emp.designation.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight">
            Al-Haditha Employees Management
          </h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold rounded-xl shadow-pill transition-all self-start sm:self-auto hover:scale-[1.02] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Summary Cards (Total, Junior, Senior) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Workforce */}
        <div 
          onClick={() => setSelectedCategory('All')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white text-slate-primary border-surface-border shadow-card hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${selectedCategory === 'All' ? 'text-slate-300' : 'text-slate-secondary'}`}>
              Total Staff
            </span>
            <div className={`p-2 rounded-xl ${selectedCategory === 'All' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">{employees.length}</p>
          <span className={`text-[11px] font-medium ${selectedCategory === 'All' ? 'text-emerald-400' : 'text-brand-green'}`}>
            Active Company Roster
          </span>
        </div>

        {/* Junior */}
        <div 
          onClick={() => setSelectedCategory('Junior')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedCategory === 'Junior'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
              : 'bg-white text-slate-primary border-surface-border shadow-card hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${selectedCategory === 'Junior' ? 'text-emerald-200' : 'text-slate-secondary'}`}>
              Junior Category
            </span>
            <div className={`p-2 rounded-xl ${selectedCategory === 'Junior' ? 'bg-white/15 text-white' : 'bg-emerald-50 text-brand-green'}`}>
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">{juniorCount}</p>
          <span className={`text-[11px] font-medium ${selectedCategory === 'Junior' ? 'text-emerald-200' : 'text-slate-secondary'}`}>
            Field & Operational Staff
          </span>
        </div>

        {/* Senior */}
        <div 
          onClick={() => setSelectedCategory('Senior')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedCategory === 'Senior'
              ? 'bg-sky-800 text-white border-sky-800 shadow-md ring-2 ring-sky-800/20'
              : 'bg-white text-slate-primary border-surface-border shadow-card hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${selectedCategory === 'Senior' ? 'text-sky-200' : 'text-slate-secondary'}`}>
              Senior Category
            </span>
            <div className={`p-2 rounded-xl ${selectedCategory === 'Senior' ? 'bg-white/15 text-white' : 'bg-sky-50 text-brand-blue'}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">{seniorCount}</p>
          <span className={`text-[11px] font-medium ${selectedCategory === 'Senior' ? 'text-sky-200' : 'text-slate-secondary'}`}>
            Engineers & Supervisors
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        
        {/* Controls: Category Filter Tabs, Month/Date Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-surface-border flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            {[
              { label: 'All', count: employees.length },
              { label: 'Junior', count: juniorCount },
              { label: 'Senior', count: seniorCount },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSelectedCategory(tab.label)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.label
                    ? 'bg-white text-slate-primary shadow-xs font-bold'
                    : 'text-slate-secondary hover:text-slate-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedCategory === tab.label ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Controls: Month/Date Filter + Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month/Date Allocation Selector with Small Calendar Popover */}
            <div className="relative" ref={calendarPickerRef}>
              <div className="flex items-center space-x-1 bg-slate-50 border border-surface-border p-1 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={currentMonthIdx <= 0}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Calendar Button that toggles the small calendar popover */}
                <button
                  type="button"
                  onClick={() => {
                    setPickerYear(activeMonthObj.year);
                    setIsCalendarPickerOpen(!isCalendarPickerOpen);
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCalendarPickerOpen
                      ? 'bg-brand-green text-white shadow-pill'
                      : 'text-slate-primary hover:bg-white'
                  }`}
                  title="Click to select month from calendar"
                >
                  <Calendar className={`w-4 h-4 ${isCalendarPickerOpen ? 'text-white' : 'text-brand-green'}`} />
                  <span>{selectedMonth}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={currentMonthIdx >= allMonths.length - 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Small Calendar Month Picker Popover */}
              {isCalendarPickerOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white rounded-2xl shadow-xl border border-surface-border p-3.5 z-50 animate-fade-in">
                  {/* Year Header with Prev/Next */}
                  <div className="flex items-center justify-between pb-2 border-b border-surface-border mb-2.5">
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => Math.max(2024, y - 1))}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Previous Year"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-primary tracking-wide">
                      {pickerYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => Math.min(2030, y + 1))}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Next Year"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 12 Months Grid */}
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {monthNames.map((name, idx) => {
                      const isSelected = activeMonthObj.monthIndex === idx && activeMonthObj.year === pickerYear;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => selectMonthFromPicker(idx, pickerYear)}
                          className={`py-2 rounded-xl text-center font-semibold text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-green text-white shadow-pill font-bold'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {name.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Shortcut Row */}
                  <div className="mt-2.5 pt-2 border-t border-surface-border flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Current: {activeMonthObj.monthName}</span>
                    <button
                      type="button"
                      onClick={() => selectMonthFromPicker(10, 2026)}
                      className="text-brand-blue font-bold hover:underline cursor-pointer"
                    >
                      Nov 2026
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quota Badge */}
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap">
              {monthStats.workingDaysCount} Days • {monthStats.allocationsPerEmployee} Quota
            </span>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, name, role..."
                className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:border-brand-blue transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Employees Table with Individual Allocations */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-surface-border text-slate-secondary text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5 text-left w-28 whitespace-nowrap">Employee ID</th>
                <th className="px-4 py-3.5 text-left min-w-[200px] whitespace-nowrap">Full Name</th>
                <th className="px-4 py-3.5 text-center w-28 whitespace-nowrap">Category</th>
                <th className="px-4 py-3.5 text-center w-28 whitespace-nowrap">Monthly Quota</th>
                <th className="px-4 py-3.5 text-center w-28 whitespace-nowrap">Consumed</th>
                <th className="px-4 py-3.5 text-center w-36 whitespace-nowrap">Remaining Balance</th>
                <th className="px-4 py-3.5 text-center w-20 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-secondary text-xs">
                    No employees found matching the filter "{selectedCategory}" or query "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const alloc = allocationsMap[emp.id] || {
                    totalMonthlyQuota: monthStats.allocationsPerEmployee || 66,
                    consumedCount: 0,
                    expiredCount: 0,
                    remainingMonthlyAllocations: monthStats.allocationsPerEmployee || 66
                  };

                  const isContract = emp.isContract === true || CONTRACT_EMPLOYEE_IDS.has(emp.id);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800 text-left whitespace-nowrap">
                        {emp.id}
                      </td>

                      {/* Name with Contract-based 'C' badge (clean flush-left alignment for all names) */}
                      <td className="px-4 py-3.5 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 truncate max-w-[220px]" title={emp.name}>
                            {emp.name}
                          </span>
                          {isContract && (
                            <span
                              className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10.5px] flex-shrink-0 shadow-2xs ${
                                emp.category === 'Junior'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-sky-100 text-sky-800 border border-sky-300'
                              }`}
                              title="Contract-Based Employee (Contractor)"
                            >
                              C
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category Badge - Uniform & Centered Bubble */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center justify-center min-w-[76px] px-2.5 py-1 rounded-full text-[11px] font-bold text-center ${
                            emp.category === 'Junior' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            emp.category === 'Senior' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                            'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}>
                            {emp.category}
                          </span>
                        </div>
                      </td>

                      {/* Monthly Quota */}
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900 whitespace-nowrap">
                        {alloc.totalMonthlyQuota} Meals
                      </td>

                      {/* Consumed Allocations - Uniform & Centered Bubble */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center justify-center min-w-[95px] px-2.5 py-1 rounded-full text-xs font-bold text-center ${
                            alloc.consumedCount > 0 
                              ? 'bg-sky-50 text-brand-blue border border-sky-200' 
                              : 'bg-slate-100/70 text-slate-400 border border-slate-200/60'
                          }`}>
                            {alloc.consumedCount} Consumed
                          </span>
                        </div>
                      </td>

                      {/* Remaining Balance - Uniform & Centered Bubble */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center min-w-[110px] px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-brand-green border border-emerald-300 shadow-2xs text-center">
                            <span>{alloc.remainingMonthlyAllocations} Meals</span>
                          </span>
                        </div>
                      </td>

                      {/* Actions: Delete only (eye button removed) */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setEmployeeToDelete(emp)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title={`Delete ${emp.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-surface-border flex items-center justify-between text-xs text-slate-secondary">
          <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
          <span className="text-[11px] text-slate-muted">Click any category card above to quick-filter</span>
        </div>
      </div>

      {/* MODAL: Add New Employee */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee Record"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          
          {/* Employee ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value.toUpperCase())}
              placeholder="e.g. AHP-1101"
              required
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green font-mono uppercase"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Employee Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sultan Al-Balushi"
              required
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          {/* Category Selector (Junior / Senior) */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Entitlement Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Junior', desc: 'Field & Operational Staff', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
                { name: 'Senior', desc: 'Engineers & Supervisors', color: 'border-sky-300 bg-sky-50 text-sky-900' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => setNewCategory(cat.name)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    newCategory === cat.name
                      ? `${cat.color} font-bold ring-2 ring-brand-green/30`
                      : 'border-surface-border bg-white text-slate-secondary hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
            >
              Save Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      {employeeToDelete && (
        <Modal
          isOpen={!!employeeToDelete}
          onClose={() => setEmployeeToDelete(null)}
          title="Confirm Employee Deletion"
          subtitle="Are you sure you want to remove this employee record from the system?"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-950">
              <div className="flex items-center space-x-2 text-red-700 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Permanent Removal Warning</span>
              </div>
              <p>
                You are about to delete employee <strong>{employeeToDelete.name}</strong> (ID: <strong>{employeeToDelete.id}</strong>) from the <strong>{employeeToDelete.category}</strong> category.
              </p>
              <p className="text-[11px] text-red-800">
                This will automatically reduce the {employeeToDelete.category} workforce headcount count and update meal allocations.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
              >
                Yes, Delete Employee
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Employee Individual Allocation Ledger */}
      {selectedEmployeeLedger && (
        <Modal
          isOpen={!!selectedEmployeeLedger}
          onClose={() => setSelectedEmployeeLedger(null)}
          title={`Employee Meal Allocation Ledger: ${selectedEmployeeLedger.emp.name}`}
          subtitle={`ID: ${selectedEmployeeLedger.emp.id} • ${selectedEmployeeLedger.emp.category} Category • ${selectedEmployeeLedger.emp.department}`}
        >
          <div className="space-y-4 text-xs">
            {/* Macro Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-surface-border text-center">
                <span className="text-[10px] text-slate-secondary block">Monthly Quota</span>
                <span className="text-base font-bold text-slate-primary">{selectedEmployeeLedger.alloc.totalMonthlyQuota} Meals</span>
                <span className="text-[10px] text-slate-muted block">{monthStats.workingDaysCount} active days</span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-center">
                <span className="text-[10px] text-sky-800 block">Consumed</span>
                <span className="text-base font-bold text-brand-blue">{selectedEmployeeLedger.alloc.consumedCount} Meals</span>
                <span className="text-[10px] text-brand-blue/80 block">Logged entries</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                <span className="text-[10px] text-rose-800 block">Missed / Expired</span>
                <span className="text-base font-bold text-rose-600">{selectedEmployeeLedger.alloc.expiredCount} Meals</span>
                <span className="text-[10px] text-rose-500 block">Passed windows</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 block">Remaining</span>
                <span className="text-base font-black text-brand-green">{selectedEmployeeLedger.alloc.remainingMonthlyAllocations} Meals</span>
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
                    {selectedEmployeeLedger.alloc.todayMealsStatus.breakfast.status}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-700">Lunch</span>
                  <span className="text-[10px] text-slate-400">14:00 - 15:00</span>
                  <span className="font-bold block mt-1 text-slate-900">
                    {selectedEmployeeLedger.alloc.todayMealsStatus.lunch.status}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-700">Dinner</span>
                  <span className="text-[10px] text-slate-400">19:00 - 20:00</span>
                  <span className="font-bold block mt-1 text-slate-900">
                    {selectedEmployeeLedger.alloc.todayMealsStatus.dinner.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Log of recorded meals for this employee */}
            <div>
              <span className="font-bold text-slate-primary text-xs block mb-1.5">Recorded Attendance Entries:</span>
              {(() => {
                const empEntries = (data.mealEntries || []).filter(e => e.employeeId === selectedEmployeeLedger.emp.id);
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
                onClick={() => setSelectedEmployeeLedger(null)}
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
