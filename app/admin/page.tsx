"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BedDouble, Clock, Loader2, ArrowUpRight, CheckCircle, XCircle, Archive, Activity } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Format date to local YYYY-MM-DD safely
const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper to format timestamps for the timeline
const formatTimeAgo = (dateString: string) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    activeBookings: 0,
    pendingRequests: 0,
  });
  
  const [roomStats, setRoomStats] = useState({
    kingAvailable: 0,
    doubleAvailable: 0,
  });
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Today's Exact Inventory (The Ultimate Source of Truth)
    const fetchInventory = async () => {
      try {
        const todayStr = formatYYYYMMDD(new Date());
        const q = query(collection(db, "room_inventory"), where("date", "==", todayStr));
        const snap = await getDocs(q);
        
        let kingAvail = 0; // Defaults to 0 if admin hasn't set inventory for today
        let doubleAvail = 0;
        
        snap.forEach(document => {
          const data = document.data();
          if (data.roomType === "King Size") kingAvail = data.available;
          if (data.roomType === "Double Bed") doubleAvail = data.available;
        });

        setRoomStats({
          kingAvailable: kingAvail,
          doubleAvailable: doubleAvail,
        });
      } catch (error) {
        console.error("Error fetching live inventory:", error);
      }
    };

    fetchInventory();

    // 2. Listen to Bookings for Metrics & Recent Activity Timeline
    const qBookings = query(collection(db, "bookings"));
    const unsubscribe = onSnapshot(qBookings, (snapshot) => {
      let active = 0;
      let pending = 0;
      const activitiesList: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.status === "confirmed") active += 1;
        if (data.status === "pending") pending += 1;

        activitiesList.push({ id: doc.id, ...data });
      });

      // Sort by newest update/creation for the timeline
      activitiesList.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setMetrics({ activeBookings: active, pendingRequests: pending });
      setRecentActivities(activitiesList.slice(0, 10)); // Keep the Top 10 latest
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Live metrics, exact inventory, and recent hotel activity.</p>
      </div>

      {/* Top Stats Row (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Pending Requests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <Link href="/admin/rooms">
              <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Pending Action</h3>
          <p className="text-3xl font-serif font-bold text-gray-900">{metrics.pendingRequests}</p>
        </motion.div>

        {/* Metric 2: Active Bookings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <Link href="/admin/rooms">
              <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Confirmed Stays</h3>
          <p className="text-3xl font-serif font-bold text-gray-900">{metrics.activeBookings}</p>
        </motion.div>

        {/* Metric 3: King Size Today */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-full -z-0" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-brand-secondary/30">
              <BedDouble className="w-6 h-6 text-brand-primary" />
            </div>
            <Link href="/admin/calendar">
              <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">King Rooms</h3>
          <p className="text-3xl font-serif font-bold text-brand-primary">{roomStats.kingAvailable} <span className="text-sm font-normal text-gray-400">Avail Tonight</span></p>
        </motion.div>

        {/* Metric 4: Double Bed Today */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-full -z-0" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-brand-secondary/30">
              <BedDouble className="w-6 h-6 text-brand-primary" />
            </div>
            <Link href="/admin/calendar">
              <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Double Beds</h3>
          <p className="text-3xl font-serif font-bold text-brand-primary">{roomStats.doubleAvailable} <span className="text-sm font-normal text-gray-400">Avail Tonight</span></p>
        </motion.div>

      </div>

      {/* Recent Activity Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <Activity className="text-brand-primary w-6 h-6" />
          <h2 className="font-serif text-2xl font-bold text-gray-800">Latest Activity Log</h2>
        </div>
        
        <div className="p-6">
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8 font-medium">No recent activity detected.</p>
          ) : (
            <div className="space-y-6">
              {recentActivities.map((activity, index) => {
                // Determine styling and language based on status
                let Icon = Clock;
                let iconColor = "text-orange-500";
                let iconBg = "bg-orange-100";
                let actionText = "submitted a new booking request for";

                if (activity.status === "confirmed") {
                  Icon = CheckCircle;
                  iconColor = "text-green-500";
                  iconBg = "bg-green-100";
                  actionText = "booking was confirmed for";
                  if (activity.updatedAt && activity.updatedAt !== activity.createdAt) {
                     actionText = "had their booking confirmed for";
                  }
                } else if (activity.status === "cancelled") {
                  Icon = XCircle;
                  iconColor = "text-red-500";
                  iconBg = "bg-red-100";
                  actionText = "booking was cancelled for";
                } else if (activity.status === "archived") {
                  Icon = Archive;
                  iconColor = "text-gray-500";
                  iconBg = "bg-gray-100";
                  actionText = "booking was archived for";
                }

                return (
                  <div key={activity.id} className="flex gap-4 relative">
                    {/* Visual Timeline Line */}
                    {index !== recentActivities.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-[-24px] w-[2px] bg-gray-100"></div>
                    )}
                    
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${iconBg}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 flex-1 border border-gray-100 hover:border-brand-primary/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          <span className="font-bold">{activity.customerName}</span> {actionText} <span className="font-bold text-brand-primary">{activity.roomType}</span>.
                        </p>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                          {formatTimeAgo(activity.updatedAt || activity.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium bg-white inline-block px-3 py-1.5 rounded-lg border border-gray-100">
                        Stay: {new Date(activity.checkIn).toLocaleDateString()} to {new Date(activity.checkOut).toLocaleDateString()} • {activity.adults + activity.children} Guests
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}