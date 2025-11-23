
import React from 'react';

export const LoadingBubble: React.FC = () => {
  return (
    <div className="flex flex-col items-start animate-fade-in my-2 ml-2">
      <div className="bg-white px-4 py-4 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center space-x-1.5 min-w-[60px] justify-center">
         <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
         <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
         <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-[10px] text-slate-400 mt-1 ml-1">Mansahay is typing...</span>
    </div>
  );
};
