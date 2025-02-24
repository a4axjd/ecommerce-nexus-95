
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 4.99,
    estimatedDays: "3-5 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    price: 14.99,
    estimatedDays: "1-2 business days",
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<string>(SHIPPING_METHODS[0].id);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedMethod = SHIPPING_METHODS.find(method => method.id === selectedShipping)!;
  const total = state.total + selectedMethod.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // TODO: Integrate with Medusa.js checkout API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating API call
      toast.success("Order placed successfully!");
      navigate("/order-confirmation");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <Input type="email" placeholder="Email" required />
              </div>

              <div className="bg-white p-6 rounded-lg border space-y-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="First name" required />
                  <Input placeholder="Last name" required />
                </div>
                <Input placeholder="Address" required />
                <Input placeholder="Apartment, suite, etc. (optional)" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="City" required />
                  <Input placeholder="Postal code" required />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border space-y-4">
                <h2 className="text-xl font-semibold">Shipping Method</h2>
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedShipping === method.id
                          ? "border-black bg-gray-50"
                          : "hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selectedShipping === method.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-gray-500">
                            {method.estimatedDays}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        ${method.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:pl-8">
            <div className="bg-white p-6 rounded-lg border sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4 py-4 border-b"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="font-medium mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${selectedMethod.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
