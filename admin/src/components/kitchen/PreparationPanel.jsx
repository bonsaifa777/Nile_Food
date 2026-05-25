import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiCircle, FiClock, FiChevronRight, FiThermometer, FiDroplet, FiAlertCircle } from 'react-icons/fi';
import { useOrders } from '../../hooks/useDataService';

const recipeTemplates = {
  'Grilled Salmon': {
    steps: [
      { step: 1, instruction: 'Season salmon with salt, pepper, and herbs', timer: 2 },
      { step: 2, instruction: 'Preheat grill to medium-high heat (400°F)', timer: 3 },
      { step: 3, instruction: 'Oil the grill grates and place salmon skin-side down', timer: 1 },
      { step: 4, instruction: 'Grill salmon for 4-5 minutes per side', timer: 5 },
      { step: 5, instruction: 'Check internal temperature reaches 145°F', timer: 1 },
      { step: 6, instruction: 'Rest for 2 minutes before serving', timer: 2 },
    ],
    plating: 'Serve on a white plate with lemon wedge and dill garnish',
    tempTarget: 145,
  },
  'Beef Tenderloin': {
    steps: [
      { step: 1, instruction: 'Season beef with salt, pepper, and rosemary', timer: 2 },
      { step: 2, instruction: 'Sear in hot pan with butter for 2 min each side', timer: 4 },
      { step: 3, instruction: 'Roast in oven at 400°F', timer: 12 },
      { step: 4, instruction: 'Check internal temperature reaches 135°F for medium', timer: 1 },
      { step: 5, instruction: 'Rest for 5 minutes before slicing', timer: 5 },
    ],
    plating: 'Slice against grain, serve with roasted vegetables and jus',
    tempTarget: 135,
  },
  'Lobster Bisque': {
    steps: [
      { step: 1, instruction: 'Sauté lobster shells in butter', timer: 3 },
      { step: 2, instruction: 'Add mirepoix and cook until softened', timer: 5 },
      { step: 3, instruction: 'Add tomato paste and cook 2 minutes', timer: 2 },
      { step: 4, instruction: 'Pour in stock and cream, simmer', timer: 10 },
      { step: 5, instruction: 'Blend until smooth and season', timer: 3 },
    ],
    plating: 'Serve in warm bowl with croutons and chive oil',
    tempTarget: 165,
  },
  'Chocolate Lava Cake': {
    steps: [
      { step: 1, instruction: 'Melt chocolate and butter together', timer: 3 },
      { step: 2, instruction: 'Whisk eggs and sugar until fluffy', timer: 4 },
      { step: 3, instruction: 'Fold chocolate into egg mixture', timer: 2 },
      { step: 4, instruction: 'Pour into greased ramekins', timer: 1 },
      { step: 5, instruction: 'Bake at 400°F for 12-14 minutes', timer: 13 },
    ],
    plating: 'Invert onto plate, dust with powdered sugar, add ice cream',
    tempTarget: 175,
  },
  'Caesar Salad': {
    steps: [
      { step: 1, instruction: 'Wash and chop romaine lettuce', timer: 2 },
      { step: 2, instruction: 'Prepare Caesar dressing', timer: 3 },
      { step: 3, instruction: 'Toast croutons in oven', timer: 5 },
      { step: 4, instruction: 'Shave parmesan cheese', timer: 1 },
      { step: 5, instruction: 'Toss everything together', timer: 1 },
    ],
    plating: 'Serve chilled in wooden bowl with extra parmesan',
    tempTarget: 40,
  },
  'Default': {
    steps: [
      { step: 1, instruction: 'Prepare mis en place', timer: 3 },
      { step: 2, instruction: 'Cook according to recipe specifications', timer: 10 },
      { step: 3, instruction: 'Plate and garnish', timer: 3 },
    ],
    plating: 'Present on clean plate with appropriate garnish',
    tempTarget: 165,
  },
};

