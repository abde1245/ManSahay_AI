
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Resource } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
}

export const ResourceModal: React.FC<Props> = ({ isOpen, onClose, resource }) => {
  if (!isOpen || !resource) return null;

  const isImage = resource.type === 'image' || resource.type === 'file' && resource.content.startsWith('data:image');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-teal-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {resource.type === 'report' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {resource.type === 'journal' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
              {(resource.type === 'file' || resource.type === 'image') && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold truncate max-w-md">{resource.title}</h2>
              <p className="text-teal-100 text-sm">{new Date(resource.date).toLocaleDateString()} • {resource.type.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="bg-white p-8 rounded-xl shadow-sm min-h-full border border-slate-100">
            {isImage ? (
              <div className="flex flex-col items-center">
                 <img src={resource.content} alt={resource.title} className="max-w-full h-auto rounded-lg shadow-md mb-6" />
                 
                 {/* AI Remarks Section */}
                 {resource.remarks && (
                    <div className="w-full bg-purple-50 border border-purple-100 rounded-xl p-6 mt-4">
                        <h3 className="text-purple-800 font-bold mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            AI Therapist's Interpretation
                        </h3>
                        <div className="prose prose-sm prose-purple text-slate-700">
                            <ReactMarkdown>{resource.remarks}</ReactMarkdown>
                        </div>
                    </div>
                 )}
              </div>
            ) : (
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <ReactMarkdown>{resource.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
                Close Viewer
            </button>
        </div>
      </div>
    </div>
  );
};
