import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, ChefHat, LineChart, HeartPulse, Dumbbell, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobalState } from '../context/GlobalContext';

const NAV_ITEMS = [
  { to: '/',          icon: <LayoutDashboard size={20} />, label: 'Command Center' },
  { to: '/kitchen',   icon: <ChefHat size={20} />,         label: 'AI Kitchen' },
  { to: '/workouts',  icon: <Dumbbell size={20} />,         label: 'Workouts' },
  { to: '/analytics', icon: <LineChart size={20} />,        label: 'Analytics' },
  { to: '/health',    icon: <HeartPulse size={20} />,       label: 'Health Profile' },
];

const Sidebar = ({ onLogout }) => {
  const { healthProfile } = useGlobalState();
  return (
    <div className="w-16 lg:w-60 h-full bg-panel/80 backdrop-blur-xl border-r border-border flex flex-col transition-all duration-300 shrink-0 z-20"
      role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="h-14 flex items-center justify-center lg:justify-start lg:px-5 border-b border-border/50 shrink-0">
        <Activity size={24} className="text-accent-neon shrink-0" />
        <span className="hidden lg:block ml-2.5 font-bold text-base tracking-tight">
          Nutri<span className="text-accent-purple">Mind</span>
          <span className="text-xs text-muted font-normal ml-1">OS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Profile indicator + logout */}
      <div className="p-3 border-t border-border/50 space-y-2">
        {healthProfile && (
          <div className="hidden lg:flex items-center gap-2 px-2 py-1.5 rounded-xl bg-accent-neon/10 border border-accent-neon/20">
            <HeartPulse size={12} className="text-accent-neon shrink-0" />
            <span className="text-[10px] font-semibold text-accent-neon truncate capitalize">{healthProfile.goal?.replace('_', ' ')}</span>
          </div>
        )}
        <button onClick={onLogout}
          className="w-full flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-muted hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:block font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} end={to === '/'}
    className={({ isActive }) =>
      `relative flex items-center justify-center lg:justify-start px-3 py-2.5 rounded-xl transition-all duration-200 group
      ${isActive ? 'text-accent-neon bg-accent-neon/10 font-semibold' : 'text-muted hover:bg-panel hover:text-foreground'}`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && <motion.div layoutId="navIndicator" className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent-neon rounded-r-full" initial={false} transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
        <div className="shrink-0">{icon}</div>
        <span className="hidden lg:block ml-3 text-sm truncate">{label}</span>
      </>
    )}
  </NavLink>
);

export default Sidebar;
