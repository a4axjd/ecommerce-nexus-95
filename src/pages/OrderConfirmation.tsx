
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateOrder, Order } from "@/hooks/useRealtimeOrders";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/storeSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { sendOrderConfirmationEmail } from "@/lib/notifications";
import { useCreateOrderSummary } from "@/hooks/useOrderSummaries";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { mutateAsync: createOrder } = useCreateOrder();
  const { mutateAsync: createOrderSummary } = useCreateOrderSummary();
  const [orderProcessed, setOrderProcessed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const orderProcessedRef = useRef(false);
  const [showConfirmation, setShowConfirmation] = useState(true);
  const { settings } = useStoreSettings();
  const [orderSummaryId, setOrderSummaryId] = useState<string | null>(null);
  const dialogForcedOpenRef = useRef(true);
  const userClosedDialogRef = useRef(false);
  
  const orderDetails = location.state?.orderDetails;
  
  useEffect(() => {
    // Force dialog to stay open for a minimum amount of time
    if (dialogForcedOpenRef.current) {
      const timer = setTimeout(() => {
        dialogForcedOpenRef.current = false;
      }, 10000); // Force dialog to stay open for at least 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  useEffect(() => {
    setShowConfirmation(true);
    
    if (!orderDetails || cartState.items.length === 0) {
      console.log("No order details or empty cart, redirecting to home");
      navigate("/");
      return;
    }
    
    if (orderProcessedRef.current) {
      console.log("Order already processed (ref), skipping creation");
      return;
    }
    
    const createNewOrder = async () => {
      if (orderProcessed) {
        console.log("Order already processed (state), skipping creation");
        return;
      }
      
      try {
        setIsLoading(true);
        orderProcessedRef.current = true;
        setOrderProcessed(true);
        
        console.log("Starting order creation process with realtime database");
        
        const orderItems = cartState.items.map(item => ({
          id: `${item.id}-${Date.now()}`,
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
          color: item.color || "",
          size: item.size || "",
          category: item.category || ""
        }));
        
        const newOrder: Omit<Order, "id"> = {
          userId: currentUser?.uid || "guest",
          items: orderItems,
          totalAmount: orderDetails.total,
          status: "pending" as const,
          shippingAddress: {
            name: orderDetails.shippingAddress.name || "",
            address: orderDetails.shippingAddress.address || "",
            city: orderDetails.shippingAddress.city || "",
            state: orderDetails.shippingAddress.state || "",
            postalCode: orderDetails.shippingAddress.zipCode || "",
            country: orderDetails.shippingAddress.country || "",
            email: orderDetails.shippingAddress.email || "",
            phone: orderDetails.shippingAddress.phone || ""
          },
          paymentMethod: orderDetails.paymentMethod || "card",
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        if (orderDetails.couponCode) {
          newOrder.couponCode = orderDetails.couponCode;
        }
        
        if (orderDetails.discount > 0) {
          newOrder.discountAmount = orderDetails.discount;
        }
        
        console.log("Submitting order to realtime database:", newOrder);
        const createdOrder = await createOrder(newOrder);
        console.log("Order created successfully with ID:", createdOrder.id);
        setOrderId(createdOrder.id);
        
        // Create order summary in realtime database
        const orderSummary = {
          userId: currentUser?.uid || "guest",
          orderId: createdOrder.id,
          date: new Date().toISOString(),
          total: orderDetails.total,
          paymentMethod: orderDetails.paymentMethod || "card",
          items: cartState.items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shippingAddress: orderDetails.shippingAddress,
          viewed: false,
          createdAt: Date.now()
        };
        
        if (orderDetails.discount > 0) {
          orderSummary.discount = orderDetails.discount;
        }
        
        if (orderDetails.couponCode) {
          orderSummary.couponCode = orderDetails.couponCode;
        }
        
        console.log("Creating order summary in realtime database");
        const createdSummary = await createOrderSummary(orderSummary);
        console.log("Order summary created with ID:", createdSummary.id);
        setOrderSummaryId(createdSummary.id);
        
        if (orderDetails.shippingAddress.email) {
          try {
            console.log("Sending order confirmation email");
            await sendOrderConfirmationEmail(
              orderDetails.shippingAddress.email,
              {
                orderId: createdOrder.id,
                items: orderItems,
                total: orderDetails.total,
                shippingAddress: orderDetails.shippingAddress
              }
            );
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
        }
        
        clearCart();
        
        // Always ensure dialog stays open
        setShowConfirmation(true);
        
        toast.success("Order placed successfully!", {
          id: "order-success",
          duration: 2000,
          onDismiss: () => {
            console.log("Toast dismissed, ensuring dialog stays open");
            setShowConfirmation(true);
          }
        });
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create order: " + (error instanceof Error ? error.message : String(error)));
        orderProcessedRef.current = false;
        setOrderProcessed(false);
      } finally {
        setIsLoading(false);
        // Always make sure dialog is open
        setTimeout(() => {
          setShowConfirmation(true);
        }, 200);
      }
    };
    
    createNewOrder();
  }, [orderDetails, cartState, navigate, clearCart, createOrder, createOrderSummary, currentUser?.uid, orderProcessed]);
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      if (!isLoading) {
        // Always prevent closing if we are in the forced open period
        if (dialogForcedOpenRef.current) {
          console.log("Preventing dialog close - forced open period");
          setShowConfirmation(true);
          return;
        }
        
        // User explicitly closed the dialog
        userClosedDialogRef.current = true;
        console.log("User closed order summary dialog");
        setShowConfirmation(false);
        
        // Don't automatically navigate away - let the user decide by clicking buttons
      } else {
        console.log("Preventing dialog close - still loading");
        setShowConfirmation(true);
      }
    }
  };
  
  // This useEffect ensures the dialog stays open even if other 
  // toast notifications or events try to close it
  useEffect(() => {
    if (!showConfirmation && (dialogForcedOpenRef.current || isLoading) && !userClosedDialogRef.current) {
      console.log("Dialog closed but should be open, reopening");
      setShowConfirmation(true);
    }
  }, [showConfirmation, isLoading]);
  
  if (!orderDetails) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
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
            {orderId && (
              <p className="text-sm font-medium mt-2">
                Order ID: {orderId}
              </p>
            )}
            {isLoading && (
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg border mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="grid gap-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Order Date</span>
                <span>{new Date().toLocaleDateString()}</span>
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
                <span className="font-semibold">{formatPrice(orderDetails.total, settings)}</span>
              </div>
              
              {orderDetails.discount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Discount Applied</span>
                  <span>-{formatPrice(orderDetails.discount, settings)}</span>
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
            <Button variant="outline" onClick={() => {
              userClosedDialogRef.current = true;
              navigate("/account");
            }}>
              View Order History
            </Button>
            <Button onClick={() => {
              userClosedDialogRef.current = true;
              navigate("/products");
            }}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <AlertDialog 
        open={showConfirmation} 
        onOpenChange={handleDialogClose}
      >
        <AlertDialogContent className="max-w-md z-[100]">
          <AlertDialogHeader>
            <div className="flex justify-between items-center">
              <AlertDialogTitle className="text-lg font-bold">Order Placed Successfully!</AlertDialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => {
                  if (!isLoading && !dialogForcedOpenRef.current) {
                    userClosedDialogRef.current = true;
                    setShowConfirmation(false);
                    // Don't automatically redirect - let user decide
                  }
                }}
                disabled={isLoading || dialogForcedOpenRef.current}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialogDescription>
              Your order has been successfully created and is being processed.
              {dialogForcedOpenRef.current && (
                <span className="block text-xs text-muted-foreground mt-1">
                  This confirmation will stay open for at least 10 seconds to ensure you see all details.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="border rounded-md p-4 mb-4 bg-secondary/30">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Order ID:</span>
              <span>{orderId || "Processing..."}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Total:</span>
              <span>{formatPrice(orderDetails?.total || 0, settings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-amber-600 font-medium">Processing</span>
            </div>
          </div>
          
          {cartState.items.length > 0 && (
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-2">Order Items:</h3>
              <div className="max-h-40 overflow-y-auto">
                {cartState.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-1 text-sm border-b last:border-b-0">
                    <span>{item.title} x {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity, settings)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                userClosedDialogRef.current = true;
                setShowConfirmation(false);
                navigate("/account");
              }}
              disabled={isLoading || dialogForcedOpenRef.current}
            >
              {dialogForcedOpenRef.current ? "Please wait..." : "View Order History"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderConfirmation;
