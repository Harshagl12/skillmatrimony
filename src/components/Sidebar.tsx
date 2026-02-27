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
        "w-64 h-screen backdrop-blur-3xl border-r flex flex-col p-6 fixed left-0 top-0 z-50 transition-all duration-300",
        isDark
          ? "bg-[#0a0214]/70 border-violet-500/20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
          : "bg-white/60 border-violet-200/40 shadow-[4px_0_20px_rgba(102,51,238,0.06)]"
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

      <nav className="flex-1 space-y-1.5">
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
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isItemActive
                    ? isDark
                      ? "bg-violet-600/10 border border-violet-500/30 text-white"
                      : "bg-violet-600/10 border border-violet-500/25 text-violet-800"
                    : isDark
                      ? "text-zinc-500 hover:text-white hover:bg-white/5"
                      : "text-gray-400 hover:text-gray-800 hover:bg-white/40"
                )}
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  isDark
                    ? "bg-gradient-to-r from-violet-500/10 to-transparent"
                    : "bg-gradient-to-r from-violet-500/5 to-transparent"
                )} />
                <item.icon className={cn(
                  "size-5 transition-transform duration-300 group-hover:scale-110 relative z-10",
                  isItemActive && (isDark ? "text-violet-400" : "text-violet-600")
                )} />
                <span className="font-medium relative z-10">{item.label}</span>
                {isItemActive && (
                  <motion.div
                    layoutId="active-pill"
                    className={cn(
                      "ml-auto w-1.5 h-1.5 rounded-full relative z-10",
                      isDark
                        ? "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                        : "bg-violet-500 shadow-[0_0_8px_rgba(102,51,238,0.5)]"
                    )}
                  />
                )}
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
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors w-full group overflow-hidden relative",
            isDark
              ? "text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50/50"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform relative z-10" />
          <span className="font-medium relative z-10">Logout</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
