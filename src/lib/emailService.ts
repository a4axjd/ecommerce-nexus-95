
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
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONFIRMATION || process.env.EMAILJS_TEMPLATE_ID_CONFIRMATION || '', 
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
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN || process.env.EMAILJS_TEMPLATE_ID_ADMIN || '',
      templateParams
    );
    
    return result;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}

export async function sendStatusUpdateEmail(
  orderData: {
    id: string;
    customerName: string;
    customerEmail: string;
    status: string;
    items: any[];
    totalAmount: number;
    shippingAddress: any;
  }
) {
  try {
    console.log(`Sending status update email to ${orderData.customerEmail} for order ${orderData.id}`);
    
    const templateParams = {
      order_id: orderData.id,
      customer_name: orderData.customerName || orderData.shippingAddress.name,
      customer_email: orderData.customerEmail || orderData.shippingAddress.email,
      order_status: orderData.status.toUpperCase(),
      order_date: new Date().toLocaleDateString(),
      order_total: `$${orderData.totalAmount.toFixed(2)}`,
      shipping_address: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.postalCode || ''}`,
      status_message: getStatusMessage(orderData.status),
      order_items: JSON.stringify(orderData.items.map((item: any) => ({
        name: item.title,
        quantity: item.quantity,
        price: `$${item.price?.toFixed(2)}`
      })) || [])
    };
    
    const result = await sendEmailWithEmailJS(
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID_STATUS || process.env.EMAILJS_TEMPLATE_ID_STATUS || '',
      templateParams
    );
    
    return result;
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return { success: false, error };
  }
}

export async function sendEmailWithEmailJS(templateId: string, templateParams: Record<string, any>) {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID || '';
    const userId = import.meta.env.VITE_EMAILJS_USER_ID || process.env.EMAILJS_USER_ID || '';
    
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

function getStatusMessage(status: string): string {
  switch (status.toLowerCase()) {
    case 'processing':
      return "Your order is now being processed. We're preparing your items for shipment.";
    case 'shipped':
      return "Great news! Your order has been shipped and is on its way to you.";
    case 'delivered':
      return "Your order has been delivered. We hope you enjoy your purchase!";
    case 'cancelled':
      return "Your order has been cancelled. If you have questions, please contact customer support.";
    default:
      return "Your order status has been updated.";
  }
}

// Initialize EmailJS
export function initEmailJS() {
  const userId = import.meta.env.VITE_EMAILJS_USER_ID || process.env.EMAILJS_USER_ID;
  if (userId) {
    emailjs.init(userId);
    console.log('EmailJS initialized');
  } else {
    console.error('EmailJS initialization failed: Missing USER_ID');
  }
}
