import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  ShieldAlert,
  Calendar,
  LogOut,
  User as UserIcon,
  Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Layers, label: 'Domain', path: '/domain' },
    { icon: ShieldAlert, label: 'Zero-Failure Zone', path: '/zero-failure' },
    { icon: Calendar, label: 'Event Hub', path: '/events' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="w-64 h-screen bg-[#0a0214] border-r border-violet-500/20 flex flex-col p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <Zap className="text-white fill-white" size={20} />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-violet-400 bg-clip-text text-transparent tracking-tight">
          SKILL MATRIMONY
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          // Fix for dashboard exact match since it's just '/'
          const isDashboardActive = item.path === '/' && location.pathname === '/';
          const isItemActive = item.path === '/' ? isDashboardActive : isActive;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                isItemActive
                  ? "bg-violet-600/10 border border-violet-500/30 text-white"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("size-5 transition-transform duration-300 group-hover:scale-110", isItemActive && "text-violet-400")} />
              <span className="font-medium">{item.label}</span>
              {isItemActive && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-violet-500/10">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-colors w-full group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
