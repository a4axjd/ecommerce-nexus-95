
import medusa from "@/lib/medusa";
import { CartItem } from "@/types/medusa";

export const createCart = async () => {
  try {
    const { cart } = await medusa.carts.create();
    localStorage.setItem("cartId", cart.id);
    return cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
};

export const addToCart = async (cartId: string, item: CartItem) => {
  try {
    const { cart } = await medusa.carts.lineItems.create(cartId, {
      variant_id: item.variant_id,
      quantity: item.quantity,
    });
    return cart;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCart = async (cartId: string) => {
  try {
    const { cart } = await medusa.carts.retrieve(cartId);
    return cart;
  } catch (error) {
    console.error("Error retrieving cart:", error);
    throw error;
  }
};
