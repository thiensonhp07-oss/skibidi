import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TubesBackground, TubesBackgroundRef } from './Component';
import { MousePointer2, Sparkles, SlidersHorizontal, Dices, RefreshCw } from 'lucide-react';
import { PRESETS } from './data/presets';
import { ColorPreset } from './types';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { randomHexColor } from './lib/utils';

export default function App() {
  const tubesRef = useRef<TubesBackgroundRef>(null);

  // State
  const [activePresetId, setActivePresetId] = useState<string>('cyberpunk');
  const [tubeColors, setTubeColors] = useState<string[]>(PRESETS[0].tubes);
  const [lightsColors, setLightsColors] = useState<string[]>(PRESETS[0].lights);
  const [intensity, setIntensity] = useState<number>(PRESETS[0].intensity);

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [randomizeFlash, setRandomizeFlash] = useState(false);

  // Randomize handler
  const handleRandomize = useCallback(() => {
    const newTubes = [randomHexColor(), randomHexColor(), randomHexColor()];
    const newLights = [randomHexColor(), randomHexColor(), randomHexColor(), randomHexColor()];
    
    setTubeColors(newTubes);
    setLightsColors(newLights);
    setActivePresetId('custom');

    if (tubesRef.current) {
      tubesRef.current.setColors(newTubes, newLights);
    }

    setRandomizeFlash(true);
    setTimeout(() => setRandomizeFlash(false), 300);
  }, []);

  // Preset selector
  const handleSelectPreset = (preset: ColorPreset) => {
    setActivePresetId(preset.id);
    setTubeColors(preset.tubes);
    setLightsColors(preset.lights);
    setIntensity(preset.intensity);

    if (tubesRef.current) {
      tubesRef.current.setColors(preset.tubes, preset.lights);
      tubesRef.current.setIntensity(preset.intensity);
    }
  };

  // Color update callbacks
  const handleUpdateTubeColor = (index: number, color: string) => {
    const next = [...tubeColors];
    next[index] = color;
    setTubeColors(next);
    setActivePresetId('custom');
    if (tubesRef.current) {
      tubesRef.current.setColors(next, lightsColors);
    }
  };

  const handleUpdateLightColor = (index: number, color: string) => {
    const next = [...lightsColors];
    next[index] = color;
    setLightsColors(next);
    setActivePresetId('custom');
    if (tubesRef.current) {
      tubesRef.current.setColors(tubeColors, next);
    }
  };

  const handleUpdateIntensity = (val: number) => {
    setIntensity(val);
    if (tubesRef.current) {
      tubesRef.current.setIntensity(val);
    }
  };

  const handleResetToDefault = () => {
    handleSelectPreset(PRESETS[0]);
  };

  // Keyboard shortcut: Spacebar to randomize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleRandomize();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRandomize]);

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans overflow-hidden select-none">
      {/* 3D Tubes Canvas Background */}
      <TubesBackground
        ref={tubesRef}
        tubeColors={tubeColors}
        lightsColors={lightsColors}
        intensity={intensity}
        enableClickInteraction={true}
        onRandomize={({ tubes, lights }) => {
          setTubeColors(tubes);
          setLightsColors(lights);
          setActivePresetId('custom');
        }}
        className="fixed inset-0 w-full h-full"
      >
        {/* Compact Header Bar */}
        <Header
          presets={PRESETS}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          onRandomize={handleRandomize}
          isCustomizerOpen={isCustomizerOpen}
          onToggleCustomizer={() => setIsCustomizerOpen(!isCustomizerOpen)}
        />

        {/* Minimal Hero Screen */}
        <div className="relative flex flex-col items-center justify-center w-full h-full min-h-screen gap-6 text-center px-4 pt-16 pb-20">
          {/* Main Title */}
          <div className="space-y-4 pointer-events-auto cursor-default flex flex-col items-center">
            <h1 className="text-7xl sm:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_50px_rgba(0,0,0,0.9)] select-none font-display">
              BINGO
            </h1>

            {/* Prominent & Elegant Creator Tag */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 via-fuchsia-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/25 text-white shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:scale-105">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-fuchsia-200 drop-shadow-sm font-mono">
                CREATE BY HOÀNG THIÊN SƠN
              </span>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-col items-center gap-5 pointer-events-auto max-w-md">
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="hero-randomize-btn"
                onClick={handleRandomize}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-zinc-200 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
              >
                <Dices className="w-4 h-4 text-fuchsia-600" />
                <span>Randomize</span>
              </button>

              <button
                id="hero-customize-btn"
                onClick={() => setIsCustomizerOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-medium text-xs transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Controls</span>
              </button>
            </div>
          </div>

          {/* Bottom helper prompt */}
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 text-white/50 pointer-events-none">
            <div className="flex items-center gap-1.5 animate-bounce">
              <MousePointer2 className="w-4 h-4 text-fuchsia-400" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">
              Move cursor to control light vectors • Click to switch palette
            </span>
          </div>
        </div>
      </TubesBackground>

      {/* Floating Preset Palette Quick Bar (bottom-right) */}
      <aside
        aria-label="Preset bar"
        data-interactive="true"
        className="fixed bottom-5 right-5 z-30 hidden sm:flex items-center gap-2 p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto"
      >
        <div className="flex items-center gap-1.5 px-1">
          {tubeColors.map((c, i) => (
            <span
              key={i}
              className="w-4 h-4 rounded-md border border-white/30 shadow-xs transition-transform hover:scale-125 cursor-pointer"
              style={{ backgroundColor: c }}
              title={`Tube Color ${i + 1}: ${c}`}
              onClick={() => setIsCustomizerOpen(true)}
            />
          ))}
          <div className="w-px h-3 bg-white/20 mx-1" />
          {lightsColors.map((c, i) => (
            <span
              key={i}
              className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs transition-transform hover:scale-125 cursor-pointer"
              style={{ backgroundColor: c }}
              title={`Light ${i + 1}: ${c}`}
              onClick={() => setIsCustomizerOpen(true)}
            />
          ))}
        </div>
        <button
          id="quick-randomize-btn"
          onClick={handleRandomize}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Randomize (Spacebar)"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-fuchsia-400 ${randomizeFlash ? 'animate-spin' : ''}`} />
        </button>
      </aside>

      {/* Slide-out Controls Panel */}
      <ControlsPanel
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        presets={PRESETS}
        activePresetId={activePresetId}
        tubeColors={tubeColors}
        lightsColors={lightsColors}
        intensity={intensity}
        onSelectPreset={handleSelectPreset}
        onUpdateTubeColor={handleUpdateTubeColor}
        onUpdateLightColor={handleUpdateLightColor}
        onUpdateIntensity={handleUpdateIntensity}
        onResetToDefault={handleResetToDefault}
        onRandomize={handleRandomize}
      />
    </div>
  );
}

