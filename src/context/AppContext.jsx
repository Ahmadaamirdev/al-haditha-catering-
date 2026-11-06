import React, { createContext, useContext, useState } from 'react';
import { initialMockData } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(initialMockData);
  const [currency, setCurrency] = useState('SAR'); // Default matching reference screenshot, toggleable to OMR
  const [toasts, setToasts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast notification helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Finance updates
  const updateCategoryBudget = (categoryKey, newRate) => {
    setData((prev) => ({
      ...prev,
      financeOverview: {
        ...prev.financeOverview,
        categoryRates: {
          ...prev.financeOverview.categoryRates,
          [categoryKey]: {
            ...prev.financeOverview.categoryRates[categoryKey],
            rate: Number(newRate),
          },
        },
      },
    }));
    addToast(`Updated ${categoryKey.toUpperCase()} meal rate to ${newRate} ${currency}/person.`);
  };

  const addExtraBudget = (amount, category, note) => {
    setData((prev) => {
      const added = Number(amount);
      const newStatus = prev.financeOverview.budgetStatus.map((item) => {
        if (item.category.toLowerCase() === category.toLowerCase()) {
          return { ...item, remaining: item.remaining + added };
        }
        return item;
      });
      return {
        ...prev,
        financeOverview: {
          ...prev.financeOverview,
          monthlyTotalBudget: prev.financeOverview.monthlyTotalBudget + added,
          monthlyRemaining: prev.financeOverview.monthlyRemaining + added,
          budgetStatus: newStatus,
        },
      };
    });
    addToast(`Added ${amount} ${currency} budget allocation for ${category}.`);
  };

  // Events updates
  const addEvent = (newEvent) => {
    const id = `EVT-${Date.now().toString().slice(-4)}`;
    const eventObj = {
      id,
      ...newEvent,
      perPersonBudget: Number(newEvent.perPersonBudget),
      overallBudget: Number(newEvent.expectedCount) * Number(newEvent.perPersonBudget),
      status: 'Confirmed',
      statusType: 'success',
    };
    setData((prev) => ({
      ...prev,
      events: [eventObj, ...prev.events],
    }));
    addToast(`Event "${newEvent.title}" scheduled successfully.`);
  };

  const updateEvent = (eventId, updatedFields) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.map((evt) =>
        evt.id === eventId
          ? {
              ...evt,
              ...updatedFields,
              overallBudget: Number(updatedFields.expectedCount || evt.expectedCount) *
                Number(updatedFields.perPersonBudget || evt.perPersonBudget),
            }
          : evt
      ),
    }));
    addToast('Event details updated.');
  };

  const deleteEvent = (eventId) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((evt) => evt.id !== eventId),
    }));
    addToast('Event removed.', 'info');
  };

  // Timetable updates
  const updateTimetableMeal = (mealId, updatedMeal) => {
    setData((prev) => ({
      ...prev,
      timetable: prev.timetable.map((item) =>
        item.id === mealId ? { ...item, ...updatedMeal } : item
      ),
    }));
    addToast(`Updated schedule for ${updatedMeal.mealTime || 'meal'}.`);
  };

  // Allocation updates
  const generateMonthlyAllocation = (month, days) => {
    const workingDays = Number(days) || 22;
    setData((prev) => ({
      ...prev,
      selectedMonth: month,
      mealAllocation: {
        ...prev.mealAllocation,
        workingDays,
        categories: prev.mealAllocation.categories.map((c) => {
          if (c.category === 'Junior') {
            const monthlyCredits = c.totalEmployees * workingDays * 3;
            return {
              ...c,
              monthlyCredits,
              remainingCredits: monthlyCredits - c.consumedCredits,
            };
          }
          if (c.category === 'Senior') {
            const monthlyCredits = c.totalEmployees * workingDays * 3;
            return {
              ...c,
              monthlyCredits,
              remainingCredits: monthlyCredits - c.consumedCredits,
            };
          }
          return c;
        }),
      },
    }));
    addToast(`Monthly meal allocation generated for ${month} (${workingDays} working days).`);
  };

  // Log waste adjustment
  const logWasteRecord = (record) => {
    const newRecord = {
      id: `WST-${Date.now().toString().slice(-3)}`,
      ...record,
      status: record.wasted > 50 ? 'Review' : 'Optimal',
    };
    setData((prev) => ({
      ...prev,
      wastageOverview: {
        ...prev.wastageOverview,
        records: [newRecord, ...prev.wastageOverview.records],
        wastedMeals: prev.wastageOverview.wastedMeals + Number(record.wasted || 0),
        consumedMeals: prev.wastageOverview.consumedMeals + Number(record.consumed || 0),
      },
    }));
    addToast('Meal consumption log submitted.');
  };

  return (
    <AppContext.Provider
      value={{
        data,
        currency,
        setCurrency,
        toasts,
        addToast,
        removeToast,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        updateCategoryBudget,
        addExtraBudget,
        addEvent,
        updateEvent,
        deleteEvent,
        updateTimetableMeal,
        generateMonthlyAllocation,
        logWasteRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

