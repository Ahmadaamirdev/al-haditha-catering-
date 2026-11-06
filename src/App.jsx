import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import WastageControl from './pages/WastageControl';
import Finance from './pages/Finance';
import MealAllocation from './pages/MealAllocation';
import TimetableMeals from './pages/TimetableMeals';
import Events from './pages/Events';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
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
