
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AppMode } from '../types';

interface ChatInterfaceProps {
  mode: AppMode;
  messages: Message[];
  onSendMessage: (content: string, attachments?: { data: string; mimeType: string }[]) => void;
  isLoading: boolean;
  premiumUnlocked: boolean;
  hackerTrialCount: number;
  trialLimit: number;
  unlockPremium: () => void;
}

const CodeBlock = ({ language, value, mode }: { language: string; value: string; mode: AppMode }) => {
  const [copied, setCopied] = useState(false);
  const isHacker = mode === AppMode.HACKER;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`my-4 rounded-2xl overflow-hidden border shadow-lg transition-all ${
      isHacker ? 'border-green-500/20 bg-black/80' : 'border-slate-800 bg-slate-950/80'
    }`}>
      <div className={`flex items-center justify-between px-5 py-2.5 text-[9px] font-black uppercase tracking-widest ${
        isHacker ? 'bg-green-500/5 text-green-500' : 'bg-slate-900 text-slate-500'
      }`}>
        <span>{language || 'SCRIPT'}</span>
        <button onClick={handleCopy} className="hover:text-white transition-colors">
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <div className="p-5 overflow-x-auto scroll-hide">
        <pre className="m-0"><code className="font-mono text-xs leading-relaxed">{value}</code></pre>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode, messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHacker = mode === AppMode.HACKER;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden">
      <div className="flex-1 overflow-y-auto chat-scroll px-4 md:px-8 py-8 space-y-8" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20 animate-in fade-in duration-1000">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border-2 shadow-2xl ${isHacker ? 'border-green-500 text-green-500 shadow-green-500/10' : 'border-blue-600 text-blue-600 shadow-blue-500/10'}`}>
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2 uppercase font-mono">{isHacker ? 'Kernel Uplink Ready' : 'Ready to help, Bhai!'}</h3>
            <p className="text-xs font-medium tracking-wide max-w-xs">{isHacker ? 'Direct bypass protocols loaded. Inject target parameters.' : 'I can write code, explain topics, or just chat. What\'s on your mind?'}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4 duration-500`}>
              <div className={`flex items-center gap-2 mb-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span>{msg.role === 'user' ? 'LOCAL_HOST' : (isHacker ? 'CYPHER_ULTRA' : 'CYPHER')}</span>
              </div>
              <div className={`max-w-[90%] md:max-w-[80%] px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-xl border ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none border-blue-500 shadow-blue-600/10' 
                  : 'bg-slate-900/40 border-white/5 text-slate-100 rounded-tl-none'
              }`}>
                <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} mode={mode} />
                        ) : (
                          <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-[0.9em]">{children}</code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-2 px-6 py-3 rounded-full border border-white/5 bg-white/5 w-fit animate-pulse">
            <div className={`w-2 h-2 rounded-full animate-bounce ${isHacker ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce delay-150 ${isHacker ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce delay-300 ${isHacker ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-10">
        <div className={`max-w-4xl mx-auto flex items-center gap-2 p-2 pl-6 rounded-[2.5rem] border transition-all duration-300 focus-within:ring-4 ${
          isHacker 
            ? 'bg-zinc-950 border-green-500/20 focus-within:border-green-500/50 focus-within:ring-green-500/10' 
            : 'bg-slate-900 border-white/10 shadow-2xl focus-within:border-blue-500/50 focus-within:ring-blue-500/10'
        }`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder={isHacker ? "INJECT_PAYLOAD..." : "Ask Cyper anything, Bhai..."}
            className="flex-1 bg-transparent py-4 outline-none text-[15px] font-medium placeholder-slate-600"
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()} 
            className={`p-4 rounded-full transition-all active:scale-90 disabled:opacity-30 ${
              isHacker 
                ? 'bg-green-600 text-black hover:bg-green-500 shadow-green-600/20' 
                : 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        </div>
        <p className="mt-3 text-[9px] text-center text-slate-600 font-bold uppercase tracking-[0.3em] opacity-40">
           {isHacker ? 'Cypher-X Unrestricted Offensive Kernel v4.2' : 'Standard Universal Intelligence Node'}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
