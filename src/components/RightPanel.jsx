import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, AlertTriangle, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const RightPanel = ({ state, isAnalyzing }) => {
  const { insights, riskLevel, charts } = state;

  const getRiskColor = (level) => {
    switch(level) {
      case 'High': return 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-500/50';
      case 'Medium': return 'text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] border-yellow-500/50';
      case 'Low': return 'text-accent-neon shadow-[0_0_15px_rgba(14,165,233,0.3)] border-accent-neon/50';
      default: return 'text-muted border-border';
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 pb-4">
      
      {/* Risk Meter */}
      <div className={`glass-panel p-4 flex items-center justify-between border transition-colors duration-500 ${getRiskColor(riskLevel)}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} />
          <span className="font-semibold uppercase tracking-wider text-sm">System Risk</span>
        </div>
        <div className="flex items-center gap-2">
           <motion.div 
             key={riskLevel}
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="font-bold tracking-widest uppercase"
           >
             {riskLevel}
           </motion.div>
           {isAnalyzing && <div className="w-2 h-2 rounded-full bg-current animate-ping ml-2" />}
        </div>
      </div>

      {/* Intelligence Cards */}
      <div className="flex flex-col gap-4 flex-none">
        <InsightCard 
          icon={<BrainCircuit size={18} className="text-accent-purple" />}
          title="Adaptation Insight"
          content={insights.adaptation}
          isAnalyzing={isAnalyzing}
        />
        <InsightCard 
          icon={<TrendingUp size={18} className="text-accent-cyan" />}
          title="Behavioral Pattern"
          content={insights.behavioral}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Consistency Chart */}
      <div className="glass-panel p-5 flex flex-col flex-none h-[220px]">
        <h3 className="text-xs text-muted font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-neon" /> Consistency Trend
        </h3>
        <div className="w-full h-64 relative">
          {isAnalyzing && <ChartLoadingOverlay />}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.consistency} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }}
                itemStyle={{ color: '#0ea5e9' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0ea5e9" 
                strokeWidth={3} 
                dot={{ fill: '#09090b', stroke: '#0ea5e9', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 6, fill: '#0ea5e9' }} 
                isAnimationActive={true}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Macro Split Pie Chart */}
      <div className="glass-panel p-5 flex flex-col flex-1 min-h-[220px]">
        <h3 className="text-xs text-muted font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
          <PieChartIcon size={14} className="text-accent-purple" /> Macro Distribution
        </h3>
        <div className="w-full h-64 relative flex items-center justify-center">
          {isAnalyzing && <ChartLoadingOverlay />}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={charts.macros} 
                cx="50%" cy="50%" 
                innerRadius={50} outerRadius={70} 
                paddingAngle={5} 
                dataKey="value"
                isAnimationActive={true}
              >
                {charts.macros.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0ea5e9', '#8b5cf6', '#06b6d4'][index % 3]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }}
                itemStyle={{ color: '#fafafa' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

const InsightCard = ({ icon, title, content, isAnalyzing }) => (
  <div className="glass-panel p-4 relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2 mb-2">
      {icon} {title}
    </h3>
    <div className="relative min-h-[60px]">
      <AnimatePresence mode="wait">
        {!isAnalyzing ? (
          <motion.p 
            key={content}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-foreground/90 leading-relaxed"
          >
            {content}
          </motion.p>
        ) : (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center"
          >
            <div className="h-2 w-3/4 bg-border/50 rounded animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

const ChartLoadingOverlay = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="absolute inset-0 z-10 bg-panel/40 backdrop-blur-[2px] flex items-center justify-center rounded-lg"
  >
    <div className="w-6 h-6 border-2 border-accent-neon border-t-transparent rounded-full animate-spin" />
  </motion.div>
);

export default RightPanel;
