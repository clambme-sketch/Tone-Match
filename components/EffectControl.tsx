import React from 'react';

interface EffectControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  step?: number;
}

const EffectControl: React.FC<EffectControlProps> = ({ label, value, onChange, disabled, step = 0.1 }) => {
  return (
    <div className={`flex flex-col space-y-2 p-4 rounded-lg bg-gray-800 border border-gray-700 transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">{label}</label>
        <span className="text-xs text-blue-400 font-mono">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default EffectControl;