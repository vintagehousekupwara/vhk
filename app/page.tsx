import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import dynamic from "next/dynamic";

// PERFORMANCE FIX: Dynamically import heavy client components to split the JS payload.
// next/dynamic automatically handles the code-splitting in Server Components.
const HomeClient = dynamic(() => import("@/components/Home/HomeClient"));
const FrontendPopup = dynamic(() => import("@/components/Home/FrontendPopup"));

// Cache this page for 30 days (Admin panel will break this cache instantly when updated)
export const revalidate = 2592000;

export default async function HomePage() {
  let rooms: any[] = [];
  let dishes: any[] = [];

  try {
    const roomsSnap = await getDocs(collection(db, "rooms"));
    rooms = roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const dishesSnap = await getDocs(collection(db, "menu"));
    dishes = dishesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching data for Home Page:", error);
  }

  // Local Business JSON-LD Schema for Google Maps and Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Hotel", "Restaurant"],
    "name": "The Vintage House Kupwara",
    "image": "https://res.cloudinary.com/dpqsadqxj/image/upload/v1780422252/Logowhite_zbzrpp.jpg",
    "description": "Premium luxury hotel and multi-cuisine restaurant located in the heart of Kupwara.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Near JIC Branwari",
      "addressLocality": "Kupwara",
      "addressRegion": "Jammu & Kashmir",
      "postalCode": "193222",
      "addressCountry": "IN"
    },
    "telephone": "+916005999400",
    "email": "ventagehouse@gmail.com",
    "url": "https://vintagehousekupwara.com", 
    "priceRange": "₹₹₹",
    "servesCuisine": ["Indian", "Kashmiri", "Continental"],
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.8"
    }
  };

  return (
    <>
      {/* Invisible Schema Markup for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* The real-time delay pop-up component */}
      <FrontendPopup />
      
      {/* Push content down below the fixed navbar */}
      <div className="pt-24 md:pt-24">
        <HomeClient rooms={rooms} dishes={dishes} />
      </div>
    </>
  );
}