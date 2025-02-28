
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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: cartState, clearCart } = useCart();
  const { currentUser } = useAuth();
  const createOrder = useCreateOrder();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderProcessed, setOrderProcessed] = useState(false);

  // Get order details from location state
  const orderDetails = location.state?.orderDetails;
  
  useEffect(() => {
    // If there's no order details, redirect to homepage
    if (!orderDetails) {
      console.error("No order details found");
      navigate("/");
      return;
    }

    // If we already created an order or are currently processing, don't create another one
    if (orderId || orderProcessed) return;

    const saveOrder = async () => {
      if (orderProcessed) return; // Extra check to prevent duplicate processing
      
      try {
        setIsProcessing(true);
        setOrderProcessed(true); // Mark that we've started processing
        
        if (!currentUser) {
          console.error("User not logged in");
          toast.error("You must be logged in to place an order");
          navigate("/sign-in");
          return;
        }

        console.log("Preparing to create order with items:", cartState.items);
        console.log("Order details:", orderDetails);
        
        if (cartState.items.length === 0) {
          console.error("No items in cart");
          toast.error("Your cart is empty");
          navigate("/products");
          return;
        }

        // Prepare shipping address with proper field names
        const shippingAddress = {
          name: orderDetails.shippingAddress.name,
          address: orderDetails.shippingAddress.address,
          city: orderDetails.shippingAddress.city,
          state: orderDetails.shippingAddress.state || "",
          postalCode: orderDetails.shippingAddress.zipCode || "", // Convert zipCode to postalCode
          country: orderDetails.shippingAddress.country,
          email: orderDetails.shippingAddress.email,
          phone: orderDetails.shippingAddress.phone
        };

        // Handle couponCode properly - Firebase doesn't allow undefined values
        let couponCode = null;
        if (typeof orderDetails.couponCode === 'string' && orderDetails.couponCode.trim() !== '') {
          couponCode = orderDetails.couponCode;
        }

        // Create the order with correct data structure
        const orderData = {
          userId: currentUser.uid,
          items: cartState.items.map(item => ({
            id: item.id,
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: Number(orderDetails.total || cartState.total), // Ensure it's a number
          status: 'pending' as const,
          shippingAddress: shippingAddress,
          paymentMethod: orderDetails.paymentMethod,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          // Only include couponCode if it has a valid value
          ...(couponCode && { couponCode }),
          discountAmount: orderDetails.discount ? Number(orderDetails.discount) : 0 // Ensure it's a number
        };

        console.log("Creating order with data:", JSON.stringify(orderData));
        
        // Try to save the user's email to their profile for future reference
        if (orderDetails.shippingAddress.email && currentUser) {
          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              await setDoc(userRef, {
                ...userDoc.data(),
                email: orderDetails.shippingAddress.email
              }, { merge: true });
            } else {
              await setDoc(userRef, {
                email: orderDetails.shippingAddress.email,
                createdAt: Date.now()
              });
            }
            console.log("Saved user email to profile");
          } catch (error) {
            console.error("Error saving user email:", error);
          }
        }
        
        // Create the order
        const result = await createOrder.mutateAsync(orderData);
        console.log("Order created:", result);
        
        setOrderId(result.id);
        
        // Track order completion for analytics
        await trackOrderCompletion();
        
        // Send email notification about the order
        try {
          // This is just a placeholder - in a real app, you would call your backend
          console.log("Would send order notification email to:", orderDetails.shippingAddress.email);
          
          // Here you would make an API call to your backend to send the email
          // For now we'll just log it
          console.log("Email would contain order details:", {
            orderId: result.id,
            items: orderData.items,
            total: orderData.totalAmount,
            shippingAddress: orderData.shippingAddress
          });
          
          // Send admin notification
          console.log("Would send admin notification about new order:", result.id);
        } catch (emailError) {
          console.error("Error sending order notification email:", emailError);
        }
        
        // Clear the cart after successful order
        clearCart();
        
        toast.success("Order placed successfully!");
        setIsProcessing(false);
      } catch (error) {
        console.error("Error creating order:", error);
        // More detailed error message
        if (error instanceof Error) {
          toast.error(`Failed to create order: ${error.message}`);
        } else {
          toast.error("Failed to create order. Please try again.");
        }
        setIsProcessing(false);
      }
    };

    saveOrder();
  }, [orderDetails, navigate, currentUser, cartState, clearCart, createOrder, orderId, orderProcessed]);

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
              {orderDetails.shippingAddress.email && (
                <span> A confirmation has been sent to your email.</span>
              )}
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <p><span className="font-medium">Order ID:</span> {isProcessing ? "Processing..." : orderId}</p>
                <p><span className="font-medium">Order Date:</span> {new Date().toLocaleDateString()}</p>
                <p>
                  <span className="font-medium">Shipping Address:</span><br />
                  {orderDetails.shippingAddress.name}<br />
                  {orderDetails.shippingAddress.address}<br />
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state || ""} {orderDetails.shippingAddress.zipCode || ""}<br />
                  {orderDetails.shippingAddress.country}
                </p>
                <p>
                  <span className="font-medium">Contact:</span><br />
                  {orderDetails.shippingAddress.email && <span>Email: {orderDetails.shippingAddress.email}<br /></span>}
                  {orderDetails.shippingAddress.phone && <span>Phone: {orderDetails.shippingAddress.phone}</span>}
                </p>
                <p><span className="font-medium">Payment Method:</span> {orderDetails.paymentMethod}</p>
                <p className="font-semibold">Total: ${(Number(orderDetails.total) || cartState.total).toFixed(2)}</p>
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
