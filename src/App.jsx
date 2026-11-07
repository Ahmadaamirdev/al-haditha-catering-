import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import WastageControl from './pages/WastageControl';
import Finance from './pages/Finance';
import MealAllocation from './pages/MealAllocation';
import TimetableMeals from './pages/TimetableMeals';
import Events from './pages/Events';
import Settings from './pages/Settings';
import EmployeeEntryPanel from './pages/EmployeeEntryPanel';
import Employees from './pages/Employees';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Standalone Employee Kiosk / Entry Terminal Interface */}
          <Route path="/entry" element={<EmployeeEntryPanel />} />

          {/* Admin Dashboard & Management System */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="wastage" element={<WastageControl />} />
            <Route path="finance" element={<Finance />} />
            <Route path="allocation" element={<MealAllocation />} />
            <Route path="timetable" element={<TimetableMeals />} />
            <Route path="events" element={<Events />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
