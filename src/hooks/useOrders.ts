import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { trackOrderCompletion } from "@/hooks/useAnalytics";
import { useState, useEffect, useRef } from "react";

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

const removeUndefinedValues = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }

  const cleanedObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleanedObj[key] = typeof obj[key] === 'object' 
        ? removeUndefinedValues(obj[key]) 
        : obj[key];
    }
  });
  
  return cleanedObj;
};

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
  const [ordersRealtime, setOrdersRealtime] = useState<Order[]>([]);
  const [isRealtimeReady, setIsRealtimeReady] = useState(false);
  const unsubscribeRef = useRef<() => void | null>();
  
  const result = useQuery({
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
  
  useEffect(() => {
    if (!currentUser) {
      setOrdersRealtime([]);
      setIsRealtimeReady(false);
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }
      return;
    }
    
    console.log("Setting up real-time order listener for user:", currentUser.uid);
    
    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    if (unsubscribeRef.current) {
      console.log("Listener already exists, skipping setup");
      return;
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      console.log("Real-time order update received, orders count:", updatedOrders.length);
      setOrdersRealtime(updatedOrders);
      setIsRealtimeReady(true);
    }, (error) => {
      console.error("Error in real-time order listener:", error);
      setIsRealtimeReady(false);
    });
    
    unsubscribeRef.current = unsubscribe;
    
    return () => {
      console.log("Cleaning up real-time order listener");
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }
    };
  }, [currentUser]);
  
  return {
    ...result,
    data: isRealtimeReady ? ordersRealtime : result.data,
    isLoading: result.isLoading && !isRealtimeReady,
  };
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<Order, "id">) => {
      console.log("Creating new order:", order);
      
      const cleanedOrder = removeUndefinedValues(order);
      
      if (!cleanedOrder.userId) {
        throw new Error("Order must have a user ID");
      }
      
      if (!cleanedOrder.items || !Array.isArray(cleanedOrder.items) || cleanedOrder.items.length === 0) {
        throw new Error("Order must have at least one item");
      }
      
      if (typeof cleanedOrder.totalAmount !== 'number') {
        throw new Error("Order must have a valid total amount");
      }
      
      if (!cleanedOrder.shippingAddress || !cleanedOrder.shippingAddress.name) {
        throw new Error("Order must have valid shipping address information");
      }
      
      if (!cleanedOrder.paymentMethod) {
        throw new Error("Order must have a payment method");
      }
      
      cleanedOrder.items.forEach((item, index) => {
        if (!item.id || !item.productId || !item.title || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          throw new Error(`Invalid item at index ${index}`);
        }
      });
      
      const docRef = await addDoc(collection(db, "orders"), {
        ...cleanedOrder,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      await trackOrderCompletion();
      
      const createdOrder = {
        id: docRef.id,
        ...cleanedOrder,
        createdAt: Date.now(),
        updatedAt: Date.now()
      } as Order;
      
      console.log("Order created with ID:", docRef.id);
      return createdOrder;
    },
    onSuccess: (data) => {
      console.log("Invalidating orders queries after successful order creation");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      
      queryClient.setQueryData(["userOrders", data.userId], (oldData: Order[] | undefined) => {
        if (!oldData) return [data];
        
        const orderExists = oldData.some(order => order.id === data.id);
        if (orderExists) {
          console.log("Order already exists in cache, not adding duplicate");
          return oldData;
        }
        
        return [data, ...oldData];
      });
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
      
      queryClient.setQueriesData({ queryKey: ["userOrders"] }, (oldData: Order[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(order => 
          order.id === data.id 
            ? { ...order, status: data.status, updatedAt: Date.now() } 
            : order
        );
      });
    },
  });
};
