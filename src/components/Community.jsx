import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Trophy, Swords, Share2, UserPlus, UserCheck, UserX,
  Search, Loader2, Plus, X, ChevronRight, Medal, Flame, Check,
  Clock, Globe, Lock
} from 'lucide-react';
import { motion as FramerMotion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const TOKEN = () => localStorage.getItem('nm_token');

async function api(path, opts = {}) {
  const res = await fetch(`/api/social${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json', ...opts.headers }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

const TABS = [
  { id: 'friends',    label: 'Friends',    icon: <Users size={16} /> },
  { id: 'challenges', label: 'Challenges', icon: <Swords size={16} /> },
  { id: 'leaderboard',label: 'Leaderboard',icon: <Trophy size={16} /> },
  { id: 'feed',       label: 'Activity',   icon: <Share2 size={16} /> },
];

const GOAL_TYPES = [
  { value: 'calories', label: 'Log calories' },
  { value: 'meals',    label: 'Log meals' },
  { value: 'protein',  label: 'Hit protein goal (g)' },
  { value: 'streak',   label: 'Daily streak (days)' },
];

const SHARE_TYPES = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'meal',      label: 'Meal' },
  { value: 'workout',   label: 'Workout' },
  { value: 'weight',    label: 'Weight update' },
  { value: 'challenge', label: 'Challenge progress' },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-panel/60 border border-border rounded-2xl p-5 ${className}`}>{children}</div>
);

const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center gap-3 py-12">
    <Loader2 size={28} className="animate-spin text-accent-neon" />
    <p className="text-muted text-sm">{label}</p>
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center gap-2 py-10 text-muted">
    <div className="text-3xl">{icon}</div>
    <p className="text-sm">{message}</p>
  </div>
);

const ErrorBanner = ({ msg, onDismiss }) => (
  <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
    <span>{msg}</span>
    <button onClick={onDismiss}><X size={14} /></button>
  </div>
);

const rankBadge = (rank) => {
  if (rank === 1) return <Medal size={16} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={16} className="text-slate-300" />;
  if (rank === 3) return <Medal size={16} className="text-amber-600" />;
  return <span className="text-xs text-muted font-mono w-4 text-center">#{rank}</span>;
};

const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const daysLeft = (end_ts) => {
  const diff = end_ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400);
  const hrs = Math.floor((diff % 86400) / 3600);
  return days > 0 ? `${days}d left` : `${hrs}h left`;
};

// ─── Friends Tab ───────────────────────────────────────────────────────────────

