
import React, { useState, useRef } from 'react';
import { AppMode, ChatSession, User } from '../types';

interface SidebarProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
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
  mode, setMode, sessions, activeSessionId, setActiveSessionId, createNewSession, isOpen, closeSidebar, currentUser, onLogout, updateUserPhoto
}) => {
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const filteredSessions = sessions
    .filter(s => s.mode === mode && s.userId === currentUser?.id)
    .sort((a, b) => b.lastUpdated - a.lastUpdated);

  const isHacker = mode === AppMode.HACKER;

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

  const defaultPhoto = `https://ui-avatars.com/api/?name=${currentUser?.username || 'User'}&background=random&color=fff`;
  const adminPhoto = currentUser?.photo || defaultPhoto;

  return (
    <>
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 transition-all duration-500 ease-in-out flex flex-col h-full z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isHacker ? 'bg-black border-r border-green-500/10' : 'bg-[#020617] border-r border-white/5'
      }`}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12 ${
              isHacker ? 'bg-green-500 text-black' : 'bg-blue-600 text-white'
            }`}>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <h1 className={`text-xl font-black tracking-tighter ${
              isHacker ? 'text-green-500 font-mono' : 'text-slate-100'
            }`}>
              CYPHER<span className="opacity-40">AI</span>
            </h1>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-6">
          <div className={`p-1.5 rounded-2xl flex border transition-all duration-300 ${
            isHacker ? 'bg-zinc-950 border-green-500/20' : 'bg-slate-900/50 border-white/5'
          }`}>
            <button
              onClick={() => { setMode(AppMode.STANDARD); }}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all duration-300 ${
                mode === AppMode.STANDARD ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              STANDARD
            </button>
            <button
              onClick={() => { setMode(AppMode.HACKER); }}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-2 ${
                isHacker ? 'bg-green-600 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              HACKER
            </button>
          </div>
        </div>

        <div className="px-6 mb-4">
          <button 
            onClick={createNewSession}
            className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] border transition-all flex items-center justify-center gap-3 active:scale-95 group ${
              isHacker 
                ? 'border-green-500/20 text-green-500 hover:bg-green-500/10 hover:border-green-500/40 shadow-[0_4px_15px_rgba(0,0,0,0.3)]' 
                : 'border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10 shadow-lg'
            }`}
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            New Session
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scroll-hide">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 mb-4 mt-2">
            TERMINAL LOGS
          </div>
          {filteredSessions.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[11px] text-slate-700 font-bold uppercase tracking-widest italic">Logs Empty</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <button 
                key={session.id} 
                onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 1024) closeSidebar(); }}
                className={`w-full text-left px-5 py-4 rounded-2xl text-[13px] font-semibold transition-all duration-300 truncate group relative border ${
                  activeSessionId === session.id
                    ? (isHacker ? 'bg-green-600 text-black border-green-500' : 'bg-blue-600 text-white border-blue-500 shadow-xl')
                    : (isHacker ? 'bg-zinc-950 border-white/5 text-green-700 hover:text-green-400 hover:border-green-500/30' : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white hover:bg-slate-800 hover:border-white/10')
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-mono font-black opacity-30`}>
                    {isHacker ? '0X' : '>'}
                  </span>
                  <span className="truncate">{session.title}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-6 space-y-3">
          <div className="px-4 py-2 bg-black/20 rounded-lg border border-white/5 mb-2">
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Build: v4.2.0-Production</p>
          </div>
          <button 
            onClick={() => setShowAbout(true)}
            className={`w-full p-3 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 group ${
              isHacker ? 'bg-zinc-950 border-green-500/10 hover:border-green-500/30' : 'bg-slate-900 border-white/5 hover:border-white/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform group-hover:scale-110 ${
              isHacker ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-blue-600'
            }`}>
              <img 
                src={adminPhoto} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest truncate">{currentUser?.username || 'Guest'}</span>
              <span className="text-[9px] text-slate-500 font-bold font-mono uppercase truncate">Profile Active</span>
            </div>
          </button>
          <button 
            onClick={onLogout}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all`}
          >
            Kill Session
          </button>
        </div>
      </aside>

      {showAbout && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border shadow-2xl p-10 md:p-16 scroll-hide ${
            isHacker ? 'bg-zinc-950 border-green-500/20' : 'bg-[#0f172a] border-white/10'
          }`}>
            <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-slate-500 transition-all z-10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className={`absolute -inset-4 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-2xl ${isHacker ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                <div className={`w-40 h-40 rounded-full border-4 overflow-hidden relative shadow-2xl transition-all duration-700 group-hover:scale-105 ${isHacker ? 'border-green-500 shadow-green-500/20' : 'border-blue-600 shadow-blue-600/20'}`}>
                  <img src={adminPhoto} alt="User" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Neural Photo</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              
              <div className="space-y-2">
                <h2 className={`text-4xl font-black tracking-tighter ${isHacker ? 'text-green-500' : 'text-slate-100'}`}>{currentUser?.username}</h2>
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isHacker ? 'text-green-800' : 'text-blue-500'}`}>Neural Authenticated</p>
              </div>

              <div className="w-full h-px bg-white/5"></div>

              <div className="space-y-6 text-left w-full">
                <div className="space-y-2 text-center">
                   <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Architects of CypherAI</h4>
                   <p className={`text-2xl font-black ${isHacker ? 'text-green-500 font-mono' : 'text-slate-100'}`}>Himanshu Yadav</p>
                   <p className="text-slate-400 text-[12px] font-bold tracking-widest mt-2 uppercase">Hacker Professor & Lead Developer</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 pt-6">
                {['LinkedIn', 'Instagram', 'GitHub'].map(social => (
                  <a key={social} href="#" className={`text-xs font-black uppercase tracking-widest transition-all hover:scale-110 active:opacity-50 ${isHacker ? 'text-green-500 hover:text-green-400' : 'text-blue-500 hover:text-blue-400'}`}>{social}</a>
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
