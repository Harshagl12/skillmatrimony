import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Target,
  Clock,
  Github,
  Award,
  Calendar,
  Flame,
  BookOpen,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { trackEvent } from '../lib/analytics';

// --- Types & Data ---

// 1. Activity Heatmap Data
const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Random level 0-4
    const level = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
    data.push({ date, level });
  }
  return data;
};

const heatmapData = generateHeatmapData();

// 2. Skill Confidence Data (Radar)
const skillRadarData = [
  { subject: 'React', A: 85, fullMark: 100 },
  { subject: 'Node.js', A: 65, fullMark: 100 },
  { subject: 'TypeScript', A: 75, fullMark: 100 },
  { subject: 'UI/UX', A: 90, fullMark: 100 },
  { subject: 'Database', A: 60, fullMark: 100 },
  { subject: 'DevOps', A: 40, fullMark: 100 },
];

// 3. Time Spent Analytics (Bar + Donut)
const timeSpentData = [
  { day: 'Mon', hours: 4 },
  { day: 'Tue', hours: 6 },
  { day: 'Wed', hours: 3 },
  { day: 'Thu', hours: 7 },
  { day: 'Fri', hours: 5 },
  { day: 'Sat', hours: 8 },
  { day: 'Sun', hours: 2 },
];

const timeDistributionData = [
  { name: 'Domain', value: 45 },
  { name: 'Fail Zone', value: 30 },
  { name: 'Events', value: 25 },
];

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b']; // Violet, Emerald, Amber

// 4. Upcoming Events
const upcomingEvents = [
  { id: 1, title: 'React Summit 2024', date: '2024-04-15T09:00:00', type: 'Conference' },
  { id: 2, title: 'HackTheNorth', date: '2024-05-20T10:00:00', type: 'Hackathon' },
];

const calculateTimeLeft = (targetDate: string) => {
  const difference = +new Date(targetDate) - +new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    };
  }
  return { days: 0, hours: 0 };
};

const Dashboard = () => {
  // ✅ Google Analytics
  useEffect(() => {
    const startTime = Date.now();
    trackEvent('dashboard_view', { page: 'dashboard' });
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('dashboard_time_spent', { seconds: timeSpent });
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-2 tracking-tight"
        >
          Student <span className="text-violet-500">Analytics</span>
        </motion.h2>
        <p className="text-zinc-300">Track your progress, skills, and upcoming challenges.</p>
      </header>

      {/* 3.5 Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Skills Explored', value: '12', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Quizzes Passed', value: '8', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Events Registered', value: '3', icon: Calendar, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Day Streak', value: '14', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border border-white/5 backdrop-blur-xl ${stat.bg} hover:bg-opacity-20 transition-all cursor-pointer`}
            onClick={() => trackEvent('stat_card_click', { stat: stat.label })}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.label === 'Day Streak' && <stat.icon className="text-zinc-500" size={16} />}
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-zinc-300 text-sm font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 3.1 Activity Heatmap */}
      <section className="p-6 rounded-3xl bg-[#12061f] border border-violet-500/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Github className="text-violet-500" size={20} />
            Activity History
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#1e1e2e]" />
              <div className="w-3 h-3 rounded-sm bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <div className="w-3 h-3 rounded-sm bg-green-300" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Container - Scrollable */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-violet-900">
          <div className="flex gap-1 min-w-max">
            {/* We will map weeks (approx 53) */}
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  // Calculate index in flattened 365 array
                  // We just need unique mapping, doesn't need to match perfectly to exact dates for mock
                  const uniqueId = weekIndex * 7 + dayIndex;
                  const dayData = heatmapData[uniqueId] || { level: 0 };

                  let bgClass = 'bg-[#1e1e2e]';
                  if (dayData.level === 1) bgClass = 'bg-emerald-900/60';
                  else if (dayData.level === 2) bgClass = 'bg-emerald-700/80';
                  else if (dayData.level === 3) bgClass = 'bg-emerald-500';
                  else if (dayData.level === 4) bgClass = 'bg-emerald-300';

                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${bgClass} hover:ring-1 hover:ring-white transition-all`}
                      title={`Activity Level: ${dayData.level}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: Radar Chart & Time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 3.2 Skill Confidence Meter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl bg-[#12061f] border border-violet-500/20 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="text-violet-500" size={20} />
              Skill Confidence
            </h3>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="h-[300px] w-full flex items-center justify-center relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillRadarData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Confidence"
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -z-0" />
        </motion.div>

        {/* 3.4 Time Spent Analytics */}
        <div className="space-y-6">
          {/* Daily Time Spent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5"
          >
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="text-emerald-500" size={18} /> Daily Focus (Hrs)
            </h4>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSpentData}>
                  <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Section Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Activity className="text-amber-500" size={18} /> Distribution
              </h4>
              <p className="text-zinc-400 text-sm">Most time spent on <span className="text-white font-semibold">Domain</span>.</p>
            </div>
            <div className="size-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3.3 Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-violet-500" size={24} /> Upcoming Events
          </h3>
          <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">See all</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.map((event) => {
            const timeLeft = calculateTimeLeft(event.date);
            return (
              <div key={event.id} className="group relative p-8 rounded-3xl bg-zinc-900 border border-white/10 hover:border-violet-500/50 transition-all overflow-hidden cursor-pointer">
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium border border-violet-500/20 mb-3 inline-block">
                      {event.type}
                    </span>
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-zinc-300 text-sm flex items-center gap-2">
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Countdown Box */}
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className="text-xl font-bold text-white">{timeLeft.days}</span>
                    <span className="text-[10px] uppercase text-zinc-400 font-bold">Days</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span>Register Now</span>
                  <Award size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
