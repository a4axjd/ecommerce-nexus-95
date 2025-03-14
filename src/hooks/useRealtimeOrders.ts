
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ref, 
  get, 
  set, 
  update, 
  push, 
  query as dbQuery, 
  orderByChild, 
  equalTo, 
  onValue, 
  off
} from "firebase/database";
import { rtdb } from "@/lib/firebase";
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

const ordersRef = ref(rtdb, 'orders');

export const useOrders = () => {
  const queryClient = useQueryClient();
  const ordersQueryRef = useRef<any>(null);

  useEffect(() => {
    const ordersRef = ref(rtdb, 'orders');
    
    const handleOrdersUpdate = (snapshot: any) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersArray = Object.keys(ordersData).map(key => ({
          id: key,
          ...ordersData[key]
        }));
        
        // Sort by createdAt in descending order
        ordersArray.sort((a, b) => b.createdAt - a.createdAt);
        
        queryClient.setQueryData(["orders"], ordersArray);
      } else {
        queryClient.setQueryData(["orders"], []);
      }
    };
    
    onValue(ordersRef, handleOrdersUpdate);
    
    return () => {
      off(ordersRef);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Fetching all orders from realtime database");
      const snapshot = await get(ordersRef);
      
      if (!snapshot.exists()) {
        console.log("No orders found");
        return [];
      }
      
      const ordersData = snapshot.val();
      const ordersArray = Object.keys(ordersData).map(key => ({
        id: key,
        ...ordersData[key]
      })) as Order[];
      
      // Sort by createdAt in descending order
      ordersArray.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log("Fetched orders:", ordersArray.length);
      return ordersArray;
    },
    staleTime: 0, // Always refetch to ensure data is fresh
  });
};

export const useOrder = (id: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!id) return;
    
    const orderRef = ref(rtdb, `orders/${id}`);
    
    const handleOrderUpdate = (snapshot: any) => {
      if (snapshot.exists()) {
        const orderData = snapshot.val();
        queryClient.setQueryData(["order", id], {
          id: id,
          ...orderData
        });
      } else {
        queryClient.setQueryData(["order", id], null);
      }
    };
    
    onValue(orderRef, handleOrderUpdate);
    
    return () => {
      off(orderRef);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Fetching single order:", id);
      
      const orderRef = ref(rtdb, `orders/${id}`);
      const snapshot = await get(orderRef);
      
      if (!snapshot.exists()) return null;
      
      return {
        id: id,
        ...snapshot.val()
      } as Order;
    },
    enabled: !!id,
    staleTime: 0, // Always refetch to ensure data is fresh
  });
};

