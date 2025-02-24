
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. We'll send you a confirmation email with your order details.
        </p>
        <Button onClick={() => navigate("/")}>Continue Shopping</Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
