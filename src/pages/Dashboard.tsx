import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Clock,
  Github,
  Award,
  Calendar,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { trackEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

// --- Types ---
interface QuizResult {
  topic: string;
  score: number;
  total_questions: number;
  timestamp: string;
}

interface EventData {
  id: number;
  title: string;
  date: string;
  category: string;
  college: string;
}

interface ProfileData {
  skills: string[];
  name: string;
}

// --- Heatmap (persisted in localStorage) ---
const HEATMAP_KEY = 'dashboard_heatmap';

const getOrCreateHeatmap = (): number[] => {
  const saved = localStorage.getItem(HEATMAP_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 365) return parsed;
    } catch { /* ignore */ }
  }
  // Generate and save once
  const data: number[] = [];
  for (let i = 0; i < 365; i++) {
    data.push(Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0);
  }
  localStorage.setItem(HEATMAP_KEY, JSON.stringify(data));
  return data;
};

// --- Time helpers ---
const calculateTimeLeft = (targetDate: string) => {
  const difference = +new Date(targetDate) - +new Date();
  if (difference > 0) {
    return { days: Math.floor(difference / (1000 * 60 * 60 * 24)) };
  }
  return { days: 0 };
};

// --- Donut chart colors ---
const COLORS = ['#8b5cf6', '#10b981', '#f59e0b'];

// --- Default skill radar (fallback if no profile skills) ---
const DEFAULT_SKILLS = [
  { subject: 'React', A: 85, fullMark: 100 },
  { subject: 'Node.js', A: 65, fullMark: 100 },
  { subject: 'TypeScript', A: 75, fullMark: 100 },
  { subject: 'UI/UX', A: 90, fullMark: 100 },
  { subject: 'Database', A: 60, fullMark: 100 },
  { subject: 'DevOps', A: 40, fullMark: 100 },
];

