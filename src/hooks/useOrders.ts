
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email?: string;
    phone?: string;
    state?: string;
  };
  paymentMethod: string;
  createdAt: number;
  updatedAt: number;
  couponCode?: string;
  discountAmount?: number;
}

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Fetching all orders");
      const querySnapshot = await getDocs(
        query(collection(db, "orders"), orderBy("createdAt", "desc"))
      );
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      console.log("Fetched orders:", orders);
      return orders;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Fetching single order:", id);
      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Order;
    },
    enabled: !!id,
  });
};

export const useUserOrders = () => {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ["userOrders", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      console.log("Fetching orders for user:", currentUser.uid);
      const querySnapshot = await getDocs(
        query(
          collection(db, "orders"), 
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        )
      );
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      console.log("Fetched user orders:", orders);
      return orders;
    },
    enabled: !!currentUser,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<Order, "id">) => {
      console.log("Creating new order:", order);
      const docRef = await addDoc(collection(db, "orders"), {
        ...order,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Return the created order with its ID
      const createdOrder = {
        id: docRef.id,
        ...order
      };
      
      console.log("Order created with ID:", docRef.id);
      return createdOrder;
    },
    onSuccess: () => {
      console.log("Invalidating orders queries after successful order creation");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      console.log(`Updating order ${id} status to ${status}`);
      await updateDoc(doc(db, "orders", id), { 
        status,
        updatedAt: Date.now()
      });
      return { id, status };
    },
    onSuccess: (data) => {
      console.log("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};
