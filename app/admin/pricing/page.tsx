"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save } from "lucide-react";

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Advanced Pricing State
  const [pricing, setPricing] = useState({
    kingSize: { 
      onePerson: 4000, 
      twoPerson: 5000, 
      extraChild: 1000 
    },
    doubleBed: { 
      onePerson: 3000, 
      twoPerson: 3500, 
      threePerson: 4500, 
      fourPerson: 5500, 
      extraChild: 800 
    }
  });

  useEffect(() => {
    const fetchPricing = async () => {
      const docRef = doc(db, "settings", "global_pricing");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Merge fetched data with defaults to prevent errors if a field is missing
        setPricing((prev) => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    };
    fetchPricing();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global_pricing"), pricing);
      alert("Global pricing updated successfully!");
    } catch (error) {
      console.error("Error saving pricing", error);
      alert("Failed to save pricing.");
    } finally {
      setSaving(false);
    }
  };

  const handleKingChange = (field: string, value: string) => {
    setPricing(prev => ({ ...prev, kingSize: { ...prev.kingSize, [field]: Number(value) } }));
  };

  const handleDoubleChange = (field: string, value: string) => {
    setPricing(prev => ({ ...prev, doubleBed: { ...prev.doubleBed, [field]: Number(value) } }));
  };

  if (loading) return <div className="p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-brand-text">Global Booking Rates</h2>
          <p className="text-gray-500 text-sm mt-1">Set dynamic pricing based on room type and guest count.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold tracking-widest uppercase text-sm flex items-center gap-2 hover:bg-[#A65520]"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Save Rates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KING SIZE CONFIG */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b">King Size Room</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">1 Person Rate (₹)</label>
              <input type="number" value={pricing.kingSize.onePerson} onChange={(e) => handleKingChange("onePerson", e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">2 Persons Rate (₹)</label>
              <input type="number" value={pricing.kingSize.twoPerson} onChange={(e) => handleKingChange("twoPerson", e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-6">
              <label className="text-xs font-bold text-gray-500 uppercase">Additional Child Rate (₹)</label>
              <input type="number" value={pricing.kingSize.extraChild} onChange={(e) => handleKingChange("extraChild", e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" />
            </div>
          </div>
        </div>

        {/* DOUBLE BED CONFIG */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b">Double Bed Room</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">1 Person (₹)</label>
                <input type="number" value={pricing.doubleBed.onePerson} onChange={(e) => handleDoubleChange("onePerson", e.target.value)} className="w-full p-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">2 Persons (₹)</label>
                <input type="number" value={pricing.doubleBed.twoPerson} onChange={(e) => handleDoubleChange("twoPerson", e.target.value)} className="w-full p-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">3 Persons (₹)</label>
                <input type="number" value={pricing.doubleBed.threePerson} onChange={(e) => handleDoubleChange("threePerson", e.target.value)} className="w-full p-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">4 Persons (₹)</label>
                <input type="number" value={pricing.doubleBed.fourPerson} onChange={(e) => handleDoubleChange("fourPerson", e.target.value)} className="w-full p-2 border rounded mt-1" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-6">
              <label className="text-xs font-bold text-gray-500 uppercase">Additional Child Rate (₹)</label>
              <input type="number" value={pricing.doubleBed.extraChild} onChange={(e) => handleDoubleChange("extraChild", e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}