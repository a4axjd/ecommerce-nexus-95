
// Local implementation of email service (Cloud Function will handle actual emails)

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
    console.log('Note: Actual emails are processed by Firebase Cloud Functions in production');
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
    console.log('Note: Actual emails are processed by Firebase Cloud Functions in production');
    // Mock successful response
    return { success: true, data: { id: `mock-email-${Date.now()}` } };
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}

// Create a function to simulate the EmailJS API for local testing
export async function sendEmailWithEmailJS(templateId: string, templateParams: Record<string, any>) {
  console.log(`[Mock] Sending email with EmailJS template: ${templateId}`);
  console.log('Template params:', templateParams);
  
  // In development, just log the email data
  return { success: true };
}
