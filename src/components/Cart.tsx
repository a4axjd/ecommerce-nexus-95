
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export const Cart = () => {
  const { state, removeFromCart, updateQuantity } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="py-4">
        <p className="text-center text-muted-foreground">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {state.items.map((item) => (
        <div key={item.id} className="flex gap-4">
          {/* Product Image */}
          <div className="relative h-24 w-24 overflow-hidden rounded-md border">
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
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeFromCart(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between">
          <span className="text-base font-medium">Total</span>
          <span className="text-base font-medium">
            ${state.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