function getRecipe(foodName) {
  for (const [key, recipe] of Object.entries(recipeTemplates)) {
    if (foodName.toLowerCase().includes(key.toLowerCase())) return recipe;
  }
  return recipeTemplates['Default'];
}

function getIngredients(foodName) {
  const map = {
    'Salmon': [
      { item: 'Salmon Fillet', amount: '200g', available: true },
      { item: 'Olive Oil', amount: '2 tbsp', available: true },
      { item: 'Lemon', amount: '1/2', available: true },
      { item: 'Garlic', amount: '2 cloves', available: true },
    ],
    'Beef': [
      { item: 'Beef Tenderloin', amount: '250g', available: true },
      { item: 'Butter', amount: '2 tbsp', available: true },
      { item: 'Rosemary', amount: '1 sprig', available: true },
    ],
    'Lobster': [
      { item: 'Lobster', amount: '1 whole', available: true },
      { item: 'Cream', amount: '100ml', available: true },
      { item: 'Butter', amount: '50g', available: true },
    ],
    'Chocolate': [
      { item: 'Dark Chocolate', amount: '100g', available: true },
      { item: 'Butter', amount: '80g', available: true },
      { item: 'Eggs', amount: '3', available: true },
      { item: 'Sugar', amount: '50g', available: true },
    ],
    'Salad': [
      { item: 'Romaine Lettuce', amount: '1 head', available: true },
      { item: 'Parmesan', amount: '30g', available: true },
      { item: 'Croutons', amount: '50g', available: true },
    ],
  };
  for (const [key, ing] of Object.entries(map)) {
    if (foodName.toLowerCase().includes(key.toLowerCase())) return ing;
  }
  return [{ item: 'Main Ingredient', amount: 'As needed', available: true }];
}

