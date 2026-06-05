"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ArrowRight, CalendarDays, Star, Maximize, 
  BedDouble, Wind, Search, Users, ShieldCheck, 
  Utensils, ShoppingCart, Quote, Loader2 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

// Import Next.js optimized Google Fonts
import { Grand_Hotel, Playfair_Display } from "next/font/google";

const grandHotel = Grand_Hotel({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  weight: ["600", "700", "800"], 
  style: ["normal", "italic"],
  display: "swap",
});

const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const TESTIMONIALS = [
  {
    id: 1,
    name: "Asrar ul Haq",
    location: "India",
    quote: "Vintage House Kupwara offers a fantastic ambiance that is perfect for both families and couples. The atmosphere is welcoming and the food quality is consistently top-tier. I usually order by phone and the service is always professional. A huge plus is the Hot & Cold AC in both the restaurant and the guest rooms, ensuring a comfortable night stay in any season. Truly the best place to stop or stay while visiting Bangus.",
    rating: 5.0,
    image: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780566023/d4c961732ba6ec52c0bbde63c9cb9e5dd6593826ee788080599f68920224e27d_rfx2tj.jpg",
  },
  {
    id: 2,
    name: "Tawseef War",
    location: "Kashmir, India",
    quote: "We were traveling towards keran valley and stayed for a night in this hotel .We were a group of 5 friends and really enjoyed the stay at vintage house kupwara. Rooms were neat and clean and the staff was friendly and food was freshly prepared.... thank you vintage house kupwara for such a hospitality....",
    rating: 5,
    image: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780566023/d4c961732ba6ec52c0bbde63c9cb9e5dd6593826ee788080599f68920224e27d_rfx2tj.jpg",
  },
  {
    id: 3,
    name: "Fatima Jan",
    location: "Kashmir, India",
    quote: "Great food and excellent service. The staff was polite, the ambiance was pleasant, and everything was clean and well-managed. The taste and quality of the food were impressive. Definitely worth visiting again.",
    rating: 5,
    image: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780566023/d4c961732ba6ec52c0bbde63c9cb9e5dd6593826ee788080599f68920224e27d_rfx2tj.jpg",
  },
];

