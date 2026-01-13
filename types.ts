export interface EffectParams {
  distortion: number;   // 0 to 1
  tremoloDepth: number; // 0 to 1
  vibratoDepth: number; // 0 to 1
  delayTime: number;    // 0 to 1 (mapped to 0s - 1s)
  delayFeedback: number;// 0 to 1
}

export interface LevelConfig {
  id: number;
  name: string;
  activeEffects: (keyof EffectParams)[];
  tolerance: number; // How close the user needs to be to pass (0.0 - 1.0)
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  INSANITY = 'INSANITY'
}

export enum GameMode {
  MENU = 'MENU',
  CHALLENGE = 'CHALLENGE',
  CUSTOM_SETUP = 'CUSTOM_SETUP',
  INSANITY = 'INSANITY',
  PLAYING = 'PLAYING',
  RESULTS = 'RESULTS'
}

export enum GameState {
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface GameStats {
  mode: string;
  difficulty?: Difficulty;
  totalLevels: number;
  correctGuesses: number;
  averageAccuracy: number;
  startTime: number;
  endTime: number;
}

export interface CustomGameConfig {
  questionCount: number;
  allowedEffects: (keyof EffectParams)[];
  maxSimultaneousEffects: number;
  difficulty: Difficulty;
}

export const INITIAL_PARAMS: EffectParams = {
  distortion: 0,
  tremoloDepth: 0,
  vibratoDepth: 0,
  delayTime: 0,
  delayFeedback: 0,
};

export const ALL_EFFECTS: (keyof EffectParams)[] = [
  'distortion', 'tremoloDepth', 'vibratoDepth', 'delayTime', 'delayFeedback'
];

export const EFFECT_LABELS: Record<keyof EffectParams, string> = {
  distortion: "Distortion",
  tremoloDepth: "Tremolo (Volume)",
  vibratoDepth: "Vibrato (Pitch)",
  delayTime: "Delay Time",
  delayFeedback: "Delay Feedback"
};

// Default Challenge Levels
export const CHALLENGE_LEVELS: LevelConfig[] = [
  { id: 1, name: "Pure Distortion", activeEffects: ['distortion'], tolerance: 0.05 },
  { id: 2, name: "Tremolo", activeEffects: ['tremoloDepth'], tolerance: 0.05 },
  { id: 3, name: "Vibrato", activeEffects: ['vibratoDepth'], tolerance: 0.05 },
  { id: 4, name: "Simple Echo", activeEffects: ['delayTime'], tolerance: 0.05 },
  { id: 5, name: "Echo & Feedback", activeEffects: ['delayTime', 'delayFeedback'], tolerance: 0.05 },
  { id: 6, name: "Crunchy Wobble", activeEffects: ['distortion', 'tremoloDepth'], tolerance: 0.05 },
  { id: 7, name: "Space Wobble", activeEffects: ['tremoloDepth', 'delayTime'], tolerance: 0.05 },
  { id: 8, name: "Drunk Synth", activeEffects: ['vibratoDepth', 'distortion'], tolerance: 0.05 },
  { id: 9, name: "Underwater", activeEffects: ['tremoloDepth', 'delayTime', 'delayFeedback'], tolerance: 0.05 },
  { id: 10, name: "Audio Master", activeEffects: ['distortion', 'tremoloDepth', 'vibratoDepth', 'delayTime', 'delayFeedback'], tolerance: 0.05 },
];