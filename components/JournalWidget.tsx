
import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry, MoodType } from '../types';

interface Props {
  prompt?: string;
  onSave?: (entry: JournalEntry) => void;
  existingEntry?: JournalEntry; // Added for edit mode
}

const MOODS: { id: MoodType; label: string; emoji: string; color: string }[] = [
  { id: 'excellent', label: 'Great', emoji: '😄', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'good', label: 'Good', emoji: '🙂', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'neutral', label: 'Okay', emoji: '😐', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'sad', label: 'Down', emoji: '😔', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'overwhelmed', label: 'Stressed', emoji: '😫', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-100 text-red-700 border-red-300' },
];

const SUGGESTED_PROMPTS = [
  "What is one thing I learned about myself today?",
  "Describe a moment today where I felt at peace.",
  "What is worrying me right now, and is it within my control?",
  "Write a letter to your future self.",
  "List 3 small wins from this week."
];

export const JournalWidget: React.FC<Props> = ({ prompt, onSave, existingEntry }) => {
  const [title, setTitle] = useState(existingEntry?.title || '');
  const [content, setContent] = useState(existingEntry?.content || '');
  const [mood, setMood] = useState<MoodType>(existingEntry?.mood || 'neutral');
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const [isExpanded, setIsExpanded] = useState(!!existingEntry);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSave = () => {
    if (!content.trim()) return;

    const entry: JournalEntry = {
      id: existingEntry?.id || Date.now().toString(),
      title: title.trim() || new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      content,
      mood,
      tags,
      createdAt: existingEntry?.createdAt || new Date(),
      updatedAt: new Date(),
      prompt: prompt,
      wordCount: content.trim().split(/\s+/).length,
      isDraft: false
    };

    if (onSave) onSave(entry);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      // Reset if it's a new entry
      if (!existingEntry) {
        setTitle('');
        setContent('');
        setMood('neutral');
        setTags([]);
        setIsExpanded(false);
      }
    }, 2000);
  };

  if (isSaved) {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center animate-fade-in my-4 shadow-sm">
        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-teal-800 mb-2">Entry Saved</h3>
        <p className="text-teal-600">Your thoughts have been securely stored in your Wellness Vault.</p>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer my-4 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-teal-100 p-2 rounded-lg text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
               </svg>
             </div>
             <div>
               <h3 className="font-bold text-slate-700">Journal Entry</h3>
               <p className="text-sm text-slate-500">Tap to start writing...</p>
             </div>
          </div>
          <span className="text-slate-300 group-hover:text-teal-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
             </svg>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg my-4 overflow-hidden animate-fade-in ring-1 ring-slate-900/5">
      {/* Header / Title */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-start mb-4">
           <input 
             type="text"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             placeholder="Title (optional)"
             className="bg-transparent text-lg font-bold text-slate-800 placeholder-slate-400 focus:outline-none w-full"
           />
           <button onClick={() => !existingEntry && setIsExpanded(false)} className="text-slate-400 hover:text-slate-600 ml-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
             </svg>
           </button>
        </div>

        {/* Mood Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
           {MOODS.map(m => (
             <button
               key={m.id}
               onClick={() => setMood(m.id)}
               className={`flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                 mood === m.id ? m.color + ' shadow-sm scale-105' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
               }`}
             >
               <span>{m.emoji}</span>
               <span>{m.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="p-6 relative min-h-[200px]">
        {prompt && (
           <div className="mb-4 text-sm text-teal-600 bg-teal-50 p-3 rounded-lg border border-teal-100 italic">
             Prompt: "{prompt}"
           </div>
        )}
        
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing here..."
          className="w-full resize-none focus:outline-none text-slate-700 leading-relaxed bg-transparent placeholder-slate-300 min-h-[150px]"
        />

        {/* Prompt Suggester */}
        <div className="mt-8">
          <button 
            onClick={() => setShowPrompts(!showPrompts)}
            className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Need inspiration?
          </button>
          
          {showPrompts && (
            <div className="mt-2 grid gap-2 animate-fade-in">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setContent(prev => prev + (prev ? '\n\n' : '') + p + '\n');
                    setShowPrompts(false);
                  }}
                  className="text-left text-xs p-2 bg-slate-50 hover:bg-teal-50 text-slate-600 rounded border border-slate-100 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Tags / Save */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex-1 w-full">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-xs flex items-center">
                  #{tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 text-slate-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex items-center">
               <span className="text-slate-400 mr-2">#</span>
               <input 
                 type="text"
                 value={tagInput}
                 onChange={(e) => setTagInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                 placeholder="Add tags..."
                 className="bg-transparent text-sm focus:outline-none text-slate-600 w-full"
               />
            </div>
         </div>

         <button 
           onClick={handleSave}
           disabled={!content.trim()}
           className="bg-slate-800 hover:bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-slate-300 disabled:opacity-50 disabled:shadow-none w-full md:w-auto"
         >
           {existingEntry ? 'Update Entry' : 'Save Entry'}
         </button>
      </div>
    </div>
  );
};
