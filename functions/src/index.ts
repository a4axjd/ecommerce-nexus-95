
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get environment variables from Cloud Functions config
const config = functions.config();

// EmailJS configuration
const EMAILJS_SERVICE_ID = config.emailjs?.service_id || process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID_CONFIRMATION = config.emailjs?.template_id?.confirmation || process.env.EMAILJS_TEMPLATE_ID_CONFIRMATION;
const EMAILJS_TEMPLATE_ID_ADMIN = config.emailjs?.template_id?.admin || process.env.EMAILJS_TEMPLATE_ID_ADMIN;
const EMAILJS_USER_ID = config.emailjs?.user_id || process.env.EMAILJS_USER_ID;
const ADMIN_EMAIL = config.admin?.email || process.env.ADMIN_EMAIL || 'admin@example.com';

// Function to send email via EmailJS
async function sendEmailWithEmailJS(
  templateId: string,
  templateParams: Record<string, any>
) {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_USER_ID || !templateId) {
      console.error('Missing EmailJS configuration:', {
        serviceId: EMAILJS_SERVICE_ID ? 'Set' : 'Missing',
        userId: EMAILJS_USER_ID ? 'Set' : 'Missing',
        templateId: templateId ? 'Set' : 'Missing'
      });
      throw new Error('Missing EmailJS configuration');
    }
    
    console.log(`Sending email with EmailJS using template: ${templateId}`);
    
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_USER_ID,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS API error: ${response.status} ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Firebase Cloud Function to send order confirmation emails
export const sendOrderEmails = functions.firestore
  .document('orders/{orderId}')
  .onWrite(async (change, context) => {
    try {
      const orderId = context.params.orderId;
      
      // If document was deleted, don't send an email
      if (!change.after.exists) {
        console.log(`Order ${orderId} was deleted, no email sent`);
        return null;
      }
      
      const orderData = change.after.data();
      
      if (!orderData) {
        console.log(`No data found for order ${orderId}`);
        return null;
      }

      // Check if this is a new document or an update
      const isNewOrder = !change.before.exists;
      
      // For new orders, send both customer confirmation and admin notification
      if (isNewOrder) {
        console.log(`New order ${orderId} created, sending emails`);
        
        // Prepare data for customer email
        const customerEmailParams = {
          order_id: orderId,
          customer_name: orderData.shippingAddress?.name || 'Customer',
          customer_email: orderData.shippingAddress?.email,
          order_date: new Date(orderData.createdAt).toLocaleDateString(),
          order_total: `$${orderData.totalAmount?.toFixed(2)}`,
          shipping_address: `${orderData.shippingAddress?.address}, ${orderData.shippingAddress?.city}, ${orderData.shippingAddress?.state || ''} ${orderData.shippingAddress?.postalCode || ''}`,
          order_items: JSON.stringify(orderData.items?.map((item: any) => ({
            name: item.title,
            quantity: item.quantity,
            price: `$${item.price?.toFixed(2)}`
          })) || []),
          payment_method: orderData.paymentMethod
        };
        
        // Send customer confirmation email
        if (orderData.shippingAddress?.email) {
          await sendEmailWithEmailJS(
            EMAILJS_TEMPLATE_ID_CONFIRMATION!,
            customerEmailParams
          );
          console.log(`Confirmation email sent to customer: ${orderData.shippingAddress.email}`);
        }
        
        // Prepare data for admin notification
        const adminEmailParams = {
          order_id: orderId,
          customer_name: orderData.shippingAddress?.name || 'Customer',
          customer_email: orderData.shippingAddress?.email || 'No email provided',
          order_date: new Date(orderData.createdAt).toLocaleDateString(),
          order_total: `$${orderData.totalAmount?.toFixed(2)}`,
          shipping_address: `${orderData.shippingAddress?.address}, ${orderData.shippingAddress?.city}, ${orderData.shippingAddress?.state || ''} ${orderData.shippingAddress?.postalCode || ''}`,
          order_items: JSON.stringify(orderData.items?.map((item: any) => ({
            name: item.title,
            quantity: item.quantity,
            price: `$${item.price?.toFixed(2)}`
          })) || []),
          payment_method: orderData.paymentMethod
        };
        
        // Send admin notification email
        await sendEmailWithEmailJS(
          EMAILJS_TEMPLATE_ID_ADMIN!,
          adminEmailParams
        );
        
        console.log(`Admin notification email sent for order ${orderId}`);
      } else {
        // This is an update to an existing order
        const oldStatus = change.before.data()?.status;
        const newStatus = orderData.status;
        
        // Only send email if status changed
        if (oldStatus !== newStatus) {
          console.log(`Order ${orderId} status changed from ${oldStatus} to ${newStatus}`);
          
          // Handle status change notifications here if needed
          // For example, send shipping confirmation when status changes to 'shipped'
          if (newStatus === 'shipped' && orderData.shippingAddress?.email) {
            const statusUpdateParams = {
              order_id: orderId,
              customer_name: orderData.shippingAddress?.name || 'Customer',
              customer_email: orderData.shippingAddress?.email,
              order_status: newStatus,
              order_date: new Date(orderData.createdAt).toLocaleDateString(),
              order_total: `$${orderData.totalAmount?.toFixed(2)}`,
              status_message: `Your order has been ${newStatus}!`
            };
            
            await sendEmailWithEmailJS(
              EMAILJS_TEMPLATE_ID_CONFIRMATION!,
              statusUpdateParams
            );
            
            console.log(`Status update email sent to ${orderData.shippingAddress.email}`);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in sendOrderEmails function:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
