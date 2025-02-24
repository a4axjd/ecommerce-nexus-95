
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/Cart";
import { useCart } from "@/context/CartContext";

export const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { state } = useCart();

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">
            STORE
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/products" className="hover:text-gray-600 transition-colors">
              All Products
            </Link>
            <Link to="/categories" className="hover:text-gray-600 transition-colors">
              Categories
            </Link>
            <Link to="/about" className="hover:text-gray-600 transition-colors">
              About
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
