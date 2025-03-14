
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ref, get, set, push, onValue, off } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export interface OrderSummary {
  id: string;
  userId: string;
  orderId: string;
  date: string;
  total: number;
  paymentMethod: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    email?: string;
    phone?: string;
  };
  discount?: number;
  couponCode?: string;
  viewed: boolean;
  createdAt: number;
}

const orderSummariesRef = ref(rtdb, 'orderSummaries');

export const useOrderSummaries = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!currentUser) return;
    
    console.log("Setting up realtime listener for user order summaries");
    const userSummariesRef = ref(rtdb, `orderSummaries/${currentUser.uid}`);
    
    const handleSummariesUpdate = (snapshot: any) => {
      if (snapshot.exists()) {
        const summariesData = snapshot.val();
        const summariesArray = Object.keys(summariesData).map(key => ({
          id: key,
          ...summariesData[key]
        })) as OrderSummary[];
        
        // Sort by createdAt in descending order
        summariesArray.sort((a, b) => b.createdAt - a.createdAt);
        
        queryClient.setQueryData(["orderSummaries", currentUser.uid], summariesArray);
      } else {
        queryClient.setQueryData(["orderSummaries", currentUser.uid], []);
      }
    };
    
    onValue(userSummariesRef, handleSummariesUpdate);
    
    return () => {
      off(userSummariesRef);
    };
  }, [currentUser, queryClient]);

  return useQuery({
    queryKey: ["orderSummaries", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const userSummariesRef = ref(rtdb, `orderSummaries/${currentUser.uid}`);
      const snapshot = await get(userSummariesRef);
      
      if (!snapshot.exists()) return [];
      
      const summariesData = snapshot.val();
      const summariesArray = Object.keys(summariesData).map(key => ({
        id: key,
        ...summariesData[key]
      })) as OrderSummary[];
      
      // Sort by createdAt in descending order
      summariesArray.sort((a, b) => b.createdAt - a.createdAt);
      
      return summariesArray;
    },
    enabled: !!currentUser,
  });
};

export const useCreateOrderSummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (summaryData: Omit<OrderSummary, "id">) => {
      console.log("Creating new order summary in realtime database:", summaryData);
      
      if (!rtdb) {
        throw new Error("Realtime Database not initialized");
      }
      
      const userSummariesRef = ref(rtdb, `orderSummaries/${summaryData.userId}`);
      const newSummaryRef = push(userSummariesRef);
      const summaryId = newSummaryRef.key;
      
      if (!summaryId) {
        throw new Error("Failed to generate summary ID");
      }
      
      await set(newSummaryRef, summaryData);
      
      return {
        id: summaryId,
        ...summaryData,
      } as OrderSummary;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["orderSummary", data.id], data);
      
      queryClient.setQueryData(["orderSummaries", data.userId], (oldData: OrderSummary[] | undefined) => {
        if (!oldData) return [data];
        return [data, ...oldData];
      });
    },
  });
};

export const useOrderSummary = (id: string, userId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!id || !userId) return;
    
    const summaryRef = ref(rtdb, `orderSummaries/${userId}/${id}`);
    
    const handleSummaryUpdate = (snapshot: any) => {
      if (snapshot.exists()) {
        const summaryData = snapshot.val();
        queryClient.setQueryData(["orderSummary", id], {
          id,
          ...summaryData
        });
      } else {
        queryClient.setQueryData(["orderSummary", id], null);
      }
    };
    
    onValue(summaryRef, handleSummaryUpdate);
    
    return () => {
      off(summaryRef);
    };
  }, [id, userId, queryClient]);

  return useQuery({
    queryKey: ["orderSummary", id],
    queryFn: async () => {
      if (!id || !userId) return null;
      
      const summaryRef = ref(rtdb, `orderSummaries/${userId}/${id}`);
      const snapshot = await get(summaryRef);
      
      if (!snapshot.exists()) return null;
      
      return {
        id,
        ...snapshot.val()
      } as OrderSummary;
    },
    enabled: !!id && !!userId,
  });
};

export const useMarkOrderSummaryAsViewed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const summaryRef = ref(rtdb, `orderSummaries/${userId}/${id}`);
      const snapshot = await get(summaryRef);
      
      if (!snapshot.exists()) {
        throw new Error("Order summary not found");
      }
      
      await set(summaryRef, {
        ...snapshot.val(),
        viewed: true
      });
      
      return {
        id,
        ...snapshot.val(),
        viewed: true
      } as OrderSummary;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["orderSummary", data.id], data);
      
      queryClient.setQueryData(["orderSummaries", data.userId], (oldData: OrderSummary[] | undefined) => {
        if (!oldData) return [data];
        return oldData.map(summary => 
          summary.id === data.id ? data : summary
        );
      });
    },
  });
};
