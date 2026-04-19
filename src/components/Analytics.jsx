import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { Activity, Zap, TrendingUp, Flame, Award, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const token = localStorage.getItem('nm_token');
    try {
      const res = await fetch(`/api/user/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const tooltipStyle = { backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-accent-neon" />
        <p className="text-muted text-sm">Loading your analytics…</p>
      </div>
    </div>
  );

  const hasData = data?.dailyTotals?.length > 0;
  const avgCalories = hasData ? Math.round(data.dailyTotals.reduce((s, d) => s + d.calories, 0) / data.dailyTotals.length) : 0;
  const avgProtein = hasData ? Math.round(data.dailyTotals.reduce((s, d) => s + d.protein, 0) / data.dailyTotals.length) : 0;
  const targetCals = profile?.health_goal === 'gym' ? 2800 : profile?.health_goal === 'weight_loss' ? 1600 : 2200;

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto" role="main" aria-label="Analytics Dashboard">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-accent-neon" size={24} /> Analytics
          </h1>
          <p className="text-muted text-sm mt-0.5">Your real nutrition data</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Time range">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)} aria-pressed={days === d}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${days === d ? 'bg-accent-neon/20 border-accent-neon text-accent-neon' : 'border-border text-muted hover:border-foreground/30'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <StatCard icon={<Flame size={18} className="text-orange-400" />} label="Avg Daily Calories" value={avgCalories || '—'} unit="kcal" color="border-l-orange-400" />
        <StatCard icon={<Zap size={18} className="text-accent-neon" />} label="Avg Protein" value={avgProtein || '—'} unit="g/day" color="border-l-accent-neon" />
        <StatCard icon={<Award size={18} className="text-yellow-400" />} label="Logging Streak" value={data?.streak || 0} unit="days" color="border-l-yellow-400" />
        <StatCard icon={<Calendar size={18} className="text-accent-purple" />} label="Total Meals Logged" value={data?.totalMeals || 0} unit="meals" color="border-l-accent-purple" />
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <Activity size={56} className="text-muted/20" />
          <div>
            <p className="text-foreground font-semibold">No data yet</p>
            <p className="text-muted text-sm mt-1">Start logging meals in the chat to see your analytics here</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

          {/* Calorie trend */}
          <div className="glass-panel p-5 flex flex-col h-[320px]" role="img" aria-label="Calorie trend chart">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
              <Flame size={14} className="text-orange-400" /> Calorie Trend
            </h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyTotals} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={v => v.slice(5)} />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="calories" stroke="#f97316" fill="url(#calGrad)" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macro breakdown */}
          <div className="glass-panel p-5 flex flex-col h-[320px]" role="img" aria-label="Macro breakdown chart">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
              <Zap size={14} className="text-accent-neon" /> Macro Breakdown
            </h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyTotals} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={v => v.slice(5)} />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="protein" fill="#0ea5e9" radius={[2,2,0,0]} name="Protein (g)" />
                  <Bar dataKey="carbs" fill="#8b5cf6" radius={[2,2,0,0]} name="Carbs (g)" />
                  <Bar dataKey="fat" fill="#06b6d4" radius={[2,2,0,0]} name="Fat (g)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weight trend */}
          {data.weightLogs?.length > 0 && (
            <div className="glass-panel p-5 flex flex-col h-[280px]" role="img" aria-label="Weight trend chart">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-accent-purple" /> Weight Trend
              </h2>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...data.weightLogs].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false}
                      tickFormatter={v => v.slice(5)} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="weight_kg" stroke="#8b5cf6" strokeWidth={2}
                      dot={{ r: 4, fill: '#8b5cf6' }} name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Today by meal */}
          {data.todayByMeal?.length > 0 && (
            <div className="glass-panel p-5 flex flex-col h-[280px]" role="img" aria-label="Today's meals chart">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-accent-cyan" /> Today by Meal
              </h2>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.todayByMeal} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="meal_type" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="calories" fill="#0ea5e9" radius={[4,4,0,0]} name="Calories" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, color }) => (
  <div className={`glass-panel p-4 border-l-4 ${color} flex items-center gap-3`} role="article">
    <div className="p-2 bg-background rounded-xl border border-border shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-xl font-bold text-foreground">{value} <span className="text-sm text-muted font-normal">{unit}</span></p>
    </div>
  </div>
);

export default Analytics;
