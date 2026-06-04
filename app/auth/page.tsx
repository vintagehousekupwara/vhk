"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  onAuthStateChanged, updateProfile, signInWithPopup, GoogleAuthProvider,
  setPersistence, browserLocalPersistence 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { Loader2, Mail, Lock, User, Phone, MapPin, Calendar } from "lucide-react";

const ADMIN_EMAILS = ["admin@thevintagehouse.com", "adminvintagesuperhouse@gmail.com"];

export default function AuthPage() {
  const router = useRouter();
  const auth = getAuth(app);
  
  const [mode, setMode] = useState<"login" | "register" | "complete_profile">("login");
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); 
  const [error, setError] = useState("");
  
  const isHandlingAuth = useRef(false);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: "", age: ""
  });

  const [tempUid, setTempUid] = useState<string | null>(null);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (isHandlingAuth.current) return;

      if (user) {
        // ADMIN INTERCEPT: Redirect admins instantly to dashboard
        if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          router.replace("/admin/rooms");
          return;
        }

        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().address) {
            router.replace("/profile");
          } else {
            setFormData(prev => ({ ...prev, name: user.displayName || "", email: user.email || "" }));
            setTempUid(user.uid);
            setMode("complete_profile");
            setIsInitializing(false);
          }
        } catch (err) {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    });
    
    return () => unsub();
  }, [auth, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    isHandlingAuth.current = true; 

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      // ADMIN INTERCEPT
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        router.replace("/admin/rooms");
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        age: formData.age,
        createdAt: new Date().toISOString()
      });

      router.replace("/profile");
    } catch (err: any) {
      setError(err.message.includes("email-already-in-use") ? "Email already exists." : "Failed to register. Please try again.");
      setLoading(false);
      isHandlingAuth.current = false;
    } 
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    isHandlingAuth.current = true;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // ADMIN INTERCEPT
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        router.replace("/admin/rooms");
        return;
      }

      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists() && docSnap.data().address) {
        router.replace("/profile");
      } else {
        setTempUid(user.uid);
        setMode("complete_profile");
        setLoading(false);
        isHandlingAuth.current = false;
      }
    } catch (err: any) {
      setError("Invalid email or password.");
      setLoading(false);
      isHandlingAuth.current = false;
    } 
  };

  const handleGoogleAuth = async () => {
    setLoading(true); setError("");
    isHandlingAuth.current = true;
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ADMIN INTERCEPT
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        router.replace("/admin/rooms");
        return;
      }
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || !userDoc.data().address) {
        setFormData(prev => ({ ...prev, name: user.displayName || "", email: user.email || "" }));
        setTempUid(user.uid);
        setMode("complete_profile");
        setLoading(false);
        isHandlingAuth.current = false;
      } else {
        router.replace("/profile");
      }
    } catch (err: any) {
      setError("Google Sign-In failed.");
      setLoading(false);
      isHandlingAuth.current = false;
    } 
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUid) return;
    setLoading(true); setError("");

    try {
      await setDoc(doc(db, "users", tempUid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        age: formData.age,
        createdAt: new Date().toISOString()
      }, { merge: true });

      router.replace("/profile");
    } catch (err) {
      setError("Failed to save details.");
      setLoading(false);
    } 
  };

  if (isInitializing) {
    return (
      <main className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary w-10 h-10" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-brand-secondary">
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-brand-text">The Vintage House</h1>
          <p className="text-xs tracking-widest text-brand-muted uppercase mt-2">
            {mode === "login" && "Secure Guest Login"}
            {mode === "register" && "Create Guest Account"}
            {mode === "complete_profile" && "Complete Your Profile"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {mode === "login" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold tracking-widest uppercase text-sm hover:bg-[#A65520] transition-colors mt-2">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sign In"}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 uppercase tracking-widest">OR</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <button type="button" onClick={handleGoogleAuth} disabled={loading} className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to The Vintage House? <button type="button" onClick={() => setMode("register")} className="text-brand-primary font-bold hover:underline">Create Account</button>
            </p>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input required type="number" min="18" name="age" value={formData.age} onChange={handleChange} placeholder="Age (18+)" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Complete Physical Address" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required type="password" name="password" minLength={8} value={formData.password} onChange={handleChange} placeholder="Password (Min 8 chars)" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
            </div>

            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest mt-2">All fields are mandatory for security.</p>
            
            <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold tracking-widest uppercase text-sm hover:bg-[#A65520] transition-colors mt-2">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Create Secure Account"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <button type="button" onClick={() => setMode("login")} className="text-brand-primary font-bold hover:underline">Log In</button>
            </p>
          </form>
        )}

        {mode === "complete_profile" && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">To complete your Google Sign-In, please provide your contact details for delivery and booking verification.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input required type="number" min="18" name="age" value={formData.age} onChange={handleChange} placeholder="Age (18+)" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Complete Physical Address" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-primary outline-none text-sm" />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold tracking-widest uppercase text-sm hover:bg-[#A65520] transition-colors mt-2">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Save & Continue"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}