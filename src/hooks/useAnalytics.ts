
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy, getDoc, doc, setDoc, increment, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "./useOrders";

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  recentOrders: Order[];
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
  visitorStats: {
    totalVisitors: number;
    newVisitors: number;
    returningVisitors: number;
  };
  cartActivity: {
    addedToCart: number;
    cartAbandonment: number;
    conversionRate: number;
    topAddedProducts: {
      id: string;
      title: string;
      count: number;
    }[];
  };
}

// Function to track a page visit
export const trackPageVisit = async (userId?: string) => {
  try {
    const isNewVisitor = !userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const visitorStatsRef = doc(db, "analytics", "visitorStats");
    const visitorStatsSnap = await getDoc(visitorStatsRef);
    
    if (!visitorStatsSnap.exists()) {
      await setDoc(visitorStatsRef, {
        totalVisits: 1,
        newVisitors: isNewVisitor ? 1 : 0,
        returningVisitors: isNewVisitor ? 0 : 1,
        lastUpdated: Timestamp.now()
      });
    } else {
      await setDoc(visitorStatsRef, {
        totalVisits: increment(1),
        newVisitors: isNewVisitor ? increment(1) : increment(0),
        returningVisitors: isNewVisitor ? increment(0) : increment(1),
        lastUpdated: Timestamp.now()
      }, { merge: true });
    }
    
    // Track daily stats
    const dailyStatsRef = doc(db, "analytics", `daily_${today.toISOString().split('T')[0]}`);
    const dailyStatsSnap = await getDoc(dailyStatsRef);
    
    if (!dailyStatsSnap.exists()) {
      await setDoc(dailyStatsRef, {
        pageVisits: 1,
        newVisitors: isNewVisitor ? 1 : 0,
        returningVisitors: isNewVisitor ? 0 : 1,
        addedToCart: 0,
        completedOrders: 0,
        date: today.getTime()
      });
    } else {
      await setDoc(dailyStatsRef, {
        pageVisits: increment(1),
        newVisitors: isNewVisitor ? increment(1) : increment(0),
        returningVisitors: isNewVisitor ? increment(0) : increment(1)
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error tracking page visit:", error);
  }
};

// Function to track cart additions
export const trackCartAddition = async (productId: string, productTitle: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Track in overall cart stats
    const cartStatsRef = doc(db, "analytics", "cartStats");
    await setDoc(cartStatsRef, {
      totalAddedToCart: increment(1),
      lastUpdated: Timestamp.now()
    }, { merge: true });
    
    // Track in daily stats
    const dailyStatsRef = doc(db, "analytics", `daily_${today.toISOString().split('T')[0]}`);
    await setDoc(dailyStatsRef, {
      addedToCart: increment(1)
    }, { merge: true });
    
    // Track product-specific stats
    const productStatsRef = doc(db, "analytics", `product_${productId}`);
    await setDoc(productStatsRef, {
      addedToCart: increment(1),
      productId,
      title: productTitle,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error tracking cart addition:", error);
  }
};

// Function to track order completion
export const trackOrderCompletion = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Track in daily stats
    const dailyStatsRef = doc(db, "analytics", `daily_${today.toISOString().split('T')[0]}`);
    await setDoc(dailyStatsRef, {
      completedOrders: increment(1)
    }, { merge: true });
  } catch (error) {
    console.error("Error tracking order completion:", error);
  }
};

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
      })) as Order[];
      
      console.log(`Fetched ${orders.length} orders for analytics in ${period} period`);
      
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
        order.items.forEach((item) => {
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
      
      // Fetch visitor stats
      const visitorStatsDoc = await getDoc(doc(db, "analytics", "visitorStats"));
      const visitorStats = {
        totalVisitors: 0,
        newVisitors: 0,
        returningVisitors: 0
      };
      
      if (visitorStatsDoc.exists()) {
        const data = visitorStatsDoc.data();
        visitorStats.totalVisitors = data.totalVisits || 0;
        visitorStats.newVisitors = data.newVisitors || 0;
        visitorStats.returningVisitors = data.returningVisitors || 0;
      }
      
      // Fetch cart stats
      const cartStatsDoc = await getDoc(doc(db, "analytics", "cartStats"));
      const cartActivity = {
        addedToCart: 0,
        cartAbandonment: 0,
        conversionRate: 0,
        topAddedProducts: [] as { id: string; title: string; count: number }[]
      };
      
      if (cartStatsDoc.exists()) {
        const data = cartStatsDoc.data();
        cartActivity.addedToCart = data.totalAddedToCart || 0;
        
        // Calculate cart abandonment and conversion rate
        cartActivity.cartAbandonment = Math.max(0, cartActivity.addedToCart - orders.length);
        cartActivity.conversionRate = cartActivity.addedToCart > 0 
          ? (orders.length / cartActivity.addedToCart) * 100 
          : 0;
      }
      
      // Fetch top added to cart products
      const productStatsSnapshot = await getDocs(
        query(
          collection(db, "analytics"),
          where("productId", "!=", null),
          orderBy("productId"),
          orderBy("addedToCart", "desc")
        )
      );
      
      cartActivity.topAddedProducts = productStatsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: data.productId,
            title: data.title,
            count: data.addedToCart
          };
        })
        .slice(0, 5);
      
      return {
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        recentOrders: orders.slice(0, 5),
        salesByDate,
        topProducts,
        visitorStats,
        cartActivity
      } as AnalyticsData;
    },
  });
};
