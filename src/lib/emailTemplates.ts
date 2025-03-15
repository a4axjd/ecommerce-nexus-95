
interface OrderTemplateData {
  orderNumber: string;
  customerName: string;
  orderItems: Array<{
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    zipCode?: string;
    country: string;
    email?: string;
    phone?: string;
  };
}

export function generateOrderConfirmationEmailTemplate(data: OrderTemplateData): string {
  const itemsHtml = data.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.title}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
        .content { padding: 20px; border: 1px solid #eee; border-radius: 0 0 4px 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f8f9fa; text-align: left; padding: 10px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Thank You for Your Order!</h1>
      </div>
      <div class="content">
        <p>Hello ${data.customerName},</p>
        <p>We're pleased to confirm that we've received your order. Here's a summary of your purchase:</p>
        
        <h2>Order #${data.orderNumber}</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>Items Ordered:</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
              <td style="text-align: right; padding: 10px;"><strong>$${data.total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Shipping Address:</h3>
        <p>
          ${data.shippingAddress.name}<br>
          ${data.shippingAddress.address}<br>
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode || data.shippingAddress.zipCode || ''}<br>
          ${data.shippingAddress.country}
        </p>
        
        <p>We'll send you another email when your order ships. If you have any questions, please don't hesitate to contact our customer service team.</p>
        
        <p>Thank you for shopping with us!</p>
      </div>
      <div class="footer">
        <p>This email was sent to you because you made a purchase on our website. If you have any questions, please contact customer support.</p>
      </div>
    </body>
    </html>
  `;
}

export function generateAdminOrderNotificationTemplate(data: OrderTemplateData): string {
  const itemsHtml = data.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.title}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 4px 4px 0 0; }
        .content { padding: 20px; border: 1px solid #eee; border-radius: 0 0 4px 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f8f9fa; text-align: left; padding: 10px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Order Received</h1>
      </div>
      <div class="content">
        <p>A new order has been placed on your store. Here are the details:</p>
        
        <h2>Order #${data.orderNumber}</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.shippingAddress.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${data.shippingAddress.phone || 'Not provided'}</p>
        
        <h3>Items Ordered:</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
              <td style="text-align: right; padding: 10px;"><strong>$${data.total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Shipping Address:</h3>
        <p>
          ${data.shippingAddress.name}<br>
          ${data.shippingAddress.address}<br>
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode || data.shippingAddress.zipCode || ''}<br>
          ${data.shippingAddress.country}
        </p>
        
        <a href="https://yourdomain.com/admin/orders" class="button" style="color: white;">View Order Details</a>
      </div>
      <div class="footer">
        <p>This is an automated notification from your e-commerce system.</p>
      </div>
    </body>
    </html>
  `;
}
