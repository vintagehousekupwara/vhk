import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MenuClient from "@/components/menu/MenuClient";

// Cache for 30 days, invalidated by Admin action
export const revalidate = 2592000;

export const metadata = {
  title: "Fine Dining Menu",
  description: "Explore the culinary masterpieces at The Vintage House Kupwara. From authentic Kashmiri Wazwan to Continental delicacies.",
};

export default async function MenuPage() {
  let menuItems: any[] = [];

  try {
    const menuSnap = await getDocs(collection(db, "menu"));
    menuItems = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching menu:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "The Vintage House Menu",
    "url": "https://vintagehousekupwara.com/menu",
    "mainEntityOfPage": "https://vintagehousekupwara.com/menu",
    "provider": {
      "@type": "Restaurant",
      "name": "The Vintage House Kupwara"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="pt-24 md:pt-28 min-h-screen bg-brand-bg">
        <MenuClient dishes={menuItems} />
      </div>
    </>
  );
}