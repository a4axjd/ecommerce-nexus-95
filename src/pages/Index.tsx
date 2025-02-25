
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Truck, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    title: "Premium T-Shirt",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "2",
    title: "Designer Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "3",
    title: "Leather Bag",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "4",
    title: "Sunglasses",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=60"
  },
];

const CATEGORIES = [
  {
    name: "Clothing",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Footwear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=60",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center bg-gray-50">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=60')",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
              Discover Our Collection
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 animate-fade-in">
              Curated pieces for the modern lifestyle
            </p>
            <Link to="/products">
              <Button size="lg" className="animate-slide-in group">
                Shop Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Truck className="h-8 w-8 text-gray-700" />
                <div>
                  <h3 className="font-semibold mb-1">Free Shipping</h3>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Clock className="h-8 w-8 text-gray-700" />
                <div>
                  <h3 className="font-semibold mb-1">Fast Delivery</h3>
                  <p className="text-sm text-gray-600">Get your items quickly</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Shield className="h-8 w-8 text-gray-700" />
                <div>
                  <h3 className="font-semibold mb-1">Secure Shopping</h3>
                  <p className="text-sm text-gray-600">100% secure payment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">Featured Products</h2>
              <Link to="/products">
                <Button variant="ghost" className="group">
                  View All
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_PRODUCTS.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.name}
                  to="/products"
                  className="group relative h-64 rounded-lg overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-semibold">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-700" />
              <h2 className="text-2xl font-semibold mb-4">Join Our Newsletter</h2>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter and get 10% off your first purchase
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
