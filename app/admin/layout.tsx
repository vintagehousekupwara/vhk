"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CalendarDays, UtensilsCrossed, Settings, LogOut, ShieldCheck, LockKeyhole, Mail, Loader2, BedDouble } from "lucide-react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // 1. Listen to Firebase Auth State continuously
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Handle the secure login directly with Firebase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError("");

    try {
      const auth = getAuth(app);
      // Pass the actual email and password directly to Firebase
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      // Firebase throws specific errors, we'll keep it generic for security
      setError("Access Denied. Invalid email or password.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 3. Handle Logout
  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
  };

  // =========================================================
  // STATE A: LOADING (Checking Session)
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  // =========================================================
  // STATE B: THE VAULT (Highly Secure Login Screen)
  // =========================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 border border-brand-primary/30 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(200,106,43,0.15)]">
              <ShieldCheck className="text-brand-primary" size={32} />
            </div>
            <h1 className="font-serif text-3xl text-white tracking-widest uppercase mb-2">Vintage System</h1>
            <p className="text-brand-muted text-xs uppercase tracking-[0.3em]">Restricted Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-4 text-brand-primary" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isAuthenticating}
                  autoFocus
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all text-white text-sm"
                  placeholder="admin@thevintagehouse.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Master Passcode</label>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-4 top-4 text-brand-primary" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isAuthenticating}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all text-white text-center tracking-[0.5em] text-lg font-mono placeholder:tracking-normal placeholder:text-gray-600 placeholder:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs text-center font-mono uppercase tracking-wider mt-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isAuthenticating || !password || !email}
              className="w-full bg-brand-primary text-white py-4 rounded-xl text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#A65520] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isAuthenticating ? <Loader2 className="animate-spin" size={18} /> : "Authenticate"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // =========================================================
  // STATE C: THE ADMIN PANEL (Authorized Access Only)
  // =========================================================
  const menuItems = [
    { name: "Dashboard Overview", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Inventory Calendar", path: "/admin/calendar", icon: <CalendarDays size={20} /> },
    { name: "Room Requests", path: "/admin/rooms", icon: <CalendarDays size={20} /> },
    { name: "Food Orders", path: "/admin/orders", icon: <UtensilsCrossed size={20} /> },
    { name: "Manage Menu", path: "/admin/food", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-brand-text text-white flex-col hidden md:flex">
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <ShieldCheck className="text-brand-primary" size={28} />
          <div>
            <h2 className="font-serif text-xl tracking-wider">Vintage<span className="text-brand-primary">Admin</span></h2>
            <span className="text-[10px] text-brand-muted uppercase tracking-widest">Kupwara Portal</span>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
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
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium tracking-wide">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 shrink-0">
          <h1 className="font-serif text-2xl text-brand-text">Management Console</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-green-600 font-bold tracking-widest uppercase bg-green-50 px-3 py-1 rounded-full border border-green-200">
              System Online
            </span>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}