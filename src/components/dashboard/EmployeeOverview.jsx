import React, { useState } from 'react';
import { Users, User, Gem, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EmployeeOverview() {
  const { data, addToast } = useApp();
  const { employeeOverview } = data;
  const [filter, setFilter] = useState('This Month');
  const [isOpen, setIsOpen] = useState(false);

  const filters = ['Today', 'This Week', 'This Month', 'Last Month'];

  const handleSelectFilter = (opt) => {
    setFilter(opt);
    setIsOpen(false);
    addToast(`Filter updated to ${opt}`);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
            <Users className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-primary tracking-tight">
            Employee Meal Overview
          </h2>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-medium text-slate-secondary transition-colors"
          >
            <span>{filter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-muted" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white border border-surface-border rounded-xl shadow-lg py-1 z-30 animate-fade-in">
              {filters.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelectFilter(opt)}
                  className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors ${
                    filter === opt ? 'text-brand-green font-semibold bg-brand-green-light/40' : 'text-slate-primary hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3 Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Junior */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green flex-shrink-0">
              <User className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-secondary">Junior</span>
              <p className="text-2xl font-bold text-slate-primary tracking-tight leading-tight mt-0.5">
                {employeeOverview.junior.total.toLocaleString()}
              </p>
              <p className="text-xs text-slate-secondary mt-1">
                Eating: <span className="font-medium text-slate-primary">{employeeOverview.junior.eating.toLocaleString()}</span>{' '}
                <span className="text-slate-muted">({employeeOverview.junior.percentage}%)</span>
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-500"
              style={{ width: `${employeeOverview.junior.percentage}%` }}
            />
          </div>
        </div>

        {/* Senior */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-brand-blue-light flex items-center justify-center text-brand-blue flex-shrink-0">
              <Users className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-secondary">Senior</span>
              <p className="text-2xl font-bold text-slate-primary tracking-tight leading-tight mt-0.5">
                {employeeOverview.senior.total.toLocaleString()}
              </p>
              <p className="text-xs text-slate-secondary mt-1">
                Eating: <span className="font-medium text-slate-primary">{employeeOverview.senior.eating.toLocaleString()}</span>{' '}
                <span className="text-slate-muted">({employeeOverview.senior.percentage}%)</span>
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all duration-500"
              style={{ width: `${employeeOverview.senior.percentage}%` }}
            />
          </div>
        </div>

        {/* VIP */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green flex-shrink-0">
              <Gem className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-secondary">VIP</span>
              <p className="text-2xl font-bold text-slate-primary tracking-tight leading-tight mt-0.5">
                {employeeOverview.vip.total.toLocaleString()}
              </p>
              <p className="text-xs text-slate-secondary mt-1">
                Eating: <span className="font-medium text-slate-primary">{employeeOverview.vip.eating.toLocaleString()}</span>{' '}
                <span className="text-slate-muted">({employeeOverview.vip.percentage}%)</span>
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-500"
              style={{ width: `${employeeOverview.vip.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

