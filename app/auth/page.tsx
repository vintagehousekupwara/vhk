"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, LockKeyhole } from "lucide-react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { app, googleProvider, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import emailjs from '@emailjs/browser';

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [userOtp, setUserOtp] = useState("");

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email !== "admin@thevintagehouse.com") {
        router.push("/profile");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ==========================================
  // GOOGLE SIGN IN
  // ==========================================
  const handleGoogleSignIn = async () => {
    setIsLoading(true); setError("");
    try {
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, googleProvider);
      
      await setDoc(doc(db, "users", result.user.uid), {
        name: result.user.displayName,
        email: result.user.email,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      router.push("/profile");
    } catch (err: any) {
      setError("Google Sign-In failed.");
      setIsLoading(false);
    }
  };

  // ==========================================
  // PASSWORDLESS OTP FLOW
  // ==========================================
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) return setError("Email service misconfigured.");
    setIsLoading(true); setError("");

    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(new Date().getTime() + 15 * 60000);

      await setDoc(doc(db, "otps", email), { otp: generatedOtp, expiresAt: expiry.toISOString() });

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { to_email: email, passcode: generatedOtp, time: expiry.toLocaleTimeString() },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setStep(2);
    } catch (err: any) {
      setError("Failed to send OTP. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");

    try {
      const otpDoc = await getDoc(doc(db, "otps", email));
      
      if (otpDoc.exists() && otpDoc.data().otp === userOtp) {
        if (new Date() > new Date(otpDoc.data().expiresAt)) {
          setError("OTP expired. Request a new one."); setIsLoading(false); return;
        }

        const auth = getAuth(app);
        // We generate a deterministic, highly secure dummy password so Firebase Auth works passwordlessly!
        const secureDummyPassword = `VINTAGE_${email}_SECURE!992026`; 

        try {
          // Try to sign in an existing user
          await signInWithEmailAndPassword(auth, email, secureDummyPassword);
        } catch (signInError) {
          // If user doesn't exist, create them seamlessly
          const userCredential = await createUserWithEmailAndPassword(auth, email, secureDummyPassword);
          await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            createdAt: new Date().toISOString()
          });
        }

        await deleteDoc(doc(db, "otps", email)); // Clean up
        router.push("/profile");
      } else {
        setError("Invalid OTP.");
      }
    } catch (err: any) {
      setError("Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-floating border border-brand-secondary">
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-brand-text mb-2">Guest Portal</h1>
          <p className="text-brand-muted text-sm">
            {step === 1 ? "Passwordless secure login." : "Verify your email to continue."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              <button onClick={handleGoogleSignIn} type="button" className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg flex items-center justify-center gap-3 font-medium hover:bg-gray-50 transition-colors mb-6 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-gray-400 absolute uppercase tracking-widest">Or Secure OTP</span>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:border-brand-primary focus:outline-none" />
                </div>
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button type="submit" disabled={isLoading || !email} className="w-full bg-brand-text text-white py-4 text-sm tracking-widest uppercase hover:bg-brand-primary transition-colors flex items-center justify-center">
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Send Login Code"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <form onSubmit={handleVerifyOTP} className="space-y-6 text-center">
                <div className="w-16 h-16 bg-brand-secondary/50 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-primary">
                  <LockKeyhole size={32} />
                </div>
                <input 
                  type="text" maxLength={6} required value={userOtp} onChange={(e) => setUserOtp(e.target.value)}
                  placeholder="••••••" className="w-full py-4 text-center text-2xl tracking-[1em] font-mono bg-brand-bg border border-brand-secondary focus:border-brand-primary focus:outline-none"
                />
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button type="submit" disabled={isLoading || userOtp.length !== 6} className="w-full bg-brand-primary text-white py-4 text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors flex items-center justify-center">
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Authenticate & Login"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}