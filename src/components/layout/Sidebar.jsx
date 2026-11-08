import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  PieChart, 
  Wallet, 
  CalendarCheck, 
  Utensils, 
  CalendarDays, 
  Settings, 
  LogOut,
  X,
  UserCheck,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import logoAsset from '../../assets/logo.png';

export default function Sidebar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen, addToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Entry Panel', path: '/entry', icon: UserCheck },
    { name: 'Wastage Control', path: '/wastage', icon: PieChart },
    { name: 'Finance', path: '/finance', icon: Wallet },
    { name: 'Meal Allocation', path: '/allocation', icon: CalendarCheck },
    { name: 'Events', path: '/events', icon: CalendarDays },
  ];

  const handleLogout = () => {
    addToast('Admin logged out successfully (Demo session).', 'info');
  };

  const closeMobile = () => {
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[#071B2B] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#10334E]/60 shadow-2xl lg:shadow-none select-none`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5 scrollbar-none relative z-10">
          {/* Header & Logo */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div 
              onClick={() => { navigate('/'); closeMobile(); }}
              className="cursor-pointer group flex items-center w-full"
            >
              {/* Logo Presentation: High-fidelity styling matching reference */}
              <div className="bg-white rounded-xl p-2 sm:p-2.5 shadow-sm transition-transform group-hover:scale-[1.02] flex items-center justify-center w-full">
                <img 
                  src={logoAsset} 
                  alt="Al Haditha Energy" 
                  className="h-10 sm:h-11 w-auto max-w-full object-contain"
                />
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={closeMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={closeMobile}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#009B4D] text-white shadow-pill font-semibold' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="tracking-wide">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-400 text-slate-900 ml-2">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-slate-700/60 mx-2" />

          {/* Secondary Nav */}
          <div className="space-y-1.5">
            <NavLink
              to="/settings"
              onClick={closeMobile}
              className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname === '/settings'
                  ? 'bg-[#009B4D] text-white shadow-pill font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-5 h-5 text-slate-400" />
              <span className="tracking-wide">Settings</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left"
            >
              <LogOut className="w-5 h-5 text-slate-400" />
              <span className="tracking-wide">Logout</span>
            </button>
          </div>
        </div>

        {/* Decorative Dotted Matrix & Wave (as in the reference image) */}
        <div className="relative pointer-events-none overflow-hidden pb-4 px-6 flex justify-start">
          <svg width="150" height="90" viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background wave glow */}
            <path d="M-20 80 Q 40 40 100 70 T 170 50" stroke="#1684AA" strokeWidth="3" strokeOpacity="0.15" fill="none" />
            <path d="M-20 70 Q 50 20 120 60 T 170 40" stroke="#009B4D" strokeWidth="2" strokeOpacity="0.15" fill="none" />

            {/* Matrix of green and blue dots matching the Al Haditha Energy logo 'H' styling */}
            {[
              { x: 10, y: 80, c: '#009B4D' }, { x: 10, y: 70, c: '#009B4D' }, { x: 10, y: 60, c: '#1684AA' },
              { x: 22, y: 80, c: '#009B4D' }, { x: 22, y: 70, c: '#009B4D' }, { x: 22, y: 60, c: '#1684AA' }, { x: 22, y: 50, c: '#1684AA' },
              { x: 34, y: 80, c: '#009B4D' }, { x: 34, y: 70, c: '#009B4D' }, { x: 34, y: 60, c: '#1684AA' }, { x: 34, y: 50, c: '#1684AA' }, { x: 34, y: 40, c: '#009B4D' },
              { x: 46, y: 80, c: '#009B4D' }, { x: 46, y: 70, c: '#009B4D' }, { x: 46, y: 60, c: '#1684AA' }, { x: 46, y: 50, c: '#1684AA' }, { x: 46, y: 40, c: '#009B4D' }, { x: 46, y: 30, c: '#009B4D' },
              { x: 58, y: 80, c: '#009B4D' }, { x: 58, y: 70, c: '#009B4D' }, { x: 58, y: 60, c: '#1684AA' }, { x: 58, y: 50, c: '#1684AA' }, { x: 58, y: 40, c: '#009B4D' }, { x: 58, y: 30, c: '#009B4D' }, { x: 58, y: 20, c: '#1684AA' },
              { x: 70, y: 80, c: '#009B4D' }, { x: 70, y: 70, c: '#009B4D' }, { x: 70, y: 60, c: '#1684AA' }, { x: 70, y: 50, c: '#1684AA' }, { x: 70, y: 40, c: '#009B4D' }, { x: 70, y: 30, c: '#009B4D' },
              { x: 82, y: 80, c: '#009B4D' }, { x: 82, y: 70, c: '#009B4D' }, { x: 82, y: 60, c: '#1684AA' }, { x: 82, y: 50, c: '#1684AA' },
            ].map((dot, i) => (
              <circle 
                key={i} 
                cx={dot.x} 
                cy={dot.y} 
                r="2.5" 
                fill={dot.c} 
                fillOpacity={0.8}
              />
            ))}
          </svg>
        </div>
      </aside>
    </>
  );
}

