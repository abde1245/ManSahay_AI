
import React from 'react';
import { RiskAnalysis, AnalysisState, MusicState, ChatSession } from '../types';
import { MusicPlayer } from './MusicPlayer';
import { MoodChart } from './MoodChart';
import { ttsService } from '../services/ttsService';
import { MUSIC_LIBRARY } from '../data/musicLibrary';

interface DashboardProps {
  analysis: RiskAnalysis;
  musicState: MusicState;
  sessions: ChatSession[];
  onPromptClick: (prompt: string) => void;
  onMusicChange: (newState: Partial<MusicState>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  analysis, 
  musicState,
  sessions,
  onPromptClick,
  onMusicChange
}) => {
  
  const [voiceEnabled, setVoiceEnabled] = React.useState(ttsService.isEnabled());

  const toggleVoice = () => {
      const newState = !voiceEnabled;
      setVoiceEnabled(newState);
      ttsService.setEnabled(newState);
  };

  const getRiskColor = (level: AnalysisState) => {
    switch (level) {
      case AnalysisState.STABLE: return 'text-teal-600 bg-teal-50 border-teal-200';
      case AnalysisState.ELEVATED: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case AnalysisState.DISTRESS: return 'text-orange-600 bg-orange-50 border-orange-200';
      case AnalysisState.HIGH_RISK: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getRiskIndicator = (level: AnalysisState) => {
    if (level === AnalysisState.HIGH_RISK) return 'bg-red-500 animate-ping';
    if (level === AnalysisState.DISTRESS) return 'bg-orange-500 animate-pulse';
    if (level === AnalysisState.ELEVATED) return 'bg-yellow-500';
    return 'bg-teal-500';
  };

  const handleNext = () => {
    const currentIndex = MUSIC_LIBRARY.findIndex(t => t.title === musicState.currentTrack.title);
    const nextIndex = (currentIndex + 1) % MUSIC_LIBRARY.length;
    onMusicChange({ currentTrack: MUSIC_LIBRARY[nextIndex] });
  };

  const handlePrev = () => {
    const currentIndex = MUSIC_LIBRARY.findIndex(t => t.title === musicState.currentTrack.title);
    const prevIndex = (currentIndex - 1 + MUSIC_LIBRARY.length) % MUSIC_LIBRARY.length;
    onMusicChange({ currentTrack: MUSIC_LIBRARY[prevIndex] });
  };

  return (
    <div className="hidden md:flex w-80 bg-white border-l border-slate-200 flex-col p-6 overflow-y-auto flex-none scrollbar-hide h-full">
      <div className="space-y-6">
        
        {/* Header with Voice Toggle */}
        <div className="flex items-center justify-between mb-2">
             <h2 className="text-sm font-bold text-slate-800">Live Dashboard</h2>
             <button 
                onClick={toggleVoice}
                className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                title={voiceEnabled ? "Voice Output ON" : "Voice Output OFF"}
             >
                {voiceEnabled ? (
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

        {/* Live Analysis Card */}
        <div className={`p-4 rounded-xl border shadow-sm transition-all duration-500 ${getRiskColor(analysis.level)}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">Current State</h3>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] uppercase font-bold opacity-70">Live</span>
              <div className={`w-2 h-2 rounded-full ${getRiskIndicator(analysis.level)}`}></div>
            </div>
          </div>

          <div className="mb-3">
            <span className="text-lg font-bold block leading-none mb-1">
              {analysis.level}
            </span>
            <span className="text-xs opacity-80 font-medium bg-white/50 px-2 py-0.5 rounded-full">
              Mood: {analysis.sentiment}
            </span>
          </div>

          <div className="border-t border-black/5 pt-2 mt-2">
            <p className="text-[10px] uppercase tracking-wide opacity-60 mb-1">Reasoning</p>
            <p className="text-xs leading-snug opacity-90 italic">
              "{analysis.reason}"
            </p>
          </div>
        </div>
        
        {/* Mood Analytics Chart */}
        <MoodChart sessions={sessions} />

        {/* Music Player Widget (Controlled) */}
        <MusicPlayer 
           isPlaying={musicState.isPlaying}
           currentTrack={musicState.currentTrack}
           volume={musicState.volume}
           onToggle={() => onMusicChange({ isPlaying: !musicState.isPlaying })}
           onNext={handleNext}
           onPrev={handlePrev}
           onVolumeChange={(vol) => onMusicChange({ volume: vol })}
           onTrackSelect={(track) => onMusicChange({ currentTrack: track, isPlaying: true })}
        />

        {/* Suggested Prompts */}
        <div className="mt-auto pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => onPromptClick("I've been feeling really down and don't want to do anything.")} className="text-left w-full text-xs p-2 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-slate-600">
              "I've been feeling really down..."
            </button>
            <button onClick={() => onPromptClick("I feel overwhelmed, can I draw something?")} className="text-left w-full text-xs p-2 bg-purple-50 hover:bg-purple-100 rounded transition-colors text-purple-600 border border-purple-100">
               Try Art Therapy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
