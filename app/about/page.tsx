"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Wifi,
  Car,
  Utensils,
  Users,
  Building,
  MapPin,
  BedDouble,
  CalendarDays,
  Quote
} from "lucide-react";

// --- Custom Hook for Number Counting Animation ---
const AnimatedCounter = ({ value, duration = 2000, suffix = "" }: { value: number, duration?: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// --- Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function AboutPage() {
  const facilities = [
    { icon: <Building size={28} />, title: "9 Premium Rooms", desc: "Luxury AC & Non-AC rooms designed for absolute comfort and relaxation." },
    { icon: <Users size={28} />, title: "Conference Hall", desc: "Professional, fully air-conditioned spaces for corporate meetings and events." },
    { icon: <Utensils size={28} />, title: "Family Dining", desc: "Elegant dining halls crafted for families, large groups, and celebrations." },
    { icon: <Car size={28} />, title: "Spacious Parking", desc: "Highly secure and expansive parking facility available for all our guests." },
    { icon: <Wifi size={28} />, title: "High-Speed WiFi", desc: "Seamless and reliable complimentary internet access throughout the property." },
    { icon: <MapPin size={28} />, title: "Prime Location", desc: "Conveniently situated near JIC Branwari, Kupwara for easy accessibility." },
    { icon: <ShieldCheck size={28} />, title: "Secure Environment", desc: "Located in one of the safest districts, featuring 24/7 security protocols." },
    { icon: <BedDouble size={28} />, title: "Luxury Accommodation", desc: "Thoughtfully curated aesthetics for both business and leisure travelers." },
  ];

  return (
    <main className="min-h-screen bg-brand-bg pt-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* New Premium Image */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000&auto=format&fit=crop"
            alt="The Vintage House Luxury Interior"
            fill
            priority
            className="object-cover"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-bg/95" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 text-center px-6 max-w-5xl mt-20"
        >
          <motion.span variants={fadeInUp} className="flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-brand-primary text-xs md:text-sm font-bold mb-4">
            <span className="w-8 h-[1px] bg-brand-primary"></span>
            Discover Our Legacy
            <span className="w-8 h-[1px] bg-brand-primary"></span>
          </motion.span>

          <motion.h1 variants={fadeInUp} className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[1.1] drop-shadow-lg">
            The Story Behind <br className="hidden md:block" />
            <span className="italic text-brand-secondary font-light">The Vintage House</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-gray-300 max-w-2xl mx-auto text-base md:text-xl font-light leading-relaxed">
            A destination where exceptional hospitality, luxury accommodation, and unforgettable culinary artistry come together in the heart of Kupwara.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. THE VISION (ABOUT) */}
      <section className="py-24 md:py-32 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <div>
              <motion.span variants={fadeInUp} className="uppercase tracking-[0.2em] text-brand-primary text-xs font-bold block mb-3">
                Our Philosophy
              </motion.span>
              <motion.h2 variants={fadeInUp} className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-text leading-tight mb-6">
                Redefining <span className="italic font-light">Luxury</span> & Hospitality.
              </motion.h2>
              <motion.div variants={fadeInUp} className="w-20 h-[2px] bg-brand-primary" />
            </div>

            <motion.div variants={fadeInUp} className="space-y-6 text-brand-muted text-base md:text-lg font-light leading-relaxed">
              <p>
                Located perfectly near JIC Branwari, The Vintage House is Kupwara's premier destination designed to provide guests with an elevated, uncompromising hospitality experience. Since our grand inauguration on <strong className="text-brand-text font-medium">11 July 2024</strong>, we have opened our doors to travelers, business professionals, and families seeking refined comfort.
              </p>
              <p>
                Combining elegant vintage aesthetics with modern amenities, we have quickly established ourselves as the gold standard of hospitality in North Kashmir. From our meticulously designed suites to our state-of-the-art dining halls, every square foot is curated for your absolute comfort.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 gap-6"
          >
            <div className="bg-white p-10 md:p-12 border border-brand-secondary/30 shadow-luxury rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <h3 className="font-serif text-3xl text-brand-text mb-4">Our Mission</h3>
              <p className="text-brand-muted font-light leading-relaxed">
                To deliver world-class service, premium accommodations, and unforgettable dining experiences. We aim to anticipate every need, ensuring that every guest who walks through our doors feels completely at home.
              </p>
            </div>

            <div className="bg-white p-10 md:p-12 border border-brand-secondary/30 shadow-luxury rounded-2xl relative overflow-hidden group ml-0 lg:ml-12">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <h3 className="font-serif text-3xl text-brand-text mb-4">Our Vision</h3>
              <p className="text-brand-muted font-light leading-relaxed">
                To be the most trusted and celebrated hotel in Kupwara. We envision setting the benchmark for luxury and customer satisfaction throughout the entirety of North Kashmir.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. FOUNDER's NOTE */}
      <section className="py-24 bg-white border-y border-brand-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Quote className="w-16 h-16 mx-auto text-brand-primary/20 mb-8" />
            <h2 className="font-serif text-3xl md:text-5xl text-brand-text mb-10 leading-tight">
              "A sanctuary built on the foundations of <span className="italic text-brand-primary">Kashmiri warmth</span> and uncompromising modern luxury."
            </h2>
            
            <p className="text-brand-muted md:text-lg font-light leading-relaxed mb-12">
              When we first envisioned The Vintage House, our goal was remarkably simple yet deeply ambitious: to create a space in Kupwara that offers world-class hospitality without losing the soul of our local culture. Every corner of this property—from our premium suites to the culinary creations in our kitchen—has been crafted with profound attention to detail. We invite you to step inside, relax, and allow our dedicated team to make your stay truly exceptional.
            </p>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-[1px] bg-gray-300 mb-6" />
              <h4 className="font-serif text-2xl text-brand-text font-bold">The Management</h4>
              <p className="text-xs tracking-[0.2em] text-brand-primary uppercase mt-2 font-bold">Founders, The Vintage House</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. ANIMATED STATS */}
      <section className="py-20 bg-brand-text text-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-10 text-center divide-x divide-white/10">
            <div className="flex flex-col items-center">
              <h3 className="text-5xl md:text-6xl font-serif text-brand-secondary mb-3">
                <AnimatedCounter value={9} />
              </h3>
              <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">Premium Suites</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-5xl md:text-6xl font-serif text-brand-secondary mb-3">
                <AnimatedCounter value={13} />
              </h3>
              <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">Dedicated Staff</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-5xl md:text-6xl font-serif text-brand-secondary mb-3">
                <AnimatedCounter value={2024} duration={1500} />
              </h3>
              <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">Established</p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-5xl md:text-6xl font-serif text-brand-secondary mb-3 flex items-center">
                <AnimatedCounter value={24} duration={1000} />
                <span className="text-3xl md:text-4xl text-brand-secondary ml-1">/7</span>
              </h3>
              <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">Guest Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FACILITIES */}
      <section className="py-24 md:py-32 px-6 lg:px-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="uppercase tracking-[0.3em] text-brand-primary text-xs font-bold">What We Offer</span>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-text mt-4 mb-6">Premium Amenities</h2>
            <p className="text-brand-muted max-w-2xl mx-auto font-light md:text-lg">
              Designed to exceed the expectations of modern travelers, families, and business professionals seeking ultimate convenience.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {facilities.map((fac, index) => (
              <motion.div
                variants={fadeInUp}
                key={index}
                className="bg-brand-bg/50 p-8 rounded-2xl border border-brand-secondary/50 hover:shadow-floating hover:bg-white transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-brand-secondary shadow-sm flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                  {fac.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-text mb-3">{fac.title}</h3>
                <p className="text-sm text-brand-muted font-light leading-relaxed">{fac.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="relative py-32 bg-brand-text text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {/* Subtle background texture */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#DE9C3A 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center px-6 relative z-10"
        >
          <CalendarDays size={48} className="mx-auto mb-8 text-brand-secondary" />
          <h2 className="font-serif text-4xl md:text-6xl mb-6 leading-tight">
            Experience The Standard <br/> of Excellence
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Whether you are looking for a comfortable stay, an elegant dining experience, or a professional event venue, we are ready to welcome you.
          </p>

          <Link href="/book">
            <button className="bg-brand-primary hover:bg-white text-white hover:text-brand-text px-10 py-5 uppercase tracking-[0.2em] text-sm font-bold transition-all duration-300 shadow-luxury rounded-sm">
              Reserve Your Experience
            </button>
          </Link>
        </motion.div>
      </section>
      
    </main>
  );
}