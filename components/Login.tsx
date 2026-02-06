
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, User } from '../types';

declare const emailjs: any;

interface LoginProps {
  onLogin: (user: User) => void;
}

enum LoginMethod {
  EMAIL = 'EMAIL',
  MOBILE = 'MOBILE'
}

enum AuthState {
  IDENTIFY = 'IDENTIFY',
  OTP = 'OTP',
  REGISTER = 'REGISTER',
  LOGIN_PASSWORD = 'LOGIN_PASSWORD'
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState(AppMode.STANDARD);
  const [method, setMethod] = useState(LoginMethod.EMAIL);
  const [authState, setAuthState] = useState(AuthState.IDENTIFY);
  
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Configuration
  const EMAILJS_PUBLIC_KEY = "IPXA-vfIhwSTKjhqP"; 
  const EMAILJS_SERVICE_ID = "service_j3vkuxm";    
  const EMAILJS_TEMPLATE_ID = "template_uxyn8ts"; 

  useEffect(() => {
    if (typeof emailjs !== 'undefined' && !!EMAILJS_PUBLIC_KEY) {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
      } catch (e) { console.error("SEC_ERR_INIT"); }
    }
  }, [EMAILJS_PUBLIC_KEY]);

  const isHacker = mode === AppMode.HACKER;

  // Local Storage "Database" helper
  const getUsers = (): Record<string, User> => {
    const data = localStorage.getItem('cypher_user_db_v1');
    return data ? JSON.parse(data) : {};
  };

  const saveUser = (user: User) => {
    const users = getUsers();
    users[identifier.trim().toLowerCase()] = user;
    localStorage.setItem('cypher_user_db_v1', JSON.stringify(users));
  };

  const generateSecureOTP = useCallback(() => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 900000 + 100000).toString();
  }, []);

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanId = identifier.trim().toLowerCase();

    if (method === LoginMethod.EMAIL && !cleanId.includes('@')) {
      setError('VALIDATION_ERR: Invalid Gmail format.');
      return;
    }

    if (method === LoginMethod.MOBILE && cleanId.length < 10) {
      setError('VALIDATION_ERR: Invalid Mobile format.');
      return;
    }

    const users = getUsers();
    const existingUser = users[cleanId];

    if (existingUser) {
      // User exists, go to password login
      setAuthState(AuthState.LOGIN_PASSWORD);
    } else {
      // New user, send OTP
      setLoading(true);
      const secureOtp = generateSecureOTP();
      setSentOtp(secureOtp);

      if (method === LoginMethod.EMAIL) {
        try {
          const templateParams = {
            to_email: cleanId,      
            passcode: secureOtp,       
            user_mode: mode,
            to_name: cleanId.split('@')[0],
            timestamp: new Date().toISOString()
          };
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
          setAuthState(AuthState.OTP);
        } catch (err: any) {
          setError(`SEC_ERR_DELIVERY: Email service failure.`);
        } finally { setLoading(false); }
      } else {
        // Mobile Simulation
        setTimeout(() => {
          setAuthState(AuthState.OTP);
          setLoading(false);
          alert(`OTP: ${secureOtp} (Check Console)`);
          console.log(`[AUTH] OTP for ${cleanId}: ${secureOtp}`);
        }, 1000);
      }
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === sentOtp) {
      setAuthState(AuthState.REGISTER);
    } else {
      setError('AUTH_FAILED: Invalid OTP.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.length < 3) return setError('Username too short.');
    if (password.length < 6) return setError('Password must be 6+ chars.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    const newUser: User = {
      id: btoa(identifier).substring(0, 10),
      username: fullName.trim(),
      password: password, // In real apps, hash this
      isHacker: mode === AppMode.HACKER,
      hackerUsageCount: 0,
      lastUsageDate: new Date().toISOString().split('T')[0]
    };

    saveUser(newUser);
    onLogin(newUser);
  };

  const handleLoginWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users[identifier.trim().toLowerCase()];

    if (user && user.username === fullName.trim() && user.password === password) {
      onLogin(user);
    } else {
      setError('AUTH_FAILED: Invalid Username or Password.');
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-6 transition-colors duration-1000 ${isHacker ? 'bg-black' : 'bg-[#020617]'}`}>
      <div className={`absolute inset-0 opacity-20 blur-[150px] transition-colors duration-1000 ${isHacker ? 'bg-green-600' : 'bg-blue-600'}`}></div>
      
      <div className={`relative w-full max-w-md p-8 md:p-10 rounded-[3rem] border shadow-2xl transition-all duration-500 overflow-hidden ${isHacker ? 'bg-zinc-950 border-green-500/20 shadow-green-500/10' : 'bg-slate-900/50 border-white/10 shadow-blue-500/10 backdrop-blur-3xl'}`}>
        
        <div className={`absolute top-0 left-0 w-full h-1 z-10 animate-pulse ${isHacker ? 'bg-green-500' : 'bg-blue-500'}`}></div>

        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-2xl transition-all duration-700 ${isHacker ? 'bg-green-500 text-black rotate-12' : 'bg-blue-600 text-white -rotate-12'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className={`text-3xl font-black tracking-tighter ${isHacker ? 'text-green-500 font-mono' : 'text-slate-100'}`}>
            CYPHER<span className="opacity-40">AI</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">
            {isHacker ? 'Kernel Security Protocol v4.3' : 'Welcome Bhai! ✨'}
          </p>
        </div>

        {authState === AuthState.IDENTIFY && (
          <form onSubmit={handleIdentifierSubmit} className="space-y-5 animate-in fade-in duration-500">
             <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mb-4">
              <button type="button" onClick={() => setMethod(LoginMethod.EMAIL)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === LoginMethod.EMAIL ? (isHacker ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400') : 'text-slate-600'}`}>Email</button>
              <button type="button" onClick={() => setMethod(LoginMethod.MOBILE)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === LoginMethod.MOBILE ? (isHacker ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400') : 'text-slate-600'}`}>Mobile</button>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 pl-4">{method === LoginMethod.EMAIL ? 'Email ID' : 'Mobile Number'}</label>
              <input 
                type={method === LoginMethod.EMAIL ? "email" : "tel"} 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full px-6 py-4 rounded-[1.5rem] border bg-black/50 focus:outline-none transition-all font-bold ${isHacker ? 'border-green-500/20 text-green-400 font-mono' : 'border-white/5 text-slate-200'}`}
                placeholder={method === LoginMethod.EMAIL ? "bhai@gmail.com" : "+91 9876543210"}
                required
              />
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button disabled={loading} className={`w-full py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${isHacker ? 'bg-green-600 text-black hover:bg-green-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        )}

        {authState === AuthState.OTP && (
          <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className={`text-xl font-black text-center ${isHacker ? 'text-green-500' : 'text-white'}`}>New User: Verify OTP</h3>
            <input 
              maxLength={6}
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`w-full px-6 py-5 rounded-[1.5rem] border bg-black/50 text-center tracking-[0.5em] text-2xl font-black ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`}
              placeholder="000000"
              required
            />
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button className={`w-full py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest ${isHacker ? 'bg-green-600 text-black' : 'bg-blue-600 text-white'}`}>Verify & Signup</button>
          </form>
        )}

        {authState === AuthState.REGISTER && (
          <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-500">
            <h3 className={`text-xl font-black text-center ${isHacker ? 'text-green-500' : 'text-white'}`}>Create Account</h3>
            <div className="space-y-3">
              <input placeholder="Choose Username" value={fullName} onChange={e => setFullName(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black/30 font-bold ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
              <input type="password" placeholder="Set Password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black/30 font-bold ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black/30 font-bold ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button className={`w-full py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest ${isHacker ? 'bg-green-600 text-black' : 'bg-blue-600 text-white'}`}>Initialize Profile</button>
          </form>
        )}

        {authState === AuthState.LOGIN_PASSWORD && (
          <form onSubmit={handleLoginWithPassword} className="space-y-4 animate-in fade-in duration-500">
            <h3 className={`text-xl font-black text-center ${isHacker ? 'text-green-500' : 'text-white'}`}>Login Back</h3>
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest">Verify identity for {identifier}</p>
            <div className="space-y-3">
              <input placeholder="Username" value={fullName} onChange={e => setFullName(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black/30 font-bold ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border bg-black/30 font-bold ${isHacker ? 'border-green-500/20 text-green-400' : 'border-white/5 text-slate-200'}`} required />
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}
            <button className={`w-full py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest ${isHacker ? 'bg-green-600 text-black' : 'bg-blue-600 text-white'}`}>Access Terminal</button>
            <button type="button" onClick={() => setAuthState(AuthState.IDENTIFY)} className="w-full text-[9px] text-slate-600 font-bold uppercase tracking-widest">Use different account</button>
          </form>
        )}

        <div className="mt-8 text-center opacity-30">
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">Himanshu Yadav | Secure Node v4.3</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
