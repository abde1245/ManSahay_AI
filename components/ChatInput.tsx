
import React, { useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onToggleSearch: () => void;
  isSearchEnabled: boolean;
  onFileUpload: (file: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  isLoading, 
  onToggleSearch, 
  isSearchEnabled,
  onFileUpload
}) => {
  const { isListening, transcript, error, startListening, stopListening, hasSupport, resetTranscript } = useSpeechRecognition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent input when speech transcript changes
  useEffect(() => {
    if (transcript) {
      onChange(value ? value + ' ' + transcript : transcript);
      resetTranscript(); // Clear internal transcript after appending
    }
  }, [transcript, onChange, value, resetTranscript]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const toggleMic = () => {
    if (!hasSupport) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white border-t border-slate-200">
      <div className={`max-w-4xl mx-auto relative flex items-center shadow-sm rounded-full border transition-all ${isSearchEnabled ? 'border-teal-400 bg-teal-50/30' : 'border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500'}`}>
        
        {/* File Upload */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*,.txt,.pdf"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-3 p-2 rounded-full text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
          title="Upload File"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Web Search Toggle */}
        <button
          onClick={onToggleSearch}
          className={`ml-1 p-2 rounded-full transition-all flex items-center justify-center ${isSearchEnabled ? 'bg-teal-100 text-teal-700' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-100'}`}
          title={isSearchEnabled ? "Web Search Active" : "Enable Web Search"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 18v-1.943A2 2 0 008 15v-1a1 1 0 01-1-1v-2a1 1 0 011-1h.332z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Microphone Button */}
        <button 
          onClick={toggleMic}
          className={`ml-1 p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-200' : 'text-slate-400 hover:text-teal-600'} ${error ? 'text-red-500' : ''}`}
          title={error || (isListening ? "Stop Recording" : "Voice Input")}
        >
          {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
          ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
          )}
        </button>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : (isSearchEnabled ? "Ask the web..." : "Type here... I'm listening.")}
          className="w-full bg-transparent border-none rounded-full py-3.5 px-4 pr-14 focus:ring-0 text-slate-700 placeholder-slate-400 resize-none overflow-hidden"
          rows={1}
          style={{ minHeight: '50px' }}
        />
        
        <button 
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          className={`absolute right-2 p-2.5 rounded-full transition-colors shadow-md ${!value.trim() || isLoading ? 'bg-slate-200 text-slate-400' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>

      {/* Error Feedback / Status Area */}
      <div className="text-center mt-2 min-h-[1.25rem]">
        {error ? (
          <p className="text-xs text-red-500 font-medium animate-pulse">{error}</p>
        ) : isSearchEnabled ? (
             <p className="text-[10px] text-teal-600 font-medium">
               <span className="inline-block w-1.5 h-1.5 bg-teal-500 rounded-full mr-1"></span>
               Web Access Enabled
             </p>
        ) : (
          <p className="text-[10px] text-slate-400">
            Mansahay AI can make mistakes. In emergencies, always call professional services directly.
          </p>
        )}
      </div>
    </div>
  );
};
