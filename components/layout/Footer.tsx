"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

// Raw custom SVGs for social icons
const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

export default function Footer() {
  const pathname = usePathname();
  
  // HIDE ON ADMIN ROUTES
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#0A0A0A] text-gray-300 border-t border-white/5 relative z-20 overflow-hidden">
      
      {/* Subtle background glow for premium depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-brand-primary/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 pt-20 pb-8">
        
        {/* PREMIUM CALL TO ACTION BAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between pb-16 border-b border-white/10 gap-8 text-center lg:text-left">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-3 tracking-wide">
              The <span className="text-brand-primary italic font-light">Vintage</span> Experience
            </h2>
            <p className="text-brand-primary tracking-widest uppercase text-xs font-bold">
              Stay • Dine • Celebrate
            </p>
          </div>
          
          <Link href="/book" className="shrink-0">
            <button className="group flex items-center justify-center gap-3 bg-brand-primary text-white px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#A65520] transition-all duration-300 shadow-luxury">
              Reserve Your Stay 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* REFINED 4-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 py-16">
          
          {/* Brand & Socials (Col 1) */}
          <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-3xl text-white mb-4">
              The<span className="text-brand-primary">Vintage</span>House
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm font-light">
              Redefining rustic elegance and world-class culinary mastery in the heart of the city. A sanctuary of luxury and comfort.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-11 h-11 rounded-full border border-gray-700 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary hover:text-white text-gray-400 transition-all duration-300">
                <InstagramIcon size={18} />
              </a>
              <a href="#" className="w-11 h-11 rounded-full border border-gray-700 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary hover:text-white text-gray-400 transition-all duration-300">
                <FacebookIcon size={18} />
              </a>
            </div>
          </div>

          {/* Contact Details (Col 2) */}
          <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-lg text-white mb-6 uppercase tracking-[0.15em]">Contact Us</h4>
            <ul className="space-y-5 text-sm text-gray-400 font-light w-full max-w-xs">
              <li className="flex items-start justify-center md:justify-start gap-4 hover:text-white transition-colors group cursor-default">
                <MapPin size={20} className="text-brand-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">Near JIC Branwari<br />Kupwara, Jammu & Kashmir<br/>193222</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-4 hover:text-white transition-colors group cursor-default">
                <Phone size={20} className="text-brand-primary shrink-0" />
                <span>+91 600 599 9400</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-4 hover:text-white transition-colors group cursor-default">
                <Mail size={20} className="text-brand-primary shrink-0" />
                <span>ventagehouse@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Hotel Links (Col 3) */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-lg text-white mb-6 uppercase tracking-[0.15em]">Hotel</h4>
            <ul className="space-y-4 text-xs tracking-widest uppercase text-gray-400 font-bold">
              <li><Link href="/#accommodations" className="hover:text-brand-primary transition-colors block">Our Suites</Link></li>
              <li><Link href="/about" className="hover:text-brand-primary transition-colors block">Amenities</Link></li>
              <li><Link href="/book" className="hover:text-brand-primary transition-colors block">Book a Stay</Link></li>
            </ul>
          </div>

          {/* Dining Links (Col 4) */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-serif text-lg text-white mb-6 uppercase tracking-[0.15em]">Dining</h4>
            <ul className="space-y-4 text-xs tracking-widest uppercase text-gray-400 font-bold">
              <li><Link href="/menu" className="hover:text-brand-primary transition-colors block">Full Menu</Link></li>
              <li><Link href="/about" className="hover:text-brand-primary transition-colors block">The Chef</Link></li>
              <li><Link href="/book" className="hover:text-brand-primary transition-colors block">Reserve Table</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="w-full border-t border-white/10 pt-8 mt-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} The Vintage House Kupwara. All rights reserved.
          </p>
          
          <div className="flex gap-6 text-xs tracking-wider text-gray-500 font-medium uppercase">
            <Link href="/terms" className="hover:text-brand-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-brand-primary transition-colors">Privacy</Link>
          </div>

          <p className="text-xs text-gray-500 tracking-wide">
            Designed and Developed by <a href="mailto:officialhaadi81@gmail.com" className="text-brand-primary font-bold hover:underline tracking-widest uppercase ml-1">H Studio</a>
          </p>
        </div>
      </div>
    </footer>
  );
}