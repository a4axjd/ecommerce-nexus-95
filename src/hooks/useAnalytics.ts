
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  recentOrders: any[];
  salesByDate: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    id: string;
    title: string;
    revenue: number;
    quantity: number;
  }[];
}

export const useAnalytics = (period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      // Calculate start date based on period
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Fetch orders in the period
      const ordersSnapshot = await getDocs(
        query(
          collection(db, "orders"), 
          where("createdAt", ">=", startDate.getTime()),
          orderBy("createdAt", "desc")
        )
      );
      
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate total revenue and total orders
      let totalRevenue = 0;
      const productMap: Record<string, { 
        id: string; 
        title: string; 
        revenue: number; 
        quantity: number 
      }> = {};
      
      // Map to track sales by date
      const salesByDateMap: Record<string, { revenue: number; orders: number }> = {};
      
      // Process orders
      orders.forEach(order => {
        totalRevenue += order.totalAmount;
        
        // Process order items for product stats
        order.items.forEach((item: any) => {
          if (!productMap[item.productId]) {
            productMap[item.productId] = {
              id: item.productId,
              title: item.title,
              revenue: 0,
              quantity: 0
            };
          }
          
          productMap[item.productId].revenue += item.price * item.quantity;
          productMap[item.productId].quantity += item.quantity;
        });
        
        // Process date for sales by date
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (!salesByDateMap[orderDate]) {
          salesByDateMap[orderDate] = { revenue: 0, orders: 0 };
        }
        
        salesByDateMap[orderDate].revenue += order.totalAmount;
        salesByDateMap[orderDate].orders += 1;
      });
      
      // Convert sales by date map to array and sort
      const salesByDate = Object.entries(salesByDateMap).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Get top products by revenue
      const topProducts = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      return {
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        recentOrders: orders.slice(0, 5),
        salesByDate,
        topProducts
      } as AnalyticsData;
    },
  });
};
