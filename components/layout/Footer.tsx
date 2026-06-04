"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

export default function Footer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Wait until hydration is complete before rendering path-dependent logic
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#153932] text-gray-200 relative z-20 mt-20">
      
      <div className="absolute top-0 left-0 w-full overflow-hidden -translate-y-[99%] leading-none pointer-events-none z-10">
        <svg
          className="w-full h-12 md:h-20 lg:h-28"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path 
            fill="#153932" 
            d="M0,128L80,122.7C160,117,320,107,480,128C640,149,800,203,960,202.7C1120,203,1280,149,1360,122.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.07] z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1="30%" y1="100%" x2="80%" y2="-20%" stroke="white" strokeWidth="1.5" />
          <line x1="70%" y1="120%" x2="50%" y2="0%" stroke="white" strokeWidth="1.5" />
          <line x1="60%" y1="40%" x2="110%" y2="90%" stroke="white" strokeWidth="1.5" />
          <line x1="-10%" y1="80%" x2="50%" y2="120%" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row items-center justify-between pb-12 border-b border-white/10 gap-8 text-center lg:text-left">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-3 tracking-wide">
              The <span className="text-[#DE9C3A] italic font-light">Vintage</span> Experience
            </h2>
            <p className="text-[#DE9C3A] tracking-widest uppercase text-xs font-bold">
              Stay • Dine • Celebrate
            </p>
          </div>
          
          <Link href="/book" className="shrink-0">
            <button className="group flex items-center justify-center gap-3 bg-[#DE9C3A] text-[#153932] px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white transition-all duration-300 shadow-luxury">
              Reserve Your Stay 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 py-16">
          <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-3xl text-white mb-4">
              The<span className="text-[#DE9C3A]">Vintage</span>House
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-sm font-light">
              Redefining rustic elegance and world-class culinary mastery in the heart of the city. A sanctuary of luxury and comfort.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-11 h-11 rounded-full border border-gray-500 flex items-center justify-center hover:bg-[#DE9C3A] hover:border-[#DE9C3A] hover:text-[#153932] text-gray-300 transition-all duration-300">
                <InstagramIcon size={18} />
              </a>
              <a href="#" className="w-11 h-11 rounded-full border border-gray-500 flex items-center justify-center hover:bg-[#DE9C3A] hover:border-[#DE9C3A] hover:text-[#153932] text-gray-300 transition-all duration-300">
                <FacebookIcon size={18} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-lg text-white mb-6 uppercase tracking-[0.15em]">Contact Us</h4>
            <ul className="space-y-5 text-sm text-gray-300 font-light w-full max-w-xs">
              <li className="flex items-start justify-center md:justify-start gap-4 hover:text-white transition-colors group cursor-default">
                <MapPin size={20} className="text-[#DE9C3A] shrink-0 mt-0.5" />
                <span className="leading-relaxed">Near JIC Branwari<br />Kupwara, Jammu & Kashmir<br/>193222</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-4 hover:text-white transition-colors group cursor-default">
                <Phone size={20} className="text-[#DE9C3A] shrink-0" />
                <span>+91 600 599 9400</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-4 hover:text-white transition-colors group cursor-default">
                <Mail size={20} className="text-[#DE9C3A] shrink-0" />
                <span>ventagehouse@gmail.com</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-lg text-white mb-6 uppercase tracking-[0.15em]">Hotel</h4>
            <ul className="space-y-4 text-xs tracking-widest uppercase text-gray-300 font-bold">
              <li><Link href="/#accommodations" className="hover:text-[#DE9C3A] transition-colors block">Our Suites</Link></li>
              <li><Link href="/about" className="hover:text-[#DE9C3A] transition-colors block">Amenities</Link></li>
              <li><Link href="/book" className="hover:text-[#DE9C3A] transition-colors block">Book a Stay</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-lg text-white mb-6 uppercase tracking-[0.15em]">Dining</h4>
            <ul className="space-y-4 text-xs tracking-widest uppercase text-gray-300 font-bold">
              <li><Link href="/menu" className="hover:text-[#DE9C3A] transition-colors block">Full Menu</Link></li>
              <li><Link href="/about" className="hover:text-[#DE9C3A] transition-colors block">The Chef</Link></li>
              <li><Link href="/book" className="hover:text-[#DE9C3A] transition-colors block">Reserve Table</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#DE9C3A] py-5 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#153932] font-semibold">
          <p className="text-xs tracking-wide">
            &copy; {new Date().getFullYear()} The Vintage House Kupwara. All rights reserved.
          </p>
          
          <div className="flex gap-6 text-xs tracking-wider uppercase">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>

          <p className="text-xs tracking-wide">
            Designed and Developed by <a href="https://haadi.publicvm.com/landing" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-white hover:underline tracking-widest uppercase ml-1">H Studio</a>
          </p>
        </div>
      </div>
    </footer>
  );
}