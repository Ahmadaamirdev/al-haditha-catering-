import React from 'react';
import EmployeeOverview from '../components/dashboard/EmployeeOverview';
import WastageOverview from '../components/dashboard/WastageOverview';
import LiveAttendanceOverview from '../components/dashboard/LiveAttendanceOverview';
import FinanceOverview from '../components/dashboard/FinanceOverview';
import AllocationOverview from '../components/dashboard/AllocationOverview';
import TimetableOverview from '../components/dashboard/TimetableOverview';
import EventsOverview from '../components/dashboard/EventsOverview';

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Row 1: Employee Meal Overview + Wastage Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <EmployeeOverview />
        </div>
        <div className="lg:col-span-5">
          <WastageOverview />
        </div>
      </div>

      {/* Row 2: Live Mess Attendance & Check-In Stream (Real-Time Kiosk Sync) */}
      <div>
        <LiveAttendanceOverview />
      </div>

      {/* Row 3: Finance Overview + Meal Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <FinanceOverview />
        </div>
        <div className="lg:col-span-5">
          <AllocationOverview />
        </div>
      </div>

      {/* Row 4: Timetable & Meals + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TimetableOverview />
        </div>
        <div className="lg:col-span-6">
          <EventsOverview />
        </div>
      </div>
    </div>
  );
}

