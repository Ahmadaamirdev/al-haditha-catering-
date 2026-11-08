/**
 * Al-Haditha Petroleum Services S.A.O.C - Finance & Budget Calculation Engine
 * Synchronizes category expenditures, monthly allocation pools, and remaining liquidity directly with real meal entries.
 */

// Monthly budget pool configuration totaling 65,000 OMR approved by Finance Board:
// 1. Junior Category: 40 staff * 22 working days * 3 meals = 2,640 meals * 5 OMR = 13,200 OMR
// 2. Senior Category: 40 staff * 22 working days * 3 meals = 2,640 meals * 10 OMR = 26,400 OMR
// 3. VIP Category: 20 staff * 22 working days * 3 meals * 20 OMR pool (26,400 standard, base 25,400 + 1,000 reserve = 25,400 OMR)
// Total = 13,200 + 26,400 + 25,400 = 65,000 OMR

export const BASE_CATEGORY_BUDGETS = {
  junior: 13200,
  senior: 26400,
  vip: 25400,
  total: 65000,
};

export function computeCategoryFinance({ financeOverview = {}, mealEntries = [] }) {
  const rates = financeOverview?.categoryRates || {};
  const jrRate = Number(rates?.junior?.rate ?? 5);
  const srRate = Number(rates?.senior?.rate ?? 10);
  const vipRate = Number(rates?.vip?.rate ?? 20);

  const entries = mealEntries || [];
  const jrMeals = entries.filter((e) => e.category?.toLowerCase() === 'junior').length;
  const srMeals = entries.filter((e) => e.category?.toLowerCase() === 'senior').length;
  const vipMeals = entries.filter((e) => e.category?.toLowerCase() === 'vip').length;

  const jrSpent = jrMeals * jrRate;
  const srSpent = srMeals * srRate;
  const vipSpent = vipMeals * vipRate;
  const totalActual = jrSpent + srSpent + vipSpent;

  const jrBudget = BASE_CATEGORY_BUDGETS.junior;
  const srBudget = BASE_CATEGORY_BUDGETS.senior;
  const vipBudget = BASE_CATEGORY_BUDGETS.vip;
  const totalBudget = financeOverview?.monthlyTotalBudget || BASE_CATEGORY_BUDGETS.total;

  const jrRemaining = Math.max(0, jrBudget - jrSpent);
  const srRemaining = Math.max(0, srBudget - srSpent);
  const vipRemaining = Math.max(0, vipBudget - vipSpent);
  const totalRemaining = Math.max(0, totalBudget - totalActual);

  const budgetVsActual = [
    { 
      category: 'Junior', 
      budget: jrBudget, 
      actual: jrSpent, 
      meals: jrMeals, 
      rate: jrRate 
    },
    { 
      category: 'Senior', 
      budget: srBudget, 
      actual: srSpent, 
      meals: srMeals, 
      rate: srRate 
    },
  ];

  const budgetStatus = [
    {
      category: 'Junior',
      name: 'Junior Employee Fund (40 Staff)',
      budget: jrBudget,
      spent: jrSpent,
      remaining: jrRemaining,
      meals: jrMeals,
      rate: jrRate,
      utilization: jrBudget > 0 ? ((jrSpent / jrBudget) * 100).toFixed(1) : '0.0',
      status: jrSpent > jrBudget ? 'Over Budget' : 'Healthy'
    },
    {
      category: 'Senior',
      name: 'Senior Employee Fund (40 Staff)',
      budget: srBudget,
      spent: srSpent,
      remaining: srRemaining,
      meals: srMeals,
      rate: srRate,
      utilization: srBudget > 0 ? ((srSpent / srBudget) * 100).toFixed(1) : '0.0',
      status: srSpent > srBudget ? 'Over Budget' : 'Healthy'
    }
  ];

  const utilizationRate = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  return {
    jrMeals,
    srMeals,
    vipMeals,
    jrSpent,
    srSpent,
    vipSpent,
    totalActual,
    totalBudget,
    totalRemaining,
    utilizationRate,
    budgetVsActual,
    budgetStatus,
  };
}
