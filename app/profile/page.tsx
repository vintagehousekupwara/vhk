"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BedDouble, LogOut, Loader2, CalendarDays, Clock, 
  CheckCircle, XCircle, User as UserIcon, Mail, 
  Utensils, ChefHat, MapPin, Phone, Calendar
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingFoodOrders, setLoadingFoodOrders] = useState(true);
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [foodOrders, setFoodOrders] = useState<any[]>([]);

  // TAB STATE: 'profile' | 'rooms' | 'food'
  const [activeTab, setActiveTab] = useState<"profile" | "rooms" | "food">("profile");

  // 1. AUTHENTICATION & USER DATA LISTENER
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || !currentUser.emailVerified) {
        // FIX: Explicitly clear user state to cleanly detach snapshot listeners
        setUser(null); 
        router.push("/auth"); 
      } else {
        // Support for both potential admin emails
        if (currentUser.email === "admin@thevintagehouse.com" || currentUser.email === "adminvintagesuperhouse@gmail.com") {
          router.push("/admin/rooms");
          return;
        }
        
        setUser(currentUser);

        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) setUserData(userDoc.data());
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. BOOKINGS & ORDERS LISTENER
  useEffect(() => {
    if (!user || !user.email) return;

    // Bookings Query
    const qBookings = query(collection(db, "bookings"), where("email", "==", user.email));
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedBookings.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setBookings(fetchedBookings);
      setLoadingBookings(false);
    }, (error) => {
      // FIX: Graceful error handling prevents "Uncaught Error" crashes
      console.error("Bookings Listener Error:", error);
      setLoadingBookings(false);
    });

    // Food Orders Query
    const qFood = query(collection(db, "food_orders"), where("customer.email", "==", user.email));
    const unsubFood = onSnapshot(qFood, (snapshot) => {
      const fetchedFood = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedFood.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setFoodOrders(fetchedFood);
      setLoadingFoodOrders(false);
    }, (error) => {
      // FIX: Graceful error handling
      console.error("Food Orders Listener Error:", error);
      setLoadingFoodOrders(false);
    });

    return () => { 
      unsubBookings(); 
      unsubFood(); 
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg pt-24 md:pt-28 pb-24 md:pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* DESKTOP TABS (Hidden on Mobile) */}
        <div className="hidden md:flex space-x-8 border-b border-gray-200 mb-8">
          <button onClick={() => setActiveTab('profile')} className={`pb-4 px-2 font-bold tracking-widest uppercase text-sm border-b-2 transition-colors ${activeTab === 'profile' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
            Personal Details
          </button>
          <button onClick={() => setActiveTab('rooms')} className={`pb-4 px-2 font-bold tracking-widest uppercase text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rooms' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
            Room Bookings {bookings.length > 0 && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{bookings.length}</span>}
          </button>
          <button onClick={() => setActiveTab('food')} className={`pb-4 px-2 font-bold tracking-widest uppercase text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'food' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
            Food Orders {foodOrders.length > 0 && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{foodOrders.length}</span>}
          </button>
        </div>

        {/* TAB CONTENT AREAS */}
        <AnimatePresence mode="wait">

          {/* --- PROFILE TAB --- */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center shrink-0 relative">
                    <UserIcon className="w-8 h-8 text-green-600" />
                    <span className="absolute bottom-0 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    {/* Safe split fallback in case name is undefined */}
                    <h1 className="font-serif text-2xl md:text-3xl text-brand-text mb-1">Hi, {(userData?.name || "Guest").split(" ")[0]}</h1>
                    <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-2 py-1 rounded">Verified Guest</span>
                  </div>
                </div>
                
                <button onClick={handleSignOut} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg font-bold tracking-widest uppercase text-xs transition-colors shadow-sm w-full md:w-auto justify-center">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-bg rounded-lg"><Mail className="text-brand-primary" size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Email Address</p>
                    <p className="text-base text-gray-800 font-medium break-all">{userData?.email || user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-bg rounded-lg"><Phone className="text-brand-primary" size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Phone Number</p>
                    <p className="text-base text-gray-800 font-medium">{userData?.phone || "Not Provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-bg rounded-lg"><Calendar className="text-brand-primary" size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Age</p>
                    <p className="text-base text-gray-800 font-medium">{userData?.age ? `${userData.age} Yrs` : "Not Provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:col-span-2">
                  <div className="p-3 bg-brand-bg rounded-lg"><MapPin className="text-brand-primary" size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Delivery Address</p>
                    <p className="text-base text-gray-800 font-medium leading-relaxed">{userData?.address || "No address saved."}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- ROOMS TAB --- */}
          {activeTab === 'rooms' && (
            <motion.div key="rooms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="md:hidden flex items-center gap-2 mb-6">
                <BedDouble className="text-brand-primary w-5 h-5" />
                <h2 className="font-serif text-xl text-gray-800">Room Reservations</h2>
              </div>

              {loadingBookings ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex justify-center"><Loader2 className="animate-spin text-brand-primary" /></div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-gray-800 mb-2">No Reservations Yet</h3>
                  <Link href="/#accommodations"><button className="mt-4 bg-brand-text text-white px-6 py-3 rounded-lg text-xs tracking-widest uppercase font-bold">Book a Stay</button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                      <div className={`p-5 md:w-64 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center ${booking.status === 'pending' ? 'bg-orange-50/50' : booking.status === 'confirmed' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          {booking.status === 'pending' && <Clock className="text-orange-500 w-4 h-4" />}
                          {booking.status === 'confirmed' && <CheckCircle className="text-green-500 w-4 h-4" />}
                          {booking.status === 'cancelled' && <XCircle className="text-red-500 w-4 h-4" />}
                          <span className={`font-bold uppercase tracking-widest text-[10px] md:text-xs ${booking.status === 'pending' ? 'text-orange-700' : booking.status === 'confirmed' ? 'text-green-700' : 'text-red-700'}`}>{booking.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">₹{booking.totalCost}</p>
                        <p className="text-[10px] font-medium text-gray-500">Payable at Hotel</p>
                      </div>

                      <div className="flex-1 p-5 md:p-6">
                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-brand-text mb-1">{booking.roomType}</h3>
                            <p className="text-xs font-bold text-brand-primary">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'} • {booking.adults} Adults {booking.children > 0 && `• ${booking.children} Kids`}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {booking.id.slice(-6).toUpperCase()}</span>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg flex-1">
                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Check-In</p>
                            <p className="font-bold text-gray-800 text-sm">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg flex-1">
                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Check-Out</p>
                            <p className="font-bold text-gray-800 text-sm">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* --- FOOD TAB --- */}
          {activeTab === 'food' && (
            <motion.div key="food" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="md:hidden flex items-center gap-2 mb-6">
                <Utensils className="text-brand-primary w-5 h-5" />
                <h2 className="font-serif text-xl text-gray-800">Food Orders</h2>
              </div>

              {loadingFoodOrders ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex justify-center"><Loader2 className="animate-spin text-brand-primary" /></div>
              ) : foodOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-gray-800 mb-2">No Orders Yet</h3>
                  <Link href="/menu"><button className="mt-4 bg-brand-text text-white px-6 py-3 rounded-lg text-xs tracking-widest uppercase font-bold">View Menu</button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {foodOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                      <div className={`p-5 md:w-64 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center ${order.status === 'pending' ? 'bg-orange-50/50' : order.status === 'accepted' ? 'bg-blue-50/50' : order.status === 'delivered' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          {order.status === 'pending' && <Clock className="text-orange-500 w-4 h-4" />}
                          {order.status === 'accepted' && <ChefHat className="text-blue-500 w-4 h-4" />}
                          {order.status === 'delivered' && <CheckCircle className="text-green-500 w-4 h-4" />}
                          {order.status === 'rejected' && <XCircle className="text-red-500 w-4 h-4" />}
                          <span className={`font-bold uppercase tracking-widest text-[10px] md:text-xs ${order.status === 'pending' ? 'text-orange-700' : order.status === 'accepted' ? 'text-blue-700' : order.status === 'delivered' ? 'text-green-700' : 'text-red-700'}`}>{order.status === 'accepted' ? 'Cooking' : order.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Order Total</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">₹{order.totalAmount}</p>
                        <p className="text-[10px] font-medium text-gray-500">Cash on Delivery</p>
                      </div>

                      <div className="flex-1 p-5 md:p-6">
                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                          <h3 className="font-serif text-lg font-bold text-brand-text">Order: {order.id.slice(-6).toUpperCase()}</h3>
                          <span className="text-[10px] text-gray-400 font-mono">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just Now'}</span>
                        </div>
                        <div className="space-y-2">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded text-[10px]">{item.quantity}x</span>
                                <span className="font-medium text-gray-800 text-xs md:text-sm">{item.name}</span>
                              </div>
                              <span className="text-xs font-bold text-gray-900">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* MOBILE APP BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        
        <button onClick={() => setActiveTab('profile')} className="flex-1 h-full relative">
          <div className={`flex flex-col items-center justify-center h-full w-full transition-colors ${activeTab === 'profile' ? "text-brand-primary" : "text-gray-400"}`}>
            {activeTab === 'profile' && <motion.div layoutId="profileBottomNav" className="absolute top-0 w-8 h-0.5 bg-brand-primary rounded-b-full" />}
            <UserIcon size={20} className="mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Profile</span>
          </div>
        </button>

        <button onClick={() => setActiveTab('rooms')} className="flex-1 h-full relative">
          <div className={`flex flex-col items-center justify-center h-full w-full transition-colors ${activeTab === 'rooms' ? "text-brand-primary" : "text-gray-400"}`}>
            {activeTab === 'rooms' && <motion.div layoutId="profileBottomNav" className="absolute top-0 w-8 h-0.5 bg-brand-primary rounded-b-full" />}
            <BedDouble size={20} className="mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Rooms</span>
          </div>
        </button>

        <button onClick={() => setActiveTab('food')} className="flex-1 h-full relative">
          <div className={`flex flex-col items-center justify-center h-full w-full transition-colors ${activeTab === 'food' ? "text-brand-primary" : "text-gray-400"}`}>
            {activeTab === 'food' && <motion.div layoutId="profileBottomNav" className="absolute top-0 w-8 h-0.5 bg-brand-primary rounded-b-full" />}
            <Utensils size={20} className="mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Food</span>
          </div>
        </button>

      </nav>
    </main>
  );
}