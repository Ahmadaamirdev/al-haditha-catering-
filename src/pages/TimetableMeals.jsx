import React, { useState } from 'react';
import { 
  Utensils, 
  Sun, 
  Moon, 
  Clock, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Users, 
  ChefHat, 
  Tag, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

export default function TimetableMeals() {
  const { data, updateTimetableMeal, addToast } = useApp();
  const { timetable } = data;

  const [editingMeal, setEditingMeal] = useState(null);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Form state for editing or adding
  const [formMeal, setFormMeal] = useState({
    mealTime: 'Lunch',
    timeSlot: '14:00 - 15:00',
    assignedMenu: '',
    applicableTo: 'Junior, Senior',
    chefInCharge: '',
    items: '',
  });

  const handleOpenEdit = (meal) => {
    setEditingMeal(meal);
    setFormMeal({
      mealTime: meal.mealTime,
      timeSlot: meal.timeSlot,
      assignedMenu: meal.assignedMenu,
      applicableTo: meal.applicableTo,
      chefInCharge: meal.chefInCharge || '',
      items: (meal.items || []).join(', '),
    });
  };

  const handleSaveMeal = (e) => {
    e.preventDefault();
    const updated = {
      ...formMeal,
      items: formMeal.items.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (editingMeal) {
      updateTimetableMeal(editingMeal.id, updated);
      setEditingMeal(null);
    } else {
      addToast(`New meal schedule for ${formMeal.mealTime} created.`);
      setIsAddMealOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-border shadow-card">
        <div>
          <div className="flex items-center space-x-2 text-brand-blue font-semibold text-xs uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Kitchen Operations & Menus</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-primary tracking-tight mt-1">
            Timetable, Shift Schedules & Assigned Menus
          </h1>
          <p className="text-xs sm:text-sm text-slate-secondary mt-1">
            Configure meal service windows, master culinary menus, and tier eligibility.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-surface-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-primary shadow-xs transition-colors"
          >
            <ChefHat className="w-4 h-4 text-slate-secondary" />
            <span>Kitchen Staff Duty</span>
          </button>

          <button
            onClick={() => {
              setEditingMeal(null);
              setFormMeal({
                mealTime: 'Supper / Late Shift',
                timeSlot: '22:30 - 00:30',
                assignedMenu: 'Night Shift Warm Meal',
                applicableTo: 'Junior, Senior',
                chefInCharge: 'Chef Tariq Al-Balushi',
                items: 'Rice, Chicken Stew, Lentils, Fresh Bread, Tea',
              });
              setIsAddMealOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-semibold shadow-pill transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal Schedule</span>
          </button>
        </div>
      </div>

      {/* Main Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {timetable.map((meal) => {
          const isSun = meal.iconType === 'sun';
          return (
            <div 
              key={meal.id}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      meal.mealTime === 'Breakfast'
                        ? 'bg-amber-50 text-amber-500'
                        : meal.mealTime === 'Lunch'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-indigo-50 text-indigo-500'
                    }`}>
                      {isSun ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-primary">{meal.mealTime}</h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-secondary mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-muted" />
                        <span>{meal.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(meal)}
                    className="p-1.5 rounded-lg text-slate-muted hover:text-slate-primary hover:bg-slate-100 transition-colors"
                    title="Edit Schedule"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Assigned Menu Badge */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-surface-border mb-4">
                  <span className="block text-[11px] font-semibold text-brand-blue uppercase tracking-wider">
                    Assigned Master Menu
                  </span>
                  <p className="text-sm font-bold text-slate-primary mt-0.5">
                    {meal.assignedMenu}
                  </p>
                  <p className="text-xs text-slate-secondary mt-1">
                    Head Chef: <span className="font-medium text-slate-primary">{meal.chefInCharge}</span>
                  </p>
                </div>

                {/* Applicable Categories */}
                <div className="mb-4">
                  <span className="block text-[11px] font-semibold text-slate-secondary mb-1.5">
                    Authorized Employee Tiers
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.applicableTo.split(',').map((cat) => (
                      <span
                        key={cat.trim()}
                        className="px-2.5 py-0.5 rounded-md bg-brand-green-light text-brand-green font-semibold text-xs"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Menu Highlights */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-secondary mb-1.5">
                    Current Course Selections
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-primary">
                    {(meal.items || []).map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
                <span className="text-xs text-slate-secondary">Status: Active Rotation</span>
                <button
                  onClick={() => handleOpenEdit(meal)}
                  className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
                >
                  Edit Schedule & Menu
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Facilities & Mess Service Hall Operations */}
      <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card">
        <h3 className="text-base font-semibold text-slate-primary mb-1">
          Mess Halls & Dining Capacity
        </h3>
        <p className="text-xs text-slate-secondary mb-4">
          Catering centers across central base camp and desert outposts
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.facilities.map((fac) => (
            <div key={fac.id} className="p-4 rounded-xl border border-surface-border bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-primary">{fac.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green-light text-brand-green">
                  {fac.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-secondary">
                <span>Dining Capacity:</span>
                <span className="font-semibold text-slate-primary">{fac.capacity} Persons</span>
              </div>
              <div className="flex justify-between text-xs text-slate-secondary">
                <span>Mess Staff on Duty:</span>
                <span className="font-semibold text-slate-primary">{fac.activeStaff} Crew</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Edit Schedule */}
      {(editingMeal || isAddMealOpen) && (
        <Modal
          isOpen={!!editingMeal || isAddMealOpen}
          onClose={() => {
            setEditingMeal(null);
            setIsAddMealOpen(false);
          }}
          title={editingMeal ? `Edit ${editingMeal.mealTime} Schedule` : 'Add New Meal Window'}
          subtitle="Adjust timing slots, menu assignments, and category eligibility."
        >
          <form onSubmit={handleSaveMeal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-primary mb-1">Meal Title</label>
                <input
                  type="text"
                  required
                  value={formMeal.mealTime}
                  onChange={(e) => setFormMeal({ ...formMeal, mealTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-primary mb-1">Service Window (Time)</label>
                <input
                  type="text"
                  required
                  value={formMeal.timeSlot}
                  onChange={(e) => setFormMeal({ ...formMeal, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Assigned Menu Name</label>
              <input
                type="text"
                required
                value={formMeal.assignedMenu}
                onChange={(e) => setFormMeal({ ...formMeal, assignedMenu: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-primary mb-1">Authorized Categories</label>
                <input
                  type="text"
                  required
                  value={formMeal.applicableTo}
                  onChange={(e) => setFormMeal({ ...formMeal, applicableTo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-primary mb-1">Head Chef in Charge</label>
                <input
                  type="text"
                  required
                  value={formMeal.chefInCharge}
                  onChange={(e) => setFormMeal({ ...formMeal, chefInCharge: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Dishes / Course Items (comma separated)
              </label>
              <textarea
                rows={3}
                value={formMeal.items}
                onChange={(e) => setFormMeal({ ...formMeal, items: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-surface-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditingMeal(null);
                  setIsAddMealOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-secondary hover:text-slate-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover rounded-xl shadow-pill transition-all"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Kitchen Staff */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Mess Kitchen Staff & Shift Roster"
        subtitle="Active culinary crew and food safety inspectors"
      >
        <div className="space-y-3 text-xs">
          {[
            { name: 'Chef Tariq Al-Balushi', role: 'Head Executive Chef', shift: 'Morning / Breakfast' },
            { name: 'Chef Ahmed Al-Harthy', role: 'Senior Arabic Cuisine Specialist', shift: 'Afternoon / Lunch' },
            { name: 'Chef Salem Al-Maskari', role: 'Hot Buffet Specialist', shift: 'Evening / Dinner' },
            { name: 'Mona Al-Kiyumi', role: 'HACCP Food Safety Officer', shift: 'All Shifts / Quality' },
          ].map((staff) => (
            <div key={staff.name} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-surface-border">
              <div>
                <p className="font-bold text-slate-primary">{staff.name}</p>
                <p className="text-[11px] text-slate-secondary">{staff.role}</p>
              </div>
              <span className="text-[10px] font-semibold bg-sky-50 text-brand-blue px-2 py-0.5 rounded-md">
                {staff.shift}
              </span>
            </div>
          ))}

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => setIsStaffModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-green rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

