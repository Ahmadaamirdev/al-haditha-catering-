// Al-Haditha Petroleum Services - Automated Mess Allocation Engine
// Rules:
// 1. 3 meal allocations per employee per active working day.
// 2. Fridays and Saturdays are OFF (0 allocations).
// 3. Dynamic calculation based on exact days in month (30, 31, 28/29) and Friday/Saturday count.
// 4. Meal time windows:
//    - Morning Breakfast: 09:00 - 10:00 AM (09:00 - 10:00)
//    - Lunch: 02:00 - 03:00 PM (14:00 - 15:00)
//    - Dinner: 07:00 - 08:00 PM (19:00 - 20:00)
// 5. Deduction rules:
//    - When employee enters: 1 allocation is consumed & minused.
//    - When a meal time window passes without an entry: 1 allocation expires & is minused.
//    - Daily progression automatically minuses past working days' allocations.
//    - Real-time remaining allocations are displayed upon entry.

export const MEAL_WINDOWS = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    timeSlot: '09:00 - 10:00',
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    icon: 'sun'
  },
  {
    id: 'lunch',
    name: 'Lunch',
    timeSlot: '14:00 - 15:00',
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    icon: 'utensils'
  },
  {
    id: 'dinner',
    name: 'Dinner',
    timeSlot: '19:00 - 20:00',
    startHour: 19,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    icon: 'moon'
  }
];

/**
 * Checks if a meal entry matches a given year, monthIndex (0-11), and optional dayNumber (1-31)
 */
export function isEntryInMonthOrDate(entry, targetYear, targetMonthIndex, targetDay = null) {
  if (!entry) return false;

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // 1. Check entry.date
  if (entry.date) {
    const str = String(entry.date).trim();

    // Check YYYY-MM-DD or YYYY-M-D
    const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const y = parseInt(ymdMatch[1], 10);
      const m = parseInt(ymdMatch[2], 10) - 1;
      const d = parseInt(ymdMatch[3], 10);
      if (y === targetYear && m === targetMonthIndex) {
        if (targetDay !== null && targetDay !== undefined) {
          return d === Number(targetDay);
        }
        return true;
      }
      return false;
    }

    // Check standard JS Date parsing
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      if (parsed.getFullYear() === targetYear && parsed.getMonth() === targetMonthIndex) {
        if (targetDay !== null && targetDay !== undefined) {
          return parsed.getDate() === Number(targetDay);
        }
        return true;
      }
      return false;
    }

    // Substring fallback (e.g. "Monday, 3 Nov 2025" or "3 Nov 2026")
    const lower = str.toLowerCase();
    const hasYear = lower.includes(String(targetYear));
    const hasMonth = lower.includes(monthNames[targetMonthIndex]) || lower.includes(shortMonths[targetMonthIndex]);
    if (hasYear && hasMonth) {
      if (targetDay !== null && targetDay !== undefined) {
        const dayMatch = str.match(/\b\d{1,2}\b/);
        if (dayMatch) {
          return parseInt(dayMatch[0], 10) === Number(targetDay);
        }
      }
      return true;
    }
  }

  // 2. Check entry.timestamp if entry.date wasn't matched
  if (entry.timestamp) {
    const parsed = new Date(entry.timestamp);
    if (!isNaN(parsed.getTime())) {
      if (parsed.getFullYear() === targetYear && parsed.getMonth() === targetMonthIndex) {
        if (targetDay !== null && targetDay !== undefined) {
          return parsed.getDate() === Number(targetDay);
        }
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculates month statistics: total days, Friday & Saturday count, working days, and monthly credits per employee.
 */
export function calculateMonthCalendar(year, monthIndex) {
  // Total days in month (monthIndex: 0 = Jan, 10 = Nov, 11 = Dec)
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  let fridaysCount = 0;
  let saturdaysCount = 0;
  let workingDaysCount = 0;

  const calendarDays = [];

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

    const isFriday = dayOfWeek === 5;
    const isSaturday = dayOfWeek === 6;
    const isOffDay = isFriday || isSaturday;

    if (isFriday) fridaysCount++;
    if (isSaturday) saturdaysCount++;
    if (!isOffDay) workingDaysCount++;

    calendarDays.push({
      dayNumber: d,
      dayOfWeek,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      isOffDay,
      dailyAllocation: isOffDay ? 0 : 3
    });
  }

  const offDaysCount = fridaysCount + saturdaysCount;
  const allocationsPerEmployee = workingDaysCount * 3;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    year,
    monthIndex,
    monthName: monthNames[monthIndex],
    totalDays,
    fridaysCount,
    saturdaysCount,
    offDaysCount,
    workingDaysCount,
    allocationsPerEmployee, // workingDays * 3
    calendarDays
  };
}

/**
 * Detect current active meal window or upcoming window based on current hour/minute
 */
export function getCurrentActiveMealWindow(date = new Date()) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const currentTotalMins = hour * 60 + minute;

  // Breakfast: 09:00 - 10:00 (540 - 600 mins)
  if (currentTotalMins >= 540 && currentTotalMins < 600) {
    return { ...MEAL_WINDOWS[0], status: 'ACTIVE' };
  }
  // Lunch: 14:00 - 15:00 (840 - 900 mins)
  if (currentTotalMins >= 840 && currentTotalMins < 900) {
    return { ...MEAL_WINDOWS[1], status: 'ACTIVE' };
  }
  // Dinner: 19:00 - 20:00 (1140 - 1200 mins)
  if (currentTotalMins >= 1140 && currentTotalMins < 1200) {
    return { ...MEAL_WINDOWS[2], status: 'ACTIVE' };
  }

  // If outside active windows, find next or current slot
  if (currentTotalMins < 600) {
    return { ...MEAL_WINDOWS[0], status: currentTotalMins < 540 ? 'UPCOMING' : 'EXPIRED' };
  }
  if (currentTotalMins < 900) {
    return { ...MEAL_WINDOWS[1], status: currentTotalMins < 840 ? 'UPCOMING' : 'EXPIRED' };
  }
  return { ...MEAL_WINDOWS[2], status: currentTotalMins < 1140 ? 'UPCOMING' : 'EXPIRED' };
}

