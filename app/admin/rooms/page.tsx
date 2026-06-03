"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, writeBatch, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CalendarDays, User, Mail, Phone, CheckCircle, XCircle, Clock, BedDouble, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to calculate dates for inventory restoration
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
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Live Real-Time Listener for Bookings
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(fetchedBookings);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle Approving or Rejecting Bookings
  const handleUpdateStatus = async (booking: any, newStatus: 'confirmed' | 'cancelled') => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    
    setProcessingId(booking.id);
    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, "bookings", booking.id);
      
      // Update the booking document
      batch.update(bookingRef, { 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      });

      // INVENTORY RESTORATION LOGIC
      // If the admin rejects/cancels the booking, we must release the held rooms back to the public pool
      if (newStatus === "cancelled" && booking.status === "pending") {
        const datesToRestore = getDatesInRange(booking.checkIn, booking.checkOut);
        datesToRestore.forEach(dateStr => {
          const invRef = doc(db, "room_inventory", `${booking.roomType}_${dateStr}`);
          batch.update(invRef, { available: increment(1) });
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter and Search Logic
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = b.status === filter;
    const matchesSearch = b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
              <BedDouble className="text-brand-primary w-8 h-8" />
              Room Reservations
            </h1>
            <p className="text-gray-500 text-sm mt-2">Manage incoming booking requests and live reservations.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Status Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              {['pending', 'confirmed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${
                    filter === status 
                      ? 'bg-white text-brand-primary shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status}
                  {status === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                      {bookings.filter(b => b.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
            <p className="text-gray-500 font-medium">Syncing live bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BedDouble className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No {filter} bookings found</h3>
            <p className="text-gray-500 text-sm mt-1">New requests will appear here instantly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Left Sidebar: Status & Core Info */}
                  <div className={`md:w-64 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center ${
                    booking.status === 'pending' ? 'bg-orange-50/50' : 
                    booking.status === 'confirmed' ? 'bg-green-50/50' : 'bg-red-50/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      {booking.status === 'pending' && <Clock className="text-orange-500 w-5 h-5" />}
                      {booking.status === 'confirmed' && <CheckCircle className="text-green-500 w-5 h-5" />}
                      {booking.status === 'cancelled' && <XCircle className="text-red-500 w-5 h-5" />}
                      <span className={`font-bold uppercase tracking-widest text-sm ${
                        booking.status === 'pending' ? 'text-orange-700' : 
                        booking.status === 'confirmed' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mb-1">{booking.roomType}</h3>
                    <p className="text-sm font-bold text-brand-primary mb-4">
                      {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                    </p>
                    
                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{booking.totalCost}</p>
                      <p className="text-xs font-medium text-gray-500 mt-2">
                        {booking.adults} Adults {booking.children > 0 && `• ${booking.children} Children`}
                      </p>
                    </div>
                  </div>

                  {/* Main Content: Guest & Dates */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      
                      {/* Guest Details */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Guest Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-800">{booking.customerName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${booking.email}`} className="text-sm text-brand-primary hover:underline">{booking.email}</a>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${booking.phone}`} className="text-sm text-gray-600 hover:underline">{booking.phone}</a>
                          </div>
                        </div>
                      </div>

                      {/* Stay Dates */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Stay Schedule</h4>
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1">
                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Check-In</p>
                            <p className="font-bold text-gray-800">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <CalendarDays className="w-5 h-5 text-gray-300 shrink-0" />
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1">
                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Check-Out</p>
                            <p className="font-bold text-gray-800">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests & ID */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto pt-4 border-t border-gray-100">
                      <div className="flex-1">
                        {booking.specialRequests ? (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <span className="text-xs font-bold text-orange-800 uppercase tracking-wider block mb-1">Special Request:</span>
                            <p className="text-sm text-orange-900 italic">&quot;{booking.specialRequests}&quot;</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No special requests.</p>
                        )}
                      </div>
                      
                      {/* Action Buttons for Pending */}
                      {booking.status === 'pending' && (
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                          <button
                            onClick={() => handleUpdateStatus(booking, 'cancelled')}
                            disabled={processingId === booking.id}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors disabled:opacity-50 text-sm uppercase tracking-wider"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking, 'confirmed')}
                            disabled={processingId === booking.id}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-primary text-white hover:bg-[#A65520] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase tracking-wider"
                          >
                            {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Confirm Payment
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 text-[10px] text-gray-400 text-right">
                      Request ID: {booking.id} • Received: {new Date(booking.createdAt).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}