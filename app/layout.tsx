import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlobalBanner from "@/components/layout/GlobalBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: {
    default: "The Vintage House Kupwara | Best Hotel & Restaurant",
    template: "%s | The Vintage House",
  },
  description: "Experience premium luxury stays and fine dining at The Vintage House Kupwara. Rated as the best hotel and multi-cuisine restaurant in North Kashmir. Book rooms and order food online.",
  keywords: [
    "vintage house kupwara", 
    "the vintage house", 
    "the vintage house kupwara", 
    "best hotel in kupwara", 
    "top restaurant in kupwara", 
    "kupwara hotel booking", 
    "places to stay in north kashmir",
    "food delivery kupwara"
  ],
  authors: [{ name: "H Studio" }],
  creator: "H Studio",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vintagehousekupwara.com", 
    title: "The Vintage House Kupwara | Best Hotel & Restaurant",
    description: "Experience premium luxury stays and fine dining at The Vintage House Kupwara.",
    siteName: "The Vintage House",
    images: [
      {
        url: "https://res.cloudinary.com/dpqsadqxj/image/upload/v1780422252/Logowhite_zbzrpp.jpg", 
        width: 1200,
        height: 630,
        alt: "The Vintage House Kupwara Logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans text-brand-text bg-brand-bg antialiased selection:bg-brand-primary selection:text-white">
        <CartProvider>
          {/* Global Announcement Banner placed at the very top */}
          <GlobalBanner />
          
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}