
import { Resend } from 'resend';

// Initialize with API key
const resendApiKey = process.env.VITE_RESEND_API_KEY || 'your_test_api_key_here';
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
    const response = await resend.emails.send({
      from: 'orders@yourdomain.com',
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderId}`,
      html: htmlTemplate,
    });

    console.log('Email sent successfully:', response);
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
    const response = await resend.emails.send({
      from: 'orders@yourdomain.com',
      to: adminEmail,
      subject: `New Order Received #${data.orderId}`,
      html: htmlTemplate,
    });

    console.log('Admin notification email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}
