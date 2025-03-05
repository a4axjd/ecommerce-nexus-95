
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ProductVariation {
  color?: string;
  size?: string;
  stock?: number;
  price_adjustment?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  featured?: boolean;
  shippingInfo?: string;
  returnPolicy?: string;
  variations?: ProductVariation[];
  availableColors?: string[];
  availableSizes?: string[];
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("Fetching all products");
      const querySnapshot = await getDocs(collection(db, "products"));
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      console.log(`Fetched ${products.length} products`);
      return products;
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      console.log("Fetching featured products");
      const querySnapshot = await getDocs(collection(db, "products"));
      const featuredProducts = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((product: Product) => product.featured === true) as Product[];
      console.log(`Fetched ${featuredProducts.length} featured products`);
      return featuredProducts;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      console.log(`Fetching product with ID: ${id}`);
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.log(`Product with ID ${id} not found`);
        return null;
      }
      console.log(`Fetched product: ${docSnap.data()?.title}`);
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    },
    enabled: !!id,
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["productsByCategory", category],
    queryFn: async () => {
      if (!category) return [];
      console.log(`Fetching products by category: ${category}`);
      const querySnapshot = await getDocs(collection(db, "products"));
      const categoryProducts = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((product: Product) => product.category === category) as Product[];
      console.log(`Fetched ${categoryProducts.length} products in category ${category}`);
      return categoryProducts;
    },
    enabled: !!category,
  });
};
