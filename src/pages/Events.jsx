import React, { useState, useMemo } from 'react';
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

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'calendar'
  const [expandedRosters, setExpandedRosters] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Modal Filter & Employee Selection State
  const [modalCategory, setModalCategory] = useState('All');
  const [empSearch, setEmpSearch] = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    fullDate: '2025-11-20',
    time: '18:00 - 21:00',
    description: '',
    invitedCount: 0,
    expectedCount: 0,
    perPersonBudget: 20,
    menuChanged: false,
    menuDetails: 'Special VIP Buffet: Lamb Ouzi, Kingfish Steaks, Seafood Saffron Rice, Royal Salad Bar, Premium Arabic Sweets and Mocktails.',
    category: 'VIP',
    location: 'Main Camp Mess Hall',
  });

  // Calculate employee category counts for quick pills
  const categoryCounts = useMemo(() => {
    return {
      All: allEmployees.length,
      VIP: allEmployees.filter((e) => e.category === 'VIP').length,
      Senior: allEmployees.filter((e) => e.category === 'Senior').length,
      Junior: allEmployees.filter((e) => e.category === 'Junior').length,
    };
  }, [allEmployees]);

  const handleOpenAdd = () => {
    setEditingEventId(null);
    setModalCategory('VIP');
    setEmpSearch('');
    setSelectedEmpIds([]);
    setFormData({
      title: '',
      fullDate: '2025-11-20',
      time: '18:00 - 21:00',
      description: '',
      invitedCount: 0,
      expectedCount: 0,
      perPersonBudget: 20,
      menuChanged: false,
      menuDetails: 'Buffet with Grilled Meats, Rice, Fresh Salads, Traditional Sweets and Beverages.',
      category: 'VIP',
      location: 'Main Camp Mess Hall',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEventId(evt.id);
    const existingIds = (evt.invitedEmployees && evt.invitedEmployees.map((e) => e.id)) || evt.invitedEmployeeIds || [];
    setSelectedEmpIds(existingIds);
    setModalCategory(evt.category && ['VIP', 'Senior', 'Junior'].includes(evt.category) ? evt.category : 'All');
    setEmpSearch('');
    setFormData({
      title: evt.title || '',
      fullDate: evt.fullDate || `2025-11-${evt.day}`,
      time: evt.time || '18:00 - 21:00',
      description: evt.description || '',
      invitedCount: evt.invitedCount || existingIds.length || 0,
      expectedCount: evt.expectedCount || existingIds.length || 0,
      perPersonBudget: evt.perPersonBudget || 20,
      menuChanged: evt.menuChanged || false,
      menuDetails: evt.menuDetails || '',
      category: evt.category || 'VIP',
      location: evt.location || 'Main Camp Mess Hall',
    });
    setIsModalOpen(true);
  };

  const handleCategorySelect = (cat) => {
    setModalCategory(cat);
    const catLabel = cat === 'All' ? 'All Staff' : cat;
    let rate = formData.perPersonBudget;
    if (cat === 'VIP') rate = 20;
    else if (cat === 'Senior') rate = 10;
    else if (cat === 'Junior') rate = 5;

    setFormData((prev) => ({
      ...prev,
      category: catLabel,
      perPersonBudget: rate,
    }));
  };

  // Filter employees for the modal picker
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((emp) => {
      const matchCat = modalCategory === 'All' || emp.category === modalCategory;
      if (!matchCat) return false;
      if (!empSearch.trim()) return true;
      const q = empSearch.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        (emp.designation && emp.designation.toLowerCase().includes(q)) ||
        (emp.department && emp.department.toLowerCase().includes(q))
      );
    });
  }, [allEmployees, modalCategory, empSearch]);

  const toggleEmployee = (empId) => {
    setSelectedEmpIds((prev) => {
      const next = prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId];
      setFormData((f) => ({
        ...f,
        invitedCount: next.length,
        expectedCount: next.length,
      }));
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredEmployees.map((e) => e.id);
    setSelectedEmpIds((prev) => {
      const set = new Set([...prev, ...filteredIds]);
      const next = Array.from(set);
      setFormData((f) => ({
        ...f,
        invitedCount: next.length,
        expectedCount: next.length,
      }));
      return next;
    });
  };

  const handleClearSelected = () => {
    setSelectedEmpIds([]);
    setFormData((f) => ({
      ...f,
      invitedCount: 0,
      expectedCount: 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateObj = new Date(formData.fullDate);
    const day = isNaN(dateObj.getDate()) ? '20' : dateObj.getDate().toString();
    const month = isNaN(dateObj.getTime()) ? 'Nov' : dateObj.toLocaleString('default', { month: 'short' });

    const invitedEmployees = allEmployees
      .filter((emp) => selectedEmpIds.includes(emp.id))
      .map((emp) => ({
        id: emp.id,
        name: emp.name,
        category: emp.category,
        designation: emp.designation,
        department: emp.department,
      }));

    const headcount = Number(formData.expectedCount || selectedEmpIds.length || formData.invitedCount || 1);
    const rate = Number(formData.perPersonBudget || 0);
    const overallBudget = headcount * rate;

    const payload = {
      ...formData,
      day,
      month,
      invitedCount: Number(formData.invitedCount || selectedEmpIds.length || headcount),
      expectedCount: headcount,
      perPersonBudget: rate,
      overallBudget,
      invitedEmployees,
      invitedEmployeeIds: selectedEmpIds,
      category: formData.category || (modalCategory === 'All' ? 'All Staff' : modalCategory),
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
                          {evt.expectedCount} Expected &nbsp;|&nbsp; {evt.invitedCount || evt.expectedCount} Invited
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-secondary">
                          <Wallet className="w-3.5 h-3.5 text-slate-muted" />
                          <span>Dedicated Budget:</span>
                        </span>
                        <span className="font-bold text-slate-primary">
                          {(evt.overallBudget || 0).toLocaleString()} {currency}{' '}
                          <span className="font-normal text-slate-muted">({evt.perPersonBudget} {currency}/head)</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-secondary">Target Tier:</span>
                        <span className="font-semibold text-brand-blue">{evt.category}</span>
                      </div>
                    </div>

                    {/* Invited Staff Preview */}
                    {invitedList.length > 0 && (
                      <div className="mb-4 bg-white border border-surface-border rounded-xl p-3 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-primary text-[11px] flex items-center space-x-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-brand-green" />
                            <span>Invited Personnel ({invitedList.length})</span>
                          </span>
                          {invitedList.length > 4 && (
                            <button
                              type="button"
                              onClick={() => setExpandedRosters((prev) => ({ ...prev, [evt.id]: !prev[evt.id] }))}
                              className="text-[10px] font-semibold text-brand-blue hover:underline"
                            >
                              {isRosterExpanded ? 'Collapse' : `View All (${invitedList.length})`}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(isRosterExpanded ? invitedList : invitedList.slice(0, 4)).map((emp) => (
                            <span
                              key={emp.id}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px]"
                            >
                              <span className="font-medium">{emp.name}</span>
                              <span className="text-[9px] text-slate-400">({emp.category})</span>
                            </span>
                          ))}
                          {!isRosterExpanded && invitedList.length > 4 && (
                            <span
                              onClick={() => setExpandedRosters((prev) => ({ ...prev, [evt.id]: true }))}
                              className="px-2 py-0.5 rounded-lg bg-brand-green-light text-brand-green text-[11px] font-semibold cursor-pointer hover:bg-brand-green/20"
                            >
                              +{invitedList.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

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

          {/* Section 2: Target Category & Employee Selector */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-surface-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-primary">
                  Select Category & Invite Employees
                </label>
                <p className="text-[11px] text-slate-secondary">
                  Choose a category to filter staff, then check off the employees you want to invite.
                </p>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-green-light text-brand-green border border-brand-green/20 self-start sm:self-auto">
                {selectedEmpIds.length} Staff Selected
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'All', label: 'All Staff', count: categoryCounts.All },
                { key: 'VIP', label: 'VIP Category', count: categoryCounts.VIP },
                { key: 'Senior', label: 'Senior Staff', count: categoryCounts.Senior },
                { key: 'Junior', label: 'Junior Staff', count: categoryCounts.Junior },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => handleCategorySelect(c.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    modalCategory === c.key
                      ? 'bg-brand-green text-white shadow-pill'
                      : 'bg-white border border-surface-border text-slate-secondary hover:text-slate-primary'
                  }`}
                >
                  {c.label} ({c.count})
                </button>
              ))}
            </div>

            {/* Search Bar & Quick Multi-Select Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search staff by name, ID, or job title..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-white border border-surface-border hover:bg-slate-100 text-slate-primary transition-colors"
                >
                  Invite All ({filteredEmployees.length})
                </button>
                {selectedEmpIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Employee Checklist */}
            <div className="max-h-48 overflow-y-auto rounded-xl border border-surface-border bg-white divide-y divide-slate-100 shadow-2xs">
              {filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-muted">
                  No employees matched this filter.
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isChecked = selectedEmpIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-brand-green-light/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-brand-green focus:ring-brand-green cursor-pointer"
                        />
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-primary truncate">
                              {emp.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {emp.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-secondary truncate block">
                            {emp.designation} &bull; {emp.department}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          emp.category === 'VIP'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : emp.category === 'Senior'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {emp.category}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 3: Headcount & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Attendees / Expected RSVP
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.expectedCount}
                onChange={(e) => setFormData({ ...formData, expectedCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white"
              />
              <span className="text-[10px] text-slate-muted mt-0.5 block">
                {selectedEmpIds.length > 0 ? `Auto-synced from ${selectedEmpIds.length} invited staff` : 'Manually enter expected attendance'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Per-Head Rate ({currency})
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.perPersonBudget}
                onChange={(e) => setFormData({ ...formData, perPersonBudget: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green bg-white"
              />
              <span className="text-[10px] text-slate-muted mt-0.5 block">
                Standard: VIP 20 {currency}, Senior 10 {currency}, Junior 5 {currency}
              </span>
            </div>
          </div>

          {/* Calculated Total Budget Highlight */}
          <div className="p-3.5 bg-brand-green-light border border-brand-green/20 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-primary block">Calculated Total Event Budget</span>
              <span className="text-[11px] text-slate-secondary">
                {Number(formData.expectedCount || 0)} attendees &times; {Number(formData.perPersonBudget || 0)} {currency}/head
              </span>
            </div>
            <span className="font-extrabold text-brand-green text-base">
              {(Number(formData.expectedCount || 0) * Number(formData.perPersonBudget || 0)).toLocaleString()} {currency}
            </span>
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
