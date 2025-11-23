
import React from 'react';
import { JournalEntry, MoodType } from '../types';

interface Props {
  entries: JournalEntry[];
  onSelect: (entry: JournalEntry) => void;
  onDelete?: (id: string) => void;
}

const MOOD_EMOJIS: Record<MoodType, string> = {
  excellent: '😄',
  good: '🙂',
  neutral: '😐',
  sad: '😔',
  anxious: '😰',
  overwhelmed: '😫',
  angry: '😠'
};

export const JournalEntries: React.FC<Props> = ({ entries, onSelect, onDelete }) => {
  if (entries.length === 0) {
     return (
       <div className="text-center py-6 px-4">
          <p className="text-slate-500 text-xs italic">Your journal is empty.</p>
          <p className="text-slate-400 text-[10px] mt-1">Write in the chat or start a new entry.</p>
       </div>
     );
  }

  // Sidebar Compact List
  return (
    <div className="space-y-2 px-1">
       {entries.slice().reverse().map(entry => (
          <div 
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-all group relative"
          >
             <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-slate-200 text-xs truncate flex-1 pr-2">{entry.title}</span>
                <span className="text-sm opacity-80 group-hover:opacity-0 transition-opacity">{MOOD_EMOJIS[entry.mood]}</span>
             </div>
             <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                {entry.content}
             </p>
             <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] text-slate-600">{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                {entry.tags.length > 0 && (
                   <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">#{entry.tags[0]}</span>
                )}
             </div>

             {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                  className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80 p-0.5 rounded"
                  title="Delete Entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             )}
          </div>
       ))}
    </div>
  );
};
