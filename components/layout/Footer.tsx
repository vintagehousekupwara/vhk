"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <footer className="w-full relative z-20 mt-20 border-t border-gray-200">
      
      {/* 
        LIGHT SECTION 
        Elegant ivory background where the dark logo stands out beautifully
      */}
      <div className="bg-brand-secondary text-[#153932] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Top Banner with Logo and CTA */}
          <div className="flex flex-col lg:flex-row items-center justify-between pb-12 border-b border-[#153932]/10 gap-8 text-center lg:text-left">
            
            {/* WIDE LOGO PLACEMENT */}
            <div className="flex flex-col items-center lg:items-start">
              <Link href="/" className="inline-block relative w-[200px] h-[55px] md:w-[280px] md:h-[76px] mb-3">
                <Image 
                  src="/logo-bg.png" 
                  alt="The Vintage House Kupwara" 
                  fill 
                  sizes="(max-width: 768px) 200px, 280px"
                  // scale-[1.15] expands it past invisible transparent edges, origin sets the zoom anchor
                  className="object-contain scale-[1.15] md:origin-left origin-center"
                />
              </Link>
              <p className="text-[#DE9C3A] tracking-widest uppercase text-xs font-bold mt-2">
                Stay • Dine • Celebrate
              </p>
            </div>
            
            <Link href="/book" className="shrink-0">
              <button className="group flex items-center justify-center gap-3 bg-[#153932] text-white px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#DE9C3A] hover:text-[#153932] transition-all duration-300 shadow-xl">
                Reserve Your Stay 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 py-16">
            
            {/* Brand Description & Socials */}
            <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="font-serif text-2xl font-bold text-[#153932] mb-4">
                Redefining Elegance.
              </h3>
              <p className="text-[#153932]/70 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                Redefining rustic elegance and world-class culinary mastery in the heart of the city. A sanctuary of luxury and comfort tailored for your perfect getaway.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex space-x-3">
                  <a 
                    href="https://www.instagram.com/vintagehousekupwara" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-11 h-11 rounded-full border border-[#153932]/20 flex items-center justify-center text-[#153932] hover:bg-[#DE9C3A] hover:border-[#DE9C3A] hover:text-white transition-all duration-300 shadow-sm"
                    aria-label="Follow us on Instagram"
                  >
                    <InstagramIcon size={18} />
                  </a>
                  <a 
                    href="https://www.facebook.com/MrSuhailwar" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-11 h-11 rounded-full border border-[#153932]/20 flex items-center justify-center text-[#153932] hover:bg-[#DE9C3A] hover:border-[#DE9C3A] hover:text-white transition-all duration-300 shadow-sm"
                    aria-label="Follow us on Facebook"
                  >
                    <FacebookIcon size={18} />
                  </a>
                </div>
                
                <div className="px-3 py-1.5 bg-[#DE9C3A]/10 border border-[#DE9C3A]/30 rounded-full flex items-center group cursor-default">
                  <span className="text-[#DE9C3A] text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DE9C3A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DE9C3A]"></span>
                    </span>
                    12k+ Followers
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="font-serif text-lg font-bold text-[#153932] mb-6 uppercase tracking-[0.15em]">Contact Us</h4>
              <ul className="space-y-5 text-sm text-[#153932]/80 font-medium w-full max-w-xs">
                <li className="flex items-start justify-center md:justify-start gap-4 hover:text-[#DE9C3A] transition-colors group cursor-default">
                  <MapPin size={20} className="text-[#DE9C3A] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Near JIC Branwari<br />Kupwara, Jammu & Kashmir<br/>193222</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-4 hover:text-[#DE9C3A] transition-colors group cursor-default">
                  <Phone size={20} className="text-[#DE9C3A] shrink-0" />
                  <span>+91 600 599 9400</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-4 hover:text-[#DE9C3A] transition-colors group cursor-default">
                  <Mail size={20} className="text-[#DE9C3A] shrink-0" />
                  <span>ventagehouse@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Hotel Links */}
            <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="font-serif text-lg font-bold text-[#153932] mb-6 uppercase tracking-[0.15em]">Hotel</h4>
              <ul className="space-y-4 text-xs tracking-widest uppercase text-[#153932]/70 font-bold">
                <li><Link href="/#accommodations" className="hover:text-[#DE9C3A] transition-colors block">Our Suites</Link></li>
                <li><Link href="/about" className="hover:text-[#DE9C3A] transition-colors block">Amenities</Link></li>
                <li><Link href="/book" className="hover:text-[#DE9C3A] transition-colors block">Book a Stay</Link></li>
              </ul>
            </div>

            {/* Dining Links */}
            <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="font-serif text-lg font-bold text-[#153932] mb-6 uppercase tracking-[0.15em]">Dining</h4>
              <ul className="space-y-4 text-xs tracking-widest uppercase text-[#153932]/70 font-bold">
                <li><Link href="/menu" className="hover:text-[#DE9C3A] transition-colors block">Full Menu</Link></li>
                <li><Link href="/about" className="hover:text-[#DE9C3A] transition-colors block">The Chef</Link></li>
                <li><Link href="/book" className="hover:text-[#DE9C3A] transition-colors block">Reserve Table</Link></li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>

      {/* 
        DARK SECTION 
        Bottom Legal & Copyright Bar
      */}
      <div className="w-full bg-[#153932] border-t-4 border-[#DE9C3A] py-5 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-white font-medium">
          <p className="text-xs tracking-wide text-[#DE9C3A] text-center md:text-left">
            &copy; {new Date().getFullYear()} The Vintage House Kupwara. All rights reserved.
          </p>
          
          {/* Preserved Legal & Refund Policy Links */}
          <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs tracking-wider uppercase flex-wrap justify-center text-gray-300">
            <Link href="/terms" className="hover:text-[#DE9C3A] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#DE9C3A] transition-colors">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-[#DE9C3A] transition-colors">Refund Policy</Link>
          </div>

          <p className="text-[10px] md:text-xs tracking-wide text-gray-400 text-center md:text-right">
            Designed and Developed by <a href="https://haadi.publicvm.com/landing" target="_blank" rel="noopener noreferrer" className="font-bold text-[#DE9C3A] hover:text-white transition-colors tracking-widest uppercase ml-1">H Studio</a>
          </p>
        </div>
      </div>
    </footer>
  );
}