
import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key
export const stripePromise = loadStripe('pk_test_51O6OJlIFOGFQE3xR9lkGsTgAhCNBQDn9KfsPMnjGj3Xv3mRgBPJ2lT6Gi7O2cObstmLELGbMPxeJpobPsGJVMmQH00W9ggDBpL');

export const createCheckoutSession = async (items: any[]) => {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }
    
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
    
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    const session = await response.json();
    
    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    
    if (result.error) {
      console.error(result.error.message);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};
