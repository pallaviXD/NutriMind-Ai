import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalProvider, useGlobalState } from './context/GlobalContext';
import Sidebar from './components/Sidebar';
import SystemStatusLayer from './components/SystemStatusLayer';
import Dashboard from './components/Dashboard';
import Kitchen from './components/Kitchen';
import Analytics from './components/Analytics';
import HealthProfile from './components/HealthProfile';
import Workouts from './components/Workouts';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SetupProfile from './pages/SetupProfile';

// Protect routes — redirects to /login if not authed
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  // Only redirect to setup if profile is definitively incomplete (not just loading)
  if (isProfileComplete === false && location.pathname !== '/setup-profile')
    return <Navigate to="/setup-profile" replace />;
  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-accent-neon border-t-transparent rounded-full animate-spin" />
      <p className="text-muted text-sm">Loading NutriMind OS…</p>
    </div>
  </div>
);

// Main authenticated app layout
const AppLayout = () => {
  const location = useLocation();
  const { profileLabel } = useGlobalState();
  const { user, logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const MotionButton = motion.button;
  const MotionSpan = motion.span;
  const MotionDiv = motion.div;

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <SystemStatusLayer isAnalyzing={false} />
      <Sidebar onLogout={logout} isExpanded={isSidebarExpanded} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="h-14 bg-panel/50 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between shrink-0 z-20">
          <div className="text-xs text-muted hidden md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted hidden md:block">Hi, <span className="text-foreground font-medium">{user?.name}</span></span>
            <MotionButton
              type="button"
              onClick={() => setIsSidebarExpanded(prev => !prev)}
              className="relative h-8 px-3 rounded-full border border-accent-neon/40 bg-accent-neon/10 text-accent-neon hover:border-accent-neon/70 hover:bg-accent-neon/20 transition-all overflow-hidden"
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -1 }}
              aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-accent-neon/10 to-accent-purple/20 opacity-0 hover:opacity-100 transition-opacity" />
              <MotionSpan
                key={isSidebarExpanded ? 'collapse' : 'expand'}
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center gap-1.5 text-xs font-semibold"
              >
                {isSidebarExpanded ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                <span className="hidden lg:inline">{isSidebarExpanded ? 'Collapse' : 'Expand'}</span>
              </MotionSpan>
            </MotionButton>
            <div className="flex items-center gap-2 bg-background/60 border border-border rounded-full px-4 py-1.5 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" />
              <MotionSpan key={profileLabel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent-neon font-bold">
                {profileLabel}
              </MotionSpan>
            </div>
          </div>
        </header>

        {/* Animated page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <MotionDiv key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="h-full">
              <Routes location={location}>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/kitchen"   element={<Kitchen />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/health"    element={<HealthProfile />} />
                <Route path="/workouts"  element={<Workouts />} />
              </Routes>
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <GlobalProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/signup"         element={<SignupPage />} />
            <Route path="/verify-email"   element={<VerifyEmailPage />} />
            <Route path="/setup-profile"  element={
              <ProtectedRoute><SetupProfile /></ProtectedRoute>
            } />
            {/* Protected app routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
