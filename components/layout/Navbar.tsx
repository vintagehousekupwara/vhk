"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Playfair_Display } from "next/font/google";

// Luxury font for the navigation items
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap" 
});

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Menu", path: "/menu" },
  { name: "About", path: "/about" },
];

const ADMIN_EMAILS = ["admin@thevintagehouse.com", "adminvintagesuperhouse@gmail.com"];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, userEmail } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          setIsAdmin(true);
          setUserName("Admin");
        } else {
          setIsAdmin(false);
          const firstName = user.displayName ? user.displayName.split(" ")[0] : "Guest";
          setUserName(firstName);
        }
      } else {
        setUserName(null);
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Detect Scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    if (mobileMenuOpen || isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen, isCartOpen]);

  const isActive = (path: string) => pathname === path;

  // Hide Navbar completely on Admin Routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <nav
        // OPTIMIZATION: Swapped motion.nav for standard nav for the root element, 
        // using pure CSS transitions for buttery smooth, hardware-accelerated scrolling.
        className={`fixed z-50 transition-all duration-300 ease-out left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-7xl rounded-2xl md:rounded-full ${
          isScrolled || mobileMenuOpen
            ? "top-4 bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_8px_20px_rgba(209,242,172,0.2)] py-2" 
            : "top-6 md:top-8 bg-white/30 backdrop-blur-sm border border-white/30 shadow-sm py-3 md:py-4"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
          
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center group shrink-0">
            <div className={`relative shrink-0 flex items-center justify-center transition-all duration-300 ease-out ${
              isScrolled 
                ? "w-[110px] h-[30px] md:w-[150px] md:h-[42px]" 
                : "w-[140px] h-[38px] md:w-[200px] md:h-[56px]"
            }`}>
              <Image 
                src="/logo-bg.png" 
                alt="The Vintage House" 
                fill 
                sizes="(max-width: 640px) 140px, (max-width: 768px) 200px, 200px"
                className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          <div className={`hidden md:flex items-center space-x-8 lg:space-x-10 ${playfair.className}`}>
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name}
                href={link.path} 
                className={`relative py-2 text-[15px] lg:text-base tracking-widest uppercase transition-colors group ${
                  isActive(link.path) ? "text-brand-primary font-semibold" : "text-brand-text hover:text-brand-primary font-medium"
                }`}
              >
                {link.name}
                <span className={`absolute left-0 bottom-0 h-[2px] bg-brand-primary transition-all duration-300 ease-out ${isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"}`}></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/book" className="hidden md:block">
              <button className="bg-brand-text text-[#FDFCF8] px-6 lg:px-8 py-2.5 rounded-full border border-brand-text hover:bg-brand-primary hover:border-brand-primary transition-colors duration-300 text-xs uppercase tracking-widest font-medium">
                Book Now
              </button>
            </Link>
            
            {!isAdmin && (
              <Link href="/auth" className="flex items-center">
                {mounted ? (
                  <div className={`flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-full transition-colors duration-300 ${userName ? 'bg-[#d1f2ac]/30 text-[#153932]' : 'bg-white/40 hover:bg-[#d1f2ac]/50 text-brand-text'}`} aria-label="Account">
                    <div className="relative flex items-center justify-center">
                      <User size={18} className="sm:w-5 sm:h-5" />
                      {userName && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d1f2ac] border border-white rounded-full"></span>}
                    </div>
                    {userName && <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">{userName}</span>}
                  </div>
                ) : (
                  <div className="w-9 h-9 md:w-24 md:h-9 rounded-full bg-white/40"></div>
                )}
              </Link>
            )}

            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-brand-text hover:text-brand-primary bg-white/40 hover:bg-[#d1f2ac]/50 rounded-full transition-colors flex items-center justify-center" aria-label="Open Cart">
              <ShoppingBag size={20} className="sm:w-5 sm:h-5" />
              {cartItemCount > 0 && mounted && (
                <span className="absolute -top-1 -right-1 bg-[#d1f2ac] text-[#153932] text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm border border-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              className={`md:hidden relative z-[60] p-1.5 shrink-0 rounded-full transition-colors ${mobileMenuOpen ? "bg-white/60 text-brand-text" : "bg-white/40 text-brand-text hover:bg-[#d1f2ac]/50"}`} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU EXPANDED (Highly Optimized) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay: Removed expensive blur, using simple opacity for max performance */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)} 
                className="fixed inset-0 bg-black/40 z-[50] w-screen h-screen -top-10 -left-[5vw]" 
              />
              
              <motion.div 
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="fixed top-0 right-0 h-screen w-[75%] sm:w-[50%] bg-[#FDFCF8] shadow-[-10px_0_40px_rgba(0,0,0,0.1)] border-l border-[#d1f2ac]/30 z-[55] overflow-hidden flex flex-col pt-32 px-8 -top-10"
              >
                {/* OPTIMIZATION: Zero-cost CSS radial gradients instead of heavy DOM animations */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_100%_0%,_#d1f2ac_0%,_transparent_60%),radial-gradient(circle_at_0%_100%,_#d1f2ac_0%,_transparent_60%)]"></div>

                <div className="relative z-10 flex flex-col space-y-8 mt-10">
                  {NAV_LINKS.map((link, index) => (
                    <motion.div key={link.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 + 0.1 }}>
                      <Link href={link.path} onClick={() => setMobileMenuOpen(false)} className={`text-3xl tracking-widest uppercase ${playfair.className} ${isActive(link.path) ? "text-brand-primary italic font-bold" : "text-brand-text font-medium"}`}>
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {!isAdmin && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: NAV_LINKS.length * 0.05 + 0.1 }}>
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 mt-4">
                        <div className="relative p-2 bg-white rounded-full shadow-sm border border-brand-secondary/20">
                          <User size={24} className="text-brand-text" />
                          {mounted && userName && <span className="absolute top-0 right-0 w-3 h-3 bg-[#d1f2ac] border-2 border-white rounded-full"></span>}
                        </div>
                        <span className={`text-xl tracking-widest uppercase ${playfair.className} ${mounted && userName ? "text-brand-text font-bold" : "text-brand-text"}`}>
                          {mounted && userName ? `Hi, ${userName}` : "Account"}
                        </span>
                      </Link>
                    </motion.div>
                  )}

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-8">
                    <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                      <button className="bg-brand-primary text-white w-full py-4 text-sm tracking-widest uppercase rounded-full font-bold shadow-md hover:bg-[#A65520] transition-colors">
                        Reserve Stay
                      </button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Slide-out Cart Sidebar (Highly Optimized) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay: Removed expensive blur */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/40 z-[90]" />
            
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 250 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FDFCF8] shadow-2xl z-[100] flex flex-col border-l border-[#d1f2ac]/50">
              <div className="p-5 md:p-6 border-b border-[#d1f2ac]/50 flex justify-between items-center bg-[#FDFCF8]">
                <h2 className={`text-2xl md:text-3xl text-brand-text flex items-center gap-2 ${playfair.className}`}>
                  <ShoppingBag className="text-brand-primary" /> Your Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[#d1f2ac]/50 rounded-full transition-colors text-brand-text" aria-label="Close Cart">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-brand-muted mt-20 flex flex-col items-center gap-4">
                    <ShoppingBag size={48} className="opacity-20" />
                    <p className="font-serif italic text-lg">Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-lg border border-[#d1f2ac]/30 shadow-sm">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xs md:text-sm text-brand-text line-clamp-1">{item.name}</h4>
                        <p className="text-brand-primary font-bold text-sm mb-2">₹{item.price}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#d1f2ac]/50 rounded px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-black p-1"><Minus size={14}/></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-black p-1"><Plus size={14}/></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!userEmail && !isAdmin && cart.length > 0 && (
                <div className="bg-[#d1f2ac]/20 border-y border-[#d1f2ac]/50 px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4">
                  <User size={20} className="text-brand-primary shrink-0 hidden sm:block" />
                  <div>
                    <p className="text-[10px] md:text-xs font-bold text-gray-800 uppercase tracking-widest mb-1">Don't lose your order!</p>
                    <Link href="/auth" onClick={() => setIsCartOpen(false)} className="text-[10px] text-brand-primary font-bold uppercase tracking-wider hover:underline">
                      Sign in to save your cart securely &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <div className="p-4 md:p-6 border-t border-[#d1f2ac]/50 bg-white pb-safe">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Subtotal</span>
                    <span className="text-xl md:text-2xl font-bold text-brand-text">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                    <button className="w-full bg-brand-primary text-white py-3 md:py-4 text-xs md:text-sm tracking-widest uppercase font-bold hover:bg-[#A65520] transition-colors rounded-lg shadow-md">
                      Proceed to Checkout
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}