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
import { ProtectedRoute } from './components/ProtectedRoute';

// Track page views on route change
function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  return null;
}

// Layout wrapper for authenticated pages
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex bg-[#000b1e] min-h-screen text-zinc-100 font-sans selection:bg-blue-500 selection:text-white">
    {/* Background Gradients */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Main Blue Glow */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[50%] bg-blue-700/20 blur-[120px] rounded-full mix-blend-screen" />
      {/* Central White/Silver Highlight */}
      <div className="absolute top-[-10%] left-[35%] w-[30%] h-[40%] bg-white/5 blur-[80px] rounded-full mix-blend-overlay" />
      {/* Ambient Deep Blue */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-900/10 blur-[130px] rounded-full" />
    </div>

    <Sidebar />

    <main className="flex-1 ml-64 min-h-screen relative z-10">
      {children}
    </main>
  </div>
);

export function App() {
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  return (
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
  );
}
