"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Utensils, Star, Maximize, BedDouble, Quote, Wind, Coffee, Ban, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TESTIMONIALS } from "@/data/mockTestimonials";

export default function HomeClient({ rooms, dishes }: { rooms: any[], dishes: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Live search filtering. Limits to 30 items for the homepage.
  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 30);

  return (
    <main className="w-full overflow-hidden">
      
      {/* ==========================================
          1. HOTEL-FIRST HERO SECTION 
      ========================================== */}
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
            Immerse yourself in world-class hospitality. Discover our exclusive collection of 9 boutique suites, designed for those who appreciate the finer things.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
            <Link href="/rooms" className="w-full sm:w-auto">
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
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
            <p className="text-white font-serif text-2xl italic">The Vintage House Kupwara</p>
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          2. ROOMS: PRIORITY DISPLAY (9 ROOMS)
      ========================================== */}
      <section className="w-full py-20 md:py-32 px-6 lg:px-24 bg-white relative z-10 border-t border-brand-secondary/30 mt-12 lg:mt-0">
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
              Our 9 Signature Suites
            </motion.h3>
            <p className="text-brand-muted mt-6 max-w-xl text-sm md:text-base">
              A carefully curated selection of rooms, each offering a unique vintage aesthetic paired with modern luxury amenities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                className="group relative overflow-hidden bg-brand-bg border border-brand-secondary flex flex-col hover:shadow-floating transition-shadow duration-500"
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <Image 
                    src={room.image} 
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 text-brand-text font-serif font-bold text-lg z-10 shadow-sm flex items-center gap-1">
                    ${room.price} <span className="text-[10px] font-sans text-brand-muted font-normal uppercase tracking-wider">/ night</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h4 className="font-serif text-2xl text-brand-text mb-3 group-hover:text-brand-primary transition-colors line-clamp-1">
                    {room.name}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.isAc ? (
                      <span className="inline-flex items-center gap-1 bg-brand-secondary/50 text-brand-accent px-2 py-1 text-[10px] uppercase tracking-widest font-bold">
                        <Wind size={12} /> AC Room
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 text-[10px] uppercase tracking-widest font-bold">
                        <Ban size={12} /> Non-AC
                      </span>
                    )}
                    
                    {room.isBreakfastIncluded && (
                      <span className="inline-flex items-center gap-1 bg-brand-secondary/50 text-brand-accent px-2 py-1 text-[10px] uppercase tracking-widest font-bold">
                        <Coffee size={12} /> Breakfast Included
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-brand-accent mb-4 border-y border-brand-secondary/50 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium"><Maximize size={14}/> {room.size}</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium"><BedDouble size={14}/> {room.type}</div>
                  </div>
                  
                  <p className="text-brand-muted text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                    {room.description}
                  </p>
                  
                  <div className="mt-auto pt-4">
                  <Link href={`/book?item=${encodeURIComponent(room.name)}`}>
                      <button className="w-full bg-brand-text text-brand-bg py-3 text-xs uppercase tracking-widest font-bold hover:bg-brand-primary transition-colors flex items-center justify-center gap-2">
                        Book This Room <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
      {/* ==========================================
          NEW: EXPLORE KASHMIR (TOURIST ATTRACTIONS)
      ========================================== */}
      <section className="w-full bg-white py-16 md:py-24 px-4 md:px-6 lg:px-24 border-t border-brand-secondary/50">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 md:mb-4 block"
              >
                Explore Kupwara
              </motion.span>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-3xl md:text-4xl text-brand-text"
              >
                Serene Destinations Nearby
              </motion.h3>
              <p className="text-brand-muted mt-4 max-w-xl text-sm md:text-base">
                TheVintageHouse serves as the perfect luxury basecamp for exploring the untouched beauty of North Kashmir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Keran Valley", img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop" },
              { name: "Bungus Valley", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780469195/bungus_valley_fsuopv.jpg" },
              { name: "Sharda Mandir Teetwal", img: "https://res.cloudinary.com/dfdnjuhpw/image/upload/q_auto/f_auto/v1780469247/Sharda-Peeth-Temple-Teetwal-Kupwara_u7oct7.jpg" },
              { name: "Lolab Valley", img: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop" }
            ].map((place, index) => (
              <motion.div
                key={place.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative h-64 md:h-80 overflow-hidden border border-brand-secondary"
              >
                <Image 
                  src={place.img} 
                  alt={place.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-text/90 via-brand-text/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h4 className="font-serif text-xl text-white tracking-wide group-hover:text-brand-primary transition-colors">
                    {place.name}
                  </h4>
                  <div className="h-[2px] w-8 bg-brand-primary mt-3 group-hover:w-full transition-all duration-500 ease-out" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          3. FAST, SEARCHABLE FOOD SECTION 
      ========================================== */}
      <section className="w-full bg-brand-secondary/20 py-20 md:py-24 px-4 md:px-6 lg:px-24">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 md:mb-4 block"
              >
                Exceptional Dining
              </motion.span>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-3xl md:text-4xl text-brand-text"
              >
                In-House Restaurant
              </motion.h3>
            </div>
            
            {/* Live Search Bar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="relative w-full md:w-72"
            >
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-brand-accent" />
                <input 
                  type="text" 
                  placeholder="Search dishes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-brand-secondary focus:border-brand-primary focus:outline-none transition-colors text-brand-text shadow-sm" 
                />
              </div>
            </motion.div>
          </div>

          {/* Simple, Lag-Free Standard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-12 md:gap-x-6 md:gap-y-16">
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="group relative bg-white rounded-t-[40px] md:rounded-t-[80px] rounded-b-xl p-3 md:p-5 pt-12 md:pt-20 shadow-sm hover:shadow-floating transition-shadow duration-300 border border-brand-secondary flex flex-col items-center text-center mt-6 md:mt-10"
                >
                  <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full z-10">
                    <div className="w-full h-full relative group-hover:-translate-y-1 transition-transform duration-300">
                      <Image 
                        src={dish.image} 
                        alt={dish.name} 
                        fill 
                        sizes="(max-width: 768px) 80px, 128px"
                        className="object-cover drop-shadow-xl rounded-full" 
                      />
                    </div>
                  </div>
                  <span className="text-brand-primary text-[9px] md:text-[10px] uppercase tracking-widest font-bold mb-1 block">{dish.category}</span>
                  <h4 className="font-serif text-sm md:text-lg text-brand-text font-bold mb-1 line-clamp-1">{dish.name}</h4>
                  <div className="flex items-center gap-1 text-brand-accent mb-3">
                    <Star size={10} className="fill-brand-accent md:w-3 md:h-3" />
                    <span className="text-[10px] md:text-xs font-medium">{dish.rating}</span>
                  </div>
                  <div className="mt-auto w-full flex items-center justify-between border-t border-brand-secondary pt-3">
                    <span className="font-serif text-base md:text-xl font-bold text-brand-primary">${dish.price}</span>
                    <Link href="/menu">
  <button className="w-8 h-8 rounded-full border border-brand-primary flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
    <ArrowRight size={14} />
  </button>
</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-12">
                <p className="text-brand-muted font-serif text-xl italic">No dishes found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>

          {/* Link to dedicated menu page for everything else */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center border-t border-brand-secondary/50 pt-10"
          >
            <Link href="/menu">
              <button className="bg-brand-text border border-brand-text text-white px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-brand-text hover:text-brand-primary transition-colors flex items-center gap-2">
                View Full Menu <ArrowRight size={16} />
              </button>
            </Link>
          </motion.div>

        </div>
      </section>
      

      {/* ==========================================
          4. FEEDBACK: GUEST TESTIMONIALS 
      ========================================== */}
      <section className="w-full bg-brand-bg py-16 md:py-24 px-6 lg:px-24 border-t border-brand-secondary/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-12 md:mb-20 flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 md:mb-4 block"
            >
              Guest Experiences
            </motion.span>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl md:text-5xl text-brand-text max-w-2xl"
            >
              Words from Our Patrons
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-8 md:p-10 border border-brand-secondary hover:shadow-luxury hover:-translate-y-2 transition-all duration-300 relative flex flex-col"
              >
                <Quote className="text-brand-secondary absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-12 md:h-12 rotate-180 opacity-50" />
                
                <div className="flex gap-1 mb-4 md:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-primary text-brand-primary md:w-4 md:h-4" />
                  ))}
                </div>

                <p className="font-serif text-base md:text-lg text-brand-text italic leading-relaxed mb-6 md:mb-8 flex-grow z-10">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="flex items-center gap-4 mt-auto border-t border-brand-secondary/40 pt-4 md:pt-6">
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-brand-secondary">
                    <Image 
                      src={testimonial.image || ""} 
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-brand-text text-xs md:text-sm uppercase tracking-wider">{testimonial.name}</h5>
                    <span className="text-brand-muted text-[10px] md:text-xs">{testimonial.location}</span>
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