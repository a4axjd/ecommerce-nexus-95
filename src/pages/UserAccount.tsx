
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { User, Package, Heart, CreditCard, LogOut } from "lucide-react";
import { useUserOrders } from "@/hooks/useOrders";

interface WishlistProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
}

const UserAccount = () => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch user's orders
  const { data: orders = [], isLoading: isOrdersLoading } = useUserOrders();

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        // Fetch user document to get wishlist IDs
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        // Create user document if it doesn't exist
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: currentUser.email,
            displayName: currentUser.displayName,
            wishlist: []
          });
          setWishlistProducts([]);
          setIsLoading(false);
          return;
        }
        
        const userData = userSnap.data();
        const wishlistIds = userData.wishlist || [];
        
        // Fetch product details for each ID in wishlist
        const productsData: WishlistProduct[] = [];
        
        for (const productId of wishlistIds) {
          const productRef = doc(db, "products", productId);
          const productSnap = await getDoc(productRef);
          
          if (productSnap.exists()) {
            const productData = productSnap.data();
            productsData.push({
              id: productId,
              title: productData.title,
              price: productData.price,
              image: productData.image,
              category: productData.category
            });
          }
        }
        
        setWishlistProducts(productsData);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Failed to load wishlist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const clearWishlist = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { wishlist: [] });
      setWishlistProducts([]);
      toast.success("Wishlist cleared");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  if (!currentUser) {
    return null; // Navigate handles the redirect
  }

  // Helper function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Helper function to get badge color for order status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-2">
              <Button
                variant={activeTab === "profile" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button
                variant={activeTab === "orders" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("orders")}
              >
                <Package className="mr-2 h-4 w-4" />
                Orders
              </Button>
              <Button
                variant={activeTab === "wishlist" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("wishlist")}
              >
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </Button>
              <Button
                variant={activeTab === "payment" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("payment")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-primary-foreground h-16 w-16 rounded-full flex items-center justify-center text-2xl font-semibold">
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {currentUser.displayName || "User"}
                        </h3>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Account Information</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage your account details and preferences
                      </p>
                      
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border rounded" 
                            value={currentUser.displayName || ""} 
                            readOnly 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input 
                            type="email" 
                            className="w-full p-2 border rounded" 
                            value={currentUser.email || ""} 
                            readOnly 
                          />
                        </div>
                        <Button type="button" variant="outline">
                          Edit Profile
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">My Orders</h2>
                  
                  {isOrdersLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">You haven't placed any orders yet</p>
                      <Button className="mt-4" onClick={() => navigate("/products")}>
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg overflow-hidden">
                          {/* Order header */}
                          <div className="bg-gray-50 p-4 border-b">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                                <p className="text-sm text-muted-foreground">Placed on: {formatDate(order.createdAt)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Order items */}
                          <div className="p-4">
                            <h3 className="font-medium text-sm mb-3">Items</h3>
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-grow">
                                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      ${item.price.toFixed(2)} × {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-sm font-medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Order footer */}
                          <div className="bg-gray-50 p-4 border-t flex flex-wrap justify-between items-center gap-4">
                            <div>
                              <p className="text-sm font-medium">
                                Shipping to: {order.shippingAddress.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Payment Method: {order.paymentMethod}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/products`}>Buy Again</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "wishlist" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">My Wishlist</h2>
                    {wishlistProducts.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearWishlist}>
                        Clear Wishlist
                      </Button>
                    )}
                  </div>
                  
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 aspect-square rounded-lg mb-2" />
                          <div className="bg-gray-200 h-4 w-3/4 rounded mb-2" />
                          <div className="bg-gray-200 h-4 w-1/4 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : wishlistProducts.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">Your wishlist is empty</p>
                      <Button className="mt-4" onClick={() => navigate("/products")}>
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistProducts.map((product) => (
                        <ProductCard 
                          key={product.id}
                          id={product.id}
                          title={product.title}
                          price={product.price}
                          image={product.image}
                          category={product.category}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "payment" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Payment Methods</h2>
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No payment methods saved</p>
                    <Button className="mt-4">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserAccount;
