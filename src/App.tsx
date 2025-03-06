
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from "@/lib/stripe";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { trackPageVisit } from "@/hooks/useAnalytics";
import { useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import BlogAdmin from "./pages/BlogAdmin";
import OrdersAdmin from "./pages/OrdersAdmin";
import AnalyticsAdmin from "./pages/AnalyticsAdmin";
import CouponsAdmin from "./pages/CouponsAdmin";
import StoreSettingsAdmin from "./pages/StoreSettingsAdmin";
import AdminSignIn from "./pages/AdminSignIn";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import UserAccount from "./pages/UserAccount";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Analytics tracker component
const AnalyticsTracker = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Track page visit when location changes
    trackPageVisit(currentUser?.uid).catch(error => 
      console.error("Failed to track page visit:", error)
    );
  }, [location.pathname, currentUser]);

  return null;
};

// Add Nytheris theme
const applyNytherisTheme = () => {
  // Update the document title
  document.title = "Nytheris | Modern Streetwear from Pakistan";
  
  // Update theme colors
  document.documentElement.style.setProperty('--primary', '24 9.8% 10%');
  document.documentElement.style.setProperty('--primary-foreground', '60 9.1% 97.8%');
  document.documentElement.style.setProperty('--secondary', '60 4.8% 95.9%');
  document.documentElement.style.setProperty('--secondary-foreground', '24 9.8% 10%');
};

function App() {
  // Apply theme when app loads
  useEffect(() => {
    applyNytherisTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CartProvider>
            <Elements stripe={stripePromise}>
              <Sonner position="top-right" />
              <BrowserRouter>
                <AnalyticsTracker />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:id" element={<BlogPost />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route 
                    path="/account" 
                    element={
                      <ProtectedRoute>
                        <UserAccount />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/admin/sign-in" element={<AdminSignIn />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/blogs" 
                    element={
                      <ProtectedRoute>
                        <BlogAdmin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders" 
                    element={
                      <ProtectedRoute>
                        <OrdersAdmin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/analytics" 
                    element={
                      <ProtectedRoute>
                        <AnalyticsAdmin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/coupons" 
                    element={
                      <ProtectedRoute>
                        <CouponsAdmin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <ProtectedRoute>
                        <StoreSettingsAdmin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              <Toaster />
            </Elements>
          </CartProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
