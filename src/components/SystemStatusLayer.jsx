import React from 'react';
import { motion } from 'framer-motion';

const SystemStatusLayer = ({ isAnalyzing }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle ambient background glow */}
      <motion.div 
        animate={{ 
          opacity: isAnalyzing ? 0.4 : 0.1,
          scale: isAnalyzing ? 1.05 : 1,
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-purple/20 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ 
          opacity: isAnalyzing ? 0.3 : 0.1,
          scale: isAnalyzing ? 1.1 : 1,
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-neon/20 rounded-full blur-[150px]"
      />

      {/* Analyzing HUD Element */}
      {isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-panel/80 backdrop-blur-md border border-accent-neon/50 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.3)]"
        >
          <div className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" />
          <span className="text-sm font-medium text-accent-neon tracking-wide uppercase">AI Analyzing Behavior...</span>
          <div className="flex gap-1">
             <motion.div className="w-1 h-3 bg-accent-neon" animate={{ scaleY: [1, 2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} />
             <motion.div className="w-1 h-3 bg-accent-neon" animate={{ scaleY: [1, 2, 1] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} />
             <motion.div className="w-1 h-3 bg-accent-neon" animate={{ scaleY: [1, 2, 1] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.4 }} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SystemStatusLayer;
