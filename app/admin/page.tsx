"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, BedDouble, Clock, Loader2, ArrowUpRight, CheckCircle, XCircle, Archive, Activity } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Helper to format timestamps nicely
const formatTimeAgo = (dateString: string) => {
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
    totalGuests: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live Listener for all bookings to calculate metrics and extract activities
  useEffect(() => {
    const q = query(collection(db, "bookings"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let active = 0;
      let pending = 0;
      let guests = 0;
      const activitiesList: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.status === "confirmed") {
          active += 1;
          guests += (data.adults || 0) + (data.children || 0);
        }
        if (data.status === "pending") {
          pending += 1;
        }

        activitiesList.push({ id: doc.id, ...data });
      });

      // Sort activities by most recently updated or created
      activitiesList.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      setMetrics({
        activeBookings: active,
        pendingRequests: pending,
        totalGuests: guests,
      });
      setRecentActivities(activitiesList.slice(0, 10)); // Keep the 10 most recent activities
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

  const statCards = [
    { title: "Active Bookings", value: metrics.activeBookings, icon: BedDouble, color: "text-blue-600", bg: "bg-blue-100", link: "/admin/rooms" },
    { title: "Pending Requests", value: metrics.pendingRequests, icon: Clock, color: "text-orange-600", bg: "bg-orange-100", link: "/admin/rooms" },
    { title: "Active Guests", value: metrics.totalGuests, icon: Users, color: "text-purple-600", bg: "bg-purple-100", link: "/admin/rooms" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Live metrics and recent activity from your hotel.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <Link href={stat.link}>
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
            <p className="text-3xl font-serif font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <Activity className="text-brand-primary w-6 h-6" />
          <h2 className="font-serif text-2xl font-bold text-gray-800">Recent User Activity</h2>
        </div>
        
        <div className="p-6">
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity detected.</p>
          ) : (
            <div className="space-y-6">
              {recentActivities.map((activity, index) => {
                // Determine icon and text based on status
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
                    {/* Timeline vertical line */}
                    {index !== recentActivities.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-[-24px] w-[2px] bg-gray-100"></div>
                    )}
                    
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${iconBg}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 flex-1 border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-bold">{activity.customerName}</span> {actionText} <span className="font-bold">{activity.roomType}</span>.
                        </p>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
                          {formatTimeAgo(activity.updatedAt || activity.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
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