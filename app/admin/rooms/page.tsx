"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, writeBatch, increment, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CalendarDays, User, Mail, Phone, CheckCircle, XCircle, Clock, BedDouble, Search, Archive, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDatesInRange = (startStr: string, endStr: string) => {
  const dates = [];
  let current = new Date(startStr);
  const end = new Date(endStr);
  while (current < end) {
    dates.push(formatYYYYMMDD(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export default function AdminRoomRequests() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'cancelled' | 'archived'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 2-Step Revoke Modal State
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [bookingToRevoke, setBookingToRevoke] = useState<any | null>(null);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(fetchedBookings);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const executeStatusUpdate = async (booking: any, newStatus: 'confirmed' | 'cancelled' | 'archived') => {
    setProcessingId(booking.id);
    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, "bookings", booking.id);
      batch.update(bookingRef, { status: newStatus, updatedAt: new Date().toISOString() });

      // Inventory Restoration: Restore if changing from confirmed/pending -> cancelled
      if (newStatus === "cancelled" && (booking.status === "pending" || booking.status === "confirmed")) {
        const datesToRestore = getDatesInRange(booking.checkIn, booking.checkOut);
        datesToRestore.forEach(dateStr => {
          const invRef = doc(db, "room_inventory", `${booking.roomType}_${dateStr}`);
          batch.update(invRef, { available: increment(1) });
        });
      }

      // Inventory Deduction: If Re-Accepting a previously cancelled booking
      if (newStatus === "confirmed" && booking.status === "cancelled") {
        const datesToDeduct = getDatesInRange(booking.checkIn, booking.checkOut);
        datesToDeduct.forEach(dateStr => {
          const invRef = doc(db, "room_inventory", `${booking.roomType}_${dateStr}`);
          batch.update(invRef, { available: increment(-1) });
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status.");
    } finally {
      setProcessingId(null);
      setRevokeModalOpen(false);
      setBookingToRevoke(null);
    }
  };

  const handleStatusChangeClick = (booking: any, newStatus: 'confirmed' | 'cancelled' | 'archived') => {
    // TRIGGER 2-STEP CONFIRMATION if revoking an already confirmed booking
    if (booking.status === 'confirmed' && newStatus === 'cancelled') {
      setBookingToRevoke(booking);
      setRevokeModalOpen(true);
      return;
    }
    
    if (!confirm(`Mark this booking as ${newStatus}?`)) return;
    executeStatusUpdate(booking, newStatus);
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm("CRITICAL WARNING: Are you sure you want to completely delete this record? This cannot be undone and will permanently remove it from the database.")) return;
    setProcessingId(bookingId);
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
    } catch (error) {
      alert("Failed to delete booking.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = b.status === filter;
    const matchesSearch = b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 flex items-center gap-3"><BedDouble className="text-brand-primary w-8 h-8" /> Room Reservations</h1>
            <p className="text-gray-500 text-sm mt-2">Manage live reservations, archives, and cancellations.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full overflow-x-auto hide-scrollbar">
              {['pending', 'confirmed', 'cancelled', 'archived'].map((status) => (
                <button
                  key={status} onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filter === status ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {status}
                  {status === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{bookings.filter(b => b.status === 'pending').length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary text-sm" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary" /></div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200"><h3 className="text-lg font-bold text-gray-700">No {filter} bookings</h3></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredBookings.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
                  
                  <div className={`md:w-64 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center ${booking.status === 'pending' ? 'bg-orange-50/50' : booking.status === 'confirmed' ? 'bg-green-50/50' : booking.status === 'archived' ? 'bg-gray-100' : 'bg-red-50/50'}`}>
                    <span className="font-bold uppercase tracking-widest text-sm mb-4 block">{booking.status}</span>
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mb-1">{booking.roomType}</h3>
                    <p className="text-sm font-bold text-brand-primary mb-4">{booking.nights} Nights</p>
                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-2xl font-bold text-gray-900">₹{booking.totalCost}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Guest</h4>
                        <p className="font-bold text-gray-800 flex items-center gap-2"><User className="w-4 h-4"/> {booking.customerName}</p>
                        <p className="text-sm text-brand-primary flex items-center gap-2"><Mail className="w-4 h-4"/> {booking.email}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4"/> {booking.phone}</p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Schedule</h4>
                        <div className="flex gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1"><p className="text-[10px] uppercase text-gray-500 font-bold">In</p><p className="font-bold text-gray-800 text-sm">{new Date(booking.checkIn).toLocaleDateString()}</p></div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1"><p className="text-[10px] uppercase text-gray-500 font-bold">Out</p><p className="font-bold text-gray-800 text-sm">{new Date(booking.checkOut).toLocaleDateString()}</p></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                      
                      {booking.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusChangeClick(booking, 'confirmed')} disabled={processingId === booking.id} className="px-4 py-2 bg-brand-primary text-white hover:bg-[#A65520] font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2"><CheckCircle size={14}/> Accept</button>
                          <button onClick={() => handleStatusChangeClick(booking, 'cancelled')} disabled={processingId === booking.id} className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs uppercase tracking-wider">Reject</button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          <button onClick={() => handleStatusChangeClick(booking, 'archived')} disabled={processingId === booking.id} className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2"><Archive size={14}/> Archive</button>
                          <button onClick={() => handleStatusChangeClick(booking, 'cancelled')} disabled={processingId === booking.id} className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2"><XCircle size={14}/> Revoke Booking</button>
                        </>
                      )}

                      {/* NEW: Re-Accept capability for Cancelled Bookings */}
                      {booking.status === 'cancelled' && (
                        <>
                          <button onClick={() => handleStatusChangeClick(booking, 'confirmed')} disabled={processingId === booking.id} className="px-4 py-2 bg-brand-primary text-white hover:bg-[#A65520] font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2"><RefreshCw size={14}/> Re-Accept</button>
                          <button onClick={() => handleDelete(booking.id)} disabled={processingId === booking.id} className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 ml-auto"><Trash2 size={14}/> Delete</button>
                        </>
                      )}

                      {booking.status === 'archived' && (
                        <button onClick={() => handleDelete(booking.id)} disabled={processingId === booking.id} className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 ml-auto"><Trash2 size={14}/> Delete</button>
                      )}

                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 2-STEP CONFIRMATION MODAL */}
      <AnimatePresence>
        {revokeModalOpen && bookingToRevoke && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">Revoke Confirmed Booking?</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                You are about to cancel a booking that was already accepted for <strong>{bookingToRevoke.customerName}</strong>. This will release the rooms back into available inventory. Are you absolutely sure?
              </p>
              <div className="flex gap-3">
                <button onClick={() => {setRevokeModalOpen(false); setBookingToRevoke(null);}} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Keep Booking</button>
                <button onClick={() => executeStatusUpdate(bookingToRevoke, 'cancelled')} disabled={processingId === bookingToRevoke.id} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2">
                  {processingId === bookingToRevoke.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Revoke"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}