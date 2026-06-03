"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Loader2, LockKeyhole, CheckCircle2, User, Phone, Mail, MapPin, Hash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { collection, addDoc, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import emailjs from '@emailjs/browser';

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [userOtp, setUserOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", pincode: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // STEP 1: SEND OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return setError("Your cart is empty.");
    if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) return setError("Email service misconfigured.");

    setIsProcessing(true); setError("");
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(new Date().getTime() + 15 * 60000); 

      await setDoc(doc(db, "otps", formData.email), {
        otp: generatedOtp,
        expiresAt: expiry.toISOString()
      });

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          to_email: formData.email,
          passcode: generatedOtp,
          time: expiry.toLocaleTimeString(),
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setStep(2); 
    } catch (err: any) {
      setError("Failed to send OTP. Please check your network and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // STEP 2: VERIFY OTP & PLACE BATCH ORDER
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true); setError("");

    try {
      const otpDoc = await getDoc(doc(db, "otps", formData.email));
      
      if (otpDoc.exists() && otpDoc.data().otp === userOtp) {
        if (new Date() > new Date(otpDoc.data().expiresAt)) {
          setError("OTP has expired. Please request a new one.");
          setIsProcessing(false); return;
        }

        // OTP Valid! Submit every item in the cart to Firebase as individual orders for the Admin
        const orderPromises = cart.map(item => {
          return addDoc(collection(db, "food_orders"), {
            productName: item.name,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            location: formData.address, // For Admin compatibility
            pincode: formData.pincode,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            status: "Pending",
            createdAt: new Date().toISOString()
          });
        });

        await Promise.all(orderPromises);

        // Clean up OTP and Empty the Cart
        await deleteDoc(doc(db, "otps", formData.email));
        cart.forEach(item => removeFromCart(item.id));
        
        setStep(3); // Success Screen
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred confirming your order.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && step === 1) {
    return (
      <main className="min-h-screen bg-brand-bg flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-brand-text mb-4">Your cart is empty</h2>
          <Link href="/menu">
            <button className="bg-brand-primary text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-[#A65520] transition-colors">
              Return to Menu
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg pt-24 pb-20 px-4 md:px-6 lg:px-24">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* LEFT SIDE: ORDER FORM / OTP / SUCCESS */}
        <div className="w-full lg:w-3/5">
          <Link href="/menu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Menu
          </Link>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: DELIVERY DETAILS */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-brand-secondary">
                <h1 className="font-serif text-3xl text-brand-text mb-2">Checkout Details</h1>
                <p className="text-brand-muted text-sm mb-8">Please provide your details for delivery or room service.</p>

                <form onSubmit={handleSendOTP} className="space-y-5">
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

                  <div className="pt-4 mt-6">
                    <button type="submit" disabled={isProcessing} className="w-full bg-brand-primary text-white py-4 text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors flex items-center justify-center shadow-luxury">
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Verify Identity to Checkout"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-brand-secondary text-center py-16">
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
                  <button type="submit" disabled={isProcessing || userOtp.length !== 6} className="w-full bg-brand-text text-white py-4 text-sm tracking-widest uppercase hover:bg-brand-primary transition-colors flex items-center justify-center">
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Confirm Final Order"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-brand-secondary text-center py-16">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={50} className="text-green-600" />
                </div>
                <h2 className="font-serif text-4xl text-brand-text mb-4">Order Successful!</h2>
                <p className="text-brand-muted max-w-md mx-auto leading-relaxed mb-6">
                  Thank you, {formData.name}. Your entire order has been securely transmitted to our kitchen.
                </p>
                
                <div className="bg-brand-secondary/30 border border-brand-secondary p-5 rounded-lg text-sm text-brand-text max-w-md mx-auto mb-8">
                  <strong>Track Your Order:</strong> Sign in with <span className="text-brand-primary">{formData.email}</span> in the Guest Portal to view live status updates.
                </div>

                <div className="flex justify-center gap-4">
                  <Link href="/auth">
                    <button className="border border-brand-primary bg-brand-primary text-white py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-[#A65520] transition-colors">
                      Guest Portal
                    </button>
                  </Link>
                  <Link href="/menu">
                    <button className="border border-brand-secondary text-brand-text py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-brand-bg transition-colors">
                      Return Home
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT SIDE: ORDER SUMMARY (Hidden on Success Step) */}
        {step !== 3 && (
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-secondary sticky top-32">
              <h2 className="font-serif text-2xl text-brand-text mb-6 pb-4 border-b border-brand-secondary">Order Summary</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 border border-gray-100">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-brand-text line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-brand-muted">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-brand-primary text-sm">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-secondary pt-6 space-y-3">
                <div className="flex justify-between text-sm text-brand-muted">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-brand-muted">
                  <span>Taxes & Fees</span>
                  <span>Calculated locally</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-brand-secondary">
                  <span className="font-bold uppercase tracking-widest text-xs text-brand-text">Total</span>
                  <span className="text-2xl font-bold text-brand-primary">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}