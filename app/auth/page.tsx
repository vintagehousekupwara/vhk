"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  onAuthStateChanged, sendEmailVerification, updateProfile, 
  signInWithPopup, GoogleAuthProvider 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { Loader2, Mail, Lock, User, Phone, MapPin, Calendar, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  
  // State machine: "login" | "register" | "verify" | "complete_profile"
  const [mode, setMode] = useState<"login" | "register" | "verify" | "complete_profile">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Registration / Profile Data
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: "", age: ""
  });

  // Temporarily hold Google user ID if profile is incomplete
  const [tempUid, setTempUid] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If email is not verified, trap them in verify screen
        if (!user.emailVerified) {
          setMode("verify");
          return;
        }
        
        // If verified, ensure they exist in Firestore database with full details
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().address) {
          // Fully verified and data complete -> Send to profile
          router.push("/profile");
        } else {
          // Email is verified (like Google Auth), but data is missing!
          setFormData(prev => ({ ...prev, name: user.displayName || "", email: user.email || "" }));
          setTempUid(user.uid);
          setMode("complete_profile");
        }
      }
    });
    return () => unsub();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Set display name in Auth
      await updateProfile(user, { displayName: formData.name });

      // Save complete details to Firestore Database immediately
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        age: formData.age,
        createdAt: new Date().toISOString()
      });

      // Send Verification Email
      await sendEmailVerification(user);
      setMode("verify");
      
    } catch (err: any) {
      setError(err.message.includes("email-already-in-use") ? "Email already exists." : "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      if (!userCredential.user.emailVerified) {
        setMode("verify");
      }
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true); setError("");
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Database
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists() || !userDoc.data().address) {
        setFormData(prev => ({ ...prev, name: result.user.displayName || "", email: result.user.email || "" }));
        setTempUid(result.user.uid);
        setMode("complete_profile");
      } else {
        router.push("/profile");
      }
    } catch (err: any) {
      setError("Google Sign-In failed.");
    } finally {
      setLoading(false);
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

      router.push("/profile");
    } catch (err) {
      setError("Failed to save details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-brand-secondary">
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-brand-text">Sign Up | Sign In</h1>
          <p className="text-xs tracking-widest text-brand-muted uppercase mt-2">
            {mode === "login" && "The Vintage House Kupwara"}
            {mode === "register" && "Create Guest Account"}
            {mode === "verify" && "Verify Email Address"}
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

        {/* --- LOGIN FORM --- */}
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

        {/* --- REGISTRATION FORM (Full Details Required) --- */}
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

        {/* --- COMPLETE PROFILE FORM (For Google Logins missing data) --- */}
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

        {/* --- VERIFY EMAIL SCREEN --- */}
        {mode === "verify" && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verify your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              We've sent a verification link to <strong>{formData.email}</strong>. Please click the link to activate your account.
            </p>
            <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors">
              I've Verified, Continue
            </button>
          </div>
        )}

      </div>
    </main>
  );
}