import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CalendarDays, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Wallet, 
  MapPin, 
  Edit2, 
  Trash2, 
  Search,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

export default function Events() {
  const { data, currency, addEvent, updateEvent, deleteEvent, addToast } = useApp();
  const events = data.events || [];
  const allEmployees = data.employees || [];

  const location = useLocation();
  const highlightId = location.state?.highlightEventId;

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'calendar'
  const [expandedRosters, setExpandedRosters] = useState({});

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
    fullDate: '2026-11-20',
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
    setFormData({
      title: '',
      fullDate: '2026-11-20',
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
    setFormData({
      title: evt.title || '',
      fullDate: evt.fullDate || `2026-11-${evt.day || '20'}`,
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
    const dateObj = new Date(formData.fullDate);
    const day = isNaN(dateObj.getDate()) ? '20' : dateObj.getDate().toString();
    const month = isNaN(dateObj.getTime()) ? 'Nov' : dateObj.toLocaleString('default', { month: 'short' });

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

  // Calendar generation for November 2025
  const calendarDays = [];
  const daysInMonth = 30;
  for (let i = 1; i <= daysInMonth; i++) {
    const hasEvent = events.find((ev) => Number(ev.day) === i);
    calendarDays.push({ day: i, event: hasEvent });
  }

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
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Coordinate company celebrations, select employee categories, and invite specific staff members.
          </p>
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

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-surface-border pb-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'upcoming'
              ? 'bg-brand-green text-white shadow-pill'
              : 'text-slate-secondary hover:text-slate-primary hover:bg-white'
          }`}
        >
          Upcoming Events ({events.length})
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

        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'past'
              ? 'bg-brand-green text-white shadow-pill'
              : 'text-slate-secondary hover:text-slate-primary hover:bg-white'
          }`}
        >
          Past Events Archive
        </button>
      </div>

      {/* View: Upcoming Events */}
      {activeTab === 'upcoming' && (
        events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-surface-border shadow-card text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-green-light border border-brand-green/20 flex items-center justify-center text-brand-green mx-auto mb-4 shadow-xs">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-primary">No Upcoming Events Scheduled</h3>
            <p className="text-xs sm:text-sm text-slate-secondary max-w-md mx-auto mt-1 mb-5">
              Schedule your first corporate banquet, VIP dining, or celebration. You can select target employee categories and invite specific staff members.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Your First Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((evt) => {
              const invitedList = evt.invitedEmployees || [];
              const isRosterExpanded = !!expandedRosters[evt.id];
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
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              evt.menuChanged ? 'bg-amber-100 text-amber-800' : 'bg-brand-green-light text-brand-green'
                            }`}>
                              {evt.menuChanged ? 'Menu Updated' : 'Standard Menu'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-secondary mt-1">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-muted" />
                              <span>{evt.time}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-muted" />
                              <span>{evt.location}</span>
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

                      <div className="flex items-center justify-between">
                        <span className="text-slate-secondary">Venue:</span>
                        <span className="font-semibold text-slate-primary">{evt.location}</span>
                      </div>
                    </div>

                    {/* Event Description & Menu */}
                    {evt.description && (
                      <p className="text-xs text-slate-secondary mb-3">
                        {evt.description}
                      </p>
                    )}

                    {evt.menuDetails && (
                      <div className="bg-brand-green-light/40 border border-brand-green/20 rounded-xl p-3 text-xs">
                        <span className="block font-semibold text-brand-green text-[11px] uppercase tracking-wider mb-0.5">
                          Chef's Special Course Detail
                        </span>
                        <p className="text-slate-primary text-[11px] leading-relaxed">
                          {evt.menuDetails}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-surface-border flex justify-between items-center text-xs">
                    <span className="text-slate-muted text-[11px]">ID: {evt.id}</span>
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="font-semibold text-brand-blue hover:text-brand-blue-dark text-xs"
                    >
                      Edit Event & Menu Specifications
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-slate-primary">
              Catering Schedule Calendar — November 2025
            </h3>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-xs text-slate-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
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

            {/* Empty slots for starting day */}
            <div className="h-24 p-1.5 rounded-xl bg-slate-50/40 text-slate-300"></div>
            <div className="h-24 p-1.5 rounded-xl bg-slate-50/40 text-slate-300"></div>
            <div className="h-24 p-1.5 rounded-xl bg-slate-50/40 text-slate-300"></div>
            <div className="h-24 p-1.5 rounded-xl bg-slate-50/40 text-slate-300"></div>
            <div className="h-24 p-1.5 rounded-xl bg-slate-50/40 text-slate-300"></div>
            <div className="h-24 p-1.5 rounded-xl bg-slate-50/40 text-slate-300"></div>

            {calendarDays.map((slot) => {
              const isWeekend = slot.day % 7 === 0 || (slot.day + 1) % 7 === 0;
              return (
                <div
                  key={slot.day}
                  className={`h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    slot.event
                      ? 'border-brand-green bg-brand-green-light/30'
                      : isWeekend
                      ? 'border-surface-border/50 bg-slate-50/40'
                      : 'border-surface-border bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${slot.event ? 'text-brand-green' : 'text-slate-primary'}`}>
                      {slot.day}
                    </span>
                    {isWeekend && (
                      <span className="text-[9px] text-slate-400 font-medium">Off</span>
                    )}
                  </div>

                  {slot.event && (
                    <div 
                      onClick={() => handleOpenEdit(slot.event)}
                      className="cursor-pointer bg-brand-green text-white p-1 rounded-md text-[10px] font-semibold truncate hover:opacity-90"
                    >
                      {slot.event.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Past Events */}
      {activeTab === 'past' && (
        <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-card text-center py-12">
          <CalendarDays className="w-12 h-12 text-slate-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-primary">Historical Event Records</h3>
          <p className="text-xs text-slate-secondary max-w-md mx-auto mt-1">
            Previous quarterly celebrations and VIP guest events are securely archived for audit compliance.
          </p>
          <button
            onClick={() => addToast('Loaded Q3 historical event records.')}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-primary text-xs font-semibold rounded-xl transition-colors"
          >
            Load 2025 Archive Records
          </button>
        </div>
      )}

      {/* Modal: Add / Edit Event (Simplified with Category & Employee Selector) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
        title={editingEventId ? 'Edit Event Details' : 'Create Special Banquet / Event'}
        subtitle="Configure event details, select category, invite employees, and calculate catering budget."
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Venue / Facility <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-1.5">
                {['Main Camp Mess Hall', 'Executive VIP Dining Suite', 'Desert Substation Mess B'].map((venue) => (
                  <button
                    key={venue}
                    type="button"
                    onClick={() => setFormData({ ...formData, location: venue })}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-medium border text-left transition-colors ${
                      formData.location === venue
                        ? 'border-brand-green bg-brand-green-light text-brand-green font-semibold'
                        : 'border-surface-border bg-slate-50 hover:bg-white text-slate-primary'
                    }`}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Guest Attendance & Event Catering Budget */}
          <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-surface-border space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-primary">
                Guest Attendance & Catering Budget
              </label>
              <p className="text-[11px] text-slate-secondary">
                Enter the number of guests attending and specify the per-guest rate or total event catering budget.
              </p>
            </div>

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

            {/* Calculated Highlight Card */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-amber-700" />
                <span className="text-amber-900 font-semibold">
                  Scheduled Event Budget: <strong>{Number(formData.overallBudget || 0).toLocaleString()} {currency}</strong>
                </span>
              </div>
              <span className="text-[11px] text-amber-800 font-medium">
                {Number(formData.expectedCount || 0)} Guests &bull; {Number(formData.perPersonBudget || 0)} {currency} avg
              </span>
            </div>
          </div>

          {/* Section 4: Optional Menu Details & Notes */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="menuChange"
                checked={formData.menuChanged}
                onChange={(e) => setFormData({ ...formData, menuChanged: e.target.checked })}
                className="w-4 h-4 rounded text-brand-green focus:ring-brand-green cursor-pointer"
              />
              <label htmlFor="menuChange" className="text-xs font-semibold text-slate-primary cursor-pointer">
                Special / Custom Banquet Menu (Overrides Standard Daily Mess)
              </label>
            </div>

            {formData.menuChanged && (
              <div>
                <textarea
                  rows={2}
                  placeholder="e.g. VIP Buffet with Omani Shuwa, Grilled Kingfish, Fresh Salads, and Arabic Halwa..."
                  value={formData.menuDetails}
                  onChange={(e) => setFormData({ ...formData, menuDetails: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Internal Event Notes (Optional)
              </label>
              <textarea
                rows={1}
                placeholder="Special instructions, VIP guests, or event objectives..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white"
              />
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
