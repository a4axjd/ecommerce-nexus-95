
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Minus, Plus, ShoppingBag, Tag, Clock, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useProduct, useProducts } from "@/hooks/useProducts";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  
  // Track recently viewed products
  useEffect(() => {
    if (!id) return;
    
    const storedRecent = localStorage.getItem('recentlyViewed');
    const recentProducts = storedRecent ? JSON.parse(storedRecent) : [];
    
    // Add current product to recently viewed if not already there
    if (!recentProducts.includes(id)) {
      const updatedRecent = [id, ...recentProducts].slice(0, 4); // Keep only 4 recent items
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      setRecentlyViewed(updatedRecent);
    } else {
      setRecentlyViewed(recentProducts);
    }
  }, [id]);
  
  // Get related products (same category)
  const relatedProducts = allProducts
    .filter(p => p.id !== id && p.category === product?.category)
    .slice(0, 4);
  
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
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity,
    });
    
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb navigation */}
          <div className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span className="mx-2">/</span>
            <span>{product.title}</span>
          </div>

          {/* Product Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Product Image */}
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 shadow-md relative">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
              />
              {product.featured && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <span className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium mr-2">
                    {product.category}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(24 reviews)</span>
                  </div>
                </div>
                <h1 className="text-3xl font-semibold">{product.title}</h1>
                <p className="text-2xl font-bold mt-2">${product.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  <span>In Stock</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Ships in 1-2 days</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{product.description}</p>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    handleAddToCart();
                    navigate("/checkout");
                  }}
                >
                  Buy Now
                </Button>
              </div>

              {/* Product Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags:</span>
                <span className="text-sm bg-secondary px-2 py-1 rounded-full">{product.category}</span>
                <span className="text-sm bg-secondary px-2 py-1 rounded-full">trending</span>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Similar Products</h2>
                <Link to="/products" className="flex items-center text-primary text-sm font-medium hover:underline">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Product Details Tabs */}
          <div className="border-t pt-8">
            <div className="flex border-b mb-6">
              <button className="px-4 py-2 text-primary border-b-2 border-primary font-medium">Description</button>
              <button className="px-4 py-2 text-muted-foreground">Reviews (24)</button>
              <button className="px-4 py-2 text-muted-foreground">Shipping & Returns</button>
            </div>

            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p className="mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <ul className="mt-4">
                <li>High-quality materials</li>
                <li>Durable construction</li>
                <li>Easy to clean and maintain</li>
                <li>Perfect for everyday use</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
