
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useProduct } from "@/hooks/useProducts";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const { addToCart } = useCart();
  
  const { data: product, isLoading } = useProduct(id || "");
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="bg-gray-200 aspect-square w-full rounded-lg mb-4" />
              <div className="bg-gray-200 h-8 w-1/2 rounded mb-4" />
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-4" />
              <div className="bg-gray-200 h-4 w-1/4 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4">
            <div className="text-center">Product not found</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }
    
    const variant = product.variants.find(v => v.id === selectedVariant);
    if (!variant) return;
    
    addToCart({
      id: product.id,
      title: product.title,
      price: variant.prices[0]?.amount / 100 || 0,
      image: product.thumbnail,
      size: variant.title,
      quantity,
    });
    
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold">{product.title}</h1>
              <p className="text-2xl">
                ${(product.variants[0]?.prices[0]?.amount / 100 || 0).toFixed(2)}
              </p>
              <p className="text-gray-600">{product.description}</p>

              {/* Variant Selection */}
              <div className="space-y-4">
                <h3 className="font-medium">Select Variant</h3>
                <div className="flex gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      onClick={() => setSelectedVariant(variant.id)}
                      className="w-12 h-12"
                    >
                      {variant.title}
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

      <Footer />
    </div>
  );
};

export default ProductDetail;
