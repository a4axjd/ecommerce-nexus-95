
import { loadStripe } from '@stripe/stripe-js';

// Empty implementation since we're not using Stripe payments directly anymore
export const stripePromise = loadStripe('pk_test_51O6OJlIFOGFQE3xR9lkGsTgAhCNBQDn9KfsPMnjGj3Xv3mRgBPJ2lT6Gi7O2cObstmLELGbMPxeJpobPsGJVMmQH00W9ggDBpL');

// This function can be used if we need to re-enable Stripe in the future
export const createPaymentIntent = async (amount: number) => {
  console.log("Stripe payment functionality is currently disabled");
  return null;
};
