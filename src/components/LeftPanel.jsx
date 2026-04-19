import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, Bot, User, Info } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const QUICK_ACTIONS = [
  { key: 'skipped_meal', label: '⏭ Skipped Meal', color: 'hover:border-yellow-500/50 hover:text-yellow-400' },
  { key: 'ate_junk',     label: '🍕 Ate Junk',    color: 'hover:border-red-500/50 hover:text-red-400' },
  { key: 'low_budget',   label: '💰 Low Budget',  color: 'hover:border-green-500/50 hover:text-green-400' },
  { key: 'high_protein', label: '💪 High Protein', color: 'hover:border-accent-purple/50 hover:text-accent-purple' },
];

const LeftPanel = () => {
  const { chatHistory, isAnalyzing, processUserInput } = useGlobalState();
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll whenever chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAnalyzing]);

  const handleSend = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isAnalyzing) return;
    setInput('');
    processUserInput(text);
  };

  const handleQuickAction = (key) => {
    if (isAnalyzing) return;
    processUserInput(key); // GlobalContext maps key → natural language
  };

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 shrink-0">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Zap size={16} className="text-accent-neon" />
          <span>AI Control</span>
          {isAnalyzing && (
            <span className="ml-auto text-xs text-accent-cyan animate-pulse font-normal">Analyzing…</span>
          )}
        </h2>
      </div>

      {/* Quick Actions */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-border/50 shrink-0">
        {QUICK_ACTIONS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => handleQuickAction(key)}
            disabled={isAnalyzing}
            className={`px-2 py-2 bg-panel border border-border rounded-xl text-xs font-medium text-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chat Area — reads directly from GlobalContext.chatHistory */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {chatHistory.map((msg, idx) => {
          const isUser   = msg.role === 'user';
          const isSystem = msg.role === 'system';
          if (isSystem) {
            return (
              <div key={idx} className="flex items-start gap-2 text-xs text-muted bg-border/20 rounded-xl px-3 py-2">
                <Info size={12} className="shrink-0 mt-0.5 text-accent-neon" />
                <span className="leading-relaxed">{msg.text}</span>
              </div>
            );
          }
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-accent-neon text-background' : 'bg-panel border border-border text-accent-purple'}`}>
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>
              {/* Bubble */}
              <div
                className={`px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[82%] whitespace-pre-line
                  ${isUser
                    ? 'bg-accent-neon/10 border border-accent-neon/20 text-accent-neon rounded-br-sm'
                    : 'bg-panel border border-border text-foreground/90 rounded-bl-sm'}`
                }
              >
                {/* Format bold ** text */}
                {formatMessage(msg.text)}
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full bg-panel border border-border flex items-center justify-center shrink-0 text-accent-cyan">
              <Bot size={14} />
            </div>
            <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-panel border border-border text-xs flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-neon animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isAnalyzing}
            placeholder='Try: "I ate 200g chicken"'
            className="flex-1 bg-background/50 border border-border rounded-full pl-4 pr-3 py-2 text-xs focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all text-foreground placeholder:text-muted/50"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !input.trim()}
            className="p-2 bg-accent-neon text-background rounded-full hover:bg-accent-cyan transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Simple **bold** markdown formatter
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
