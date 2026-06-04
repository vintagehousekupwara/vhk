"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, CalendarDays, UtensilsCrossed, Settings, 
  LogOut, ShieldCheck, LockKeyhole, Mail, Loader2, AlertTriangle, Key, Menu, BedDouble
} from "lucide-react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import emailjs from '@emailjs/browser';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Strict Admin Email Check
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const MASTER_RECOVERY_EMAIL = "ventagehouse@gmail.com";

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // SECURITY: Rate Limiting State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // BYPASS: OTP State
  const [bypassStep, setBypassStep] = useState(0); 
  const [adminOtp, setAdminOtp] = useState("");
  const [bypassError, setBypassError] = useState("");

  // Initialize Lockout State from Local Storage
  useEffect(() => {
    const storedAttempts = localStorage.getItem("vhk_admin_failed_attempts");
    const storedLockoutTime = localStorage.getItem("vhk_admin_lockout_time");
    
    if (storedAttempts) {
      const attempts = parseInt(storedAttempts);
      setFailedAttempts(attempts);
      if (attempts >= 5) {
        if (storedLockoutTime) {
          const lockoutTime = new Date(storedLockoutTime).getTime();
          const now = new Date().getTime();
          if (now - lockoutTime < 15 * 60 * 1000) { 
            setIsLockedOut(true);
          } else {
            localStorage.removeItem("vhk_admin_failed_attempts");
            localStorage.removeItem("vhk_admin_lockout_time");
            setFailedAttempts(0);
          }
        } else {
          setIsLockedOut(true);
        }
      }
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.email !== ADMIN_EMAIL) {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ADMIN_EMAIL]);

  // Handle Secure Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setIsAuthenticating(true);
    setError("");

    if (email !== ADMIN_EMAIL) {
      handleFailedAttempt();
      return;
    }

    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem("vhk_admin_failed_attempts");
      setFailedAttempts(0);
    } catch (err: any) {
      console.error(err);
      handleFailedAttempt();
    } finally {
      setIsAuthenticating(false);
    }
  };

  // The Security Engine
  const handleFailedAttempt = async () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    localStorage.setItem("vhk_admin_failed_attempts", newAttempts.toString());

    if (newAttempts >= 5) {
      setIsLockedOut(true);
      localStorage.setItem("vhk_admin_lockout_time", new Date().toISOString());
      setError("SYSTEM LOCKED.");
      
      try {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_CRITICAL_TEMPLATE_ID!,
          { time: new Date().toLocaleString(), attempted_email: email || "Unknown/Blank" },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
      } catch (emailErr) {
        console.error("Failed to send security alert", emailErr);
      }
    } else {
      setError(`Access Denied. Attempt ${newAttempts}/5.`);
    }
    setIsAuthenticating(false);
  };

  // EMERGENCY BYPASS FLOW
  const handleRequestBypass = async () => {
    setBypassStep(1); 
    setBypassError("");
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(new Date().getTime() + 5 * 60000); 

      await setDoc(doc(db, "otps", MASTER_RECOVERY_EMAIL), {
        otp: generatedOtp,
        expiresAt: expiry.toISOString()
      });

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { to_email: MASTER_RECOVERY_EMAIL, passcode: generatedOtp, time: expiry.toLocaleTimeString() },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setBypassStep(2); 
    } catch (err) {
      setBypassError("Failed to send recovery email.");
      setBypassStep(0);
    }
  };

  const handleVerifyBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    setBypassStep(1); 
    setBypassError("");

    try {
      const otpDoc = await getDoc(doc(db, "otps", MASTER_RECOVERY_EMAIL));
      if (otpDoc.exists() && otpDoc.data().otp === adminOtp) {
        if (new Date() > new Date(otpDoc.data().expiresAt)) {
          setBypassError("Bypass code expired.");
          setBypassStep(2);
          return;
        }
        await deleteDoc(doc(db, "otps", MASTER_RECOVERY_EMAIL));
        localStorage.removeItem("vhk_admin_failed_attempts");
        localStorage.removeItem("vhk_admin_lockout_time");
        setFailedAttempts(0);
        setIsLockedOut(false);
        setBypassStep(0);
        setAdminOtp("");
      } else {
        setBypassError("Invalid Bypass Code.");
        setBypassStep(2);
      }
    } catch (err) {
      setBypassError("Verification failed.");
      setBypassStep(2);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  // STATE: THE VAULT (Mobile Optimized Padding)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="text-center mb-8 md:mb-10">
            <div className={`w-14 h-14 md:w-16 md:h-16 border rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(200,106,43,0.15)] ${isLockedOut ? 'border-red-500/50 bg-red-500/10' : 'border-brand-primary/30 bg-brand-primary/10'}`}>
              {isLockedOut ? <AlertTriangle className="text-red-500" size={28} /> : <ShieldCheck className="text-brand-primary" size={28} />}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-white tracking-widest uppercase mb-2">Vintage System</h1>
            <p className="text-brand-muted text-[10px] md:text-xs uppercase tracking-[0.3em]">Restricted Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-5 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            
            {/* LOCKOUT OVERLAY */}
            <AnimatePresence>
              {isLockedOut && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border border-red-500/50 rounded-2xl"
                >
                  {bypassStep === 0 && (
                    <>
                      <AlertTriangle className="text-red-500 w-10 h-10 md:w-12 md:h-12 mb-4" />
                      <h3 className="text-white font-bold tracking-widest uppercase mb-2 text-sm md:text-base">Security Lockout</h3>
                      <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed mb-4">
                        Multiple failed authentication attempts detected. This terminal has been locked.
                      </p>
                      <span className="text-red-500 text-[10px] uppercase font-bold tracking-widest">Try again in 15 mins</span>
                      
                      <button 
                        onClick={handleRequestBypass} type="button"
                        className="mt-6 text-[10px] text-gray-400 hover:text-brand-primary uppercase tracking-widest font-bold border-b border-transparent hover:border-brand-primary transition-all flex items-center gap-2"
                      >
                        <Key size={12} /> Emergency Bypass
                      </button>
                    </>
                  )}

                  {bypassStep === 1 && (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-brand-primary w-8 h-8 mb-4" />
                      <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">Requesting Access...</p>
                    </div>
                  )}

                  {bypassStep === 2 && (
                    <div className="w-full">
                      <Key className="text-brand-primary w-6 h-6 md:w-8 md:h-8 mx-auto mb-4" />
                      <p className="text-[10px] md:text-xs text-gray-400 mb-4 leading-relaxed">
                        Recovery code sent to <br/><span className="text-white font-bold">{MASTER_RECOVERY_EMAIL}</span>
                      </p>
                      <div className="space-y-3">
                        <input 
                          type="text" maxLength={6} required value={adminOtp} onChange={(e) => setAdminOtp(e.target.value)}
                          className="w-full py-3 bg-black/50 border border-white/20 rounded-lg text-white text-center tracking-[1em] font-mono focus:border-brand-primary outline-none text-sm md:text-base"
                          placeholder="••••••"
                        />
                        {bypassError && <p className="text-red-400 text-[10px] uppercase font-bold">{bypassError}</p>}
                        <div className="flex gap-2">
                          <button onClick={() => setBypassStep(0)} type="button" className="w-1/3 bg-gray-800 text-white py-3 rounded-lg text-[9px] md:text-[10px] uppercase tracking-widest font-bold">Cancel</button>
                          <button onClick={handleVerifyBypass} type="button" disabled={adminOtp.length !== 6} className="w-2/3 bg-brand-primary text-white py-3 rounded-lg text-[9px] md:text-[10px] uppercase tracking-widest font-bold disabled:opacity-50">Verify</button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 md:top-4 text-brand-primary" />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  disabled={isAuthenticating || isLockedOut} autoFocus required
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all text-white text-sm disabled:opacity-50"
                  placeholder="admin@thevintagehouse.com"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold">Master Passcode</label>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-4 top-3.5 md:top-4 text-brand-primary" />
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={isAuthenticating || isLockedOut} required
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all text-white text-center tracking-[0.5em] text-base md:text-lg font-mono placeholder:tracking-normal placeholder:text-gray-600 placeholder:text-sm disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && !isLockedOut && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-[10px] md:text-xs text-center font-mono uppercase tracking-wider mt-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button 
              type="submit" disabled={isAuthenticating || !password || !email || isLockedOut}
              className="w-full bg-brand-primary text-white py-3.5 md:py-4 rounded-xl text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#A65520] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isAuthenticating ? <Loader2 className="animate-spin" size={16} /> : "Authenticate"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // STATE C: THE ADMIN PANEL (Authorized Access Only)
  const menuItems = [
    { name: "Overview", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Inventory", path: "/admin/calendar", icon: <CalendarDays size={20} /> },
    { name: "Rooms", path: "/admin/rooms", icon: <BedDouble size={20} /> },
    { name: "Kitchen", path: "/admin/orders", icon: <UtensilsCrossed size={20} /> },
    { name: "Menu", path: "/admin/food", icon: <Settings size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="w-64 bg-brand-text text-white flex-col hidden md:flex shrink-0 z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <ShieldCheck className="text-brand-primary" size={24} />
          <div>
            <h2 className="font-serif text-lg tracking-wider">Vintage<span className="text-brand-primary">Admin</span></h2>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-brand-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                  {item.icon}
                  <span className="text-sm font-medium tracking-wide">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen relative overflow-hidden pb-16 md:pb-0">
        
        {/* COMPACT HEADER (Mobile & Desktop) */}
        <header className="bg-white border-b border-gray-200 h-14 md:h-16 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-brand-primary md:hidden" size={20} />
            <h1 className="font-serif text-lg md:text-xl text-brand-text">Management</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[9px] md:text-[10px] text-green-600 font-bold tracking-widest uppercase bg-green-50 px-2 py-1 rounded-full border border-green-200">
              Online
            </span>
            {/* MOBILE LOGOUT BUTTON */}
            <button onClick={handleLogout} className="md:hidden p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 sm:p-4 md:p-8 bg-gray-50">
          {children}
        </div>
      </main>

      {/* APP-STYLE BOTTOM NAVIGATION (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path} className="flex-1 h-full">
              <div className={`flex flex-col items-center justify-center h-full w-full transition-colors ${
                isActive ? "text-brand-primary" : "text-gray-400 hover:text-gray-600"
              }`}>
                {/* Active Indicator Line */}
                {isActive && <motion.div layoutId="bottomNavIndicator" className="absolute top-0 w-8 h-0.5 bg-brand-primary rounded-b-full" />}
                
                <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-brand-primary' : 'font-medium'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}