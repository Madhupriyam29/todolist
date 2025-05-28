import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import * as React from 'react';
import { EmailTemplate } from '../../../components/email-template';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

// Define Task interface
interface Task {
  _id: string;
  title: string;
  date?: string;
  priority?: string;
  reminder?: string;
  completed?: boolean;
  user_id: string;
  username: string;
  email?: string;
}

// Helper function to check if a task is overdue
function isOverdue(task: Task): boolean {
  if (!task.date || task.completed) return false;
  const taskDate = new Date(task.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return taskDate < today;
}

// Group users with their tasks
function groupTasksByUser(tasks: Task[]): Record<string, { username: string, email: string, overdueTasks: Task[] }> {
  // In test mode, we'll group all tasks under a single user with the verified email
  const verifiedEmail = 'madhupriyam2000@gmail.com';
  
  const userTaskMap: Record<string, { username: string, email: string, overdueTasks: Task[] }> = {
    'test-user': {
      username: 'Test User',
      email: verifiedEmail,
      overdueTasks: []
    }
  };
  
  // Add all overdue tasks to the test user
  tasks.forEach(task => {
    if (isOverdue(task)) {
      userTaskMap['test-user'].overdueTasks.push(task);
    }
  });
  
  // If no overdue tasks, return empty object
  if (userTaskMap['test-user'].overdueTasks.length === 0) {
    return {};
  }
  
  return userTaskMap;
}

// Send reminder emails to users
async function sendOverdueReminders(userTaskMap: Record<string, { username: string, email: string, overdueTasks: Task[] }>) {
  const results = [];
  
  for (const userId in userTaskMap) {
    const { username, email, overdueTasks } = userTaskMap[userId];
    
    // Skip if no overdue tasks
    if (overdueTasks.length === 0) continue;
    
    try {
      const result = await resend.emails.send({
        from: 'TodoList <notifications@yourtodoapp.com>',
        to: [email],
        subject: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        react: React.createElement(EmailTemplate, { 
          firstName: username.split(' ')[0], 
          tasks: overdueTasks,
          type: 'overdue'
        }),
      });
      
      results.push({
        userId,
        email,
        success: true,
        messageId: result.data?.id,
        tasksCount: overdueTasks.length
      });
    } catch (error) {
      results.push({
        userId,
        email,
        success: false,
        error: (error as Error).message,
        tasksCount: overdueTasks.length
      });
    }
  }
  
  return results;
}

// Simple test endpoint that can be accessed from the browser
export async function GET() {
  try {
    // Get all tasks
    const allTasks = await convex.query(api.tasks.getAllTasks);
    
    if (!allTasks || !Array.isArray(allTasks)) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
    
    // Group tasks by user
    const userTaskMap = groupTasksByUser(allTasks as Task[]);
    
    // If no users have overdue tasks, return early
    if (Object.keys(userTaskMap).length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No overdue tasks found',
        emailsSent: 0
      });
    }
    
    // Send emails
    const results = await sendOverdueReminders(userTaskMap);
    
    return NextResponse.json({ 
      success: true, 
      emailsSent: results.length,
      usersNotified: Object.keys(userTaskMap).length,
      totalOverdueTasks: Object.values(userTaskMap).reduce((sum, userData) => sum + userData.overdueTasks.length, 0),
      details: results
    });
  } catch (error) {
    console.error('Error sending overdue reminders:', error);
    return NextResponse.json({ 
      error: 'Failed to send reminders',
      message: (error as Error).message 
    }, { status: 500 });
  }
}
