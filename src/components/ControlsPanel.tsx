import React from 'react';
import { X, Sparkles, Sliders, Palette, Lightbulb, Copy, Check, RotateCcw } from 'lucide-react';
import { ColorPreset } from '../types';

interface ControlsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  presets: ColorPreset[];
  activePresetId: string;
  tubeColors: string[];
  lightsColors: string[];
  intensity: number;
  onSelectPreset: (preset: ColorPreset) => void;
  onUpdateTubeColor: (index: number, color: string) => void;
  onUpdateLightColor: (index: number, color: string) => void;
  onUpdateIntensity: (val: number) => void;
  onResetToDefault: () => void;
  onRandomize: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isOpen,
  onClose,
  presets,
  activePresetId,
  tubeColors,
  lightsColors,
  intensity,
  onSelectPreset,
  onUpdateTubeColor,
  onUpdateLightColor,
  onUpdateIntensity,
  onResetToDefault,
  onRandomize,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyConfig = () => {
    const config = {
      tubes: tubeColors,
      lights: lightsColors,
      intensity: intensity,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-interactive="true"
      className="fixed inset-y-0 right-0 z-40 w-full max-w-sm sm:max-w-md bg-zinc-950/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto transition-transform duration-300 overflow-hidden"
    >
      {/* Panel Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-fuchsia-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Tubes Customizer</h3>
            <p className="text-xs text-white/50">Adjust 3D curves and light vectors</p>
          </div>
        </div>
        <button
          id="close-customizer-btn"
          onClick={onClose}
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-white/80">
        {/* Presets Gallery */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono text-white/50 font-medium">Color Presets</span>
            <button
              id="panel-randomize-btn"
              onClick={onRandomize}
              className="text-[11px] text-fuchsia-400 hover:text-fuchsia-300 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Randomize</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`panel-preset-${preset.id}`}
                  onClick={() => onSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    isActive
                      ? 'border-white/50 bg-white/15 shadow-md'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white truncate">{preset.name}</span>
                    {preset.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono uppercase">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  {/* Swatches preview */}
                  <div className="flex items-center gap-1">
                    {preset.tubes.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-md border border-white/20 shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="w-px h-3 bg-white/20 mx-1" />
                    {preset.lights.slice(0, 2).map((c, i) => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tube Colors Section */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs uppercase tracking-wider font-mono text-white/50 font-medium">
              Tube Body Colors (3 Nodes)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {tubeColors.map((color, index) => (
              <div
                key={index}
                className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/10 items-center"
              >
                <div className="relative w-full h-9 rounded-lg overflow-hidden border border-white/20 shadow-inner group">
                  <input
                    id={`tube-color-${index}`}
                    type="color"
                    value={color}
                    onChange={(e) => onUpdateTubeColor(index, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-full h-full rounded-lg transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/70 uppercase tracking-wider">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lights Colors Section */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs uppercase tracking-wider font-mono text-white/50 font-medium">
              Dynamic Neon Lights (4 Emitters)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lightsColors.map((color, index) => (
              <div
                key={index}
                className="flex flex-col gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 items-center"
              >
                <div className="relative w-full h-8 rounded-lg overflow-hidden border border-white/20 shadow-inner group">
                  <input
                    id={`light-color-${index}`}
                    type="color"
                    value={color}
                    onChange={(e) => onUpdateLightColor(index, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-full h-full rounded-lg transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <span className="font-mono text-[9px] text-white/70 uppercase">{color.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Light Intensity Slider */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono text-white/50 font-medium">
              Light Intensity
            </span>
            <span className="font-mono text-xs font-semibold text-white px-2 py-0.5 rounded bg-white/10">
              {intensity}
            </span>
          </div>
          <input
            id="intensity-slider"
            type="range"
            min="50"
            max="400"
            step="10"
            value={intensity}
            onChange={(e) => onUpdateIntensity(Number(e.target.value))}
            className="w-full accent-fuchsia-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/40 font-mono">
            <span>50 (Subtle Glow)</span>
            <span>400 (High Luminescence)</span>
          </div>
        </div>
      </div>

      {/* Panel Footer */}
      <div className="p-4 border-t border-white/10 bg-zinc-950/60 flex items-center gap-2">
        <button
          id="copy-config-btn"
          onClick={handleCopyConfig}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-lg"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Config Copied!' : 'Copy JSON Config'}</span>
        </button>
        <button
          id="reset-config-btn"
          onClick={onResetToDefault}
          title="Reset to default Cyberpunk preset"
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
