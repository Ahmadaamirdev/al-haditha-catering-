# Al Haditha Energy — Employee Meal Management System

A production-quality, responsive admin dashboard for **Al Haditha Energy – Employee Meal Management System** built with React.js, Tailwind CSS, React Router DOM, Recharts, and Lucide React.

## 🚀 Key Modules & Capabilities

1. **Dashboard (`/`)**:
   - Recreated from official enterprise design specification.
   - **Employee Meal Overview**: Category metrics (Junior, Senior, VIP) with eating counts and completion progress bars.
   - **Wastage Control Overview**: 88% consumption donut chart, consumed vs skipped meals breakdown, actionable AI portion recommendation badge.
   - **Finance Overview**: Category budget badges, Budget vs Actual comparison chart, real-time budget status cards.
   - **Meal Allocation Overview**: Working days calculator (excluding Fridays & Saturdays), 3 meals/day quota, category remaining credits table.
   - **Timetable & Meals Overview**: Master schedule table (Breakfast, Lunch, Dinner), assigned menus, authorized staff tiers.
   - **Events Overview**: Upcoming corporate banquets card (Annual Gathering, VIP dining budgets, RSVP attendee metrics).

2. **Wastage Control (`/wastage`)**:
   - Macro waste metrics (Allocated, Consumed, Skipped, Food Scrap weight in kg).
   - Interactive modal to log real-time meal consumption and food waste.
   - Weekly consumption vs waste trends and meal-slot distribution analysis.
   - Searchable, filterable consumption log records table.

3. **Finance (`/finance`)**:
   - Monthly catering budget management, realized expenditure, and utilization rates.
   - Interactive modals to edit category per-head rates and inject supplementary budget pools.
   - 5-month Budget vs Actual trend comparison chart.
   - Event catering expenditures breakdown table.

4. **Meal Allocation (`/allocation`)**:
   - Active working day quota generator with automatic Friday & Saturday off-day exclusion.
   - Junior and Senior monthly meal token generation and consumption tracking.
   - Allocation rules modal and category breakdown inspector.

5. **Timetable & Meals (`/timetable`)**:
   - Comprehensive meal window management (Breakfast, Lunch, Dinner).
   - Menu assignments, course item highlights, and head chef tracking.
   - Mess Hall facilities overview and kitchen staff duty roster.

6. **Events (`/events`)**:
   - Full event coordination system with Upcoming, Monthly Calendar View, and Past Events tabs.
   - Add/Edit event modal with per-person and total budget auto-calculation, custom menu override toggle, and RSVP tracking.

7. **Settings (`/settings`)**:
   - Facility information, operational currency toggle (SAR / OMR), weekend policies, and food waste threshold alert limits.

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **Tailwind CSS v3**
- **React Router DOM v7**
- **Recharts**
- **Lucide React**

## 💻 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
