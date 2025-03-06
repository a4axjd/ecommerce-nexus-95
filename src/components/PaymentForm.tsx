
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Banknote, HomeIcon } from "lucide-react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface PaymentFormProps {
  onSuccess: () => void;
  amount: number;
  shippingInfo?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
  };
}

export const PaymentForm = ({ onSuccess, amount, shippingInfo }: PaymentFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "cod">("card");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // For manual card input form
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces after every 4 digits
    if (name === "number") {
      const formattedValue = value
        .replace(/\s/g, '') // Remove all spaces
        .match(/.{1,4}/g)?.join(' ') || ''; // Add a space after every 4 characters
      
      setCardInfo(prev => ({
        ...prev,
        [name]: formattedValue.substring(0, 19) // Limit to 16 digits + 3 spaces
      }));
    }
    // Format expiry date with a slash
    else if (name === "expiry") {
      let formattedValue = value.replace(/\//g, ''); // Remove any existing slashes
      
      // If length is > 2, insert slash after the first 2 characters
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.substring(0, 2)}/${formattedValue.substring(2)}`;
      }
      
      setCardInfo(prev => ({
        ...prev,
        [name]: formattedValue.substring(0, 5) // Limit to MM/YY format
      }));
    }
    // For other fields, just set the value
    else {
      setCardInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePaymentSuccess = () => {
    console.log("Payment successful, completing order");
    setOrderComplete(true);
    // Ensure we call onSuccess to navigate to order confirmation page
    onSuccess();
  };

  const handleCardSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Prevent duplicate submissions
    if (formSubmitted || isLoading || orderComplete) {
      console.log("Preventing duplicate submission - form already submitted or order completed");
      return;
    }
    
    // Validate inputs (simple validation for demo)
    if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvc || !cardInfo.name) {
      toast.error("Please fill in all card details");
      return;
    }
    
    setIsLoading(true);
    setFormSubmitted(true);
    toast.info("Processing payment...");
    
    try {
      // Simulate processing (in a real app this would be handled by a payment processor)
      setTimeout(() => {
        console.log("Card payment processed successfully");
        toast.success("Payment successful");
        setIsLoading(false);
        handlePaymentSuccess();
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setIsLoading(false);
      setFormSubmitted(false); // Reset to allow retry
    }
  };

  const handlePayPalApprove = (data: any, actions: any) => {
    // Prevent duplicate submissions
    if (formSubmitted || orderComplete) {
      console.log("Preventing duplicate PayPal submission - already processed or order completed");
      return Promise.resolve();
    }
    
    // This is called when the PayPal payment is approved
    toast.info("Processing PayPal payment...");
    setFormSubmitted(true);
    
    try {
      // In a real implementation, you would verify the payment with your backend
      // For demo, we're just simulating a successful payment
      setTimeout(() => {
        console.log("PayPal payment processed successfully");
        toast.success("PayPal payment successful");
        handlePaymentSuccess();
      }, 1500);
    } catch (error) {
      console.error("PayPal payment error:", error);
      toast.error("PayPal payment failed. Please try again.");
      setFormSubmitted(false); // Reset to allow retry
    }

    return Promise.resolve();
  };

  const handleCodSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Prevent duplicate submissions
    if (formSubmitted || isLoading || orderComplete) {
      console.log("Preventing duplicate submission - form already submitted or order completed");
      return;
    }
    
    setIsLoading(true);
    setFormSubmitted(true);
    toast.info("Processing Cash on Delivery request...");
    
    try {
      // Simulate processing
      setTimeout(() => {
        console.log("Cash on Delivery processed successfully");
        toast.success("Cash on Delivery order confirmed");
        setIsLoading(false);
        handlePaymentSuccess();
      }, 1500);
    } catch (error) {
      console.error("COD error:", error);
      toast.error("Order failed. Please try again.");
      setIsLoading(false);
      setFormSubmitted(false); // Reset to allow retry
    }
  };

  // Reset form submitted state when payment method changes
  useEffect(() => {
    setFormSubmitted(false);
  }, [paymentMethod]);

  // Display information about shipped to address when using PayPal
  const renderShippingInfo = () => {
    if (!shippingInfo) return null;
    
    return (
      <div className="mb-4 p-3 bg-muted rounded-md">
        <div className="text-sm font-medium mb-2">Shipping Information:</div>
        <div className="text-xs text-muted-foreground">
          <p><span className="font-medium">Name:</span> {shippingInfo.name}</p>
          <p><span className="font-medium">Address:</span> {shippingInfo.address}</p>
          <p><span className="font-medium">City:</span> {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
          <p><span className="font-medium">Country:</span> {shippingInfo.country}</p>
          <p><span className="font-medium">Email:</span> {shippingInfo.email}</p>
          <p><span className="font-medium">Phone:</span> {shippingInfo.phone}</p>
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as "card" | "paypal" | "cod")}>
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="card" className="flex items-center gap-2" disabled={orderComplete}>
          <CreditCard className="h-4 w-4" />
          Credit Card
        </TabsTrigger>
        <TabsTrigger value="paypal" className="flex items-center gap-2" disabled={orderComplete}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="#00457C">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.473 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.58 2.975-2.477 6.17-8.233 6.17h-2.19c-.144 0-.263.106-.263.244l-1.12 7.106c-.022.139.085.254.227.254h4.607a.87.87 0 0 0 .863-.647l.033-.165.72-4.574.045-.234a.87.87 0 0 1 .863-.648h.545c3.521 0 6.28-1.43 7.089-5.568.342-1.729.182-3.18-.538-4.195l-.002-.003z" />
            <path d="M20.486 8.124c-.009-.053-.02-.106-.03-.157-.376-1.919-2.3-2.601-4.5-2.601H9.946c-.133 0-.248.074-.282.188L7.158 18.648c-.016.053.009.106.04.149.031.042.08.065.133.065h3.446l.87-5.514-.027.176c.033-.114.145-.195.28-.195h1.827c3.151 0 5.622-1.28 6.343-4.987.021-.106.036-.21.05-.313.211-1.359.011-2.283-.634-3.105l-.02-.018c.024.007.046.018.07.025z" fill="#00457C" />
          </svg>
          PayPal
        </TabsTrigger>
        <TabsTrigger value="cod" className="flex items-center gap-2" disabled={orderComplete}>
          <Banknote className="h-4 w-4" />
          Cash on Delivery
        </TabsTrigger>
      </TabsList>

      <TabsContent value="card" className="space-y-6">
        <form onSubmit={handleCardSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-name" className="block text-sm font-medium mb-1">
                Cardholder Name
              </Label>
              <Input
                id="card-name"
                name="name"
                placeholder="John Smith"
                value={cardInfo.name}
                onChange={handleCardInputChange}
                required
                disabled={formSubmitted || isLoading || orderComplete}
              />
            </div>
            
            <div>
              <Label htmlFor="card-number" className="block text-sm font-medium mb-1">
                Card Number
              </Label>
              <Input
                id="card-number"
                name="number"
                placeholder="4111 1111 1111 1111"
                value={cardInfo.number}
                onChange={handleCardInputChange}
                required
                disabled={formSubmitted || isLoading || orderComplete}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-expiry" className="block text-sm font-medium mb-1">
                  Expiry Date
                </Label>
                <Input
                  id="card-expiry"
                  name="expiry"
                  placeholder="MM/YY"
                  value={cardInfo.expiry}
                  onChange={handleCardInputChange}
                  required
                  disabled={formSubmitted || isLoading || orderComplete}
                />
              </div>
              
              <div>
                <Label htmlFor="card-cvc" className="block text-sm font-medium mb-1">
                  CVC
                </Label>
                <Input
                  id="card-cvc"
                  name="cvc"
                  placeholder="123"
                  maxLength={4}
                  value={cardInfo.cvc}
                  onChange={handleCardInputChange}
                  required
                  disabled={formSubmitted || isLoading || orderComplete}
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
              This is a demo form. No real payments will be processed.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || formSubmitted || orderComplete}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="paypal">
        {shippingInfo && renderShippingInfo()}
        
        <PayPalScriptProvider options={{ 
          clientId: "AZLbo88PLuakr0L4eyq_gPT0Yk24QFWrw4GIJbSD9UfUF9xtC5jGm8Qe9lSZUPIyKKgdSLSKLa1BqLYB",
          currency: "USD",
          intent: "capture"
        }}>
          {!orderComplete && !formSubmitted && (
            <PayPalButtons
              style={{ layout: "vertical", shape: "rect" }}
              createOrder={(data, actions) => {
                if (formSubmitted || orderComplete) {
                  console.log("Preventing duplicate PayPal order creation");
                  return Promise.reject("Order already in progress");
                }
                
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [
                    {
                      amount: {
                        value: amount.toString(),
                        currency_code: "USD"
                      },
                      shipping: shippingInfo ? {
                        name: {
                          full_name: shippingInfo.name
                        },
                        address: {
                          address_line_1: shippingInfo.address,
                          admin_area_2: shippingInfo.city,
                          admin_area_1: shippingInfo.state,
                          postal_code: shippingInfo.zipCode,
                          country_code: "SA" // Saudi Arabia country code
                        }
                      } : undefined
                    }
                  ],
                  // Fix the payer structure to match PayPal API requirements
                  payer: shippingInfo ? {
                    email_address: shippingInfo.email,
                    name: {
                      given_name: shippingInfo.name.split(' ')[0],
                      surname: shippingInfo.name.split(' ').slice(1).join(' ') || ''
                    },
                    phone: {
                      phone_type: "MOBILE",
                      phone_number: {
                        national_number: shippingInfo.phone.replace(/\D/g, ''),
                        country_code: "966" // Saudi Arabia country code
                      }
                    }
                  } : undefined
                });
              }}
              onApprove={handlePayPalApprove}
              onError={(err) => {
                console.error("PayPal error:", err);
                toast.error("PayPal payment failed");
                setFormSubmitted(false); // Reset to allow retry
              }}
              disabled={formSubmitted || orderComplete}
            />
          )}
          {(formSubmitted || orderComplete) && (
            <div className="p-4 text-center text-muted-foreground">
              {orderComplete ? "Payment completed successfully!" : "Processing your payment..."}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            You'll be redirected to PayPal to complete your purchase securely.
          </p>
        </PayPalScriptProvider>
      </TabsContent>

      <TabsContent value="cod" className="space-y-6">
        {shippingInfo && renderShippingInfo()}
        
        <form onSubmit={handleCodSubmit} className="space-y-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <HomeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">
                  Pay with cash when your order is delivered to your address.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <div className="shrink-0 mr-2">•</div>
                <p>The delivery person will collect the payment when they deliver your order.</p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">•</div>
                <p>Please have the exact amount ready to ensure a smooth delivery process.</p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">•</div>
                <p>You can inspect your items before making payment.</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || formSubmitted || orderComplete}
            variant="outline"
          >
            <Banknote className="w-4 h-4 mr-2" />
            {isLoading ? "Processing..." : `Place Order - Pay $${amount.toFixed(2)} on Delivery`}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};
