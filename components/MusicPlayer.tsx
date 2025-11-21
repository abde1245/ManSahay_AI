
import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../types';
import { MUSIC_LIBRARY, CATEGORIES } from '../data/musicLibrary';

interface MusicPlayerProps {
  isPlaying: boolean;
  currentTrack: Track;
  volume: number;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (vol: number) => void;
  onTrackSelect: (track: Track) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  currentTrack,
  volume,
  onToggle,
  onNext,
  onPrev,
  onVolumeChange,
  onTrackSelect
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Initialize Audio Object (Once)
  useEffect(() => {
    if (!audioRef.current) {
        const audio = new Audio();
        // No crossOrigin needed for opaque resources (avoids CORS issues with Archive.org)
        audio.loop = true;
        audio.preload = 'auto';
        
        audio.onwaiting = () => setIsLoading(true);
        audio.onplaying = () => setIsLoading(false);
        audio.oncanplay = () => setIsLoading(false);
        audio.onerror = (e) => {
            console.error("Audio Error", e);
            setIsLoading(false);
            setError("Unable to stream this track.");
        };
        
        audioRef.current = audio;
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    };
  }, []);

  // Handle Track Changes and Playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updatePlayback = async () => {
        try {
            // 1. Update Source if changed
            if (audio.src !== currentTrack.url) {
                setError(null); // Clear error immediately on new track
                setIsLoading(true);
                audio.src = currentTrack.url;
                audio.load(); // Force reload
            }

            // 2. Handle Play/Pause
            if (isPlaying) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        // Don't warn for AbortError (rapid switching)
                        if (err.name !== 'AbortError') {
                            console.warn("Auto-play prevented:", err);
                        }
                    });
                }
            } else {
                audio.pause();
            }
        } catch (err) {
            console.error("Playback logic error", err);
        }
    };

    updatePlayback();
  }, [currentTrack, isPlaying]);

  // Handle Volume
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = volume;
      }
  }, [volume]);

  const filteredLibrary = MUSIC_LIBRARY.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm mt-6 transition-all duration-300 hover:shadow-md relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sound Therapy</h3>
           <p className="text-[10px] text-teal-600 font-medium">Ambient Player</p>
        </div>
        
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setShowLibrary(!showLibrary)}
                className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-colors"
            >
                {showLibrary ? 'Close' : 'Browse'}
            </button>
        </div>
      </div>

      {showLibrary ? (
        <div className="bg-white rounded-lg p-3 border border-slate-100 relative animate-fade-in min-h-[200px]">
            <input 
                type="text"
                placeholder="Search mood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1 mb-2 focus:outline-none focus:border-teal-500"
            />
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${selectedCategory === cat ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="space-y-1 max-h-[150px] overflow-y-auto scrollbar-hide">
                {filteredLibrary.map(track => (
                    <button 
                        key={track.title}
                        onClick={() => { onTrackSelect(track); setShowLibrary(false); }}
                        className={`w-full text-left px-2 py-1.5 rounded flex justify-between items-center ${currentTrack.title === track.title ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                        <div className="flex flex-col">
                            <span className="text-xs font-medium">{track.title}</span>
                            <span className="text-[9px] text-slate-400">{track.tags.slice(0, 2).join(', ')}</span>
                        </div>
                        {currentTrack.title === track.title && isPlaying && (
                            <span className="flex space-x-0.5 h-3 items-end">
                                <span className="w-0.5 bg-teal-500 animate-[pulse_0.6s_ease-in-out_infinite]" style={{height: '60%'}}></span>
                                <span className="w-0.5 bg-teal-500 animate-[pulse_0.8s_ease-in-out_infinite]" style={{height: '100%'}}></span>
                                <span className="w-0.5 bg-teal-500 animate-[pulse_0.5s_ease-in-out_infinite]" style={{height: '40%'}}></span>
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-3 border border-slate-100 relative overflow-hidden">
            
            {/* CSS Visualizer */}
            <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-10 pointer-events-none pb-0">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                        key={i}
                        className="w-1 bg-teal-600 rounded-t-sm transition-all duration-100"
                        style={{ 
                            height: isPlaying ? `${20 + Math.random() * 60}%` : '10%',
                            animation: isPlaying ? `bounce ${0.5 + Math.random()}s infinite alternate` : 'none'
                        }}
                    ></div>
                ))}
            </div>

            <div className="text-center mb-4 relative z-10 mt-2">
                <p className="font-bold text-slate-800 text-sm transition-all truncate px-2">{currentTrack.title}</p>
                <p className="text-xs text-slate-400">{currentTrack.category} Soundscape</p>
            </div>

            <div className="flex justify-between items-center px-4 mb-4 relative z-10">
                <button onClick={onPrev} className="text-slate-400 hover:text-teal-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                    </svg>
                </button>

                <button 
                    onClick={onToggle} 
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-white transition-all shadow-lg hover:scale-105 active:scale-95 ${isPlaying ? 'bg-teal-600 shadow-teal-200' : 'bg-slate-800 shadow-slate-300'}`}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : error ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 pl-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>

                <button onClick={onNext} className="text-slate-400 hover:text-teal-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center space-x-2 px-2 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none"
                />
            </div>
            
            {error && <p className="text-[10px] text-red-500 text-center mt-2 animate-pulse">{error}</p>}
            
            <style>{`
                @keyframes bounce {
                    0% { height: 10%; }
                    100% { height: 90%; }
                }
            `}</style>
        </div>
      )}
    </div>
  );
};
