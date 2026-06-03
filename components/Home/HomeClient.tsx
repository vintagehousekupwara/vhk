"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ArrowRight, CalendarDays, Star, Maximize, 
  BedDouble, Wind, Search, Users, ShieldCheck, 
  Utensils, ShoppingCart 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function HomeClient({ rooms, dishes }: { rooms: any[], dishes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Real-time Database States
  const [globalPricing, setGlobalPricing] = useState({ kingSize: 5000, doubleBed: 3500 });
  const [todayAvailability, setTodayAvailability] = useState({ "King Size": 0, "Double Bed": 0 });

  // Live Pricing Listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global_pricing"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setGlobalPricing({
          kingSize: data.kingSize || 5000,
          doubleBed: data.doubleBed || 3500,
        });
      }
    });
    return () => unsub();
  }, []);

  // Live Today's Availability Listener
  useEffect(() => {
    const todayStr = formatYYYYMMDD(new Date());
    const q = query(collection(db, "room_inventory"), where("date", "==", todayStr));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const newAvail = { "King Size": 0, "Double Bed": 0 };
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.roomType === "King Size") newAvail["King Size"] = data.available;
        if (data.roomType === "Double Bed") newAvail["Double Bed"] = data.available;
      });
      setTodayAvailability(newAvail);
    });
    return () => unsub();
  }, []);

  // Unified Buy Now Logic
  const handleBuyNow = (dish: any) => {
    addToCart(dish);
    router.push('/checkout');
  };

  // Search filtering logic
  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If user is searching, show all matches. Otherwise, just show top 8 for performance/UX.
  const displayedDishes = searchQuery ? filteredDishes : filteredDishes.slice(0, 8);

  return (
    <main className="w-full overflow-hidden">
      
      {/* 1. HOTEL-FIRST HERO SECTION */}
      <section className="relative w-full lg:min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-24 py-8 lg:py-0 overflow-hidden bg-brand-bg gap-12 lg:gap-8 pt-24 lg:pt-0">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="z-20 w-full lg:w-[45%] text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4 lg:mb-6">
            <span className="w-8 md:w-12 h-[1px] bg-brand-primary"></span>
            <span className="text-brand-primary tracking-widest uppercase text-[10px] md:text-sm font-medium">Your Sanctuary Awaits</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl xl:text-7xl leading-[1.1] mb-4 lg:mb-6 text-brand-text">
            Experience <br className="hidden lg:block"/>
            <span className="italic text-brand-primary font-normal">Unrivaled</span> <br />
            Comfort.
          </h2>
          
          <p className="text-brand-muted text-sm md:text-lg xl:text-xl mb-8 max-w-lg leading-relaxed font-light hidden sm:block">
            Immerse yourself in world-class hospitality at The Vintage House Kupwara. Discover our exclusive collection of premium luxury suites, designed for those who appreciate the finer things in North Kashmir.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
            <Link href="#accommodations" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-none text-xs md:text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors shadow-luxury">
                <CalendarDays size={16} />
                Reserve Your Stay
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="relative z-10 w-full lg:w-[50%] h-[400px] md:h-[500px] lg:h-[700px] rounded-t-full rounded-b-xl overflow-hidden border-8 border-white shadow-floating"
        >
          <Image 
            src="https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1200&auto=format&fit=crop" 
            alt="Elegant Luxury Room" 
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
            <p className="text-white font-serif text-2xl italic">The Vintage House Kupwara</p>
          </div>
        </motion.div>
      </section>

      {/* 2. EXCLUSIVE ROOM CATEGORIES */}
      <section id="accommodations" className="w-full py-20 md:py-32 px-6 lg:px-24 bg-white relative z-10 border-t border-brand-secondary/30 mt-12 lg:mt-0">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 md:mb-4 block"
            >
              Exclusive Accommodations
            </motion.span>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl text-brand-text max-w-2xl"
            >
              Choose Your Sanctuary
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* KING SIZE ROOM */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative bg-brand-bg border border-brand-secondary flex flex-col hover:shadow-floating transition-all duration-500 rounded-xl overflow-hidden"
            >
              <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop" 
                  alt="King Size Room"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 bg-brand-text text-white px-5 py-2 font-serif font-bold text-sm tracking-widest uppercase z-10 shadow-sm">
                  Premium
                </div>
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur text-brand-text px-4 py-2 font-bold text-sm z-10 rounded shadow-sm">
                  ₹{globalPricing.kingSize} / Night
                </div>
              </div>

              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-serif text-3xl md:text-4xl text-brand-text group-hover:text-brand-primary transition-colors">
                    King Size Suite
                  </h4>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6 border-b border-brand-secondary/50 pb-6">
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded">
                    <Maximize size={14} className="text-brand-primary"/> Spacious
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded">
                    <BedDouble size={14} className="text-brand-primary"/> 1 King Bed
                  </span>
                </div>
                
                <p className="text-brand-muted text-sm md:text-base leading-relaxed mb-6 flex-grow">
                  Experience unparalleled comfort in our King Size Suite. Featuring an expansive plush bed, elegant vintage aesthetics, and modern amenities.
                </p>

                <div className={`mb-6 text-sm font-bold flex items-center gap-2 ${todayAvailability["King Size"] > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {todayAvailability["King Size"] > 0 ? `${todayAvailability["King Size"]} Rooms Available Today` : "Sold Out Today"}
                </div>
                
                <div className="mt-auto">
                  <Link href="/book?type=King%20Size">
                    <button className="w-full bg-brand-text text-brand-bg py-4 text-xs md:text-sm uppercase tracking-widest font-bold hover:bg-brand-primary transition-colors flex items-center justify-center gap-2">
                      Check Availability & Book <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* DOUBLE BED ROOM */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative bg-brand-bg border border-brand-secondary flex flex-col hover:shadow-floating transition-all duration-500 rounded-xl overflow-hidden"
            >
              <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
                <Image 
                  src="https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780488159/db_fvbirv.jpg" 
                  alt="Double Bed Room"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 bg-brand-text text-white px-5 py-2 font-serif font-bold text-sm tracking-widest uppercase z-10 shadow-sm">
                  Classic
                </div>
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur text-brand-text px-4 py-2 font-bold text-sm z-10 rounded shadow-sm">
                  ₹{globalPricing.doubleBed} / Night
                </div>
              </div>

              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h4 className="font-serif text-3xl md:text-4xl text-brand-text mb-4 group-hover:text-brand-primary transition-colors">
                  Double Bed Room
                </h4>
                
                <div className="flex flex-wrap gap-3 mb-6 border-b border-brand-secondary/50 pb-6">
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded">
                    <Maximize size={14} className="text-brand-primary"/> Comfort
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded">
                    <BedDouble size={14} className="text-brand-primary"/> 2 Twin Beds
                  </span>
                </div>
                
                <p className="text-brand-muted text-sm md:text-base leading-relaxed mb-6 flex-grow">
                  Ideal for family or friends traveling together. The Double Bed Room offers two cozy beds with our signature vintage decor, ensuring a restful stay.
                </p>

                <div className={`mb-6 text-sm font-bold flex items-center gap-2 ${todayAvailability["Double Bed"] > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {todayAvailability["Double Bed"] > 0 ? `${todayAvailability["Double Bed"]} Rooms Available Today` : "Sold Out Today"}
                </div>
                
                <div className="mt-auto">
                  <Link href="/book?type=Double%20Bed">
                    <button className="w-full bg-brand-text text-brand-bg py-4 text-xs md:text-sm uppercase tracking-widest font-bold hover:bg-brand-primary transition-colors flex items-center justify-center gap-2">
                      Check Availability & Book <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. PREMIUM FACILITIES (EVENT & DINING SPACES) */}
      <section className="w-full bg-brand-bg py-16 md:py-24 px-6 lg:px-24 border-t border-brand-secondary/30">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 md:mb-4 block"
            >
              Premium Facilities
            </motion.span>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl text-brand-text max-w-3xl"
            >
              Event & Dining Spaces
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-brand-muted mt-6 max-w-2xl text-sm md:text-base leading-relaxed"
            >
              Whether you are hosting a corporate meeting or a family gathering, our dedicated halls provide the perfect, <strong className="text-brand-text">fully air-conditioned</strong> environment.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Conference / Party Hall */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5 }} 
              className="bg-white p-8 md:p-10 rounded-2xl border border-brand-secondary shadow-sm hover:shadow-floating transition-all group flex flex-col"
            >
               <div className="w-14 h-14 bg-brand-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 transition-colors">
                 <Users className="text-brand-primary w-7 h-7" />
               </div>
               <h4 className="font-serif text-2xl md:text-3xl text-brand-text mb-4">Conference / Party Hall</h4>
               <p className="text-brand-muted text-sm leading-relaxed mb-6 flex-grow">
                 A spacious, fully air-conditioned hall designed for corporate meetings, grand parties, and special events. Equipped to handle large gatherings comfortably.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 w-fit px-4 py-2 rounded-lg">
                 <Wind size={16}/> Fully AC
               </div>
            </motion.div>

            {/* Card 2: Separate Family Hall */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: 0.15 }} 
              className="bg-white p-8 md:p-10 rounded-2xl border border-brand-secondary shadow-sm hover:shadow-floating transition-all group flex flex-col"
            >
               <div className="w-14 h-14 bg-brand-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 transition-colors">
                 <ShieldCheck className="text-brand-primary w-7 h-7" />
               </div>
               <h4 className="font-serif text-2xl md:text-3xl text-brand-text mb-4">Separate Family Hall</h4>
               <p className="text-brand-muted text-sm leading-relaxed mb-6 flex-grow">
                 Enjoy complete privacy with your loved ones in our dedicated family hall, ensuring a comfortable and exclusive experience away from the main areas.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 w-fit px-4 py-2 rounded-lg">
                 <Wind size={16}/> Fully AC
               </div>
            </motion.div>

            {/* Card 3: Dining Hall */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: 0.3 }} 
              className="bg-white p-8 md:p-10 rounded-2xl border border-brand-secondary shadow-sm hover:shadow-floating transition-all group flex flex-col"
            >
               <div className="w-14 h-14 bg-brand-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 transition-colors">
                 <Utensils className="text-brand-primary w-7 h-7" />
               </div>
               <h4 className="font-serif text-2xl md:text-3xl text-brand-text mb-4">Dining Hall (AC)</h4>
               <p className="text-brand-muted text-sm leading-relaxed mb-6 flex-grow">
                 Savor our signature culinary creations in a relaxing, air-conditioned dining space perfect for both families and individual guests.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 w-fit px-4 py-2 rounded-lg">
                 <Wind size={16}/> Fully AC
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE KASHMIR */}
      <section className="w-full bg-white py-16 md:py-24 px-4 md:px-6 lg:px-24 border-t border-brand-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 block"
              >
                Explore Kupwara
              </motion.span>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif text-4xl md:text-5xl text-brand-text max-w-2xl"
              >
                Serene Destinations Nearby
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-brand-muted mt-4 text-sm md:text-base"
              >
                TheVintageHouse serves as the perfect luxury basecamp for exploring the untouched beauty of North Kashmir.
              </motion.p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            {[
              { name: "Keran Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780495146/kkk_zynfng.jpg" },
              { name: "Bungus Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780469195/bungus_valley_fsuopv.jpg" },
              { name: "Sharda Mandir", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780495015/2024_7_largeimg_476843546_ubb7dv.jpg" },
              { name: "Lolab Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780497987/0_lryde3.jpg" }
            ].map((place, index) => (
              <motion.div 
                key={place.name} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.15, duration: 0.6 }} 
                className="group relative h-[350px] md:h-[500px] lg:h-[600px] overflow-hidden border border-brand-secondary rounded-xl shadow-sm hover:shadow-floating transition-all duration-500"
              >
                <Image 
                  src={place.img} 
                  alt={place.name} 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 50vw" 
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-text/90 via-brand-text/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12">
                  <h4 className="font-serif text-3xl md:text-4xl text-white tracking-wide group-hover:text-brand-primary transition-colors duration-300 drop-shadow-md">
                    {place.name}
                  </h4>
                  <div className="h-[2px] w-12 bg-brand-primary mt-4 group-hover:w-1/3 transition-all duration-700 ease-out" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOD SECTION */}
      <section className="w-full bg-brand-secondary/20 py-20 md:py-24 px-4 md:px-6 lg:px-24">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 block"
              >
                Dining & Room Service
              </motion.span>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="font-serif text-3xl md:text-4xl text-brand-text"
              >
                In-House Restaurant
              </motion.h3>
            </div>
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-4 top-3.5 text-brand-accent" />
              <input 
                type="text" 
                placeholder="Search dishes..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 bg-white border border-brand-secondary focus:border-brand-primary focus:outline-none shadow-sm" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16">
            {displayedDishes.length > 0 ? (
              <>
                {displayedDishes.map((dish) => (
                  <div 
                    key={dish.id} 
                    className="group relative bg-white rounded-t-[40px] md:rounded-t-[80px] rounded-b-xl p-3 md:p-5 pt-12 md:pt-20 shadow-sm hover:shadow-floating transition-shadow duration-300 border border-brand-secondary flex flex-col items-center text-center mt-6 md:mt-10"
                  >
                    <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full z-10">
                      <div className="w-full h-full relative group-hover:-translate-y-1 transition-transform duration-300">
                        <Image src={dish.image} alt={dish.name} fill sizes="(max-width: 768px) 80px, 128px" className="object-cover drop-shadow-xl rounded-full" />
                      </div>
                    </div>
                    
                    <span className="text-brand-primary text-[9px] md:text-[10px] uppercase tracking-widest font-bold mb-1 block">
                      {dish.category}
                    </span>
                    <h4 className="font-serif text-sm md:text-lg text-brand-text font-bold mb-1 line-clamp-1">
                      {dish.name}
                    </h4>
                    
                    <div className="flex items-center gap-1 text-brand-accent mb-3">
                      <Star size={10} className="fill-brand-accent md:w-3 md:h-3" />
                      <span className="text-[10px] md:text-xs font-medium">{dish.rating || 4.8}</span>
                    </div>

                    <div className="mt-auto w-full flex flex-col gap-3 border-t border-brand-secondary pt-3 md:pt-4">
                      <span className="font-serif text-base md:text-xl font-bold text-brand-primary block text-center">
                        ₹{dish.price}
                      </span>
                      
                      <div className="flex items-center justify-center gap-1.5 md:gap-2 w-full">
                        <button 
                          onClick={() => addToCart(dish)}
                          className="p-1.5 md:p-2 border border-brand-secondary text-brand-text hover:bg-brand-bg hover:text-brand-primary rounded transition-colors"
                          title="Add to Cart"
                        >
                          <ShoppingCart size={14} className="md:w-4 md:h-4" />
                        </button>

                        <button 
                          onClick={() => handleBuyNow(dish)}
                          className="flex-1 bg-brand-primary text-white text-[9px] md:text-[11px] px-2 py-1.5 md:py-2 rounded uppercase tracking-widest font-bold hover:bg-[#A65520] transition-colors whitespace-nowrap"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* HIGHLIGHTED VIEW FULL MENU BUTTON */}
                {!searchQuery && dishes.length > 8 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="col-span-2 md:col-span-4 flex justify-center mt-8 md:mt-12"
                  >
                    <Link href="/menu">
                      <button className="group relative inline-flex items-center gap-3 bg-brand-bg border border-brand-primary text-brand-primary px-8 py-4 text-xs md:text-sm tracking-widest uppercase font-bold hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-luxury rounded-lg overflow-hidden z-10">
                        <span className="relative z-10 flex items-center gap-2">
                          View Full Menu <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                      </button>
                    </Link>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-12 bg-white rounded-xl border border-brand-secondary">
                <p className="text-brand-muted font-serif text-xl italic mb-4">No dishes found matching &quot;{searchQuery}&quot;</p>
                <button onClick={() => setSearchQuery("")} className="text-brand-primary text-sm font-bold uppercase tracking-widest hover:underline">
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      
    </main>
  );
}