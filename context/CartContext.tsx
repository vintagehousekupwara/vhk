"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";

type CartItem = {
  id: string; name: string; price: number; image: string; quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, amount: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  userEmail: string | null; // <-- Added this to check if guest
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initialize Auth and Load Cart Safely
  useEffect(() => {
    // Instantly load local cart to prevent overwriting
    const local = localStorage.getItem("vintage_cart");
    let initialCart: CartItem[] = [];
    if (local) {
      initialCart = JSON.parse(local);
      setCart(initialCart);
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
        const docRef = doc(db, "carts", user.email);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().items?.length > 0) {
          // If Firebase has a saved cart, use it
          setCart(docSnap.data().items);
        } else if (initialCart.length > 0) {
          // If Firebase is empty but they added items as a guest, sync them up!
          await setDoc(docRef, { items: initialCart }, { merge: true });
        }
      } else {
        setUserEmail(null);
      }
      setIsInitialized(true); // Unlock saving mechanism
    });
    
    return () => unsubscribe();
  }, []);

  // 2. Sync Cart Changes (Only after initialization)
  useEffect(() => {
    if (!isInitialized) return; 
    
    if (userEmail) {
      // Save to Firebase
      setDoc(doc(db, "carts", userEmail), { items: cart }, { merge: true })
        .catch(err => console.error("Firebase sync error:", err));
    } else {
      // Save to long-term Cache
      localStorage.setItem("vintage_cart", JSON.stringify(cart));
    }
  }, [cart, userEmail, isInitialized]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 }];
    });
    setIsCartOpen(true); 
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, amount: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, userEmail }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};