import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles, ShoppingCart, RefreshCw } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const Kitchen = () => {
  const { pantry, setPantry, macros, isAnalyzing, processUserInput, chatHistory } = useGlobalState();
  const [newItem, setNewItem] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setPantry([...pantry, newItem]);
    setNewItem('');
  };

  const handleRemoveItem = (index) => {
    setPantry(pantry.filter((_, i) => i !== index));
  };

  const generateRecipe = () => {
    processUserInput("what should i eat");
  };

  // Find the latest AI response in chat history that looks like a recipe (contains numbers/lists)
  const latestAiResponse = [...chatHistory].reverse().find(msg => msg.role === 'ai')?.text;
  const isRecipe = latestAiResponse?.includes('1.') || latestAiResponse?.includes('recommend');

  return (
    <div className="h-full p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* Left: Pantry Management */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="glass-panel p-5 flex flex-col h-full overflow-hidden">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <ShoppingCart className="text-accent-cyan" /> Neural Pantry
          </h2>
          
          <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newItem} 
              onChange={(e) => setNewItem(e.target.value)} 
              placeholder="Add ingredient..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-cyan"
            />
            <button type="submit" className="bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 px-3 rounded-lg transition-colors">
              Add
            </button>
          </form>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {pantry.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 group hover:border-accent-cyan/30 transition-colors">
                <span className="text-sm font-medium">{item}</span>
                <button onClick={() => handleRemoveItem(idx)} className="text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: AI Chef */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        
        {/* Macro Context Header */}
        <div className="glass-panel p-5 border-l-4 border-l-accent-purple flex items-center justify-between">
           <div>
             <h3 className="text-sm uppercase tracking-wider text-muted font-bold mb-1">Macro Constraints Active</h3>
             <p className="text-sm text-foreground/80">
               Targeting remaining macros: <span className="text-accent-neon font-bold">{Math.max(0, macros.targetProtein - macros.protein)}g Protein</span>, <span className="text-accent-purple font-bold">{Math.max(0, macros.targetCarbs - macros.carbs)}g Carbs</span>
             </p>
           </div>
           <button 
             onClick={generateRecipe}
             disabled={isAnalyzing}
             className="flex items-center gap-2 bg-accent-purple text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
           >
             {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
             Generate Recipe
           </button>
        </div>

        {/* Recipe Display */}
        <div className="glass-panel p-8 flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/5 to-transparent pointer-events-none" />
          
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 relative z-10">
            <ChefHat className="text-accent-purple" size={28} /> Generated Blueprint
          </h2>

          <div className="relative z-10">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
                <p className="text-accent-purple animate-pulse">Cross-referencing pantry with nutritional targets...</p>
              </div>
            ) : isRecipe ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert max-w-none"
              >
                {latestAiResponse.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-foreground/90 leading-relaxed text-lg">{line}</p>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted text-center space-y-2">
                <ChefHat size={48} className="opacity-20 mb-2" />
                <p>Click "Generate Recipe" to have the AI analyze your pantry and remaining macros.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Kitchen;
