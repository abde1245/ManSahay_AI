
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role, AssessmentType, JournalEntry, Resource } from '../types';
import { BreathingWidget } from './BreathingWidget';
import { DoctorList } from './DoctorList';
import { AssessmentWidget } from './AssessmentWidget';
import { JournalWidget } from './JournalWidget';
import { GroundingWidget } from './GroundingWidget';
import { ArtWidget } from './ArtWidget';

interface ChatMessageProps {
  msg: Message;
  isLast: boolean;
  onAssessmentComplete?: (score: number, type: AssessmentType, answers: number[]) => void;
  onJournalSave?: (entry: JournalEntry) => void;
  onResourceSave?: (resource: Resource) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg, isLast, onAssessmentComplete, onJournalSave, onResourceSave }) => {
  
  const [displayedText, setDisplayedText] = useState('');
  const isAI = msg.role === Role.MODEL;

  // Typewriter Effect Logic
  useEffect(() => {
    // If it's not AI, or it's not the last message (history), show full text immediately
    if (!isAI || !isLast) {
      setDisplayedText(msg.text);
      return;
    }

    // If it is the last AI message, stream it
    let currentIndex = 0;
    const fullText = msg.text;
    
    // If we are already done (e.g. component re-render), don't restart
    if (displayedText === fullText) return;

    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(prev => fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Speed: 15ms per character

    return () => clearInterval(interval);
  }, [msg.text, isAI, isLast]);

  const isErrorMessage = (text: string) => {
    return text.startsWith('Error') || text.startsWith('Connection Error') || text.startsWith('Authentication Error') || text.startsWith('Configuration Error') || text.includes('Error (');
  };

  return (
    <div className={`flex flex-col ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
      {/* Text Bubble */}
      {msg.role !== Role.SYSTEM && (
        <div className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed animate-fade-in
          ${msg.role === Role.USER
            ? 'bg-slate-800 text-white rounded-br-none'
            : isErrorMessage(msg.text)
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
              : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
          }`}>
          {/* Markdown Rendering */}
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-inherit prose-headings:text-inherit prose-strong:text-inherit prose-ul:text-inherit prose-ol:text-inherit">
            <ReactMarkdown>
              {isAI && isLast ? displayedText : msg.text}
            </ReactMarkdown>
          </div>

          {/* Sources (Web Search Results) */}
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-black/10 animate-fade-in">
              <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Sources</p>
              <div className="flex flex-wrap gap-2">
                {msg.sources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-slate-600 border border-slate-200 text-xs px-2 py-1 rounded-full transition-colors truncate max-w-[200px]"
                    title={source.title}
                  >
                    <span className="truncate">{source.title}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Notifications */}
      {msg.role === Role.SYSTEM && (
        <div className="w-full flex justify-center my-2 animate-fade-in">
          <span className="bg-slate-200/70 text-slate-500 text-[10px] py-1 px-3 rounded-full uppercase tracking-wider font-bold border border-slate-200">
            {msg.text}
          </span>
        </div>
      )}

      {/* Widgets (Tools) - Only show widgets after text typing is mostly done or if not streaming */}
      {(!isAI || !isLast || displayedText.length > 10) && (
          <div className="w-full max-w-md animate-fade-in">
            {msg.widget === 'coping-breathing' && <BreathingWidget />}
            {msg.widget === 'coping-journal' && <JournalWidget prompt={msg.widgetData?.focus} onSave={onJournalSave} />}
            {msg.widget === 'coping-grounding' && <GroundingWidget />}
            {msg.widget === 'coping-art' && onResourceSave && <ArtWidget onSave={onResourceSave} />}
            {msg.widget === 'booking' && <DoctorList specialty={msg.widgetData?.specialty || 'General'} />}
            {msg.widget === 'assessment' && (
                <AssessmentWidget 
                    type={msg.widgetData?.type || 'PHQ9'} 
                    onComplete={onAssessmentComplete}
                />
            )}
          </div>
      )}

      <span className="text-[10px] text-slate-400 mt-1 px-1 select-none">
        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};
