"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SIGNATURE_DISHES } from "@/data/mockMenu";

export default function AnimatedRing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const ringItems = SIGNATURE_DISHES.slice(0, 5);

  // Added safer lg: sizes and pushed the massive sizes to xl:
  return (
    <div className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px] lg:w-[550px] lg:h-[550px] xl:w-[650px] xl:h-[650px] flex items-center justify-center group-ring">
      
      <style>{`
        .animate-spin-slow { animation: spin-slow 60s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 60s linear infinite; }
        
        .group-ring:hover .animate-spin-slow,
        .group-ring:hover .animate-spin-reverse {
          animation-play-state: paused;
        }

        @keyframes spin-slow { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        @keyframes spin-reverse { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(-360deg); } 
        }
      `}</style>

      {/* Adjusted inner image sizes for the new breakpoints */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-40 h-40 md:w-64 md:h-64 lg:w-[320px] lg:h-[320px] xl:w-[380px] xl:h-[380px] rounded-full overflow-hidden border-[6px] md:border-8 border-brand-bg shadow-2xl z-10"
      >
        <Image 
          src="https://res.cloudinary.com/dpqsadqxj/image/upload/q_auto/f_auto/v1780422252/Logowhite_zbzrpp.jpg" 
          alt="Luxury Hotel" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-text/10 rounded-full pointer-events-none" />
      </motion.div>

      <div className="absolute w-full h-full rounded-full border-[2px] border-brand-accent/20 border-dashed animate-spin-slow">
        {ringItems.map((item, index) => {
          const angle = (index / ringItems.length) * 360;
          
          return (
            <div
              key={item.id}
              className="absolute top-1/2 left-1/2 w-0 h-0"
              style={{ transform: `rotate(${angle}deg)` }} 
            >
              {/* Adjusted translation distances for the new lg: and xl: sizes */}
              <div className="absolute top-1/2 left-1/2 w-14 h-14 -ml-7 -mt-7 md:w-24 md:h-24 md:-ml-12 md:-mt-12 lg:w-24 lg:h-24 lg:-ml-12 lg:-mt-12 xl:w-28 xl:h-28 xl:-ml-14 xl:-mt-14 translate-x-[125px] md:translate-x-[220px] lg:translate-x-[250px] xl:translate-x-[280px]">
                
                <div className="w-full h-full relative animate-spin-reverse rounded-full bg-brand-secondary shadow-luxury border-2 md:border-4 border-brand-bg group cursor-pointer z-20 overflow-hidden">
                  <Link 
                    href={`/book?item=${encodeURIComponent(item.name)}`}
                    className="block w-full h-full relative"
                    title={`Reserve ${item.name}`}
                  >
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      fill
                      className="object-cover drop-shadow-lg scale-110 group-hover:scale-125 transition-transform duration-300 ease-out"
                    />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}