import { computeCategoryFinance } from './financeEngine.js';

// Restored original November 2026 events
export const defaultNovemberEvents = [
  {
    id: 'EVT-101',
    title: 'Annual Gathering',
    day: '15',
    month: 'Nov',
    fullDate: '2026-11-15',
    time: '18:30 - 22:30',
    invitedCount: 200,
    expectedCount: 180,
    perPersonBudget: 20,
    overallBudget: 3600,
    status: 'Confirmed',
    statusType: 'success',
    description: 'Company annual gathering with special banquet catering.',
    menuChanged: false,
    menuDetails: 'Buffet with Grilled Meats, Rice, Salads, Desserts and Beverages.',
    category: 'Corporate / Special Banquet',
    invitedEmployees: []
  },
  {
    id: 'EVT-1001',
    title: 'al haditha meeting',
    day: '20',
    month: 'Nov',
    fullDate: '2026-11-20',
    time: '18:00 - 21:00',
    location: 'Main Camp Mess Hall',
    description: 'Executive board and catering committee quarterly dinner.',
    category: 'Corporate / Special Banquet',
    status: 'Confirmed',
    statusType: 'success',
    invitedCount: 8,
    expectedCount: 8,
    perPersonBudget: 30,
    overallBudget: 240,
    menuChanged: false,
    menuDetails: 'Executive VIP Banquet: Grilled Lamb, Fresh Saffron Rice, Mezza and Arabic Sweets.',
    invitedEmployees: []
  },
  {
    id: 'EVT-8754',
    title: 'muneeb meetingn',
    day: '20',
    month: 'Nov',
    fullDate: '2026-11-20',
    time: '18:00 - 21:00',
    location: 'Main Camp Mess Hall',
    description: 'Corporate committee meeting and dinner banquet.',
    category: 'Corporate / Special Banquet',
    status: 'Confirmed',
    statusType: 'success',
    invitedCount: 10,
    expectedCount: 10,
    perPersonBudget: 25,
    overallBudget: 250,
    menuChanged: false,
    menuDetails: 'Buffet with Grilled Meats, Rice, Fresh Salads, Traditional Sweets and Beverages.',
    invitedEmployees: []
  },
  {
    id: 'EVT-102',
    title: 'Q4 Safety Excellence Celebration',
    day: '22',
    month: 'Nov',
    fullDate: '2026-11-22',
    time: '12:30 - 14:30',
    invitedCount: 350,
    expectedCount: 320,
    perPersonBudget: 15,
    overallBudget: 4800,
    status: 'Confirmed',
    statusType: 'warning',
    description: 'Honoring zero lost-time injury milestone across solar and desert field camps.',
    menuChanged: false,
    menuDetails: 'BBQ Special: Mixed Grill skewers, Biryani, Caesar Salad, Traditional Halwa and Kahwa.',
    category: 'Corporate / Special Banquet',
    invitedEmployees: []
  },
  {
    id: 'EVT-103',
    title: 'Board of Directors Luncheon',
    day: '28',
    month: 'Nov',
    fullDate: '2026-11-28',
    time: '13:00 - 15:00',
    invitedCount: 25,
    expectedCount: 25,
    perPersonBudget: 35,
    overallBudget: 875,
    status: 'Confirmed',
    statusType: 'success',
    description: 'Executive Board dining with executive culinary service.',
    menuChanged: false,
    menuDetails: 'Executive 5-Course Plated Service: Lobster Bisque, Wagyu Tenderloin / Seared Sea Bass, Date Pudding with Cardamom Gelato.',
    category: 'Corporate / Special Banquet',
    invitedEmployees: []
  }
];

export const defaultAlHadithaEvents = defaultNovemberEvents;
export const defaultAlHadithaEvent = defaultNovemberEvents[1];

// Central helper to dynamically synchronize all dashboard metrics directly with actual mealEntries
export function harmonizeStateMetrics(state) {
  if (!state) return state;

  const entries = state.mealEntries || [];
  const juniorCount = entries.filter((m) => (m.category || '').toLowerCase() === 'junior').length;
  const seniorCount = entries.filter((m) => (m.category || '').toLowerCase() === 'senior').length;
  const totalConsumed = juniorCount + seniorCount;
  const totalAllocated = state.wastageOverview?.totalAllocated || 240;

  // 1. Employee Overview eating counts & progress
  const updatedEmployeeOverview = {
    junior: {
      category: 'Junior',
      total: 40,
      color: '#009B4D',
      bgColor: '#E5F5EC',
      ...(state.employeeOverview?.junior || {}),
      eating: juniorCount,
      percentage: Math.min(100, Math.round((juniorCount / 40) * 100)),
    },
    senior: {
      category: 'Senior',
      total: 40,
      color: '#1684AA',
      bgColor: '#E7F2F9',
      ...(state.employeeOverview?.senior || {}),
      eating: seniorCount,
      percentage: Math.min(100, Math.round((seniorCount / 40) * 100)),
    },
  };

  // 2. Wastage Overview consumption metrics
  const updatedWastage = {
    ...(state.wastageOverview || {}),
    consumedMeals: totalConsumed,
    consumptionPercentage: Math.min(100, Math.round((totalConsumed / totalAllocated) * 100)),
    wastedMeals: state.wastageOverview?.wastedMeals || 0,
    records: state.wastageOverview?.records || [],
  };

  // 3. Finance Overview synchronization
  const fin = computeCategoryFinance({
    financeOverview: state.financeOverview,
    mealEntries: entries,
  });
  const updatedFinance = {
    ...(state.financeOverview || {}),
    monthlyExpenditure: fin.totalActual,
    monthlyRemaining: fin.totalRemaining,
    utilizationRate: fin.utilizationRate,
    budgetVsActual: fin.budgetVsActual,
    budgetStatus: fin.budgetStatus,
  };

  // 4. Events safeguard
  const currentEvents = Array.isArray(state.events) && state.events.length > 0 
    ? state.events 
    : [defaultAlHadithaEvent];

  // 5. Current Month & Date synchronization (dynamically defaults to current date/month)
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthStr = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  const effectiveMonth = state.selectedMonth || currentMonthStr;

  return {
    ...state,
    selectedMonth: effectiveMonth,
    events: currentEvents,
    employeeOverview: updatedEmployeeOverview,
    wastageOverview: updatedWastage,
    financeOverview: updatedFinance,
  };
}
