import React, { useState } from 'react';
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
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  AlertCircle,
  MenuSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

export default function Events() {
  const { data, currency, addEvent, updateEvent, deleteEvent, addToast } = useApp();
  const { events } = data;

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'calendar'
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(10); // Nov (0-indexed 10)
  const [selectedYear, setSelectedYear] = useState(2025);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    fullDate: '2025-11-20',
    time: '18:00 - 21:00',
    description: '',
    invitedCount: 150,
    expectedCount: 130,
    perPersonBudget: 20,
    menuChanged: true,
    menuDetails: 'Buffet with Grilled Meats, Rice, Salads, Desserts and Beverages.',
    category: 'VIP, Senior Management',
    location: 'Main Camp Mess Hall',
  });

  const handleOpenAdd = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      fullDate: '2025-11-20',
      time: '18:00 - 21:00',
      description: '',
      invitedCount: 150,
      expectedCount: 130,
      perPersonBudget: 20,
      menuChanged: true,
      menuDetails: 'Buffet with Grilled Meats, Rice, Salads, Desserts and Beverages.',
      category: 'VIP, Senior Management',
      location: 'Main Camp Mess Hall',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      fullDate: evt.fullDate || `2025-11-${evt.day}`,
      time: evt.time || '18:00 - 21:00',
      description: evt.description || '',
      invitedCount: evt.invitedCount,
      expectedCount: evt.expectedCount,
      perPersonBudget: evt.perPersonBudget,
      menuChanged: evt.menuChanged || false,
      menuDetails: evt.menuDetails || '',
      category: evt.category || 'VIP',
      location: evt.location || 'Central Camp Mess',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateObj = new Date(formData.fullDate);
    const day = dateObj.getDate().toString();
    const month = dateObj.toLocaleString('default', { month: 'short' });

    if (editingEventId) {
      updateEvent(editingEventId, {
        ...formData,
        day,
        month,
      });
    } else {
      addEvent({
        ...formData,
        day,
        month,
      });
    }
    setIsModalOpen(false);
  };

  // Calendar generation for November 2025
  const calendarDays = [];
  const daysInMonth = 30;
  // Nov 1 2025 was a Saturday
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
            Coordinate company celebrations, custom dining menus, and executive RSVP budgets.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
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
                      <span>Headcount Entitlement:</span>
                    </span>
                    <span className="font-semibold text-slate-primary">
                      {evt.invitedCount} Invited &nbsp;|&nbsp; {evt.expectedCount} Expected
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-secondary">
                      <Wallet className="w-3.5 h-3.5 text-slate-muted" />
                      <span>Dedicated Budget:</span>
                    </span>
                    <span className="font-bold text-slate-primary">
                      {evt.overallBudget.toLocaleString()} {currency}{' '}
                      <span className="font-normal text-slate-muted">({evt.perPersonBudget} {currency}/head)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-secondary">Target Tier:</span>
                    <span className="font-semibold text-brand-blue">{evt.category}</span>
                  </div>
                </div>

                {/* Event Description & Menu */}
                <p className="text-xs text-slate-secondary mb-3">
                  {evt.description}
                </p>

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
          ))}
        </div>
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

      {/* Modal: Add / Edit Event */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEventId ? 'Edit Event Details' : 'Create Special Banquet / Event'}
        subtitle="Specify invited headcount, catering budget, and custom menu requirements."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Gathering or VIP Board Luncheon"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Event Date</label>
              <input
                type="date"
                required
                value={formData.fullDate}
                onChange={(e) => setFormData({ ...formData, fullDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Timing Window</label>
              <input
                type="text"
                required
                placeholder="18:30 - 22:30"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Venue / Facility</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Target Personnel Tier</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Invited Count</label>
              <input
                type="number"
                min="1"
                required
                value={formData.invitedCount}
                onChange={(e) => setFormData({ ...formData, invitedCount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Expected RSVP</label>
              <input
                type="number"
                min="1"
                required
                value={formData.expectedCount}
                onChange={(e) => setFormData({ ...formData, expectedCount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Per-Head ({currency})</label>
              <input
                type="number"
                min="1"
                required
                value={formData.perPersonBudget}
                onChange={(e) => setFormData({ ...formData, perPersonBudget: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          <div className="p-3 bg-brand-green-light/40 border border-brand-green/20 rounded-xl flex justify-between items-center text-xs">
            <span className="font-medium text-slate-primary">Calculated Overall Budget:</span>
            <span className="font-bold text-brand-green text-sm">
              {(Number(formData.expectedCount) * Number(formData.perPersonBudget)).toLocaleString()} {currency}
            </span>
          </div>

          {/* Menu Change Toggle */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="menuChange"
              checked={formData.menuChanged}
              onChange={(e) => setFormData({ ...formData, menuChanged: e.target.checked })}
              className="rounded text-brand-green focus:ring-brand-green"
            />
            <label htmlFor="menuChange" className="text-xs font-semibold text-slate-primary cursor-pointer">
              Custom / Special Menu Required (Overrides Standard Mess Menu)
            </label>
          </div>

          {formData.menuChanged && (
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Event-Specific Menu Details
              </label>
              <textarea
                rows={2}
                required
                value={formData.menuDetails}
                onChange={(e) => setFormData({ ...formData, menuDetails: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
                placeholder="List customized dishes, appetizers, desserts..."
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              placeholder="Internal event objective..."
            />
          </div>

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
              {editingEventId ? 'Save Changes' : 'Confirm Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

