import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FireSparks from "@/components/animated/FireSparks";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TheVintageHouse | Luxury Stay & Dining",
  description: "Where Luxury Stay Meets Exceptional Dining. Experience a premium boutique hotel and world-class restaurant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans flex flex-col min-h-screen relative overflow-x-hidden bg-brand-bg">
        <CartProvider>
          {/* Global Fire Sparks Background */}
          <FireSparks />
          
          <Navbar />
          
          {/* Main Content wrapper - z-10 ensures it sits above the sparks */}
          <div className="flex-grow pt-20 md:pt-24 relative z-10">
            {children}
          </div>
          
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}