import { LayoutDashboard, ChefHat, LineChart, Dumbbell, HeartPulse, Users, LogOut, Menu } from 'lucide-react';
import { motion as FramerMotion } from 'framer-motion';
import { useGlobalState } from '../context/GlobalContext';

const NAV_ITEMS = [
  { to: '/',          icon: <LayoutDashboard size={20} />, label: 'Command Center' },
  { to: '/kitchen',   icon: <ChefHat size={20} />,         label: 'AI Kitchen' },
  { to: '/workouts',  icon: <Dumbbell size={20} />,         label: 'Workouts' },
  { to: '/analytics', icon: <LineChart size={20} />,        label: 'Analytics' },
  { to: '/health',    icon: <HeartPulse size={20} />,       label: 'Health Profile' },
  { to: '/community', icon: <Users size={20} />,            label: 'Community' },
];

const Sidebar = ({ onLogout, isExpanded = true }) => {
  const { user } = useGlobalState();

  return (
    <FramerMotion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${isExpanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-purple-900 to-black border-r border-purple-500/30 p-6 flex flex-col justify-between transition-all duration-300 overflow-y-auto`}
    >
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {isExpanded ? 'NutriMind' : 'NM'}
          </h2>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <FramerMotion.a
              key={item.to}
              href={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer group"
              whileHover={{ x: 4 }}
            >
              <span className="text-purple-400 group-hover:text-pink-400 transition-colors">{item.icon}</span>
              {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
            </FramerMotion.a>
          ))}
        </nav>
      </div>

      <div className="border-t border-purple-500/30 pt-4">
        <div className="flex items-center justify-between px-4 py-3 mb-4">
          {isExpanded && (
            <div>
              <p className="text-sm font-semibold">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400">{user?.email || 'user@nutrimmind.ai'}</p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors group"
          whileHover={{ x: 4 }}
        >
          <LogOut size={20} />
          {isExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </FramerMotion.aside>
  );
};

export default Sidebar;
