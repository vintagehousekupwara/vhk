import HomeClient from "@/components/Home/HomeClient";
import { getFirebaseData } from "@/lib/firestore";

// THE MAGIC: This caches the Firebase data for 3600 seconds (1 hour). 
// 10,000 visitors will only equal 1 Firebase read!
export const revalidate = 3600; 

export default async function HomePage() {
  const roomsData = await getFirebaseData("rooms");
  const dishesData = await getFirebaseData("products");

  return <HomeClient rooms={roomsData} dishes={dishesData} />;
}