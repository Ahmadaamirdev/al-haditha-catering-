import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ArrowRight, Users, Wallet, MoreVertical, Edit2, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EventsOverview() {
  const { data, currency, addToast } = useApp();
  const events = data.events || [];
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(false);

  const primaryEvent = events[0] || null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
            <CalendarDays className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-primary tracking-tight">
            Events
          </h2>
        </div>

        <button
          onClick={() => navigate('/events')}
          className="group flex items-center space-x-1 text-xs font-medium text-slate-secondary hover:text-brand-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <span>View Calendar</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {!primaryEvent ? (
        <div className="py-6 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <CalendarDays className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No Events Scheduled</p>
          <p className="text-[11px] text-slate-400 max-w-xs mt-0.5 mb-3">
            Schedule corporate banquets, VIP dining, or celebrations.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="px-3 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
          >
            + Schedule Event
          </button>
        </div>
      ) : (
        /* Event Details Card */
        <div className="flex items-start space-x-4">
          {/* Date Box */}
          <div className="w-16 h-18 rounded-2xl bg-brand-green-light border border-brand-green/20 flex flex-col items-center justify-center text-brand-green flex-shrink-0 shadow-xs py-2">
            <span className="text-2xl font-bold leading-none">{primaryEvent.day || '—'}</span>
            <span className="text-xs font-semibold uppercase tracking-wider mt-0.5">{primaryEvent.month || 'Nov'}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-primary truncate">
                {primaryEvent.title}
              </h3>

              <div className="flex items-center space-x-1 relative">
                <span className="text-[10px] font-semibold text-brand-green bg-brand-green-light px-2 py-0.5 rounded-md">
                  {primaryEvent.status || 'Confirmed'}
                </span>
                <button
                  onClick={() => setActiveMenu(!activeMenu)}
                  className="text-slate-muted hover:text-slate-primary p-1 rounded-md transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenu && (
                  <div className="absolute right-0 top-6 w-36 bg-white border border-surface-border rounded-xl shadow-lg py-1 z-30 animate-fade-in text-xs">
                    <button
                      onClick={() => {
                        setActiveMenu(false);
                        navigate('/events');
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-2 text-slate-primary"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-secondary" />
                      <span>Manage Event</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu(false);
                        addToast('RSVP invitation reminder sent to staff.');
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center space-x-2 text-slate-primary"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-secondary" />
                      <span>Send Reminders</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sub metrics */}
            <div className="mt-2 space-y-1 text-xs text-slate-secondary">
              <div className="flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-slate-muted flex-shrink-0" />
                <span>
                  <strong className="text-slate-primary">{primaryEvent.invitedCount || primaryEvent.expectedCount || 0}</strong> Invited &nbsp;|&nbsp;{' '}
                  <strong className="text-slate-primary">{primaryEvent.expectedCount || 0}</strong> Expected
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Wallet className="w-3.5 h-3.5 text-slate-muted flex-shrink-0" />
                <span>
                  Budget: <strong className="text-slate-primary">{(primaryEvent.overallBudget || 0).toLocaleString()} {currency}</strong>{' '}
                  <span className="text-slate-muted">({primaryEvent.perPersonBudget || 0} {currency} per head)</span>
                </span>
              </div>

              {primaryEvent.description && (
                <p className="text-[11px] text-slate-muted pt-1 truncate">
                  {primaryEvent.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

