import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface DailyInventory {
  kingSize: { available: number; rate: number };
  doubleBed: { available: number; rate: number };
  childCharge: number;
}

export interface RoomImages {
  kingSizeUrl: string;
  doubleBedUrl: string;
}

// Default values to prevent undefined errors
const defaultInventory: DailyInventory = {
  kingSize: { available: 5, rate: 5000 },
  doubleBed: { available: 8, rate: 3500 },
  childCharge: 500,
};

const defaultImages: RoomImages = {
  kingSizeUrl: "",
  doubleBedUrl: "",
};

// 1. Fetch Daily Pricing
export const getInventoryForDate = async (dateStr: string): Promise<DailyInventory> => {
  try {
    const docSnap = await getDoc(doc(db, "daily_inventory", dateStr));
    return docSnap.exists() ? (docSnap.data() as DailyInventory) : defaultInventory;
  } catch (error) {
    return defaultInventory;
  }
};

// 2. Save Daily Pricing
export const setInventoryForDate = async (dateStr: string, data: DailyInventory) => {
  try {
    await setDoc(doc(db, "daily_inventory", dateStr), data, { merge: true });
    return true;
  } catch (error) {
    return false;
  }
};

// 3. Fetch Global Room Images
export const getGlobalRoomImages = async (): Promise<RoomImages> => {
  try {
    const docSnap = await getDoc(doc(db, "global_settings", "room_images"));
    return docSnap.exists() ? (docSnap.data() as RoomImages) : defaultImages;
  } catch (error) {
    return defaultImages;
  }
};

// 4. Save Global Room Images
export const setGlobalRoomImages = async (data: RoomImages) => {
  try {
    await setDoc(doc(db, "global_settings", "room_images"), data, { merge: true });
    return true;
  } catch (error) {
    return false;
  }
};