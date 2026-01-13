import React, { useState } from 'react';
import { Play, Settings } from 'lucide-react';
import { CustomGameConfig, EffectParams, ALL_EFFECTS, EFFECT_LABELS, Difficulty } from '../types';

interface CustomSetupProps {
  onStart: (config: CustomGameConfig) => void;
  onBack: () => void;
}

const CustomSetup: React.FC<CustomSetupProps> = ({ onStart, onBack }) => {
  const [questionCount, setQuestionCount] = useState(5);
  const [maxSimultaneous, setMaxSimultaneous] = useState(2);
  const [selectedEffects, setSelectedEffects] = useState<Set<keyof EffectParams>>(new Set(['distortion', 'delayTime']));
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.HARD);

  const toggleEffect = (effect: keyof EffectParams) => {
    const newSet = new Set(selectedEffects);
    if (newSet.has(effect)) {
      if (newSet.size > 1) newSet.delete(effect); // Prevent empty selection
    } else {
      newSet.add(effect);
    }
    setSelectedEffects(newSet);
  };

  const handleStart = () => {
    onStart({
      questionCount,
      maxSimultaneousEffects: Math.min(maxSimultaneous, selectedEffects.size),
      allowedEffects: Array.from(selectedEffects),
      difficulty
    });
  };

  return (
    <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <Settings className="text-purple-500" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Custom Training Setup</h2>
          <p className="text-gray-400">Design your own ear training regimen.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Top Row: Difficulty & Counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Difficulty</label>
            <div className="flex bg-gray-800 rounded-lg p-1">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                    difficulty === d ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {difficulty === Difficulty.EASY && "Effects are On or Off."}
              {difficulty === Difficulty.MEDIUM && "Effects have 4 steps."}
              {difficulty === Difficulty.HARD && "Full control (10 steps)."}
            </p>
          </div>

          <div className="space-y-3">
             <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Number of Questions</label>
             <div className="flex items-center gap-3">
               <input 
                 type="range" 
                 min="1" 
                 max="20" 
                 value={questionCount} 
                 onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                 className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
               />
               <span className="text-purple-400 font-bold w-8 text-right">{questionCount}</span>
             </div>
          </div>
        </div>

        {/* Max Effects Slider */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Max Simultaneous Effects</label>
          <div className="flex items-center gap-3">
             <input 
              type="range" 
              min="1" 
              max="5" 
              value={maxSimultaneous} 
              onChange={(e) => setMaxSimultaneous(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-purple-400 font-bold w-8 text-right">{maxSimultaneous}</span>
          </div>
        </div>

        {/* Effect Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Included Effects</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_EFFECTS.map((effect) => (
              <button
                key={effect}
                onClick={() => toggleEffect(effect)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all border ${
                  selectedEffects.has(effect)
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {EFFECT_LABELS[effect]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-800">
          <button 
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
          >
            Back
          </button>
          <button 
            onClick={handleStart}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play size={20} /> Start Custom Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomSetup;