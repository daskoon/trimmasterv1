import { useState } from 'react';
import { CameraView } from './components/CameraView';
import { BEARD_STYLES } from './constants';
import type { BeardStyle } from './types';
import { Layers, ChevronLeft, FlipHorizontal } from 'lucide-react';

type AppStep = 'gallery' | 'studio';

function App() {
  const [step, setStep] = useState<AppStep>('gallery');
  const [selectedStyle, setSelectedStyle] = useState<BeardStyle | null>(null);
  const [opacity, setOpacity] = useState(0.8);
  const [isMirrored, setIsMirrored] = useState(true);

  const handleSelectStyle = (style: BeardStyle) => {
    setSelectedStyle(style);
    setStep('studio');
  };

  const startOver = () => {
    setStep('gallery');
    setSelectedStyle(null);
  };

  if (step === 'gallery') {
    return (
      <div className="h-full w-full bg-[#0a0a0a] text-white p-6 overflow-y-auto no-scrollbar flex flex-col">
        <header className="mb-8 pt-4">
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic text-[#f59e0b]">TrimMaster <span className="text-xs italic font-normal text-zinc-600">v1.2.1</span></h1>
          <p className="text-zinc-500 font-medium">Select your target</p>
        </header>
        
        <div className="grid grid-cols-2 gap-4 pb-12">
          {BEARD_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => handleSelectStyle(style)}
              className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 active:scale-95 transition-transform text-left"
            >
              <img src={style.image} alt={style.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-5">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Style</span>
                <h2 className="text-lg font-bold uppercase leading-none">{style.name}</h2>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black text-white relative overflow-hidden">
      
      {/* HUD - TOP */}
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

      {/* AR View */}
      <CameraView 
        mode="guide" 
        styleName={selectedStyle?.name}
        opacity={opacity}
        mirrored={isMirrored}
      />

      {/* HUD - BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-8 pb-12 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto max-w-sm mx-auto">
          <div className="flex justify-between px-4">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Guide Strength</span>
             <span className="text-[10px] font-bold text-amber-500">{Math.round(opacity * 100)}%</span>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/10 shadow-2xl">
            <Layers size={20} className="text-zinc-500" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={opacity} 
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500 h-2 bg-zinc-800 rounded-full appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
