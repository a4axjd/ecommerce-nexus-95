
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/Cart";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state } = useCart();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Products" },
    { path: "/blogs", label: "Blog" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">Firdousia</Link>

        {isMobile ? (
          <>
            <div className="flex items-center gap-4">
              {currentUser && (
                <Link to="/account">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {isMobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 py-4">
                <nav className="container mx-auto px-4">
                  <ul className="space-y-2">
                    {navLinks.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className={`block py-2 ${
                            isActive(link.path)
                              ? "font-semibold text-primary"
                              : "text-gray-600 hover:text-primary"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    {!currentUser ? (
                      <>
                        <li>
                          <Link
                            to="/sign-in"
                            className="block py-2 text-gray-600 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/sign-up"
                            className="block py-2 text-gray-600 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </li>
                      </>
                    ) : null}
                  </ul>
                </nav>
              </div>
            )}
          </>
        ) : (
          <>
            <nav>
              <ul className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`text-sm ${
                        isActive(link.path)
                          ? "font-semibold text-primary"
                          : "text-gray-600 hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              {!currentUser ? (
                <div className="flex gap-2">
                  <Link to="/sign-in">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              ) : (
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My Account
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};
