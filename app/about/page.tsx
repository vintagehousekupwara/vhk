"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

export default function AboutPage() {
  const facilities = [
    {
      icon: <Building size={24} />,
      title: "9 Premium Rooms",
      desc: "Luxury AC & Non-AC rooms designed for comfort and relaxation.",
    },
    {
      icon: <Users size={24} />,
      title: "Conference Hall",
      desc: "Professional fully air-conditioned conference and meeting space.",
    },
    {
      icon: <Utensils size={24} />,
      title: "Family Dining",
      desc: "Comfortable dining halls for families, groups and celebrations.",
    },
    {
      icon: <Car size={24} />,
      title: "Huge Parking",
      desc: "Safe and spacious parking facility for all guests.",
    },
    {
      icon: <Wifi size={24} />,
      title: "Free High-Speed WiFi",
      desc: "Reliable internet access throughout the property.",
    },
    {
      icon: <MapPin size={24} />,
      title: "Prime Location",
      desc: "Conveniently located near JIC Branwari, Kupwara.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Secure Environment",
      desc: "Situated in one of the safest and most accessible areas.",
    },
    {
      icon: <BedDouble size={24} />,
      title: "Luxury Accommodation",
      desc: "Thoughtfully designed rooms for business and leisure travelers.",
    },
  ];

  return (
    <main className="min-h-screen bg-brand-bg pt-20">
      {/* HERO */}
      <section className="relative w-full h-[60vh] min-h-[450px]">
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop"
          alt="TheVintageHouse Kupwara"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-6 max-w-5xl"
          >
            <span className="uppercase tracking-[0.3em] text-brand-secondary text-sm md:text-base">
              Luxury Hotel & Restaurant In Kupwara
            </span>

            <h1 className="font-serif text-5xl md:text-7xl text-white mt-6 mb-6 leading-tight">
              The Story Behind
              <br />
              TheVintageHouse
            </h1>

            <p className="text-white/90 max-w-3xl mx-auto text-lg md:text-xl font-light">
              A destination where exceptional hospitality, luxury
              accommodation, and unforgettable dining experiences come
              together in the heart of Kupwara.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 px-6 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="uppercase tracking-[0.3em] text-brand-primary text-sm">
              About TheVintageHouse Kupwara
            </span>

            <h2 className="font-serif text-4xl md:text-6xl text-brand-text mt-6 mb-8 leading-tight">
              Redefining Hospitality,
              <br />
              Dining & Luxury Stay
            </h2>

            <div className="w-24 h-[2px] bg-brand-primary mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-brand-muted text-lg leading-relaxed">
              <p>
                Located near JIC Branwari, Kupwara, TheVintageHouse
                Kupwara is a premium hotel and restaurant designed to
                provide guests with an elevated hospitality experience.
                Since its inauguration on{" "}
                <strong className="text-brand-text">
                  11 July 2024
                </strong>
                , we have welcomed travelers, families, business
                professionals, and tourists seeking comfort, quality,
                and exceptional service.
              </p>

              <p>
                Combining elegant accommodation with a modern dining
                experience, TheVintageHouse has quickly established
                itself as one of the most promising hospitality
                destinations in Kupwara. Whether you are planning a
                relaxing stay, a family dinner, a corporate event, or a
                special celebration, our team is committed to making
                every visit memorable.
              </p>

              <p>
                Managed by a dedicated team of 13 hospitality
                professionals, we focus on attention to detail,
                personalized service, and creating a welcoming
                atmosphere that reflects the warmth and beauty of
                Kashmir.
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 border border-brand-secondary/40 shadow-sm">
                <h3 className="font-serif text-3xl text-brand-text mb-4">
                  Our Mission
                </h3>

                <p className="text-brand-muted leading-relaxed">
                  To provide exceptional hospitality, premium
                  accommodation, and memorable dining experiences while
                  delivering world-class service to every guest who
                  visits TheVintageHouse Kupwara.
                </p>
              </div>

              <div className="bg-white p-8 border border-brand-secondary/40 shadow-sm">
                <h3 className="font-serif text-3xl text-brand-text mb-4">
                  Our Vision
                </h3>

                <p className="text-brand-muted leading-relaxed">
                  To become the most trusted hotel and restaurant in
                  Kupwara, recognized for excellence in hospitality,
                  comfort, dining, and customer satisfaction throughout
                  North Kashmir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-white border-y border-brand-secondary/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div>
              <h3 className="text-5xl font-serif text-brand-primary mb-2">
                9
              </h3>
              <p className="text-brand-muted uppercase tracking-widest text-xs">
                Premium Rooms
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-serif text-brand-primary mb-2">
                13
              </h3>
              <p className="text-brand-muted uppercase tracking-widest text-xs">
                Team Members
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-serif text-brand-primary mb-2">
                2024
              </h3>
              <p className="text-brand-muted uppercase tracking-widest text-xs">
                Established
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-serif text-brand-primary mb-2">
                24/7
              </h3>
              <p className="text-brand-muted uppercase tracking-widest text-xs">
                Guest Support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="py-24 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="uppercase tracking-[0.3em] text-brand-primary text-sm">
              What We Offer
            </span>

            <h2 className="font-serif text-4xl md:text-5xl text-brand-text mt-4 mb-4">
              Premium Facilities & Amenities
            </h2>

            <p className="text-brand-muted max-w-3xl mx-auto">
              Designed to meet the expectations of modern travelers,
              families, and business guests seeking quality,
              convenience, and comfort.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {facilities.map((fac, index) => (
              <div
                key={index}
                className="bg-white p-8 border border-brand-secondary/40 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-secondary/40 flex items-center justify-center text-brand-primary mb-5">
                  {fac.icon}
                </div>

                <h3 className="font-semibold text-brand-text mb-3">
                  {fac.title}
                </h3>

                <p className="text-sm text-brand-muted leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-text text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <CalendarDays
            size={50}
            className="mx-auto mb-6 text-brand-secondary"
          />

          <h2 className="font-serif text-4xl md:text-6xl mb-6">
            Experience TheVintageHouse Kupwara
          </h2>

          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
            Whether you're looking for a comfortable stay, an elegant
            dining experience, a family gathering, or a professional
            event venue, TheVintageHouse is ready to welcome you with
            warmth, comfort, and exceptional hospitality.
          </p>

          <Link href="/book">
            <button className="bg-brand-primary hover:bg-[#A65520] px-10 py-4 uppercase tracking-[0.2em] text-sm transition-all">
              Plan Your Visit
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}