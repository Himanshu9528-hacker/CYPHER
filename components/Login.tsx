
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, User } from '../types';

declare const emailjs: any;

interface LoginProps {
  onLogin: (user: User) => void;
}

enum AuthView {
  WELCOME = 'WELCOME',
  IDENTIFY = 'IDENTIFY',
  OTP = 'OTP',
  REGISTER = 'REGISTER',
  SIGNIN_PASSWORD = 'SIGNIN_PASSWORD'
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState(AppMode.STANDARD);
  const [view, setView] = useState(AuthView.WELCOME);
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // EmailJS Config - Ensure these match your EmailJS Dashboard
  const EMAILJS_PUBLIC_KEY = "IPXA-vfIhwSTKjhqP"; 
  const SERVICE_ID = "service_j3vkuxm";
  const TEMPLATE_ID = "template_uxyn8ts";

  useEffect(() => {
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  const isHacker = mode === AppMode.HACKER;

  const getUsers = (): Record<string, User> => {
    const data = localStorage.getItem('cypher_user_db_v2');
    return data ? JSON.parse(data) : {};
  };

  const saveUser = (user: User) => {
    const users = getUsers();
    users[user.identifier!.toLowerCase()] = user;
    localStorage.setItem('cypher_user_db_v2', JSON.stringify(users));
  };

  const generateOTP = useCallback(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  const handleStartAuth = (signingUp: boolean) => {
    setIsSigningUp(signingUp);
    setView(AuthView.IDENTIFY);
    setError('');
  };

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanId = identifier.trim().toLowerCase();
    const users = getUsers();
    const existingUser = users[cleanId];

    if (isSigningUp) {
      if (existingUser) {
        setError('Bhai, ye account pehle se hai. Sign In karo.');
        return;
      }
      
      setLoading(true);
      const secureOtp = generateOTP();
      setSentOtp(secureOtp);

      try {
        const templateParams = {
          to_email: cleanId,
          passcode: secureOtp,
          to_name: cleanId.split('@')[0] || 'User',
          user_mode: mode
        };
        
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
        setView(AuthView.OTP);
      } catch (err: any) {
        console.error("EmailJS Error:", err);
        // Fallback: If email fails, show OTP in alert for testing
        setError('Email service error. Alerting OTP for manual entry.');
        alert(`CYPHER OTP: ${secureOtp}`);
        setView(AuthView.OTP);
      } finally { setLoading(false); }
    } else {
      if (!existingUser) {
        setError('Bhai, koi account nahi mila. Sign Up karo.');
        return;
      }
      setView(AuthView.SIGNIN_PASSWORD);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === sentOtp) {
      setView(AuthView.REGISTER);
      setError('');
    } else {
      setError('Galat OTP hai bhai. Dobara check karo.');
    }
  };

  const handleFinalSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) return setError('Username thoda bada rakho.');
    if (password.length < 6) return setError('Password kam se kam 6 characters ka ho.');
    if (password !== confirmPassword) return setError('Passwords match nahi ho rahe.');

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: username.trim(),
      identifier: identifier.trim().toLowerCase(),
      password: password,
      isHacker: mode === AppMode.HACKER,
      hackerUsageCount: 0,
      lastUsageDate: new Date().toISOString().split('T')[0]
    };