export const useUserOrders = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = useState(false);
  const listenerRef = useRef<() => void | null>();
  
  useEffect(() => {
    if (!currentUser) {
      console.log("No user, not listening for orders");
      setIsReady(false);
      return;
    }
    
    console.log("Setting up real-time user orders listener for:", currentUser.uid);
    const userOrdersRef = dbQuery(ref(rtdb, 'orders'), orderByChild('userId'), equalTo(currentUser.uid));
    
    const userOrdersListener = onValue(userOrdersRef, (snapshot) => {
      if (snapshot.exists()) {
        const userOrdersData = snapshot.val();
        const userOrdersArray = Object.keys(userOrdersData).map(key => ({
          id: key,
          ...userOrdersData[key]
        })) as Order[];
        
        // Sort by createdAt in descending order
        userOrdersArray.sort((a, b) => b.createdAt - a.createdAt);
        
        console.log("Real-time user orders update, count:", userOrdersArray.length);
        
        queryClient.setQueryData(["userOrders", currentUser.uid], userOrdersArray);
        
        // Also store each order individually in the cache
        userOrdersArray.forEach(order => {
          queryClient.setQueryData(["order", order.id], order);
        });
      } else {
        console.log("No orders found for user");
        queryClient.setQueryData(["userOrders", currentUser.uid], []);
      }
      
      setIsReady(true);
    }, (error) => {
      console.error("Error in real-time user orders listener:", error);
      setIsReady(false);
    });
    
    // Store the listener removal function
    listenerRef.current = () => off(userOrdersRef, 'value', userOrdersListener);
    
    return () => {
      console.log("Cleaning up real-time user orders listener");
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = undefined;
      }
    };
  }, [currentUser, queryClient]);
  
  return useQuery({
    queryKey: ["userOrders", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      
      console.log("Initial fetch of user orders for:", currentUser.uid);
      const userOrdersRef = dbQuery(ref(rtdb, 'orders'), orderByChild('userId'), equalTo(currentUser.uid));
      const snapshot = await get(userOrdersRef);
      
      if (!snapshot.exists()) {
        console.log("No orders found for user on initial fetch");
        return [];
      }
      
      const userOrdersData = snapshot.val();
      const userOrdersArray = Object.keys(userOrdersData).map(key => ({
        id: key,
        ...userOrdersData[key]
      })) as Order[];
      
      // Sort by createdAt in descending order
      userOrdersArray.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log("Initial user orders fetch complete, count:", userOrdersArray.length);
      
      // Store each order individually in the cache
      userOrdersArray.forEach(order => {
        queryClient.setQueryData(["order", order.id], order);
      });
      
      return userOrdersArray;
    },
    enabled: !!currentUser,
    staleTime: 60000, // 1 minute stale time
    initialData: () => {
      // Use cached data if available
      return queryClient.getQueryData(["userOrders", currentUser?.uid]) as Order[] || [];
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const idempotencyKeyRef = useRef<string>("");
  
  return useMutation({
    mutationFn: async (orderData: Omit<Order, "id">) => {
      console.log("Creating new order in realtime database:", orderData);
      
      // Generate idempotency key if not present to prevent duplicate orders
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const cleanedOrder = removeUndefinedValues(orderData);
      
      // Validation
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
      
      // Add timestamps
      cleanedOrder.createdAt = Date.now();
      cleanedOrder.updatedAt = Date.now();
      
      // Create a new reference with push() to get a unique ID
      const newOrderRef = push(ordersRef);
      const orderId = newOrderRef.key;
      
      if (!orderId) {
        throw new Error("Failed to generate order ID");
      }
      
      // Set the data at the new reference
      await set(newOrderRef, cleanedOrder);
      
      await trackOrderCompletion();
      
      const createdOrder = {
        id: orderId,
        ...cleanedOrder,
      } as Order;
      
      console.log("Order created with ID:", orderId);
      
      // Reset idempotency key after successful creation
      setTimeout(() => {
        idempotencyKeyRef.current = "";
      }, 5000);
      
      return createdOrder;
    },
    onSuccess: (data) => {
      console.log("Order creation successful, updating cache");
      
      // Update the single order query
      queryClient.setQueryData(["order", data.id], data);
      
      // Update the user's orders list
      queryClient.setQueryData(["userOrders", data.userId], (oldData: Order[] | undefined) => {
        if (!oldData) return [data];
        
        const orderExists = oldData.some(order => order.id === data.id);
        if (orderExists) {
          console.log("Order already exists in cache, not adding duplicate");
          return oldData;
        }
        
        return [data, ...oldData];
      });
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["userOrders", data.userId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      console.log(`Updating order ${id} status to ${status}`);
      
      const orderRef = ref(rtdb, `orders/${id}`);
      const snapshot = await get(orderRef);
      
      if (!snapshot.exists()) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      const currentOrder = {
        id: id,
        ...snapshot.val()
      } as Order;
      
      const updates = { 
        status,
        updatedAt: Date.now()
      };
      
      await update(orderRef, updates);
      
      return { 
        ...currentOrder, 
        ...updates
      };
    },
    onSuccess: (updatedOrder) => {
      console.log("Order status updated successfully:", updatedOrder);
      
      // Update the individual order in cache
      queryClient.setQueryData(["order", updatedOrder.id], updatedOrder);
      
      // Update the order in the user's orders list
      queryClient.setQueryData(["userOrders", updatedOrder.userId], (oldData: Order[] | undefined) => {
        if (!oldData) return [updatedOrder];
        
        return oldData.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
      });
      
      // Update the order in the all orders list
      queryClient.setQueryData(["orders"], (oldData: Order[] | undefined) => {
        if (!oldData) return [updatedOrder];
        
        return oldData.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        );
      });
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", updatedOrder.id] });
      queryClient.invalidateQueries({ queryKey: ["userOrders", updatedOrder.userId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};
