import React from 'react';
import { Clock, Target, RotateCcw, Home } from 'lucide-react';
import { GameStats } from '../types';

interface ResultsProps {
  stats: GameStats;
  onRestart: () => void;
  onMenu: () => void;
}

const Results: React.FC<ResultsProps> = ({ stats, onRestart, onMenu }) => {
  const totalSeconds = Math.floor((stats.endTime - stats.startTime) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const timeDisplay = minutes > 0 
    ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` 
    : `${seconds}s`;

  return (
    <div className="w-full max-w-lg bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500 text-center">
      <h2 className="text-3xl font-black text-white mb-2">Session Complete!</h2>
      <p className="text-gray-400 mb-8">{stats.mode} Summary</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 flex flex-col items-center">
          <Target className="text-green-400 mb-3" size={32} />
          <div className="text-3xl font-bold text-white">{Math.round(stats.averageAccuracy)}%</div>
          <div className="text-xs text-gray-500 uppercase font-bold mt-1">Accuracy</div>
        </div>
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 flex flex-col items-center">
          <Clock className="text-blue-400 mb-3" size={32} />
          <div className="text-3xl font-bold text-white">{timeDisplay}</div>
          <div className="text-xs text-gray-500 uppercase font-bold mt-1">Total Time</div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-800/50 rounded-xl mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Levels Completed</span>
          <span className="text-white font-bold">{stats.totalLevels}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Perfect Matches</span>
          <span className="text-white font-bold">{stats.correctGuesses}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onMenu}
          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-colors"
        >
          <Home size={18} /> Menu
        </button>
        <button 
          onClick={onRestart}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <RotateCcw size={18} /> Play Again
        </button>
      </div>
    </div>
  );
};

export default Results;