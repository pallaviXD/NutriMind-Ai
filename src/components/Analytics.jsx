import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Activity, Zap, TrendingUp } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const historicalData = [
  { name: 'Mon', protein: 140, carbs: 220, fat: 70, weight: 75.5 },
  { name: 'Tue', protein: 155, carbs: 250, fat: 80, weight: 75.4 },
  { name: 'Wed', protein: 130, carbs: 200, fat: 65, weight: 75.2 },
  { name: 'Thu', protein: 160, carbs: 260, fat: 85, weight: 75.3 },
  { name: 'Fri', protein: 150, carbs: 240, fat: 75, weight: 75.0 },
  { name: 'Sat', protein: 120, carbs: 300, fat: 90, weight: 75.1 },
  { name: 'Sun', protein: 150, carbs: 250, fat: 80, weight: 74.8 },
];

const scatterData = [
  { cal: 2100, weightDrop: 0.2 },
  { cal: 2400, weightDrop: 0.1 },
  { cal: 1800, weightDrop: 0.4 },
  { cal: 2800, weightDrop: -0.2 },
  { cal: 2200, weightDrop: 0.2 },
  { cal: 2500, weightDrop: 0.0 },
];

const Analytics = () => {
  const { isAnalyzing } = useGlobalState();

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <StatCard icon={<Activity className="text-accent-neon" />} label="Avg Daily Caloric Burn" value="2,450" unit="kcal" />
        <StatCard icon={<TrendingUp className="text-accent-purple" />} label="Weight Trend (7d)" value="-0.7" unit="kg" />
        <StatCard icon={<Zap className="text-accent-cyan" />} label="Metabolic Adaptation Rate" value="High" unit="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        
        {/* Area Chart: Macro Consistency */}
        <div className="glass-panel p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-neon" /> Macro Load Consistency
          </h2>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fafafa' }}
                />
                <Area type="monotone" dataKey="protein" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorP)" />
                <Area type="monotone" dataKey="carbs" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorC)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart: Calorie vs Weight Drop */}
        <div className="glass-panel p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-purple" /> Metabolic Response Scatter
          </h2>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis type="number" dataKey="cal" name="Intake" unit="kcal" stroke="#a1a1aa" fontSize={12} domain={[1500, 3000]} />
                <YAxis type="number" dataKey="weightDrop" name="Drop" unit="kg" stroke="#a1a1aa" fontSize={12} />
                <ZAxis type="number" range={[100, 300]} />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                <Scatter name="Metabolism" data={scatterData} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit }) => (
  <div className="glass-panel p-5 border-l-4 border-l-accent-neon flex items-center gap-4">
    <div className="p-3 bg-background rounded-xl border border-border">
      {icon}
    </div>
    <div>
      <h3 className="text-sm text-muted font-semibold uppercase tracking-wider">{label}</h3>
      <div className="text-2xl font-bold text-foreground">
        {value} <span className="text-base text-muted font-normal">{unit}</span>
      </div>
    </div>
  </div>
);

export default Analytics;
