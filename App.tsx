
import React, { useState, useEffect } from 'react';
import { AppMode, ChatSession, Message, User } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import { chatWithAI } from './services/gemini';

const BOOT_MESSAGES = [
  "[SYSTEM] Initiating CypherAI Boot Protocol...",
  "[KERNEL] Loading offensive modules...",
  "[AUTH] Verifying neural link integrity...",
  "[NET] Synchronizing with global mesh...",
  "[SEC] Hardening sandbox environment...",
  "[READY] Deployment Version 4.2.0-STABLE",
  "ACCESS GRANTED."
];

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < BOOT_MESSAGES.length) {
        setLines(prev => [...prev, BOOT_MESSAGES[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col justify-center px-10 font-mono">
      <div className="max-w-xl mx-auto space-y-2">
        {lines.map((line, i) => (
          <div key={i} className={`text-sm ${(line && line.includes && line.includes('GRANTED')) ? 'text-green-500 font-bold' : 'text-green-500/60'}`}>
            <span className="opacity-40 mr-4">[{new Date().toLocaleTimeString()}]</span>
            {line}
          </div>
        ))}
        {lines.length < BOOT_MESSAGES.length && <div className="boot-cursor"></div>}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.STANDARD);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('cypher_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedSessions = localStorage.getItem('cypher_sessions_v6');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cypher_current_user', JSON.stringify(currentUser));
      const storedUsers = JSON.parse(localStorage.getItem('cypher_users') || '[]');
      const updatedUsers = storedUsers.some((u: any) => u.id === currentUser.id)
        ? storedUsers.map((u: any) => u.id === currentUser.id ? { ...u, photo: currentUser.photo } : u)
        : [...storedUsers, currentUser];
      localStorage.setItem('cypher_users', JSON.stringify(updatedUsers));
    } else {
      localStorage.removeItem('cypher_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cypher_sessions_v6', JSON.stringify(sessions));
  }, [sessions]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setMode(user.isHacker ? AppMode.HACKER : AppMode.STANDARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSessionId(null);
    setIsBooting(true); // Re-boot on logout
  };

  const updateUserPhoto = (photo: string) => {
    if (currentUser) setCurrentUser({ ...currentUser, photo });
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    const modeSessions = sessions.filter(s => s.mode === newMode && s.userId === currentUser?.id);
    if (modeSessions.length > 0) {
      setActiveSessionId(modeSessions[0].id);
    } else {
      setActiveSessionId(null);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId && s.mode === mode && s.userId === currentUser?.id) || null;

  const createNewSession = () => {
    if (!currentUser) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newSession: ChatSession = {
      id: newId,
      userId: currentUser.id,
      title: 'New Log',
      messages: [],
      mode: mode,
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (content: string, attachments?: { data: string; mimeType: string }[]) => {
    if (!currentUser) return;

    let currentId = activeSessionId;
    if (!currentId || (activeSession && activeSession.mode !== mode)) {
      currentId = Math.random().toString(36).substr(2, 9);
      const newSession: ChatSession = {
        id: currentId,
        userId: currentUser.id,
        title: content.slice(0, 30) || 'Multimedia Query',
        messages: [],
        mode: mode,
        lastUpdated: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(currentId);
    }

    const userMsg: Message = { role: 'user', content, timestamp: Date.now() };
    setSessions(prev => prev.map(s => s.id === currentId ? {
      ...s,
      messages: [...s.messages, userMsg],
      lastUpdated: Date.now(),
      title: s.messages.length === 0 ? (content.slice(0, 30) || 'New Chat') : s.title
    } : s));

    setIsLoading(true);
    try {
      const history = sessions.find(s => s.id === currentId)?.messages || [];
      const response = await chatWithAI(content, mode, [...history, userMsg], attachments);
      const assistantMsg: Message = { role: 'assistant', content: response, timestamp: Date.now() };
      setSessions(prev => prev.map(s => s.id === currentId ? {
        ...s,
        messages: [...s.messages, assistantMsg],
        lastUpdated: Date.now()
      } : s));
    } catch (err) {
      const errorMsg: Message = { 
        role: 'assistant', 
        content: mode === AppMode.HACKER 
          ? "CRITICAL: Connection dropped. Try again." 
          : "Sorry Bhai, lagta hai koi issue aa gaya hai. 😅", 
        timestamp: Date.now() 
      };
      setSessions(prev => prev.map(s => s.id === currentId ? {
        ...s,
        messages: [...s.messages, errorMsg],
        lastUpdated: Date.now()
      } : s));
    } finally {
      setIsLoading(false);
    }
  };

  if (isBooting) return <BootSequence onComplete={() => setIsBooting(false)} />;
  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 ${mode === AppMode.HACKER ? 'bg-[#050505]' : 'bg-[#020617]'} text-slate-200 overflow-hidden`}>
      <Sidebar 
        mode={mode} 
        setMode={handleModeChange} 
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        createNewSession={createNewSession}
        premiumUnlocked={true}
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        updateUserPhoto={updateUserPhoto}
      />
      <main className="flex-1 flex flex-col h-full relative animate-in fade-in duration-1000">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-transparent backdrop-blur-md z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${mode === AppMode.HACKER ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`}></div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              {mode === AppMode.HACKER ? 'Kernel_v4.2.0_Stable' : 'Universal_Intelligence_Engine'}
            </span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono italic truncate max-w-[150px]">
            {activeSession?.title || 'System Idle'}
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            mode={mode} 
            messages={activeSession?.messages || []}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            premiumUnlocked={true}
            hackerTrialCount={0}
            trialLimit={99999}
            unlockPremium={() => {}}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
