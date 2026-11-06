import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F5F8FB] flex flex-col antialiased relative selection:bg-brand-green/20 selection:text-brand-green">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace (Offset by 260px on desktop) */}
      <div className="lg:pl-[260px] flex flex-col flex-1 min-w-0 transition-all duration-300 relative z-10">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 pt-2 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Subtle organic corporate wave backdrop in bottom-right (as in reference screenshot) */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[300px] pointer-events-none z-0 opacity-40 overflow-hidden">
        <svg viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path 
            d="M0 260 C 150 210, 300 290, 450 230 C 520 200, 560 170, 600 150 L 600 300 L 0 300 Z" 
            fill="url(#wave-gradient-1)" 
          />
          <path 
            d="M50 280 C 200 230, 350 270, 500 210 C 550 190, 580 180, 600 170 L 600 300 L 50 300 Z" 
            fill="url(#wave-gradient-2)" 
          />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0" y1="150" x2="600" y2="300" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1684AA" stopOpacity="0.25" />
              <stop offset="1" stopColor="#009B4D" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="50" y1="170" x2="600" y2="300" gradientUnits="userSpaceOnUse">
              <stop stopColor="#009B4D" stopOpacity="0.2" />
              <stop offset="1" stopColor="#1684AA" stopOpacity="0.15" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Global Interactive Toast Notifications */}
      <Toast />
    </div>
  );
}
