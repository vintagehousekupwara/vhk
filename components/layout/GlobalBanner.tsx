"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GlobalBanner() {
  const [bannerData, setBannerData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Real-time listener for instant updates
    const unsubscribe = onSnapshot(doc(db, "settings", "homepage"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.announcementBanner) {
          setBannerData(data.announcementBanner);
          // If admin toggles it back on, make it visible again
          if (data.announcementBanner.enabled) setIsVisible(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!bannerData || !bannerData.enabled || !isVisible) return null;

  return (
    <div 
      // w-full ensures maximum width, z-[100] forces it over ANY navbar
      className="relative w-full z-[100] px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 transition-all duration-500 shadow-md"
      style={{ backgroundColor: bannerData.bgColor, color: bannerData.textColor }}
    >
      <p className="text-xs sm:text-sm font-medium tracking-wide text-center">
        {bannerData.text}
      </p>
      
      {bannerData.linkText && bannerData.linkUrl && (
        <Link 
          href={bannerData.linkUrl} 
          className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:opacity-80 underline underline-offset-4 whitespace-nowrap"
        >
          {bannerData.linkText} <ArrowRight size={14} />
        </Link>
      )}

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
        aria-label="Close banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}