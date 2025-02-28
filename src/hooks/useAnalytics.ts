
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
    
    // Log tracking attempt
    console.log(`Tracking page visit. User ID: ${userId ? userId : 'anonymous'}`);
    
    const visitorStatsRef = doc(db, "analytics", "visitorStats");
    const visitorStatsSnap = await getDoc(visitorStatsRef);
    
    if (!visitorStatsSnap.exists()) {
      console.log("Creating new visitorStats document");
      await setDoc(visitorStatsRef, {
        totalVisits: 1,
        newVisitors: isNewVisitor ? 1 : 0,
        returningVisitors: isNewVisitor ? 0 : 1,
        lastUpdated: Timestamp.now()
      });
    } else {
      console.log("Updating existing visitorStats document");
      await setDoc(visitorStatsRef, {
        totalVisits: increment(1),
        newVisitors: isNewVisitor ? increment(1) : increment(0),
        returningVisitors: isNewVisitor ? increment(0) : increment(1),
        lastUpdated: Timestamp.now()
      }, { merge: true });
    }
    
    // Track daily stats
    const dailyKey = `daily_${today.toISOString().split('T')[0]}`;
    console.log(`Updating daily stats for: ${dailyKey}`);
    
    const dailyStatsRef = doc(db, "analytics", dailyKey);
    const dailyStatsSnap = await getDoc(dailyStatsRef);
    
    if (!dailyStatsSnap.exists()) {
      console.log("Creating new daily stats document");
      await setDoc(dailyStatsRef, {
        pageVisits: 1,
        newVisitors: isNewVisitor ? 1 : 0,
        returningVisitors: isNewVisitor ? 0 : 1,
        addedToCart: 0,
        completedOrders: 0,
        date: today.getTime()
      });
    } else {
      console.log("Updating existing daily stats document");
      await setDoc(dailyStatsRef, {
        pageVisits: increment(1),
        newVisitors: isNewVisitor ? increment(1) : increment(0),
        returningVisitors: isNewVisitor ? increment(0) : increment(1)
      }, { merge: true });
    }
    
    console.log("Successfully tracked page visit");
  } catch (error) {
    console.error("Error tracking page visit:", error);
  }
};

// Function to track cart additions
export const trackCartAddition = async (productId: string, productTitle: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`Tracking cart addition: ${productTitle} (${productId})`);
    
    // Track in overall cart stats
    const cartStatsRef = doc(db, "analytics", "cartStats");
    await setDoc(cartStatsRef, {
      totalAddedToCart: increment(1),
      lastUpdated: Timestamp.now()
    }, { merge: true });
    
    // Track in daily stats
    const dailyKey = `daily_${today.toISOString().split('T')[0]}`;
    const dailyStatsRef = doc(db, "analytics", dailyKey);
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
    
    console.log("Successfully tracked cart addition");
  } catch (error) {
    console.error("Error tracking cart addition:", error);
  }
};

// Function to track order completion
export const trackOrderCompletion = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log("Tracking order completion");
    
    // Track in daily stats
    const dailyKey = `daily_${today.toISOString().split('T')[0]}`;
    const dailyStatsRef = doc(db, "analytics", dailyKey);
    
    // Create the document if it doesn't exist
    const dailyStatsSnap = await getDoc(dailyStatsRef);
    if (!dailyStatsSnap.exists()) {
      await setDoc(dailyStatsRef, {
        pageVisits: 0,
        newVisitors: 0,
        returningVisitors: 0,
        addedToCart: 0,
        completedOrders: 1,
        date: today.getTime()
      });
    } else {
      await setDoc(dailyStatsRef, {
        completedOrders: increment(1)
      }, { merge: true });
    }
    
    console.log("Successfully tracked order completion");
  } catch (error) {
    console.error("Error tracking order completion:", error);
  }
};

export const useAnalytics = (period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      console.log(`Fetching analytics data for period: ${period}`);
      
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
      
      console.log(`Date range: ${startDate.toISOString()} to ${now.toISOString()}`);
      
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
      
      // If we don't have any orders, create some empty data for display purposes
      if (Object.keys(salesByDateMap).length === 0) {
        // Generate date entries for the entire period
        let current = new Date(startDate);
        while (current <= now) {
          const dateKey = current.toISOString().split('T')[0];
          salesByDateMap[dateKey] = { revenue: 0, orders: 0 };
          current.setDate(current.getDate() + 1);
        }
      }
      
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
        console.log("Fetched visitor stats:", visitorStats);
      } else {
        console.log("No visitor stats found, creating empty data");
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
        
        console.log("Fetched cart stats:", cartActivity);
      } else {
        console.log("No cart stats found, creating empty data");
      }
      
      // Fetch top added to cart products
      let topAddedProducts: { id: string; title: string; count: number }[] = [];
      try {
        const productStatsSnapshot = await getDocs(
          query(
            collection(db, "analytics"),
            where("productId", "!=", null)
          )
        );
        
        topAddedProducts = productStatsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: data.productId,
              title: data.title,
              count: data.addedToCart
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        console.log(`Fetched ${topAddedProducts.length} top added products`);
      } catch (error) {
        console.error("Error fetching top added products:", error);
      }
      
      cartActivity.topAddedProducts = topAddedProducts;
      
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
