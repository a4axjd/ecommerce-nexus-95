
import { useQuery } from "@tanstack/react-query";
import medusa from "@/lib/medusa";
import { MedusaProduct } from "@/types/medusa";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { products } = await medusa.products.list();
      return products as MedusaProduct[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { product } = await medusa.products.retrieve(id);
      return product as MedusaProduct;
    },
    enabled: !!id,
  });
};
