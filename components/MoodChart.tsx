
import React from 'react';
import { ChatSession, AnalysisState } from '../types';

interface Props {
  sessions: ChatSession[];
}

export const MoodChart: React.FC<Props> = ({ sessions }) => {
  // Helper to map risk/mood to a numeric score (0-10)
  // High Risk = 2, Distress = 4, Elevated = 6, Stable = 9
  const getScore = (level: AnalysisState) => {
    switch (level) {
      case AnalysisState.STABLE: return 9;
      case AnalysisState.ELEVATED: return 6;
      case AnalysisState.DISTRESS: return 4;
      case AnalysisState.HIGH_RISK: return 2;
      default: return 7;
    }
  };

  // Get last 7 sessions or fewer
  const recentSessions = sessions.slice(-7);
  
  if (recentSessions.length < 2) {
      return (
          <div className="h-32 flex items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <p className="text-xs text-slate-400">Not enough data for trend analysis.<br/>Start more chats to see your mood journey.</p>
          </div>
      );
  }

  const points = recentSessions.map((s, i) => {
    const score = getScore(s.analysis.level);
    const x = (i / (recentSessions.length - 1)) * 100;
    const y = 100 - (score * 10); // Invert Y (0 is top in SVG)
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-end mb-4">
         <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mood Trend</h3>
         <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">Last 7 Sessions</span>
      </div>
      
      <div className="relative h-24 w-full">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-300 pointer-events-none">
            <div className="border-b border-slate-100 w-full h-0"></div>
            <div className="border-b border-slate-100 w-full h-0"></div>
            <div className="border-b border-slate-100 w-full h-0"></div>
        </div>

        {/* Chart */}
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
           {/* Gradient Area */}
           <defs>
             <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
               <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
             </linearGradient>
           </defs>
           
           <polyline 
             fill="none" 
             stroke="#0d9488" 
             strokeWidth="2" 
             points={points} 
             vectorEffect="non-scaling-stroke"
             strokeLinecap="round"
             strokeLinejoin="round"
           />
           {/* Dots */}
           {recentSessions.map((s, i) => {
                const score = getScore(s.analysis.level);
                const x = (i / (recentSessions.length - 1)) * 100;
                const y = 100 - (score * 10);
                return (
                    <circle 
                        key={s.id}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="3"
                        fill="#fff"
                        stroke="#0d9488"
                        strokeWidth="2"
                    />
                );
           })}
        </svg>
      </div>
      
      <div className="flex justify-between mt-2 text-[9px] text-slate-400">
         <span>Past</span>
         <span>Recent</span>
      </div>
    </div>
  );
};
