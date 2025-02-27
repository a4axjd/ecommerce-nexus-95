
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((product: Product) => product.featured === true) as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    },
    enabled: !!id,
  });
};
