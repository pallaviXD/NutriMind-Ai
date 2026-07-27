import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Activity,
  Brain,
  ChefHat,
  BarChart3,
  Dumbbell,
  Droplets,
  MessageSquare,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Flame,
  Heart,
  Pill,
  User,
  ChevronDown,
  Star,
  Sparkles,
} from "lucide-react";
import { SmokeBackground } from "../components/ui/SmokeBackground";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <MessageSquare size={22} />,
    title: "AI Chat Coach",
    desc: 'Log meals in plain English. "I had idli sambar for breakfast" — AI parses, estimates calories, and updates your dashboard instantly.',
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
    accent: "text-sky-400",
  },
  {
    icon: <ChefHat size={22} />,
    title: "AI Kitchen",
    desc: "Tell the AI what's in your pantry. It generates a full recipe with macros, cook time, and step-by-step instructions tailored to your goal.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    accent: "text-violet-400",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Real Analytics",
    desc: "Charts powered by your actual data — calorie trends, macro breakdowns, weight history, and logging streak. No fake placeholder numbers.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
  },
  {
    icon: <Brain size={22} />,
    title: "Health Intelligence",
    desc: "Set your conditions — diabetes, cardiac, PCOS, thyroid. AI adapts every suggestion, flags risky foods, and gives condition-specific advice.",
    color: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/30",
    accent: "text-pink-400",
  },
  {
    icon: <Dumbbell size={22} />,
    title: "Workout Planner",
    desc: "AI-generated 7-day workout plans based on your body stats, goal, and health conditions. Cached so it's instant on repeat visits.",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    accent: "text-orange-400",
  },
  {
    icon: <Droplets size={22} />,
    title: "Full Tracking Suite",
    desc: "Weight logs with trend charts, water intake tracker, BMI/BMR/TDEE calculator, and ideal weight range — all from your profile.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    accent: "text-cyan-400",
  },
];

