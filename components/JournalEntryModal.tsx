
import React, { useState } from 'react';
import { JournalEntry, MoodType } from '../types';
import { JournalWidget } from './JournalWidget';

interface Props {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
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

export const JournalEntryModal: React.FC<Props> = ({ entry, isOpen, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <button 
            onClick={() => { setIsEditing(false); onClose(); }}
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
                   onDelete(entry.id);
                   onClose();
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
                 existingEntry={entry} 
                 onSave={(updated) => {
                    onUpdate(updated);
                    setIsEditing(false);
                 }} 
              />
           ) : (
              <div className="prose prose-slate max-w-none">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">{MOOD_EMOJIS[entry.mood]}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 m-0 leading-tight">{entry.title}</h2>
                      <p className="text-slate-400 text-sm m-0">{new Date(entry.createdAt).toLocaleDateString()} • {entry.wordCount} words</p>
                    </div>
                 </div>
                 
                 {entry.prompt && (
                   <blockquote className="border-l-4 border-teal-500 pl-4 italic text-slate-500 my-6 bg-slate-50 p-4 rounded-r-lg">
                      {entry.prompt}
                   </blockquote>
                 )}

                 <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
                    {entry.content}
                 </div>

                 <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2">
                    {entry.tags.map(t => (
                       <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">#{t}</span>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
