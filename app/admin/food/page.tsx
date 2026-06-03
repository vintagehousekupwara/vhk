"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Plus, Trash2, ImagePlus } from "lucide-react";

export default function AdminFoodPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "", category: "Signature", price: "", rating: "4.5", description: "", image: ""
  });

// Fetch real data on load
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const data = querySnapshot.docs.map(doc => ({ 
      ...doc.data(), // Spread the database data FIRST
      id: doc.id     // Force the ID to be the real Firestore string SECOND
    }));
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  // Save to Firebase
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.image) return alert("Please upload an image first!");
    
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewProduct({ name: "", category: "Signature", price: "", rating: "4.5", description: "", image: "" });
      fetchProducts(); // Refresh list
    } catch (error) {
      alert("Error adding product. Check Firebase rules.");
    }
  };

  // Delete from Firebase
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this dish?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter(p => p.id !== id));
    }
  };

  if (loading) return <div className="p-10 text-brand-muted">Loading inventory...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Food Inventory</h2>
          <p className="text-gray-500 text-sm">Manage restaurant menu items and images.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-[#A65520] transition-colors"
        >
          <Plus size={18} /> {isAdding ? "Cancel" : "Add New Dish"}
        </button>
      </div>

      {/* ADD NEW PRODUCT FORM */}
      {isAdding && (
        <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Dish Name</label>
              <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Category</label>
              <input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" placeholder="e.g. Signature, Dessert" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Price ($)</label>
              <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Rating</label>
              <input required type="text" value={newProduct.rating} onChange={e => setNewProduct({...newProduct, rating: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg" />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Description</label>
            <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg h-24" />
          </div>

          {/* CLOUDINARY UPLOAD WIDGET */}
         <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center">
            {newProduct.image ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <Image 
                  src={newProduct.image} 
                  alt="Preview" 
                  fill 
                  sizes="128px" // Fixes the Image warning
                  className="object-cover" 
                />
              </div>
            ) : (
              <CldUploadWidget 
                uploadPreset="thevintagehousekupwara"
                onSuccess={(result: any) => {
                  setNewProduct({ ...newProduct, image: result.info.secure_url });
                  // FORCE SCROLL TO UNLOCK:
                  document.body.style.overflow = 'auto';
                }}
                onClose={() => {
                  // IN CASE USER CANCELS:
                  document.body.style.overflow = 'auto';
                }}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()} className="flex flex-col items-center text-brand-primary hover:text-[#A65520] transition-colors">
                    <ImagePlus size={40} className="mb-2" />
                    <span className="font-bold">Upload Dish Image</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-green-700 transition-colors">
            Save Product to Database
          </button>
        </form>
      )}

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((dish) => (
          <div key={dish.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4">
              <Image src={dish.image} alt={dish.name} fill className="object-cover" />
            </div>
            <span className="text-[10px] uppercase text-brand-primary font-bold">{dish.category}</span>
            <h4 className="font-bold text-gray-800 line-clamp-1 mb-1">{dish.name}</h4>
            <p className="text-gray-500 font-serif mb-4">${dish.price}</p>
            
            <button 
              onClick={() => handleDelete(dish.id)}
              className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}