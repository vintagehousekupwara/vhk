"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function MenuClient({ dishes }: { dishes: any[] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();
  const router = useRouter();

  const CATEGORIES = ["All", ...Array.from(new Set(dishes.map(item => item.category)))];

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = activeFilter === "All" || dish.category === activeFilter;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (dish.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuyNow = (dish: any) => {
    addToCart(dish);
    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-brand-bg pt-20 pb-24 px-4 md:px-6 lg:px-24">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto text-center mb-10 mt-10">
        <span className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 block">
          Room Service & Dining
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-brand-text mb-4">Culinary Masterpieces</h1>
        <p className="text-brand-muted text-sm md:text-lg leading-relaxed">
          Select a dish to begin your order.
        </p>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="max-w-7xl mx-auto mb-16 space-y-8">
        <div className="max-w-md mx-auto relative flex items-center">
          <Search size={18} className="absolute left-4 text-brand-accent" />
          <input 
            type="text" 
            placeholder="Search our menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-secondary focus:border-brand-primary focus:outline-none text-brand-text shadow-sm" 
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat as string}
              onClick={() => setActiveFilter(cat as string)}
              className={`px-6 py-2 md:px-8 md:py-3 uppercase tracking-widest text-[10px] md:text-xs font-bold transition-all duration-300 border ${
                activeFilter === cat 
                  ? "bg-brand-primary text-white border-brand-primary shadow-luxury" 
                  : "bg-transparent text-brand-text border-brand-secondary hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              {cat as string}
            </button>
          ))}
        </div>
      </div>

      {/* DISHES GRID */}
      <motion.div layout className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16">
        <AnimatePresence mode="popLayout">
          {filteredDishes.map((dish) => (
            <motion.div
              key={dish.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative bg-white rounded-t-[40px] md:rounded-t-[80px] rounded-b-xl p-3 md:p-5 pt-12 md:pt-20 shadow-sm hover:shadow-floating transition-shadow duration-300 border border-brand-secondary flex flex-col items-center text-center mt-6 md:mt-10"
            >
              <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full z-10">
                <Image src={dish.image} alt={dish.name} fill sizes="(max-width: 768px) 80px, 128px" className="object-cover drop-shadow-xl rounded-full" />
              </div>
              
              <span className="text-brand-primary text-[9px] md:text-[10px] uppercase tracking-widest font-bold mb-1 block">{dish.category}</span>
              <h4 className="font-serif text-sm md:text-lg text-brand-text font-bold mb-1 line-clamp-1">{dish.name}</h4>
              
              <div className="flex items-center gap-1 text-brand-accent mb-3">
                <Star size={10} className="fill-brand-accent md:w-3 md:h-3" />
                <span className="text-[10px] md:text-xs font-medium">{dish.rating}</span>
              </div>

              <p className="text-brand-muted text-xs mb-4 line-clamp-2 hidden md:block flex-grow">{dish.description}</p>
              
              <div className="mt-auto w-full flex items-center justify-between border-t border-brand-secondary pt-3 md:pt-4">
                <span className="font-serif text-base md:text-xl font-bold text-brand-primary">₹{dish.price}</span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => addToCart(dish)}
                    className="p-1.5 md:p-2 border border-brand-secondary text-brand-text hover:bg-brand-bg hover:text-brand-primary rounded transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingCart size={16} />
                  </button>

                  <button 
                    onClick={() => handleBuyNow(dish)}
                    className="bg-brand-primary text-white text-[10px] md:text-xs px-3 py-1.5 md:px-4 md:py-2 rounded uppercase tracking-widest font-bold hover:bg-[#A65520] transition-colors whitespace-nowrap"
                  >
                    Order Now
                  </button>
                </div>
                
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}