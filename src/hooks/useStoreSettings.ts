
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoreSettings, updateStoreSettings, StoreSettings, defaultStoreSettings } from "@/lib/storeSettings";
import { toast } from "sonner";

export const useStoreSettings = () => {
  const queryClient = useQueryClient();
  
  // Query to fetch store settings
  const { 
    data: settings = defaultStoreSettings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: getStoreSettings,
  });

  // Mutation to update store settings
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
      toast.success("Store settings updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update store settings:", error);
      toast.error("Failed to update store settings");
    }
  });

  // Predefined currency options
  const currencyOptions = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  ];

  // Predefined region options
  const regionOptions = [
    { country: "United States", countryCode: "US", timezone: "America/New_York" },
    { country: "United Kingdom", countryCode: "GB", timezone: "Europe/London" },
    { country: "European Union", countryCode: "EU", timezone: "Europe/Brussels" },
    { country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo" },
    { country: "Australia", countryCode: "AU", timezone: "Australia/Sydney" },
    { country: "Canada", countryCode: "CA", timezone: "America/Toronto" },
    { country: "China", countryCode: "CN", timezone: "Asia/Shanghai" },
    { country: "India", countryCode: "IN", timezone: "Asia/Kolkata" },
    { country: "Saudi Arabia", countryCode: "SA", timezone: "Asia/Riyadh" },
    { country: "United Arab Emirates", countryCode: "AE", timezone: "Asia/Dubai" },
  ];

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    isUpdating,
    currencyOptions,
    regionOptions
  };
};
