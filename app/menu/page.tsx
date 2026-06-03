import MenuClient from "@/components/menu/MenuClient";
import { getFirebaseData } from "@/lib/firestore";

// Cache for 1 hour to prevent Firebase read costs
export const revalidate = 3600;

export default async function MenuPage() {
  // Fetch "products" collection from Firebase
  const dishesData = await getFirebaseData("products");

  return <MenuClient dishes={dishesData} />;
}