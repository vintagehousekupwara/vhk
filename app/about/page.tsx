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

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

// --- SEO Optimized Gallery Images Array ---
const galleryImages = [
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575946/photo_5_2026-06-04_17-54-19_z17fwv.jpg", 
    alt: "The Vintage House Kupwara - Luxury Hotel Rooms and Premium Suites View" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575946/photo_2_2026-06-04_17-54-19_li2lgx.jpg", 
    alt: "Vintage House Kupwara - Premium Accommodation and Hospitality in North Kashmir" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575946/photo_1_2026-06-04_17-54-19_vvhry1.jpg", 
    alt: "Vintage Kupwara - Best Hotel in Kupwara Experience and Services" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575945/photo_3_2026-06-04_17-54-19_fhviaz.jpg", 
    alt: "Kupwara Vintage House - Beautiful Exterior Architecture and Interior Design" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575945/photo_6_2026-06-04_17-54-19_p4bdcc.jpg", 
    alt: "The Vintage House Kupwara - Elegant Fine Dining, Restaurant and Family Meals" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575945/photo_9_2026-06-04_17-54-19_y4t6nt.jpg", 
    alt: "Vintage House Kupwara Hotel - Conference Hall, Events, and Corporate Meetings Setup" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575945/photo_4_2026-06-04_17-54-19_om13fe.jpg", 
    alt: "Vintage Kupwara Resort - Comfortable Stays for Families and Tourists Visiting Kashmir" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575945/photo_10_2026-06-04_17-54-19_tv37ky.jpg", 
    alt: "Kupwara Vintage House - Luxury Amenities, Hotel Services and Secure Environment" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575944/photo_7_2026-06-04_17-54-19_u77gqe.jpg", 
    alt: "The Vintage House Kupwara North Kashmir - Most Scenic Place to Stay near JIC Branwari" 
  },
  { 
    src: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780575944/photo_8_2026-06-04_17-54-19_qpz12o.jpg", 
    alt: "Vintage House Kupwara - Exploring Authentic Kashmiri Hospitality and Modern Elegance" 
  }
];

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
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000&auto=format&fit=crop"
            alt="The Vintage House Kupwara Luxury Interior Design"
            title="The Vintage House Kupwara"
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

      {/* 3. FOUNDER's NOTE & MOTIVE */}
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
            
            <div className="text-brand-muted md:text-lg font-light leading-relaxed mb-12 space-y-6 text-left md:text-center">
              <p>
                Welcome to The Vintage House Kupwara, a vision born from a deep love for our homeland and a passion for redefining hospitality in North Kashmir. My core motive was simple yet ambitious: to bridge the gap in high-end accommodation by creating the finest luxury hotel in Kupwara, where authentic traditional hospitality seamlessly blends with modern elegance.
              </p>
              <p>
                Every element of this property—from our meticulously designed premium suites to the culinary artistry in our fine-dining restaurant—has been crafted with profound attention to detail. We are dedicated to providing a secure, comfortable, and world-class stay for travelers, business professionals, and families exploring the breathtaking beauty of Kashmir.
              </p>
              <p className="font-medium text-brand-text text-center text-xl pt-4">
                Discover your perfect stay at <a href="https://vintagehousekupwara.com" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-[#A65520] hover:underline underline-offset-4 font-bold transition-all">vintagehousekupwara.com</a>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-[1px] bg-gray-300 mb-6" />
              <h4 className="font-serif text-2xl text-brand-text font-bold">Suhail Ahmad War</h4>
              <p className="text-xs tracking-[0.2em] text-brand-primary uppercase mt-2 font-bold">Founder & CEO, The Vintage House</p>
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

      {/* 6. PHOTO GALLERY (SEO Optimized & Lazy Loaded) */}
      <section className="py-24 bg-brand-bg relative z-10 border-t border-brand-secondary/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="uppercase tracking-[0.3em] text-brand-primary text-xs font-bold">Visual Journey</span>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-text mt-4 mb-6">Gallery at The Vintage House</h2>
            <p className="text-brand-muted max-w-2xl mx-auto font-light md:text-lg">
              A glimpse into the elegance, luxury, and warmth that awaits you at Kupwara's finest destination.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "100px" }} // Lazy-triggers animation when nearby
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {galleryImages.map((image, index) => (
              <motion.div
                variants={fadeInUp}
                key={index}
                className={`relative group overflow-hidden rounded-xl shadow-luxury border border-brand-secondary/30 bg-white ${
                  // Make some images span 2 columns to create an elegant bento-box frame layout
                  index === 0 || index === 7 ? 'sm:col-span-2 lg:col-span-2' : ''
                }`}
                style={{ aspectRatio: index === 0 || index === 7 ? '16/9' : '4/3' }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}       // Vital for SEO searchability
                  title={image.alt}     // Tooltip enhancement for SEO 
                  fill
                  loading="lazy"        // Explicitly prevents images from loading before scrolling down
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                {/* Visual Frame Overlay on Hover */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. CTA */}
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