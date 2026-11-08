// Mock Data for Al Haditha Energy Meal Management System
import { alHadithaEmployees } from './employeesData.js';
import { generatedMockMealEntries } from './mockMealEntries.js';

export const initialMockData = {
  currency: 'OMR', // ERP currency strictly set to OMR (Omani Rial)
  selectedMonth: 'November 2026',
  currentDateFormatted: 'Saturday, 7 Nov 2026',

  // 100 Employees Master Feed (40 Junior, 40 Senior, 20 VIP)
  employees: alHadithaEmployees,

  // Employee Meal Overview (80 Employees: 40 Junior, 40 Senior) - Starting at 0 for live testing
  employeeOverview: {
    junior: {
      category: 'Junior',
      total: 40,
      eating: 0,
      percentage: 0,
      color: '#009B4D',
      bgColor: '#E5F5EC',
    },
    senior: {
      category: 'Senior',
      total: 40,
      eating: 0,
      percentage: 0,
      color: '#1684AA',
      bgColor: '#E7F2F9',
    },
  },

  // Wastage Control Overview - Starting at 0 for live testing
  wastageOverview: {
    consumedMeals: 0,
    wastedMeals: 0,
    totalAllocated: 300,
    consumptionPercentage: 0,
    estimatedWastageKg: 0,
    estimatedWastageCost: 0,
    insight: 'No meals logged yet today. Waiting for check-ins from the Entry Kiosk.',
    trend: [
      { day: 'Mon', consumed: 0, wasted: 0, rate: 0 },
      { day: 'Tue', consumed: 0, wasted: 0, rate: 0 },
      { day: 'Wed', consumed: 0, wasted: 0, rate: 0 },
      { day: 'Thu', consumed: 0, wasted: 0, rate: 0 },
      { day: 'Fri', consumed: 0, wasted: 0, rate: 0 },
      { day: 'Sat', consumed: 0, wasted: 0, rate: 0 },
      { day: 'Sun', consumed: 0, wasted: 0, rate: 0 },
    ],
    mealBreakdown: [
      { meal: 'Breakfast', allocated: 100, consumed: 0, wasted: 0, rate: 0 },
      { meal: 'Lunch', allocated: 100, consumed: 0, wasted: 0, rate: 0 },
      { meal: 'Dinner', allocated: 100, consumed: 0, wasted: 0, rate: 0 },
    ],
    records: []
  },

  // Finance Overview - Starting at 0 for live testing
  financeOverview: {
    categoryRates: {
      junior: { rate: 5, unit: 'Person', name: 'Junior Budget' },
      senior: { rate: 10, unit: 'Person', name: 'Senior Budget' },
      vip: { rate: 20, unit: 'Person', name: 'VIP Budget' },
    },
    budgetVsActual: [
      { category: 'Junior', budget: 2300, actual: 0 },
      { category: 'Senior', budget: 1650, actual: 0 },
      { category: 'VIP', budget: 850, actual: 0 },
    ],
    budgetStatus: [
      { category: 'Junior', remaining: 2300, status: 'Left' },
      { category: 'Senior', remaining: 1650, status: 'Left' },
      { category: 'VIP', remaining: 850, status: 'Left' },
    ],
    monthlyTotalBudget: 65000,
    monthlyExpenditure: 0,
    monthlyRemaining: 65000,
    utilizationRate: 0,
    monthlyHistory: [
      { month: 'Jul', budget: 62000, actual: 58000 },
      { month: 'Aug', budget: 62000, actual: 59400 },
      { month: 'Sep', budget: 65000, actual: 61200 },
      { month: 'Oct', budget: 65000, actual: 57800 },
      { month: 'Nov', budget: 65000, actual: 0 },
    ]
  },

  // Meal Allocation Overview (80 Employees: 40 Jr, 40 Sr) - Starting at 0 consumed
  mealAllocation: {
    workingDays: 22,
    offDaysNote: 'Fri & Sat Off',
    mealsPerPersonDay: 3,
    categories: [
      { category: 'Junior', color: '#009B4D', dailyAllocation: '3 Meals / Day', remainingMonth: '66 Meals', totalEmployees: 40, monthlyCredits: 2640, consumedCredits: 0, remainingCredits: 2640 },
      { category: 'Senior', color: '#1684AA', dailyAllocation: '3 Meals / Day', remainingMonth: '66 Meals', totalEmployees: 40, monthlyCredits: 2640, consumedCredits: 0, remainingCredits: 2640 },
    ]
  },

  // Real-time Meal Attendance Entries Feed - 2 Weeks of Working Days Verified Feed
  mealEntries: generatedMockMealEntries,

  // Timetable & Meals Overview
  timetable: [
    {
      id: 'tb-1',
      timeSlot: '09:00 - 10:00',
      mealTime: 'Breakfast',
      assignedMenu: 'Continental Breakfast',
      applicableTo: 'Junior, Senior',
      chefInCharge: 'Chef Tariq Al-Balushi',
      items: ['Fresh Croissants & Arabic Bread', 'Boiled & Scrambled Eggs', 'Ful Medames & Hummus', 'Cheeses & Olives', 'Fresh Juices & Karak Tea'],
      iconType: 'sun'
    },
    {
      id: 'tb-2',
      timeSlot: '14:00 - 15:00',
      mealTime: 'Lunch',
      assignedMenu: 'Arabic Meal',
      applicableTo: 'Junior, Senior, VIP',
      chefInCharge: 'Chef Ahmed Al-Harthy',
      items: ['Omani Shuwa & Chicken Kabsa', 'Lentil Soup & Fatoush', 'Grilled Fish Fillet with Tahini', 'Steamed Basmati Rice', 'Umm Ali & Fresh Fruits'],
      iconType: 'sun'
    },
    {
      id: 'tb-3',
      timeSlot: '19:00 - 20:00',
      mealTime: 'Dinner',
      assignedMenu: 'Light Dinner',
      applicableTo: 'Junior, Senior',
      chefInCharge: 'Chef Salem Al-Maskari',
      items: ['Herb Roasted Chicken', 'Vegetable Biryani & Dal Makhani', 'Fresh Garden Salad', 'Pita Bread & Garlic Dip', 'Assorted Fruits & Herbal Teas'],
      iconType: 'moon'
    }
  ],

  // Events Overview - Starts empty for live testing
  events: [],

  // Mess Facilities
  facilities: [
    { id: 'FAC-1', name: 'Main Camp Mess Hall', capacity: 1500, activeStaff: 28, status: 'Operational' },
    { id: 'FAC-2', name: 'Desert Substation Mess B', capacity: 400, activeStaff: 10, status: 'Operational' },
    { id: 'FAC-3', name: 'VIP Executive Dining Suite', capacity: 60, activeStaff: 6, status: 'Operational' },
  ]
};

