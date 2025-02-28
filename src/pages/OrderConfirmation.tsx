
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useCreateOrder } from "@/hooks/useOrders";
import { trackOrderCompletion } from "@/hooks/useAnalytics";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: cartState, clearCart } = useCart();
  const { currentUser } = useAuth();
  const createOrder = useCreateOrder();
  const [orderId, setOrderId] = useState<string | null>(null);

  // Get order details from location state or query params
  const orderDetails = location.state?.orderDetails;
  
  useEffect(() => {
    // If there's no order details, redirect to homepage
    if (!orderDetails && !orderId) {
      navigate("/");
      return;
    }

    // If we already created an order, don't create another one
    if (orderId) return;

    const saveOrder = async () => {
      try {
        if (!currentUser) {
          toast.error("You must be logged in to place an order");
          navigate("/sign-in");
          return;
        }

        console.log("Preparing to create order with items:", cartState.items);
        
        if (cartState.items.length === 0) {
          console.log("No items in cart, not creating order");
          return;
        }

        // Create the order
        const orderData = {
          userId: currentUser.uid,
          items: cartState.items.map(item => ({
            ...item,
            productId: item.id
          })),
          totalAmount: cartState.total,
          status: 'pending' as const,
          shippingAddress: orderDetails.shippingAddress,
          paymentMethod: orderDetails.paymentMethod,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        console.log("Creating order with data:", orderData);
        
        const result = await createOrder.mutateAsync(orderData);
        console.log("Order created:", result);
        
        setOrderId(result.id);
        
        // Track order completion for analytics
        await trackOrderCompletion();
        
        // Clear the cart after successful order
        clearCart();
        
        toast.success("Order placed successfully!");
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create order. Please try again.");
      }
    };

    saveOrder();
  }, [orderDetails, navigate, currentUser, cartState, clearCart, createOrder, orderId]);

  if (!orderDetails && !orderId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white p-8 rounded-lg shadow-md border text-center">
            <div className="mb-6 flex justify-center">
              <CheckCircle className="h-24 w-24 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your order has been received and is being processed.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <p><span className="font-medium">Order ID:</span> {orderId || "Processing..."}</p>
                <p><span className="font-medium">Order Date:</span> {new Date().toLocaleDateString()}</p>
                <p>
                  <span className="font-medium">Shipping Address:</span><br />
                  {orderDetails.shippingAddress.name}<br />
                  {orderDetails.shippingAddress.address}<br />
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}<br />
                  {orderDetails.shippingAddress.country}
                </p>
                <p><span className="font-medium">Payment Method:</span> {orderDetails.paymentMethod}</p>
                <p className="font-semibold">Total: ${cartState.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/account">View My Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
