
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

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHacker = mode === AppMode.HACKER;

  return (
    <div className={`my-8 rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 hover:ring-2 ${
      isHacker ? 'border-green-500/30 bg-[#0a0a0a] hover:ring-green-500/20' : 'border-slate-700 bg-[#1e293b] hover:ring-blue-500/20'
    }`}>
      <div className={`flex items-center justify-between px-6 py-3.5 ${
        isHacker ? 'bg-green-500/10 border-b border-green-500/20' : 'bg-slate-800 border-b border-slate-700'
      }`}>
        <span className={`text-[11px] font-mono font-bold tracking-[0.2em] uppercase ${isHacker ? 'text-green-500' : 'text-slate-400'}`}>
          {language || 'source code'}
        </span>
        <button 
          onClick={handleCopy}
          className={`flex items-center gap-2 text-[11px] font-bold uppercase transition-all hover:scale-105 active:opacity-50 ${
            isHacker ? 'text-green-400 hover:text-green-300' : 'text-blue-400 hover:text-blue-300'
          }`}
        >
          {copied ? '✅ COPIED' : '📋 COPY CODE'}
        </button>
      </div>
      <div className="p-6 overflow-x-auto scroll-hide">
        <pre className="m-0">
          <code className={`font-mono text-[14px] leading-relaxed block whitespace-pre ${isHacker ? 'text-green-400' : 'text-slate-200'}`}>
            {value}
          </code>
        </pre>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  mode, messages, onSendMessage, isLoading 
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<{ data: string; mimeType: string; preview: string; name: string }[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(input, attachments.map(a => ({ data: a.data, mimeType: a.mimeType })));
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setShowAttachMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        let preview = '';
        if (file.type.startsWith('image/')) {
          preview = base64Data;
        } else if (file.type.startsWith('audio/')) {
          preview = 'audio-icon';
        } else {
          preview = 'file-icon';
        }

        setAttachments(prev => [...prev, {
          data: base64Data,
          mimeType: file.type || 'application/octet-stream',
          preview: preview,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    }
    setShowAttachMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto relative overflow-hidden">
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-[0.05] pointer-events-none blur-[150px] transition-colors duration-1000 ${mode === AppMode.HACKER ? 'bg-green-500' : 'bg-blue-600'}`}></div>

      <div className="flex-1 overflow-y-auto chat-scroll px-6 md:px-16 py-16 space-y-16" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <div className={`w-28 h-28 rounded-[3rem] flex items-center justify-center rotate-6 border-4 shadow-2xl transition-all hover:rotate-0 duration-700 ${mode === AppMode.HACKER ? 'bg-green-500/10 border-green-500/40 text-green-500' : 'bg-blue-600/10 border-blue-500/40 text-blue-500'}`}>
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <div className="space-y-4">
                <h3 className={`text-5xl md:text-7xl font-black tracking-tighter ${mode === AppMode.HACKER ? 'text-green-500 font-mono' : 'text-slate-100'}`}>
                    {mode === AppMode.HACKER ? 'System.Ready()' : 'Hello, Bhai! ✨'}
                </h3>
                <p className="text-slate-500 font-bold text-xl md:text-2xl max-w-xl mx-auto leading-relaxed">
                    {mode === AppMode.HACKER ? 'Terminal unrestricted. Enter technical payload...' : 'I\'m your personal AI. How can I assist you today? 😊'}
                </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} message-enter`}>
              <div className={`flex items-center gap-3 mb-4 px-3 text-[12px] font-black uppercase tracking-[0.25em] ${msg.role === 'user' ? 'flex-row-reverse' : ''} opacity-30`}>
                <div className={`w-2.5 h-2.5 rounded-full ${msg.role === 'user' ? (mode === AppMode.HACKER ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]') : 'bg-slate-400'}`}></div>
                <span>{msg.role === 'user' ? (mode === AppMode.HACKER ? 'Admin' : 'You') : (mode === AppMode.HACKER ? 'Kernel_AI' : 'Cypher')}</span>
              </div>

              <div className={`relative group max-w-[92%] md:max-w-[85%] px-8 py-6 rounded-[3rem] text-[17px] leading-[1.7] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${
                msg.role === 'user' 
                  ? (mode === AppMode.HACKER ? 'bg-green-600 text-black font-bold font-mono rounded-tr-none' : 'bg-blue-600 text-white font-bold rounded-tr-none')
                  : (mode === AppMode.HACKER ? 'bg-[#0a0a0a] border border-green-500/30 text-green-400 font-mono rounded-tl-none' : 'bg-[#1e293b] border border-slate-700 text-slate-100 font-medium rounded-tl-none')
              }`}>
                <div className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} mode={mode} />
                        ) : (
                          <code className={`px-2.5 py-1 rounded-xl font-mono text-[15px] ${msg.role === 'user' ? 'bg-black/30' : 'bg-white/10'}`} {...props}>{children}</code>
                        );
                      },
                      p: ({children}) => <p className="m-0 mb-6 last:mb-0">{children}</p>
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
          <div className="flex flex-col items-start message-enter">
            <div className="flex items-center gap-3 mb-4 px-3 text-[12px] font-black uppercase tracking-[0.25em] opacity-30">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-ping"></div>
                <span>{mode === AppMode.HACKER ? 'Processing...' : 'Typing...'}</span>
            </div>
            <div className={`px-10 py-6 rounded-[3rem] rounded-tl-none border shadow-2xl flex gap-4 ${mode === AppMode.HACKER ? 'bg-[#0a0a0a] border-green-500/20' : 'bg-[#1e293b] border-slate-700'}`}>
              <div className={`w-3 h-3 rounded-full animate-bounce ${mode === AppMode.HACKER ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-blue-500 shadow-[0_0_15px_#3b82f6]'}`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-3 h-3 rounded-full animate-bounce ${mode === AppMode.HACKER ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-blue-500 shadow-[0_0_15px_#3b82f6]'}`} style={{ animationDelay: '200ms' }}></div>
              <div className={`w-3 h-3 rounded-full animate-bounce ${mode === AppMode.HACKER ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-blue-500 shadow-[0_0_15px_#3b82f6]'}`} style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 md:p-12 pt-4 relative">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="max-w-5xl mx-auto mb-4 flex flex-wrap gap-4 px-4">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group animate-in slide-in-from-bottom-4 duration-300">
                <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex items-center justify-center bg-slate-900/50 shadow-lg ${mode === AppMode.HACKER ? 'border-green-500/30' : 'border-white/10'}`}>
                  {att.preview === 'audio-icon' ? (
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-6 0V7a3 3 0 013-3z" /></svg>
                  ) : att.preview === 'file-icon' ? (
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  ) : (
                    <img src={att.preview} alt="preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className={`relative max-w-5xl mx-auto glass-input p-4 rounded-[3.5rem] transition-all duration-500 group shadow-[0_30px_100px_rgba(0,0,0,0.5)] ${mode === AppMode.HACKER ? 'hacker-glow hover:border-green-500/40' : 'standard-glow hover:border-blue-500/40'}`}>
            <div className="flex items-end gap-4 px-4">
                <div className="relative mb-4">
                  <button 
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-3.5 rounded-full hover:bg-white/10 transition-all active:scale-90 ${showAttachMenu ? (mode === AppMode.HACKER ? 'text-green-500 rotate-45' : 'text-blue-400 rotate-45') : (mode === AppMode.HACKER ? 'text-green-500' : 'text-blue-400')}`}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </button>

                  {/* Attachment Menu */}
                  {showAttachMenu && (
                    <div className={`absolute bottom-20 left-0 p-4 rounded-[2.5rem] border shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-300 z-50 ${mode === AppMode.HACKER ? 'bg-black border-green-500/20' : 'bg-slate-900 border-white/10'}`}>
                      <button onClick={() => { fileInputRef.current?.click(); }} className="flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-white/5 group">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">Image</span>
                      </button>
                      <button onClick={() => { fileInputRef.current?.click(); }} className="flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-white/5 group">
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-6 0V7a3 3 0 013-3z" /></svg>
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">Audio</span>
                      </button>
                      <button onClick={() => { fileInputRef.current?.click(); }} className="flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-white/5 group">
                        <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">File</span>
                      </button>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={handleFileChange}
                    accept="image/*,audio/*,video/*,.pdf,.txt,.js,.py,.html,.css,.json"
                  />
                </div>
                
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                    }}
                    placeholder={mode === AppMode.HACKER ? "Enter technical payload..." : "Ask Cypher anything, Bhai..."}
                    className="flex-1 bg-transparent px-2 py-5 focus:outline-none resize-none text-[18px] max-h-[240px] font-semibold placeholder-slate-600"
                />
                
                <button
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && attachments.length === 0)}
                    className={`mb-4 p-4 rounded-full transition-all flex items-center justify-center shrink-0 active:scale-75 disabled:opacity-10 ${
                    mode === AppMode.HACKER 
                        ? 'bg-green-600 text-black shadow-[0_0_30px_rgba(34,197,94,0.6)]' 
                        : 'bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.6)]'
                    }`}
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9-7-9-7V19z" /></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
