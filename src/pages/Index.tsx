
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Clock, 
  Shield, 
  BookOpen,
  Star,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedProducts, useProducts } from "@/hooks/useProducts";
import { useFeaturedBlogs } from "@/hooks/useBlogs";
import { HeroCarousel } from "@/components/HeroCarousel";
import { TrendingProducts } from "@/components/TrendingProducts";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const CATEGORIES = [
  {
    name: "Streetwear",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=60",
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

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Regular Customer",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    content: "I've been shopping here for years and the quality never disappoints. The customer service is exceptional!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "First-time Buyer",
    avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    content: "Was skeptical at first, but the products exceeded my expectations. Will definitely shop again!",
    rating: 4
  },
  {
    name: "Emily Rodriguez",
    role: "Fashion Enthusiast",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Found some unique pieces that I couldn't find anywhere else. The shipping was fast and the packaging was great.",
    rating: 5
  }
];

const Index = () => {
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: featuredBlogs, isLoading: blogsLoading } = useFeaturedBlogs();
  const { data: allProducts = [] } = useProducts();
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [showNewsletter, setShowNewsletter] = useState(false);
  
  // Get recently viewed products from localStorage
  useEffect(() => {
    const storedRecent = localStorage.getItem('recentlyViewed');
    if (storedRecent) {
      setRecentlyViewed(JSON.parse(storedRecent));
    }
  }, []);
  
  // Show newsletter popup after 5 seconds
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenNewsletterPopup');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowNewsletter(true);
        localStorage.setItem('hasSeenNewsletterPopup', 'true');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Filter products to get recently viewed items
  const recentlyViewedProducts = allProducts.filter(
    product => recentlyViewed.includes(product.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Carousel Section */}
        <section>
          <HeroCarousel />
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 p-6 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors shadow-sm">
                <Truck className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Free Shipping</h3>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors shadow-sm">
                <Clock className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Fast Delivery</h3>
                  <p className="text-sm text-gray-600">Get your items quickly</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors shadow-sm">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold mb-1">Secure Shopping</h3>
                  <p className="text-sm text-gray-600">100% secure payment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Products Section */}
        <TrendingProducts />

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <section className="py-16 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-semibold">Recently Viewed</h2>
                  <p className="text-muted-foreground">Products you've checked out recently</p>
                </div>
                <Link to="/products">
                  <Button variant="ghost" className="group">
                    View All
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyViewedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our handpicked selection of the finest products, chosen for their quality and style
              </p>
            </div>
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No featured products available.</p>
              </div>
            )}
            <div className="text-center mt-10">
              <Button asChild size="lg">
                <Link to="/products" className="inline-flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop All Products
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse our collections by category to find exactly what you're looking for
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.name}
                  to="/products"
                  className="group relative h-80 rounded-lg overflow-hidden shadow-lg"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 py-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                      <span className="inline-block text-white/80 text-sm">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it — hear from our satisfied customers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`h-4 w-4 ${idx < testimonial.rating ? 'text-amber-500' : 'text-gray-300'}`} fill={idx < testimonial.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter and get 10% off your first purchase, plus stay updated on new arrivals and exclusive offers.
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button 
                  size="lg"
                  onClick={() => setShowNewsletter(true)}
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Blogs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">From Our Blog</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Read our latest articles for fashion tips, product insights, and style inspiration
              </p>
            </div>
            {blogsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : featuredBlogs && featuredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredBlogs.map((blog) => (
                  <Link 
                    key={blog.id} 
                    to={`/blogs/${blog.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg hover:translate-y-[-5px]"
                  >
                    <div className="h-56 overflow-hidden">
                      <img 
                        src={blog.imageUrl} 
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-xl mb-3">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {blog.content.substring(0, 120)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          By {blog.author} | {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center text-primary text-sm font-medium">
                          Read more
                          <BookOpen className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No featured blog posts available.</p>
              </div>
            )}
            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg">
                <Link to="/blogs">View All Articles</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Newsletter Popup */}
      <NewsletterSignup 
        isOpen={showNewsletter} 
        onClose={() => setShowNewsletter(false)} 
      />
    </div>
  );
};

export default Index;
