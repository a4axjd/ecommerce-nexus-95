
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const PRODUCTS = [
  {
    id: "1",
    title: "Premium T-Shirt",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60",
    category: "Clothing"
  },
  {
    id: "2",
    title: "Designer Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    category: "Accessories"
  },
  {
    id: "3",
    title: "Leather Bag",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&auto=format&fit=crop&q=60",
    category: "Accessories"
  },
  {
    id: "4",
    title: "Sunglasses",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=60",
    category: "Accessories"
  }
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = selectedCategory === "all" 
    ? PRODUCTS 
    : PRODUCTS.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold">All Products</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2">
                  Category
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2">
                  Sort by
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
