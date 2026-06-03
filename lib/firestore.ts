import { collection, getDocs, query } from "firebase/firestore";
import { db } from "./firebase";

// Fetches data from Firebase and formats it cleanly for Next.js
export async function getFirebaseData(collectionName: string) {
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}