
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PaymentForm } from "@/components/PaymentForm";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  ChevronRight, 
  CreditCard, 
  Home, 
  Mail,
  MapPin, 
  PackageCheck, 
  PackageOpen, 
  Phone,
  ShieldCheck, 
  ShoppingBag, 
  Trash 
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const steps = ["Cart", "Shipping", "Payment", "Confirmation"];

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // Start at cart step
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
    email: "", // Add email field
  });
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  const { state: cartState, updateQuantity, removeFromCart, clearCart } = useCart();
  const { data: allProducts = [] } = useProducts();
  const { currentUser } = useAuth(); // Get the current user
  
  // Get suggested products based on cart items (different category)
  const cartCategories = Array.from(
    new Set(cartState.items.map(item => {
      // Find category of current item from allProducts
      const product = allProducts.find(p => p.id === item.id);
      return product?.category || "";
    })
  ));
  
  const suggestedProducts = allProducts
    .filter(product => 
      !cartState.items.some(item => item.id === product.id) && 
      !cartCategories.includes(product.category)
    )
    .slice(0, 4);

  const subtotal = cartState.total;
  const shipping = 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  const handleApplyCoupon = () => {
    setIsApplying(true);
    
    // Simulate coupon application
    setTimeout(() => {
      if (couponCode.toLowerCase() === "discount10") {
        const discountAmount = subtotal * 0.1;
        setDiscount(discountAmount);
        setCouponCode("");
      }
      setIsApplying(false);
    }, 1000);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePaymentSuccess = () => {
    // Get the selected payment method based on the active tab
    const paymentMethodElement = document.querySelector('[role="tabpanel"][data-state="active"]');
    const paymentMethod = paymentMethodElement?.id === "card" ? "Credit Card" : "PayPal";
    
    // Navigate to confirmation with order details
    navigate("/order-confirmation", {
      state: {
        orderDetails: {
          shippingAddress: shippingInfo,
          paymentMethod,
          total,
          date: new Date().toISOString(),
          discount,
          couponCode: discount > 0 ? couponCode : undefined
        }
      }
    });
  };

  if (cartState.items.length === 0 && currentStep === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild size="lg">
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        {/* Checkout progress */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index < currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <div className="text-xs mt-2">{step}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-0">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-1 ${i < currentStep - 1 ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
          {/* Main checkout form */}
          <div className="lg:col-span-7 space-y-8">
            {currentStep === 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
                <div className="space-y-4">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Link to={`/products/${item.id}`} className="font-medium hover:text-primary transition-colors">
                            {item.title}
                          </Link>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground my-1">${item.price.toFixed(2)} each</p>
                        <div className="flex justify-between mt-2">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <span className="font-bold">-</span>
                            </Button>
                            <span className="w-6 text-center mx-1">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <span className="font-bold">+</span>
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            <span className="text-xs">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link to="/products">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </Button>
                  <Button onClick={() => setCurrentStep(1)}>
                    Proceed to Shipping
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="rounded-l-none"
                        placeholder="For order confirmation and updates"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send your order confirmation and updates to this email.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Street Address
                    </label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State
                      </label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                        ZIP Code
                      </label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-1">
                        Country
                      </label>
                      <Input
                        id="country"
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="rounded-l-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(0)}
                    >
                      Back to Cart
                    </Button>
                    <Button type="submit">
                      Continue to Payment
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-6">Payment</h2>
                <div className="mb-6 p-4 bg-secondary/50 rounded-lg flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">
                      This is a secure SSL encrypted payment. Your information is protected.
                    </p>
                  </div>
                </div>
                <PaymentForm onSuccess={handlePaymentSuccess} amount={total} />
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back to Shipping
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon code */}
              <div className="mb-6">
                <label htmlFor="couponCode" className="block text-sm font-medium mb-2">
                  Coupon Code
                </label>
                <div className="flex">
                  <Input
                    id="couponCode"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || isApplying}
                    className="rounded-l-none"
                  >
                    {isApplying ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Order details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <PackageOpen className="h-5 w-5 text-primary" />
                  <div>
                    <strong>Items in cart:</strong> {cartState.items.reduce((acc, item) => acc + item.quantity, 0)}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Home className="h-5 w-5 text-primary" />
                  <div>
                    <strong>Shipping to:</strong> {shippingInfo.city || "United States"}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <strong>Shipping method:</strong> Standard (3-5 business days)
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <strong>Payment method:</strong> Credit Card / PayPal
                  </div>
                </div>
              </div>
            </div>

            {/* You may also like */}
            {suggestedProducts.length > 0 && (
              <div className="border bg-white rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">You May Also Like</h3>
                <div className="grid grid-cols-2 gap-4">
                  {suggestedProducts.slice(0, 2).map(product => (
                    <Link 
                      key={product.id} 
                      to={`/products/${product.id}`}
                      className="group flex flex-col"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-2">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
