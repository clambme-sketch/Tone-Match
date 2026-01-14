import React, { useState } from 'react';
import { GameMode, GameStats, CustomGameConfig, LevelConfig, ALL_EFFECTS, CHALLENGE_LEVELS, Difficulty } from './types';
import MainMenu from './components/MainMenu';
import GameSession from './components/GameSession';
import CustomSetup from './components/CustomSetup';
import Results from './components/Results';

const CatWalker: React.FC<{ index: number }> = ({ index }) => {
  const duration = 15 + Math.random() * 20; 
  const delay = Math.random() * 10;
  
  // Every 5th cat (indices 4, 9, 14...) is a black cat
  const isBlackCat = (index + 1) % 5 === 0;

  return (
    <div 
      className="absolute bottom-0 text-4xl select-none pointer-events-none"
      style={{
        animation: `walk ${duration}s linear infinite`,
        animationDelay: `-${delay}s`,
        opacity: 0.8,
        zIndex: 10,
        filter: isBlackCat ? 'none' : 'grayscale(0.3)'
      }}
    >
      {isBlackCat ? '🐈‍⬛' : '🐈'}
    </div>
  );
};

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.MENU);
  const [catCount, setCatCount] = useState(0);
  const [activeLevels, setActiveLevels] = useState<LevelConfig[]>([]);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>(Difficulty.HARD);
  const [lastStats, setLastStats] = useState<GameStats | null>(null);

  // --- Mode Handlers ---

  const startChallenge = (difficulty: Difficulty) => {
    setActiveLevels(CHALLENGE_LEVELS);
    setActiveDifficulty(difficulty);
    setCurrentMode(GameMode.CHALLENGE);
  };

  const startInsanity = () => {
    // Generate 3 extremely hard levels
    const insanityLevels: LevelConfig[] = Array.from({ length: 3 }).map((_, i) => ({
      id: i + 1,
      name: `Insanity ${i + 1}`,
      activeEffects: [...ALL_EFFECTS],
      tolerance: 0.05
    }));
    setActiveLevels(insanityLevels);
    setActiveDifficulty(Difficulty.INSANITY);
    setCurrentMode(GameMode.INSANITY);
  };

  const startCustom = (config: CustomGameConfig) => {
    // Generate levels based on config
    const levels: LevelConfig[] = Array.from({ length: config.questionCount }).map((_, i) => {
      // Pick N random effects from the allowed list
      const shuffled = [...config.allowedEffects].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, config.maxSimultaneousEffects);
      
      return {
        id: i + 1,
        name: `Custom ${i + 1}`,
        activeEffects: selected,
        tolerance: 0.08
      };
    });
    setActiveLevels(levels);
    setActiveDifficulty(config.difficulty);
    setCurrentMode(GameMode.CHALLENGE); // Re-use the playing view ID, logic is same
  };

  const handleGameComplete = (stats: GameStats) => {
    setLastStats(stats);
    setCurrentMode(GameMode.RESULTS);
  };

  // --- Render Router ---

  let content;

  switch (currentMode) {
    case GameMode.MENU:
      content = (
        <MainMenu 
          catCount={catCount}
          onSelectMode={(mode, difficulty) => {
            if (mode === 'CHALLENGE' && difficulty) startChallenge(difficulty);
            else if (mode === 'INSANITY') startInsanity();
            else if (mode === 'CUSTOM') setCurrentMode(GameMode.CUSTOM_SETUP);
          }} 
        />
      );
      break;

    case GameMode.CUSTOM_SETUP:
      content = (
        <CustomSetup 
          onBack={() => setCurrentMode(GameMode.MENU)}
          onStart={startCustom}
        />
      );
      break;

    case GameMode.CHALLENGE:
    case GameMode.INSANITY:
      content = (
        <GameSession
          levels={activeLevels}
          difficulty={activeDifficulty}
          modeName={currentMode === GameMode.INSANITY ? "Insanity Mode" : "Challenge Mode"}
          onCatEarned={() => setCatCount(prev => prev + 1)}
          onExit={() => setCurrentMode(GameMode.MENU)}
          onComplete={handleGameComplete}
        />
      );
      break;

    case GameMode.RESULTS:
      content = (
        <Results 
          stats={lastStats!}
          onMenu={() => setCurrentMode(GameMode.MENU)}
          onRestart={() => {
            // Quick restart logic based on last mode
            if (lastStats?.mode === "Insanity Mode") startInsanity();
            else if (lastStats?.mode.includes("Custom")) setCurrentMode(GameMode.CUSTOM_SETUP); // Go back to setup for custom
            else if (lastStats?.difficulty) startChallenge(lastStats.difficulty);
            else setCurrentMode(GameMode.MENU);
          }}
        />
      );
      break;
      
    default:
      content = <div>Unknown State</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <style>{`
        @keyframes walk {
          from { transform: translateX(-10vw); }
          to { transform: translateX(110vw); }
        }
      `}</style>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-gray-950 to-gray-950 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full flex justify-center items-center min-h-screen py-12">
        {content}
      </div>

      {/* Persistent Cats */}
      <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none z-0">
        {Array.from({ length: catCount }).map((_, i) => (
          <CatWalker key={i} index={i} />
        ))}
      </div>
    </div>
  );
};

export default App;