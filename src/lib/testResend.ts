
import { Resend } from 'resend';

export async function testResendConnection() {
  // Get API key from environment
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  
  console.log('Testing Resend connection...');
  console.log('API key present:', !!apiKey);
  
  if (!apiKey) {
    return {
      success: false,
      message: 'Missing Resend API key. Check your .env file and ensure VITE_RESEND_API_KEY is correctly set.'
    };
  }
  
  try {
    const resend = new Resend(apiKey);
    
    // Try sending a test email
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's default sender for testing
      to: 'delivered@resend.dev', // Resend's test recipient that always succeeds
      subject: 'Test Email Connection',
      html: '<p>This is a test email to verify Resend is working properly.</p>',
    });
    
    console.log('Resend test response:', response);
    
    return {
      success: true,
      message: 'Successfully connected to Resend API and sent test email',
      response
    };
  } catch (error) {
    console.error('Error testing Resend connection:', error);
    return {
      success: false,
      message: `Failed to connect to Resend: ${error instanceof Error ? error.message : String(error)}`,
      error
    };
  }
}
