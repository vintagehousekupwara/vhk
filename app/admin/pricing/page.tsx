"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, Utensils } from "lucide-react";

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Advanced Pricing State including Meal Plans
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
    },
    mealPlans: {
      ep: 0,
      cp: 500,
      map: 1000,
      ap: 1500
    }
  });

  useEffect(() => {
    const fetchPricing = async () => {
      const docRef = doc(db, "settings", "global_pricing");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPricing((prev) => ({
          kingSize: { ...prev.kingSize, ...(data.kingSize || {}) },
          doubleBed: { ...prev.doubleBed, ...(data.doubleBed || {}) },
          mealPlans: { ...prev.mealPlans, ...(data.mealPlans || {}) }
        }));
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

  const handleMealPlanChange = (field: string, value: string) => {
    setPricing(prev => ({ ...prev, mealPlans: { ...prev.mealPlans, [field]: Number(value) } }));
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-brand-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-8 pb-20 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-brand-text">Global Booking Rates</h2>
          <p className="text-gray-500 text-sm mt-1">Set dynamic pricing based on room type, guest count, and meal plans.</p>
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
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-6">
              <label className="text-xs font-bold text-orange-800 uppercase">Additional Child Rate (₹)</label>
              <input type="number" value={pricing.kingSize.extraChild} onChange={(e) => handleKingChange("extraChild", e.target.value)} className="w-full p-2 border border-orange-200 rounded mt-1 bg-white" />
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
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-6">
              <label className="text-xs font-bold text-orange-800 uppercase">Additional Child Rate (₹)</label>
              <input type="number" value={pricing.doubleBed.extraChild} onChange={(e) => handleDoubleChange("extraChild", e.target.value)} className="w-full p-2 border border-orange-200 rounded mt-1 bg-white" />
            </div>
          </div>
        </div>

        {/* MEAL PLANS CONFIG */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b">
            <Utensils className="text-brand-primary w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-800">Meal Plan Rates (Per Guest / Night)</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">European Plan (EP)</label>
              <input type="number" value={pricing.mealPlans?.ep ?? 0} onChange={(e) => handleMealPlanChange("ep", e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white font-bold" />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">Continental Plan (CP)</label>
              <input type="number" value={pricing.mealPlans?.cp ?? 500} onChange={(e) => handleMealPlanChange("cp", e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white font-bold" />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">Mod. American (MAP)</label>
              <input type="number" value={pricing.mealPlans?.map ?? 1000} onChange={(e) => handleMealPlanChange("map", e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white font-bold" />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">American Plan (AP)</label>
              <input type="number" value={pricing.mealPlans?.ap ?? 1500} onChange={(e) => handleMealPlanChange("ap", e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white font-bold" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}