import React from 'react';
import { Volume2, Trophy, Settings, Zap } from 'lucide-react';
import { audioService } from '../services/AudioEngine';
import { Difficulty } from '../types';

interface MainMenuProps {
  onSelectMode: (mode: 'CHALLENGE' | 'CUSTOM' | 'INSANITY', difficulty?: Difficulty) => void;
  catCount: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode, catCount }) => {
  
  const handleStart = (mode: 'CHALLENGE' | 'CUSTOM' | 'INSANITY', difficulty?: Difficulty) => {
    audioService.init();
    onSelectMode(mode, difficulty);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl min-h-[60vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-4">
        <div className="inline-flex p-6 bg-blue-500/10 rounded-full mb-4 ring-1 ring-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <Volume2 size={64} className="text-blue-500" />
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight mb-2">Tone Match</h1>
        <p className="text-gray-400 text-lg">Match the tone. Collect the cats.</p>
        
        <div className="mt-4 text-sm font-bold text-yellow-500 flex items-center justify-center gap-2 bg-yellow-500/10 py-2 px-4 rounded-full w-fit mx-auto border border-yellow-500/20">
          <span>🐈</span> Total Cats Collected: {catCount}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
        {/* Challenge Mode */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/50 transition-colors shadow-lg">
          <div className="text-left mb-6">
            <div className="p-3 bg-blue-600/20 w-fit rounded-lg text-blue-400 mb-4">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Challenge Mode</h3>
            <p className="text-sm text-gray-400">10 levels of increasing difficulty.</p>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => handleStart('CHALLENGE', Difficulty.EASY)}
              className="w-full py-2 bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-300 rounded-lg text-sm font-bold transition-colors"
            >
              EASY (On/Off)
            </button>
            <button 
              onClick={() => handleStart('CHALLENGE', Difficulty.MEDIUM)}
              className="w-full py-2 bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-300 rounded-lg text-sm font-bold transition-colors"
            >
              MEDIUM (4 Steps)
            </button>
            <button 
              onClick={() => handleStart('CHALLENGE', Difficulty.HARD)}
              className="w-full py-2 bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-300 rounded-lg text-sm font-bold transition-colors"
            >
              HARD (Fine Tune)
            </button>
          </div>
        </div>

        {/* Insanity Mode */}
        <button 
          onClick={() => handleStart('INSANITY')}
          className="group relative p-6 bg-gray-900 border border-gray-800 hover:border-red-500 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={100} />
          </div>
          <div className="relative z-10">
             <div className="p-3 bg-red-600/20 w-fit rounded-lg text-red-400 mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Insanity Mode</h3>
            <p className="text-sm text-gray-400">3 levels. 5 effects per level. Pure chaos for expert ears only.</p>
          </div>
        </button>

        {/* Custom Mode */}
        <button 
          onClick={() => handleStart('CUSTOM')}
          className="group relative p-6 bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Settings size={100} />
          </div>
          <div className="relative z-10">
             <div className="p-3 bg-purple-600/20 w-fit rounded-lg text-purple-400 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Settings size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Custom Training</h3>
            <p className="text-sm text-gray-400">Configure specific effects, number of questions, and difficulty.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MainMenu;