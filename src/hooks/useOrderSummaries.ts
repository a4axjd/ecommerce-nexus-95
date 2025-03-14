
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export interface OrderSummary {
  id: string;
  userId: string;
  orderId: string;
  date: string;
  total: number;
  paymentMethod: string;
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
    postalCode?: string;
    country: string;
    email?: string;
    phone?: string;
  };
  viewed: boolean;
  createdAt: number;
  discount?: number;
  couponCode?: string;
}

export const useOrderSummaries = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ["orderSummaries", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const querySnapshot = await getDocs(
        query(
          collection(db, "orderSummaries"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OrderSummary[];
    },
    enabled: !!currentUser,
  });
};

export const useOrderSummary = (id: string) => {
  return useQuery({
    queryKey: ["orderSummary", id],
    queryFn: async () => {
      if (!id) return null;
      
      const docRef = doc(db, "orderSummaries", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as OrderSummary;
    },
    enabled: !!id,
  });
};

export const useCreateOrderSummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderSummary: Omit<OrderSummary, "id">) => {
      try {
        console.log("Creating order summary:", orderSummary);
        const docRef = await addDoc(collection(db, "orderSummaries"), orderSummary);
        
        console.log("Order summary created with ID:", docRef.id);
        return {
          id: docRef.id,
          ...orderSummary,
        } as OrderSummary;
      } catch (error) {
        console.error("Error creating order summary:", error);
        throw new Error(`Failed to create order summary: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["orderSummary", data.id], data);
      
      queryClient.setQueryData(["orderSummaries", data.userId], (old: OrderSummary[] | undefined) => {
        if (!old) return [data];
        return [data, ...old];
      });
    },
  });
};
