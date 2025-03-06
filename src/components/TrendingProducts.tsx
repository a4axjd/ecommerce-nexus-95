
import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const TrendingProducts = () => {
  const { data: products = [], isLoading } = useProducts();
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Calculate trending products (more sophisticated algorithm)
  const calculateTrending = () => {
    if (products.length) {
      // In a real app, this would take into account:
      // - Recent views
      // - Purchase frequency
      // - Stock levels
      // - Seasonal relevance
      // - etc.
      
      // For now, we'll simulate a more intelligent algorithm:
      const weightedProducts = products.map(product => {
        // Generate a "score" that would normally be based on real metrics
        const viewsWeight = Math.random() * 10; // Simulated view count importance
        const salesWeight = Math.random() * 15; // Simulated sales importance
        
        // Fix: Use product ID or another existing property instead of createdAt
        // Assume more recent products have higher IDs (common in databases)
        const productIdAsNumber = parseInt(product.id.replace(/\D/g, '')) || 0;
        const newnessWeight = Math.min(productIdAsNumber / 100, 10); // Normalize to a reasonable range
        
        return {
          ...product,
          trendingScore: viewsWeight + salesWeight + newnessWeight
        };
      });
      
      // Sort by the calculated trending score
      const sorted = [...weightedProducts].sort((a, b) => b.trendingScore - a.trendingScore);
      setTrendingProducts(sorted.slice(0, 4)); // Get top 4
      setLastUpdated(new Date());
    }
  };

  // Initial calculation when products load
  useEffect(() => {
    if (products.length) {
      calculateTrending();
    }
  }, [products]);

  // Auto-refresh trending products every hour instead of every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (products.length) {
        calculateTrending();
        console.log("Auto-refreshed trending products");
      }
    }, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(interval);
  }, [products]);

  // Handle manual refresh
  const handleRefresh = () => {
    calculateTrending();
    toast.success("Trending products updated!", { 
      duration: 3000,
      position: "bottom-right"
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh} 
              variant="ghost" 
              size="sm"
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <p className="text-sm text-muted-foreground">
              Updated {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trending products available.</p>
          </div>
        )}
        
        <div className="text-center mt-8">
          <Button asChild variant="outline" className="group">
            <Link to="/products">
              Browse All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
