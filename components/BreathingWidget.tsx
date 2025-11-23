
import React, { useEffect, useState, useRef, useCallback } from 'react';

const TECHNIQUES = {
  relax: {
    id: 'relax',
    name: "4-7-8 Relax",
    label: "Relaxation",
    description: "Calm the nervous system",
    phases: [
      { name: 'Inhale', duration: 4, text: 'Inhale deeply...', mode: 'expand' },
      { name: 'Hold', duration: 7, text: 'Hold breath...', mode: 'hold-full' },
      { name: 'Exhale', duration: 8, text: 'Exhale slowly...', mode: 'contract' },
    ],
    colorTheme: 'teal'
  },
  focus: {
    id: 'focus',
    name: "Box Breathing",
    label: "Focus & Alertness",
    description: "Heighten performance",
    phases: [
      { name: 'Inhale', duration: 4, text: 'Inhale...', mode: 'expand' },
      { name: 'Hold', duration: 4, text: 'Hold...', mode: 'hold-full' },
      { name: 'Exhale', duration: 4, text: 'Exhale...', mode: 'contract' },
      { name: 'Hold', duration: 4, text: 'Hold Empty...', mode: 'hold-empty' },
    ],
    colorTheme: 'blue'
  },
  balance: {
    id: 'balance',
    name: "Resonance",
    label: "Balance",
    description: "Heart rate variability",
    phases: [
      { name: 'Inhale', duration: 6, text: 'Inhale...', mode: 'expand' },
      { name: 'Exhale', duration: 6, text: 'Exhale...', mode: 'contract' },
    ],
    colorTheme: 'indigo'
  }
};

