
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { User, Package, Heart, CreditCard, LogOut } from "lucide-react";

interface WishlistProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
}

const UserAccount = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
        
        if (userSnap.exists()) {
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
        }
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
      await logout();
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
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">You haven't placed any orders yet</p>
                    <Button className="mt-4" onClick={() => navigate("/products")}>
                      Browse Products
                    </Button>
                  </div>
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
