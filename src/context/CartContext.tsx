import { createContext, useContext, useReducer, ReactNode } from "react";
import { trackCartAddition } from "@/hooks/useAnalytics";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextType {
  state: CartState;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  total: 0,
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
              item.color === action.payload.color && 
              item.size === action.payload.size
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
        };
      }

      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        item => item.id !== action.payload.id
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
        total: 0,
      };
    }
    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    // Track cart addition for analytics
    trackCartAddition(item.id, item.title)
      .catch(error => console.error("Failed to track cart addition:", error));
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id: itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
