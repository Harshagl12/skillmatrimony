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
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isDark } = useTheme();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Layers, label: 'Domain', path: '/domain' },
    { icon: ShieldAlert, label: 'Zero-Failure Zone', path: '/zero-failure' },
    { icon: Calendar, label: 'Event Hub', path: '/events' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        "w-64 h-screen flex flex-col p-8 fixed left-0 top-0 z-50 transition-all duration-300",
        isDark
          ? "bg-transparent text-zinc-300"
          : "bg-transparent text-gray-600"
      )}
    >
      <div className="flex items-center gap-3 mb-12">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isDark
            ? "bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            : "bg-violet-600 shadow-[0_0_16px_rgba(102,51,238,0.25)]"
        )}>
          <Zap className="text-white fill-white" size={20} />
        </div>
        <h1 className={cn(
          "text-xl font-bold tracking-tight bg-clip-text text-transparent",
          isDark
            ? "bg-gradient-to-r from-white to-violet-400"
            : "bg-gradient-to-r from-gray-800 to-violet-600"
        )}>
          SKILL MATRIMONY
        </h1>
      </div>

      <nav className="flex-1 space-y-2 mt-8">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const isDashboardActive = item.path === '/' && location.pathname === '/';
          const isItemActive = item.path === '/' ? isDashboardActive : isActive;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.3, duration: 0.5 }}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group relative",
                  isItemActive
                    ? isDark
                      ? "text-white font-semibold"
                      : "text-violet-900 font-semibold"
                    : isDark
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-gray-500 hover:text-gray-900"
                )}
              >
                {/* Minimal Active Indicator Line */}
                {isItemActive && (
                  <motion.div
                    layoutId="active-nav-line"
                    className={cn(
                      "absolute left-0 top-1/4 bottom-1/4 w-[2px] rounded-r-full",
                      isDark ? "bg-violet-400" : "bg-violet-600"
                    )}
                  />
                )}

                <item.icon className={cn(
                  "size-5 transition-transform duration-300",
                  isItemActive ? (isDark ? "text-violet-400" : "text-violet-600") : "group-hover:scale-110"
                )} />
                <span className="tracking-wide text-sm">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={cn(
          "pt-6 border-t",
          isDark ? "border-violet-500/10" : "border-violet-200/30"
        )}
      >
        <button
          onClick={() => signOut()}
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-lg transition-colors w-full group",
            isDark
              ? "text-zinc-500 hover:text-zinc-300"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-wide text-sm">Logout</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
