
// Mock email service implementation

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderItems: any[];
  total: number;
  shippingAddress: any;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData, htmlTemplate: string) {
  try {
    console.log(`[Mock] Sending order confirmation email to ${data.customerEmail} for order ${data.orderId}`);
    // Mock successful response
    return { success: true, data: { id: `mock-email-${Date.now()}` } };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotificationEmail(
  adminEmail: string,
  data: OrderEmailData,
  htmlTemplate: string
) {
  try {
    console.log(`[Mock] Sending admin notification to ${adminEmail} for order ${data.orderId}`);
    // Mock successful response
    return { success: true, data: { id: `mock-email-${Date.now()}` } };
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}
