import MenuClient from "@/components/menu/MenuClient";
import { getFirebaseData } from "@/lib/firestore";

// Cache for 1 hour to prevent Firebase read costs
export const revalidate = 0;

export default async function MenuPage() {
  // Fetch "products" collection from Firebase
const dishesData = await getFirebaseData("menu");
  return <MenuClient dishes={dishesData} />;
}