export default function HomeClient({ rooms, dishes }: { rooms: any[], dishes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [isAppReady, setIsAppReady] = useState(false);
  
  const [globalPricing, setGlobalPricing] = useState<{kingSize?: any, doubleBed?: any} | null>(null);
  const [homeData, setHomeData] = useState<any>(null);
  const [todayAvailability, setTodayAvailability] = useState({ "King Size": 0, "Double Bed": 0 });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "homepage"), (docSnap) => {
      if (docSnap.exists()) {
        setHomeData(docSnap.data());
      } else {
        setHomeData({
          heroImage: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1200&auto=format&fit=crop",
          kingSizeImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
          doubleBedImage: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780488159/db_fvbirv.jpg",
          destinations: [
            { name: "Keran Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780495146/kkk_zynfng.jpg" },
            { name: "Bungus Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780469195/bungus_valley_fsuopv.jpg" },
            { name: "Sharda Mandir", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780495015/2024_7_largeimg_476843546_ubb7dv.jpg" },
            { name: "Lolab Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780497987/0_lryde3.jpg" }
          ]
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global_pricing"), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalPricing(docSnap.data() as any);
      } else {
        setGlobalPricing({
          kingSize: { onePerson: 4000, twoPerson: 5000 },
          doubleBed: { onePerson: 3000, twoPerson: 3500 }
        });
      }
    });
    return () => unsub();
  }, []);

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

  useEffect(() => {
    if (globalPricing && homeData) {
      setIsAppReady(true);
    }
  }, [globalPricing, homeData]);

  const handleBuyNow = (dish: any) => {
    addToCart(dish);
    router.push('/checkout');
  };

  const categories = useMemo(() => {
    if (!dishes || dishes.length === 0) return ["All"];
    const uniqueCategories = Array.from(new Set(dishes.map((d) => d.category || "Other")));
    return ["All", ...uniqueCategories];
  }, [dishes]);

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || dish.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedDishes = (searchQuery || selectedCategory !== "All") ? filteredDishes : filteredDishes.slice(0, 8);

  if (!isAppReady) {
    return (
      <div className="fixed inset-0 bg-brand-bg z-[9999] flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-brand-primary/20 rounded-full"></div>
        </div>
        <p className={`mt-4 text-brand-text text-xl ${grandHotel.className}`}>
          Loading Experience...
        </p>
      </div>
    );
  }

  return (
    <main className="w-full overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full lg:min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row-reverse items-center justify-center lg:justify-between px-6 lg:px-24 py-8 lg:py-0 overflow-hidden bg-brand-bg gap-12 lg:gap-8 pt-24 lg:pt-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="relative z-10 w-full lg:w-[50%] h-[400px] md:h-[500px] lg:h-[700px] rounded-t-full rounded-b-xl overflow-hidden border-8 border-white shadow-floating"
        >
          <Image 
            src={homeData?.heroImage || "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1200&auto=format&fit=crop"} 
            alt="Elegant Luxury Room" 
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
            <p className={`text-white text-3xl md:text-4xl ${grandHotel.className}`}>
              The Vintage House Kupwara
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="z-20 w-full lg:w-[45%] text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4 lg:mb-6">
            <span className={`text-brand-primary text-2xl md:text-3xl ${grandHotel.className}`}>
              Your Sanctuary Awaits
            </span>
          </div>

          <h2 className={`text-4xl sm:text-5xl md:text-6xl xl:text-7xl leading-[1.1] mb-4 lg:mb-6 text-brand-text font-bold ${playfair.className}`}>
            Experience <br className="hidden lg:block"/>
            <span className="italic text-brand-primary font-normal">Unrivaled</span> <br />
            Comfort.
          </h2>
          
          <p className="text-brand-muted text-sm md:text-lg xl:text-xl mb-8 max-w-lg leading-relaxed font-light px-2 lg:px-0">
            Immerse yourself in world-class hospitality at The Vintage House Kupwara. Discover our exclusive collection of premium luxury suites, designed for those who appreciate the finer things in North Kashmir.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto mt-4">
            <Link href="#accommodations" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-none text-xs md:text-sm tracking-widest uppercase hover:bg-[#A65520] transition-colors shadow-luxury">
                <CalendarDays size={16} />
                Reserve Your Stay
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. EXCLUSIVE ROOM CATEGORIES */}
      <section id="accommodations" className="w-full py-20 md:py-32 px-6 lg:px-24 bg-white relative z-10 border-t border-brand-secondary/30 mt-12 lg:mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-brand-primary text-3xl md:text-4xl mb-2 md:mb-4 block ${grandHotel.className}`}
            >
              Exclusive Accommodations
            </motion.span>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className={`text-4xl md:text-5xl text-brand-text max-w-2xl font-bold ${playfair.className}`}
            >
              Choose Your Sanctuary
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* KING SIZE ROOM */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="group relative bg-brand-bg border border-brand-secondary flex flex-col hover:shadow-floating transition-all duration-500 rounded-xl overflow-hidden"
            >
              <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
                <Image 
                  src={homeData?.kingSizeImage || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop"} 
                  alt="King Size Room"
                  fill sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 bg-brand-text text-white px-5 py-2 font-serif font-bold text-sm tracking-widest uppercase z-10 shadow-sm">Premium</div>
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur text-brand-text px-4 py-2 font-bold text-sm z-10 rounded shadow-sm">
                  ₹{globalPricing?.kingSize?.twoPerson || 5000} / Night
                </div>
              </div>

              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h4 className="font-serif text-3xl md:text-4xl text-brand-text mb-4 group-hover:text-brand-primary transition-colors">King Size Suite</h4>
                <div className="flex flex-wrap gap-3 mb-6 border-b border-brand-secondary/50 pb-6">
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded"><Maximize size={14} className="text-brand-primary"/> Spacious</span>
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded"><BedDouble size={14} className="text-brand-primary"/> 1 King Bed</span>
                </div>
                <p className="text-brand-muted text-sm md:text-base leading-relaxed mb-6 flex-grow">Experience unparalleled comfort in our King Size Suite. Featuring an expansive plush bed, elegant vintage aesthetics, and modern amenities.</p>
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
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative bg-brand-bg border border-brand-secondary flex flex-col hover:shadow-floating transition-all duration-500 rounded-xl overflow-hidden"
            >
              <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
                <Image 
                  src={homeData?.doubleBedImage || "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780488159/db_fvbirv.jpg"} 
                  alt="Double Bed Room"
                  fill sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 bg-brand-text text-white px-5 py-2 font-serif font-bold text-sm tracking-widest uppercase z-10 shadow-sm">Classic</div>
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur text-brand-text px-4 py-2 font-bold text-sm z-10 rounded shadow-sm">
                  ₹{globalPricing?.doubleBed?.twoPerson || 3500} / Night
                </div>
              </div>

              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h4 className="font-serif text-3xl md:text-4xl text-brand-text mb-4 group-hover:text-brand-primary transition-colors">Double Bed Room</h4>
                <div className="flex flex-wrap gap-3 mb-6 border-b border-brand-secondary/50 pb-6">
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded"><Maximize size={14} className="text-brand-primary"/> Comfort</span>
                  <span className="inline-flex items-center gap-1.5 bg-brand-secondary/30 text-brand-text px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest font-bold rounded"><BedDouble size={14} className="text-brand-primary"/> 2 Twin Beds</span>
                </div>
                <p className="text-brand-muted text-sm md:text-base leading-relaxed mb-6 flex-grow">Ideal for family or friends traveling together. The Double Bed Room offers two cozy beds with our signature vintage decor, ensuring a restful stay.</p>
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

      {/* 3. PREMIUM FACILITIES */}
      <section className="w-full bg-brand-bg py-16 md:py-24 px-6 lg:px-24 border-t border-brand-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`text-brand-primary text-3xl md:text-4xl mb-2 md:mb-4 block ${grandHotel.className}`}>
              Premium Facilities
            </motion.span>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className={`text-4xl md:text-5xl text-brand-text max-w-3xl font-bold ${playfair.className}`}>
              Event & Dining Spaces
            </motion.h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-white p-8 md:p-10 rounded-2xl border border-brand-secondary shadow-sm hover:shadow-floating transition-all group flex flex-col">
               <div className="w-14 h-14 bg-brand-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 transition-colors"><Users className="text-brand-primary w-7 h-7" /></div>
               <h4 className="font-serif text-2xl md:text-3xl text-brand-text mb-4">Conference / Party Hall</h4>
               <p className="text-brand-muted text-sm leading-relaxed mb-6 flex-grow">A spacious, fully air-conditioned hall designed for corporate meetings, grand parties, and special events. Equipped to handle large gatherings comfortably.</p>
               <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 w-fit px-4 py-2 rounded-lg"><Wind size={16}/> Fully AC</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-white p-8 md:p-10 rounded-2xl border border-brand-secondary shadow-sm hover:shadow-floating transition-all group flex flex-col">
               <div className="w-14 h-14 bg-brand-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 transition-colors"><ShieldCheck className="text-brand-primary w-7 h-7" /></div>
               <h4 className="font-serif text-2xl md:text-3xl text-brand-text mb-4">Separate Family Hall</h4>
               <p className="text-brand-muted text-sm leading-relaxed mb-6 flex-grow">Enjoy complete privacy with your loved ones in our dedicated family hall, ensuring a comfortable and exclusive experience away from the main areas.</p>
               <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 w-fit px-4 py-2 rounded-lg"><Wind size={16}/> Fully AC</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white p-8 md:p-10 rounded-2xl border border-brand-secondary shadow-sm hover:shadow-floating transition-all group flex flex-col">
               <div className="w-14 h-14 bg-brand-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 transition-colors"><Utensils className="text-brand-primary w-7 h-7" /></div>
               <h4 className="font-serif text-2xl md:text-3xl text-brand-text mb-4">Dining Hall (AC)</h4>
               <p className="text-brand-muted text-sm leading-relaxed mb-6 flex-grow">Savor our signature culinary creations in a relaxing, air-conditioned dining space perfect for both families and individual guests.</p>
               <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 w-fit px-4 py-2 rounded-lg"><Wind size={16}/> Fully AC</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC EXPLORE KASHMIR SECTION (Updated with mixed outline) */}
      <section className="w-full bg-white py-16 md:py-24 px-4 md:px-6 lg:px-24 border-t border-brand-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`text-brand-primary text-3xl md:text-4xl mb-2 block ${grandHotel.className}`}>
                Explore Kupwara
              </motion.span>
              <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`text-4xl md:text-5xl text-brand-text max-w-2xl font-bold ${playfair.className}`}>
                Serene Destinations Nearby
              </motion.h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            {homeData.destinations?.map((place: any, index: number) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.15, duration: 0.6 }} 
                // Mixed gradient padding to create the #c4f092 and #A65520 (chocolate) border
                className="group relative rounded-xl p-[2px] bg-gradient-to-br from-[#c4f092] to-[#A65520] shadow-sm hover:shadow-floating transition-all duration-500"
              >
                <div className="relative w-full h-[350px] md:h-[500px] lg:h-[600px] rounded-[10px] overflow-hidden">
                  <Image 
                    src={place.img || "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780495146/kkk_zynfng.jpg"} 
                    alt={place.name || "Kashmir Destination"} 
                    fill sizes="(max-width: 1024px) 100vw, 50vw" 
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-text/90 via-brand-text/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12">
                    <h4 className={`text-3xl md:text-4xl text-white tracking-wide group-hover:text-[#c4f092] transition-colors duration-300 drop-shadow-md ${playfair.className}`}>
                      {place.name || "Destination"}
                    </h4>
                    <div className="h-[2px] w-12 bg-[#c4f092] mt-4 group-hover:w-1/3 transition-all duration-700 ease-out" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOD SECTION */}
      <section className="w-full bg-brand-secondary/20 py-20 md:py-24 px-4 md:px-6 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`text-brand-primary text-3xl md:text-4xl mb-2 block ${grandHotel.className}`}>
                Dining & Room Service
              </motion.span>
              <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`text-3xl md:text-4xl text-brand-text font-bold ${playfair.className}`}>
                In-House Restaurant
              </motion.h3>
            </div>
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-4 top-3.5 text-brand-accent" />
              <input type="text" placeholder="Search dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-brand-secondary focus:border-brand-primary focus:outline-none shadow-sm" />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto mb-10 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)} className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${selectedCategory === category ? "bg-brand-primary text-white shadow-md" : "bg-white text-brand-text border border-brand-secondary hover:border-brand-primary"}`}>
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16">
            {displayedDishes.length > 0 ? (
              <>
                {displayedDishes.map((dish) => (
                  <div key={dish.id} className="group relative bg-white rounded-t-[40px] md:rounded-t-[80px] rounded-b-xl p-3 md:p-5 pt-12 md:pt-20 shadow-sm hover:shadow-floating transition-shadow duration-300 border border-brand-secondary flex flex-col items-center text-center mt-6 md:mt-10">
                    <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full z-10">
                      <div className="w-full h-full relative group-hover:-translate-y-1 transition-transform duration-300">
                        <Image src={dish.image} alt={dish.name} fill sizes="(max-width: 768px) 80px, 128px" className="object-cover drop-shadow-xl rounded-full" />
                      </div>
                    </div>
                    <span className="text-brand-primary text-[9px] md:text-[10px] uppercase tracking-widest font-bold mb-1 block">{dish.category}</span>
                    <h4 className="font-serif text-sm md:text-lg text-brand-text font-bold mb-1 line-clamp-1">{dish.name}</h4>
                    <div className="flex items-center gap-1 text-brand-accent mb-3">
                      <Star size={10} className="fill-brand-accent md:w-3 md:h-3" />
                      <span className="text-[10px] md:text-xs font-medium">{dish.rating || 4.8}</span>
                    </div>
                    <div className="mt-auto w-full flex flex-col gap-3 border-t border-brand-secondary pt-3 md:pt-4">
                      <span className="font-serif text-base md:text-xl font-bold text-brand-primary block text-center">₹{dish.price}</span>
                      <div className="flex items-center justify-center gap-1.5 md:gap-2 w-full">
                        <button onClick={() => addToCart(dish)} className="p-1.5 md:p-2 border border-brand-secondary text-brand-text hover:bg-brand-bg hover:text-brand-primary rounded transition-colors"><ShoppingCart size={14} className="md:w-4 md:h-4" /></button>
                        <button onClick={() => handleBuyNow(dish)} className="flex-1 bg-brand-primary text-white text-[9px] md:text-[11px] px-2 py-1.5 md:py-2 rounded uppercase tracking-widest font-bold hover:bg-[#A65520] transition-colors whitespace-nowrap">Buy Now</button>
                      </div>
                    </div>
                  </div>
                ))}

                {!searchQuery && selectedCategory === "All" && dishes.length > 8 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="col-span-2 md:col-span-4 flex justify-center mt-8 md:mt-12">
                    <Link href="/menu">
                      <button className="group relative inline-flex items-center gap-3 bg-brand-bg border border-brand-primary text-brand-primary px-8 py-4 text-xs md:text-sm tracking-widest uppercase font-bold hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-luxury rounded-lg overflow-hidden z-10">
                        <span className="relative z-10 flex items-center gap-2">View Full Menu <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                        <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                      </button>
                    </Link>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-12 bg-white rounded-xl border border-brand-secondary">
                <p className={`text-brand-muted text-3xl mb-4 ${grandHotel.className}`}>
                  No dishes found in this category or matching "{searchQuery}"
                </p>
                <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="text-brand-primary text-sm font-bold uppercase tracking-widest hover:underline">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* 6. GOOGLE REVIEWS & TESTIMONIALS (Updated with premium thin border transition) */}
      <section className="w-full bg-white py-16 md:py-24 px-4 md:px-6 lg:px-24 border-t border-brand-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`text-brand-primary text-3xl md:text-4xl mb-4 ${grandHotel.className}`}>
              Guest Experiences
            </motion.span>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className={`text-4xl md:text-5xl text-brand-text mb-6 font-bold ${playfair.className}`}>
              What Our Guests Say
            </motion.h3>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-full shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Verified Google Reviews</span>
              <div className="flex gap-0.5 ml-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-[#FBBC05] text-[#FBBC05]" />)}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.15 }} 
                // Subtle 1px solid border transitioning from #c4f092 to chocolate on hover
                className="bg-brand-bg/50 border border-[#c4f092] hover:border-[#A65520] p-8 rounded-2xl flex flex-col relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(196,240,146,0.3)] hover:bg-white transition-all duration-500"
              >
                <Quote className="absolute top-6 right-6 w-12 h-12 text-brand-secondary/40 group-hover:text-[#c4f092]/50 transition-colors" />
                <div className="flex gap-1 mb-6 text-[#A65520]">{[...Array(Math.floor(testimonial.rating))].map((_, i) => <Star key={i} size={16} className="fill-current" />)}</div>
                <p className="text-brand-muted text-sm md:text-base italic leading-relaxed mb-8 flex-grow">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-brand-secondary/50">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <Image src={testimonial.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt={testimonial.name} fill unoptimized className="object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-brand-text text-sm md:text-base">{testimonial.name}</h5>
                    <p className="text-xs text-brand-muted uppercase tracking-wider">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}