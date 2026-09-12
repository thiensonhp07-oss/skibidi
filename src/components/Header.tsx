import React from 'react';
import { Sparkles, Dices, SlidersHorizontal, Palette } from 'lucide-react';
import { ColorPreset } from '../types';

interface HeaderProps {
  presets: ColorPreset[];
  activePresetId: string;
  onSelectPreset: (preset: ColorPreset) => void;
  onRandomize: () => void;
  isCustomizerOpen: boolean;
  onToggleCustomizer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onRandomize,
  isCustomizerOpen,
  onToggleCustomizer,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 p-3 sm:p-5 flex items-center justify-between gap-3 pointer-events-none">
      {/* Brand & Badge */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white tracking-wide shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono uppercase tracking-wider text-[11px] font-bold">BINGO</span>
        </div>
      </div>

      {/* Center Nav / Preset Pills */}
      <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 pointer-events-auto shadow-2xl">
        {presets.slice(0, 6).map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-black shadow-md font-semibold scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex -space-x-1">
                {preset.tubes.map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="truncate max-w-[90px]">{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Randomize Trigger */}
        <button
          id="header-randomize-btn"
          onClick={onRandomize}
          title="Randomize Colors (Spacebar)"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/15 text-white text-xs font-medium transition-all shadow-lg group"
        >
          <Dices className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300 text-fuchsia-400" />
          <span>Randomize</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/15 text-[10px] font-mono text-white/80">Space</kbd>
        </button>

        {/* Customizer Drawer Button */}
        <button
          id="header-customizer-btn"
          onClick={onToggleCustomizer}
          title="Customize Colors & Lighting"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full backdrop-blur-md border text-xs font-medium transition-all shadow-lg ${
            isCustomizerOpen
              ? 'bg-white text-black border-white font-semibold'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Controls</span>
        </button>
      </div>
    </header>
  );
};

