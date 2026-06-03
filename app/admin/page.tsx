"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CalendarHeart, Utensils, Users, ArrowUpRight, Activity } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({ rooms: 0, food: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Room Requests
        const roomsSnap = await getDocs(collection(db, "room_requests"));
        const roomRequests = roomsSnap.docs.map(doc => ({
          id: doc.id,
          type: "room",
          message: `${doc.data().name} requested to book ${doc.data().roomName || 'a room'}`,
          date: doc.data().createdAt || new Date().toISOString(),
          status: doc.data().status || "Pending",
          ...doc.data()
        }));

        // Fetch Food Orders
        const foodSnap = await getDocs(collection(db, "food_orders"));
        const foodOrders = foodSnap.docs.map(doc => ({
          id: doc.id,
          type: "food",
          message: `${doc.data().name} ordered ${doc.data().productName || 'food'}`,
          date: doc.data().createdAt || new Date().toISOString(),
          status: doc.data().status || "Pending",
          ...doc.data()
        }));

        // Merge, Sort by Newest, and keep top 10
        const combined = [...roomRequests, ...foodOrders]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);

        setRecentActivity(combined);
        setStats({
          rooms: roomRequests.filter(r => r.status === "Pending").length,
          food: foodOrders.filter(f => f.status === "Pending").length
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-gray-500">Loading live dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back, Admin</h2>
        <p className="text-gray-500 text-sm mt-1">Here is what is happening at TheVintageHouse today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Room Requests</p>
            <p className="text-3xl font-bold text-gray-900">{stats.rooms}</p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
            <CalendarHeart size={24} />
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Food Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.food}</p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
            <Utensils size={24} />
          </div>
        </div>
      </div>

      {/* Real-Time Activity Feed */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-brand-primary" size={18} /> Live Activity Feed
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentActivity.length > 0 ? recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${activity.type === 'room' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activity.status === "Pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                }`}>
                  {activity.status}
                </span>
                <Link href={activity.type === 'room' ? '/admin/rooms' : '/admin/orders'} className="text-gray-400 hover:text-brand-primary">
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          )) : (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No recent activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}