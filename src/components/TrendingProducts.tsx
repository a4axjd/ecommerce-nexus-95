
import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const TrendingProducts = () => {
  const { data: products = [], isLoading } = useProducts();
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  
  // Simulate trending products calculation
  useEffect(() => {
    if (products.length) {
      // Normally this would be based on sales data, views, etc.
      // For now we'll just randomly select 4 products
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setTrendingProducts(shuffled.slice(0, 4));
    }
  }, [products]);

  // Auto-refresh trending products every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (products.length) {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setTrendingProducts(shuffled.slice(0, 4));
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [products]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Updated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
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
