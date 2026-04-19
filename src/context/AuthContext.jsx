import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API = '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on boot
  useEffect(() => {
    const token = localStorage.getItem('nm_token');
    const savedUser = localStorage.getItem('nm_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setUser(data.user);
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    const token = localStorage.getItem('nm_token');
    const res = await fetch(`${API}/user/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok ? res.json() : null;
  };

  const signup = async ({ name, email, password }) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('nm_token', data.token);
      localStorage.setItem('nm_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const login = async ({ email, password }) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('nm_token', data.token);
      localStorage.setItem('nm_user', JSON.stringify(data.user));
      setUser(data.user);
      await fetchProfile(data.token);
    }
    return data;
  };

  const updateProfile = async (updates) => {
    const token = localStorage.getItem('nm_token');
    const res = await fetch(`${API}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (data.profile) setProfile(data.profile);
    return data;
  };

  const logWeight = async (weight_kg, notes) => {
    const token = localStorage.getItem('nm_token');
    return fetch(`${API}/user/weight-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ weight_kg, notes }),
    }).then(r => r.json());
  };

  const logout = () => {
    localStorage.removeItem('nm_token');
    localStorage.removeItem('nm_user');
    setUser(null);
    setProfile(null);
  };

  // null = not loaded yet, false = loaded but incomplete, true = complete
  const isProfileComplete = profile === null ? null : !!(profile?.height_cm && profile?.weight_kg);

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isAuthenticated: !!user,
      isProfileComplete,
      signup, login, logout, updateProfile, logWeight, getStats,
      refreshProfile: () => fetchProfile(localStorage.getItem('nm_token')),
    }}>
      {children}
    </AuthContext.Provider>
  );
};
