
import { Resend } from 'resend';

// Initialize with API key from environment variables
// Make sure to use the correct variable name as defined in .env
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
const resend = new Resend(resendApiKey);

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
    // Log to verify the API key is available
    console.log('Resend API Key present:', !!resendApiKey);
    
    if (!resendApiKey) {
      console.error('Missing Resend API key. Please check your .env file and make sure VITE_RESEND_API_KEY is set.');
      return { success: false, error: 'Missing API key' };
    }
    
    console.log(`Attempting to send email to ${data.customerEmail} for order ${data.orderId}`);
    
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default sender or your verified domain
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderId}`,
      html: htmlTemplate,
    });

    console.log('Email response from Resend:', response);
    return { success: true, data: response };
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
    if (!resendApiKey) {
      console.error('Missing Resend API key. Please check your .env file and make sure VITE_RESEND_API_KEY is set.');
      return { success: false, error: 'Missing API key' };
    }
    
    console.log(`Attempting to send admin notification to ${adminEmail} for order ${data.orderId}`);
    
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default sender or your verified domain
      to: adminEmail,
      subject: `New Order Received #${data.orderId}`,
      html: htmlTemplate,
    });

    console.log('Admin notification email response:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}
