"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, Clock, Search, ChefHat, XCircle, Trash2, Truck } from "lucide-react";
import emailjs from '@emailjs/browser';

export default function AdminFoodOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. REAL-TIME LISTENER
  useEffect(() => {
    const q = query(collection(db, "food_orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. HANDLE STATUS CHANGES (Accept, Reject, Deliver)
  const handleAdminAction = async (orderId: string, customerData: any, newStatus: string, isLateRejection = false) => {
    const actionText = newStatus.toUpperCase();
    if (!confirm(`Are you sure you want to mark this order as ${actionText}?`)) return;

    try {
      await updateDoc(doc(db, "food_orders", orderId), { status: newStatus });

      // Customize the email message based on the exact action
      let emailMessage = "";
      if (newStatus === "accepted") {
        emailMessage = "Great news! Your order has been ACCEPTED and is being prepared in the kitchen.";
      } else if (newStatus === "delivered") {
        emailMessage = "Your order has been DELIVERED. Enjoy your meal!";
      } else if (newStatus === "rejected") {
        emailMessage = isLateRejection 
          ? "We sincerely apologize, but we had to CANCEL your accepted order due to an unforeseen kitchen issue. You will not be charged."
          : "We are sorry, but your order request has been REJECTED (kitchen full or out of delivery zone).";
      }

      // Fire off EmailJS
      if (emailMessage) {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          {
            to_email: customerData.email,
            to_name: customerData.name,
            message: emailMessage,
            passcode: "UPDATE", 
            time: new Date().toLocaleTimeString()
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
      }
    } catch (error) {
      console.error("Action failed", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // 3. SECURE DELETE FUNCTION
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("CRITICAL WARNING: Are you sure you want to permanently delete this order record? This cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, "food_orders", orderId));
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete order.");
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 text-gray-500">Loading live food orders...</div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Live Kitchen Orders</h2>
          <p className="text-gray-500 text-sm mt-1">Review, update, and manage delivery requests.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className={`transition-colors ${order.status === 'pending' ? 'bg-yellow-50/50' : 'hover:bg-gray-50/50'}`}>
                  
                  {/* TIME */}
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Just Now'}
                  </td>
                  
                  {/* CUSTOMER */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customer?.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{order.customer?.phone}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{order.customer?.email}</div>
                    <div className="text-xs text-gray-800 mt-2 bg-gray-100 p-1.5 rounded inline-block">
                      {order.customer?.exactAddress}, {order.customer?.pincode}
                    </div>
                  </td>
                  
                  {/* FOOD */}
                  <td className="px-6 py-4">
                    <div className="max-h-24 overflow-y-auto pr-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="text-xs text-gray-700 mb-1 border-b border-gray-100 pb-1">
                          <span className="font-bold">{item.quantity}x</span> {item.name}
                        </div>
                      ))}
                    </div>
                    <div className="font-bold text-brand-primary mt-2">₹{order.totalAmount}</div>
                  </td>
                  
                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {order.status === "pending" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700"><Clock size={12} /> Pending</span>}
                    {order.status === "accepted" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><ChefHat size={12} /> Cooking</span>}
                    {order.status === "delivered" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} /> Delivered</span>}
                    {order.status === "rejected" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={12} /> Rejected</span>}
                  </td>
                  
                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {/* PENDING ACTIONS */}
                        {order.status === "pending" && (
                          <>
                            <button onClick={() => handleAdminAction(order.id, order.customer, "accepted")} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700">Accept</button>
                            <button onClick={() => handleAdminAction(order.id, order.customer, "rejected")} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700">Reject</button>
                          </>
                        )}
                        
                        {/* ACCEPTED ACTIONS */}
                        {order.status === "accepted" && (
                          <>
                            <button onClick={() => handleAdminAction(order.id, order.customer, "delivered")} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1"><Truck size={14}/> Deliver</button>
                            <button onClick={() => handleAdminAction(order.id, order.customer, "rejected", true)} className="bg-gray-200 text-red-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-100">Cancel</button>
                          </>
                        )}
                      </div>

                      {/* DELETE BUTTON (Always visible for cleanup) */}
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-gray-400 hover:text-red-600 p-1 mt-2 transition-colors" title="Delete permanently">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No food orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}