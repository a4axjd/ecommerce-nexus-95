
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check, ChevronRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { mutateAsync: createOrder } = useCreateOrder();
  const [orderProcessed, setOrderProcessed] = useState(false);
  
  // Get order details from location state
  const orderDetails = location.state?.orderDetails;
  
  useEffect(() => {
    // If no order details or cart is empty, redirect to home
    if (!orderDetails || cartState.items.length === 0) {
      navigate("/");
      return;
    }
    
    // Prevent duplicate order creation
    if (orderProcessed) {
      return;
    }
    
    const createNewOrder = async () => {
      try {
        setOrderProcessed(true);
        
        // Create order items from cart items
        const orderItems = cartState.items.map(item => ({
          id: `${item.id}-${Date.now()}`, // Generate a unique ID for each order item
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));
        
        // Create new order
        const newOrder = {
          userId: currentUser?.uid || "guest",
          items: orderItems,
          totalAmount: orderDetails.total,
          status: "pending" as const,
          shippingAddress: {
            name: orderDetails.shippingAddress.name,
            address: orderDetails.shippingAddress.address,
            city: orderDetails.shippingAddress.city,
            state: orderDetails.shippingAddress.state || "",
            postalCode: orderDetails.shippingAddress.zipCode,
            country: orderDetails.shippingAddress.country,
            email: orderDetails.shippingAddress.email,
            phone: orderDetails.shippingAddress.phone
          },
          paymentMethod: orderDetails.paymentMethod,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        // Add coupon code and discount amount if available
        if (orderDetails.couponCode) {
          newOrder.couponCode = orderDetails.couponCode;
        }
        
        if (orderDetails.discount > 0) {
          newOrder.discountAmount = orderDetails.discount;
        }
        
        // Save order to database
        await createOrder(newOrder);
        
        // Clear cart after successful order
        clearCart();
        
        console.log("Order created successfully!");
        toast.success("Order placed successfully!");
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create order: " + (error instanceof Error ? error.message : String(error)));
        setOrderProcessed(false);
      }
    };
    
    createNewOrder();
  }, [orderDetails, cartState, navigate, clearCart, createOrder, currentUser?.uid, orderProcessed]);
  
  // If no order details, show loading
  if (!orderDetails) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="grid gap-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Order Date</span>
                <span>{new Date(orderDetails.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{orderDetails.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Shipping Address</span>
                <div className="text-right">
                  <p>{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.address}</p>
                  <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="font-semibold">Total Amount</span>
                <span className="font-semibold">${orderDetails.total.toFixed(2)}</span>
              </div>
              
              {orderDetails.discount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Discount Applied</span>
                  <span>-${orderDetails.discount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border mb-8">
            <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                  <span className="text-xs font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an order confirmation email with details of your purchase.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                  <span className="text-xs font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">
                    We're preparing your order for shipment. This typically takes 1-2 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                  <span className="text-xs font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    Once your order ships, you'll receive a shipping confirmation email with tracking information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                  <span className="text-xs font-semibold">4</span>
                </div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Your order will be delivered within 3-5 business days of shipping.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="/account">
                View Order History
              </a>
            </Button>
            <Button asChild>
              <a href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </a>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
