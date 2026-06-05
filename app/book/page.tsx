"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { collection, doc, onSnapshot, query, where, writeBatch, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CalendarDays, Users, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, Clock, Ban, CheckCircle, Loader2, Mail, Utensils } from "lucide-react";
import DatePicker from "react-datepicker";
// @ts-ignore
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import emailjs from '@emailjs/browser';

const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDatesInRange = (start: Date, end: Date) => {
  const dates = [];
  let current = new Date(start);
  while (current < end) {
    dates.push(formatYYYYMMDD(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

function BookingForm() {
  const searchParams = useSearchParams();
  const initialRoomType = searchParams.get("type") || "King Size";
  
  const formTopRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [roomType, setRoomType] = useState(initialRoomType);
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [mealPlan, setMealPlan] = useState<"ep" | "cp" | "map" | "ap">("ep");

  const [guestDetails, setGuestDetails] = useState({ name: "", email: "", phone: "", requests: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  const [globalPricing, setGlobalPricing] = useState({
    kingSize: { onePerson: 4000, twoPerson: 5000, extraChild: 1000 },
    doubleBed: { onePerson: 3000, twoPerson: 3500, threePerson: 4500, fourPerson: 5500, extraChild: 800 },
    mealPlans: { ep: 0, cp: 500, map: 1000, ap: 1500 }
  });

  const [availabilityStatus, setAvailabilityStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');
  const [availableRooms, setAvailableRooms] = useState<number>(0);

  useEffect(() => {
    if (formTopRef.current) {
      const yOffset = -100;
      const y = formTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    if (checkInDate >= checkOutDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay);
    }
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const unsubPricing = onSnapshot(doc(db, "settings", "global_pricing"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setGlobalPricing((prev) => ({
          kingSize: { ...prev.kingSize, ...(data.kingSize || {}) },
          doubleBed: { ...prev.doubleBed, ...(data.doubleBed || {}) },
          mealPlans: { ...prev.mealPlans, ...(data.mealPlans || {}) }
        }));
      }
    });
    return () => unsubPricing();
  }, []);

  const numberOfNights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000));
  
  const roomPricing = roomType === "King Size" ? globalPricing.kingSize : globalPricing.doubleBed;
  let baseRate = roomPricing.onePerson;
  if (adults === 2) baseRate = roomPricing.twoPerson;
  if (adults === 3) baseRate = (roomPricing as any).threePerson || roomPricing.twoPerson;
  if (adults === 4) baseRate = (roomPricing as any).fourPerson || roomPricing.twoPerson;

  const extraChildrenCost = children * (roomPricing.extraChild || 800);
  const totalGuests = adults + children;
  const mealPlanCostPerNight = (globalPricing.mealPlans[mealPlan] || 0) * totalGuests;

  const costPerNight = baseRate + extraChildrenCost + mealPlanCostPerNight;
  const totalCost = costPerNight * numberOfNights;

  useEffect(() => {
    setAvailabilityStatus('loading');
    const startStr = formatYYYYMMDD(checkInDate);
    const endStr = formatYYYYMMDD(checkOutDate);

    const q = query(collection(db, "room_inventory"), 
      where("roomType", "==", roomType),
      where("date", ">=", startStr),
      where("date", "<", endStr)
    );

    const unsubInventory = onSnapshot(q, (snap) => {
      if (snap.empty || snap.docs.length < numberOfNights) {
        setAvailabilityStatus('unavailable');
        setAvailableRooms(0);
        return;
      }
      let minAvailable = Infinity;
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.available < minAvailable) minAvailable = data.available;
      });
      if (minAvailable > 0) {
        setAvailabilityStatus('available');
        setAvailableRooms(minAvailable);
      } else {
        setAvailabilityStatus('unavailable');
        setAvailableRooms(0);
      }
    });
    return () => unsubInventory();
  }, [checkInDate, checkOutDate, roomType, numberOfNights]);

  const handleSendOTP = async () => {
    if (!guestDetails.email || !guestDetails.name) {
      alert("Please enter your name and email first.");
      return;
    }
    if (resendCount >= 10) return;
    
    setIsSendingOtp(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string, 
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string, 
        { to_name: guestDetails.name, to_email: guestDetails.email, otp_code: newOtp, message: newOtp, passcode: newOtp }, 
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string
      );
      setOtpSent(true);
      setResendCount(prev => prev + 1);
      setTimer(45);
    } catch (error) {
      console.error("EmailJS Error", error);
      alert("Failed to send verification email.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = () => {
    if (enteredOtp === generatedOtp) setIsEmailVerified(true);
    else alert("Incorrect verification code.");
  };

  const confirmBookingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified || availabilityStatus !== 'available' || availableRooms <= 0) return;
    setIsSubmitting(true);

    try {
      const batch = writeBatch(db);
      const newBookingRef = doc(collection(db, "bookings"));
      batch.set(newBookingRef, {
        customerName: guestDetails.name,
        email: guestDetails.email,
        phone: guestDetails.phone,
        specialRequests: guestDetails.requests,
        roomType,
        mealPlan: mealPlan.toUpperCase(), 
        checkIn: formatYYYYMMDD(checkInDate),
        checkOut: formatYYYYMMDD(checkOutDate),
        nights: numberOfNights,
        adults,
        children,
        totalCost,
        status: "pending", 
        createdAt: new Date().toISOString()
      });

      const datesToBook = getDatesInRange(checkInDate, checkOutDate);
      datesToBook.forEach(dateStr => {
        const invRef = doc(db, "room_inventory", `${roomType}_${dateStr}`);
        batch.update(invRef, { available: increment(-1) });
      });

      await batch.commit();
      setStep(3);
    } catch (error) {
      console.error("Booking Error", error);
      alert("Something went wrong with your booking request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 md:pb-24" ref={formTopRef}>
      <div className="bg-white rounded-[20px] md:rounded-2xl border border-gray-100 shadow-xl overflow-hidden mb-8 md:mb-12">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 sm:p-8 md:p-10">
              <div className="mb-6 md:mb-8 border-b border-gray-100 pb-4 md:pb-6">
                <h1 className="font-serif text-2xl md:text-4xl text-brand-text mb-1.5 md:mb-2">Reserve Your Stay</h1>
                <p className="text-gray-500 text-xs md:text-sm">Select your dates and meal plans. Pricing updates automatically.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] gap-6 md:gap-8 lg:gap-12">
                <div className="space-y-5 md:space-y-6">
                  
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5">Room Category</label>
                    <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 font-bold text-sm md:text-base hover:border-brand-primary/50 transition-colors">
                      <option value="King Size">King Size Suite</option>
                      <option value="Double Bed">Double Bed Room</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5 flex items-center gap-1.5"><Utensils size={14}/> Meal Plan Package</label>
                    <select value={mealPlan} onChange={(e) => setMealPlan(e.target.value as any)} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 font-bold text-sm hover:border-brand-primary/50 transition-colors">
                      <option value="ep">European Plan (EP) - Room Only</option>
                      <option value="cp">Continental Plan (CP) - +Breakfast</option>
                      <option value="map">Modified American (MAP) - +Breakfast & 1 Meal</option>
                      <option value="ap">American Plan (AP) - +All 3 Meals</option>
                    </select>
                    <p className="text-[9px] md:text-[10px] text-gray-500 mt-1.5 ml-1">Meal plan pricing is applied per guest, per night.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-4">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5 flex items-center gap-1.5">Check-In</label>
                      <div className="border border-gray-200 rounded-lg md:rounded-xl overflow-hidden bg-gray-50 hover:border-brand-primary/50 transition-colors">
                        <DatePicker selected={checkInDate} onChange={(date: Date | null) => date && setCheckInDate(date)} minDate={new Date()} className="w-full px-3 md:px-4 py-3 md:py-4 bg-transparent outline-none text-gray-800 font-bold text-sm md:text-base cursor-pointer" dateFormat="MMM d, yyyy" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5 flex items-center gap-1.5">Check-Out</label>
                      <div className="border border-gray-200 rounded-lg md:rounded-xl overflow-hidden bg-gray-50 hover:border-brand-primary/50 transition-colors">
                        <DatePicker selected={checkOutDate} onChange={(date: Date | null) => date && setCheckOutDate(date)} minDate={new Date(checkInDate.getTime() + 86400000)} className="w-full px-3 md:px-4 py-3 md:py-4 bg-transparent outline-none text-gray-800 font-bold text-sm md:text-base cursor-pointer" dateFormat="MMM d, yyyy" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5">Adults</label>
                      <input type="number" min="1" max={roomType === "King Size" ? "2" : "4"} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 text-sm md:text-base font-bold hover:border-brand-primary/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5">Children</label>
                      <input type="number" min="0" max="4" value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 text-sm md:text-base font-bold hover:border-brand-primary/50 transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 sm:p-6 md:p-8 rounded-xl md:rounded-2xl border border-gray-200 flex flex-col h-full mt-2 md:mt-0">
                  <h3 className="font-serif text-lg md:text-xl text-gray-800 mb-4 md:mb-6 border-b border-gray-200 pb-3 md:pb-4">Booking Summary</h3>
                  <div className="space-y-2.5 md:space-y-3 flex-grow text-xs md:text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Room ({adults} Adults)</span>
                      <span className="font-bold text-gray-800">₹{baseRate * numberOfNights}</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Children Extra ({children})</span>
                        <span className="font-bold text-gray-800">+₹{extraChildrenCost * numberOfNights}</span>
                      </div>
                    )}
                    {mealPlanCostPerNight > 0 && (
                      <div className="flex justify-between text-brand-primary font-medium">
                        <span>{mealPlan.toUpperCase()} Meals ({totalGuests} Guests)</span>
                        <span className="font-bold">+₹{mealPlanCostPerNight * numberOfNights}</span>
                      </div>
                    )}
                    <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-gray-200 flex justify-between items-end">
                      <span className="font-bold text-gray-800 uppercase tracking-wider md:tracking-widest text-[10px] md:text-xs">Total Amount</span>
                      <span className="font-serif text-2xl md:text-3xl font-bold text-brand-primary">₹{totalCost}</span>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8 mb-5 md:mb-6">
                    {availabilityStatus === 'loading' ? <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm"><Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Checking dates...</div> : availabilityStatus === 'available' ? <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-green-200"><CheckCircle2 size={18} className="shrink-0 md:w-5 md:h-5" /><span className="font-bold text-xs md:text-sm">Available! {availableRooms} rooms left.</span></div> : <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-red-200"><AlertCircle size={18} className="shrink-0 md:w-5 md:h-5" /><span className="font-bold text-xs md:text-sm">Sold out during this period.</span></div>}
                  </div>

                  <motion.button 
                    whileHover={{ scale: availabilityStatus === 'available' ? 1.02 : 1 }}
                    whileTap={{ scale: availabilityStatus === 'available' ? 0.98 : 1 }}
                    onClick={() => setStep(2)} 
                    disabled={availabilityStatus !== 'available'} 
                    className="w-full bg-slate-900 text-white py-3.5 md:py-4 rounded-lg md:rounded-xl font-bold tracking-wider md:tracking-widest uppercase text-xs md:text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Details <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-5 sm:p-8 md:p-10">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-500 hover:text-brand-primary uppercase tracking-wider md:tracking-widest mb-6 md:mb-8 transition-colors">
                <ChevronLeft size={16} /> Back
              </button>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] gap-6 md:gap-8 lg:gap-12">
                <div className="space-y-4 md:space-y-5">
                  <h2 className="font-serif text-2xl md:text-3xl text-gray-800 mb-2 md:mb-6">Guest Information</h2>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5">Full Name</label>
                    <input required disabled={isEmailVerified} type="text" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-brand-primary text-gray-800 text-sm md:text-base font-medium hover:border-brand-primary/50 transition-colors" placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5">Email</label>
                      <input required disabled={isEmailVerified} type="email" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-brand-primary text-gray-800 text-sm md:text-base font-medium hover:border-brand-primary/50 transition-colors" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5">Phone Number</label>
                      <input required disabled={isEmailVerified} type="tel" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-brand-primary text-gray-800 text-sm md:text-base font-medium hover:border-brand-primary/50 transition-colors" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider md:tracking-widest mb-1.5">Special Requests (Optional)</label>
                    <textarea disabled={isEmailVerified} value={guestDetails.requests} onChange={e => setGuestDetails({...guestDetails, requests: e.target.value})} className="w-full px-3 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-brand-primary text-gray-800 text-sm md:text-base font-medium h-20 md:h-24 resize-none hover:border-brand-primary/50 transition-colors" placeholder="Late arrival, extra pillows, etc." />
                  </div>

                  <div className="p-5 md:p-6 border border-brand-primary/30 bg-brand-primary/5 rounded-lg md:rounded-xl mt-4 md:mt-6">
                    <h3 className="font-bold text-gray-800 text-[11px] md:text-sm uppercase tracking-wider md:tracking-widest mb-3 md:mb-4 flex items-center gap-2"><Mail size={16} className="text-brand-primary md:w-[18px] md:h-[18px]"/> Verify Email</h3>
                    {!isEmailVerified ? (
                      <div className="space-y-4">
                        {!otpSent ? (
                          <motion.button type="button" onClick={handleSendOTP} disabled={isSendingOtp} className="w-full md:w-auto bg-brand-text text-white px-5 md:px-6 py-3 rounded-lg font-bold text-[10px] md:text-sm tracking-widest uppercase hover:bg-brand-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                            {isSendingOtp ? <><Loader2 className="animate-spin w-3.5 h-3.5 md:w-4 md:h-4" /> Sending...</> : "Send Verification Code"}
                          </motion.button>
                        ) : (
                          <div className="flex flex-col gap-3 md:gap-4">
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                              <input type="text" placeholder="Enter 6-digit code" value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} className="px-3 md:px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary text-gray-800 font-medium text-center tracking-widest text-sm md:text-base flex-grow" maxLength={6} />
                              <button type="button" onClick={handleVerifyOTP} className="bg-brand-primary text-white px-5 md:px-6 py-3 rounded-lg font-bold text-[10px] md:text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors whitespace-nowrap shadow-sm">Verify Code</button>
                            </div>
                            <div className="flex justify-center mt-1 md:mt-2">
                              {resendCount >= 10 ? (
                                <span className="text-red-500 text-[10px] md:text-xs font-bold bg-red-50 px-3 py-1 rounded">Max attempts reached.</span>
                              ) : (
                                <button type="button" onClick={handleSendOTP} disabled={timer > 0 || isSendingOtp} className="text-[10px] md:text-xs font-bold text-gray-500 hover:text-brand-primary uppercase tracking-wider md:tracking-widest transition-colors disabled:opacity-40">
                                  {timer > 0 ? `Resend Code in ${timer}s` : isSendingOtp ? "Sending..." : "Didn't receive it? Resend Code"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-700 font-bold bg-green-100 p-3 rounded-lg text-xs md:text-sm"><CheckCircle2 size={18} className="md:w-5 md:h-5" /> Email Verified!</div>
                    )}
                  </div>
                </div>

                <div className="bg-brand-bg/50 p-5 sm:p-6 rounded-xl md:rounded-2xl border border-brand-secondary/50 h-fit mt-2 md:mt-0">
                  <h3 className="font-bold text-gray-800 text-[11px] md:text-sm uppercase tracking-wider md:tracking-widest mb-4 border-b border-brand-secondary pb-3 md:pb-4">Your Reservation</h3>
                  <div className="space-y-2.5 md:space-y-3 mb-5 md:mb-6">
                    <div><span className="text-[10px] md:text-xs text-gray-500 block uppercase">Room</span><span className="font-serif font-bold text-brand-text text-sm md:text-base">{roomType}</span></div>
                    <div><span className="text-[10px] md:text-xs text-gray-500 block uppercase">Meal Plan</span><span className="font-bold text-xs md:text-sm text-brand-primary uppercase">{mealPlan}</span></div>
                    <div><span className="text-[10px] md:text-xs text-gray-500 block uppercase">Check-In</span><span className="font-bold text-xs md:text-sm text-gray-800">{checkInDate.toLocaleDateString()}</span></div>
                    <div><span className="text-[10px] md:text-xs text-gray-500 block uppercase">Check-Out</span><span className="font-bold text-xs md:text-sm text-gray-800">{checkOutDate.toLocaleDateString()}</span></div>
                  </div>
                  <div className="pt-3 md:pt-4 border-t border-brand-secondary flex justify-between items-end mb-5 md:mb-6">
                    <span className="font-bold text-gray-800 uppercase tracking-wider md:tracking-widest text-[10px] md:text-xs">Pay at Hotel</span>
                    <span className="font-serif text-xl md:text-2xl font-bold text-brand-primary">₹{totalCost}</span>
                  </div>
                  <button onClick={confirmBookingRequest} disabled={!isEmailVerified || isSubmitting} className="w-full bg-brand-primary text-white py-3.5 md:py-4 rounded-lg md:rounded-xl font-bold tracking-wider md:tracking-widest uppercase text-xs md:text-sm hover:bg-[#A65520] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md">
                    {isSubmitting ? <><Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> Processing...</> : <><CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" /> Send Request</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 sm:p-12 md:p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mb-5 md:mb-6 shadow-inner"><CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-600" /></div>
              <h1 className="font-serif text-3xl md:text-4xl text-brand-text mb-3 md:mb-4">Request Sent!</h1>
              <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto mb-6 md:mb-8 leading-relaxed px-2">
                Thank you, {guestDetails.name}! Your request for the {roomType} (Plan: {mealPlan.toUpperCase()}) from {checkInDate.toLocaleDateString()} to {checkOutDate.toLocaleDateString()} has been sent.
                <br/><br/>
                We will contact you at <strong className="break-all">{guestDetails.email}</strong> regarding payment to finalize confirmation.
              </p>
              <Link href="/">
                <button className="bg-slate-900 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-lg md:rounded-xl font-bold tracking-widest uppercase text-xs md:text-sm hover:bg-slate-800 transition-colors shadow-md">Return to Home</button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white p-5 sm:p-6 md:p-10 rounded-[20px] md:rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5 md:gap-3 mb-6 md:mb-8">
          <ShieldCheck className="text-brand-primary w-5 h-5 md:w-8 md:h-8" />
          <h2 className="font-serif text-xl md:text-3xl text-gray-800">Hotel Rules & Policies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="space-y-5 md:space-y-6">
            <div className="flex items-start gap-3 md:gap-4">
              <Clock className="text-brand-secondary shrink-0 mt-0.5 md:mt-1 md:w-6 md:h-6" size={20} />
              <div>
                <h4 className="font-bold text-gray-800 text-[11px] md:text-sm uppercase tracking-wider md:tracking-widest">Check-in / Check-out</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 leading-relaxed">Check-in time is strictly from <strong>2:00 PM</strong> onwards. Check-out must be completed by <strong>12:00 PM</strong>.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <Users className="text-brand-secondary shrink-0 mt-0.5 md:mt-1 md:w-6 md:h-6" size={20} />
              <div>
                <h4 className="font-bold text-gray-800 text-[11px] md:text-sm uppercase tracking-wider md:tracking-widest">Identification</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 leading-relaxed">A valid Government-issued ID (Aadhaar, Passport, or Driving License) is mandatory for all guests at the time of check-in.</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 md:space-y-6">
            <div className="flex items-start gap-3 md:gap-4">
              <Ban className="text-red-400 shrink-0 mt-0.5 md:mt-1 md:w-6 md:h-6" size={20} />
              <div>
                <h4 className="font-bold text-gray-800 text-[11px] md:text-sm uppercase tracking-wider md:tracking-widest">Objects</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 leading-relaxed">Sharp objects and Weapons are not allowed.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <Ban className="text-red-400 shrink-0 mt-0.5 md:mt-1 md:w-6 md:h-6" size={20} />
              <div>
                <h4 className="font-bold text-gray-800 text-[11px] md:text-sm uppercase tracking-wider md:tracking-widest">Food</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 leading-relaxed">Outside food is prohibited.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-brand-bg pt-24 md:pt-32 px-3 sm:px-4 md:px-8">
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}