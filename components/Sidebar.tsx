
import React, { useRef, useState, useEffect } from 'react';
import { ChatSession, User, Resource, JournalEntry } from '../types';
import { JournalEntries } from './JournalEntries';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  isOpen: boolean;
  user: User | null;
  resources?: Resource[];
  journalEntries?: JournalEntry[];
  streak?: number;
  onToggle: () => void;
  onNewChat: () => void;
  onSwitchSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onTriggerTool: (toolId: string) => void;
  onOpenAppointments: () => void;
  onLogout: () => void;
  onFileUpload: (file: File) => void;
  onOpenResource: (resource: Resource) => void;
  onDeleteResource: (e: React.MouseEvent, id: string) => void;
  onSelectJournalEntry: (entry: JournalEntry) => void;
  onDeleteJournalEntry: (id: string) => void;
  onEditJournalEntry: (entry: JournalEntry) => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  isOpen,
  user,
  resources = [],
  journalEntries = [],
  streak = 0,
  onToggle,
  onNewChat,
  onSwitchSession,
  onDeleteSession,
  onTriggerTool,
  onOpenAppointments,
  onLogout,
  onFileUpload,
  onOpenResource,
  onDeleteResource,
  onSelectJournalEntry,
  onDeleteJournalEntry,
  onEditJournalEntry,
  onOpenProfile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vaultTab, setVaultTab] = useState<'uploads' | 'reports' | 'journal' | 'art'>('uploads');
  const [chatSearch, setChatSearch] = useState('');
  const [vaultSearch, setVaultSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayedResources = resources.filter(r => {
    const matchesSearch = !vaultSearch || r.title.toLowerCase().includes(vaultSearch.toLowerCase());
    
    if (vaultTab === 'uploads') {
        // User uploads that aren't specifically Art Therapy images
        return r.origin === 'user' && !r.title.startsWith('Art Therapy') && matchesSearch;
    }
    if (vaultTab === 'reports') {
        return r.origin === 'system' && matchesSearch;
    }
    if (vaultTab === 'art') {
        return r.type === 'image' && r.title.startsWith('Art Therapy') && matchesSearch;
    }
    return false;
  });

  const displayedJournalEntries = journalEntries.filter(j => 
    !vaultSearch 
    || j.title.toLowerCase().includes(vaultSearch.toLowerCase())
    || j.content.toLowerCase().includes(vaultSearch.toLowerCase())
    || j.tags.some(t => t.toLowerCase().includes(vaultSearch.toLowerCase()))
  );

  const displayedSessions = sessions.filter(s => 
    !chatSearch 
    || s.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const TOOLS = [
    { 
      id: 'PHQ9', 
      label: 'Depression', 
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
    },
    { 
      id: 'GAD7', 
      label: 'Anxiety', 
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20 hover:bg-amber-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    },
    { 
      id: 'art', 
      label: 'Art Therapy', 
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:bg-purple-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    },
    { 
      id: 'breathing', 
      label: 'Breathe', 
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 hover:bg-cyan-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      id: 'grounding', 
      label: 'Grounding', 
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
    },
    { 
      id: 'journal', 
      label: 'Journal', 
      color: 'text-pink-400 bg-pink-400/10 border-pink-400/20 hover:bg-pink-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
    { 
      id: 'cbt', 
      label: 'Reframing', 
      color: 'text-violet-400 bg-violet-400/10 border-violet-400/20 hover:bg-violet-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    },
    { 
      id: 'safety', 
      label: 'Safety', 
      color: 'text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    },
    { 
      id: 'music', 
      label: 'Music', 
      color: 'text-teal-400 bg-teal-400/10 border-teal-400/20 hover:bg-teal-400/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
    },
  ];

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-20 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 h-full transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0'}
        overflow-hidden whitespace-nowrap
      `}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight opacity-100 transition-opacity duration-200">Mansahay</h1>
        </div>
        
        {/* Streak Indicator */}
        {streak > 0 && (
            <div className="flex items-center text-orange-400 text-xs font-bold space-x-1 bg-orange-400/10 px-2 py-1 rounded-full" title={`${streak} Day Wellness Streak`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 3.258 2.37 4.12z" clipRule="evenodd" />
                </svg>
                <span>{streak}</span>
            </div>
        )}

        <button onClick={onToggle} className="lg:hidden text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      <div className="p-4 pb-2">
        <button
          onClick={onNewChat}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2.5 px-4 rounded-lg flex items-center justify-center transition-all space-x-2 font-medium text-sm shadow-lg shadow-teal-900/20 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="px-4 py-2">
         <button 
            onClick={onOpenAppointments}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all space-x-2 text-sm border border-slate-700"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Find Professionals</span>
         </button>
      </div>

      {/* Wellness Vault Section */}
      <div className="px-4 py-2 border-t border-slate-800">
        <div className="flex justify-between items-center mb-2">
           <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Wellness Vault</p>
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
              accept="image/*,.txt,.pdf"
           />
           <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] bg-slate-800 hover:bg-teal-700 text-teal-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 transition-colors"
           >
             + Upload
           </button>
        </div>
        
        {/* Vault Tabs */}
        <div className="flex space-x-1 mb-2 bg-slate-800/50 p-1 rounded-lg">
           <button 
             onClick={() => { setVaultTab('uploads'); setVaultSearch(''); }}
             className={`flex-1 text-[10px] py-1 rounded transition-colors ${vaultTab === 'uploads' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             Uploads
           </button>
           <button 
             onClick={() => { setVaultTab('reports'); setVaultSearch(''); }}
             className={`flex-1 text-[10px] py-1 rounded transition-colors ${vaultTab === 'reports' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             Reports
           </button>
           <button 
             onClick={() => { setVaultTab('art'); setVaultSearch(''); }}
             className={`flex-1 text-[10px] py-1 rounded transition-colors ${vaultTab === 'art' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             Art
           </button>
           <button 
             onClick={() => { setVaultTab('journal'); setVaultSearch(''); }}
             className={`flex-1 text-[10px] py-1 rounded transition-colors ${vaultTab === 'journal' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             Journal
           </button>
        </div>

        {/* Vault Search */}
        {(displayedResources.length > 0 || displayedJournalEntries.length > 0 || vaultSearch) && (
            <div className="mb-2 relative">
                <input 
                    type="text"
                    value={vaultSearch}
                    onChange={(e) => setVaultSearch(e.target.value)}
                    placeholder={`Search ${vaultTab}...`}
                    className="w-full bg-slate-800 text-xs text-slate-300 rounded px-2 py-1 pl-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
        )}

        <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-hide">
          {vaultTab === 'journal' ? (
            <JournalEntries 
              entries={displayedJournalEntries}
              onSelect={onSelectJournalEntry}
              onDelete={onDeleteJournalEntry}
            />
          ) : (
            <>
              {displayedResources.length === 0 && (
                <p className="text-xs text-slate-600 italic px-2">
                    {vaultSearch ? 'No matches found.' : (vaultTab === 'uploads' ? 'No files uploaded.' : (vaultTab === 'art' ? 'No art created.' : 'No reports generated.'))}
                </p>
              )}
              {displayedResources.slice().reverse().map(r => (
                 <div key={r.id} className="group relative">
                     <button 
                        onClick={() => onOpenResource(r)}
                        className="w-full flex items-center text-left px-2 py-1.5 rounded hover:bg-slate-800 text-xs transition-colors text-slate-400 hover:text-teal-200"
                     >
                        {r.type === 'image' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        <span className="truncate flex-1">{r.title}</span>
                     </button>
                     
                     <button 
                        onClick={(e) => onDeleteResource(e, r.id)}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                 </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Self Assessment Tools Section */}
      <div className="px-4 py-2 border-t border-slate-800">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Self-Care Tools</p>
        <div className="grid grid-cols-3 gap-2">
          {TOOLS.map((tool) => (
            <button 
              key={tool.id}
              onClick={() => onTriggerTool(tool.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all group ${tool.color}`}
              title={tool.label}
            >
               <div className="mb-1">{tool.icon}</div>
               <span className="text-[9px] font-medium opacity-90">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-0 px-2 pb-6 space-y-0 scrollbar-hide border-t border-slate-800 flex flex-col">
        <div className="px-2 py-2 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
             <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent History</p>
        </div>
        
        {/* Chat Search */}
        <div className="px-2 mb-1 p-1 relative sticky top-8 bg-slate-900 z-10">
             <input 
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-slate-800 text-xs text-slate-300 rounded px-2 py-1 pl-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
             />
             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute right-4 top-1/2 transform -translate-y-1 text-slate-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
             </svg>
        </div>

        {displayedSessions.length === 0 && chatSearch && (
            <p className="text-xs text-slate-600 italic px-4">No chats found.</p>
        )}

        {displayedSessions.slice().reverse().map(session => (
          <div
            key={session.id}
            onClick={() => onSwitchSession(session.id)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all text-sm ${activeSessionId === session.id ? 'bg-slate-800 text-white shadow-sm' : 'hover:bg-slate-800/50 hover:text-white'}`}
          >
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="truncate font-medium">{session.title || 'New Conversation'}</span>
              <span className="text-[10px] text-slate-500">{session.lastModified.toLocaleDateString()}</span>
            </div>

            <button
              onClick={(e) => onDeleteSession(e, session.id)}
              className={`p-1 hover:text-red-400 text-slate-600 transition-colors flex-shrink-0 ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold flex-shrink-0 text-white uppercase">
              {/* Show First Initial */}
              {user?.name?.replace(/[0-9]/g, '').charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-xs overflow-hidden">
              <p className="text-white font-medium truncate">
                {/* Show Clean First Name */}
                {user?.name 
                  ? user.name.split('@')[0].replace(/[0-9]/g, '').charAt(0).toUpperCase() + 
                    user.name.split('@')[0].replace(/[0-9]/g, '').slice(1)
                  : 'User'}
              </p>
              <p className="text-slate-500 truncate">{user?.email || 'Guest'}</p>
            </div>
          </div>
          
          {/* ... (keep the existing menu button logic here) ... */}
          <div className="relative" ref={menuRef}>
              {/* ... existing button and menu logic ... */}
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="text-slate-500 hover:text-white p-1.5 rounded transition-colors" 
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              {showUserMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 py-1 z-50 animate-fade-in">
                      <button onClick={() => { setShowUserMenu(false); onOpenProfile(); }} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center">
                          Profile
                      </button>
                      <button onClick={() => { setShowUserMenu(false); onLogout(); }} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center">
                          Log Out
                      </button>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
