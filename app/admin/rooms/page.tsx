"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, Clock, Search, ShieldCheck } from "lucide-react";

export default function AdminRoomsRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const snap = await getDocs(collection(db, "room_requests"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by newest first
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  // Update status in Firebase
  const markAsVerified = async (id: string) => {
    if(confirm("Confirm that payment is verified and room is booked?")) {
      await updateDoc(doc(db, "room_requests", id), { status: "Verified" });
      setRequests(requests.map(req => req.id === id ? { ...req, status: "Verified" } : req));
    }
  };

  const filteredRequests = requests.filter(req => 
    req.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.roomName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 text-gray-500">Loading room requests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Room Requests</h2>
          <p className="text-gray-500 text-sm mt-1">Review incoming bookings and verify payments.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or room..." 
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
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Guest Details</th>
                <th className="px-6 py-4">Requested Room</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.name} <span className="text-gray-400 font-normal">(Age: {req.age})</span></div>
                    <div className="text-xs text-gray-500 mt-1">{req.phone}</div>
                    <div className="text-xs text-gray-500">{req.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.roomName}</div>
                    <div className="text-xs text-gray-500 mt-1">Qty: {req.quantity || 1}</div>
                  </td>
                  <td className="px-6 py-4">
                    {req.status === "Pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700"><Clock size={12} /> Pending</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} /> Booked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === "Pending" ? (
                      <button onClick={() => markAsVerified(req.id)} className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#A65520] transition-colors shadow-sm">
                        <ShieldCheck size={14} /> Verify & Book
                      </button>
                    ) : (
                      <button disabled className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed">
                        <CheckCircle size={14} /> Approved
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No room requests found in the database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}