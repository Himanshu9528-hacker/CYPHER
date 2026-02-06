
import React, { useState, useRef } from 'react';
import { AppMode, ChatSession, User } from '../types';

interface SidebarProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  activeView: 'chat' | 'audit' | 'roadmap';
  setActiveView: (view: 'chat' | 'audit' | 'roadmap') => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewSession: () => void;
  premiumUnlocked: boolean;
  isOpen: boolean;
  closeSidebar: () => void;
  currentUser: User | null;
  onLogout: () => void;
  updateUserPhoto: (photo: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  mode, setMode, activeView, setActiveView, sessions, activeSessionId, setActiveSessionId, createNewSession, isOpen, closeSidebar, currentUser, onLogout, updateUserPhoto
}) => {
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isHacker = mode === AppMode.HACKER;

  const filteredSessions = sessions
    .filter(s => s.mode === mode && s.userId === currentUser?.id)
    .sort((a, b) => b.lastUpdated - a.lastUpdated);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateUserPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const adminPhoto = currentUser?.photo || `https://ui-avatars.com/api/?name=${currentUser?.username || 'User'}&background=random&color=fff`;

  return (
    <>
      <aside className={`fixed lg:static inset-y-0 left-0 w-[85%] sm:w-80 transition-all duration-500 ease-in-out flex flex-col h-full z-[100] ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isHacker ? 'bg-black border-r border-green-500/10' : 'bg-[#020617] border-r border-white/5 shadow-2xl'
      }`}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
              isHacker ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'
            }`}>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className={`text-xl font-black tracking-tighter ${isHacker ? 'text-green-500 font-mono' : 'text-slate-100'}`}>
              CYPHER<span className="opacity-30">AI</span>
            </h1>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-3 text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-6">
          <div className={`p-1 rounded-2xl flex border transition-all duration-300 ${isHacker ? 'bg-zinc-950 border-green-500/20' : 'bg-slate-900/50 border-white/5'}`}>
            <button
              onClick={() => setMode(AppMode.STANDARD)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                mode === AppMode.STANDARD ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              STANDARD
            </button>
            <button
              onClick={() => setMode(AppMode.HACKER)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                isHacker ? 'bg-green-600 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              HACKER
            </button>
          </div>
        </div>

        {isHacker && (
          <div className="px-6 mb-4 space-y-2">
            {[
              { id: 'chat', label: 'Terminal Console', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
              { id: 'audit', label: 'Vulnerability Audit', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { id: 'roadmap', label: 'Attack Roadmap', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveView(item.id as any); closeSidebar(); }}
                className={`w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                  activeView === item.id ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 mb-4">
          <button 
            onClick={createNewSession}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-3 active:scale-95 ${
              isHacker ? 'border-green-500/20 text-green-500 hover:bg-green-500/5 shadow-green-500/5' : 'border-white/5 text-slate-300 hover:bg-white/5 shadow-xl'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            New Session
          </button>
        </div>

        <div className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto chat-scroll">
          <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-4 mb-3 mt-4">PAST LOGS</div>
          {filteredSessions.map((session) => (
            <button 
              key={session.id} 
              onClick={() => { setActiveSessionId(session.id); closeSidebar(); }}
              className={`w-full text-left px-5 py-4 rounded-2xl text-[13px] font-semibold transition-all duration-300 truncate relative border ${
                activeSessionId === session.id
                  ? (isHacker ? 'bg-green-600 text-black border-green-500 shadow-lg' : 'bg-blue-600 text-white border-blue-500 shadow-xl')
                  : (isHacker ? 'bg-zinc-950 border-white/5 text-green-800 hover:text-green-500' : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white')
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-black opacity-30">{isHacker ? '0X' : '>'}</span>
                <span className="truncate">{session.title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-3 bg-gradient-to-t from-black/20 to-transparent">
          <button 
            onClick={() => setShowAbout(true)}
            className={`w-full p-3 rounded-[1.5rem] border flex items-center gap-4 transition-all active:scale-95 group ${
              isHacker ? 'bg-zinc-950 border-green-500/10' : 'bg-slate-900 border-white/5'
            }`}
          >
            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform ${isHacker ? 'border-green-500' : 'border-blue-600'}`}>
              <img src={adminPhoto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest truncate">{currentUser?.username || 'Guest'}</span>
              <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-tight">Active Node</span>
            </div>
          </button>
          <button 
            onClick={onLogout}
            className="w-full py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all"
          >
            Kill Session
          </button>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300" 
          onClick={closeSidebar}
        />
      )}

      {showAbout && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/70 animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-w-lg rounded-[3rem] border shadow-2xl p-10 md:p-14 overflow-hidden ${
            isHacker ? 'bg-zinc-950 border-green-500/20' : 'bg-slate-900 border-white/10'
          }`}>
            <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-slate-500 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className={`absolute -inset-4 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-2xl ${isHacker ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                <div className={`w-32 h-32 rounded-full border-4 overflow-hidden relative shadow-2xl transition-all ${isHacker ? 'border-green-500' : 'border-blue-600'}`}>
                  <img src={adminPhoto} alt="User" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Update Photo</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              
              <div className="space-y-1">
                <h2 className={`text-3xl font-black tracking-tighter ${isHacker ? 'text-green-500' : 'text-slate-100'}`}>{currentUser?.username}</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Established Access</p>
              </div>

              <div className="w-full space-y-4">
                <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                   <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Architect of Intelligence</h4>
                   <p className={`text-xl font-black ${isHacker ? 'text-green-500 font-mono' : 'text-white'}`}>Himanshu Yadav</p>
                   <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Lead Dev & Hacker Professor</p>
                </div>
              </div>

              <div className="flex gap-8 pt-4">
                {['LinkedIn', 'Instagram', 'Github'].map(s => (
                  <a key={s} href="#" className={`text-[10px] font-black uppercase tracking-widest transition-all hover:scale-110 ${isHacker ? 'text-green-500' : 'text-blue-500'}`}>{s}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
