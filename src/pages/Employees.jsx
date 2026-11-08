import React, { useState, useMemo } from 'react';
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
  Utensils
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';
import { getEmployeesAllocationMap, calculateMonthCalendar } from '../utils/allocationEngine';

export default function Employees() {
  const { data, addEmployee, deleteEmployee, addToast } = useApp();
  const { employees = [] } = data;

  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Employee Ledger Modal State
  const [selectedEmployeeLedger, setSelectedEmployeeLedger] = useState(null);

  // Real-time allocation map for all employees (reactively minused upon each meal check-in)
  const allocationsMap = useMemo(() => {
    return getEmployeesAllocationMap(employees, data.mealEntries || [], new Date());
  }, [employees, data.mealEntries]);

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
      emp.id.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.designation.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4 text-brand-blue" />
            <span>Master Workforce Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Al-Haditha Employees Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Manage company personnel, filter by tier category (Junior, Senior), and add or remove staff records.
          </p>
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
        
        {/* Controls: Category Filter Tabs & Search Bar */}
        <div className="p-5 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          
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

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, role..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-surface-border rounded-xl focus:bg-white focus:outline-none focus:border-brand-blue transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Employees Table with Individual Allocations */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-surface-border text-slate-secondary text-[10px] uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Department & Role</th>
                <th className="px-4 py-3 text-center">Daily Quota</th>
                <th className="px-4 py-3 text-center">Monthly Quota</th>
                <th className="px-4 py-3 text-center">Consumed</th>
                <th className="px-4 py-3 text-center">Remaining Balance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-secondary text-xs">
                    No employees found matching the filter "{selectedCategory}" or query "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const alloc = allocationsMap[emp.id] || {
                    totalMonthlyQuota: 66,
                    consumedCount: 0,
                    expiredCount: 0,
                    remainingMonthlyAllocations: 66
                  };

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-primary">
                        {emp.id}
                      </td>

                      {/* Name with initials avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                            emp.category === 'Junior' ? 'bg-emerald-100 text-emerald-800' :
                            emp.category === 'Senior' ? 'bg-sky-100 text-sky-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {emp.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-primary">{emp.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          emp.category === 'Junior' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          emp.category === 'Senior' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                          'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {emp.category}
                        </span>
                      </td>

                      {/* Department & Role */}
                      <td className="px-4 py-3">
                        <span className="text-slate-primary font-medium block">{emp.designation}</span>
                        <span className="text-[11px] text-slate-secondary">{emp.department}</span>
                      </td>

                      {/* Daily Quota */}
                      <td className="px-4 py-3 text-center font-medium text-slate-primary">
                        3 Meals
                      </td>

                      {/* Monthly Quota */}
                      <td className="px-4 py-3 text-center font-bold text-slate-primary">
                        {alloc.totalMonthlyQuota} Meals
                      </td>

                      {/* Consumed Allocations */}
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${alloc.consumedCount > 0 ? 'text-brand-blue' : 'text-slate-400'}`}>
                          {alloc.consumedCount} Consumed
                        </span>
                      </td>

                      {/* Remaining Balance (minused upon each entry) */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-brand-green border border-emerald-300 shadow-xs">
                          <span>{alloc.remainingMonthlyAllocations} Meals</span>
                          {alloc.consumedCount > 0 && <span className="text-[10px] text-emerald-700 font-bold ml-1">(-{alloc.consumedCount})</span>}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-brand-green border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Actions: View Ledger & Delete */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedEmployeeLedger({ emp, alloc })}
                            className="p-1.5 text-slate-400 hover:text-brand-blue rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
                            title={`View Allocation Ledger for ${emp.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
        subtitle="Register staff into the master database with ID, Name, and Entitlement Category."
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

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Department
            </label>
            <select
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white"
            >
              <option value="Field Operations">Field Operations</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Camp & Mess Catering">Camp & Mess Catering</option>
              <option value="HSE & Security">HSE & Security</option>
              <option value="Drilling & Completions">Drilling & Completions</option>
              <option value="Logistics">Logistics</option>
              <option value="Engineering & Projects">Engineering & Projects</option>
              <option value="Executive Management">Executive Management</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
            </select>
          </div>

          {/* Designation / Job Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Designation / Role Title
            </label>
            <input
              type="text"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              placeholder="e.g. Rig Technician, Senior Petroleum Engineer"
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Shift Schedule
            </label>
            <select
              value={newShift}
              onChange={(e) => setNewShift(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white"
            >
              <option value="Day Shift">Day Shift</option>
              <option value="Night Shift">Night Shift</option>
              <option value="Rotational">Rotational</option>
              <option value="Executive">Executive</option>
            </select>
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
                <span className="text-[10px] text-slate-muted block">22 active days</span>
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
