"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, CalendarHeart, Loader2, LockKeyhole, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import emailjs from '@emailjs/browser';
import DatePicker from "react-datepicker";
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function BookingFormInner() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [availabilityData, setAvailabilityData] = useState<{ isAvailable: boolean, totalCost: number, nights: number } | null>(null);

  // Dynamic Data States
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", roomType: "", roomQty: 1, adults: 2, children: 0
  });
  
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [userOtp, setUserOtp] = useState("");

  // 1. Fetch Room Categories & Base Prices on Load
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snap = await getDocs(collection(db, "rooms"));
        const roomsData = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        setLiveRooms(roomsData);
        if (roomsData.length > 0) {
          setFormData(prev => ({ ...prev, roomType: roomsData[0].name }));
        }
      } catch (error) {
        console.error("Failed to load rooms.");
      }
    };
    fetchRooms();
  }, []);

  // 2. Fetch Live Inventory whenever Room Type changes
  useEffect(() => {
    if (!formData.roomType) return;
    const fetchLiveInventory = async () => {
      try {
        const todayStr = formatYYYYMMDD(new Date());
        const q = query(collection(db, "room_inventory"), 
          where("roomType", "==", formData.roomType),
          where("date", ">=", todayStr)
        );
        const snap = await getDocs(q);
        const newMap: Record<string, number> = {};
        snap.docs.forEach(doc => { 
          newMap[doc.data().date] = doc.data().available; 
        });
        setInventoryMap(newMap);
      } catch (error) {
        console.error("Failed to load calendar data.");
      }
    };
    fetchLiveInventory();
    
    setCheckIn(null); setCheckOut(null); setAvailabilityData(null);
  }, [formData.roomType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setAvailabilityData(null);
  };

  // Paint the visual calendar (Green = Available, Red = Sold Out)
  const getDayClassName = (date: Date) => {
    const dateStr = formatYYYYMMDD(date);
    const available = inventoryMap[dateStr] || 0;
    
    if (date < new Date(new Date().setHours(0,0,0,0))) return ""; 
    
    return available >= formData.roomQty 
      ? "!bg-green-100 !text-green-800 !font-bold rounded-sm border border-green-300" 
      : "!bg-red-100 !text-red-500 !opacity-50 cursor-not-allowed line-through";
  };

  // Prevent users from selecting red (sold out) dates
  const isDateSelectable = (date: Date) => {
    const dateStr = formatYYYYMMDD(date);
    const available = inventoryMap[dateStr] || 0;
    return available >= formData.roomQty;
  };

  const checkAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return setError("Please select check-in and check-out dates.");
    if (checkIn >= checkOut) return setError("Check-out must be after check-in.");
    
    setIsLoading(true); setError(""); setAvailabilityData(null);

    try {
      let currentDate = new Date(checkIn);
      const end = new Date(checkOut);
      let nights = 0;
      let allAvailable = true;

      while (currentDate < end) {
        const dateStr = formatYYYYMMDD(currentDate);
        const available = inventoryMap[dateStr] || 0;
        
        if (available < formData.roomQty) {
          allAvailable = false; break;
        }
        nights++;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (!allAvailable) {
        setError("One or more selected dates do not have enough rooms available.");
      } else {
        // DYNAMIC PRICING CALCULATION
        const selectedRoom = liveRooms.find(r => r.name === formData.roomType);
        const roomBasePrice = selectedRoom ? Number(selectedRoom.price) : 0;
        const childBasePrice = selectedRoom?.childPrice ? Number(selectedRoom.childPrice) : 1000; // Fallback if admin didn't set child price in DB

        const roomNightlyTotal = roomBasePrice * formData.roomQty;
        const childNightlyTotal = childBasePrice * formData.children;
        const totalCost = (roomNightlyTotal + childNightlyTotal) * nights;

        setAvailabilityData({ isAvailable: true, totalCost, nights });
      }
    } catch (err) {
      setError("Error checking availability.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) return setError("Email service misconfigured.");
    setIsLoading(true); setError("");

    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(new Date().getTime() + 15 * 60000); 

      await setDoc(doc(db, "otps", formData.email), { otp: generatedOtp, expiresAt: expiry.toISOString() });
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { to_email: formData.email, passcode: generatedOtp, time: expiry.toLocaleTimeString() },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStep(2); 
    } catch (err) {
      setError("Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");

    try {
      const otpDoc = await getDoc(doc(db, "otps", formData.email));
      
      if (otpDoc.exists() && otpDoc.data().otp === userOtp) {
        if (new Date() > new Date(otpDoc.data().expiresAt)) {
          setError("OTP expired."); setIsLoading(false); return;
        }

        await setDoc(doc(collection(db, "room_requests")), {
          ...formData,
          checkIn: checkIn?.toISOString(),
          checkOut: checkOut?.toISOString(),
          totalCost: availabilityData?.totalCost,
          nights: availabilityData?.nights,
          status: "Pending",
          createdAt: new Date().toISOString()
        });

        // Deduct Inventory in Firebase
        let currentDate = new Date(checkIn!);
        const end = new Date(checkOut!);
        while (currentDate < end) {
          const dateString = formatYYYYMMDD(currentDate);
          const docId = `${formData.roomType}_${dateString}`;
          const currentAvailable = inventoryMap[dateString] || 0;
          
          await setDoc(doc(db, "room_inventory", docId), {
            available: currentAvailable - formData.roomQty
          }, { merge: true });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        await deleteDoc(doc(db, "otps", formData.email));
        setStep(3);
      } else {
        setError("Invalid OTP.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
          <div className="mb-8">
            <span className="text-brand-primary tracking-widest uppercase text-xs font-bold mb-2 block">Reservation Request</span>
            <h1 className="font-serif text-4xl text-brand-text mb-3">Live Availability</h1>
            <p className="text-brand-muted text-sm leading-relaxed">
              Green dates are available. Red dates are sold out.
            </p>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .react-datepicker__day--disabled { opacity: 0.5; }
          `}} />

          <form onSubmit={checkAvailability} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2 block">Room Category</label>
                {liveRooms.length === 0 ? (
                  <div className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-sm">Loading...</div>
                ) : (
                  <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-brand-primary font-bold text-gray-800">
                    {liveRooms.map(room => (
                      <option key={room.id} value={room.name}>{room.name} (₹{room.price} / night)</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2 block">Number of Rooms</label>
                <input required type="number" name="roomQty" min="1" max="10" value={formData.roomQty} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-brand-primary font-bold text-gray-800" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2 block">Adults</label>
                <input required type="number" name="adults" min="1" value={formData.adults} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" />
              </div>
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2 block">Children (Additional Charge)</label>
                <input required type="number" name="children" min="0" value={formData.children} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-bg border border-brand-secondary focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2 block flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div> Check-In
                </label>
                <div className="relative flex items-center">
                  <CalendarHeart size={18} className="absolute left-4 text-brand-accent z-10" />
                  <DatePicker 
                    selected={checkIn} onChange={(d: Date | null) => { setCheckIn(d); setAvailabilityData(null); }} 
                    selectsStart startDate={checkIn} endDate={checkOut} minDate={new Date()} 
                    dayClassName={getDayClassName} filterDate={isDateSelectable}
                    placeholderText="Select Date" className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:border-brand-primary focus:outline-none cursor-pointer" wrapperClassName="w-full" 
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2 block flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div> Check-Out
                </label>
                <div className="relative flex items-center">
                  <CalendarHeart size={18} className="absolute left-4 text-brand-accent z-10" />
                  <DatePicker 
                    selected={checkOut} onChange={(d: Date | null) => { setCheckOut(d); setAvailabilityData(null); }} 
                    selectsEnd startDate={checkIn} endDate={checkOut} minDate={checkIn || new Date()} 
                    dayClassName={getDayClassName} filterDate={isDateSelectable}
                    placeholderText="Select Date" className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-secondary focus:border-brand-primary focus:outline-none cursor-pointer" wrapperClassName="w-full" 
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold pt-2">{error}</p>}

            {!availabilityData ? (
              <button type="submit" disabled={isLoading} className="w-full mt-6 bg-brand-text text-white py-4 text-sm tracking-widest uppercase hover:bg-brand-primary transition-colors flex items-center justify-center">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Calculate Total"}
              </button>
            ) : (
              <div className="mt-8 border-t border-brand-secondary pt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center mb-6">
                  <div>
                    <p className="text-green-800 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><CheckCircle2 size={16}/> Dates Verified</p>
                    <p className="text-sm text-green-700 mt-1">{availabilityData.nights} Nights • {formData.roomQty} {formData.roomType} • {formData.children} Child(ren)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 uppercase tracking-widest font-bold">Total Cost</p>
                    <p className="text-2xl font-bold text-green-800">₹{availabilityData.totalCost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full pl-12 pr-4 py-3 bg-white border border-brand-secondary focus:outline-none" />
                  </div>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full pl-12 pr-4 py-3 bg-white border border-brand-secondary focus:outline-none" />
                  </div>
                </div>
                <div className="relative mb-4">
                  <Mail size={18} className="absolute left-4 top-3.5 text-brand-accent" />
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (For Verification)" className="w-full pl-12 pr-4 py-3 bg-white border border-brand-secondary focus:outline-none" />
                </div>
                
                <button type="button" onClick={handleSendOTP} disabled={isLoading || !formData.email || !formData.name} className="w-full bg-brand-primary text-white py-4 text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors flex items-center justify-center shadow-luxury">
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Book"}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      )}

      {/* STEP 2: OTP */}
      {step === 2 && (
        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full flex flex-col items-center text-center py-10">
          <div className="w-16 h-16 bg-brand-secondary/50 rounded-full flex items-center justify-center mb-6 text-brand-primary">
            <LockKeyhole size={32} />
          </div>
          <h2 className="font-serif text-3xl text-brand-text mb-2">Verify Your Email</h2>
          <p className="text-brand-muted text-sm mb-8">Enter the 6-digit code sent to <span className="font-bold text-gray-800">{formData.email}</span></p>

          <form onSubmit={handleVerifyOTP} className="w-full max-w-sm space-y-6">
            <input type="text" maxLength={6} value={userOtp} onChange={(e) => setUserOtp(e.target.value)} placeholder="••••••" className="w-full py-4 text-center text-2xl tracking-[1em] font-mono bg-brand-bg border border-brand-secondary focus:outline-none" />
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <button type="submit" disabled={isLoading || userOtp.length !== 6} className="w-full bg-brand-text text-white py-4 text-sm tracking-widest uppercase hover:bg-brand-primary flex items-center justify-center">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Confirm Booking"}
            </button>
          </form>
        </motion.div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center justify-center text-center py-10">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={50} className="text-green-600" />
          </div>
          <h2 className="font-serif text-4xl text-brand-text mb-2">Booking Reserved!</h2>
          <p className="text-brand-muted max-w-md mx-auto leading-relaxed mb-6">
            Thank you, {formData.name}. Your request for {formData.roomQty}x {formData.roomType} has been securely locked in.
          </p>
          <Link href="/auth">
            <button className="border-b-2 border-brand-primary text-brand-primary pb-1 uppercase tracking-widest text-sm font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Track in Guest Portal
            </button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center py-12 px-4 md:px-6 lg:px-24 pt-24">
      <div className="max-w-7xl w-full bg-white shadow-floating border border-brand-secondary flex flex-col-reverse lg:flex-row overflow-hidden">
        <div className="w-full lg:w-3/5 p-6 md:p-10 lg:p-16 relative min-h-[600px] flex items-center">
          <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-brand-muted"><Loader2 className="animate-spin" /></div>}>
            <BookingFormInner />
          </Suspense>
        </div>
        <div className="w-full lg:w-2/5 relative min-h-[300px] lg:min-h-full">
          <Image src="https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=1000&auto=format&fit=crop" alt="Luxury Service" fill className="object-cover" />
        </div>
      </div>
    </main>
  );
}