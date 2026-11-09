import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  Utensils, 
  Coffee, 
  Sun, 
  Moon, 
  Trash2, 
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Records() {
  const { data, deleteMealEntry, addToast } = useApp();
  const mealEntries = data.mealEntries || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'Junior' | 'Senior'
  const [selectedMealType, setSelectedMealType] = useState('ALL'); // 'ALL' | 'Breakfast' | 'Lunch' | 'Dinner'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Meal types list
  const mealTypes = [
    { id: 'ALL', label: 'All Meals', icon: Utensils },
    { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'Lunch', label: 'Lunch', icon: Sun },
    { id: 'Dinner', label: 'Dinner', icon: Moon }
  ];

  // Filtered Entries Calculation (Realtime synced with context)
  const filteredEntries = useMemo(() => {
    return mealEntries.filter((entry) => {
      // 1. Category Filter
      if (selectedCategory !== 'ALL') {
        const cat = (entry.category || '').toLowerCase();
        if (cat !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 2. Meal Type Filter
      if (selectedMealType !== 'ALL') {
        const m = (entry.mealType || '').toLowerCase();
        if (m !== selectedMealType.toLowerCase()) {
          return false;
        }
      }

      // 3. Date Range Filter
      const entryDate = entry.date || '';
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;

      // 4. Search Query Filter (Matches Name, ID, or Date/Time)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchId = (entry.employeeId || '').toLowerCase().includes(q);
        const matchName = (entry.employeeName || '').toLowerCase().includes(q);
        const matchDept = (entry.department || '').toLowerCase().includes(q);
        const matchTime = (entry.timestamp || '').toLowerCase().includes(q);
        const matchDate = (entry.date || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchDept && !matchTime && !matchDate) {
          return false;
        }
      }

      return true;
    });
  }, [mealEntries, selectedCategory, selectedMealType, startDate, endDate, searchQuery]);

  // Macro Summaries for Current Filtered Set
  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const junior = filteredEntries.filter((e) => (e.category || '').toLowerCase() === 'junior').length;
    const senior = filteredEntries.filter((e) => (e.category || '').toLowerCase() === 'senior').length;
    const breakfast = filteredEntries.filter((e) => (e.mealType || '').toLowerCase() === 'breakfast').length;
    const lunch = filteredEntries.filter((e) => (e.mealType || '').toLowerCase() === 'lunch').length;
    const dinner = filteredEntries.filter((e) => (e.mealType || '').toLowerCase() === 'dinner').length;
    return { total, junior, senior, breakfast, lunch, dinner };
  }, [filteredEntries]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || 
    selectedCategory !== 'ALL' || 
    selectedMealType !== 'ALL' || 
    startDate || 
    endDate
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedMealType('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    addToast('Filters reset to default.');
  };

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      addToast('No records available to export.', 'error');
      return;
    }

    const headers = [
      'Record ID',
      'Date',
      'Time',
      'Employee ID',
      'Staff Name',
      'Category',
      'Meal Type',
      'Status'
    ];

    const rows = filteredEntries.map((e) => [
      `"${e.id || ''}"`,
      `"${e.date || ''}"`,
      `"${e.timestamp || ''}"`,
      `"${e.employeeId || ''}"`,
      `"${(e.employeeName || '').replace(/"/g, '""')}"`,
      `"${e.category || ''}"`,
      `"${e.mealType || ''}"`,
      `"${e.status || 'Verified'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `AlHaditha_Meal_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast(`Exported ${filteredEntries.length} records successfully.`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans w-full max-w-full overflow-hidden">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-surface-border shadow-card">
        <div className="min-w-0">
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Master Audit & Attendance Records</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-primary tracking-tight mt-1 truncate">
            Mess Attendance & Meal Entry Records
          </h1>
        </div>

        {/* Single Export Button */}
        <div className="flex items-center shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Download records as Excel / CSV spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive KPI Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-card">
          <span className="text-[11px] font-semibold text-slate-secondary block truncate">Total Entries</span>
          <p className="text-lg sm:text-xl font-bold text-slate-primary mt-0.5">{stats.total.toLocaleString()}</p>
          <span className="text-[10px] text-brand-green font-medium truncate block">Logged in System</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-card">
          <span className="text-[11px] font-semibold text-emerald-800 block truncate">Junior Staff</span>
          <p className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">{stats.junior.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium truncate block">Standard Tier</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-card">
          <span className="text-[11px] font-semibold text-brand-blue block truncate">Senior Staff</span>
          <p className="text-lg sm:text-xl font-bold text-brand-blue mt-0.5">{stats.senior.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium truncate block">Senior Tier</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-card">
          <span className="text-[11px] font-semibold text-amber-800 block truncate">Breakfast</span>
          <p className="text-lg sm:text-xl font-bold text-amber-900 mt-0.5">{stats.breakfast.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium truncate block">09:00 - 10:00</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-card">
          <span className="text-[11px] font-semibold text-orange-800 block truncate">Lunch</span>
          <p className="text-lg sm:text-xl font-bold text-orange-900 mt-0.5">{stats.lunch.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium truncate block">14:00 - 15:00</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-card">
          <span className="text-[11px] font-semibold text-indigo-800 block truncate">Dinner</span>
          <p className="text-lg sm:text-xl font-bold text-indigo-900 mt-0.5">{stats.dinner.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-medium truncate block">19:00 - 20:00</span>
        </div>
      </div>

      {/* Filter Suite */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-primary">Filter Records</h3>
            {hasActiveFilters && (
              <span className="text-xs bg-brand-green/10 text-brand-green font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* 3-Column Responsive Filter Row: Search, Category, Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 1. Global Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-secondary uppercase mb-1">
              Search Staff / ID
            </label>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or AHP-..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green bg-white text-slate-800 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 2. Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-secondary uppercase mb-1">
              Employee Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green bg-white text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Junior">Junior Staff (Standard)</option>
              <option value="Senior">Senior Staff (Executive)</option>
            </select>
          </div>

          {/* 3. Date Range Filters */}
          <div>
            <label className="block text-[11px] font-bold text-slate-secondary uppercase mb-1">
              Date Period (From - To)
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-1/2 px-2.5 py-1.5 border border-surface-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-slate-800"
                title="Start Date"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-1/2 px-2.5 py-1.5 border border-surface-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-slate-800"
                title="End Date"
              />
            </div>
          </div>
        </div>

        {/* Meal Type Pills Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center space-x-1">
              <Utensils className="w-3.5 h-3.5 text-slate-400" />
              <span>Meal Service:</span>
            </span>
            {mealTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedMealType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedMealType(type.id);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-green text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-slate-500 shrink-0">
            Showing <strong className="text-slate-900 font-bold">{filteredEntries.length}</strong> matching records
          </div>
        </div>
      </div>

      {/* Main Records Table Card - Fully Responsive with Horizontal Scroll */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="py-14 px-4 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-primary">No Matching Records Found</h3>
              <p className="text-xs text-slate-secondary mt-1 max-w-sm mx-auto">
                No entries match the active filters or search query.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto w-full scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 border-b border-surface-border text-slate-secondary text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Meal Service</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date */}
                    <td className="px-4 py-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {entry.date || 'Today'}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{entry.timestamp || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {entry.employeeId}
                    </td>

                    {/* Staff Name */}
                    <td className="px-4 py-3 font-semibold text-slate-primary whitespace-nowrap">
                      {entry.employeeName}
                    </td>

                    {/* Category Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        entry.category === 'Junior' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : entry.category === 'Senior'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {entry.category || 'Junior'}
                      </span>
                    </td>

                    {/* Meal Service */}
                    <td className="px-4 py-3 font-medium text-slate-primary whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1.5">
                        {entry.mealType === 'Breakfast' ? <Coffee className="w-3.5 h-3.5 text-amber-600" /> :
                         entry.mealType === 'Lunch' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> :
                         entry.mealType === 'Dinner' ? <Moon className="w-3.5 h-3.5 text-indigo-500" /> :
                         <Utensils className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{entry.mealType}</span>
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-brand-green bg-brand-green-light/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-brand-green" />
                        <span>Verified</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => deleteMealEntry(entry.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete this meal record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredEntries.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-surface-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-secondary">
            <div className="text-center sm:text-left">
              Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredEntries.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{filteredEntries.length}</strong> records
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-surface-border bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-white border border-surface-border rounded-lg font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-surface-border bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
