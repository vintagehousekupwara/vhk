"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { CalendarHeart, Utensils, LogOut, CheckCircle, Clock, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth");
      } else if (currentUser.email === "admin@thevintagehouse.com") {
        router.push("/admin"); // Redirect admin away from guest portal
      } else {
        setUser(currentUser);
        if (currentUser.email) {
          await fetchData(currentUser.email);
        } else {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async (email: string) => {
    try {
      // Fetch user's room bookings
      const roomQ = query(collection(db, "room_requests"), where("email", "==", email));
      const roomSnap = await getDocs(roomQ);
      setBookings(roomSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch user's food orders (Requires modifying food order to include email, or matching by name for now)
      // For best practice, we query by email. Make sure your food ordering modal saves the email!
      const foodQ = query(collection(db, "food_orders"), where("email", "==", email));
      const foodSnap = await getDocs(foodQ);
      setOrders(foodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>;

  return (
    <main className="min-h-screen bg-brand-bg pt-24 pb-20 px-4 md:px-6 lg:px-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-2xl border border-brand-secondary shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl text-brand-text">Welcome, {user?.displayName || "Guest"}</h1>
            <p className="text-brand-muted text-sm">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-red-500 hover:text-red-700 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bookings Section */}
          <div className="bg-white rounded-2xl border border-brand-secondary shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-brand-secondary p-6 flex items-center gap-3">
              <CalendarHeart className="text-brand-primary" />
              <h2 className="font-serif text-xl text-brand-text">Your Room Bookings</h2>
            </div>
            <div className="p-6 space-y-4">
              {bookings.length > 0 ? bookings.map(booking => (
                <div key={booking.id} className="p-4 border border-brand-secondary rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-brand-text">{booking.roomName}</h3>
                    <p className="text-xs text-brand-muted mt-1">
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${booking.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {booking.status === 'Verified' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                    {booking.status}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-brand-muted text-center py-6">No room bookings found.</p>
              )}
            </div>
          </div>

          {/* Food Orders Section */}
          <div className="bg-white rounded-2xl border border-brand-secondary shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-brand-secondary p-6 flex items-center gap-3">
              <Utensils className="text-brand-primary" />
              <h2 className="font-serif text-xl text-brand-text">Room Service Orders</h2>
            </div>
            <div className="p-6 space-y-4">
              {orders.length > 0 ? orders.map(order => (
                <div key={order.id} className="p-4 border border-brand-secondary rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-brand-text">{order.productName}</h3>
                    <p className="text-xs text-brand-muted mt-1">Room: {order.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {order.status === 'Completed' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                    {order.status}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-brand-muted text-center py-6">No recent food orders.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}