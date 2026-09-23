import { useState, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { BEARD_STYLES } from './constants';
import type { BeardStyle } from './types';
import { Layers, ChevronLeft, FlipHorizontal, Scissors } from 'lucide-react';

type AppStep = 'splash' | 'gallery' | 'studio';

function App() {
  const [step, setStep] = useState<AppStep>('splash');
  const [selectedStyle, setSelectedStyle] = useState<BeardStyle | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('gallery');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const styles = isEasterEggActive 
    ? [...BEARD_STYLES, { 
        id: 'logan', 
        name: 'The Logan', 
        image: '/logan.jpg',
        referenceImages: {} 
      }]
    : BEARD_STYLES;

  const handleSelectStyle = (style: BeardStyle) => {
    setSelectedStyle(style);
    setStep('studio');
  };

  const startOver = () => {
    setStep('gallery');
    setSelectedStyle(null);
  };

  if (step === 'splash') {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center text-white animate-fade-in">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <Scissors size={64} className="text-amber-500 relative z-10" />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter mb-2">TRIMMASTER</h1>
        <p className="text-zinc-500 font-mono text-xs tracking-widest">SYSTEM v1.2.5</p>
        <div className="mt-8 w-32 h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 animate-[loading_1.5s_ease-in-out_forwards] w-full origin-left"></div>
        </div>
      </div>
    );
  }

  // --- GALLERY (CAROUSEL MODE) ---
  if (step === 'gallery') {
    return (
      <div className="h-full w-full bg-[#0a0a0a] text-white flex flex-col animate-fade-in relative overflow-hidden">
        <header className="px-8 pt-12 pb-4 z-10 bg-gradient-to-b from-black to-transparent">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic text-[#f59e0b]">
              TrimMaste
              <span 
                className="cursor-pointer active:text-amber-300 transition-colors"
                onClick={() => {
                  setIsEasterEggActive(true);
                  alert("🤘 Secret Style Unlocked: The Logan!");
                }}
              >
                r
              </span>
            </h1>
            <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-mono">v1.2.5</span>
          </div>
          <p className="text-zinc-500 font-medium text-sm mt-1">Swipe to select your target</p>
        </header>
        
        {/* CAROUSEL CONTAINER */}
        <div className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory px-8 pb-12 gap-4 no-scrollbar">
          {styles.map(style => (
            <button
              key={style.id}
              onClick={() => handleSelectStyle(style)}
              className={`relative flex-shrink-0 w-64 h-[70vh] rounded-[2.5rem] overflow-hidden bg-zinc-900 border snap-center transition-all duration-300 active:scale-95 group ${
                style.id === 'logan' ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/5'
              }`}
            >
              <img 
                src={style.image} 
                alt={style.name} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0" 
              />
              
              {/* Card Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 text-left">
                <div className="w-12 h-1 bg-amber-500 mb-4 rounded-full"></div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${
                  style.id === 'logan' ? 'text-amber-400' : 'text-zinc-400'
                }`}>
                  {style.id === 'logan' ? 'Legendary' : 'Class A'}
                </span>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">{style.name}</h2>
                <p className="text-xs text-zinc-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Tap to Activate AR Guide
                </p>
              </div>
            </button>
          ))}
          {/* Spacer for end of list */}
          <div className="w-4 flex-shrink-0"></div>
        </div>
      </div>
    );
  }

  // --- STUDIO ---
  return (
    <div className="h-full w-full bg-black text-white relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 right-0 z-50 p-6 pt-12 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/5">
           <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Target</span>
           <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">{selectedStyle?.name}</h2>
        </div>
        
        <div className="flex gap-3 pointer-events-auto">
          <button 
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all active:scale-90 ${
              isMirrored 
              ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
              : 'bg-zinc-900/80 text-white border-white/20'
            }`}
          >
            <FlipHorizontal size={24} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{isMirrored ? 'Mirror' : 'True'}</span>
          </button>

          <button 
            onClick={startOver}
            className="p-4 bg-zinc-900/80 rounded-2xl border border-white/20 active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>

      <CameraView mode="guide" styleName={selectedStyle?.name} zoom={zoom} mirrored={isMirrored} />

      <div className="absolute bottom-0 left-0 right-0 z-50 p-8 pb-12 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto max-w-sm mx-auto">
          <div className="flex justify-between px-4">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Zoom</span>
             <span className="text-[10px] font-bold text-amber-500">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/10 shadow-2xl">
            <Layers size={20} className="text-zinc-500" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500 h-2 bg-zinc-800 rounded-full appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
