
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const PRODUCTS = [
  {
    id: "1",
    title: "Premium T-Shirt",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60",
    description: "A premium quality t-shirt made from 100% organic cotton. Perfect for everyday wear.",
    sizes: ["S", "M", "L", "XL"],
  },
  // ... Add more products as needed
];

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  
  const product = PRODUCTS.find(p => p.id === id);
  
  if (!product) {
    return <div>Product not found</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    
    toast.success("Added to cart");
    // TODO: Implement cart functionality
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold">{product.title}</h1>
              <p className="text-2xl">${product.price.toFixed(2)}</p>
              <p className="text-gray-600">{product.description}</p>

              {/* Size Selection */}
              <div className="space-y-4">
                <h3 className="font-medium">Select Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className="w-12 h-12"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-4">
                <h3 className="font-medium">Quantity</h3>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
