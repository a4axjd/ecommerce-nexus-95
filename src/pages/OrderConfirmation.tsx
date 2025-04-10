
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCreateOrder, Order } from "@/hooks/useRealtimeOrders";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/storeSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { sendOrderConfirmationEmail, sendAdminNotificationEmail, initEmailJS } from "@/lib/emailService";
import { useCreateOrderSummary } from "@/hooks/useOrderSummaries";

// Initialize EmailJS when component is imported
initEmailJS();

const sendOrderEmails = async (orderId: string, customerData: any, orderItems: any[], total: number) => {
  try {
    console.log("Starting email sending process...");
    
    const emailData = {
      orderId,
      customerName: customerData.name,
      customerEmail: customerData.email,
      orderItems,
      total,
      shippingAddress: customerData
    };
    
    console.log("Email data prepared:", emailData);
    
    const emailTemplate = `Order Confirmation #${orderId}`;
    
    // Only send email if customer provided an email
    if (customerData.email) {
      // Send email to customer
      const customerEmailResult = await sendOrderConfirmationEmail(emailData, emailTemplate);
      
      if (customerEmailResult.success) {
        console.log("Customer email sent successfully!");
        toast.success("Order confirmation email sent");
      } else {
        console.error("Failed to send customer email:", customerEmailResult.error);
        toast.error("Failed to send confirmation email");
      }
      
      // Send notification to admin
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
      
      if (adminEmail) {
        const adminEmailResult = await sendAdminNotificationEmail(
          adminEmail, 
          emailData, 
          `New Order #${orderId}`
        );
        
        if (adminEmailResult.success) {
          console.log("Admin notification email sent successfully!");
        } else {
          console.error("Failed to send admin email:", adminEmailResult.error);
        }
      } else {
        console.warn("Admin email not configured. Skipping admin notification.");
      }
    } else {
      console.log("No customer email provided, skipping email sending");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in sendOrderEmails function:", error);
    return { success: false, error };
  }
};

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
  const { settings } = useStoreSettings();
  const [orderSummaryId, setOrderSummaryId] = useState<string | null>(null);
  
  const orderDetails = location.state?.orderDetails;
  
  useEffect(() => {
    if (!orderDetails || cartState.items.length === 0) {
      console.log("No order details or empty cart, redirecting to home");
      if (!location.state) {
        navigate("/");
      }
      return;
    }
    
    if (orderProcessedRef.current || orderId) {
      console.log("Order already processed, skipping creation");
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
        
        console.log("Starting order creation process");
        
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
        
        console.log("Submitting order:", newOrder);
        const createdOrder = await createOrder(newOrder);
        console.log("Order created successfully with ID:", createdOrder.id);
        setOrderId(createdOrder.id);
        
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
            image: item.image || ""
          })),
          shippingAddress: orderDetails.shippingAddress,
          viewed: false,
          createdAt: Date.now(),
          ...(orderDetails.discount > 0 ? { discount: orderDetails.discount } : {}),
          ...(orderDetails.couponCode ? { couponCode: orderDetails.couponCode } : {})
        };
        
        console.log("Creating order summary in Firestore");
        const createdSummary = await createOrderSummary(orderSummary);
        console.log("Order summary created with ID:", createdSummary.id);
        setOrderSummaryId(createdSummary.id);
        
        // Send confirmation emails directly
        if (orderDetails.shippingAddress.email) {
          try {
            console.log("Sending order confirmation email");
            await sendOrderEmails(
              createdOrder.id,
              orderDetails.shippingAddress,
              orderItems,
              orderDetails.total
            );
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            toast.error("Failed to send order confirmation email");
          }
        } else {
          console.log("No customer email provided, skipping email sending");
        }
        
        clearCart();
        
        toast.success("Order placed successfully!", {
          id: "order-success",
          duration: 2000
        });
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create order: " + (error instanceof Error ? error.message : String(error)));
        orderProcessedRef.current = false;
        setOrderProcessed(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    createNewOrder();
  }, [orderDetails, cartState, navigate, clearCart, createOrder, createOrderSummary, currentUser?.uid, orderProcessed, location.state, orderId]);
  
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
            <h2 className="text-lg font-semibold mb-4">Items Ordered</h2>
            <div className="divide-y">
              {cartState.items.map((item, index) => (
                <div key={index} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-md overflow-hidden border mr-3">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span>{formatPrice(item.price * item.quantity, settings)}</span>
                </div>
              ))}
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
            <Button variant="outline" onClick={() => navigate("/account")}>
              View Order History
            </Button>
            <Button onClick={() => navigate("/products")}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
