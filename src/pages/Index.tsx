
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";

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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Our Collection
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in">
              Curated pieces for the modern lifestyle
            </p>
            <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors animate-slide-in">
              Shop Now
            </button>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-8">Featured Products</h2>
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
              {["Clothing", "Accessories", "Footwear"].map((category) => (
                <div
                  key={category}
                  className="relative h-64 rounded-lg overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-semibold">{category}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
