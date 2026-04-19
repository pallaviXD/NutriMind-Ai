import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Bot, User, Info, Sparkles, RefreshCw } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';

const QUICK_ACTIONS = [
  { key: 'skipped_meal', label: '⏭ Skipped Meal',  color: 'hover:border-yellow-500/50 hover:text-yellow-400' },
  { key: 'ate_junk',     label: '🍕 Ate Junk',      color: 'hover:border-red-500/50 hover:text-red-400' },
  { key: 'low_budget',   label: '💰 Low Budget',    color: 'hover:border-green-500/50 hover:text-green-400' },
  { key: 'high_protein', label: '💪 High Protein',  color: 'hover:border-accent-purple/50 hover:text-accent-purple' },
];

// Dynamic suggestions based on time of day and state
const getSuggestions = (calories, macros, profile) => {
  const hour = new Date().getHours();
  const goal = profile?.goal || 'general';
  const calsLeft = Math.max(0, calories.target - calories.current);
  const proteinLeft = Math.max(0, macros.targetProtein - macros.protein);

  const base = [
    hour < 10  ? 'What should I eat for breakfast?' : null,
    hour >= 12 && hour < 14 ? 'Suggest a quick lunch idea' : null,
    hour >= 18 ? 'What should I have for dinner?' : null,
    calsLeft < 300 ? `I only have ${calsLeft} kcal left today` : null,
    proteinLeft > 50 ? `I need ${proteinLeft}g more protein today` : null,
    goal === 'gym' ? 'What should I eat post-workout?' : null,
    goal === 'diabetes' ? 'What are good low-GI snacks?' : null,
    goal === 'weight_loss' ? 'How do I reduce cravings?' : null,
    'How much water should I drink today?',
    'Give me a high protein meal idea',
    'I feel tired and low energy',
    'What are the best foods for my goal?',
  ].filter(Boolean);

  // Return 3 random suggestions
  return base.sort(() => Math.random() - 0.5).slice(0, 3);
};

const LeftPanel = () => {
  const { chatHistory, isAnalyzing, processUserInput, calories, macros } = useGlobalState();
  const { user, profile } = useAuth();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAnalyzing]);

  useEffect(() => {
    setSuggestions(getSuggestions(calories, macros, profile));
  }, [calories.current, macros.protein]);

  const handleSend = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isAnalyzing) return;
    setInput('');
    setSuggestions(getSuggestions(calories, macros, profile));
    processUserInput(text);
  };

  const handleSuggestion = (text) => {
    if (isAnalyzing) return;
    setInput('');
    processUserInput(text);
    setSuggestions(getSuggestions(calories, macros, profile));
  };

  const handleQuickAction = (key) => {
    if (isAnalyzing) return;
    processUserInput(key);
  };

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 shrink-0">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Zap size={16} className="text-accent-neon" />
          <span>AI Health Coach</span>
          {isAnalyzing && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-accent-cyan font-normal">
              <RefreshCw size={11} className="animate-spin" /> Thinking…
            </span>
          )}
        </h2>
        {user && (
          <p className="text-xs text-muted mt-0.5">
            Hey {user.name?.split(' ')[0]} 👋 — {profile?.health_goal ? `${profile.health_goal.replace('_', ' ')} mode` : 'tell me anything'}
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-border/50 shrink-0">
        {QUICK_ACTIONS.map(({ key, label, color }) => (
          <button key={key} onClick={() => handleQuickAction(key)} disabled={isAnalyzing}
            className={`px-2 py-2 bg-panel border border-border rounded-xl text-xs font-medium text-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {chatHistory.map((msg, idx) => {
          const isUser   = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) return (
            <div key={idx} className="flex items-start gap-2 text-xs text-muted bg-border/20 rounded-xl px-3 py-2">
              <Info size={12} className="shrink-0 mt-0.5 text-accent-neon" />
              <span className="leading-relaxed">{msg.text}</span>
            </div>
          );

          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                ${isUser ? 'bg-accent-neon text-background' : 'bg-panel border border-border text-accent-purple'}`}>
                {isUser ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[82%] whitespace-pre-line
                ${isUser
                  ? 'bg-accent-neon/10 border border-accent-neon/20 text-accent-neon rounded-br-sm'
                  : 'bg-panel border border-border text-foreground/90 rounded-bl-sm'}`}>
                {formatMessage(msg.text)}
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full bg-panel border border-border flex items-center justify-center shrink-0 text-accent-cyan">
              <Bot size={13} />
            </div>
            <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-panel border border-border text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Suggestions */}
      <AnimatePresence>
        {!isAnalyzing && suggestions.length > 0 && chatHistory.length < 4 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-2 flex flex-col gap-1.5 border-t border-border/30 pt-2 shrink-0"
          >
            <p className="text-[10px] text-muted uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="text-accent-neon" /> Try asking
            </p>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSuggestion(s)} disabled={isAnalyzing}
                className="text-left text-xs text-muted/80 hover:text-accent-neon bg-background/40 hover:bg-accent-neon/5 border border-border/50 hover:border-accent-neon/30 rounded-lg px-3 py-1.5 transition-all truncate"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-3 border-t border-border/50 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text" value={input} onChange={e => setInput(e.target.value)}
            disabled={isAnalyzing}
            placeholder='Ask me anything about health…'
            className="flex-1 bg-background/50 border border-border rounded-full pl-4 pr-3 py-2 text-xs focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all text-foreground placeholder:text-muted/50"
          />
          <button type="submit" disabled={isAnalyzing || !input.trim()}
            className="p-2 bg-accent-neon text-background rounded-full hover:bg-accent-cyan transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

function formatMessage(text) {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-accent-neon font-semibold">{part}</strong>
      : part
  );
}

export default LeftPanel;
