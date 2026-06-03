"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Rooms", path: "/rooms" },
  { name: "Menu", path: "/menu" },
  { name: "About", path: "/about" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, userEmail } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Detect scroll to apply frosted glass effect
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Lock body scroll when mobile menu or cart is open
  useEffect(() => {
    if (mobileMenuOpen || isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen, isCartOpen]);

  const isActive = (path: string) => pathname === path;

  // 👉 MOVED HERE: Must be AFTER all hooks but BEFORE the return!
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full max-w-[100vw] ${
          isScrolled || mobileMenuOpen
            ? "bg-brand-bg/95 backdrop-blur-lg border-b border-brand-secondary py-3 shadow-sm" 
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-between items-center w-full">
          
          {/* Logo Section */}
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-brand-primary/50 group-hover:border-brand-primary transition-colors shrink-0">
              <Image 
                src="https://res.cloudinary.com/dpqsadqxj/image/upload/q_auto/f_auto/v1780422252/Logowhite_zbzrpp.jpg" 
                alt="TheVintageHouse Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-wider text-brand-text group-hover:text-brand-primary transition-colors whitespace-nowrap">
                The<span className="text-brand-primary group-hover:text-brand-text transition-colors">Vintage</span>House
              </h1>
              <span className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-brand-muted mt-0.5">
                Hotel & Restaurant
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-10 text-sm font-medium tracking-widest uppercase">
            {NAV_LINKS.map((link, index) => (
              <motion.div 
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                <Link 
                  href={link.path} 
                  className={`relative py-2 transition-colors ${isActive(link.path) ? "text-brand-primary" : "text-brand-text hover:text-brand-primary"}`}
                >
                  {link.name}
                  <span className={`absolute left-0 bottom-0 h-[2px] bg-brand-primary transition-all duration-300 ease-out ${isActive(link.path) ? "w-full" : "w-0 group-hover:w-full hover:w-full"}`}></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons (Cart, Account, CTA, Hamburger) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-2 sm:gap-4 shrink-0"
          >
            {/* Desktop Only CTA */}
            <Link href="/book" className="hidden md:block">
              <button className="bg-brand-text text-brand-bg px-6 lg:px-8 py-3 rounded-none border border-brand-text hover:bg-brand-primary hover:border-brand-primary transition-all duration-300 text-sm uppercase tracking-widest font-medium overflow-hidden relative group">
                <span className="relative z-10">Book Now</span>
                <div className="absolute inset-0 h-full w-0 bg-brand-primary transition-all duration-300 ease-out group-hover:w-full z-0"></div>
              </button>
            </Link>
            
            {/* Desktop Only Account Icon */}
            <Link href="/auth" className="hidden md:block">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center p-3 rounded-full bg-brand-secondary/30 hover:bg-brand-primary text-brand-text hover:text-white border border-transparent hover:border-brand-primary transition-all duration-300"
                aria-label="Account"
              >
                <User size={20} />
              </motion.button>
            </Link>

            {/* Global Cart Icon (Visible on Mobile & Desktop) */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 text-brand-text hover:text-brand-primary transition-colors flex items-center justify-center"
              aria-label="Cart"
            >
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              className="md:hidden text-brand-text relative z-[60] p-1 shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </motion.div>
        </div>

        {/* Fullscreen Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-brand-bg flex flex-col items-center justify-center space-y-8 z-[55] overflow-y-auto py-20 min-h-screen"
            >
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Link 
                    href={link.path} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`text-3xl font-serif tracking-wider ${isActive(link.path) ? "text-brand-primary italic" : "text-brand-text"}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.1 + 0.2 }}
              >
                <Link 
                  href="/auth" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`flex items-center gap-3 text-3xl font-serif tracking-wider ${isActive("/auth") ? "text-brand-primary italic" : "text-brand-text"}`}
                >
                  <User size={28} className={isActive("/auth") ? "text-brand-primary" : "text-brand-text"} /> Account
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-8"
              >
                <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                  <button className="bg-brand-primary text-white px-10 py-4 text-sm tracking-widest uppercase font-bold shadow-luxury">
                    Reserve Experience
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Slide-out Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsCartOpen(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" 
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[100] flex flex-col border-l border-brand-secondary"
            >
              
              <div className="p-6 border-b border-brand-secondary flex justify-between items-center bg-brand-bg">
                <h2 className="font-serif text-2xl text-brand-text flex items-center gap-2">
                  <ShoppingBag className="text-brand-primary" /> Your Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-brand-text">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-bg/50">
                {cart.length === 0 ? (
                  <div className="text-center text-brand-muted mt-20 flex flex-col items-center gap-4">
                    <ShoppingBag size={48} className="opacity-20" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-lg border border-brand-secondary shadow-sm">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-brand-text line-clamp-1">{item.name}</h4>
                        <p className="text-brand-primary font-bold text-sm mb-2">₹{item.price}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-black"><Minus size={14}/></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-500 hover:text-black"><Plus size={14}/></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ADD THIS NEW GUEST WARNING BANNER */}
              {!userEmail && cart.length > 0 && (
                <div className="bg-brand-primary/10 border-y border-brand-primary/20 px-6 py-4 flex items-center gap-4">
                  <User size={20} className="text-brand-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-1">Don't lose your order!</p>
                    <Link href="/auth" onClick={() => setIsCartOpen(false)} className="text-[10px] text-brand-primary font-bold uppercase tracking-wider hover:underline underline-offset-2">
                      Sign in to save your cart securely &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <div className="p-6 border-t border-brand-secondary bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Subtotal</span>
                    <span className="text-2xl font-bold text-brand-text">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                    <button className="w-full bg-brand-primary text-white py-4 text-sm tracking-widest uppercase font-bold hover:bg-[#A65520] transition-colors shadow-luxury rounded-lg">
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