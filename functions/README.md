
# Firebase Functions for Order Email Notifications

This Firebase Cloud Function automatically sends email notifications when orders are created or updated in your Firestore database.

## Setup Instructions

1. **Install Firebase CLI** (if not already installed)
   ```
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```
   firebase login
   ```

3. **Set Environment Variables**
   ```
   firebase functions:config:set emailjs.service_id="YOUR_SERVICE_ID" emailjs.template_id.confirmation="YOUR_CONFIRMATION_TEMPLATE_ID" emailjs.template_id.admin="YOUR_ADMIN_TEMPLATE_ID" emailjs.user_id="YOUR_USER_ID" admin.email="admin@example.com"
   ```

4. **Deploy the Function**
   ```
   firebase deploy --only functions
   ```

## EmailJS Templates

You'll need to create templates in your EmailJS account:

1. **Order Confirmation Template**
   - Create a template for customer order confirmations
   - Use template parameters: `{{order_id}}`, `{{customer_name}}`, `{{order_date}}`, `{{order_total}}`, `{{shipping_address}}`, `{{order_items}}`, `{{payment_method}}`

2. **Admin Notification Template**
   - Create a template for admin order notifications
   - Use template parameters: `{{order_id}}`, `{{customer_name}}`, `{{customer_email}}`, `{{order_date}}`, `{{order_total}}`, `{{shipping_address}}`, `{{order_items}}`, `{{payment_method}}`

## Testing

To test the function locally:

```
cd functions
npm run serve
```

Then, create or update an order document in your local Firestore emulator.
