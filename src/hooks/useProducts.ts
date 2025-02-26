
import { useQuery } from "@tanstack/react-query";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

// This is a temporary mock implementation until we integrate Firebase
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // TODO: Replace with Firebase query
      return [] as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      // TODO: Replace with Firebase query
      return null as Product | null;
    },
    enabled: !!id,
  });
};
