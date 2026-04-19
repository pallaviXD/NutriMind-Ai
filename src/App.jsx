import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <SystemStatusLayer isAnalyzing={false} />
      <Sidebar onLogout={logout} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="h-14 bg-panel/50 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between shrink-0 z-20">
          <div className="text-xs text-muted hidden md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted hidden md:block">Hi, <span className="text-foreground font-medium">{user?.name}</span></span>
            <div className="flex items-center gap-2 bg-background/60 border border-border rounded-full px-4 py-1.5 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" />
              <motion.span key={profileLabel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent-neon font-bold">
                {profileLabel}
              </motion.span>
            </div>
          </div>
        </header>

        {/* Animated page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="h-full">
              <Routes location={location}>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/kitchen"   element={<Kitchen />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/health"    element={<HealthProfile />} />
                <Route path="/workouts"  element={<Workouts />} />
              </Routes>
            </motion.div>
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
