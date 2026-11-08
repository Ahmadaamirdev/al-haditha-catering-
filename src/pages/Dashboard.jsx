import React from 'react';
import EmployeeOverview from '../components/dashboard/EmployeeOverview';
import LiveAttendanceOverview from '../components/dashboard/LiveAttendanceOverview';
import FinanceOverview from '../components/dashboard/FinanceOverview';
import EventsOverview from '../components/dashboard/EventsOverview';

export default function Dashboard() {
  return (
    <div className="space-y-4 sm:space-y-4.5 animate-fade-in">
      {/* Welcome Greeting */}
      <div>
        <span className="block text-xs font-normal text-slate-secondary tracking-wide">
          Welcome Back,
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-primary tracking-tight leading-none mt-0.5">
          Admin
        </h1>
      </div>

      {/* Row 1: Employee Meal Overview */}
      <div>
        <EmployeeOverview />
      </div>

      {/* Row 2: Live Mess Attendance & Check-In Stream (Real-Time Kiosk Sync) */}
      <div>
        <LiveAttendanceOverview />
      </div>

      {/* Row 3: Finance Overview + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4.5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <FinanceOverview />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <EventsOverview />
        </div>
      </div>
    </div>
  );
}
