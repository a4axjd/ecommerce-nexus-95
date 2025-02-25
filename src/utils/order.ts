
import medusa from "@/lib/medusa";

export const createOrder = async (cartId: string) => {
  try {
    const { order } = await medusa.orders.create({ cart_id: cartId });
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrder = async (orderId: string) => {
  try {
    const { order } = await medusa.orders.retrieve(orderId);
    return order;
  } catch (error) {
    console.error("Error retrieving order:", error);
    throw error;
  }
};
