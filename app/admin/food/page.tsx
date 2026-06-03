"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Search, Trash2, Eye, EyeOff, Utensils, Plus, X, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { purgeWebsiteCache } from "@/app/actions/cache";

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newItem, setNewItem] = useState({ name: "", category: "", price: "" });
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Live Real-Time Listener for Menu Items & Dynamic Categories
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort alphabetically by name
      fetchedItems.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
      setMenuItems(fetchedItems);
      
      // Dynamically extract unique categories from the live database
      const uniqueCategories = Array.from(new Set(fetchedItems.map((item: any) => item.category as string)));
      setCategories(uniqueCategories.length > 0 ? uniqueCategories : ["Starters", "Mains"]);
      
      if (uniqueCategories.length > 0 && !newItem.category) {
        setNewItem(prev => ({ ...prev, category: uniqueCategories[0] }));
      }
      
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const finalCategory = isCreatingNewCategory ? newCategoryName : newItem.category;
    if (!finalCategory) {
      alert("Please select or create a category.");
      setIsAdding(false);
      return;
    }

    try {
      let finalImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string); 

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!cloudinaryRes.ok) throw new Error("Cloudinary image upload failed");
        
        const cloudinaryData = await cloudinaryRes.json();
        
        // FORCE OPTIMIZATION: Inject auto-quality and auto-format into the URL
        const rawUrl = cloudinaryData.secure_url;
        finalImageUrl = rawUrl.replace("/upload/", "/upload/q_auto,f_auto/"); 
      }

      const docRef = doc(collection(db, "menu")); 
      await setDoc(docRef, {
        name: newItem.name,
        category: finalCategory,
        price: Number(newItem.price),
        image: finalImageUrl,
        isAvailable: true,
        rating: 5.0,
        createdAt: new Date().toISOString()
      });
      
      await purgeWebsiteCache(); 
      
      setIsAddModalOpen(false);
      setNewItem({ name: "", category: categories[0] || "Starters", price: "" });
      setIsCreatingNewCategory(false);
      setNewCategoryName("");
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add menu item. Check your console for details.");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "menu", id), { isAvailable: !currentStatus });
      await purgeWebsiteCache(); 
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
      await purgeWebsiteCache(); 
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              Add New Dish
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center"><Loader2 className="w-10 h-10 animate-spin text-brand-primary" /></div>
        ) : menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Utensils className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">Your menu is empty</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">Click "Add New Dish" above to start building your restaurant menu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredMenu.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`bg-white rounded-2xl border ${item.isAvailable ? 'border-gray-200' : 'border-red-200 opacity-75'} shadow-sm overflow-hidden flex flex-col relative group`}>
                  <div className="relative h-48 w-full bg-gray-100">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 30vw" className={`object-cover ${!item.isAvailable ? 'grayscale' : ''}`} />
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
                      <button onClick={() => toggleAvailability(item.id, item.isAvailable)} disabled={processingId === item.id} className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${item.isAvailable ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : item.isAvailable ? <><EyeOff size={14}/> Hide</> : <><Eye size={14}/> Show</>}
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={processingId === item.id} className="w-10 h-10 shrink-0 bg-gray-50 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors">
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

      {/* --- ADD NEW ITEM MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4 py-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Utensils className="text-brand-primary" size={20}/> Add New Dish</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddItem} className="p-6 space-y-5">
                
                {/* Image Upload Area */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Dish Image</label>
                  <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-brand-primary transition-colors cursor-pointer overflow-hidden group">
                    {imagePreview ? (
                      <>
                        <Image src={imagePreview} alt="Preview" fill className="object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-brand-primary">
                        <UploadCloud size={32} className="mb-2" />
                        <span className="text-sm font-bold">Click to upload image</span>
                        <span className="text-[10px] mt-1">JPG, PNG up to 5MB</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Dish Name</label>
                  <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-medium text-gray-800" placeholder="e.g. Butter Chicken" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Price (₹)</label>
                    <input required type="number" min="0" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-medium text-gray-800" placeholder="e.g. 450" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Category</label>
                    {!isCreatingNewCategory ? (
                      <select required value={newItem.category} onChange={(e) => {
                          if (e.target.value === "CREATE_NEW") setIsCreatingNewCategory(true);
                          else setNewItem({...newItem, category: e.target.value});
                        }} 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary font-medium text-gray-800"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="CREATE_NEW" className="font-bold text-brand-primary">+ Create New Category</option>
                      </select>
                    ) : (
                      <div className="relative">
                        <input autoFocus required type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-4 py-3 pr-10 bg-gray-50 border border-brand-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium text-gray-800" placeholder="New Category Name" />
                        <button type="button" onClick={() => setIsCreatingNewCategory(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X size={16}/></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <button type="submit" disabled={isAdding} className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                    {isAdding ? <><Loader2 className="animate-spin" size={18} /> Uploading & Saving...</> : "Publish Dish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}