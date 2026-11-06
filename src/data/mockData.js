// Mock Data for Al Haditha Energy Meal Management System

export const initialMockData = {
  currency: 'SAR', // Can switch between SAR and OMR
  selectedMonth: 'November 2025',
  currentDateFormatted: 'Monday, 3 Nov 2025',

  // Employee Meal Overview
  employeeOverview: {
    junior: {
      category: 'Junior',
      total: 1240,
      eating: 1120,
      percentage: 90,
      color: '#009B4D',
      bgColor: '#E5F5EC',
    },
    senior: {
      category: 'Senior',
      total: 680,
      eating: 620,
      percentage: 91,
      color: '#1684AA',
      bgColor: '#E7F2F9',
    },
    vip: {
      category: 'VIP',
      total: 120,
      eating: 98,
      percentage: 82,
      color: '#009B4D',
      bgColor: '#E5F5EC',
    },
  },

  // Wastage Control Overview
  wastageOverview: {
    consumedMeals: 2200,
    wastedMeals: 300,
    totalAllocated: 2500,
    consumptionPercentage: 88,
    estimatedWastageKg: 75.5,
    estimatedWastageCost: 1500,
    insight: 'Consider reducing food for next meal.',
    trend: [
      { day: 'Mon', consumed: 2200, wasted: 300, rate: 88 },
      { day: 'Tue', consumed: 2150, wasted: 350, rate: 86 },
      { day: 'Wed', consumed: 2280, wasted: 220, rate: 91 },
      { day: 'Thu', consumed: 2300, wasted: 200, rate: 92 },
      { day: 'Fri', consumed: 950, wasted: 80, rate: 92 }, // Off day partial
      { day: 'Sat', consumed: 900, wasted: 90, rate: 91 },
      { day: 'Sun', consumed: 2180, wasted: 320, rate: 87 },
    ],
    mealBreakdown: [
      { meal: 'Breakfast', allocated: 800, consumed: 720, wasted: 80, rate: 90 },
      { meal: 'Lunch', allocated: 1100, consumed: 960, wasted: 140, rate: 87 },
      { meal: 'Dinner', allocated: 600, consumed: 520, wasted: 80, rate: 86 },
    ],
    records: [
      { id: 'WST-001', date: '2025-11-03', meal: 'Breakfast', category: 'Junior', allocated: 450, consumed: 410, wasted: 40, status: 'Normal' },
      { id: 'WST-002', date: '2025-11-03', meal: 'Lunch', category: 'Junior', allocated: 550, consumed: 480, wasted: 70, status: 'High Waste' },
      { id: 'WST-003', date: '2025-11-03', meal: 'Lunch', category: 'Senior', allocated: 300, consumed: 275, wasted: 25, status: 'Optimal' },
      { id: 'WST-004', date: '2025-11-03', meal: 'Lunch', category: 'VIP', allocated: 50, consumed: 45, wasted: 5, status: 'Optimal' },
      { id: 'WST-005', date: '2025-11-03', meal: 'Dinner', category: 'Junior', allocated: 400, consumed: 345, wasted: 55, status: 'Review' },
      { id: 'WST-006', date: '2025-11-02', meal: 'Lunch', category: 'Junior', allocated: 550, consumed: 502, wasted: 48, status: 'Normal' },
      { id: 'WST-007', date: '2025-11-02', meal: 'Lunch', category: 'Senior', allocated: 300, consumed: 280, wasted: 20, status: 'Optimal' },
    ]
  },

  // Finance Overview
  financeOverview: {
    categoryRates: {
      junior: { rate: 5, unit: 'Person', name: 'Junior Budget' },
      senior: { rate: 10, unit: 'Person', name: 'Senior Budget' },
      vip: { rate: 20, unit: 'Person', name: 'VIP Budget' },
    },
    budgetVsActual: [
      { category: 'Junior', budget: 2300, actual: 2050 },
      { category: 'Senior', budget: 1650, actual: 1450 },
      { category: 'VIP', budget: 850, actual: 680 },
    ],
    budgetStatus: [
      { category: 'Junior', remaining: 4200, status: 'Left' },
      { category: 'Senior', remaining: 5950, status: 'Left' },
      { category: 'VIP', remaining: 1000, status: 'Left' },
    ],
    monthlyTotalBudget: 65000,
    monthlyExpenditure: 53850,
    monthlyRemaining: 11150,
    utilizationRate: 82.8,
    monthlyHistory: [
      { month: 'Jul', budget: 62000, actual: 58000 },
      { month: 'Aug', budget: 62000, actual: 59400 },
      { month: 'Sep', budget: 65000, actual: 61200 },
      { month: 'Oct', budget: 65000, actual: 57800 },
      { month: 'Nov', budget: 65000, actual: 53850 },
    ]
  },

  // Meal Allocation Overview
  mealAllocation: {
    workingDays: 22,
    offDaysNote: 'Fri & Sat Off',
    mealsPerPersonDay: 3,
    categories: [
      { category: 'Junior', color: '#009B4D', dailyAllocation: '3 Meals / Day', remainingMonth: '66 Meals', totalEmployees: 1240, monthlyCredits: 81840, consumedCredits: 12320, remainingCredits: 69520 },
      { category: 'Senior', color: '#1684AA', dailyAllocation: '3 Meals / Day', remainingMonth: '66 Meals', totalEmployees: 680, monthlyCredits: 44880, consumedCredits: 6820, remainingCredits: 38060 },
      { category: 'VIP', color: '#009B4D', dailyAllocation: 'Event-based / On Demand', remainingMonth: 'Flexible', totalEmployees: 120, monthlyCredits: 2640, consumedCredits: 420, remainingCredits: 2220 },
    ]
  },

  // Timetable & Meals Overview
  timetable: [
    {
      id: 'tb-1',
      timeSlot: '06:30 - 09:00',
      mealTime: 'Breakfast',
      assignedMenu: 'Continental Breakfast',
      applicableTo: 'Junior, Senior',
      chefInCharge: 'Chef Tariq Al-Balushi',
      items: ['Fresh Croissants & Arabic Bread', 'Boiled & Scrambled Eggs', 'Ful Medames & Hummus', 'Cheeses & Olives', 'Fresh Juices & Karak Tea'],
      iconType: 'sun'
    },
    {
      id: 'tb-2',
      timeSlot: '12:00 - 15:00',
      mealTime: 'Lunch',
      assignedMenu: 'Arabic Meal',
      applicableTo: 'Junior, Senior, VIP',
      chefInCharge: 'Chef Ahmed Al-Harthy',
      items: ['Omani Shuwa & Chicken Kabsa', 'Lentil Soup & Fatoush', 'Grilled Fish Fillet with Tahini', 'Steamed Basmati Rice', 'Umm Ali & Fresh Fruits'],
      iconType: 'sun'
    },
    {
      id: 'tb-3',
      timeSlot: '18:30 - 21:30',
      mealTime: 'Dinner',
      assignedMenu: 'Light Dinner',
      applicableTo: 'Junior, Senior',
      chefInCharge: 'Chef Salem Al-Maskari',
      items: ['Herb Roasted Chicken', 'Vegetable Biryani & Dal Makhani', 'Fresh Garden Salad', 'Pita Bread & Garlic Dip', 'Assorted Fruits & Herbal Teas'],
      iconType: 'moon'
    }
  ],

  // Events Overview
  events: [
    {
      id: 'EVT-101',
      title: 'Annual Gathering',
      day: '15',
      month: 'Nov',
      fullDate: '2025-11-15',
      time: '18:30 - 22:30',
      invitedCount: 200,
      expectedCount: 180,
      perPersonBudget: 20,
      overallBudget: 4000,
      status: 'No Change',
      statusType: 'success',
      description: 'Company annual event with special menu.',
      menuChanged: false,
      menuDetails: 'Special VIP Buffet: Lamb Ouzi, Kingfish Steaks, Seafood Saffron Rice, Royal Salad Bar, Premium Arabic Sweets and Mocktails.',
      location: 'Al Haditha Central Hall & Courtyard',
      category: 'VIP, Senior, Junior Honorees'
    },
    {
      id: 'EVT-102',
      title: 'Q4 Safety Excellence Celebration',
      day: '22',
      month: 'Nov',
      fullDate: '2025-11-22',
      time: '12:30 - 14:30',
      invitedCount: 350,
      expectedCount: 320,
      perPersonBudget: 15,
      overallBudget: 5250,
      status: 'Menu Updated',
      statusType: 'warning',
      description: 'Honoring zero lost-time injury milestone across solar and desert field camps.',
      menuChanged: true,
      menuDetails: 'BBQ Special: Mixed Grill skewers, Biryani, Caesar Salad, Traditional Halwa and Kahwa.',
      location: 'Camp Recreation Dining Center',
      category: 'All Staff'
    },
    {
      id: 'EVT-103',
      title: 'Board of Directors Luncheon',
      day: '28',
      month: 'Nov',
      fullDate: '2025-11-28',
      time: '13:00 - 15:00',
      invitedCount: 25,
      expectedCount: 25,
      perPersonBudget: 35,
      overallBudget: 875,
      status: 'Confirmed',
      statusType: 'success',
      description: 'Executive Board dining with executive culinary service.',
      menuChanged: true,
      menuDetails: 'Executive 5-Course Plated Service: Lobster Bisque, Wagyu Tenderloin / Seared Sea Bass, Date Pudding with Cardamom Gelato.',
      location: 'Executive VIP Dining Suite',
      category: 'VIP'
    }
  ],

  // Mess Facilities
  facilities: [
    { id: 'FAC-1', name: 'Main Camp Mess Hall', capacity: 1500, activeStaff: 28, status: 'Operational' },
    { id: 'FAC-2', name: 'Desert Substation Mess B', capacity: 400, activeStaff: 10, status: 'Operational' },
    { id: 'FAC-3', name: 'VIP Executive Dining Suite', capacity: 60, activeStaff: 6, status: 'Operational' },
  ]
};

