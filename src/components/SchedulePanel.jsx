import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, CheckCircle2, Bell, ArrowRight } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const PRIORITY_STYLES = {
  High: 'text-red-400',
  Medium: 'text-amber-400',
  Low: 'text-emerald-400',
};

const STATUS_STYLES = {
  pending: 'bg-accent-neon/10 text-accent-neon border border-accent-neon/20',
  completed: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  missed: 'bg-red-500/10 text-red-300 border border-red-500/20',
};

const SchedulePanel = () => {
  const { schedule, completeScheduleItem, regenerateSchedule } = useGlobalState();
  const completedCount = schedule.filter(item => item.status === 'completed').length;

  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted font-semibold">Today's AI Schedule</p>
          <h3 className="text-xl font-semibold text-foreground mt-2">Your guided daily plan</h3>
          <p className="text-sm text-muted mt-1">A proactive schedule with reminders, priority tasks, and quick actions.</p>
        </div>
        <button
          type="button"
          onClick={regenerateSchedule}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-neon/30 bg-accent-neon/10 text-accent-neon text-xs font-semibold hover:bg-accent-neon/15 transition-all"
        >
          <ArrowRight size={14} /> Refresh schedule
        </button>
      </div>

      <div className="grid gap-3">
        {schedule.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`flex flex-col gap-3 rounded-3xl border border-border/80 bg-background/80 p-4 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-11 w-11 rounded-2xl bg-accent-neon/10 text-accent-neon">
                  <Clock3 size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted mt-1">{item.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${PRIORITY_STYLES[item.priority]}`}>{item.priority}</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Bell size={14} className="text-accent-neon" />
                <span>{item.details}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${STATUS_STYLES[item.status]}`}>
                  {item.status}
                </span>
                <button
                  type="button"
                  onClick={() => completeScheduleItem(item.id)}
                  disabled={item.status === 'completed'}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${item.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 cursor-default'
                    : 'bg-accent-neon/10 text-accent-neon border border-accent-neon/20 hover:bg-accent-neon/15'}`}
                >
                  <CheckCircle2 size={14} />
                  {item.status === 'missed' ? 'Mark complete' : item.actionLabel}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted">
        <span>{completedCount} / {schedule.length} tasks completed</span>
        {schedule.some(item => item.status === 'missed') ? (
          <span className="text-red-300">Some tasks need attention</span>
        ) : (
          <span className="text-emerald-300">Keep going — you're on track</span>
        )}
      </div>
    </div>
  );
};

export default SchedulePanel;
