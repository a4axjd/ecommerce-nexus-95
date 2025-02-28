
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { CreditCard, LockIcon, Tag } from "lucide-react";
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from "@/lib/stripe";
import { PaymentForm } from "@/components/PaymentForm";
import { useValidateCoupon, useIncrementCouponUsage } from "@/hooks/useCoupons";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { state, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    couponId: string;
  } | null>(null);

  const { data: couponValidation, error: couponError, isLoading: validatingCoupon } = 
    useValidateCoupon(couponCode, state.total);
  
  const incrementCouponUsage = useIncrementCouponUsage();
  const createOrder = useCreateOrder();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    toast.success("Shipping information saved");
  };

  const handlePaymentSuccess = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to complete your order");
      navigate("/admin/sign-in");
      return;
    }

    try {
      // Create the order in Firestore
      const orderItems = state.items.map(item => ({
        id: crypto.randomUUID(),
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const orderData = {
        userId: currentUser.uid,
        items: orderItems,
        totalAmount: state.total,
        status: 'pending' as const,
        shippingAddress: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: 'credit_card',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add coupon data if a coupon was applied
      if (appliedCoupon) {
        Object.assign(orderData, {
          couponCode: appliedCoupon.code,
          discountAmount: appliedCoupon.discountAmount
        });

        // Increment the coupon usage
        await incrementCouponUsage.mutateAsync(appliedCoupon.couponId);
      }

      await createOrder.mutateAsync(orderData);
      
      // Clear the cart and redirect
      clearCart();
      navigate("/order-confirmation");
      toast.success("Order placed successfully");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (couponError) {
      toast.error(couponError instanceof Error ? couponError.message : "Invalid coupon");
      return;
    }

    if (couponValidation) {
      setAppliedCoupon({
        code: couponCode,
        discountAmount: couponValidation.discountAmount,
        couponId: couponValidation.coupon.id
      });
      toast.success(`Coupon applied! You saved $${couponValidation.discountAmount.toFixed(2)}`);
      setCouponCode("");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate final amount considering any coupon discount
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalAmount = Math.max(0, state.total - discountAmount);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className="text-sm ml-2">Shipping</div>
            </div>
            <div className={`h-1 w-16 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className="text-sm ml-2">Payment</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div>
                <form onSubmit={handleNext} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <Input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                        Postal Code
                      </label>
                      <Input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <Input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div>
                <div className="mb-4 p-4 bg-primary-foreground rounded-lg border border-muted">
                  <div className="flex items-center mb-2">
                    <LockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Secure Payment</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure. We never store your full payment details.
                  </p>
                </div>
                
                <Elements stripe={stripePromise}>
                  <PaymentForm onSuccess={handlePaymentSuccess} amount={finalAmount} />
                </Elements>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setStep(1)}
                >
                  Back to Shipping
                </Button>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                {/* Coupon Code Input */}
                {!appliedCoupon && (
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Coupon code"
                          className="pl-10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                      >
                        {validatingCoupon ? "Checking..." : "Apply"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        Discount
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-5 text-xs"
                          onClick={removeCoupon}
                        >
                          Remove
                        </Button>
                      </span>
                      <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>${finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
