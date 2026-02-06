
import React, { useState, useEffect } from 'react';
import { AppMode, ChatSession, Message, User } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import VulnerabilityScanner from './components/VulnerabilityScanner';
import PentestChecklist from './components/PentestChecklist';
import Login from './components/Login';
import { chatWithAI } from './services/gemini';

const HACKER_DAILY_LIMIT = 20;

const BOOT_MESSAGES = [
  "[SYSTEM] Initiating CypherAI Mobile Interface...",
  "[KERNEL] Loading offensive modules...",
  "[AUTH] Verifying neural link integrity...",
  "[SEC] Hardening sandbox environment...",
  "[READY] Deployment v4.2.5-MOBILE-STABLE",
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
    }, 200);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col justify-center px-6 font-mono overflow-hidden">
      <div className="max-w-md mx-auto space-y-2 w-full">
        {lines.map((line, i) => (
          <div key={i} className={`text-xs md:text-sm ${(line && line.includes && line.includes('GRANTED')) ? 'text-green-500 font-bold' : 'text-green-500/60'}`}>
            <span className="opacity-40 mr-2">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
            {line}
          </div>
        ))}
        {lines.length < BOOT_MESSAGES.length && <div className="boot-cursor"></div>}
      </div>
    </div>
  );
};

const PremiumModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80">
    <div className="bg-zinc-950 border border-green-500/30 rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-6 shadow-[0_0_50px_rgba(34,197,94,0.15)]">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-green-500 tracking-tighter uppercase font-mono">Quota Exhausted</h2>
        <p className="text-sm text-slate-400 font-medium">Bhai, Hacker Mode ki daily limit (20 chats) khatam ho gayi hai.</p>
      </div>
      <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl text-left">
        <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-1">Premium Unlock</p>
        <p className="text-xs text-slate-300">Upgrade to Cypher-X Elite for unlimited offensive power, faster response, and 4K code generation.</p>
      </div>
      <button 
        onClick={() => alert("Payment Gateway coming soon! Bhai ne bola tha payment baad mein set karenge. 🔥")}
        className="w-full py-4 bg-green-600 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-green-500 transition-all active:scale-95 shadow-lg shadow-green-500/20"
      >
        Upgrade to Elite
      </button>
      <button onClick={onClose} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400">Wait for Reset</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.STANDARD);
  const [activeView, setActiveView] = useState<'chat' | 'audit' | 'roadmap'>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('cypher_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedSessions = localStorage.getItem('cypher_sessions_v7');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cypher_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cypher_sessions_v7', JSON.stringify(sessions));
  }, [sessions]);

  const handleLogin = (user: User) => {
    // Initialize usage tracking on login
    const today = new Date().toISOString().split('T')[0];
    const newUser = {
      ...user,
      hackerUsageCount: user.hackerUsageCount || 0,
      lastUsageDate: user.lastUsageDate || today
    };
    setCurrentUser(newUser);
    setMode(newUser.isHacker ? AppMode.HACKER : AppMode.STANDARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSessionId(null);
    setIsBooting(true);
  };

  const handleSendMessage = async (content: string, attachments?: { data: string; mimeType: string }[]) => {
    if (!currentUser) return;

    // Daily Limit Check for Hacker Mode
    if (mode === AppMode.HACKER) {
      const today = new Date().toISOString().split('T')[0];
      let currentCount = currentUser.hackerUsageCount;
      
      // Reset count if new day
      if (currentUser.lastUsageDate !== today) {
        currentCount = 0;
      }

      if (currentCount >= HACKER_DAILY_LIMIT) {
        setShowPremium(true);
        return;
      }

      // Increment usage count
      setCurrentUser(prev => prev ? {
        ...prev,
        hackerUsageCount: currentCount + 1,
        lastUsageDate: today
      } : null);
    }

    let currentId = activeSessionId;
    if (!currentId || (activeSession && activeSession.mode !== mode)) {
      currentId = Math.random().toString(36).substr(2, 9);
      const newSession: ChatSession = {
        id: currentId,
        userId: currentUser.id,
        title: content.slice(0, 30) || 'New Scan',
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
      title: s.messages.length === 0 ? (content.slice(0, 30)) : s.title
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
          ? "CRITICAL: Uplink lost. Re-establishing packet stream..." 
          : "Bhai, network thoda down lag raha hai. 😅", 
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

  const activeSession = sessions.find(s => s.id === activeSessionId && s.mode === mode && s.userId === currentUser?.id) || null;

  if (isBooting) return <BootSequence onComplete={() => setIsBooting(false)} />;
  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 ${mode === AppMode.HACKER ? 'bg-[#050505]' : 'bg-[#020617]'} text-slate-200 overflow-hidden`}>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
      
      <Sidebar 
        mode={mode} 
        setMode={(newMode) => { setMode(newMode); setActiveView('chat'); setIsSidebarOpen(false); }} 
        activeView={activeView}
        setActiveView={setActiveView}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        createNewSession={() => {
          const newId = Math.random().toString(36).substr(2, 9);
          const newSession: ChatSession = { id: newId, userId: currentUser.id, title: 'New Entry', messages: [], mode, lastUpdated: Date.now() };
          setSessions(prev => [newSession, ...prev]);
          setActiveSessionId(newId);
          setActiveView('chat');
          setIsSidebarOpen(false);
        }}
        premiumUnlocked={true}
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        updateUserPhoto={(photo) => setCurrentUser(prev => prev ? {...prev, photo} : null)}
      />

      <main className="flex-1 flex flex-col h-full relative animate-in fade-in duration-700">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-transparent backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-400 active:scale-90 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${mode === AppMode.HACKER ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-500 uppercase">
                {mode === AppMode.HACKER ? 'KERNEL_STABLE' : 'INTELLIGENCE_ENGINE'}
              </span>
            </div>
          </div>
          
          <div className="hidden sm:block text-[10px] text-slate-600 font-mono italic truncate max-w-[200px]">
             {activeView === 'chat' ? (activeSession?.title || 'System Idle') : activeView.toUpperCase()}
          </div>

          {mode === AppMode.HACKER && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-full">
               <span className="text-[9px] font-black text-green-700 uppercase tracking-tighter">Usage: {currentUser.hackerUsageCount}/{HACKER_DAILY_LIMIT}</span>
            </div>
          )}
        </header>
        
        <div className="flex-1 overflow-hidden">
          {activeView === 'chat' && (
            <ChatInterface 
              mode={mode} 
              messages={activeSession?.messages || []}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              premiumUnlocked={true}
              hackerTrialCount={currentUser.hackerUsageCount}
              trialLimit={HACKER_DAILY_LIMIT}
              unlockPremium={() => setShowPremium(true)}
            />
          )}
          {activeView === 'audit' && (
            <div className="h-full overflow-y-auto p-4 md:p-12 scroll-hide pb-20">
              <VulnerabilityScanner />
            </div>
          )}
          {activeView === 'roadmap' && (
            <div className="h-full overflow-y-auto p-4 md:p-12 scroll-hide pb-20">
              <PentestChecklist />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