export default function PreparationPanel() {
  const orders = useOrders();
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeStep, setActiveStep] = useState(1);
  const [prepTimers, setPrepTimers] = useState({});

  const activeOrders = orders.filter(o => o.status === 'preparing' || o.status === 'cooking');
  const activeItems = activeOrders.flatMap(o =>
    (o.items || []).map(item => ({
      ...item,
      orderId: o.id,
      orderStatus: o.status,
      orderCustomer: o.customer,
      timeElapsed: o.timeElapsed || 0,
    }))
  );

  const prepSteps = activeItems.slice(0, 3).map(item => {
    const recipe = getRecipe(item.name);
    const progress = Math.min(95, Math.floor(((item.timeElapsed || 0) / 25) * 100));
    const currentStepIdx = Math.min(
      Math.floor((item.timeElapsed || 0) / 5),
      recipe.steps.length - 1
    );
    return {
      order: item.orderId,
      recipe: item.name,
      progress,
      currentStep: recipe.steps[currentStepIdx]?.instruction?.split('.')[0] || 'Prepping',
      timeLeft: Math.max(1, 25 - (item.timeElapsed || 0)),
      customer: item.orderCustomer,
    };
  });

  const currentPrep = prepSteps[0] || null;

  useEffect(() => {
    if (currentPrep && currentPrep.recipe !== activeRecipe) {
      setActiveRecipe(currentPrep.recipe);
      setCompletedSteps(new Set());
      setActiveStep(1);
      setPrepTimers({});
    }
  }, [currentPrep?.recipe]);

  const recipe = activeRecipe ? getRecipe(activeRecipe) : null;
  const ingredients = activeRecipe ? getIngredients(activeRecipe) : [];

  if (!recipe) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Food Preparation</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Step-by-step cooking guide</p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          <FiClock size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active orders in preparation</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Orders will appear here when chefs start cooking</p>
        </motion.div>
      </div>
    );
  }

  const toggleStep = (stepNum) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
    setActiveStep(stepNum + 1);
  };

  const startTimer = (stepNum) => {
    if (prepTimers[stepNum]) return;
    const step = recipe.steps.find(s => s.step === stepNum);
    if (!step) return;

    setPrepTimers(prev => ({ ...prev, [stepNum]: step.timer * 60 }));
    const interval = setInterval(() => {
      setPrepTimers(prev => {
        const newTime = prev[stepNum] - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          const updated = { ...prev };
          delete updated[stepNum];
          return updated;
        }
        return { ...prev, [stepNum]: newTime };
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = completedSteps.size;
  const totalSteps = recipe.steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Food Preparation</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Step-by-step cooking guide</p>
        </div>
        <div className="flex items-center gap-2">
          {Object.values(prepTimers).filter(t => t > 0).length > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
            >
              <FiClock size={14} className="text-rose-400" />
              <span className="text-xs text-rose-400 font-medium">Timers Active</span>
            </motion.div>
          )}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <FiThermometer size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{recipe.tempTarget}°F</span>
          </motion.div>
        </div>
      </div>

      {currentPrep && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="2" />
                  <motion.circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={97.4}
                    initial={{ strokeDashoffset: 97.4 }}
                    animate={{ strokeDashoffset: 97.4 * (1 - currentPrep.progress / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  {currentPrep.progress}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{currentPrep.recipe}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Order #{currentPrep.order} · {currentPrep.currentStep} · {currentPrep.customer}</p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <FiClock size={14} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">{formatTime(currentPrep.timeLeft * 60)}</span>
            </motion.div>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentPrep.progress}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}
            />
          </div>
        </motion.div>
      )}

      {prepSteps.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {prepSteps.slice(1).map((prep, i) => (
            <motion.div
              key={`${prep.order}-${prep.recipe}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 rounded-xl p-3 min-w-[200px]"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
              }}
            >
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{prep.recipe}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>#{prep.order} · {prep.customer}</p>
              <div className="mt-2 h-1 rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prep.progress}%` }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cooking Steps</h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{completedCount}/{totalSteps} completed</span>
          </div>

          <div className="space-y-2">
            {recipe.steps.map((step) => {
              const isCompleted = completedSteps.has(step.step);
              const isActive = activeStep === step.step;
              const timer = prepTimers[step.step];

              return (
                <motion.div
                  key={step.step}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.step * 0.05 }}
                  className={`rounded-xl p-4 cursor-pointer transition-all ${
                    isActive ? 'ring-2 ring-indigo-500/30' : ''
                  }`}
                  style={{
                    background: isCompleted ? 'rgba(16,185,129,0.05)' : 'var(--glass-bg)',
                    border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.15)' : 'var(--border-color)'}`,
                  }}
                  onClick={() => toggleStep(step.step)}
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="mt-0.5"
                    >
                      {isCompleted ? (
                        <FiCheckCircle size={18} className="text-emerald-400" />
                      ) : (
                        <FiCircle size={18} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-400 line-through' : ''}`}
                          style={{ color: isCompleted ? undefined : 'var(--text-primary)' }}>
                          Step {step.step}: {step.instruction}
                        </p>
                        <div className="flex items-center gap-2">
                          {step.timer > 0 && !isCompleted && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); startTimer(step.step); }}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${
                                timer ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}
                            >
                              <FiClock size={11} />
                              {timer ? formatTime(timer) : `${step.timer}m`}
                            </motion.button>
                          )}
                          <FiChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Ingredients</h3>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ing.available ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span style={{ color: 'var(--text-primary)' }}>{ing.item}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{ing.amount}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(34,211,238,0.03))',
            border: '1px solid rgba(6,182,212,0.15)',
          }}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <FiDroplet size={14} className="text-cyan-400" /> Plating Guide
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{recipe.plating}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.03))',
              border: '1px solid rgba(245,158,11,0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <FiAlertCircle size={14} className="text-amber-400" /> AI Suggestion
              </h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              For optimal texture, consider resting the protein for 3 minutes before serving. Current order progress is at {currentPrep?.progress || 0}%.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