const FriendsTab = ({ currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, r] = await Promise.all([api('/friends'), api('/friend-requests')]);
      setFriends(f);
      setRequests(r);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchQ.trim().length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api(`/users?q=${encodeURIComponent(searchQ.trim())}`);
        setSearchResults(res);
      } catch (e) { /* silent */ }
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQ]);

  const sendRequest = async (receiverId) => {
    try {
      await api('/friend-requests', { method: 'POST', body: JSON.stringify({ receiver_id: receiverId }) });
      setSearchResults(prev => prev.map(u => u.id === receiverId ? { ...u, friendship_status: 'pending', direction: 'sent' } : u));
    } catch (e) { setError(e.message); }
  };

  const respond = async (requestId, action) => {
    try {
      await api(`/friend-requests/${requestId}`, { method: 'PUT', body: JSON.stringify({ action }) });
      setRequests(prev => prev.filter(r => r.id !== requestId));
      if (action === 'accept') load();
    } catch (e) { setError(e.message); }
  };

  const removeFriend = async (friendId) => {
    try {
      await api(`/friends/${friendId}`, { method: 'DELETE' });
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (e) { setError(e.message); }
  };

  const friendIds = new Set(friends.map(f => f.id));

  return (
    <div className="flex flex-col gap-5">
      {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

      {/* Search */}
      <SectionCard>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><UserPlus size={15} className="text-accent-neon" /> Find People</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent-neon/50 transition-colors"
          />
          {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <FramerMotion.ul className="mt-3 flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {searchResults.map(u => (
                <li key={u.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-background/60 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </div>
                  {friendIds.has(u.id) ? (
                    <span className="text-xs text-accent-neon font-semibold flex items-center gap-1"><UserCheck size={13} /> Friends</span>
                  ) : u.friendship_status === 'pending' ? (
                    <span className="text-xs text-muted font-medium">{u.direction === 'sent' ? 'Request sent' : 'Pending'}</span>
                  ) : (
                    <button onClick={() => sendRequest(u.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-neon/15 border border-accent-neon/30 text-accent-neon text-xs font-semibold hover:bg-accent-neon/25 transition-colors">
                      <UserPlus size={13} /> Add
                    </button>
                  )}
                </li>
              ))}
            </FramerMotion.ul>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Incoming requests */}
      {requests.length > 0 && (
        <SectionCard>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <UserPlus size={15} className="text-accent-purple" />
            Friend Requests
            <span className="ml-auto bg-accent-purple/20 text-accent-purple text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {requests.map(r => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-background/60 border border-border/50">
                <div>
                  <p className="text-sm font-medium">{r.sender_name}</p>
                  <p className="text-xs text-muted">{formatDate(r.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respond(r.id, 'accept')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent-neon/15 border border-accent-neon/30 text-accent-neon text-xs font-semibold hover:bg-accent-neon/25 transition-colors">
                    <Check size={12} /> Accept
                  </button>
                  <button onClick={() => respond(r.id, 'reject')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors">
                    <X size={12} /> Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Friends list */}
      <SectionCard>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={15} className="text-accent-neon" /> Your Friends
          <span className="ml-auto text-xs text-muted">{friends.length} total</span>
        </h2>
        {loading ? <LoadingSpinner label="Loading friends..." /> : friends.length === 0 ? (
          <EmptyState icon="👋" message="No friends yet. Search above to connect!" />
        ) : (
          <ul className="flex flex-col gap-2">
            {friends.map(f => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-background/60 border border-border/50 group">
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted">Friends since {formatDate(f.friends_since)}</p>
                </div>
                <button onClick={() => removeFriend(f.id)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold transition-all">
                  <UserX size={12} /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
};

// ─── Challenges Tab ────────────────────────────────────────────────────────────

const ChallengesTab = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', goal_type: 'calories', goal_value: '', duration_days: 7 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/challenges');
      setChallenges(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const join = async (id) => {
    try {
      await api(`/challenges/${id}/join`, { method: 'POST' });
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, is_joined: 1 } : c));
    } catch (e) { setError(e.message); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.goal_value) return;
    setCreating(true);
    try {
      await api('/challenges', {
        method: 'POST',
        body: JSON.stringify({ ...form, goal_value: parseInt(form.goal_value) })
      });
      setForm({ title: '', description: '', goal_type: 'calories', goal_value: '', duration_days: 7 });
      setShowCreate(false);
      await load();
    } catch (e) { setError(e.message); }
    setCreating(false);
  };

  const goalLabel = (type, value) => {
    const map = { calories: `${value} kcal`, meals: `${value} meals`, protein: `${value}g protein`, streak: `${value} day streak` };
    return map[type] || `${value}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Active Challenges</h2>
        <button onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-neon/15 border border-accent-neon/30 text-accent-neon text-xs font-semibold hover:bg-accent-neon/25 transition-colors">
          <Plus size={13} /> New Challenge
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <FramerMotion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <SectionCard>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Swords size={14} className="text-accent-neon" /> Create a Challenge</h3>
              <form onSubmit={create} className="flex flex-col gap-3">
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Challenge title"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent-neon/50 transition-colors" />
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional)" rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted resize-none focus:outline-none focus:border-accent-neon/50 transition-colors" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Goal type</label>
                    <select value={form.goal_type} onChange={e => setForm(f => ({ ...f, goal_type: e.target.value }))}
                      className="px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent-neon/50 transition-colors">
                      {GOAL_TYPES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Goal value</label>
                    <input required type="number" min={1} value={form.goal_value} onChange={e => setForm(f => ({ ...f, goal_value: e.target.value }))}
                      placeholder="e.g. 2000"
                      className="px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent-neon/50 transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted">Duration: {form.duration_days} days</label>
                  <input type="range" min={1} max={30} value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) }))}
                    className="accent-[var(--color-accent-neon,#39ff14)]" />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="px-4 py-2 rounded-xl text-muted text-sm hover:text-foreground transition-colors">Cancel</button>
                  <button type="submit" disabled={creating}
                    className="px-4 py-2 rounded-xl bg-accent-neon/20 border border-accent-neon/40 text-accent-neon text-sm font-semibold hover:bg-accent-neon/30 transition-colors disabled:opacity-50">
                    {creating ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
                  </button>
                </div>
              </form>
            </SectionCard>
          </FramerMotion.div>
        )}
      </AnimatePresence>

      {loading ? <LoadingSpinner label="Loading challenges..." /> : challenges.length === 0 ? (
        <EmptyState icon="🏆" message="No active challenges. Create one to get started!" />
      ) : (
        <div className="flex flex-col gap-3">
          {challenges.map(c => {
            const progress = c.is_joined ? Math.min(100, Math.round((c.my_progress || 0) / c.goal_value * 100)) : 0;
            return (
              <SectionCard key={c.id}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{c.title}</p>
                    {c.description && <p className="text-xs text-muted mt-0.5 line-clamp-2">{c.description}</p>}
                    <p className="text-xs text-muted mt-1">by {c.creator_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={11} /> {daysLeft(c.end_date)}
                    </span>
                    <span className="text-xs text-muted">{c.participant_count} joined</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  <Flame size={12} className="text-accent-neon" />
                  Goal: <span className="text-foreground font-medium">{goalLabel(c.goal_type, c.goal_value)}</span>
                </div>

                {c.is_joined ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Your progress</span>
                      <span className="text-accent-neon font-semibold">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
                      <div className="h-full bg-accent-neon rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    {c.my_completed ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-semibold mt-1"><Check size={12} /> Completed!</span>
                    ) : null}
                  </div>
                ) : (
                  <button onClick={() => join(c.id)}
                    className="w-full py-2 rounded-xl bg-accent-neon/15 border border-accent-neon/30 text-accent-neon text-xs font-semibold hover:bg-accent-neon/25 transition-colors flex items-center justify-center gap-1.5">
                    <ChevronRight size={13} /> Join Challenge
                  </button>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────

const LeaderboardTab = ({ currentUser }) => {
  const [data, setData] = useState(null);
  const [type, setType] = useState('calories');
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api(`/leaderboard?type=${type}&period=${period}`)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [type, period]);

  const typeLabels = { calories: 'Calories Tracked', meals: 'Meals Logged', streak: 'Active Days' };

  return (
    <div className="flex flex-col gap-5">
      {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

      <SectionCard>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1" role="group" aria-label="Metric type">
            {Object.entries(typeLabels).map(([v, l]) => (
              <button key={v} onClick={() => setType(v)} aria-pressed={type === v}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                  ${type === v ? 'bg-accent-neon/20 border-accent-neon text-accent-neon' : 'border-border text-muted hover:border-foreground/30'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-auto" role="group" aria-label="Period">
            {['week', 'month'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} aria-pressed={period === p}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                  ${period === p ? 'bg-accent-purple/20 border-accent-purple text-accent-purple' : 'border-border text-muted hover:border-foreground/30'}`}>
                {p === 'week' ? '7 days' : '30 days'}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {loading ? <LoadingSpinner label="Calculating rankings..." /> : !data?.entries?.length ? (
        <EmptyState icon="📊" message="No data yet. Start logging to appear on the leaderboard!" />
      ) : (
        <SectionCard>
          <ul className="flex flex-col gap-2">
            {data.entries.map((entry) => {
              const isMe = entry.id === currentUser?.id;
              return (
                <FramerMotion.li key={entry.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors
                    ${isMe ? 'bg-accent-neon/10 border-accent-neon/30' : 'bg-background/40 border-border/50'}`}>
                  <div className="w-6 flex justify-center">{rankBadge(entry.rank)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-accent-neon' : ''}`}>
                      {entry.name}{isMe ? ' (You)' : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    {type === 'streak' ? `${entry.score}d` : type === 'calories' ? `${(entry.score || 0).toLocaleString()} kcal` : `${entry.score}`}
                  </span>
                </FramerMotion.li>
              );
            })}
          </ul>

          {data.myRank && (
            <div className="mt-4 pt-4 border-t border-border/50 text-center text-xs text-muted">
              Your rank: <span className="text-foreground font-semibold">#{data.myRank.rank}</span> of {data.entries.length}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
};

// ─── Activity Feed Tab ────────────────────────────────────────────────────────

const FeedTab = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ share_type: 'milestone', text: '', visibility: 'friends' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/feed');
      setPosts(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    setPosting(true);
    try {
      await api('/feed', {
        method: 'POST',
        body: JSON.stringify({ share_type: form.share_type, content: { text: form.text.trim() }, visibility: form.visibility })
      });
      setForm({ share_type: 'milestone', text: '', visibility: 'friends' });
      setShowShare(false);
      await load();
    } catch (e) { setError(e.message); }
    setPosting(false);
  };

  const shareTypeIcon = (t) => {
    const icons = { milestone: '🏆', meal: '🍽️', workout: '💪', weight: '⚖️', challenge: '🎯' };
    return icons[t] || '📣';
  };

  return (
    <div className="flex flex-col gap-5">
      {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Community Activity</h2>
        <button onClick={() => setShowShare(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-neon/15 border border-accent-neon/30 text-accent-neon text-xs font-semibold hover:bg-accent-neon/25 transition-colors">
          <Share2 size={13} /> Share
        </button>
      </div>

      <AnimatePresence>
        {showShare && (
          <FramerMotion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <SectionCard>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Share2 size={14} className="text-accent-neon" /> Share Progress</h3>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Type</label>
                    <select value={form.share_type} onChange={e => setForm(f => ({ ...f, share_type: e.target.value }))}
                      className="px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent-neon/50 transition-colors">
                      {SHARE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Visibility</label>
                    <select value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                      className="px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent-neon/50 transition-colors">
                      <option value="friends">Friends only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
                <textarea required value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="What did you achieve? Share with the community..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder-muted resize-none focus:outline-none focus:border-accent-neon/50 transition-colors" />
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowShare(false)}
                    className="px-4 py-2 rounded-xl text-muted text-sm hover:text-foreground transition-colors">Cancel</button>
                  <button type="submit" disabled={posting}
                    className="px-4 py-2 rounded-xl bg-accent-neon/20 border border-accent-neon/40 text-accent-neon text-sm font-semibold hover:bg-accent-neon/30 transition-colors disabled:opacity-50">
                    {posting ? <Loader2 size={14} className="animate-spin" /> : 'Post'}
                  </button>
                </div>
              </form>
            </SectionCard>
          </FramerMotion.div>
        )}
      </AnimatePresence>

      {loading ? <LoadingSpinner label="Loading activity..." /> : posts.length === 0 ? (
        <EmptyState icon="📡" message="Nothing here yet. Be the first to share your progress!" />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(p => (
            <SectionCard key={p.id}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-neon/10 border border-accent-neon/20 flex items-center justify-center text-sm shrink-0">
                  {shareTypeIcon(p.share_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{p.author_name}</span>
                    {p.user_id === currentUser?.id && (
                      <span className="text-[10px] bg-accent-neon/10 text-accent-neon px-1.5 py-0.5 rounded-full font-semibold">You</span>
                    )}
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted">
                      {p.visibility === 'public' ? <Globe size={10} /> : <Lock size={10} />}
                      {formatDate(p.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{p.content?.text}</p>
                  <span className="mt-1.5 inline-flex text-[10px] text-muted bg-background/60 border border-border/50 rounded-full px-2 py-0.5 capitalize">{p.share_type}</span>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Community Page ──────────────────────────────────────────────────────

const Community = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto" role="main" aria-label="Community">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-accent-neon" size={24} /> Community
        </h1>
        <p className="text-muted text-sm mt-0.5">Connect, compete, and share your health journey</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 shrink-0 bg-panel/40 border border-border rounded-2xl p-1" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={activeTab === t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all
              ${activeTab === t.id ? 'bg-accent-neon/15 text-accent-neon border border-accent-neon/30' : 'text-muted hover:text-foreground'}`}>
            {t.icon} <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <FramerMotion.div key={activeTab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          role="tabpanel" aria-label={activeTab}
          className="flex-1 min-h-0">
          {activeTab === 'friends'     && <FriendsTab currentUser={user} />}
          {activeTab === 'challenges'  && <ChallengesTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab currentUser={user} />}
          {activeTab === 'feed'        && <FeedTab currentUser={user} />}
        </FramerMotion.div>
      </AnimatePresence>
    </div>
  );
};

export default Community;
