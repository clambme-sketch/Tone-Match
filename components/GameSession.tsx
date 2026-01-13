import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Check, Volume2, ArrowRight } from 'lucide-react';
import { EffectParams, INITIAL_PARAMS, LevelConfig, GameState, GameStats, EFFECT_LABELS, Difficulty } from '../types';
import { audioService } from '../services/AudioEngine';
import EffectControl from './EffectControl';
import Visualizer from './Visualizer';

interface GameSessionProps {
  levels: LevelConfig[];
  modeName: string;
  difficulty: Difficulty;
  onComplete: (stats: GameStats) => void;
  onExit: () => void;
  onCatEarned: () => void;
}

const GameSession: React.FC<GameSessionProps> = ({ levels, modeName, difficulty, onComplete, onExit, onCatEarned }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  
  const [userParams, setUserParams] = useState<EffectParams>({ ...INITIAL_PARAMS });
  const [targetParams, setTargetParams] = useState<EffectParams>({ ...INITIAL_PARAMS });
  
  const [isPlaying, setIsPlaying] = useState<'target' | 'user' | null>(null);
  const [score, setScore] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Stats Tracking
  const startTimeRef = useRef<number>(Date.now());
  const scoresRef = useRef<number[]>([]);
  const perfectsRef = useRef<number>(0);

  const currentLevel = levels[currentIndex];

  // Helper to determine control step based on difficulty
  const getStepSize = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY: return 1.0;
      case Difficulty.MEDIUM: return 0.333333; // Approx 1/3 for 0, 0.33, 0.66, 1
      case Difficulty.HARD: 
      case Difficulty.INSANITY:
      default: return 0.1;
    }
  };

  // Logic to randomize target
  const randomizeTarget = useCallback((level: LevelConfig) => {
    const newTarget = { ...INITIAL_PARAMS };
    
    // Randomizer function depends on difficulty
    const getRandomValue = () => {
      if (difficulty === Difficulty.EASY) {
        // On or Off (0 or 1)
        return Math.random() > 0.5 ? 1 : 0;
      } 
      else if (difficulty === Difficulty.MEDIUM) {
        // 0, 1/3, 2/3, 1
        const options = [0, 0.333333, 0.666666, 1];
        return options[Math.floor(Math.random() * options.length)];
      } 
      else {
        // Hard/Insanity: 0.0 - 1.0 in 0.1 steps
        return Math.floor(Math.random() * 11) / 10;
      }
    };

    level.activeEffects.forEach(effect => {
       // Ensure at least one value is non-zero if possible, or just pure random
       // Pure random is fine, sometimes "dry" is the answer for a specific effect.
       newTarget[effect] = getRandomValue();
    });
    
    setTargetParams(newTarget);
    setUserParams({ ...INITIAL_PARAMS });
  }, [difficulty]);

  // Init Level
  useEffect(() => {
    if (currentLevel) {
      randomizeTarget(currentLevel);
      setGameState(GameState.PLAYING);
      setScore(0);
      setFeedbackMsg('');
    }
  }, [currentIndex, currentLevel, randomizeTarget]);

  const handlePlayTarget = async () => {
    if (isPlaying) return;
    setIsPlaying('target');
    await audioService.playToneSequence(targetParams, () => setIsPlaying(null));
  };

  const handlePlayUser = async () => {
    if (isPlaying) return;
    setIsPlaying('user');
    await audioService.playToneSequence(userParams, () => setIsPlaying(null));
  };

  const handleSubmit = () => {
    let totalDiff = 0;
    currentLevel.activeEffects.forEach(key => {
      // Small tolerance allowance for float math (especially medium mode)
      let diff = Math.abs(userParams[key] - targetParams[key]);
      // If close enough (e.g. 0.33 vs 0.33333), treat as 0
      if (diff < 0.01) diff = 0;
      totalDiff += diff;
    });
    
    const avgDiff = totalDiff / currentLevel.activeEffects.length;
    
    // Dynamic tolerance based on difficulty could be used, but the level config tolerance works well.
    // For Easy/Medium, since inputs snap, accuracy is usually 100% or 0% per effect.
    // Hard allows getting 'close'.
    
    const isPass = avgDiff <= currentLevel.tolerance;
    const calculatedScore = Math.max(0, Math.round((1 - avgDiff) * 100));

    setScore(calculatedScore);
    
    if (isPass) {
      setGameState(GameState.SUCCESS);
      setFeedbackMsg(calculatedScore === 100 ? "Perfect! +1 Cat" : "Close Enough! +1 Cat");
      onCatEarned();
      perfectsRef.current += (calculatedScore >= 95 ? 1 : 0);
    } else {
      setGameState(GameState.FAILURE);
      setFeedbackMsg("Not quite there. Listen closer.");
    }
  };

  const handleNext = () => {
    scoresRef.current.push(score);
    
    if (currentIndex < levels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished
      const endTime = Date.now();
      const avg = scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length;
      onComplete({
        mode: modeName,
        difficulty: difficulty,
        totalLevels: levels.length,
        correctGuesses: perfectsRef.current,
        averageAccuracy: avg,
        startTime: startTimeRef.current,
        endTime: endTime
      });
    }
  };

  const handleRetry = () => {
     setGameState(GameState.PLAYING);
  };

  return (
    <div className="w-full max-w-6xl flex flex-col items-center">
      {/* Game Header */}
      <div className="w-full flex justify-between items-center mb-6 px-4">
         <div className="flex items-center gap-2">
            <button onClick={onExit} className="text-gray-500 hover:text-white text-sm uppercase font-bold tracking-wider">
              &larr; Exit
            </button>
            <div className="h-6 w-px bg-gray-800 mx-2"></div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {modeName} 
                <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono border border-gray-700">{difficulty}</span>
              </h2>
              <p className="text-xs text-blue-400">Level {currentIndex + 1} / {levels.length}</p>
            </div>
         </div>
         <div className="flex gap-1">
             {levels.map((_, idx) => (
               <div key={idx} className={`h-1.5 w-4 rounded-full transition-colors ${
                 idx < currentIndex ? 'bg-green-500' : 
                 idx === currentIndex ? 'bg-blue-500' : 'bg-gray-800'
               }`} />
             ))}
         </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
         
         {/* Left: Visualization & Playback */}
         <div className="space-y-6">
            <Visualizer />
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handlePlayTarget}
                disabled={!!isPlaying}
                className={`p-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all
                  ${isPlaying === 'target' 
                    ? 'border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700 text-gray-300'
                  } disabled:opacity-50`}
              >
                {isPlaying === 'target' ? <Pause size={32} /> : <Play size={32} />}
                <span className="font-bold tracking-widest">TARGET</span>
              </button>

              <button
                onClick={handlePlayUser}
                disabled={!!isPlaying}
                className={`p-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all
                  ${isPlaying === 'user' 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700 text-gray-300'
                  } disabled:opacity-50`}
              >
                {isPlaying === 'user' ? <Pause size={32} /> : <Play size={32} />}
                <span className="font-bold tracking-widest">MY MIX</span>
              </button>
            </div>
            
            {isPlaying && (
              <button onClick={() => audioService.stop()} className="w-full py-3 text-red-400 bg-red-900/10 border border-red-900/50 rounded-lg text-sm font-semibold tracking-wide hover:bg-red-900/20">
                STOP AUDIO
              </button>
            )}
         </div>

         {/* Right: Controls */}
         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex-1 space-y-4 mb-8">
               <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm font-semibold uppercase tracking-wider border-b border-gray-800 pb-2">
                 <Volume2 size={16} /> Effect Rack
               </div>
               {currentLevel.activeEffects.map(effect => (
                 <EffectControl
                   key={effect}
                   label={EFFECT_LABELS[effect]}
                   value={userParams[effect]}
                   step={getStepSize(difficulty)}
                   onChange={(v) => setUserParams(prev => ({ ...prev, [effect]: v }))}
                 />
               ))}
            </div>

            {/* Action Area */}
            <div className="pt-4 border-t border-gray-800">
               {gameState === GameState.PLAYING ? (
                 <button
                   onClick={handleSubmit}
                   className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                 >
                   <Check size={20} /> SUBMIT MATCH
                 </button>
               ) : (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${gameState === GameState.SUCCESS ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                       <div>
                          <h3 className={`font-bold ${gameState === GameState.SUCCESS ? 'text-green-400' : 'text-red-400'}`}>
                             {gameState === GameState.SUCCESS ? 'Success' : 'Missed'}
                          </h3>
                          <p className="text-sm text-gray-400">{feedbackMsg}</p>
                       </div>
                       <div className="text-2xl font-black text-white">{score}%</div>
                    </div>

                    <div className="flex gap-3">
                       <button onClick={handleRetry} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg">
                          Retry
                       </button>
                       {gameState === GameState.SUCCESS && (
                         <button onClick={handleNext} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex justify-center items-center gap-2">
                            Next <ArrowRight size={18} />
                         </button>
                       )}
                    </div>
                 </div>
               )}
            </div>
         </div>

      </div>
    </div>
  );
};

export default GameSession;