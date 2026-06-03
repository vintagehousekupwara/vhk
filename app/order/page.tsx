"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, User, Phone, Mail, MapPin, Hash, Minus, Plus, LockKeyhole, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, addDoc, doc, setDoc, getDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import emailjs from '@emailjs/browser';

function OrderFlowInner() {
  const searchParams = useSearchParams();
  const prefilledDish = searchParams.get("item");

  const [step, setStep] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState("");
  const [userOtp, setUserOtp] = useState("");
  
  const [dishes, setDishes] = useState<any[]>([]);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", pincode: "", quantity: 1
  });

  // Fetch Menu to populate the selected dish
  useEffect(() => {
    const fetchMenu = async () => {
      const snap = await getDocs(collection(db, "products"));
      const menuData = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setDishes(menuData);
      
      if (prefilledDish) {
        const found = menuData.find(d => d.name === prefilledDish);
        if (found) setSelectedDish(found);
      }
    };
    fetchMenu();
  }, [prefilledDish]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateQuantity = (amount: number) => {
    const newQty = formData.quantity + amount;
    if (newQty >= 1 && newQty <= 20) setFormData({ ...formData, quantity: newQty });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDish) return setError("Please select a dish first.");
    if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) return setError("Email service misconfigured.");

    setIsOrdering(true); setError("");
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(new Date().getTime() + 15 * 60000); 

      await setDoc(doc(db, "otps", formData.email), { otp: generatedOtp, expiresAt: expiry.toISOString() });
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { to_email: formData.email, passcode: generatedOtp, time: expiry.toLocaleTimeString() },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStep(2); 
    } catch (err: any) {
      setError("Failed to send OTP. Please check your network.");
    } finally {
      setIsOrdering(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true); setError("");

    try {
      const otpDoc = await getDoc(doc(db, "otps", formData.email));
      if (otpDoc.exists() && otpDoc.data().otp === userOtp) {
        if (new Date() > new Date(otpDoc.data().expiresAt)) {
          setError("OTP expired."); setIsOrdering(false); return;
        }

        await addDoc(collection(db, "food_orders"), {
          productName: selectedDish.name,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          location: formData.address, 
          pincode: formData.pincode,
          quantity: formData.quantity,
          unitPrice: selectedDish.price,
          totalPrice: selectedDish.price * formData.quantity,
          status: "Pending",
          createdAt: new Date().toISOString()
        });

        await deleteDoc(doc(db, "otps", formData.email));
        setStep(3);
      } else {
        setError("Invalid OTP.");
      }
    } catch (err) {
      setError("An error occurred confirming your order.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (!dishes.length) return <div className="py-20 text-center text-brand-muted"><Loader2 className="animate-spin mx-auto mb-4"/> Loading Kitchen...</div>;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: ORDER DETAILS */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-10">
              <span className="text-brand-primary tracking-widest uppercase text-xs font-bold mb-2 block">Room Service & Delivery</span>
              <h1 className="font-serif text-4xl text-brand-text mb-3">Place Your Order</h1>
              <p className="text-brand-muted text-sm leading-relaxed">
                We will send an OTP to your email to verify your order before sending it to our kitchen.
              </p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-5">
              
              <div className="relative bg-brand-bg p-4 rounded border border-brand-secondary">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2 block">Select Dish</label>
                <select 
                  required 
                  value={selectedDish?.name || ""} 
                  onChange={(e) => setSelectedDish(dishes.find(d => d.name === e.target.value))} 
                  className="w-full bg-transparent focus:outline-none cursor-pointer font-serif text-lg text-brand-primary"
                >
                  <option value="" disabled>Choose from our menu...</option>
                  {dishes.map(dish => (
                    <option key={dish.id} value={dish.name}>{dish.name} — ₹{dish.price}</option>
                  ))}
                </select>
              </div>

              {selectedDish && (
                <>
                  <div className="flex items-center justify-between bg-white p-4 border border-brand-secondary mb-6">
                    <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Quantity</span>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => updateQuantity(-1)} className="p-1 rounded-full bg-brand-bg border border-brand-secondary"><Minus size={16}/></button>
                      <span className="font-bold text-lg w-6 text-center">{formData.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(1)} className="p-1 rounded-full bg-brand-bg border border-brand-secondary"><Plus size={16}/></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Full Name" />
                    </div>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Phone Number" />
                    </div>
                  </div>

                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Email Address (For Verification)" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="relative md:col-span-2">
                      <MapPin size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Exact Delivery Address or Room No." />
                    </div>
                    <div className="relative">
                      <Hash size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Pincode" />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                  <div className="pt-4 border-t border-brand-secondary mt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Order Total:</span>
                      <span className="text-2xl font-bold text-brand-primary">₹{(selectedDish.price * formData.quantity).toLocaleString()}</span>
                    </div>
                    <button type="submit" disabled={isOrdering} className="w-full bg-brand-primary text-white py-4 text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors flex items-center justify-center shadow-luxury">
                      {isOrdering ? <Loader2 className="animate-spin" size={18} /> : "Verify Identity & Place Order"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center py-10">
            <div className="w-16 h-16 bg-brand-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
              <LockKeyhole size={32} />
            </div>
            <h2 className="font-serif text-3xl text-brand-text mb-2">Verify Order</h2>
            <p className="text-brand-muted text-sm mb-8 max-w-sm mx-auto">
              We sent a 6-digit code to <span className="font-bold text-brand-text">{formData.email}</span>.
            </p>

            <form onSubmit={handleVerifyOTP} className="w-full max-w-sm mx-auto space-y-6">
              <input 
                type="text" maxLength={6} required value={userOtp} onChange={(e) => setUserOtp(e.target.value)}
                placeholder="••••••" className="w-full py-4 text-center text-2xl tracking-[1em] font-mono bg-brand-bg border border-brand-secondary focus:outline-none"
              />
              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
              <button type="submit" disabled={isOrdering || userOtp.length !== 6} className="w-full bg-brand-text text-white py-4 text-sm tracking-widest uppercase hover:bg-brand-primary transition-colors flex items-center justify-center">
                {isOrdering ? <Loader2 className="animate-spin" size={18} /> : "Confirm Order"}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS (With requested message) */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={50} className="text-green-600" />
            </div>
            <h2 className="font-serif text-4xl text-brand-text mb-4">Order Sent to Kitchen!</h2>
            <p className="text-brand-muted max-w-md mx-auto leading-relaxed mb-6">
              Thank you! Your order for <span className="font-bold">{formData.quantity}x {selectedDish.name}</span> has been confirmed.
            </p>
            
            {/* THE REQUESTED SIGN IN MESSAGE */}
            <div className="bg-brand-secondary/30 border border-brand-secondary p-5 rounded-lg text-sm text-brand-text max-w-md mx-auto mb-8">
              <strong>Track Your Order:</strong> You can sign in with the same email (<span className="text-brand-primary">{formData.email}</span>) in the Guest Portal to view your live order status!
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/auth">
                <button className="border border-brand-primary bg-brand-primary text-white py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-[#A65520] transition-colors">
                  Sign In Now
                </button>
              </Link>
              <Link href="/menu">
                <button className="border border-brand-secondary text-brand-text py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-brand-bg transition-colors">
                  Back to Menu
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrderPage() {
  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center py-12 px-4 md:px-6 lg:px-24 pt-24">
      <div className="max-w-4xl w-full bg-white shadow-floating border border-brand-secondary p-6 md:p-12 min-h-[600px] flex items-center justify-center">
        <Suspense fallback={<Loader2 className="animate-spin text-brand-primary mx-auto" size={40} />}>
          <OrderFlowInner />
        </Suspense>
      </div>
    </main>
  );
}