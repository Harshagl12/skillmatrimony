import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Domain from './pages/Domain';
import ZeroFailureZone from './pages/ZeroFailureZone';
import EventHub from './pages/EventHub';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { initGoogleAnalytics, trackPageView } from './lib/analytics';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useTheme } from './hooks/useTheme';
import { BgGradient } from './components/ui/bg-gredient';

// Track page views on route change
function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  return null;
}

// Layout wrapper for authenticated pages
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 relative ${isDark
      ? 'bg-[#000b1e] text-zinc-100 selection:bg-violet-500 selection:text-white'
      : 'text-[#242424] selection:bg-violet-500/30 selection:text-violet-900'
      }`}>
      {/* Background */}
      {isDark ? (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[60%] h-[50%] bg-blue-700/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-[-10%] left-[35%] w-[30%] h-[40%] bg-white/5 blur-[80px] rounded-full mix-blend-overlay" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-900/10 blur-[130px] rounded-full" />
        </div>
      ) : (
        <BgGradient
          gradientFrom="#fff"
          gradientTo="#63e"
          gradientSize="125% 125%"
          gradientPosition="50% 10%"
          gradientStop="40%"
          className="fixed"
        />
      )}

      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
};

export function App() {
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnalyticsTracker />
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/domain/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Domain />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/zero-failure" element={
              <ProtectedRoute>
                <AppLayout>
                  <ZeroFailureZone />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/events" element={
              <ProtectedRoute>
                <AppLayout>
                  <EventHub />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
