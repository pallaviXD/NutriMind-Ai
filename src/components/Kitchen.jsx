import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Sparkles, ShoppingCart, RefreshCw, Clock, Flame, Zap, Plus, X } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';

const Kitchen = () => {
  const { pantry, setPantry, macros, calories, healthProfile } = useGlobalState();
  const { profile } = useAuth();
  const [newItem, setNewItem] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState('lunch');
  const [error, setError] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setPantry([...pantry, newItem.trim()]);
    setNewItem('');
  };

  const generateRecipe = async () => {
    setLoading(true);
    setError('');
    setRecipe(null);
    const token = localStorage.getItem('nm_token');
    const calsLeft = Math.max(0, calories.target - calories.current);
    const proteinLeft = Math.max(0, macros.targetProtein - macros.protein);
    const goal = healthProfile?.goal || profile?.health_goal || 'general';

    try {
      const res = await fetch('/api/user/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pantry, mealType, calsLeft, proteinLeft, goal }),
      });
      const data = await res.json();
      if (data.recipe) setRecipe(data.recipe);
      else setError(data.error || 'Failed to generate recipe');
    } catch (e) {
      setError('Connection error. Make sure the server is running.');
    }
    setLoading(false);
  };

  return (
    <div className="h-full p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">

      {/* Left: Pantry */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-0">
        <div className="glass-panel p-5 flex flex-col flex-1 overflow-hidden">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 shrink-0">
            <ShoppingCart size={20} className="text-accent-cyan" /> My Pantry
          </h2>

          <form onSubmit={handleAddItem} className="flex gap-2 mb-4 shrink-0">
            <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
              placeholder="Add ingredient..."
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent-cyan/60 text-foreground placeholder:text-muted/50"
            />
            <button type="submit" className="p-2 bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 rounded-xl transition-colors">
              <Plus size={18} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {pantry.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-background/50 border border-border/50 group hover:border-accent-cyan/30 transition-colors">
                <span className="text-sm font-medium">{item}</span>
                <button onClick={() => setPantry(pantry.filter((_, i) => i !== idx))}
                  className="text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                  <X size={14} />
                </button>
              </div>
            ))}
            {pantry.length === 0 && (
              <p className="text-muted text-sm text-center py-8">Add ingredients to your pantry</p>
            )}
          </div>
        </div>

        {/* Meal type selector */}
        <div className="glass-panel p-4 shrink-0">
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3">Generate for</p>
          <div className="grid grid-cols-2 gap-2">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(t => (
              <button key={t} onClick={() => setMealType(t)}
                className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all border
                  ${mealType === t ? 'bg-accent-purple/20 border-accent-purple text-accent-purple' : 'border-border text-muted hover:border-foreground/30'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Recipe */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 min-h-0">

        {/* Header bar */}
        <div className="glass-panel p-4 border-l-4 border-l-accent-purple flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Remaining today</p>
            <div className="flex gap-4 text-sm">
              <span className="text-accent-neon font-bold">{Math.max(0, calories.target - calories.current)} kcal</span>
              <span className="text-accent-cyan font-bold">{Math.max(0, macros.targetProtein - macros.protein)}g protein</span>
              <span className="text-accent-purple font-bold">{Math.max(0, macros.targetCarbs - macros.carbs)}g carbs</span>
            </div>
          </div>
          <button onClick={generateRecipe} disabled={loading || pantry.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-accent-purple to-accent-neon text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>
        </div>

        {/* Recipe card */}
        <div className="glass-panel p-6 flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
                <p className="text-accent-purple animate-pulse text-sm">AI Chef is crafting your recipe…</p>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full">
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {recipe && !loading && (
              <motion.div key="recipe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Title */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <ChefHat size={24} className="text-accent-purple" /> {recipe.name}
                    </h2>
                    <p className="text-muted text-sm mt-1">{recipe.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Flame size={14} />, label: 'Calories', val: `${recipe.calories} kcal`, color: 'text-orange-400' },
                    { icon: <Zap size={14} />, label: 'Protein', val: `${recipe.protein}g`, color: 'text-accent-neon' },
                    { icon: <Zap size={14} />, label: 'Carbs', val: `${recipe.carbs}g`, color: 'text-accent-purple' },
                    { icon: <Clock size={14} />, label: 'Time', val: recipe.time, color: 'text-accent-cyan' },
                  ].map((s, i) => (
                    <div key={i} className="bg-background/50 border border-border/50 rounded-xl p-3 text-center">
                      <div className={`flex items-center justify-center gap-1 ${s.color} mb-1`}>{s.icon}</div>
                      <div className="text-xs text-muted">{s.label}</div>
                      <div className="font-bold text-sm text-foreground">{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted mb-3">Ingredients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recipe.ingredients?.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-background/30 rounded-lg px-3 py-2 border border-border/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-neon shrink-0" />
                        {ing}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {recipe.steps?.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground/90">
                        <span className="w-6 h-6 rounded-full bg-accent-purple/20 border border-accent-purple/40 text-accent-purple text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                {recipe.tips && (
                  <div className="bg-accent-neon/5 border border-accent-neon/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-accent-neon uppercase tracking-wider mb-1">💡 Chef's Tip</p>
                    <p className="text-sm text-foreground/80">{recipe.tips}</p>
                  </div>
                )}
              </motion.div>
            )}

            {!recipe && !loading && !error && (
              <motion.div key="empty" className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <ChefHat size={56} className="text-muted/20" />
                <p className="text-muted text-sm">Add ingredients to your pantry and click<br /><span className="text-accent-purple font-semibold">Generate Recipe</span> to get a personalized meal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
