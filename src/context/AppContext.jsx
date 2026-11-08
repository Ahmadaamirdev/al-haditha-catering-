import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialMockData } from '../data/mockData';
import { alHadithaEmployees, matchEmployeeByIdAndName } from '../data/employeesData';
import { getEmployeeRealtimeAllocations, calculateMonthCalendar, MEAL_WINDOWS, isEntryInMonthOrDate } from '../utils/allocationEngine';
import { computeCategoryFinance } from '../utils/financeEngine';
import { harmonizeStateMetrics, defaultNovemberEvents, defaultAlHadithaEvents, defaultAlHadithaEvent } from '../utils/harmonizeEngine';

const AppContext = createContext(null);
const STORAGE_KEY = 'alhaditha_mess_clean_v3';

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.employees) {
          parsed.employees = parsed.employees.filter((e) => e.category !== 'VIP');
        }
        if (parsed.mealEntries) {
          parsed.mealEntries = parsed.mealEntries.filter((e) => (e.category || '').toUpperCase() !== 'VIP');
        }
        // Ensure comprehensive 2-week baseline entries are present
        const existingIds = new Set((parsed.mealEntries || []).map((e) => e.id));
        const mergedEntries = [...(parsed.mealEntries || [])];
        (initialMockData.mealEntries || []).forEach((entry) => {
          if (!existingIds.has(entry.id)) {
            mergedEntries.push(entry);
          }
        });
        parsed.mealEntries = mergedEntries;

        // Ensure restored original November events are present, purging any non-November test events
        const cleanSavedEvents = (parsed.events || []).filter((e) => e.id !== 'EVT-1000' && e.id !== 'EVT-1002');
        const existingEvtIds = new Set(cleanSavedEvents.map((e) => e.id));
        const mergedEvents = [...cleanSavedEvents];
        defaultNovemberEvents.forEach((ev) => {
          if (!existingEvtIds.has(ev.id)) {
            mergedEvents.push(ev);
          }
        });
        parsed.events = mergedEvents;

        return harmonizeStateMetrics(parsed);
      }
    } catch {
      // Ignore parse errors, fallback to initial
    }
    return harmonizeStateMetrics({
      ...initialMockData,
      employees: alHadithaEmployees,
      events: defaultNovemberEvents,
    });
  });

  const [currency, setCurrency] = useState('OMR'); // Strictly OMR (Omani Rial)
  const [toasts, setToasts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMongoConnected, setIsMongoConnected] = useState(false);
  const isInitialLoaded = useRef(false);

  // Initial load from MongoDB Atlas & merge with local pending state
  useEffect(() => {
    let isMounted = true;
    async function fetchFromMongo() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const mongoData = await res.json();
          if (mongoData && mongoData.employees && isMounted) {
            setIsMongoConnected(true);

            // Merge entries & events from both MongoDB and localStorage
            const localSaved = localStorage.getItem(STORAGE_KEY);
            let mergedData = { ...mongoData };
            if (mergedData.employees) {
              mergedData.employees = mergedData.employees.filter((e) => e.category !== 'VIP');
              if (mergedData.employees.length === 0) mergedData.employees = alHadithaEmployees;
            }

            if (localSaved) {
              try {
                const localData = JSON.parse(localSaved);
                
                // Preserve local selectedMonth and mealAllocation if user selected or changed them locally
                if (localData.selectedMonth) {
                  mergedData.selectedMonth = localData.selectedMonth;
                }
                if (localData.mealAllocation) {
                  mergedData.mealAllocation = {
                    ...mergedData.mealAllocation,
                    ...localData.mealAllocation,
                  };
                }

                // 1. Merge Meal Entries (strictly excluding any VIP test entries)
                const localEntries = (localData.mealEntries || []).filter(
                  (e) => (e.category || '').toUpperCase() !== 'VIP'
                );
                const mongoEntries = (mongoData.mealEntries || []).filter(
                  (e) => (e.category || '').toUpperCase() !== 'VIP'
                );
                const entryMap = new Map();
                [...(initialMockData.mealEntries || []), ...localEntries, ...mongoEntries].forEach((e) => {
                  if (e && e.id && (e.category || '').toUpperCase() !== 'VIP') entryMap.set(e.id, e);
                });
                mergedData.mealEntries = Array.from(entryMap.values());

                // 2. Merge Events
                const localEvents = localData.events || [];
                const mongoEvents = mongoData.events || [];
                const eventMap = new Map();
                [...localEvents, ...mongoEvents].forEach((evt) => {
                  if (evt && evt.id) eventMap.set(evt.id, evt);
                });
                const combinedEvents = Array.from(eventMap.values());
                mergedData.events = combinedEvents.length > 0 ? combinedEvents : [defaultAlHadithaEvent];
              } catch {
                // Ignore parse errors
              }
            } else if (!mergedData.events || mergedData.events.length === 0) {
              mergedData.events = [defaultAlHadithaEvent];
            }

            // Harmonize all metrics (Employee Overview eating counts, Wastage consumed, Finance)
            const harmonized = harmonizeStateMetrics(mergedData);

            // Update state & mark initial load as completed
            setData(harmonized);
            isInitialLoaded.current = true;
          }
        }
      } catch (err) {
        console.warn('MongoDB connection offline, using cached data:', err.message);
        isInitialLoaded.current = true;
      }
    }

    fetchFromMongo();

    // Auto-sync poll every 6 seconds and on window focus
    const interval = setInterval(fetchFromMongo, 6000);
    window.addEventListener('focus', fetchFromMongo);

    return () => { 
      isMounted = false; 
      clearInterval(interval);
      window.removeEventListener('focus', fetchFromMongo);
    };
  }, []);

  // Sync to local storage & MongoDB Atlas in real-time (Guarded by isInitialLoaded)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage quota or private mode fallback
    }

    // Never sync to backend before the initial load from MongoDB has completed!
    if (!isInitialLoaded.current) return;

    const timer = setTimeout(() => {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then((res) => {
          if (res.ok) setIsMongoConnected(true);
        })
        .catch((err) => {
          console.warn('MongoDB sync offline/pending:', err.message);
          setIsMongoConnected(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [data]);

  // Cross-tab real-time sync: when an entry is recorded in Entry Panel in another tab, update immediately
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData(parsed);
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    const headcount = Number(newEvent.expectedCount ?? newEvent.invitedCount ?? 1);
    const rate = Number(newEvent.perPersonBudget ?? 0);
    const calculatedBudget = newEvent.overallBudget ? Number(newEvent.overallBudget) : (headcount * rate);

    const eventObj = {
      id,
      ...newEvent,
      expectedCount: headcount,
      invitedCount: Number(newEvent.invitedCount ?? headcount),
      perPersonBudget: rate,
      overallBudget: calculatedBudget,
      status: newEvent.status || 'Confirmed',
      statusType: newEvent.statusType || 'success',
      invitedEmployees: newEvent.invitedEmployees || [],
    };
    setData((prev) => ({
      ...prev,
      events: [eventObj, ...(prev.events || [])],
    }));
    addToast(`Event "${newEvent.title}" scheduled successfully.`);
  };

  const updateEvent = (eventId, updatedFields) => {
    setData((prev) => ({
      ...prev,
      events: (prev.events || []).map((evt) =>
        evt.id === eventId
          ? {
              ...evt,
              ...updatedFields,
              overallBudget: Number(updatedFields.expectedCount ?? evt.expectedCount) *
                Number(updatedFields.perPersonBudget ?? evt.perPersonBudget),
            }
          : evt
      ),
    }));
    addToast('Event details updated.');
  };

  const deleteEvent = (eventId) => {
    setData((prev) => ({
      ...prev,
      events: (prev.events || []).filter((evt) => evt.id !== eventId),
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

  // Allocation updates with dynamic filtering by selected month & year
  const generateMonthlyAllocation = (month, days, silent = false) => {
    const workingDays = Number(days) || 22;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const parts = String(month).split(' ');
    const mName = parts[0];
    const yr = parseInt(parts[1], 10) || 2026;
    const mIdx = monthNames.indexOf(mName) >= 0 ? monthNames.indexOf(mName) : 10;

    setData((prev) => {
      // Filter meal entries specifically for this target month and year
      const monthEntries = (prev.mealEntries || []).filter((entry) =>
        isEntryInMonthOrDate(entry, yr, mIdx)
      );

      const updatedCategories = (prev.mealAllocation?.categories || []).map((c) => {
        const totalEmp = c.totalEmployees || (c.category === 'VIP' ? 20 : 40);
        const monthlyCredits = totalEmp * workingDays * 3;

        // Calculate consumed credits specifically from filtered monthEntries
        const catConsumed = monthEntries.filter((entry) => {
          const entryCat = (entry.category || prev.employees?.find((e) => e.id === entry.employeeId)?.category || '').toLowerCase();
          return entryCat === c.category.toLowerCase();
        }).length;

        return {
          ...c,
          monthlyCredits,
          consumedCredits: catConsumed,
          remainingCredits: Math.max(0, monthlyCredits - catConsumed),
        };
      });

      const updated = {
        ...prev,
        selectedMonth: month,
        mealAllocation: {
          ...prev.mealAllocation,
          workingDays,
          categories: updatedCategories,
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      // Immediately sync to MongoDB Atlas so Vercel and all clients stay synced
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((err) => console.warn('Sync failed:', err));

      return updated;
    });

    if (!silent) {
      addToast(`Allocations synced for ${month} (${workingDays} working days).`);
    }
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

  // Verification helper against 100 Al-Haditha Employees
  const verifyEmployeeMatch = (idInput, nameInput) => {
    return matchEmployeeByIdAndName(idInput, nameInput);
  };

  // Real-time Meal Entry Recording (Updates Entry Panel, Dashboard, Quotas, Finance)
  const recordMealEntry = ({ 
    employeeId, 
    employeeName, 
    mealType = 'Lunch', 
    facility = 'Main Camp Mess Hall', 
    allowDuplicate = false,
    customDate = null,
    customTimestamp = null,
    effectiveDate = null
  }) => {
    const matchResult = matchEmployeeByIdAndName(employeeId, employeeName);
    if (!matchResult.matched) {
      return matchResult;
    }

    const emp = matchResult.employee;
    const now = effectiveDate ? (effectiveDate instanceof Date ? effectiveDate : new Date(effectiveDate)) : new Date();
    const todayStr = customDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Get all meals logged by this employee today
    const todayEmpEntries = (data.mealEntries || []).filter(
      (m) => m.employeeId === emp.id && m.date === todayStr
    );

    // If already consumed 3 meals today and duplicate not explicitly authorized, warn max reached
    if (todayEmpEntries.length >= 3 && !allowDuplicate) {
      const currentAllocations = getEmployeeRealtimeAllocations({
        employeeId: emp.id,
        mealEntries: data.mealEntries || [],
        currentDate: now
      });
      return {
        matched: true,
        isDuplicate: true,
        employee: emp,
        allocations: currentAllocations,
        message: `Employee ${emp.name} has already consumed all 3 daily allocations today (Breakfast, Lunch, Dinner).`,
      };
    }

    // Determine target meal window: if the requested mealType is already logged today, assign the next open slot
    let finalMealType = mealType;
    const alreadyHasRequestedSlot = todayEmpEntries.some(m => m.mealType?.toLowerCase() === mealType?.toLowerCase());
    if (alreadyHasRequestedSlot) {
      const availableSlots = ['Breakfast', 'Lunch', 'Dinner'];
      const openSlot = availableSlots.find(slot => !todayEmpEntries.some(m => m.mealType?.toLowerCase() === slot.toLowerCase()));
      if (openSlot) {
        finalMealType = openSlot;
      }
    }

    const timeStr = customTimestamp || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry = {
      id: `MEAL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      category: emp.category,
      department: emp.department,
      designation: emp.designation,
      mealType: finalMealType,
      facility,
      timestamp: timeStr,
      date: todayStr,
      status: 'Verified',
    };

    const catKey = emp.category.toLowerCase(); // 'junior', 'senior', 'vip'
    const mealRate = data.financeOverview?.categoryRates?.[catKey]?.rate || 10;

    let computedAllocations = null;

    setData((prev) => {
      const currentEntries = prev.mealEntries || [];
      const updatedMealEntries = [newEntry, ...currentEntries];
      
      computedAllocations = getEmployeeRealtimeAllocations({
        employeeId: emp.id,
        mealEntries: updatedMealEntries,
        currentDate: now
      });

      // 1. Update Employee Overview eating counts
      const prevCat = prev.employeeOverview?.[catKey] || { total: 40, eating: 0, percentage: 0 };
      const newEating = (prevCat.eating || 0) + 1;
      const totalEmp = prevCat.total || 40;
      const newPercentage = Math.min(100, Math.round((newEating / totalEmp) * 100));

      const updatedEmployeeOverview = {
        ...prev.employeeOverview,
        [catKey]: {
          ...prevCat,
          eating: newEating,
          percentage: newPercentage,
        },
      };

      // 2. Update Wastage Control consumption metrics
      const newConsumed = (prev.wastageOverview?.consumedMeals || 0) + 1;
      const totalAllocated = prev.wastageOverview?.totalAllocated || 2500;
      const updatedWastage = {
        ...prev.wastageOverview,
        consumedMeals: newConsumed,
        consumptionPercentage: Math.min(100, Math.round((newConsumed / totalAllocated) * 100)),
      };

      // 3. Update Meal Allocation Quotas (consumedCredits & remainingCredits)
      const updatedCategories = (prev.mealAllocation?.categories || []).map((c) => {
        if (c.category.toLowerCase() === catKey) {
          const newCreditsConsumed = (c.consumedCredits || 0) + 1;
          const totalCredits = c.monthlyCredits || (c.totalEmployees * 22 * 3);
          return {
            ...c,
            consumedCredits: newCreditsConsumed,
            remainingCredits: Math.max(0, totalCredits - newCreditsConsumed),
          };
        }
        return c;
      });

      // 4. Update Finance budget metrics synced with meal entries
      const fin = computeCategoryFinance({
        financeOverview: prev.financeOverview,
        mealEntries: updatedMealEntries
      });

      return {
        ...prev,
        mealEntries: updatedMealEntries,
        employeeOverview: updatedEmployeeOverview,
        wastageOverview: updatedWastage,
        mealAllocation: {
          ...prev.mealAllocation,
          categories: updatedCategories,
        },
        financeOverview: {
          ...prev.financeOverview,
          monthlyExpenditure: fin.totalActual,
          monthlyRemaining: fin.totalRemaining,
          utilizationRate: fin.utilizationRate,
          budgetVsActual: fin.budgetVsActual,
          budgetStatus: fin.budgetStatus,
        },
      };
    });

    // Immediate post to MongoDB Atlas
    fetch('/api/meal-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch(() => {});

    addToast(`Approved: ${emp.name} (${emp.category}) checked in for ${finalMealType}! 1 allocation deducted.`, 'success');

    return {
      matched: true,
      success: true,
      employee: emp,
      entry: newEntry,
      allocations: computedAllocations,
      message: `APPROVED: Meal recorded for ${emp.name}`,
    };
  };

  const deleteMealEntry = (entryId) => {
    setData((prev) => {
      const remainingEntries = (prev.mealEntries || []).filter((e) => e.id !== entryId);
      return harmonizeStateMetrics({
        ...prev,
        mealEntries: remainingEntries,
      });
    });

    // Immediate delete in MongoDB Atlas
    fetch(`/api/meal-entries/${entryId}`, {
      method: 'DELETE',
    }).catch(() => {});

    addToast('Meal entry removed.', 'info');
  };

  const resetAllEntriesToZero = () => {
    setData((prev) => {
      const updated = harmonizeStateMetrics({
        ...prev,
        mealEntries: [],
      });
      // Mirror to MongoDB Atlas
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
      return updated;
    });
    addToast('All meal entries reset to 0. Ready for testing!', 'info');
  };

  // Add Employee to Master Roster
  const addEmployee = ({ id, name, category = 'Junior', department = 'Field Operations', designation = 'Operator', shift = 'Day Shift' }) => {
    const cleanId = id.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanId || !cleanName) {
      addToast('Both Employee ID and Name are required.', 'error');
      return { success: false, message: 'ID and Name are required.' };
    }

    const exists = (data.employees || []).some((e) => e.id.toUpperCase() === cleanId);
    if (exists) {
      addToast(`Employee with ID ${cleanId} already exists.`, 'error');
      return { success: false, message: `Employee ID ${cleanId} already exists.` };
    }

    const newEmp = {
      id: cleanId,
      name: cleanName,
      category,
      department,
      designation,
      shift,
      email: `${cleanName.toLowerCase().replace(/[^a-z]/g, '.')}@alhaditha.om`,
      phone: `+968 9${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
    };

    const catKey = category.toLowerCase();

    setData((prev) => {
      const prevCat = prev.employeeOverview?.[catKey] || { total: 0, eating: 0, percentage: 0 };
      const newTotal = (prevCat.total || 0) + 1;
      const eating = prevCat.eating || 0;
      const newPercentage = Math.round((eating / newTotal) * 100);

      const updatedCategories = (prev.mealAllocation?.categories || []).map((c) => {
        if (c.category.toLowerCase() === catKey) {
          const newEmps = (c.totalEmployees || 0) + 1;
          const monthlyCredits = newEmps * (prev.mealAllocation?.workingDays || 22) * 3;
          return {
            ...c,
            totalEmployees: newEmps,
            monthlyCredits,
            remainingCredits: monthlyCredits - (c.consumedCredits || 0),
          };
        }
        return c;
      });

      return {
        ...prev,
        employees: [newEmp, ...(prev.employees || [])],
        employeeOverview: {
          ...prev.employeeOverview,
          [catKey]: {
            ...prevCat,
            total: newTotal,
            percentage: newPercentage,
          },
        },
        mealAllocation: {
          ...prev.mealAllocation,
          categories: updatedCategories,
        },
      };
    });

    addToast(`Employee ${cleanName} (${cleanId}) added to ${category} category.`, 'success');
    return { success: true, employee: newEmp };
  };

  // Delete Employee from Master Roster
  const deleteEmployee = (employeeId) => {
    const cleanId = employeeId.trim().toUpperCase();
    const target = (data.employees || []).find((e) => e.id.toUpperCase() === cleanId);
    if (!target) {
      addToast(`Employee with ID ${cleanId} not found.`, 'error');
      return { success: false };
    }

    const catKey = target.category.toLowerCase();

    setData((prev) => {
      const prevCat = prev.employeeOverview?.[catKey] || { total: 1, eating: 0, percentage: 0 };
      const newTotal = Math.max(0, (prevCat.total || 1) - 1);
      const newEating = Math.min(newTotal, prevCat.eating || 0);
      const newPercentage = newTotal > 0 ? Math.round((newEating / newTotal) * 100) : 0;

      const updatedCategories = (prev.mealAllocation?.categories || []).map((c) => {
        if (c.category.toLowerCase() === catKey) {
          const newEmps = Math.max(0, (c.totalEmployees || 1) - 1);
          const monthlyCredits = newEmps * (prev.mealAllocation?.workingDays || 22) * 3;
          return {
            ...c,
            totalEmployees: newEmps,
            monthlyCredits,
            remainingCredits: Math.max(0, monthlyCredits - (c.consumedCredits || 0)),
          };
        }
        return c;
      });

      return {
        ...prev,
        employees: (prev.employees || []).filter((e) => e.id.toUpperCase() !== cleanId),
        employeeOverview: {
          ...prev.employeeOverview,
          [catKey]: {
            ...prevCat,
            total: newTotal,
            eating: newEating,
            percentage: newPercentage,
          },
        },
        mealAllocation: {
          ...prev.mealAllocation,
          categories: updatedCategories,
        },
      };
    });

    addToast(`Employee ${target.name} (${cleanId}) removed from database.`, 'info');
    return { success: true };
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
        isMongoConnected,
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
        verifyEmployeeMatch,
        recordMealEntry,
        deleteMealEntry,
        resetAllEntriesToZero,
        addEmployee,
        deleteEmployee,
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

