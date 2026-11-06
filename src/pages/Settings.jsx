import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Shield, Building2, Bell, DollarSign, Database, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { currency, setCurrency, addToast } = useApp();

  const [companyName, setCompanyName] = useState('Al Haditha Energy Petroleum Services LLC');
  const [headMess, setHeadMess] = useState('Central Camp Mess Complex - Hall 01');
  const [wasteAlertLimit, setWasteAlertLimit] = useState(15);
  const [autoPurgeTokens, setAutoPurgeTokens] = useState(true);
  const [friSatOff, setFriSatOff] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings and preferences successfully updated.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <SettingsIcon className="w-4 h-4" />
            <span>System Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Mess Settings & Operational Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Manage system-wide parameters, currency defaults, and kitchen threshold alerts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Facility */}
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-surface-border">
            <Building2 className="w-5 h-5 text-brand-blue" />
            <h3 className="font-semibold text-base text-slate-primary">Facility Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-primary mb-1">Company / Entity Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-primary mb-1">Primary Mess Facility</label>
              <input
                type="text"
                value={headMess}
                onChange={(e) => setHeadMess(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Standards */}
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-surface-border">
            <DollarSign className="w-5 h-5 text-brand-green" />
            <h3 className="font-semibold text-base text-slate-primary">Currency & Accounting Standard</h3>
          </div>

          <div className="text-xs space-y-3">
            <label className="block font-semibold text-slate-primary">Default Operational Currency</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="currency"
                  checked={currency === 'SAR'}
                  onChange={() => setCurrency('SAR')}
                  className="text-brand-green focus:ring-brand-green"
                />
                <span className="font-medium text-slate-primary">Saudi Riyal (SAR) — Matches Dashboard Reference</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="currency"
                  checked={currency === 'OMR'}
                  onChange={() => setCurrency('OMR')}
                  className="text-brand-green focus:ring-brand-green"
                />
                <span className="font-medium text-slate-primary">Omani Rial (OMR) — Standard Prompt Scope</span>
              </label>
            </div>
          </div>
        </div>

        {/* Working Days & Shift Rules */}
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-surface-border">
            <Shield className="w-5 h-5 text-brand-blue" />
            <h3 className="font-semibold text-base text-slate-primary">Working Days & Token Rules</h3>
          </div>

          <div className="text-xs space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={friSatOff}
                onChange={(e) => setFriSatOff(e.target.checked)}
                className="rounded text-brand-green focus:ring-brand-green"
              />
              <span className="font-medium text-slate-primary">
                Friday & Saturday Weekend Policy: Automatically treat as camp rest days.
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPurgeTokens}
                onChange={(e) => setAutoPurgeTokens(e.target.checked)}
                className="rounded text-brand-green focus:ring-brand-green"
              />
              <span className="font-medium text-slate-primary">
                Automatic Token Purge: Unconsumed tokens expire at end of shift window to maintain food inventory integrity.
              </span>
            </label>
          </div>
        </div>

        {/* Wastage Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-surface-border">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-base text-slate-primary">Food Wastage Notifications</h3>
          </div>

          <div className="text-xs space-y-2">
            <label className="block font-semibold text-slate-primary">
              High Waste Alert Threshold (%)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="5"
                max="50"
                value={wasteAlertLimit}
                onChange={(e) => setWasteAlertLimit(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
              <span className="text-slate-secondary">
                Trigger warning when meal waste exceeds {wasteAlertLimit}% of prepared capacity.
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold rounded-xl shadow-pill transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

