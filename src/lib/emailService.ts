
import emailjs from '@emailjs/browser';

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
    console.log(`Sending order confirmation email to ${data.customerEmail} for order ${data.orderId}`);
    
    const templateParams = {
      order_id: data.orderId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      order_date: new Date().toLocaleDateString(),
      order_total: `$${data.total.toFixed(2)}`,
      shipping_address: `${data.shippingAddress.address}, ${data.shippingAddress.city}, ${data.shippingAddress.state || ''} ${data.shippingAddress.postalCode || ''}`,
      order_items: JSON.stringify(data.orderItems.map((item: any) => ({
        name: item.title,
        quantity: item.quantity,
        price: `$${item.price?.toFixed(2)}`
      })) || []),
      payment_method: data.shippingAddress.paymentMethod || "Credit Card"
    };
    
    const result = await sendEmailWithEmailJS(
      process.env.EMAILJS_TEMPLATE_ID_CONFIRMATION || '', 
      templateParams
    );
    
    return result;
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
    console.log(`Sending admin notification to ${adminEmail} for order ${data.orderId}`);
    
    const templateParams = {
      order_id: data.orderId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      order_date: new Date().toLocaleDateString(),
      order_total: `$${data.total.toFixed(2)}`,
      shipping_address: `${data.shippingAddress.address}, ${data.shippingAddress.city}, ${data.shippingAddress.state || ''} ${data.shippingAddress.postalCode || ''}`,
      order_items: JSON.stringify(data.orderItems.map((item: any) => ({
        name: item.title,
        quantity: item.quantity,
        price: `$${item.price?.toFixed(2)}`
      })) || []),
      payment_method: data.shippingAddress.paymentMethod || "Credit Card",
      admin_email: adminEmail
    };
    
    const result = await sendEmailWithEmailJS(
      process.env.EMAILJS_TEMPLATE_ID_ADMIN || '',
      templateParams
    );
    
    return result;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}

export async function sendEmailWithEmailJS(templateId: string, templateParams: Record<string, any>) {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID || '';
    const userId = process.env.EMAILJS_USER_ID || '';
    
    if (!serviceId || !userId || !templateId) {
      console.error('Missing EmailJS configuration. Check your .env file.');
      return { success: false, error: 'Missing EmailJS configuration' };
    }
    
    console.log(`Sending email with EmailJS using template: ${templateId}`);
    
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      userId
    );
    
    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email with EmailJS:', error);
    return { success: false, error };
  }
}

// Initialize EmailJS
export function initEmailJS() {
  const userId = process.env.EMAILJS_USER_ID;
  if (userId) {
    emailjs.init(userId);
    console.log('EmailJS initialized');
  } else {
    console.error('EmailJS initialization failed: Missing USER_ID');
  }
}
