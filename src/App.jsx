import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion as FramerMotion, AnimatePresence } from 'framer-motion';

// Pages
import Dashboard from './pages/Dashboard';
import Kitchen from './pages/Kitchen';
import Analytics from './pages/Analytics';
import HealthProfile from './pages/HealthProfile';
import Workouts from './pages/Workouts';
import Community from './components/Community';
import Sidebar from './components/Sidebar';
import { useGlobalState } from './context/GlobalContext';

const AppLayout = () => {
  const location = useLocation();
  const { isLoggedIn, logout } = useGlobalState();

  const handleLogout = () => {
    logout();
  };

  if (!isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="flex w-full h-screen bg-gradient-to-b from-purple-950 via-black to-black text-white">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <FramerMotion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="h-full">
            <Routes location={location}>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/kitchen"    element={<Kitchen />} />
              <Route path="/analytics"  element={<Analytics />} />
              <Route path="/health"     element={<HealthProfile />} />
              <Route path="/workouts"   element={<Workouts />} />
              <Route path="/community"  element={<Community />} />
              <Route path="*"           element={<Dashboard />} />
            </Routes>
          </FramerMotion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
