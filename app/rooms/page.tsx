import RoomsClient from "@/components/rooms/RoomsClient";
import { getFirebaseData } from "@/lib/firestore";

// Cache for 1 hour to prevent Firebase read costs
export const revalidate = 3600; 

export default async function RoomsPage() {
  const roomsData = await getFirebaseData("rooms");
  return <RoomsClient rooms={roomsData} />;
}