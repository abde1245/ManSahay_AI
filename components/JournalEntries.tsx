
import React, { useState } from 'react';
import { JournalEntry, MoodType } from '../types';
import { JournalWidget } from './JournalWidget';

interface Props {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  onEdit?: (entry: JournalEntry) => void;
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

export const JournalEntries: React.FC<Props> = ({ entries, onDelete, onEdit }) => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  if (selectedEntry) {
    // Reader Modal
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <button 
              onClick={() => { setSelectedEntry(null); setIsEditing(false); }}
              className="text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
            <div className="flex gap-2">
               {!isEditing && (
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="text-teal-600 hover:text-teal-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-teal-50"
                 >
                   Edit
                 </button>
               )}
               <button 
                 onClick={() => {
                   if(window.confirm('Delete this entry?')) {
                     onDelete(selectedEntry.id);
                     setSelectedEntry(null);
                   }
                 }}
                 className="text-red-500 hover:text-red-600 font-medium text-sm px-3 py-1 rounded-lg hover:bg-red-50"
               >
                 Delete
               </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
             {isEditing ? (
                <JournalWidget 
                   existingEntry={selectedEntry} 
                   onSave={(updated) => {
                      if (onEdit) onEdit(updated);
                      setSelectedEntry(updated);
                      setIsEditing(false);
                   }} 
                />
             ) : (
                <div className="prose prose-slate max-w-none">
                   <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">{MOOD_EMOJIS[selectedEntry.mood]}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 m-0 leading-tight">{selectedEntry.title}</h2>
                        <p className="text-slate-400 text-sm m-0">{new Date(selectedEntry.createdAt).toLocaleDateString()} • {selectedEntry.wordCount} words</p>
                      </div>
                   </div>
                   
                   {selectedEntry.prompt && (
                     <blockquote className="border-l-4 border-teal-500 pl-4 italic text-slate-500 my-6 bg-slate-50 p-4 rounded-r-lg">
                        {selectedEntry.prompt}
                     </blockquote>
                   )}

                   <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
                      {selectedEntry.content}
                   </div>

                   <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2">
                      {selectedEntry.tags.map(t => (
                         <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">#{t}</span>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => setSelectedEntry(entry)}
            className="bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-all group"
          >
             <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-slate-200 text-xs truncate flex-1 pr-2">{entry.title}</span>
                <span className="text-sm opacity-80">{MOOD_EMOJIS[entry.mood]}</span>
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
          </div>
       ))}
    </div>
  );
};
