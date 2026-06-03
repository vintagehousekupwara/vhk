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

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roomType, setRoomType] = useState(ROOM_CATEGORIES[0]);
  
  const [inventoryMap, setInventoryMap] = useState<Record<string, any>>({});
  const [globalPricing, setGlobalPricing] = useState({ kingSize: 5000, doubleBed: 3500, childCharge: 500 });
  const [isLoading, setIsLoading] = useState(true);

  // Editing States
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ available: 0 });
  
  // Pricing Modal State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingForm, setPricingForm] = useState({ kingSize: 0, doubleBed: 0, childCharge: 0 });
  
  const [isSaving, setIsSaving] = useState(false);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // 1. Live Listener for Global Pricing
  useEffect(() => {
    const unsubPricing = onSnapshot(doc(db, "settings", "global_pricing"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setGlobalPricing({
          kingSize: data.kingSize || 5000,
          doubleBed: data.doubleBed || 3500,
          childCharge: data.childCharge || 500
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

  const openEditor = (dateStr: string) => {
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
        kingSize: Number(pricingForm.kingSize),
        doubleBed: Number(pricingForm.doubleBed),
        childCharge: Number(pricingForm.childCharge),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsPricingModalOpen(false);
    } catch (error) {
      alert("Failed to save pricing.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 p-2 md:p-6">
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BedDouble className="text-brand-primary" /> Daily Room Inventory
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage live availability and global pricing.</p>
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
              const data = inventoryMap[dateStr];
              const isAvailable = data && data.available > 0;
              const isToday = formatYYYYMMDD(new Date()) === dateStr;

              return (
                <div key={dateStr} onClick={() => openEditor(dateStr)} className={`min-h-[80px] md:min-h-[120px] border-b border-r border-gray-100 p-1 md:p-2 cursor-pointer transition-colors flex flex-col group ${isToday ? "bg-orange-50/30" : "hover:bg-gray-50"}`}>
                  <div className="flex justify-between items-start mb-1 md:mb-2">
                    <span className={`text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isToday ? "bg-brand-primary text-white" : "text-gray-700"}`}>{dayNum}</span>
                  </div>
                  <div className="mt-auto flex flex-col gap-1">
                    {data ? (
                      <div className={`text-[9px] md:text-xs font-bold px-1 py-1 rounded text-center ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {isAvailable ? `${data.available} Left` : "Sold Out"}
                      </div>
                    ) : (
                      <div className="text-[9px] md:text-[10px] text-gray-400 font-bold px-1 py-1 text-center bg-gray-100 rounded">0 Left</div>
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

      {/* Global Pricing Modal */}
      <AnimatePresence>
        {isPricingModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <IndianRupee className="text-brand-primary" />
                  <h3 className="font-bold text-gray-800 text-lg">Global Pricing</h3>
                </div>
                <button type="button" onClick={() => setIsPricingModalOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleSavePricing} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">King Size Rate (₹)</label>
                  <input required type="number" min="0" value={pricingForm.kingSize} onChange={e => setPricingForm({...pricingForm, kingSize: Number(e.target.value)})} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-bold text-lg text-gray-800" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Double Bed Rate (₹)</label>
                  <input required type="number" min="0" value={pricingForm.doubleBed} onChange={e => setPricingForm({...pricingForm, doubleBed: Number(e.target.value)})} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-bold text-lg text-gray-800" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Extra Child Charge (₹)</label>
                  <input required type="number" min="0" value={pricingForm.childCharge} onChange={e => setPricingForm({...pricingForm, childCharge: Number(e.target.value)})} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-bold text-lg text-gray-800" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 mt-4">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Pricing</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}