const GOALS = [
  {
    icon: <Dumbbell size={20} />,
    label: "Gym & Muscle",
    desc: "High protein, caloric surplus",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  {
    icon: <Activity size={20} />,
    label: "Weight Loss",
    desc: "Caloric deficit, fat-loss mode",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
  },
  {
    icon: <Pill size={20} />,
    label: "Diabetes Care",
    desc: "Low-GI, blood sugar management",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    icon: <Heart size={20} />,
    label: "Cardiac Health",
    desc: "Low sodium, DASH diet",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/30",
  },
  {
    icon: <User size={20} />,
    label: "General Wellness",
    desc: "Balanced everyday nutrition",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
];

const CHAT_DEMO = [
  {
    role: "user",
    text: "I had 2 rotis with dal and a glass of buttermilk for lunch",
  },
  {
    role: "ai",
    text: "✅ Logged **Roti + Dal + Buttermilk** → ~**485 kcal** added to Lunch\n\n• Protein: +18g  • Carbs: +72g  • Fat: +9g\n\n**1,215 / 2,000 kcal** consumed today. You're on track — great balanced meal! 💪",
  },
  {
    role: "user",
    text: "What should I have for dinner given I want to hit my protein goal?",
  },
  {
    role: "ai",
    text: "🎯 You need **~52g more protein** tonight. I'd suggest:\n\n• **Grilled chicken breast** (200g) — 46g protein, 330 kcal\n• Pair with **steamed broccoli + brown rice** for complete macros\n\nWant me to generate a full recipe from your pantry? 🍽️",
  },
];

const STATS = [
  { value: "3.3 70B", label: "Llama Model", sub: "via Groq" },
  { value: "< 1s", label: "AI Response", sub: "avg latency" },
  { value: "6", label: "Health Modes", sub: "fully personalized" },
  { value: "100%", label: "Free", sub: "no credit card" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={24} className="text-accent-neon" />
          <span className="text-xl font-bold">
            NutriMind <span className="text-accent-purple">OS</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-foreground transition-colors"
          >
            How it works
          </a>
          <a href="#goals" className="hover:text-foreground transition-colors">
            Health Goals
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-muted hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-gradient-to-r from-accent-neon to-accent-purple text-white px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

const ChatBubble = ({ msg, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.15 }}
    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
  >
    {msg.role === "ai" && (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-neon to-accent-purple flex items-center justify-center shrink-0 mt-0.5">
        <Brain size={13} className="text-white" />
      </div>
    )}
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
        msg.role === "user"
          ? "bg-accent-neon/20 border border-accent-neon/30 text-foreground rounded-tr-sm"
          : "bg-panel border border-border text-foreground rounded-tl-sm"
      }`}
    >
      {msg.text.replace(/\*\*(.*?)\*\*/g, "$1")}
    </div>
  </motion.div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <NavBar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* WebGL Smoke background */}
        <div className="absolute inset-0 z-0">
          <SmokeBackground smokeColor="#8b5cf6" />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background/60 via-transparent to-background/60 pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-accent-purple/15 border border-accent-purple/30 rounded-full px-4 py-1.5 text-xs font-semibold text-accent-purple mb-8"
          >
            <Sparkles size={12} />
            Powered by Llama 3.3 70B via Groq
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6"
          >
            Your Personal
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-neon via-accent-purple to-pink-400">
              AI Health OS
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Log meals in plain language, get AI-generated recipes from your
            pantry, track real nutrition data, and receive personalized health
            advice — all tuned to your body and health conditions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="group flex items-center gap-2 bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold px-8 py-4 rounded-2xl text-base hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
            >
              Start for Free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border border-border text-muted hover:text-foreground hover:border-foreground/30 font-medium px-8 py-4 rounded-2xl text-base transition-all"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xs text-muted/60 flex items-center justify-center gap-1"
          >
            <CheckCircle2 size={12} className="text-emerald-400" />
            Free forever · No credit card · No setup fees
          </motion.p>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="text-muted/40"
            >
              <ChevronDown size={24} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-panel/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-black text-gradient">
                {s.value}
              </div>
              <div className="text-sm font-semibold text-foreground mt-0.5">
                {s.label}
              </div>
              <div className="text-xs text-muted">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CHAT DEMO ────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-6 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-accent-neon/10 border border-accent-neon/20 rounded-full px-3 py-1 text-xs font-semibold text-accent-neon mb-4">
              <Zap size={11} /> How it works
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Just talk to it
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              No forms, no manual entry. Chat naturally and the AI handles the
              rest.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Chat window */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-5 space-y-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <div className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" />
                <span className="text-xs font-semibold text-accent-neon">
                  NutriMind AI
                </span>
                <span className="ml-auto text-xs text-muted">Online</span>
              </div>
              {CHAT_DEMO.map((msg, i) => (
                <ChatBubble key={i} msg={msg} index={i} />
              ))}
            </motion.div>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  n: "01",
                  title: "Set up your profile",
                  desc: "Enter height, weight, age, activity level, and health conditions. Takes 60 seconds.",
                },
                {
                  n: "02",
                  title: "Chat naturally",
                  desc: "Tell the AI what you ate, ask for recipes, request health advice — in any language.",
                },
                {
                  n: "03",
                  title: "Watch your dashboard update",
                  desc: "Calories, macros, meal cards, and insights update in real time as you chat.",
                },
                {
                  n: "04",
                  title: "Track your progress",
                  desc: "Analytics show real trends from your data. Weight, streaks, macro history — all yours.",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-neon/20 to-accent-purple/20 border border-accent-neon/20 flex items-center justify-center shrink-0 text-xs font-black text-accent-neon">
                    {step.n}
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-0.5">{step.title}</div>
                    <div className="text-sm text-muted leading-relaxed">
                      {step.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-panel/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/20 rounded-full px-3 py-1 text-xs font-semibold text-accent-purple mb-4">
              <Sparkles size={11} /> Everything you need
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              One platform, total health clarity
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Every feature is connected — AI chat updates your analytics, your
              profile shapes AI responses, your pantry drives your recipes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`glass-panel p-6 bg-gradient-to-br ${f.color} border ${f.border} hover:scale-[1.02] transition-transform duration-200`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center mb-4 ${f.accent}`}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HEALTH GOALS ─────────────────────────────────────────────────── */}
      <section id="goals" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
              <Heart size={11} /> Built for your condition
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Not a generic calorie counter
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              NutriMind adapts entirely to your health goal — different calorie
              targets, macro ratios, food restrictions, and AI guidance for
              each.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {GOALS.map((g, i) => (
              <motion.div
                key={g.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r ${g.bg} hover:scale-[1.02] transition-transform`}
              >
                <span className={g.color}>{g.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{g.label}</div>
                  <div className="text-xs text-muted">{g.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY STRIP ───────────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-border bg-panel/30">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-muted">
          {[
            { icon: <Shield size={15} />, text: "JWT auth + bcrypt hashing" },
            { icon: <Zap size={15} />, text: "Rate limiting on all routes" },
            {
              icon: <CheckCircle2 size={15} />,
              text: "No API keys in the browser",
            },
            { icon: <Star size={15} />, text: "Parameterized SQL queries" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-muted/70"
            >
              <span className="text-accent-neon/70">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Ready to take control
            <br />
            <span className="text-gradient">of your health?</span>
          </h2>
          <p className="text-muted mb-10 text-lg">
            Free forever. Set up in 60 seconds. No credit card needed.
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold px-10 py-5 rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
          >
            <Flame size={20} />
            Start Your Health Journey
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-accent-neon" />
            <span className="font-bold text-foreground">NutriMind OS</span>
            <span>— AI-Powered Health Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="hover:text-foreground transition-colors"
            >
              Sign Up
            </Link>
            <a
              href="https://github.com/pallaviXD/NutriMind-Ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
          <div>Built with Groq · Llama 3.3 70B · React · Express</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
