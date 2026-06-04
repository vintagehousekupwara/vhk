"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function FrontendPopup() {
  const [popupData, setPopupData] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // 1. Listen for changes from Firebase in real-time
    const unsubscribe = onSnapshot(doc(db, "settings", "homepage"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.frontendPopup) {
          setPopupData(data.frontendPopup);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 2. Check if the popup is enabled and if the user has already closed it in this session
    const hasClosedPreviously = sessionStorage.getItem("vintagePopupClosed") === "true";

    if (popupData?.enabled && !hasClosedPreviously) {
      // 3. Apply the custom delay set by the admin
      const delayMs = (popupData.delay || 0) * 1000;
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, delayMs);
      
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [popupData]);

  const handleClose = () => {
    setShowPopup(false);
    // Mark as closed in the browser session so it doesn't annoy the user on every page load
    sessionStorage.setItem("vintagePopupClosed", "true"); 
  };

  if (!popupData) return null;

  return (
    <AnimatePresence>
      {showPopup && popupData.enabled && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          
          {/* Dark Blurred Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Luxury Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="relative w-full max-w-md md:max-w-lg bg-[#FAF8F5] rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col border border-[#DE9C3A]/30"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-[#DE9C3A] text-white rounded-full transition-colors duration-300"
              aria-label="Close Pop-up"
            >
              <X size={18} />
            </button>

            {/* Optional Image */}
            {popupData.image && (
              <div className="relative w-full h-48 sm:h-56 bg-gray-200">
                <Image 
                  src={popupData.image}
                  alt={popupData.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] to-transparent h-full" />
              </div>
            )}

            {/* Text & Button Content */}
            <div className={`p-8 text-center flex flex-col items-center ${!popupData.image ? 'pt-12' : 'pt-2'}`}>
              <span className="w-12 h-[1px] bg-[#DE9C3A] mb-4 block" />
              
              <h3 className="font-serif text-3xl md:text-4xl text-[#153932] mb-4 leading-tight">
                {popupData.title}
              </h3>
              
              <p className="text-gray-600 font-light leading-relaxed mb-8 text-sm md:text-base">
                {popupData.message}
              </p>
              
              {popupData.buttonText && popupData.buttonUrl && (
                <Link href={popupData.buttonUrl} onClick={handleClose} className="w-full">
                  <button className="w-full bg-[#153932] hover:bg-[#DE9C3A] text-white hover:text-[#153932] px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 rounded shadow-lg">
                    {popupData.buttonText}
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}