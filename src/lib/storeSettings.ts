
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface StoreSettings {
  currency: {
    code: string;
    symbol: string;
    position: "before" | "after";
  };
  region: {
    country: string;
    countryCode: string;
    timezone: string;
  };
}

export const defaultStoreSettings: StoreSettings = {
  currency: {
    code: "USD",
    symbol: "$",
    position: "before"
  },
  region: {
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York"
  }
};

// Collection reference
const SETTINGS_COLLECTION = "storeSettings";
const SETTINGS_DOC_ID = "global";

// Get the store settings
export const getStoreSettings = async (): Promise<StoreSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as StoreSettings;
    }
    
    // If no settings exist, create default settings
    await setDoc(docRef, defaultStoreSettings);
    return defaultStoreSettings;
  } catch (error) {
    console.error("Error getting store settings:", error);
    return defaultStoreSettings;
  }
};

// Update the store settings
export const updateStoreSettings = async (settings: StoreSettings): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, settings);
  } catch (error) {
    console.error("Error updating store settings:", error);
    throw error;
  }
};

// Format a price according to the store's currency settings
export const formatPrice = (price: number, settings?: StoreSettings): string => {
  // Default to USD if settings not provided
  const currency = settings?.currency || defaultStoreSettings.currency;
  
  // Format the number with the appropriate decimal places
  const formattedPrice = price.toFixed(2);
  
  // Apply the currency symbol in the correct position
  if (currency.position === "before") {
    return `${currency.symbol}${formattedPrice}`;
  } else {
    return `${formattedPrice} ${currency.symbol}`;
  }
};

// Generate a unique order ID to prevent duplicates
export const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