export const BreathingWidget: React.FC = () => {
  const [activeTechniqueId, setActiveTechniqueId] = useState<keyof typeof TECHNIQUES>('relax');
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TECHNIQUES['relax'].phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentTechnique = TECHNIQUES[activeTechniqueId];
  const currentPhase = currentTechnique.phases[phaseIndex];

  // Initialize Audio Context on first interaction
  const initAudio = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
  };

  const playTone = useCallback((freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.error("Audio play error", e);
    }
  }, [soundEnabled]);

  // Reset when technique changes
  useEffect(() => {
    setStatus('idle');
    setPhaseIndex(0);
    setCycles(0);
    setTimeLeft(TECHNIQUES[activeTechniqueId].phases[0].duration);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeTechniqueId]);

  // Timer Logic
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // Phase Complete
          if (prev <= 0.1) {
            const nextIndex = (phaseIndex + 1) % currentTechnique.phases.length;
            
            // Play Sound Cue for phase change
            if (currentTechnique.phases[nextIndex].mode === 'expand') playTone(440, 'sine', 1.5); // High pitch for inhale
            else if (currentTechnique.phases[nextIndex].mode === 'contract') playTone(330, 'sine', 1.5); // Lower pitch for exhale
            else playTone(220, 'triangle', 0.5); // Hold

            setPhaseIndex(nextIndex);
            
            // Increment cycle if we looped back to start
            if (nextIndex === 0) {
                setCycles(c => c + 1);
            }
            
            return currentTechnique.phases[nextIndex].duration;
          }
          // Decrement (using 0.1s for smoother animation calculation)
          return Math.max(0, prev - 0.1);
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, phaseIndex, activeTechniqueId, currentTechnique.phases, playTone]);

  // --- Dynamic Scale Calculation for Animation ---
  // This ensures the circle stays at the exact size when paused
  const calculateScale = () => {
    if (status === 'idle') return 1;
    
    const totalDuration = currentPhase.duration;
    const elapsed = totalDuration - timeLeft;
    const progress = Math.max(0, Math.min(1, elapsed / totalDuration));
    
    const BASE_SCALE = 1;
    const MAX_SCALE = 1.6;
    
    switch (currentPhase.mode) {
        case 'expand':
            // Easing out cubic for natural breath
            return BASE_SCALE + (MAX_SCALE - BASE_SCALE) * progress;
        case 'contract':
            return MAX_SCALE - (MAX_SCALE - BASE_SCALE) * progress;
        case 'hold-full':
            return MAX_SCALE;
        case 'hold-empty':
            return BASE_SCALE;
        default:
            return BASE_SCALE;
    }
  };

  const handlePlayPause = () => {
    initAudio();
    if (status === 'playing') {
        setStatus('paused');
    } else {
        setStatus('playing');
        // Initial sound if starting
        if (status === 'idle') playTone(440, 'sine', 1.5);
    }
  };

  const handleStop = () => {
    setStatus('idle');
    setPhaseIndex(0);
    setTimeLeft(currentTechnique.phases[0].duration);
    setCycles(0);
  };

  const getThemeColors = () => {
    switch(currentTechnique.colorTheme) {
        case 'blue': return 'bg-blue-50 border-blue-100 text-blue-800';
        case 'indigo': return 'bg-indigo-50 border-indigo-100 text-indigo-800';
        default: return 'bg-teal-50 border-teal-100 text-teal-800';
    }
  };

  const getGradient = () => {
      switch(currentTechnique.colorTheme) {
        case 'blue': return 'from-blue-400 to-cyan-300';
        case 'indigo': return 'from-indigo-400 to-purple-400';
        default: return 'from-teal-400 to-emerald-300';
    }
  };

  return (
    <div className={`rounded-2xl border shadow-sm my-4 overflow-hidden transition-colors duration-500 ${getThemeColors()}`}>
      
      {/* Header & Controls */}
      <div className="p-4 border-b border-black/5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-white/50`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-none">Breathe</h3>
                    <p className="text-[10px] opacity-60 font-medium mt-0.5">Mindfulness Tool</p>
                </div>
            </div>
            
            <button 
                onClick={() => { initAudio(); setSoundEnabled(!soundEnabled); }}
                className={`p-2 rounded-full transition-colors ${soundEnabled ? 'bg-white/60 text-teal-700' : 'bg-transparent text-slate-400 hover:bg-black/5'}`}
                title="Toggle Sound Cues"
            >
                {soundEnabled ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                   </svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                   </svg>
                )}
            </button>
        </div>

        {/* Technique Tabs - Scrollable to prevent wrapping */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
           {(Object.values(TECHNIQUES) as Array<typeof currentTechnique>).map((tech) => (
             <button
               key={tech.id}
               onClick={() => setActiveTechniqueId(tech.id as any)}
               className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                   activeTechniqueId === tech.id 
                   ? 'bg-white shadow-sm border-transparent text-slate-800 scale-105' 
                   : 'bg-transparent border-black/5 hover:bg-white/30 text-slate-500'
               }`}
             >
               {tech.label}
             </button>
           ))}
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="relative p-8 flex flex-col items-center justify-center min-h-[380px]">
         
         {/* Instruction Text (Dynamic) */}
         <div className="absolute top-6 text-center z-10">
            <p className={`text-2xl font-bold transition-opacity duration-300 ${status === 'idle' ? 'opacity-50' : 'opacity-100'}`}>
                {status === 'idle' ? "Ready to start?" : currentPhase.text}
            </p>
            <p className="text-xs opacity-60 font-medium mt-1 tracking-wide uppercase">
                {status === 'idle' ? currentTechnique.description : `${currentTechnique.name} • Cycle ${cycles + 1}`}
            </p>
         </div>

         {/* Orb Container */}
         <div className="relative w-48 h-48 flex items-center justify-center mt-12">
             {/* Static Ring */}
             <div className="absolute inset-0 rounded-full border-4 border-white/40"></div>
             
             {/* Animated Breathing Orb */}
             <div 
               className={`w-24 h-24 rounded-full shadow-2xl bg-gradient-to-br ${getGradient()}`}
               style={{ 
                   transform: `scale(${calculateScale()})`,
                   // We remove CSS transition for scale when playing to let React control it frame-by-frame
                   // But keep it for color changes
                   transition: 'background 0.5s ease'
               }}
             >
                 {/* Inner text (Timer) */}
                 <div className="absolute inset-0 flex items-center justify-center text-white">
                    {status !== 'idle' && (
                        <span className="font-bold text-xl drop-shadow-md tabular-nums">
                            {Math.ceil(timeLeft)}
                        </span>
                    )}
                    {status === 'idle' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                    )}
                 </div>
             </div>
         </div>

         {/* Playback Controls */}
         <div className="mt-10 flex items-center gap-6">
             <button 
                onClick={handleStop}
                disabled={status === 'idle'}
                className="p-3 rounded-full text-slate-400 hover:bg-black/5 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Reset"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>

             <button 
               onClick={handlePlayPause}
               className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl text-white transition-transform active:scale-95 bg-gradient-to-br ${getGradient()}`}
             >
                {status === 'playing' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 pl-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                )}
             </button>

             <div className="w-12 text-center">
                {status !== 'idle' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <span className="text-lg font-bold tabular-nums leading-none">{cycles}</span>
                        <span className="text-[9px] uppercase font-bold opacity-50">Cycles</span>
                    </div>
                )}
             </div>
         </div>
      </div>
    </div>
  );
};
