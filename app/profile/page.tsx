"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BedDouble, LogOut, Loader2, CalendarDays, Clock, 
  CheckCircle, XCircle, User as UserIcon, Mail, 
  Utensils, ChefHat, Truck 
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  // Separate loading states for smooth UI rendering
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingFoodOrders, setLoadingFoodOrders] = useState(true);
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [foodOrders, setFoodOrders] = useState<any[]>([]);

  // 1. Listen for Authentication State
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth"); // Redirect to login if not authenticated
      } else {
        // If admin accidentally goes to profile, redirect to admin panel
        if (currentUser.email === "admin@thevintagehouse.com") {
          router.push("/admin/rooms");
          return;
        }
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Fetch User's Data in Real-Time
  useEffect(() => {
    if (!user || !user.email) return;

    // --- FETCH ROOM BOOKINGS ---
    const qBookings = query(collection(db, "bookings"), where("email", "==", user.email));
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by creation date (newest first)
      fetchedBookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(fetchedBookings);
      setLoadingBookings(false);
    });

    // --- FETCH FOOD ORDERS ---
    const qFood = query(collection(db, "food_orders"), where("customer.email", "==", user.email));
    const unsubFood = onSnapshot(qFood, (snapshot) => {
      const fetchedFood = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by serverTimestamp (seconds) - newest first
      fetchedFood.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setFoodOrders(fetchedFood);
      setLoadingFoodOrders(false);
    });

    return () => {
      unsubBookings();
      unsubFood();
    };
  }, [user]);

  const handleSignOut = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* User Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-5 w-full md:w-auto text-center md:text-left">
            <div className="w-16 h-16 bg-brand-secondary/30 rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0">
              <UserIcon className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-brand-text mb-1">
                Welcome back, {user.displayName || user.email?.split('@')[0]}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm">
                <Mail className="w-4 h-4" /> {user.email}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold tracking-widest uppercase text-sm transition-colors w-full md:w-auto justify-center"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        {/* =========================================
            SECTION 1: ROOM BOOKINGS 
        ============================================= */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BedDouble className="text-brand-primary w-6 h-6" />
            <h2 className="font-serif text-2xl text-gray-800">Your Room Reservations</h2>
          </div>

          {loadingBookings ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
              <p className="text-gray-500 font-medium">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <CalendarDays className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="font-serif text-2xl text-gray-800 mb-2">No Reservations Yet</h3>
              <p className="text-gray-500 mb-8 max-w-md">You haven&apos;t made any booking requests yet. Discover our luxury rooms and book your stay today.</p>
              <Link href="/#accommodations">
                <button className="bg-brand-text text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-brand-primary transition-colors">
                  Explore Rooms
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Status & Price Sidebar */}
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
                      
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">₹{booking.totalCost}</p>
                      <p className="text-xs font-medium text-gray-500">Payable at Hotel</p>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-brand-text mb-2">{booking.roomType}</h3>
                            <p className="text-sm font-bold text-brand-primary">
                              {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'} • {booking.adults} Adults {booking.children > 0 && `• ${booking.children} Children`}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">ID: {booking.id.slice(-6).toUpperCase()}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 pt-6">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full">
                            <p className="text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Check-In</p>
                            <p className="font-bold text-gray-800 text-lg">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-xs text-gray-500 mt-1">From 2:00 PM</p>
                          </div>
                          
                          <div className="hidden sm:block text-gray-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full">
                            <p className="text-xs uppercase text-gray-500 font-bold mb-1 flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Check-Out</p>
                            <p className="font-bold text-gray-800 text-lg">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-xs text-gray-500 mt-1">By 11:00 AM</p>
                          </div>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-800 flex items-start gap-3">
                          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                          <p>Your booking request is currently being reviewed by our team. We will confirm your reservation shortly.</p>
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800 flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p>Your reservation is confirmed! We look forward to hosting you. Please remember to bring a valid government ID for check-in.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* =========================================
            SECTION 2: FOOD ORDERS 
        ============================================= */}
        <section className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Utensils className="text-brand-primary w-6 h-6" />
            <h2 className="font-serif text-2xl text-gray-800">Your Food Orders</h2>
          </div>

          {loadingFoodOrders ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
              <p className="text-gray-500 font-medium">Loading your food orders...</p>
            </div>
          ) : foodOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Utensils className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="font-serif text-2xl text-gray-800 mb-2">Hungry?</h3>
              <p className="text-gray-500 mb-8 max-w-md">You haven&apos;t ordered any food yet. Check out our signature culinary masterpieces.</p>
              <Link href="/menu">
                <button className="bg-brand-text text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-brand-primary transition-colors">
                  View Menu
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {foodOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Status & Price Sidebar */}
                    <div className={`md:w-64 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center ${
                      order.status === 'pending' ? 'bg-orange-50/50' : 
                      order.status === 'accepted' ? 'bg-blue-50/50' : 
                      order.status === 'delivered' ? 'bg-green-50/50' : 'bg-red-50/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-4">
                        {order.status === 'pending' && <Clock className="text-orange-500 w-5 h-5" />}
                        {order.status === 'accepted' && <ChefHat className="text-blue-500 w-5 h-5" />}
                        {order.status === 'delivered' && <CheckCircle className="text-green-500 w-5 h-5" />}
                        {order.status === 'rejected' && <XCircle className="text-red-500 w-5 h-5" />}
                        
                        <span className={`font-bold uppercase tracking-widest text-sm ${
                          order.status === 'pending' ? 'text-orange-700' : 
                          order.status === 'accepted' ? 'text-blue-700' : 
                          order.status === 'delivered' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {order.status === 'accepted' ? 'Cooking' : order.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Total</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">₹{order.totalAmount}</p>
                      <p className="text-xs font-medium text-gray-500">Cash on Delivery</p>
                    </div>

                    {/* Food Order Details */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-brand-text mb-1">
                              Order ID: {order.id.slice(-6).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <CalendarDays className="w-4 h-4" /> 
                              {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Just Now'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Delivery Location</p>
                            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                              {order.customer?.exactAddress}, {order.customer?.pincode}
                            </p>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-brand-primary uppercase tracking-widest">Items Ordered</p>
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="bg-brand-primary/10 text-brand-primary font-bold px-2 py-1 rounded text-xs">
                                  {item.quantity}x
                                </span>
                                <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Messages */}
                      {order.status === 'pending' && (
                        <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-800 flex items-start gap-3">
                          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                          <p>Your order request has been sent to the kitchen. Waiting for admin approval.</p>
                        </div>
                      )}
                      
                      {order.status === 'accepted' && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-start gap-3">
                          <ChefHat className="w-5 h-5 shrink-0 mt-0.5" />
                          <p>The kitchen is preparing your food! We will deliver it to your location shortly.</p>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800 flex items-start gap-3">
                          <Truck className="w-5 h-5 shrink-0 mt-0.5" />
                          <p>Your food has been delivered. Enjoy your meal!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}