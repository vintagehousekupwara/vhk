"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, writeBatch, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Search, Trash2, Eye, EyeOff, Utensils, PlusCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ==========================================
// 25 PREMIUM MOCK MENU ITEMS (VERIFIED WORKING IMAGES)
// ==========================================
const INITIAL_MENU = [
  // Starters
  { name: "Paneer Tikka Sizzler", category: "Starters", price: 350, rating: 4.8, isAvailable: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop" },
  { name: "Mutton Seekh Kebab", category: "Starters", price: 450, rating: 4.9, isAvailable: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop" },
  { name: "Crispy Calamari", category: "Starters", price: 550, rating: 4.6, isAvailable: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop" },
  { name: "Vegetable Spring Rolls", category: "Starters", price: 280, rating: 4.5, isAvailable: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop" },
  { name: "Chicken Malai Boti", category: "Starters", price: 420, rating: 4.7, isAvailable: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop" },
  // Soups & Salads
  { name: "Roasted Tomato Basil Soup", category: "Soups", price: 220, rating: 4.5, isAvailable: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop" },
  { name: "Sweet Corn Chicken Soup", category: "Soups", price: 250, rating: 4.6, isAvailable: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop" },
  { name: "Classic Caesar Salad", category: "Salads", price: 320, rating: 4.7, isAvailable: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop" },
  { name: "Mediterranean Greek Salad", category: "Salads", price: 340, rating: 4.8, isAvailable: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop" },
  { name: "Hot & Sour Veg Soup", category: "Soups", price: 200, rating: 4.4, isAvailable: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop" },
  // Mains (Veg)
  { name: "Paneer Butter Masala", category: "Mains", price: 450, rating: 4.8, isAvailable: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop" },
  { name: "Dal Makhani Signature", category: "Mains", price: 350, rating: 4.9, isAvailable: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop" },
  { name: "Kashmiri Dum Aloo", category: "Mains", price: 400, rating: 4.7, isAvailable: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop" },
  { name: "Malai Kofta Curry", category: "Mains", price: 420, rating: 4.6, isAvailable: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop" },
  // Mains (Non-Veg)
  { name: "Authentic Mutton Rogan Josh", category: "Mains", price: 650, rating: 5.0, isAvailable: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop" },
  { name: "Classic Butter Chicken", category: "Mains", price: 550, rating: 4.9, isAvailable: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop" },
  { name: "Kashmiri Wazwan Trami", category: "Premium", price: 3500, rating: 5.0, isAvailable: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop" },
  { name: "Hyderabadi Chicken Biryani", category: "Mains", price: 480, rating: 4.8, isAvailable: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop" },
  { name: "Mutton Awadhi Biryani", category: "Mains", price: 580, rating: 4.9, isAvailable: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop" },
  // Desserts
  { name: "Saffron Phirni", category: "Desserts", price: 250, rating: 4.9, isAvailable: true, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop" },
  { name: "Hot Gulab Jamun (2 pcs)", category: "Desserts", price: 150, rating: 4.8, isAvailable: true, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop" },
  { name: "Chocolate Lava Cake", category: "Desserts", price: 300, rating: 4.7, isAvailable: true, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop" },
  // Beverages
  { name: "Authentic Kashmiri Kahwa", category: "Beverages", price: 150, rating: 5.0, isAvailable: true, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop" },
  { name: "Virgin Mint Mojito", category: "Beverages", price: 220, rating: 4.6, isAvailable: true, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop" },
  { name: "Classic Cold Coffee", category: "Beverages", price: 250, rating: 4.7, isAvailable: true, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop" },
];

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Live Real-Time Listener for Menu Items
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(fetchedItems);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 💥 EMERGENCY RESET: Wipes out the broken DB entries
  const handleResetDatabase = async () => {
    if (!confirm("WARNING: This will delete ALL current menu items in Firebase. Proceed?")) return;
    setIsSeeding(true);
    try {
      const snapshot = await getDocs(collection(db, "menu"));
      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.delete(doc(db, "menu", document.id));
      });
      await batch.commit();
      alert("Database wiped clean! You can now Bulk Upload again.");
    } catch (error) {
      alert("Failed to reset database.");
    } finally {
      setIsSeeding(false);
    }
  };

  // The Bulk Upload Function
  const handleBulkUpload = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      INITIAL_MENU.forEach((item) => {
        const docRef = doc(collection(db, "menu")); // Auto-generate ID
        batch.set(docRef, { ...item, createdAt: new Date().toISOString() });
      });
      await batch.commit();
      alert("Successfully seeded 25 items to the menu!");
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Failed to upload menu items.");
    } finally {
      setIsSeeding(false);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "menu", id), { isAvailable: !currentStatus });
    } catch (error) {
      alert("Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item permanently? This cannot be undone.")) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, "menu", id));
    } catch (error) {
      alert("Failed to delete item.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
              <Utensils className="text-brand-primary w-8 h-8" />
              Menu Management
            </h1>
            <p className="text-gray-500 text-sm mt-2">Add, hide, or remove dishes from the live restaurant menu.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text" placeholder="Search dish or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>

            {/* If items exist, show the RED reset button so we can wipe the broken ones */}
            {menuItems.length > 0 && !isLoading && (
              <button 
                onClick={handleResetDatabase} disabled={isSeeding}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Reset Database
              </button>
            )}

            {/* Bulk Seeder Button (Only show if database is empty to prevent duplicates) */}
            {menuItems.length === 0 && !isLoading && (
              <button 
                onClick={handleBulkUpload} disabled={isSeeding}
                className="w-full sm:w-auto px-6 py-2.5 bg-brand-text text-white hover:bg-brand-primary font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Bulk Upload 25 Items
              </button>
            )}
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="flex justify-center h-64 items-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary" /></div>
        ) : menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Utensils className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">Your menu is empty</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">Click the Bulk Upload button above to instantly add 25 premium dishes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredMenu.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl border ${item.isAvailable ? 'border-gray-200' : 'border-red-200 opacity-75'} shadow-sm overflow-hidden flex flex-col relative group`}
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 30vw" className={`object-cover ${!item.isAvailable && 'grayscale'}`} />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-xs uppercase tracking-widest flex items-center gap-2"><EyeOff size={14}/> Hidden</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-brand-text px-3 py-1 rounded text-xs font-bold uppercase tracking-widest shadow-sm">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                    </div>
                    <p className="text-xl font-bold text-brand-primary mb-4">₹{item.price}</p>

                    <div className="mt-auto flex gap-2 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => toggleAvailability(item.id, item.isAvailable)}
                        disabled={processingId === item.id}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                          item.isAvailable ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : item.isAvailable ? <><EyeOff size={14}/> Hide</> : <><Eye size={14}/> Show</>}
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(item.id)}
                        disabled={processingId === item.id}
                        className="w-10 h-10 shrink-0 bg-gray-50 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors"
                      >
                        {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}