/**
 * Calculates real-time employee meal allocation status:
 * - How many allocations consumed so far
 * - How many expired due to passed time windows
 * - How many remaining for this month
 * - Today's remaining allocations
 */
export function getEmployeeRealtimeAllocations({
  employeeId,
  mealEntries = [],
  currentDate = new Date(),
  customYear,
  customMonthIndex,
  customDay,
  precomputedMonthStats = null
}) {
  const now = currentDate instanceof Date ? currentDate : new Date();
  const year = customYear ?? now.getFullYear();
  const monthIndex = customMonthIndex ?? now.getMonth();
  const currentDay = customDay ?? now.getDate();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMins = currentHour * 60 + currentMinute;

  const monthStats = precomputedMonthStats || calculateMonthCalendar(year, monthIndex);
  const totalMonthlyQuota = monthStats.allocationsPerEmployee; // e.g. 22 working days * 3 = 66

  // Find all meals logged by this employee for this month
  const empMonthEntries = (mealEntries || []).filter((e) => {
    if (e.employeeId !== employeeId) return false;
    if (!e.date) return false;
    const [y, m] = String(e.date).split('-');
    if (y && m) {
      return parseInt(y, 10) === year && (parseInt(m, 10) - 1) === monthIndex;
    }
    const entryDate = new Date(e.date);
    return entryDate.getFullYear() === year && entryDate.getMonth() === monthIndex;
  });

  // Consumed count is the exact number of meals consumed by this employee
  const consumedCount = empMonthEntries.length;

  // Track today's specific 3 meal windows status
  const todayDateObj = new Date(year, monthIndex, currentDay);
  const todayDayOfWeek = todayDateObj.getDay();
  const isTodayOffDay = todayDayOfWeek === 5 || todayDayOfWeek === 6;

  const todayDateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
  const todayEntries = empMonthEntries.filter((e) => e.date === todayDateStr);

  const bfEntry = todayEntries.find((e) => e.mealType?.toLowerCase() === 'breakfast');
  const lunchEntry = todayEntries.find((e) => e.mealType?.toLowerCase() === 'lunch');
  const dinnerEntry = todayEntries.find((e) => e.mealType?.toLowerCase() === 'dinner');

  let expiredCount = 0;

  const todayMealsStatus = {
    isOffDay: isTodayOffDay,
    breakfast: { status: 'AVAILABLE', label: '09:00 - 10:00', entry: null },
    lunch: { status: 'AVAILABLE', label: '14:00 - 15:00', entry: null },
    dinner: { status: 'AVAILABLE', label: '19:00 - 20:00', entry: null }
  };

  // 1. Breakfast (09:00 - 10:00)
  if (bfEntry) {
    todayMealsStatus.breakfast = { status: 'CONSUMED', label: '09:00 - 10:00', entry: bfEntry };
  } else if (isTodayOffDay) {
    todayMealsStatus.breakfast = { status: 'OFF_DAY', label: '09:00 - 10:00', entry: null };
  } else if (currentTotalMins >= 600) {
    expiredCount++;
    todayMealsStatus.breakfast = { status: 'EXPIRED', label: '09:00 - 10:00', entry: null };
  } else {
    todayMealsStatus.breakfast = {
      status: currentTotalMins >= 540 ? 'ACTIVE_NOW' : 'UPCOMING',
      label: '09:00 - 10:00',
      entry: null
    };
  }

  // 2. Lunch (14:00 - 15:00)
  if (lunchEntry) {
    todayMealsStatus.lunch = { status: 'CONSUMED', label: '14:00 - 15:00', entry: lunchEntry };
  } else if (isTodayOffDay) {
    todayMealsStatus.lunch = { status: 'OFF_DAY', label: '14:00 - 15:00', entry: null };
  } else if (currentTotalMins >= 900) {
    expiredCount++;
    todayMealsStatus.lunch = { status: 'EXPIRED', label: '14:00 - 15:00', entry: null };
  } else {
    todayMealsStatus.lunch = {
      status: currentTotalMins >= 840 ? 'ACTIVE_NOW' : 'UPCOMING',
      label: '14:00 - 15:00',
      entry: null
    };
  }

  // 3. Dinner (19:00 - 20:00)
  if (dinnerEntry) {
    todayMealsStatus.dinner = { status: 'CONSUMED', label: '19:00 - 20:00', entry: dinnerEntry };
  } else if (isTodayOffDay) {
    todayMealsStatus.dinner = { status: 'OFF_DAY', label: '19:00 - 20:00', entry: null };
  } else if (currentTotalMins >= 1200) {
    expiredCount++;
    todayMealsStatus.dinner = { status: 'EXPIRED', label: '19:00 - 20:00', entry: null };
  } else {
    todayMealsStatus.dinner = {
      status: currentTotalMins >= 1140 ? 'ACTIVE_NOW' : 'UPCOMING',
      label: '19:00 - 20:00',
      entry: null
    };
  }

  // Calculate remaining allocations: strictly monthly quota minus consumed meals
  const totalDeducted = consumedCount;
  const remainingMonthlyAllocations = Math.max(0, totalMonthlyQuota - consumedCount);

  // Today remaining meals count
  let todayRemainingCount = 0;
  if (!isTodayOffDay) {
    if (todayMealsStatus.breakfast.status === 'ACTIVE_NOW' || todayMealsStatus.breakfast.status === 'UPCOMING') todayRemainingCount++;
    if (todayMealsStatus.lunch.status === 'ACTIVE_NOW' || todayMealsStatus.lunch.status === 'UPCOMING') todayRemainingCount++;
    if (todayMealsStatus.dinner.status === 'ACTIVE_NOW' || todayMealsStatus.dinner.status === 'UPCOMING') todayRemainingCount++;
  } else {
    todayRemainingCount = Math.max(0, 3 - todayEntries.length);
  }

  return {
    employeeId,
    monthStats,
    totalMonthlyQuota,
    consumedCount,
    expiredCount,
    totalDeducted,
    remainingMonthlyAllocations,
    todayRemainingCount,
    todayMealsStatus,
    activeDay: currentDay,
    isTodayOffDay
  };
}

/**
 * Computes live allocations for an entire employee array efficiently
 */
export function getEmployeesAllocationMap(employees = [], mealEntries = [], currentDate = new Date(), customYear, customMonthIndex, customDay) {
  const now = currentDate instanceof Date ? currentDate : new Date();
  const year = customYear ?? now.getFullYear();
  const monthIndex = customMonthIndex ?? now.getMonth();
  const monthStats = calculateMonthCalendar(year, monthIndex);

  const map = {};
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    map[emp.id] = getEmployeeRealtimeAllocations({
      employeeId: emp.id,
      mealEntries,
      currentDate: now,
      customYear: year,
      customMonthIndex: monthIndex,
      customDay,
      precomputedMonthStats: monthStats
    });
  }
  return map;
}
