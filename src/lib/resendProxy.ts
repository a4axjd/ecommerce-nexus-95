
// This file creates a server-side proxy to handle Resend API requests
// to avoid CORS issues in the browser

import { Resend } from 'resend';

// Initialize with API key from environment variables
const apiKey = import.meta.env.VITE_RESEND_API_KEY;
const resend = new Resend(apiKey);

// Type for email data
interface EmailData {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailViaProxy(emailData: EmailData) {
  console.log('Sending email via proxy with data:', {
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    htmlLength: emailData.html?.length || 0,
  });
  
  if (!apiKey) {
    console.error('Missing Resend API key. Please check your .env file and make sure VITE_RESEND_API_KEY is set.');
    return { success: false, error: 'Missing API key' };
  }
  
  try {
    // Use the Resend SDK directly instead of fetch
    const { data, error } = await resend.emails.send({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
    
    if (error) {
      console.error('Failed to send email via Resend SDK:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Email sent successfully via proxy:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email via proxy:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
