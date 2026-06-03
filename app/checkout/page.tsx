"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Loader2, LockKeyhole, CheckCircle2, User, Phone, Mail, MapPin, Hash, ArrowLeft, Globe, Map } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { collection, addDoc, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import emailjs from '@emailjs/browser';

// Indian Pincode mapping by first 1 or 2 digits
const INDIAN_PINCODE_PREFIXES: Record<string, string[]> = {
  "jammu and kashmir": ["18", "19"],
  "jammu & kashmir": ["18", "19"],
  "j&k": ["18", "19"],
  "delhi": ["11"],
  "haryana": ["12", "13"],
  "punjab": ["14", "15", "16"],
  "himachal pradesh": ["17"],
  "uttar pradesh": ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
  "uttarakhand": ["24", "26", "27", "28"],
  "rajasthan": ["30", "31", "32", "33", "34"],
  "gujarat": ["36", "37", "38", "39"],
  "maharashtra": ["40", "41", "42", "43", "44"],
  "madhya pradesh": ["45", "46", "47", "48"],
  "andhra pradesh": ["50", "51", "52", "53"],
  "telangana": ["50"],
  "karnataka": ["56", "57", "58", "59"],
  "tamil nadu": ["60", "61", "62", "63", "64"],
  "kerala": ["67", "68", "69"],
  "west bengal": ["70", "71", "72", "73", "74"],
  "bihar": ["80", "81", "82", "83", "84", "85"],
  "assam": ["78"],
};

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [step, setStep] = useState(1); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [userOtp, setUserOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", district: "",
    state: "Jammu and Kashmir", // Default but editable
    country: "India",           // Default but editable
    pincode: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateLocation = () => {
    const pin = formData.pincode.trim();
    const stateInput = formData.state.trim().toLowerCase();
    
    if (!/^\d{6}$/.test(pin)) {
      return "Please enter a valid 6-digit Pincode.";
    }

    if (formData.country.trim().toLowerCase() === "india") {
      const validPrefixes = INDIAN_PINCODE_PREFIXES[stateInput];
      
      // If we have data for the state, verify it matches
      if (validPrefixes) {
        const startsWithValidPrefix = validPrefixes.some(prefix => pin.startsWith(prefix));
        if (!startsWithValidPrefix) {
          return `The pincode ${pin} does not match the state of ${formData.state}. Please correct your state or pincode.`;
        }
      } else {
        // Fallback if state is misspelled, just ensure it's a valid Indian format (starts with 1-9)
        if (!/^[1-9][0-9]{5}$/.test(pin)) return "Invalid Indian Pincode format.";
      }
    }
    return null;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return setError("Your cart is empty.");
    
    const locationError = validateLocation();
    if (locationError) return setError(locationError);
    
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
        { to_email: formData.email, passcode: generatedOtp, time: expiry.toLocaleTimeString() },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setStep(2); 
    } catch (err: any) {
      setError("Failed to send OTP. Please check your network and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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

        await addDoc(collection(db, "food_orders"), {
          customer: {
            name: formData.name, email: formData.email, phone: formData.phone,
            exactAddress: formData.address, district: formData.district,
            state: formData.state, country: formData.country, pincode: formData.pincode,
          },
          items: cart, totalAmount: cartTotal, status: "pending", createdAt: serverTimestamp()
        });

        await deleteDoc(doc(db, "otps", formData.email));
        cart.forEach(item => removeFromCart(item.id));
        setStep(3); 
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
        <div className="w-full lg:w-3/5">
          <Link href="/menu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Menu
          </Link>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-brand-secondary">
                <h1 className="font-serif text-3xl text-brand-text mb-2">Checkout Details</h1>
                <p className="text-brand-muted text-sm mb-8">Please provide your exact location for delivery.</p>

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
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Email Address" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="relative md:col-span-2">
                      <MapPin size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Exact Delivery Address" />
                    </div>
                    <div className="relative">
                      <Map size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="District" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="relative">
                      <Globe size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Country" />
                    </div>
                    <div className="relative">
                      <Map size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="State/UT" />
                    </div>
                    <div className="relative">
                      <Hash size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                      <input required type="text" maxLength={6} name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" placeholder="Pincode" />
                    </div>
                  </div>

                  {error && <div className="bg-red-50 p-3 rounded border border-red-200"><p className="text-red-600 text-sm font-bold">{error}</p></div>}

                  <div className="pt-4 mt-6">
                    <button type="submit" disabled={isProcessing} className="w-full bg-brand-primary text-white py-4 text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors flex items-center justify-center shadow-luxury">
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Verify Identity to Checkout"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
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
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Send Request to Kitchen"}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-brand-secondary text-center py-16">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={50} className="text-green-600" />
                </div>
                <h2 className="font-serif text-4xl text-brand-text mb-4">Request Sent!</h2>
                <p className="text-brand-muted max-w-md mx-auto leading-relaxed mb-6">
                  Thank you, {formData.name}. Your order request has been sent to our kitchen. You will receive an email confirmation once the admin accepts your order.
                </p>
                
                <div className="flex justify-center gap-4">
                  <Link href="/menu">
                    <button className="border border-brand-primary bg-brand-primary text-white py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-[#A65520] transition-colors">
                      Return Home
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

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
                  <span>Payment Method</span>
                  <span>Cash on Delivery</span>
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