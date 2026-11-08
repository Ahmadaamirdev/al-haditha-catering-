import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CalendarDays, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Wallet, 
  Edit2, 
  Trash2, 
  Search,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

export default function Events() {
  const { data, currency, addEvent, updateEvent, deleteEvent, addToast } = useApp();
  const events = data.events || [];
  const allEmployees = data.employees || [];

  const location = useLocation();
  const highlightId = location.state?.highlightEventId;

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'calendar'
  const [expandedRosters, setExpandedRosters] = useState({});

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

  // Synced month state from global data.selectedMonth
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return data.selectedMonth || 'November 2026';
  });

  useEffect(() => {
    if (data.selectedMonth) {
      setSelectedMonth(data.selectedMonth);
    }
  }, [data.selectedMonth]);

  const activeMonthObj = useMemo(() => {
    return allMonths.find((m) => m.label === selectedMonth) || {
      label: 'November 2026',
      year: 2026,
      monthIndex: 10,
      monthName: 'November',
    };
  }, [allMonths, selectedMonth]);

  const currentMonthIdx = allMonths.findIndex((m) => m.label === selectedMonth);

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      setSelectedMonth(allMonths[currentMonthIdx - 1].label);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < allMonths.length - 1) {
      setSelectedMonth(allMonths[currentMonthIdx + 1].label);
    }
  };

  // Helper to accurately match events to the selected month & year
  const isEventInActiveMonth = (ev, year, monthIdx) => {
    const dateStr = ev.fullDate || ev.date;
    if (dateStr) {
      const matchYMD = String(dateStr).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (matchYMD) {
        return parseInt(matchYMD[1], 10) === year && (parseInt(matchYMD[2], 10) - 1) === monthIdx;
      }
      const matchDMY = String(dateStr).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (matchDMY) {
        return parseInt(matchDMY[3], 10) === year && (parseInt(matchDMY[2], 10) - 1) === monthIdx;
      }
    }
    const monthAbbr = monthNames[monthIdx].slice(0, 3).toLowerCase();
    const evMonth = (ev.month || '').toLowerCase();
    const evYear = ev.year ? parseInt(ev.year, 10) : 2026;
    return evMonth.startsWith(monthAbbr) && evYear === year;
  };

  const getEventDay = (ev) => {
    const dateStr = ev.fullDate || ev.date;
    if (dateStr) {
      const matchYMD = String(dateStr).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (matchYMD) return parseInt(matchYMD[3], 10);
      const matchDMY = String(dateStr).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (matchDMY) return parseInt(matchDMY[1], 10);
    }
    return parseInt(ev.day, 10);
  };

  // Events filtered specifically for the selected month
  const monthEvents = useMemo(() => {
    return events.filter((ev) => isEventInActiveMonth(ev, activeMonthObj.year, activeMonthObj.monthIndex));
  }, [events, activeMonthObj]);

  useEffect(() => {
    if (highlightId) {
      setActiveTab('upcoming');
      setTimeout(() => {
        const el = document.getElementById(`event-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [highlightId]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    fullDate: `${activeMonthObj.year}-${String(activeMonthObj.monthIndex + 1).padStart(2, '0')}-20`,
    time: '18:00 - 21:00',
    description: '',
    expectedCount: 10,
    perPersonBudget: 25,
    overallBudget: 250,
    menuChanged: false,
    menuDetails: 'Buffet with Grilled Meats, Rice, Fresh Salads, Traditional Sweets and Beverages.',
    category: 'Corporate / Special Banquet',
    location: 'Main Camp Mess Hall',
  });

  const handleOpenAdd = () => {
    setEditingEventId(null);
    const defaultDate = `${activeMonthObj.year}-${String(activeMonthObj.monthIndex + 1).padStart(2, '0')}-20`;
    setFormData({
      title: '',
      fullDate: defaultDate,
      time: '18:00 - 21:00',
      description: '',
      expectedCount: 10,
      perPersonBudget: 25,
      overallBudget: 250,
      menuChanged: false,
      menuDetails: 'Buffet with Grilled Meats, Rice, Fresh Salads, Traditional Sweets and Beverages.',
      category: 'Corporate / Special Banquet',
      location: 'Main Camp Mess Hall',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEventId(evt.id);
    const count = evt.expectedCount || evt.invitedCount || 10;
    const rate = evt.perPersonBudget || 25;
    const fallbackDay = String(evt.day || '20').padStart(2, '0');
    setFormData({
      title: evt.title || '',
      fullDate: evt.fullDate || `${activeMonthObj.year}-${String(activeMonthObj.monthIndex + 1).padStart(2, '0')}-${fallbackDay}`,
      time: evt.time || '18:00 - 21:00',
      description: evt.description || '',
      expectedCount: count,
      perPersonBudget: rate,
      overallBudget: evt.overallBudget || (count * rate),
      menuChanged: evt.menuChanged || false,
      menuDetails: evt.menuDetails || '',
      category: evt.category || 'Special Event',
      location: evt.location || 'Main Camp Mess Hall',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let day = '20';
    let month = 'Nov';
    const dateStr = String(formData.fullDate);
    const matchYMD = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (matchYMD) {
      const mIdx = parseInt(matchYMD[2], 10) - 1;
      day = String(parseInt(matchYMD[3], 10));
      month = monthNames[mIdx] ? monthNames[mIdx].slice(0, 3) : 'Nov';
    }

    const headcount = Number(formData.expectedCount || 1);
    const rate = Number(formData.perPersonBudget || 0);
    const overallBudget = Number(formData.overallBudget || (headcount * rate));

    const payload = {
      ...formData,
      day,
      month,
      expectedCount: headcount,
      invitedCount: headcount,
      perPersonBudget: rate,
      overallBudget,
      category: formData.category || 'Special Event',
    };

    if (editingEventId) {
      updateEvent(editingEventId, payload);
    } else {
      addEvent(payload);
    }
    setIsModalOpen(false);
  };

  // Dynamic Calendar generation for selected Month and Year
  const daysInMonth = new Date(activeMonthObj.year, activeMonthObj.monthIndex + 1, 0).getDate();
  const startDayOfWeek = new Date(activeMonthObj.year, activeMonthObj.monthIndex, 1).getDay(); // 0 = Sun
  const leadingBlanks = Array.from({ length: startDayOfWeek }, (_, i) => i);
  const monthDaysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>VIP & Special Catering</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Corporate Events, Banquets & VIP Dining
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Event</span>
          </button>
        </div>
      </div>

      {/* Tabs & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'upcoming'
                ? 'bg-brand-green text-white shadow-pill'
                : 'text-slate-secondary hover:text-slate-primary hover:bg-white'
            }`}
          >
            Upcoming Events ({monthEvents.length})
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'calendar'
                ? 'bg-brand-green text-white shadow-pill'
                : 'text-slate-secondary hover:text-slate-primary hover:bg-white'
            }`}
          >
            Monthly Calendar View
          </button>
        </div>

        {/* Global Synchronized Month Filter */}
        <div className="flex items-center space-x-1.5 bg-white border border-surface-border rounded-xl px-2.5 py-1 shadow-2xs">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentMonthIdx <= 0}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 px-2 text-xs font-bold text-slate-primary select-none">
            <Calendar className="w-3.5 h-3.5 text-brand-green" />
            <span>{selectedMonth}</span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentMonthIdx >= allMonths.length - 1}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View: Upcoming Events */}
      {activeTab === 'upcoming' && (
        monthEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-surface-border shadow-card text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-green-light border border-brand-green/20 flex items-center justify-center text-brand-green mx-auto mb-4 shadow-xs">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-primary">No Events Scheduled for {selectedMonth}</h3>
            <p className="text-xs sm:text-sm text-slate-secondary max-w-md mx-auto mt-1 mb-5">
              Schedule your first corporate banquet, VIP dining, or celebration for this month.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event for {selectedMonth}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {monthEvents.map((evt) => {
              return (
                <div
                  key={evt.id}
                  id={`event-${evt.id}`}
                  className={`bg-white rounded-2xl p-6 border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between ${
                    highlightId === evt.id ? 'border-brand-green ring-2 ring-brand-green/30 bg-emerald-50/20' : 'border-surface-border'
                  }`}
                >
                  <div>
                    {/* Event Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-4">
                        {/* Date Badge */}
                        <div className="w-16 h-18 rounded-2xl bg-brand-green-light border border-brand-green/20 flex flex-col items-center justify-center text-brand-green flex-shrink-0 shadow-xs py-2">
                          <span className="text-2xl font-bold leading-none">{evt.day}</span>
                          <span className="text-xs font-semibold uppercase tracking-wider mt-0.5">{evt.month}</span>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-base text-slate-primary">{evt.title}</h3>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-secondary mt-1">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-muted" />
                              <span>{evt.time}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="p-1.5 rounded-lg text-slate-muted hover:text-brand-blue hover:bg-slate-100 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEvent(evt.id)}
                          className="p-1.5 rounded-lg text-slate-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sub details */}
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-surface-border space-y-2 mb-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-secondary">
                          <Users className="w-3.5 h-3.5 text-slate-muted" />
                          <span>Guest Attendance:</span>
                        </span>
                        <span className="font-semibold text-slate-primary">
                          {evt.expectedCount || evt.invitedCount || 0} Guests
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-secondary">
                          <Wallet className="w-3.5 h-3.5 text-slate-muted" />
                          <span>Event Catering Budget:</span>
                        </span>
                        <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          {(evt.overallBudget || 0).toLocaleString()} {currency}{' '}
                          <span className="font-normal text-slate-500 text-[11px]">({evt.perPersonBudget} {currency}/guest)</span>
                        </span>
                      </div>
                    </div>

                    {/* Event Description */}
                    {evt.description && (
                      <p className="text-xs text-slate-secondary mb-3">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-surface-border flex justify-between items-center text-xs">
                    <span className="text-slate-muted text-[11px]">ID: {evt.id}</span>
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="font-semibold text-brand-blue hover:text-brand-blue-dark text-xs"
                    >
                      Edit Event
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* View: Monthly Calendar View */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-brand-green-light text-brand-green border border-brand-green/20">
                <Calendar className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-primary">
                  Catering Schedule Calendar — {selectedMonth}
                </h3>
                <p className="text-xs text-slate-secondary mt-0.5">
                  Synchronized banquets, VIP dining, and event catering targets for {selectedMonth}.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 text-xs text-slate-secondary font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-xs" />
                <span>Confirmed Banquet</span>
              </span>
            </div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="font-semibold text-slate-secondary py-2 border-b border-surface-border">
                {d}
              </div>
            ))}

            {/* Empty slots for starting day of month */}
            {leadingBlanks.map((_, i) => (
              <div key={`blank-${i}`} className="h-24 p-1.5 rounded-xl bg-slate-50/40 text-slate-300"></div>
            ))}

            {monthDaysList.map((dayNum) => {
              const dayEvents = events.filter((ev) => isEventInActiveMonth(ev, activeMonthObj.year, activeMonthObj.monthIndex) && getEventDay(ev) === dayNum);
              const hasEvents = dayEvents.length > 0;
              const isWeekend = (leadingBlanks.length + dayNum - 1) % 7 === 5 || (leadingBlanks.length + dayNum - 1) % 7 === 6;

              return (
                <div
                  key={dayNum}
                  className={`h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    hasEvents
                      ? 'border-brand-green bg-brand-green-light/30'
                      : isWeekend
                      ? 'border-surface-border/50 bg-slate-50/40'
                      : 'border-surface-border bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${hasEvents ? 'text-brand-green font-black' : 'text-slate-primary'}`}>
                      {dayNum}
                    </span>
                    {isWeekend && (
                      <span className="text-[9px] text-slate-400 font-medium">Off</span>
                    )}
                  </div>

                  {hasEvents && (
                    <div className="space-y-1">
                      {dayEvents.map((ev) => (
                        <div 
                          key={ev.id}
                          onClick={() => handleOpenEdit(ev)}
                          className="cursor-pointer bg-brand-green text-white p-1 rounded-md text-[10px] font-semibold truncate hover:opacity-90 shadow-2xs"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Event */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
        title={editingEventId ? 'Edit Event' : 'Create Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Event Title & Date/Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VIP Board Luncheon or Safety Excellence Banquet"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Event Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.fullDate}
                onChange={(e) => setFormData({ ...formData, fullDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Timing Window <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="18:00 - 21:00"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white shadow-2xs"
              />
            </div>
          </div>

          {/* Section 2: Guest Attendance & Event Catering Budget */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-slate-primary">
              Guest Attendance & Catering Budget
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-primary mb-1">
                  Number of Guests <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.expectedCount}
                    onChange={(e) => {
                      const guests = Number(e.target.value);
                      const rate = Number(formData.perPersonBudget || 0);
                      setFormData({ 
                        ...formData, 
                        expectedCount: guests,
                        overallBudget: guests * rate
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white shadow-2xs font-semibold"
                    placeholder="e.g. 15"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">Guests</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-primary mb-1">
                  Per-Guest Rate ({currency}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.perPersonBudget}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      const guests = Number(formData.expectedCount || 0);
                      setFormData({ 
                        ...formData, 
                        perPersonBudget: rate,
                        overallBudget: guests * rate
                      });
                    }}
                    className="w-full px-3.5 py-2.5 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white shadow-2xs font-semibold"
                    placeholder="e.g. 25"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">{currency}/head</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-primary mb-1">
                  Total Event Budget ({currency}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.overallBudget}
                    onChange={(e) => setFormData({ ...formData, overallBudget: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs border border-amber-300 rounded-xl focus:outline-none focus:border-brand-green bg-white shadow-2xs font-bold text-amber-900"
                    placeholder="e.g. 375"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-amber-600 pointer-events-none font-bold">{currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
            >
              {editingEventId ? 'Save Changes' : 'Confirm & Schedule Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
