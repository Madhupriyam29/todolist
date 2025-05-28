import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as React from 'react';
import { EmailTemplate } from '../../../components/email-template';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple test endpoint that sends a test email
export async function GET(request: Request) {
  try {
    // Get the email from the URL query parameter or use the verified email
    const { searchParams } = new URL(request.url);
    // Always use the verified email in test mode
    const email = 'madhupriyam2000@gmail.com';
    
    console.log("searchparams", searchParams);
    // Create some sample overdue tasks
    const sampleTasks = [
      {
        title: "Complete project report",
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        priority: "high"
      },
      {
        title: "Schedule team meeting",
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        priority: "medium"
      }
    ];
    
    // Send a test email
    const result = await resend.emails.send({
      from: 'TodoList <onboarding@resend.dev>',
      to: [email],
      subject: `You have 2 overdue tasks`,
      react: React.createElement(EmailTemplate, { 
        firstName: "User", 
        tasks: sampleTasks,
        type: 'overdue'
      }),
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${email}`,
      result
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      message: (error as Error).message 
    }, { status: 500 });
  }
}
