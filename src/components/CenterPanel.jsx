import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CenterPanel = ({ state, isAnalyzing }) => {
  const { dailyCompletion, calories, meals } = state;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
      
      {/* Top Section: Progress Ring & Calorie Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Circular Progress Ring */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-neon/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-sm text-muted font-medium mb-4 uppercase tracking-wider">Daily Completion</h3>
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-border" strokeWidth="8" />
              <motion.circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="8" 
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${(dailyCompletion / 100) * 283} 283` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">
                <motion.span>{dailyCompletion}</motion.span>%
              </span>
            </div>
          </div>
        </div>

        {/* Calorie Tracker */}
        <div className="md:col-span-2 glass-panel p-6 flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-accent-neon/5 to-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-sm text-muted font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Flame size={16} className="text-accent-neon" /> Calorie Tracker
                </h3>
                <div className="text-3xl font-bold text-foreground">
                  {calories.current} <span className="text-lg text-muted font-normal">/ {calories.target} kcal</span>
                </div>
              </div>
           </div>

           <div className="h-4 bg-background rounded-full overflow-hidden relative border border-border/50">
             <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-cyan via-accent-neon to-accent-purple"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((calories.current / calories.target) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
             />
           </div>
        </div>
      </div>

      {/* Middle Section: Meal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MealCard type="Breakfast" data={meals.breakfast} isAnalyzing={isAnalyzing} />
        <MealCard type="Lunch" data={meals.lunch} isAnalyzing={isAnalyzing} />
        <MealCard type="Dinner" data={meals.dinner} isAnalyzing={isAnalyzing} />
        <MealCard type="Snacks" data={meals.snacks} isAnalyzing={isAnalyzing} />
      </div>

      {/* Bottom Section: Calorie Distribution Chart */}
      <div className="glass-panel p-6 flex-1 min-h-[250px] flex flex-col">
        <h3 className="text-sm text-muted font-medium uppercase tracking-wider mb-4">Calorie Distribution</h3>
        <div className="w-full h-64 min-h-[16rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Breakfast', value: meals.breakfast.cal },
              { name: 'Lunch', value: meals.lunch.cal },
              { name: 'Dinner', value: meals.dinner.cal },
              { name: 'Snacks', value: meals.snacks.cal }
            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }}
                itemStyle={{ color: '#0ea5e9' }}
                cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {
                  [meals.breakfast, meals.lunch, meals.dinner, meals.snacks].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'skipped' ? '#27272a' : '#8b5cf6'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

const MealCard = ({ type, data, isAnalyzing }) => {
  const getStatusIcon = () => {
    if (data.status === 'completed') return <CheckCircle2 size={18} className="text-accent-cyan" />;
    if (data.status === 'skipped') return <XCircle size={18} className="text-muted" />;
    return <CircleDashed size={18} className="text-accent-neon" />;
  };

  return (
    <motion.div 
      layout
      className={`glass-panel p-4 relative overflow-hidden transition-all duration-300 ${data.status === 'skipped' ? 'opacity-60 grayscale' : 'hover:border-accent-neon/30 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)]'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          {type} {getStatusIcon()}
        </h4>
        <motion.span 
          key={data.cal}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-mono text-accent-neon bg-accent-neon/10 px-2 py-0.5 rounded-md border border-accent-neon/20"
        >
          {data.cal} kcal
        </motion.span>
      </div>
      
      <motion.p 
        key={data.title}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`text-sm font-medium mt-1 ${data.status === 'skipped' ? 'line-through text-muted' : 'text-foreground'}`}
      >
        {data.title}
      </motion.p>
      
      {isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-panel/50 backdrop-blur-sm flex items-center justify-center"
        >
           <div className="w-4 h-4 rounded-full border-2 border-accent-neon border-t-transparent animate-spin" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CenterPanel;
