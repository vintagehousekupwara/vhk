"use server";

import { revalidatePath } from "next/cache";

export async function purgeWebsiteCache() {
  try {
    // This tells Next.js to immediately delete the cached snapshots 
    // and regenerate these pages in the background.
    revalidatePath("/", "page");
    revalidatePath("/menu", "page");
    revalidatePath("/book", "page");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to purge cache:", error);
    return { success: false };
  }
}