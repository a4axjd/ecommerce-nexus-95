
import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, CreditCardIcon } from "lucide-react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentFormProps {
  onSuccess: () => void;
  amount: number;
}

export const PaymentForm = ({ onSuccess, amount }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");

  const handleStripeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    toast.info("Processing payment...");

    // For demonstration purposes, we're just simulating payment success
    // In a real app, you would create a payment intent on your backend
    // and confirm it here
    
    setTimeout(() => {
      toast.success("Payment successful");
      setIsLoading(false);
      onSuccess();
    }, 2000);

    // Real implementation would look like this:
    /*
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Send paymentMethod.id to your server
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          amount: amount * 100, // in cents
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment successful");
        onSuccess();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("An error occurred processing your payment");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handlePayPalApprove = (data: any, actions: any) => {
    // This is called when the PayPal payment is approved
    toast.info("Processing PayPal payment...");
    
    // In a real implementation, you would verify the payment with your backend
    // For demo, we're just simulating a successful payment
    setTimeout(() => {
      toast.success("PayPal payment successful");
      onSuccess();
    }, 1500);

    return Promise.resolve();
  };

  return (
    <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as "card" | "paypal")}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="card" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Credit Card
        </TabsTrigger>
        <TabsTrigger value="paypal" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="#00457C">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.473 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.58 2.975-2.477 6.17-8.233 6.17h-2.19c-.144 0-.263.106-.263.244l-1.12 7.106c-.022.139.085.254.227.254h4.607a.87.87 0 0 0 .863-.647l.033-.165.72-4.574.045-.234a.87.87 0 0 1 .863-.648h.545c3.521 0 6.28-1.43 7.089-5.568.342-1.729.182-3.18-.538-4.195l-.002-.003z" />
            <path d="M20.486 8.124c-.009-.053-.02-.106-.03-.157-.376-1.919-2.3-2.601-4.5-2.601H9.946c-.133 0-.248.074-.282.188L7.158 18.648c-.016.053.009.106.04.149.031.042.08.065.133.065h3.446l.87-5.514-.027.176c.033-.114.145-.195.28-.195h1.827c3.151 0 5.622-1.28 6.343-4.987.021-.106.036-.21.05-.313.211-1.359.011-2.283-.634-3.105l-.02-.018c.024.007.046.018.07.025z" fill="#00457C" />
          </svg>
          PayPal
        </TabsTrigger>
      </TabsList>

      <TabsContent value="card" className="space-y-6">
        <form onSubmit={handleStripeSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="card-element" className="block text-sm font-medium">
              Card Details
            </label>
            <div className="p-3 border rounded-md bg-white">
              <CardElement
                id="card-element"
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Test card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || isLoading}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="paypal">
        <PayPalScriptProvider options={{ 
          "client-id": "test", // Replace with your PayPal client ID in production
          currency: "USD",
          intent: "capture"
        }}>
          <PayPalButtons
            style={{ layout: "vertical", shape: "rect" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toString(),
                      currency_code: "USD"
                    }
                  }
                ]
              });
            }}
            onApprove={handlePayPalApprove}
            onError={() => {
              toast.error("PayPal payment failed");
            }}
          />
          <p className="text-xs text-muted-foreground mt-3 text-center">
            You'll be redirected to PayPal to complete your purchase securely.
          </p>
        </PayPalScriptProvider>
      </TabsContent>
    </Tabs>
  );
};
