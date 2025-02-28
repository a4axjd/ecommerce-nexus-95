
import { Fragment, useEffect, useState } from "react";
import { Minus, Plus, X, ShoppingBag, ArrowRight, BadgePercent, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Separator } from "@/components/ui/separator";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart = ({ isOpen, onClose }: CartProps) => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [discount, setDiscount] = useState(0);
  const { data: allProducts = [] } = useProducts();
  
  // Get recommended products that are not in the cart
  const recommendedProducts = allProducts
    .filter(product => 
      !state.items.some(item => item.id === product.id) && 
      product.featured
    )
    .slice(0, 2);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const subtotal = state.total;
  const tax = subtotal * 0.08;
  const total = subtotal + tax - discount;

  const handleApplyCoupon = () => {
    setIsApplying(true);
    
    // Simulate coupon application
    setTimeout(() => {
      if (couponCode.toLowerCase() === "save10") {
        const discountAmount = subtotal * 0.1;
        setDiscount(discountAmount);
        setCouponCode("");
      }
      setIsApplying(false);
    }, 1000);
  };

  useEffect(() => {
    // Reset discount when cart changes
    if (subtotal === 0) {
      setDiscount(0);
    }
  }, [subtotal]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Your Shopping Cart ({state.items.reduce((acc, item) => acc + item.quantity, 0)} items)
          </SheetTitle>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="py-6 flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => {
                onClose();
                navigate("/products");
              }}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <Fragment>
            <div className="flex flex-col gap-4 py-4 flex-grow overflow-auto">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                        <p className="font-medium text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgePercent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Add Coupon Code</span>
                  </div>
                  {discount > 0 && (
                    <span className="text-sm font-medium text-green-600">Coupon Applied!</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="h-9 text-sm"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={!couponCode || isApplying}
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Try code "SAVE10" for 10% off</p>
              </div>

              {/* Shipping estimate */}
              <div className="flex items-start gap-2 bg-secondary/30 p-3 rounded-md">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm font-medium">Estimated Delivery</span>
                  <p className="text-xs text-muted-foreground">3-5 business days</p>
                </div>
              </div>

              {/* Recommended products */}
              {recommendedProducts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-medium">You might also like</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {recommendedProducts.map(product => (
                      <div 
                        key={product.id} 
                        className="rounded-md overflow-hidden border bg-secondary/20 cursor-pointer"
                        onClick={() => {
                          onClose();
                          navigate(`/products/${product.id}`);
                        }}
                      >
                        <div className="h-24 w-full">
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <h5 className="text-xs font-medium line-clamp-1">{product.title}</h5>
                          <p className="text-xs">${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="mt-auto border-t pt-4 flex flex-col gap-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onClose();
                    navigate("/products");
                  }}
                >
                  Continue Shopping
                </Button>
                <Button onClick={handleCheckout} className="gap-1">
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </SheetFooter>
          </Fragment>
        )}
      </SheetContent>
    </Sheet>
  );
};
