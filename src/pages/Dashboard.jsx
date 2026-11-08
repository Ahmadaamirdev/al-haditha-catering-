import React from 'react';
import EmployeeOverview from '../components/dashboard/EmployeeOverview';
import WastageOverview from '../components/dashboard/WastageOverview';
import LiveAttendanceOverview from '../components/dashboard/LiveAttendanceOverview';
import FinanceOverview from '../components/dashboard/FinanceOverview';
import EventsOverview from '../components/dashboard/EventsOverview';

export default function Dashboard() {
  return (
    <div className="space-y-4 sm:space-y-4.5 animate-fade-in">
      {/* Row 1: Employee Meal Overview + Wastage Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4.5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <EmployeeOverview />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <WastageOverview />
        </div>
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

