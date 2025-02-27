
import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

interface PaymentFormProps {
  onSuccess: () => void;
  amount: number;
}

export const PaymentForm = ({ onSuccess, amount }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
  );
};
