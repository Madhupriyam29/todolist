import { EmailTemplate } from '../../../../components/email-template';
import { Resend } from 'resend';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import * as React from 'react';

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
  const userTaskMap: Record<string, { username: string, email: string, overdueTasks: Task[] }> = {};
  
  tasks.forEach(task => {
    if (!task.email) return; // Skip tasks without email
    
    // Initialize user entry if it doesn't exist
    if (!userTaskMap[task.user_id]) {
      userTaskMap[task.user_id] = {
        username: task.username,
        email: task.email,
        overdueTasks: []
      };
    }
    
    // Add overdue tasks
    if (isOverdue(task)) {
      userTaskMap[task.user_id].overdueTasks.push(task);
    }
  });
  
  // Filter out users with no overdue tasks
  return Object.fromEntries(
    Object.entries(userTaskMap).filter(([, userData]) => userData.overdueTasks.length > 0)
  );
}

// Send reminder emails to users
async function sendOverdueReminders(userTaskMap: Record<string, { username: string, email: string, overdueTasks: Task[] }>) {
  const emailPromises = [];
  
  for (const userId in userTaskMap) {
    const { username, email, overdueTasks } = userTaskMap[userId];
    
    // Skip if no overdue tasks
    if (overdueTasks.length === 0) continue;
    
    emailPromises.push(
      resend.emails.send({
        from: 'TodoList <notifications@yourtodoapp.com>',
        to: [email],
        subject: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        react: React.createElement(EmailTemplate, { 
          firstName: username.split(' ')[0], 
          tasks: overdueTasks,
          type: 'overdue'
        }),
      })
    );
  }
  
  return Promise.all(emailPromises);
}

// This route is designed to be called by a scheduled job (e.g., CRON)
// It includes a simple authorization check using a secret key
export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET_KEY || 'development-mode'}`;
    
    // Skip auth check in development mode if CRON_SECRET_KEY is not set
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment && authHeader !== expectedToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all tasks
    const allTasks = await convex.query(api.tasks.getAllTasks);
    
    if (!allTasks || !Array.isArray(allTasks)) {
      return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
    
    // Group tasks by user
    const userTaskMap = groupTasksByUser(allTasks as Task[]);
    
    // If no users have overdue tasks, return early
    if (Object.keys(userTaskMap).length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No overdue tasks found',
        emailsSent: 0
      });
    }
    
    // Send emails
    const results = await sendOverdueReminders(userTaskMap);
    
    return Response.json({ 
      success: true, 
      emailsSent: results.length,
      usersNotified: Object.keys(userTaskMap).length,
      totalOverdueTasks: Object.values(userTaskMap).reduce((sum, userData) => sum + userData.overdueTasks.length, 0)
    });
  } catch (error) {
    console.error('Error sending overdue reminders:', error);
    return Response.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
