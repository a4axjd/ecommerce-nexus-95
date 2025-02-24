
import { createContext, useContext, useReducer, ReactNode } from "react";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity: number }) => void;
  removeFromCart: (itemId: string, size: string) => void;
  updateQuantity: (itemId: string, size: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  total: 0,
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string; size: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; size: string; quantity: number } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.size === action.payload.size
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
        item => !(item.id === action.payload.id && item.size === action.payload.size)
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map(item =>
        item.id === action.payload.id && item.size === action.payload.size
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
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

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item as CartItem });
  };

  const removeFromCart = (itemId: string, size: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id: itemId, size } });
  };

  const updateQuantity = (itemId: string, size: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, size, quantity } });
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity }}>
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
