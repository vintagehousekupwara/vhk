"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, Clock, Search, ChefHat } from "lucide-react";

export default function AdminFoodOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const snap = await getDocs(collection(db, "food_orders"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by newest
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const markAsServed = async (id: string) => {
    if(confirm("Mark this food order as completed/served?")) {
      await updateDoc(doc(db, "food_orders", id), { status: "Completed" });
      setOrders(orders.map(order => order.id === id ? { ...order, status: "Completed" } : order));
    }
  };

  const filteredOrders = orders.filter(order => 
    order.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    order.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 text-gray-500">Loading food orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Food Orders</h2>
          <p className="text-gray-500 text-sm mt-1">Manage incoming dining and room service requests.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Food Ordered</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Kitchen Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.name}</div>
                    <div className="text-xs text-gray-500 mt-1">Room/Table: {order.location || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.productName}</div>
                    <div className="text-xs text-gray-500 mt-1">Qty: {order.quantity || 1}</div>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === "Pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Clock size={12} /> Preparing</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} /> Served</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === "Pending" ? (
                      <button onClick={() => markAsServed(order.id)} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors shadow-sm">
                        <ChefHat size={14} /> Mark Served
                      </button>
                    ) : (
                      <button disabled className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed">
                        <CheckCircle size={14} /> Completed
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No food orders currently active.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}