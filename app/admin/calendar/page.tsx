"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronLeft, ChevronRight, Loader2, Save, X, BedDouble, Settings, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ROOM_CATEGORIES = ["King Size", "Double Bed"];

const DEFAULT_PRICING = {
  kingSize: { onePerson: 4000, twoPerson: 5000, extraChild: 1000 },
  doubleBed: { onePerson: 3000, twoPerson: 3500, threePerson: 4500, fourPerson: 5500, extraChild: 800 }
};

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roomType, setRoomType] = useState(ROOM_CATEGORIES[0]);
  
  const [inventoryMap, setInventoryMap] = useState<Record<string, any>>({});
  const [globalPricing, setGlobalPricing] = useState(DEFAULT_PRICING);
  const [isLoading, setIsLoading] = useState(true);

  // Editing States
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ available: 0 });
  
  // Pricing Modal State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingForm, setPricingForm] = useState(DEFAULT_PRICING);
  
  const [isSaving, setIsSaving] = useState(false);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // 1. Live Listener for Global Pricing
  useEffect(() => {
    const unsubPricing = onSnapshot(doc(db, "settings", "global_pricing"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalPricing({
          kingSize: { ...DEFAULT_PRICING.kingSize, ...data.kingSize },
          doubleBed: { ...DEFAULT_PRICING.doubleBed, ...data.doubleBed }
        });
      }
    });
    return () => unsubPricing();
  }, []);

  // 2. Live Listener for Monthly Inventory
  useEffect(() => {
    setIsLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startStr = formatYYYYMMDD(startOfMonth);
    const endStr = formatYYYYMMDD(endOfMonth);

    const q = query(collection(db, "room_inventory"), 
      where("roomType", "==", roomType),
      where("date", ">=", startStr),
      where("date", "<=", endStr)
    );

    const unsubInventory = onSnapshot(q, (snap) => {
      const newMap: Record<string, any> = {};
      snap.docs.forEach(doc => { newMap[doc.data().date] = doc.data(); });
      setInventoryMap(newMap);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching live inventory", error);
      setIsLoading(false);
    });

    return () => unsubInventory();
  }, [currentDate, roomType]);

  const { daysInMonth, firstDayOfMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      firstDayOfMonth: new Date(year, month, 1).getDay(),
    };
  }, [currentDate]);

  const openEditor = (dateStr: string, isPast: boolean) => {
    if (isPast) return; // Prevent opening editor for past dates
    const existing = inventoryMap[dateStr];
    setEditForm({ available: existing ? existing.available : 0 });
    setEditingDate(dateStr);
  };

  const openPricingModal = () => {
    setPricingForm(globalPricing);
    setIsPricingModalOpen(true);
  };

  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDate || !roomType) return;
    setIsSaving(true);

    const docId = `${roomType}_${editingDate}`;
    const payload = {
      date: editingDate,
      roomType: roomType,
      available: Number(editForm.available),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "room_inventory", docId), payload, { merge: true });
      setEditingDate(null);
    } catch (error) {
      alert("Failed to save. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "global_pricing"), {
        kingSize: {
          onePerson: Number(pricingForm.kingSize.onePerson),
          twoPerson: Number(pricingForm.kingSize.twoPerson),
          extraChild: Number(pricingForm.kingSize.extraChild),
        },
        doubleBed: {
          onePerson: Number(pricingForm.doubleBed.onePerson),
          twoPerson: Number(pricingForm.doubleBed.twoPerson),
          threePerson: Number(pricingForm.doubleBed.threePerson),
          fourPerson: Number(pricingForm.doubleBed.fourPerson),
          extraChild: Number(pricingForm.doubleBed.extraChild),
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsPricingModalOpen(false);
    } catch (error) {
      alert("Failed to save pricing.");
    } finally {
      setIsSaving(false);
    }
  };

  // Pre-calculate today at midnight for accurate past-date checking
  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6 pb-20 p-2 md:p-6">
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BedDouble className="text-brand-primary" /> Daily Room Inventory
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage live availability and granular room rates.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={openPricingModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
          >
            <Settings size={18} /> Global Pricing
          </button>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full sm:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 focus:outline-none focus:border-brand-primary">
            {ROOM_CATEGORIES.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ChevronLeft /></button>
          <h3 className="text-lg md:text-xl font-bold font-serif text-gray-800">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {WEEKDAYS.map(day => <div key={day} className="py-2 md:py-3 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">{day}</div>)}
        </div>

        <div className="relative min-h-[400px]">
          {isLoading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>}

          <div className="grid grid-cols-7 auto-rows-fr">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] md:min-h-[120px] border-b border-r border-gray-100 bg-gray-50/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
              const dateStr = formatYYYYMMDD(dateObj);
              
              const isPast = dateObj < todayAtMidnight;
              const isToday = formatYYYYMMDD(todayAtMidnight) === dateStr;
              
              const data = inventoryMap[dateStr];
              const isAvailable = data && data.available > 0;

              return (
                <div 
                  key={dateStr} 
                  onClick={() => openEditor(dateStr, isPast)} 
                  className={`min-h-[80px] md:min-h-[120px] border-b border-r border-gray-100 p-1 md:p-2 transition-colors flex flex-col group 
                    ${isPast ? "bg-gray-100/50 opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}
                    ${isToday ? "bg-orange-50/30" : ""}
                  `}
                >
                  <div className="flex justify-between items-start mb-1 md:mb-2">
                    <span className={`text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isToday ? "bg-brand-primary text-white" : "text-gray-700"}`}>
                      {dayNum}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-col gap-1">
                    {data ? (
                      <div className={`text-[9px] md:text-xs font-bold px-1 py-1 rounded text-center ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} ${isPast ? "grayscale" : ""}`}>
                        {isAvailable ? `${data.available} Left` : "Sold Out"}
                      </div>
                    ) : (
                      <div className="text-[9px] md:text-[10px] text-gray-400 font-bold px-1 py-1 text-center bg-gray-200/50 rounded">0 Left</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor Modal for Availability */}
      <AnimatePresence>
        {editingDate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Set Availability</h3>
                  <p className="text-brand-primary text-sm font-bold">{new Date(editingDate).toLocaleDateString()} • {roomType}</p>
                </div>
                <button onClick={() => setEditingDate(null)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveDay} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Rooms Available</label>
                  <input required type="number" min="0" value={editForm.available} onChange={e => setEditForm({...editForm, available: Number(e.target.value)})} className="w-full px-3 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-bold text-2xl text-center text-gray-800" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-[#A65520] transition-colors flex justify-center items-center gap-2 mt-2">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Availability</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Advanced Global Pricing Modal */}
      <AnimatePresence>
        {isPricingModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4 py-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <IndianRupee className="text-brand-primary" />
                  <h3 className="font-bold text-gray-800 text-lg">Granular Global Rates</h3>
                </div>
                <button type="button" onClick={() => setIsPricingModalOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleSavePricing} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* King Size Config */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-xl border-b pb-2 text-brand-text">King Size Room</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">1 Person (₹)</label>
                        <input required type="number" min="0" value={pricingForm.kingSize.onePerson} onChange={e => setPricingForm(p => ({...p, kingSize: {...p.kingSize, onePerson: Number(e.target.value)}}))} className="w-full p-2 border rounded mt-1 font-bold text-gray-800 focus:outline-none focus:border-brand-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">2 Persons (₹)</label>
                        <input required type="number" min="0" value={pricingForm.kingSize.twoPerson} onChange={e => setPricingForm(p => ({...p, kingSize: {...p.kingSize, twoPerson: Number(e.target.value)}}))} className="w-full p-2 border rounded mt-1 font-bold text-gray-800 focus:outline-none focus:border-brand-primary" />
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <label className="text-xs font-bold text-orange-800 uppercase">Extra Child Rate (₹)</label>
                      <input required type="number" min="0" value={pricingForm.kingSize.extraChild} onChange={e => setPricingForm(p => ({...p, kingSize: {...p.kingSize, extraChild: Number(e.target.value)}}))} className="w-full p-2 border border-orange-200 rounded mt-1 font-bold text-gray-800 focus:outline-none" />
                    </div>
                  </div>

                  {/* Double Bed Config */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-xl border-b pb-2 text-brand-text">Double Bed Room</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">1 Person (₹)</label>
                        <input required type="number" min="0" value={pricingForm.doubleBed.onePerson} onChange={e => setPricingForm(p => ({...p, doubleBed: {...p.doubleBed, onePerson: Number(e.target.value)}}))} className="w-full p-2 border rounded mt-1 font-bold text-gray-800 focus:outline-none focus:border-brand-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">2 Persons (₹)</label>
                        <input required type="number" min="0" value={pricingForm.doubleBed.twoPerson} onChange={e => setPricingForm(p => ({...p, doubleBed: {...p.doubleBed, twoPerson: Number(e.target.value)}}))} className="w-full p-2 border rounded mt-1 font-bold text-gray-800 focus:outline-none focus:border-brand-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">3 Persons (₹)</label>
                        <input required type="number" min="0" value={pricingForm.doubleBed.threePerson} onChange={e => setPricingForm(p => ({...p, doubleBed: {...p.doubleBed, threePerson: Number(e.target.value)}}))} className="w-full p-2 border rounded mt-1 font-bold text-gray-800 focus:outline-none focus:border-brand-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">4 Persons (₹)</label>
                        <input required type="number" min="0" value={pricingForm.doubleBed.fourPerson} onChange={e => setPricingForm(p => ({...p, doubleBed: {...p.doubleBed, fourPerson: Number(e.target.value)}}))} className="w-full p-2 border rounded mt-1 font-bold text-gray-800 focus:outline-none focus:border-brand-primary" />
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <label className="text-xs font-bold text-orange-800 uppercase">Extra Child Rate (₹)</label>
                      <input required type="number" min="0" value={pricingForm.doubleBed.extraChild} onChange={e => setPricingForm(p => ({...p, doubleBed: {...p.doubleBed, extraChild: Number(e.target.value)}}))} className="w-full p-2 border border-orange-200 rounded mt-1 font-bold text-gray-800 focus:outline-none" />
                    </div>
                  </div>

                </div>

                <div className="mt-8 border-t pt-6">
                  <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Pricing </>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}