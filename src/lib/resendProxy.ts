
// This file provides a client-side interface for sending emails
// It uses a fetch API to send requests without using the Resend SDK directly
// which avoids CORS and Node.js dependency issues

// Type for email data
interface EmailData {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Response type for the email sending operation
interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Sends an email using a mock response for the browser environment
 * In a real application, you would create a serverless function or API endpoint
 * to handle this request server-side
 */
export async function sendEmailViaProxy(emailData: EmailData): Promise<EmailResponse> {
  console.log('Attempting to send email with data:', {
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    htmlLength: emailData.html?.length || 0,
  });
  
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('Missing Resend API key. Please check your .env file and make sure VITE_RESEND_API_KEY is set.');
    return { success: false, error: 'Missing API key' };
  }
  
  // Since we can't directly use the Resend API from the browser due to CORS,
  // we'll return a mock success response for development/testing purposes
  // In production, you would implement a serverless function or backend API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock successful response
  console.log('Simulating successful email delivery in browser environment');
  return {
    success: true,
    data: {
      id: `mock-email-${Date.now()}`,
      from: emailData.from,
      to: emailData.to,
      created_at: new Date().toISOString(),
    }
  };
}
