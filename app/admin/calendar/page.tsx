"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronLeft, ChevronRight, Loader2, Save, X, BedDouble, Info } from "lucide-react";
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
  
  // Hardcoded Room Types
  const [roomType, setRoomType] = useState(ROOM_CATEGORIES[0]);
  
  const [inventoryMap, setInventoryMap] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Editing State
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ available: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Fetch Monthly Inventory for Selected Room
  useEffect(() => {
    let isMounted = true;

    const fetchMonthData = async () => {
      setIsLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startStr = formatYYYYMMDD(startOfMonth);
      const endStr = formatYYYYMMDD(endOfMonth);

      try {
        const q = query(collection(db, "room_inventory"), 
          where("roomType", "==", roomType),
          where("date", ">=", startStr),
          where("date", "<=", endStr)
        );
        const snap = await getDocs(q);
        
        if (!isMounted) return;

        const newMap: Record<string, any> = {};
        snap.docs.forEach(doc => { newMap[doc.data().date] = doc.data(); });
        setInventoryMap(newMap);
      } catch (error) {
        console.error("Error fetching inventory", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMonthData();

    return () => { isMounted = false; };
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
      setInventoryMap(prev => ({ ...prev, [editingDate]: payload }));
      setEditingDate(null);
    } catch (error) {
      alert("Failed to save. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BedDouble className="text-brand-primary" /> Daily Room Inventory
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage available capacity for your rooms.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full md:w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 focus:outline-none focus:border-brand-primary">
            {ROOM_CATEGORIES.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50/50">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ChevronLeft /></button>
          <h3 className="text-xl font-bold font-serif text-gray-800">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {WEEKDAYS.map(day => <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-widest text-gray-500">{day}</div>)}
        </div>

        <div className="relative min-h-[400px]">
          {isLoading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>}

          <div className="grid grid-cols-7 auto-rows-fr">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-gray-100 bg-gray-50/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
              const dateStr = formatYYYYMMDD(dateObj);
              const data = inventoryMap[dateStr];
              const isAvailable = data && data.available > 0;
              const isToday = formatYYYYMMDD(new Date()) === dateStr;

              return (
                <div key={dateStr} onClick={() => openEditor(dateStr)} className={`min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer transition-colors flex flex-col group ${isToday ? "bg-orange-50/30" : "hover:bg-gray-50"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-brand-primary text-white" : "text-gray-700"}`}>{dayNum}</span>
                  </div>
                  <div className="mt-auto">
                    {data ? (
                      <div className={`text-xs font-bold px-1.5 py-1 rounded text-center ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {isAvailable ? `${data.available} Left` : "Sold Out"}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 font-bold px-1 py-1 text-center bg-gray-100 rounded">0 Left</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingDate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
              <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Set Availability</h3>
                  <p className="text-brand-primary text-sm font-bold">{new Date(editingDate).toLocaleDateString()} • {roomType}</p>
                </div>
                <button onClick={() => setEditingDate(null)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveDay} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Rooms Available</label>
                  <input required type="number" min="0" value={editForm.available} onChange={e => setEditForm({...editForm, available: Number(e.target.value)})} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-bold text-2xl text-center text-gray-800" />
                </div>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg flex gap-3 text-xs border border-blue-100">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>Rates are managed globally. You are only updating how many rooms guests can book for this day.</p>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-[#A65520] transition-colors flex justify-center items-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}