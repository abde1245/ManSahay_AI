
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from './services/geminiService';
import { storageService } from './services/storageService';
import { contextService } from './services/contextService';
import { ttsService } from './services/ttsService';
import { Message, Role, AnalysisState, RiskAnalysis, AssessmentType, ChatSession, MusicState, Appointment, User, Resource, JournalEntry, Track } from './types';
import { EmergencyOverlay } from './components/EmergencyOverlay';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { AppointmentModal } from './components/AppointmentModal';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ResourceModal } from './components/ResourceModal';
import { processFile } from './utils/fileProcessor';
import { MUSIC_LIBRARY } from './data/musicLibrary';
import { LoadingBubble } from './components/LoadingBubble';

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: Role.MODEL,
  text: "Hello. I'm **Mansahay**. I'm here to listen and support you in a safe space. \n\nHow are you feeling today?",
  timestamp: new Date()
};

const INITIAL_ANALYSIS: RiskAnalysis = {
  level: AnalysisState.STABLE,
  sentiment: 'Neutral',
  reason: 'Awaiting user input...',
  lastUpdated: new Date()
};

export default function App() {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  // --- App State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('new');
  
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Web Search State
  const [useWebSearch, setUseWebSearch] = useState(false);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Real-time Analysis State
  const [analysis, setAnalysis] = useState<RiskAnalysis>(INITIAL_ANALYSIS);
  
  // Music State
  const [musicState, setMusicState] = useState<MusicState>({
    isPlaying: false,
    currentTrack: MUSIC_LIBRARY[0],
    volume: 0.3
  });
  
  // Appointment & Resource State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [userLocation, setUserLocation] = useState<string>('');

  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Auth Initialization & Geolocation ---
  useEffect(() => {
    const init = async () => {
        const storedUser = storageService.getUser();
        if (storedUser) {
          setCurrentUser(storedUser);
          const data = storageService.loadData(storedUser.id);
          setSessions(data.sessions);
          setAppointments(data.appointments);
          setResources(data.resources);
          setJournalEntries(data.journalEntries);
          
          // Calculate Streak
          const today = new Date().toDateString();
          const lastLogin = localStorage.getItem(`mansahay_last_login_${storedUser.id}`);
          let currentStreak = parseInt(localStorage.getItem(`mansahay_streak_${storedUser.id}`) || '0');
          
          if (lastLogin !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              if (lastLogin === yesterday.toDateString()) {
                  currentStreak += 1;
              } else {
                  currentStreak = 1;
              }
              localStorage.setItem(`mansahay_last_login_${storedUser.id}`, today);
              localStorage.setItem(`mansahay_streak_${storedUser.id}`, currentStreak.toString());
          }
          setStreak(currentStreak);
          
          if (data.sessions.length > 0) {
            const lastSession = data.sessions[data.sessions.length - 1];
            setActiveSessionId(lastSession.id);
            setMessages(lastSession.messages);
            setAnalysis(lastSession.analysis);
          }
        }
        
        const loc = await contextService.getUserLocation();
        setUserLocation(loc);
        
        setAuthLoading(false);
    };
    
    init();
  }, []);

  // --- Persistence Effects ---
  useEffect(() => {
    if (currentUser) {
      storageService.saveData(currentUser.id, sessions, appointments, resources, journalEntries);
    }
  }, [sessions, appointments, resources, journalEntries, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Smart History Sync
  useEffect(() => {
    if (activeSessionId === 'new') return;

    setSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === activeSessionId);
      const existingTitle = existingIndex >= 0 ? prevSessions[existingIndex].title : 'New Conversation';

      const updatedSession: ChatSession = {
        id: activeSessionId,
        title: existingTitle,
        messages: messages,
        analysis: analysis,
        lastModified: new Date()
      };

      if (existingIndex >= 0) {
        const newSessions = [...prevSessions];
        newSessions[existingIndex] = updatedSession;
        return newSessions;
      } else {
        return [...prevSessions, updatedSession];
      }
    });
  }, [messages, analysis, activeSessionId]);


  // --- Handlers ---

  const handleLogin = async (email: string) => {
    const user = await storageService.login(email);
    setCurrentUser(user);
    const data = storageService.loadData(user.id);
    setSessions(data.sessions);
    setAppointments(data.appointments);
    setResources(data.resources);
    setJournalEntries(data.journalEntries);
    setActiveSessionId('new');
    setMessages([INITIAL_MESSAGE]);
    setAnalysis(INITIAL_ANALYSIS);
    setShowAuthModal(false);
  };

  const handleSignup = async (name: string, email: string) => {
    const user = await storageService.signup(name, email);
    setCurrentUser(user);
    setSessions([]);
    setAppointments([]);
    setResources([]);
    setJournalEntries([]);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setSessions([]);
    setAppointments([]);
    setResources([]);
    setJournalEntries([]);
    setMessages([INITIAL_MESSAGE]);
    ttsService.stop();
  };

  const createNewChat = () => {
    setActiveSessionId('new');
    setMessages([INITIAL_MESSAGE]);
    setAnalysis(INITIAL_ANALYSIS);
    ttsService.stop();
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      setAnalysis(session.analysis);
      ttsService.stop();
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    
    if (activeSessionId === sessionId) {
      createNewChat();
    }
  };

  const handleTriggerTool = (toolId: string) => {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
          if (toolId === 'breathing' && lastMsg.widget === 'coping-breathing') return;
          if (toolId === 'journal' && lastMsg.widget === 'coping-journal') return;
      }

      const newMessageId = Date.now().toString();

      if (toolId === 'PHQ9' || toolId === 'GAD7' || toolId === 'SLEEP') {
          setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: `Manual Start: ${toolId}`,
            timestamp: new Date(),
            widget: 'assessment',
            widgetData: { type: toolId }
          }]);
      }
      else if (toolId === 'breathing') {
          setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: 'Launching Breathing Exercise',
            timestamp: new Date(),
            widget: 'coping-breathing'
          }]);
      }
      else if (toolId === 'grounding') {
          setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: 'Launching Grounding Technique',
            timestamp: new Date(),
            widget: 'coping-grounding'
          }]);
      }
      else if (toolId === 'journal') {
          setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: 'Opening Journal',
            timestamp: new Date(),
            widget: 'coping-journal'
          }]);
      }
      else if (toolId === 'art') {
        setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: 'Starting Art Therapy',
            timestamp: new Date(),
            widget: 'coping-art'
        }]);
      }
      else if (toolId === 'cbt') {
          handleSend("I'd like to try a CBT thought reframing exercise.");
      }
      else if (toolId === 'safety') {
          handleSend("I want to create a safety crisis plan.");
      }
      else if (toolId === 'music') {
          handleSend("Play some calming music to help me relax.");
      }

      if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const { content, type, mimeType } = await processFile(file);

      const newResource: Resource = {
        id: Date.now().toString(),
        title: file.name,
        type: type,
        origin: 'user',
        content: content,
        mimeType: mimeType,
        date: new Date()
      };

      setResources(prev => [newResource, ...prev]);
      
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: Role.SYSTEM,
          text: `File Uploaded: ${file.name}. Added to Wellness Vault.`,
          timestamp: new Date()
      }]);

      handleSend(`[SYSTEM TRIGGER] I just uploaded a file named "${file.name}". Please read it using 'readResource' and give me a brief summary.`, true);
    } catch (err: any) {
      alert(err.message || "Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResourceSave = (resource: Resource) => {
      setResources(prev => [resource, ...prev]);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.SYSTEM,
        text: `Resource Saved: ${resource.title}`,
        timestamp: new Date()
      }]);
      // Removed automatic chat trigger for art therapy to prevent API errors
  };

  const handleDeleteResource = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this file?")) {
        setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAssessmentComplete = (score: number, type: AssessmentType, answers: number[]) => {
    const prompt = `[SYSTEM TRIGGER] User completed ${type} assessment. Score: ${score}. Answers array: [${answers.join(',')}]. 
    Please generate a detailed clinical analysis of this result, risk level, and recommendations. 
    Then use the 'saveResource' tool to save this as a 'report' titled '${type} Assessment Report' to the vault.`;
    
    handleSend(prompt, true); 
  };

  const handleMusicChange = (newState: Partial<MusicState>) => {
    setMusicState(prev => ({ ...prev, ...newState }));
  };

  const handleAppointmentBook = (apt: Appointment) => {
      setAppointments(prev => [...prev, apt]);
      setShowAppointmentModal(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.SYSTEM,
        text: `Confirmed: Appointment with ${apt.doctorName} on ${apt.date}.`,
        timestamp: new Date()
      }]);
  };

  const handleCancelAppointment = (aptId: string) => {
    setAppointments(prev => prev.filter(a => a.id !== aptId));
  };

  const handleToolCall = (toolName: string, args: any) => {
    const newMessageId = Date.now().toString() + '-tool';
    
    if (toolName === 'triggerEmergencyProtocol') {
      const newAnalysis = {
          level: AnalysisState.HIGH_RISK,
          sentiment: 'Crisis',
          reason: args.reason || 'Immediate risk detected via protocol.',
          lastUpdated: new Date()
      };
      setAnalysis(newAnalysis);
      setEmergencyReason(args.reason || 'Risk detected');
      setShowEmergency(true);
      setMessages(prev => [...prev, {
        id: newMessageId,
        role: Role.SYSTEM,
        text: 'Emergency Protocol Activated. Contacting support network...',
        timestamp: new Date(),
        widget: 'emergency'
      }]);
    } 
    else if (toolName === 'updateRealtimeAnalysis') {
        let levelEnum = AnalysisState.STABLE;
        switch(args.level) {
            case 'ELEVATED': levelEnum = AnalysisState.ELEVATED; break;
            case 'DISTRESS': levelEnum = AnalysisState.DISTRESS; break;
            case 'HIGH_RISK': levelEnum = AnalysisState.HIGH_RISK; break;
            default: levelEnum = AnalysisState.STABLE;
        }
        setAnalysis({
            level: levelEnum,
            sentiment: args.sentiment || 'Unknown',
            reason: args.reason || 'Routine analysis update.',
            lastUpdated: new Date()
        });
    }
    else if (toolName === 'suggestCopingActivity') {
      if (args.type === 'art') {
        setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: 'Suggested Tool: Art Therapy',
            timestamp: new Date(),
            widget: 'coping-art'
        }]);
      } else if (args.type === 'breathing') {
        setMessages(prev => [...prev, {
          id: newMessageId,
          role: Role.SYSTEM,
          text: 'Suggested Tool: 4-7-8 Breathing',
          timestamp: new Date(),
          widget: 'coping-breathing'
        }]);
      } else if (args.type === 'journaling') {
        setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: 'Suggested Tool: Journaling',
            timestamp: new Date(),
            widget: 'coping-journal',
            widgetData: { focus: args.focus }
        }]);
      } else if (args.type === 'grounding') {
        setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: 'Suggested Tool: 5-4-3-2-1 Grounding',
            timestamp: new Date(),
            widget: 'coping-grounding'
        }]);
      }
    }
    else if (toolName === 'findProfessional') {
        setMessages(prev => [...prev, {
          id: newMessageId,
          role: Role.SYSTEM,
          text: `Locating: ${args.specialty || 'Specialists'}...`,
          timestamp: new Date(),
          widget: 'booking',
          widgetData: { specialty: args.specialty || 'General' }
        }]);
    }
    else if (toolName === 'bookAppointment') {
        const { doctorName, time, reason } = args;
        const newApt: Appointment = {
            id: Date.now().toString(),
            doctorId: 'ai-booked-' + Date.now(),
            doctorName: doctorName || 'Specialist',
            specialty: 'Mental Health Professional',
            location: 'Video Consultation',
            date: time || 'Upcoming',
            notes: reason
        };
        setAppointments(prev => [...prev, newApt]);
        setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: `Booking Confirmed: ${doctorName} at ${time}`,
            timestamp: new Date()
        }]);
    }
    else if (toolName === 'startAssessment') {
        const type = (args.assessmentType as AssessmentType) || 'PHQ9';
        setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: `Launching: ${type} Assessment`,
            timestamp: new Date(),
            widget: 'assessment',
            widgetData: { type }
        }]);
    }
    else if (toolName === 'controlMusicPlayer') {
       const { action, searchQuery } = args;
       
       if (action === 'PLAY') {
         handleMusicChange({ isPlaying: true });
       } else if (action === 'PAUSE') {
         handleMusicChange({ isPlaying: false });
       } else if (action === 'CHANGE_TRACK') {
         if (searchQuery) {
             const q = searchQuery.toLowerCase();
             
             // Smart Search Logic
             const scoredTracks = MUSIC_LIBRARY.map(track => {
                 let score = 0;
                 // High Priority: Tag Match (e.g. "sad" matches "sad")
                 if (track.tags.some(t => q.includes(t))) score += 3;
                 // Medium Priority: Title Match
                 if (track.title.toLowerCase().includes(q)) score += 2;
                 // Low Priority: Category Match
                 if (track.category.toLowerCase().includes(q)) score += 1;
                 return { track, score };
             }).sort((a, b) => b.score - a.score);

             // If we have a match with score > 0, play it
             if (scoredTracks[0].score > 0) {
                 handleMusicChange({ currentTrack: scoredTracks[0].track, isPlaying: true });
             } else {
                 // Fallback: Play something relaxing if no match found, instead of random
                 // This ensures we always play *something* appropriate
                 const fallback = MUSIC_LIBRARY.find(t => t.title === 'Gentle Rain') || MUSIC_LIBRARY[0];
                 handleMusicChange({ currentTrack: fallback, isPlaying: true });
             }
         }
       }
    }
    else if (toolName === 'saveResource') {
        const { title, content, type } = args;
        const newResource: Resource = {
            id: Date.now().toString(),
            title: title,
            content: content,
            type: type || 'report',
            origin: 'system',
            date: new Date()
        };
        setResources(prev => [newResource, ...prev]);
        setMessages(prev => [...prev, {
            id: newMessageId,
            role: Role.SYSTEM,
            text: `Saved to Vault: ${title}`,
            timestamp: new Date()
        }]);
    }
  };

  const handleSend = async (overrideInput?: string, isHidden: boolean = false) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    // Stop any ongoing speech when user types
    ttsService.stop();

    let currentSessionId = activeSessionId;
    let isFirstUserMessage = false;

    if (currentSessionId === 'new') {
      currentSessionId = Date.now().toString();
      setActiveSessionId(currentSessionId);
      isFirstUserMessage = true;
      
      const newSession: ChatSession = {
        id: currentSessionId,
        title: 'New Conversation',
        messages: [...messages],
        analysis: analysis,
        lastModified: new Date()
      };
      setSessions(prev => [newSession, ...prev]);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: isHidden ? '[System Event: User completed action]' : textToSend,
      timestamp: new Date()
    };

    if (!isHidden) {
        setMessages(prev => [...prev, userMsg]);
    }
    
    if (!overrideInput) setInput('');
    setIsLoading(true);

    if (isFirstUserMessage && !isHidden) {
      geminiService.generateChatTitle(textToSend).then(newTitle => {
        setSessions(prev => prev.map(s => 
          s.id === currentSessionId ? { ...s, title: newTitle } : s
        ));
      });
    }

    try {
      const result = await geminiService.sendMessage(
          textToSend, 
          handleToolCall,
          { 
              appointments: appointments, 
              mood: analysis.sentiment, 
              resources: resources,
              localTime: contextService.getCurrentTime(),
              location: userLocation,
              currentMusicTrack: musicState.currentTrack // Pass current track context
          },
          useWebSearch
      );
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: result.text,
        sources: result.sources,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
      
      // Speak the response
      ttsService.speak(result.text);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJournalEntrySave = (entry: JournalEntry) => {
    setJournalEntries(prev => {
        const exists = prev.find(e => e.id === entry.id);
        if (exists) {
            return prev.map(e => e.id === entry.id ? entry : e);
        }
        return [entry, ...prev];
    });
  };

  const handleJournalEntryDelete = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleJournalEntryEdit = (entry: JournalEntry) => {
    handleJournalEntrySave(entry);
  };
  
  const getRiskColor = (level: AnalysisState) => {
    switch (level) {
      case AnalysisState.STABLE: return 'border-teal-200 bg-teal-50 text-teal-700';
      case AnalysisState.ELEVATED: return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case AnalysisState.DISTRESS: return 'border-orange-200 bg-orange-50 text-orange-700';
      case AnalysisState.HIGH_RISK: return 'border-red-200 bg-red-50 text-red-700';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 bg-teal-600 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LandingPage onLoginClick={() => setShowAuthModal(true)} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      </>
    );
  }

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        user={currentUser}
        resources={resources}
        journalEntries={journalEntries}
        streak={streak} // Pass streak
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={createNewChat}
        onSwitchSession={switchSession}
        onDeleteSession={deleteSession}
        onTriggerTool={handleTriggerTool}
        onOpenAppointments={() => setShowAppointmentModal(true)}
        onLogout={handleLogout}
        onFileUpload={handleFileUpload}
        onOpenResource={(r) => setSelectedResource(r)}
        onDeleteResource={handleDeleteResource}
        onDeleteJournalEntry={handleJournalEntryDelete}
        onEditJournalEntry={handleJournalEntryEdit}
      />

      <div className={`hidden lg:block transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'}`}></div>

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="mr-4 text-slate-500 hover:text-teal-600 transition-colors focus:outline-none"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
               </svg>
             </button>

             <h1 className="font-bold text-teal-800 lg:hidden">Mansahay</h1>
             <h1 className="font-bold text-teal-800 hidden lg:block">
               {sessions.find(s => s.id === activeSessionId)?.title || "New Chat"}
             </h1>
          </div>

          <div className={`flex items-center px-2 py-1 rounded-full border ${getRiskColor(analysis.level)}`}>
             <span className="text-xs font-bold">{analysis.level}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide bg-slate-50/50">
          {messages.map((msg, index) => {
            return (
                <ChatMessage 
                    key={msg.id} 
                    msg={msg} 
                    isLast={index === messages.length - 1}
                    onAssessmentComplete={handleAssessmentComplete}
                    onJournalSave={handleJournalEntrySave}
                    onResourceSave={handleResourceSave}
                />
            );
          })}
          
          {isLoading && <LoadingBubble />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput 
          value={input} 
          onChange={setInput} 
          onSend={() => handleSend()} 
          isLoading={isLoading}
          isSearchEnabled={useWebSearch}
          onToggleSearch={() => setUseWebSearch(!useWebSearch)}
          onFileUpload={handleFileUpload}
        />

      </div>

      <Dashboard 
        analysis={analysis} 
        musicState={musicState}
        sessions={sessions}
        onPromptClick={(p) => setInput(p)} 
        onMusicChange={handleMusicChange}
      />

      {showEmergency && (
        <EmergencyOverlay 
            reason={emergencyReason} 
            onClose={() => {
                setShowEmergency(false);
                setAnalysis({
                    level: AnalysisState.STABLE,
                    sentiment: 'Reset',
                    reason: 'Protocol Deactivated by User',
                    lastUpdated: new Date()
                });
            }} 
        />
      )}

      <AppointmentModal 
        isOpen={showAppointmentModal} 
        onClose={() => setShowAppointmentModal(false)}
        appointments={appointments}
        onBook={handleAppointmentBook}
        onCancel={handleCancelAppointment}
      />
      
      <ResourceModal 
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
      />
    </div>
  );
}
