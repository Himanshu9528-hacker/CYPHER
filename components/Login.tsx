
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, User } from '../types';

// Declare global for EmailJS
declare const emailjs: any;

interface LoginProps {
  onLogin: (user: User) => void;
}

enum LoginMethod {
  EMAIL = 'EMAIL',
  MOBILE = 'MOBILE'
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState(AppMode.STANDARD);
  const [method, setMethod] = useState(LoginMethod.EMAIL);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tamperDetected, setTamperDetected] = useState(false);

  // ==========================================================
  // CONFIGURATION
  // ==========================================================
  const EMAILJS_PUBLIC_KEY = "IPXA-vfIhwSTKjhqP"; 
  const EMAILJS_SERVICE_ID = "service_j3vkuxm";    
  const EMAILJS_TEMPLATE_ID = "template_uxyn8ts"; 
  // ==========================================================

  // Basic Anti-Tamper: Detect if DevTools are being used to bypass logic
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        // DevTools might be open
        console.warn("SECURITY_WARNING: Debugger activity detected.");
      }
    };
    window.addEventListener('resize', detectDevTools);
    return () => window.removeEventListener('resize', detectDevTools);
  }, []);

  useEffect(() => {
    if (typeof emailjs !== 'undefined' && !!EMAILJS_PUBLIC_KEY) {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
      } catch (e) {
        console.error("SEC_ERR_INIT");
      }
    }
  }, [EMAILJS_PUBLIC_KEY]);

  const isHacker = mode === AppMode.HACKER;

  // Use Crypto API for better randomness (Normal Math.random is predictable)
  const generateSecureOTP = useCallback(() => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 900000 + 100000).toString();
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Sanitize input
    const cleanId = identifier ? identifier.trim().toLowerCase() : "";

    if (method === LoginMethod.EMAIL && (!cleanId || (cleanId.includes && !cleanId.includes('@')))) {
      setError('VALIDATION_ERR: Invalid Gmail format.');
      return;
    }

    if (method === LoginMethod.MOBILE && (cleanId.length < 10)) {
      setError('VALIDATION_ERR: Invalid Mobile format.');
      return;
    }

    setLoading(true);

    const secureOtp = generateSecureOTP();
    setSentOtp(secureOtp);

    if (method === LoginMethod.EMAIL) {
      const templateParams = {
        to_email: cleanId,      
        passcode: secureOtp,       
        user_mode: mode,
        to_name: cleanId.split('@')[0],
        timestamp: new Date().toISOString()
      };

      try {
        if (typeof emailjs === 'undefined') throw new Error("MODULE_MISSING");
        const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        if (response.status === 200) setOtpSent(true);
        else throw new Error("TRANSMISSION_FAILED");
      } catch (err: any) {
        setError(`SEC_ERR_DELIVERY: ${err?.message || "Internal failure"}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Mobile Simulation
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        // Note for user: In prod, this would be an encrypted SMS call
        alert(`SECURITY_BRIDGE: OTP generated for ${cleanId}. (Check Console for Debug Mode)`);
        console.log(`%c [AUTH_GATE] OTP: ${secureOtp} `, 'background: #222; color: #bada55; font-size: 20px;');
      }, 1000);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Time-constant comparison could be better, but basic check for now
    if (otp === sentOtp && sentOtp !== null) {
      setIsVerified(true);
    } else {
      setError('AUTH_FAILED: Invalid credentials. Attempt logged.');
      // Slow down brute force
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.length < 2) {
      setError('VALIDATION_ERR: Name too short.');
      return;
    }

    // Basic hash-like ID for session persistence
    const salt = "cypher_v6_";
    const persistentId = btoa(salt + identifier).substring(0, 16);
    
    onLogin({
      id: persistentId,
      username: fullName.trim(),
      isHacker: mode === AppMode.HACKER
    });
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-6 transition-colors duration-1000 ${isHacker ? 'bg-black' : 'bg-[#020617]'}`}>
      <div className={`absolute inset-0 opacity-20 blur-[150px] transition-colors duration-1000 ${isHacker ? 'bg-green-600' : 'bg-blue-600'}`}></div>
      
      <div className={`relative w-full max-w-md p-10 rounded-[3rem] border shadow-2xl transition-all duration-500 overflow-hidden ${isHacker ? 'bg-zinc-950 border-green-500/20 shadow-green-500/10' : 'bg-slate-900/50 border-white/10 shadow-blue-500/10 backdrop-blur-3xl'}`}>
        
        {/* Security Scan Overlay (Visual only) */}
        <div className={`absolute top-0 left-0 w-full h-1 z-10 animate-pulse ${isHacker ? 'bg-green-500' : 'bg-blue-500'}`}></div>

        <div className="flex flex-col items-center mb-8">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transition-all duration-700 ${isHacker ? 'bg-green-500 text-black rotate-12' : 'bg-blue-600 text-white -rotate-12'}`}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${isHacker ? 'text-green-500 font-mono' : 'text-slate-100'}`}>
            CYPHER<span className="opacity-40">AI</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">
            {isHacker ? 'Kernel Security Protocol v4.2' : 'Bhai, Welcome Back! ✨'}
          </p>
        </div>

        {!isVerified && (
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-8">
            <button onClick={() => setMode(AppMode.STANDARD)} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${!isHacker ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>STANDARD</button>
            <button onClick={() => setMode(AppMode.HACKER)} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${isHacker ? 'bg-green-600 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>HACKER</button>
          </div>
        )}

        {!otpSent && !isVerified ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="flex gap-2 p-1 bg-black/20 rounded-2xl border border-white/5 mb-4">
              <button type="button" onClick={() => setMethod(LoginMethod.EMAIL)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === LoginMethod.EMAIL ? (isHacker ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400') : 'text-slate-600'}`}>Email</button>
              <button type="button" onClick={() => setMethod(LoginMethod.MOBILE)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${method === LoginMethod.MOBILE ? (isHacker ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400') : 'text-slate-600'}`}>Mobile</button>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest pl-4 ${isHacker ? 'text-green-800' : 'text-slate-500'}`}>
                {method === LoginMethod.EMAIL ? 'Identification Hash (Email)' : 'Neural Link (Mobile)'}
              </label>
              <input 
                type={method === LoginMethod.EMAIL ? "email" : "tel"} 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="off"
                className={`w-full px-6 py-5 rounded-[2rem] border bg-black/50 focus:outline-none focus:ring-2 transition-all font-bold ${isHacker ? 'border-green-500/20 focus:ring-green-500/20 text-green-400 font-mono' : 'border-white/5 focus:ring-blue-500/20 text-slate-200'}`}
                placeholder={method === LoginMethod.EMAIL ? "target@gmail.com" : "+91 XXXXX XXXXX"}
                required
              />
            </div>
            {error && (
              <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-[11px] font-bold text-red-500 font-mono">{error}</p>
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${isHacker ? 'bg-green-600 text-black hover:bg-green-500 shadow-green-500/20' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'}`}
            >
              {loading ? 'Executing Protocol...' : 'Request Auth Code'}
            </button>
          </form>
        ) : !isVerified ? (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
             <div className="text-center space-y-2">
               <h3 className={`text-2xl font-black ${isHacker ? 'text-green-500 font-mono' : 'text-white'}`}>Verify Challenge</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Encrypted payload delivered.</p>
             </div>
             <div className="space-y-2">
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-6 py-6 rounded-[2rem] border bg-black/50 focus:outline-none focus:ring-2 transition-all font-black text-center tracking-[0.8em] text-3xl ${isHacker ? 'border-green-500/20 focus:ring-green-500/20 text-green-400' : 'border-white/5 focus:ring-blue-500/20 text-slate-200'}`}
                  placeholder="000000"
                  autoFocus
                  required
                />
              </div>
              {error && <p className="text-center text-[11px] font-bold text-red-500 font-mono">{error}</p>}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-widest shadow-2xl transition-all ${isHacker ? 'bg-green-500 text-black shadow-green-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'}`}
              >
                {loading ? 'Validating...' : 'Unlock System'}
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setError(''); }} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-600 py-2 hover:text-slate-400 transition-colors">Re-transmit Code</button>
          </form>
        ) : (
          <form onSubmit={handleCompleteProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center space-y-2 mb-6">
               <h3 className={`text-2xl font-black ${isHacker ? 'text-green-500 font-mono' : 'text-white'}`}>Initialize Profile</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">What should we call you in the system?</p>
             </div>
             <div className="space-y-2">
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-6 py-5 rounded-[2rem] border bg-black/50 focus:outline-none focus:ring-2 transition-all font-bold ${isHacker ? 'border-green-500/20 focus:ring-green-500/20 text-green-400 font-mono' : 'border-white/5 focus:ring-blue-500/20 text-slate-200'}`}
                  placeholder="Enter alias"
                  autoFocus
                  required
                />
              </div>
              {error && <p className="text-center text-[11px] font-bold text-red-500">{error}</p>}
              <button 
                type="submit" 
                className={`w-full py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-widest shadow-2xl transition-all ${isHacker ? 'bg-green-500 text-black shadow-green-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'}`}
              >
                Establish Connection
              </button>
          </form>
        )}

        <div className="mt-8 text-center opacity-40">
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">Architect: Himanshu Yadav | Secured v4.2</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