const timeSpentData = [
  { day: 'Mon', hours: 4 },
  { day: 'Tue', hours: 6 },
  { day: 'Wed', hours: 3 },
  { day: 'Thu', hours: 7 },
  { day: 'Fri', hours: 5 },
  { day: 'Sat', hours: 8 },
  { day: 'Sun', hours: 2 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Real data states
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistent heatmap
  const heatmapData = useMemo(() => getOrCreateHeatmap(), []);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) { setLoading(false); return; }

      const [quizRes, eventRes, profileRes] = await Promise.allSettled([
        supabase
          .from('quiz_results')
          .select('topic, score, total_questions, timestamp')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false }),
        supabase
          .from('events')
          .select('id, title, date, category, college')
          .order('date', { ascending: true }),
        supabase
          .from('profiles')
          .select('skills, name')
          .eq('user_id', user.id)
          .single(),
      ]);

      if (quizRes.status === 'fulfilled' && quizRes.value.data) {
        setQuizResults(quizRes.value.data);
      }
      if (eventRes.status === 'fulfilled' && eventRes.value.data) {
        setEvents(eventRes.value.data);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.data) {
        const p = profileRes.value.data;
        setProfile({
          skills: Array.isArray(p.skills) ? p.skills : [],
          name: p.name || '',
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Analytics
  useEffect(() => {
    const startTime = Date.now();
    trackEvent('dashboard_view', { page: 'dashboard' });
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('dashboard_time_spent', { seconds: timeSpent });
    };
  }, []);

  // Compute stats from real data
  const skillCount = profile?.skills?.length || 0;
  const quizzesPassed = quizResults.filter(q => q.score >= q.total_questions * 0.5).length;
  const totalQuizzes = quizResults.length;

  // Upcoming events (future dates only)
  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date())
    .slice(0, 3);

  // Day streak (compute from heatmap — count consecutive non-zero days from end)
  const dayStreak = useMemo(() => {
    let streak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i] > 0) streak++;
      else break;
    }
    return streak;
  }, [heatmapData]);

  // Skill radar data from profile
  const skillRadarData = useMemo(() => {
    if (!profile?.skills || profile.skills.length === 0) return DEFAULT_SKILLS;
    // Use actual skills with random confidence for visual effect (since we don't track this)
    // Seed random based on skill name for consistency
    return profile.skills.slice(0, 6).map(skill => ({
      subject: typeof skill === 'string' ? skill : String(skill),
      A: 40 + Math.floor((typeof skill === 'string' ? skill : '').length * 7.3 % 55),
      fullMark: 100,
    }));
  }, [profile]);

  // Time distribution donut
  const timeDistributionData = [
    { name: 'Domain', value: 45 },
    { name: 'Zero-Failure', value: 30 },
    { name: 'Events', value: 25 },
  ];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Student';

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-80 bg-white/5 rounded-xl" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
          </div>
          <div className="h-48 bg-white/5 rounded-3xl" />
          <div className="grid grid-cols-2 gap-8">
            <div className="h-80 bg-white/5 rounded-3xl" />
            <div className="h-80 bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      {/* Hero / Bento Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Welcome Section (Spans 8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-end pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className={cn(
              "text-5xl md:text-6xl font-black tracking-tighter leading-tight",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {greeting},<br />
              <span className={cn(
                "bg-clip-text text-transparent underline decoration-4 underline-offset-[12px]",
                isDark ? "bg-gradient-to-r from-violet-400 to-indigo-500 decoration-violet-500/30" : "bg-gradient-to-r from-violet-600 to-purple-600 decoration-violet-200"
              )}>
                {displayName}
              </span>
            </h2>
            <p className={cn(
              "text-lg md:text-xl font-medium tracking-tight max-w-2xl mt-6",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              Your engineering journey at a glance. Track skills, conquer challenges, and explore domains.
            </p>
          </motion.div>
        </div>

        {/* Minimal At-a-Glance Stats (Spans 4 cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {[
            { label: 'Skills Mastered', value: skillCount, onClick: () => navigate('/profile') },
            { label: 'Quizzes Passed', value: `${quizzesPassed}/${totalQuizzes}`, onClick: () => navigate('/zero-failure') },
            { label: 'Listed Events', value: events.length, onClick: () => navigate('/events') },
            { label: 'Day Streak', value: `${dayStreak}🔥` }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              onClick={stat.onClick}
              className={cn(
                "p-5 rounded-3xl transition-all relative overflow-hidden group",
                stat.onClick && "cursor-pointer",
                isDark
                  ? "bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04]"
                  : "bg-white/40 backdrop-blur-xl border border-violet-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/60"
              )}
            >
              <h3 className={cn(
                "text-3xl font-bold tracking-tighter mb-1",
                isDark ? "text-white" : "text-gray-900"
              )}>{stat.value}</h3>
              <p className={cn(
                "text-[13px] font-medium tracking-wide uppercase",
                isDark ? "text-zinc-500" : "text-gray-500"
              )}>{stat.label}</p>

              {stat.onClick && (
                <div className="absolute top-4 right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight size={16} className={isDark ? "text-violet-400" : "text-violet-600"} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Activity Heatmap */}
      <section className={cn(
        "p-8 rounded-[2rem]",
        isDark ? "bg-[#0f1115] border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-white/40 backdrop-blur-xl border border-violet-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
      )}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Github className={isDark ? 'text-violet-500' : 'text-violet-600'} size={20} />
            Activity History
          </h3>
          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#1e1e2e]" />
              <div className="w-3 h-3 rounded-sm bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-violet-900">
          <div className="flex gap-1 min-w-max">
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const idx = weekIndex * 7 + dayIndex;
                  const level = heatmapData[idx] ?? 0;

                  let bgClass = 'bg-[#1e1e2e]';
                  if (level === 1) bgClass = 'bg-emerald-900/60';
                  else if (level === 2) bgClass = 'bg-emerald-700/80';
                  else if (level === 3) bgClass = 'bg-emerald-500';
                  else if (level === 4) bgClass = 'bg-emerald-300';

                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${bgClass} hover:ring-1 hover:ring-white transition-all`}
                      title={`Activity Level: ${level}`}
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

        {/* Skill Confidence Meter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "p-8 rounded-[2rem] relative overflow-hidden",
            isDark ? "bg-[#0f1115] border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-white/40 backdrop-blur-xl border border-violet-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
          )}
        >
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Target className={isDark ? 'text-violet-500' : 'text-violet-600'} size={20} />
              Skill Confidence
            </h3>
            <span className="text-[10px] text-zinc-600">
              {skillCount > 0 ? `Based on ${skillCount} skills` : 'Add skills in Profile'}
            </span>
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

        {/* Time Spent Analytics */}
        <div className="space-y-6">
          {/* Daily Time Spent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "p-8 rounded-[2rem]",
              isDark ? "bg-[#0f1115] border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-white/40 backdrop-blur-xl border border-violet-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            )}
          >
            <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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

          {/* Section Distribution with Legend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "p-8 rounded-[2rem]",
              isDark ? "bg-[#0f1115] border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-white/40 backdrop-blur-xl border border-violet-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            )}
          >
            <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Target className="text-amber-500" size={18} /> Time Distribution
            </h4>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="size-[140px] relative shrink-0">
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
                      formatter={(value) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom Legend */}
              <div className="flex flex-col gap-3 flex-1">
                {timeDistributionData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-zinc-300 text-sm flex-1">{item.name}</span>
                    <span className="text-white font-bold text-sm">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Quiz Results (if any) */}
      {quizResults.length > 0 && (
        <section className={cn(
          "p-8 rounded-[2rem]",
          isDark ? "bg-[#0f1115] border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-white/40 backdrop-blur-xl border border-violet-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
        )}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <CheckCircle className="text-emerald-500" size={20} />
              Recent Quiz Results
            </h3>
            <button
              onClick={() => navigate('/zero-failure')}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              Take a quiz <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizResults.slice(0, 6).map((q, i) => {
              const pct = Math.round((q.score / q.total_questions) * 100);
              const passed = pct >= 50;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${passed
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-sm truncate flex-1">{q.topic}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span>{q.score}/{q.total_questions} correct</span>
                    <span>•</span>
                    <span>{new Date(q.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calendar className={isDark ? 'text-violet-500' : 'text-violet-600'} size={24} /> Upcoming Events
          </h3>
          <button
            onClick={() => navigate('/events')}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            See all <ArrowRight size={14} />
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-center"
          >
            <Calendar className="text-zinc-700 mx-auto mb-3" size={32} />
            <p className="text-zinc-500 text-sm mb-3">No upcoming events yet.</p>
            <button
              onClick={() => navigate('/events')}
              className="text-violet-400 text-sm hover:text-violet-300 transition-colors flex items-center gap-1 mx-auto"
            >
              Browse Event Hub <ArrowRight size={14} />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => {
              const timeLeft = calculateTimeLeft(event.date);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate('/event-hub')}
                  className={cn(
                    "group relative p-8 rounded-[2rem] transition-all overflow-hidden cursor-pointer",
                    isDark ? "bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/30 hover:bg-white/[0.04]" : "bg-white/40 backdrop-blur-xl border border-violet-200/40 hover:border-violet-500/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/60"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium border border-violet-500/20 mb-3 inline-block">
                        {event.category}
                      </span>
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                      </p>
                      {event.college && (
                        <p className="text-zinc-600 text-xs mt-1">📍 {event.college}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                      <span className="text-xl font-bold text-white">{timeLeft.days}</span>
                      <span className="text-[10px] uppercase text-zinc-400 font-bold">Days</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span>View in Event Hub</span>
                    <Award size={16} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
