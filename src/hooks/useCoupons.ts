
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  startDate: number;
  endDate: number;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "coupons"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Coupon[];
    },
  });
};

export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: ["coupon", id],
    queryFn: async () => {
      if (!id) return null;
      const docRef = doc(db, "coupons", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Coupon;
    },
    enabled: !!id,
  });
};

export const useValidateCoupon = (code: string, amount: number) => {
  return useQuery({
    queryKey: ["validateCoupon", code, amount],
    queryFn: async () => {
      if (!code) return null;
      
      const querySnapshot = await getDocs(
        query(collection(db, "coupons"), where("code", "==", code))
      );
      
      if (querySnapshot.empty) {
        throw new Error("Invalid coupon code");
      }
      
      const coupon = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      } as Coupon;
      
      const now = Date.now();
      
      // Check if coupon is active
      if (!coupon.isActive) {
        throw new Error("Coupon is inactive");
      }
      
      // Check date range
      if (coupon.startDate > now || coupon.endDate < now) {
        throw new Error("Coupon has expired");
      }
      
      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new Error("Coupon usage limit reached");
      }
      
      // Check minimum purchase
      if (coupon.minPurchase && amount < coupon.minPurchase) {
        throw new Error(`Minimum purchase amount of $${coupon.minPurchase.toFixed(2)} required`);
      }
      
      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (amount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }
      
      return {
        coupon,
        discountAmount: Math.min(discountAmount, amount) // Discount cannot exceed the amount
      };
    },
    enabled: !!code && amount > 0,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, "id" | "usageCount">) => {
      const docRef = await addDoc(collection(db, "coupons"), {
        ...coupon,
        usageCount: 0
      });
      return { id: docRef.id, ...coupon, usageCount: 0 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...coupon }: Coupon) => {
      await updateDoc(doc(db, "coupons", id), coupon);
      return { id, ...coupon };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon", data.id] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "coupons", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

export const useIncrementCouponUsage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, "coupons", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error("Coupon not found");
      }
      
      const coupon = docSnap.data() as Coupon;
      await updateDoc(docRef, {
        usageCount: coupon.usageCount + 1
      });
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon", id] });
    },
  });
};
