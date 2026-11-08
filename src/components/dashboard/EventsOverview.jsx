import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ArrowRight, Users, Wallet, Clock, MapPin, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EventsOverview() {
  const { data, currency } = useApp();
  const events = data.events || [];
  const navigate = useNavigate();

  // Helper to parse event date cleanly
  const getEventDate = (ev) => {
    if (ev.fullDate) {
      const d = new Date(ev.fullDate);
      if (!isNaN(d.getTime())) return d;
    }
    if (ev.day) {
      const monthMap = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const mStr = (ev.month || 'Nov').toLowerCase().slice(0, 3);
      const mIdx = monthMap[mStr] !== undefined ? monthMap[mStr] : 10;
      const dayNum = parseInt(ev.day, 10) || 1;
      return new Date(2026, mIdx, dayNum);
    }
    return new Date(2026, 10, 1);
  };

  // Sort with nearest upcoming event listed at the top
  const sortedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...events].sort((a, b) => {
      const dateA = getEventDate(a);
      const dateB = getEventDate(b);

      const isPastA = dateA < today;
      const isPastB = dateB < today;

      // Upcoming events first, ordered from nearest date to furthest
      if (!isPastA && !isPastB) {
        return dateA.getTime() - dateB.getTime();
      }
      if (!isPastA && isPastB) return -1;
      if (isPastA && !isPastB) return 1;

      // Both past: most recent past event first
      return dateB.getTime() - dateA.getTime();
    });
  }, [events]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-blue">
            <CalendarDays className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-primary tracking-tight">
              Events & Hospitality
            </h2>
          </div>
        </div>

        <button
          onClick={() => navigate('/events')}
          className="group flex items-center space-x-1 text-xs font-medium text-slate-secondary hover:text-brand-blue transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <span>View Calendar</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="py-10 px-4 text-center flex flex-col items-center justify-center my-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
            <CalendarDays className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No Events Scheduled</p>
          <p className="text-xs text-slate-400 max-w-xs mt-0.5 mb-4">
            Schedule corporate banquets, VIP dining, or celebrations.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all cursor-pointer"
          >
            + Schedule Event
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between min-h-0">
          {/* Scrollable Event List with Nearest Event at Top */}
          <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1 custom-scrollbar">
            {sortedEvents.map((ev, idx) => (
              <div
                key={ev.id || `${ev.title}-${idx}`}
                onClick={() => navigate('/events', { state: { highlightEventId: ev.id } })}
                className="bg-slate-50/80 hover:bg-emerald-50/40 rounded-xl p-3 border border-surface-border hover:border-brand-green/30 transition-all cursor-pointer group shadow-2xs"
                title="Click to view details in Events module"
              >
                <div className="flex items-start space-x-3">
                  {/* Date Box */}
                  <div className="w-12 h-13 rounded-xl bg-brand-green-light border border-brand-green/20 flex flex-col items-center justify-center text-brand-green flex-shrink-0 shadow-xs py-1 group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <span className="text-lg font-black leading-none">{ev.day || '20'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{ev.month || 'Nov'}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-primary truncate group-hover:text-brand-green transition-colors">
                        {ev.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-brand-green bg-emerald-100/70 border border-emerald-200/50 px-2 py-0.5 rounded-md flex-shrink-0">
                        {ev.status || 'Confirmed'}
                      </span>
                    </div>

                    {/* Sub metrics */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-secondary">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          <strong className="text-slate-primary font-semibold">{ev.expectedCount || ev.invitedCount || 0}</strong> Guests
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Wallet className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          <strong className="text-slate-primary font-semibold">{(ev.overallBudget || 0).toLocaleString()} {currency}</strong>
                        </span>
                      </div>
                    </div>

                    {(ev.time || ev.location) && (
                      <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-400">
                        {ev.time && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{ev.time}</span>
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center space-x-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Alignment Anchor */}
          <div className="pt-3 mt-2 border-t border-surface-border flex items-center justify-between text-xs">
            <span className="text-slate-secondary font-medium">
              {events.length} Scheduled Event{events.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => navigate('/events')}
              className="font-semibold text-brand-green hover:text-brand-green-hover transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Event</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