    saveUser(newUser);
    onLogin(newUser);
  };

  const handleFinalSignin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users[identifier.trim().toLowerCase()];

    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Galat password! Dobara try karo.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-700 ${isHacker ? 'bg-black' : 'bg-[#020617]'}`}>
      <div className={`w-full max-w-md rounded-[3rem] border p-8 md:p-12 space-y-8 relative overflow-hidden transition-all duration-500 ${
        isHacker ? 'bg-zinc-950 border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.15)]' : 'bg-slate-900/50 border-white/10 shadow-2xl backdrop-blur-xl'
      }`}>
        
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] opacity-20 ${isHacker ? 'bg-green-500' : 'bg-blue-600'}`}></div>

        <div className="text-center relative z-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border-2 transition-all duration-700 mb-6 ${
            isHacker ? 'border-green-500 text-green-500 bg-green-500/5 rotate-12' : 'border-blue-600 text-blue-600 bg-blue-600/5 -rotate-12'
          }`}>
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter ${isHacker ? 'text-green-500 font-mono' : 'text-slate-100'}`}>
            CYPHER<span className="opacity-30">AI</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">Access Portal Node v4.3</p>
        </div>

        {view === AuthView.WELCOME && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <button 
                onClick={() => handleStartAuth(false)}
                className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-lg ${
                  isHacker ? 'bg-green-600 text-black hover:bg-green-500 shadow-green-500/20' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => handleStartAuth(true)}
                className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all border ${
                  isHacker ? 'border-green-500/30 text-green-500 hover:bg-green-500/5' : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                Sign Up
              </button>
            </div>
            
            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
              <button onClick={() => setMode(AppMode.STANDARD)} className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${!isHacker ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600'}`}>STANDARD</button>
              <button onClick={() => setMode(AppMode.HACKER)} className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${isHacker ? 'bg-green-600 text-black shadow-lg' : 'text-slate-600'}`}>HACKER</button>
            </div>
          </div>
        )}

        {view === AuthView.IDENTIFY && (
          <form onSubmit={handleIdentifierSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                {isSigningUp ? 'Naya Email / Mobile' : 'Aapka Email / Mobile'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: hacker@gmail.com"
                className={`w-full px-8 py-5 rounded-3xl border outline-none text-sm font-bold transition-all ${
                  isHacker ? 'bg-black border-green-500/20 text-green-500 focus:border-green-500 font-mono' : 'bg-slate-950 border-white/5 text-slate-200 focus:border-blue-600'
                }`}
                required
              />
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button disabled={loading} className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 ${isHacker ? 'bg-green-600 text-black' : 'bg-blue-600 text-white'}`}>
              {loading ? 'Sending Request...' : 'Continue'}
            </button>
            <button type="button" onClick={() => setView(AuthView.WELCOME)} className="w-full text-[9px] text-slate-600 font-black uppercase tracking-widest">Galti se aa gaya (Back)</button>
          </form>
        )}

        {view === AuthView.OTP && (
          <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in slide-in-from-right-4 duration-500 text-center">
            <h3 className={`text-xl font-black ${isHacker ? 'text-green-500' : 'text-white'}`}>Verification Code</h3>
            <p className="text-xs text-slate-500">Bhai, check karo OTP bhej diya hai.</p>
            <input
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className={`w-full px-8 py-6 rounded-3xl border bg-black text-center text-3xl font-black tracking-[0.5em] outline-none ${
                isHacker ? 'border-green-500/20 text-green-500' : 'border-white/5 text-slate-100'
              }`}
              required
            />
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 ${isHacker ? 'bg-green-600 text-black' : 'bg-blue-600 text-white'}`}>Verify OTP</button>
            <button type="button" onClick={() => setView(AuthView.IDENTIFY)} className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Number galat hai? (Edit)</button>
          </form>
        )}

        {view === AuthView.REGISTER && (
          <form onSubmit={handleFinalSignup} className="space-y-4 animate-in fade-in duration-500">
            <h3 className={`text-xl font-black text-center mb-6 ${isHacker ? 'text-green-500' : 'text-white'}`}>Profile Setup</h3>
            <input placeholder="Username (Unique)" value={username} onChange={e => setUsername(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black font-bold outline-none ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
            <input type="password" placeholder="Set Password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black font-bold outline-none ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black font-bold outline-none ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button className={`w-full py-5 mt-4 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 ${isHacker ? 'bg-green-600 text-black' : 'bg-blue-600 text-white'}`}>Start Intelligence</button>
          </form>
        )}

        {view === AuthView.SIGNIN_PASSWORD && (
          <form onSubmit={handleFinalSignin} className="space-y-6 animate-in slide-in-from-right-4 duration-500 text-center">
            <h3 className={`text-xl font-black ${isHacker ? 'text-green-500' : 'text-white'}`}>Welcome Back, Bhai</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{identifier}</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              className={`w-full px-8 py-5 rounded-3xl border bg-black font-bold outline-none ${
                isHacker ? 'border-green-500/20 text-green-500 focus:border-green-500' : 'border-white/5 text-slate-100 focus:border-blue-600'
              }`}
              required
              autoFocus
            />
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 ${isHacker ? 'bg-green-600 text-black' : 'bg-blue-600 text-white'}`}>Establish Neural Link</button>
            <button type="button" onClick={() => setView(AuthView.IDENTIFY)} className="w-full text-[9px] text-slate-600 font-black uppercase tracking-widest">Account change karna hai? (Back)</button>
          </form>
        )}

        <div className="pt-8 border-t border-white/5 text-center space-y-4">
          <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">
            Developed by Himanshu Yadav | Secure Node v4.3
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
