
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
export const stripePromise = loadStripe('pk_test_51O6OJlIFOGFQE3xR9lkGsTgAhCNBQDn9KfsPMnjGj3Xv3mRgBPJ2lT6Gi7O2cObstmLELGbMPxeJpobPsGJVMmQH00W9ggDBpL');

export const createCheckoutSession = async (items: any[]) => {
  const stripe = await stripePromise;
  
  // Call your backend to create a checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: items,
    }),
  });
  
  const session = await response.json();
  
  // Redirect to Stripe Checkout
  const result = await stripe!.redirectToCheckout({
    sessionId: session.id,
  });
  
  if (result.error) {
    console.error(result.error.message);
  }
};
