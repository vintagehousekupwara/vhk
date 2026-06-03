"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Wind, Users, Utensils, BedDouble, Maximize, ArrowRight, Ban, CheckCircle2 } from "lucide-react";

export default function RoomsClient({ rooms }: { rooms: any[] }) {
  return (
    <main className="min-h-screen bg-brand-bg pt-20 pb-24">
      
      {/* ==========================================
          1. EVENT & DINING HALLS (TOP SECTION)
      ========================================== */}
      <section className="px-4 md:px-6 lg:px-24 mb-20 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 block">
              Premium Facilities
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-brand-text mb-4">Event & Dining Spaces</h1>
            <p className="text-brand-muted max-w-2xl mx-auto">
              Whether you are hosting a corporate meeting or a family gathering, our dedicated halls provide the perfect, fully air-conditioned environment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-6 md:p-8 rounded-2xl border border-brand-secondary shadow-sm">
            {/* Conference Hall Image */}
            <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-luxury">
              <Image 
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop" 
                alt="AC Conference Hall" 
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 text-brand-text font-serif font-bold text-sm shadow-sm flex items-center gap-2 rounded-md">
                <Wind size={16} className="text-brand-primary" /> Fully AC
              </div>
            </div>

            {/* Hall Details */}
            <div className="space-y-8 lg:pl-8">
              <div>
                <h3 className="font-serif text-2xl text-brand-text mb-2 flex items-center gap-2">
                  <Users className="text-brand-primary" /> Conference / Party Hall
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  A spacious, fully air-conditioned hall designed for corporate meetings, grand parties, and special events. Equipped to handle large gatherings comfortably.
                </p>
              </div>

              <div className="border-t border-brand-secondary pt-6">
                <h3 className="font-serif text-2xl text-brand-text mb-2 flex items-center gap-2">
                  <Users className="text-brand-primary" /> Separate Family Hall
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  Enjoy complete privacy with your loved ones in our dedicated family hall, ensuring a comfortable and exclusive experience.
                </p>
              </div>

              <div className="border-t border-brand-secondary pt-6">
                <h3 className="font-serif text-2xl text-brand-text mb-2 flex items-center gap-2">
                  <Utensils className="text-brand-primary" /> Dining Hall (AC)
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  Savor our signature culinary creations in a relaxing, air-conditioned dining space perfect for families and guests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. THE 9 LUXURY ROOMS
      ========================================== */}
      <section className="px-4 md:px-6 lg:px-24 bg-white py-20 border-t border-brand-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-primary tracking-widest uppercase text-xs md:text-sm font-medium mb-2 block">
              Exclusive Accommodations
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-text">Our 9 Signature Rooms</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.length > 0 ? rooms.map((room) => (
              <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-brand-bg border border-brand-secondary flex flex-col hover:shadow-floating transition-shadow duration-500 overflow-hidden rounded-xl"
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <Image src={room.image} alt={room.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 text-brand-text font-serif font-bold text-lg z-10 shadow-sm flex items-center gap-1 rounded-md">
                    ₹{room.price} <span className="text-[10px] font-sans text-brand-muted font-normal uppercase tracking-wider">/ night</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h4 className="font-serif text-2xl text-brand-text mb-3">{room.name}</h4>
                  
                  {/* Dynamic Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.isAc ? (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded">
                        <Wind size={12} /> AC Room
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded">
                        <Ban size={12} /> Non-AC
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 bg-brand-secondary/50 text-brand-accent px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded">
                      <Users size={12} /> {room.guests || 2} Guests
                    </span>
                  </div>
                  
                  <p className="text-brand-muted text-sm leading-relaxed mb-6 flex-grow">
                    {room.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-brand-secondary">
                    <Link href={`/book?item=${encodeURIComponent(room.name)}`}>
                      <button className="w-full bg-brand-text text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-brand-primary transition-colors flex items-center justify-center gap-2 rounded-md shadow-md">
                        Request Booking <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-20 text-brand-muted">
                No rooms available yet. Admin is configuring the inventory.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}