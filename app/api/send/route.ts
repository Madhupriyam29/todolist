import { EmailTemplate } from '../../../components/email-template';
import { Resend } from 'resend';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import * as React from 'react';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

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

// Helper function to check if a task is due soon (within the next 24 hours)
function isDueSoon(task: Task): boolean {
  if (!task.date || task.completed) return false;
  const taskDate = new Date(task.date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return taskDate >= today && taskDate <= tomorrow;
}

// Group users with their tasks
function groupTasksByUser(tasks: Task[]): Record<string, { username: string, email: string, overdueTasks: Task[], upcomingTasks: Task[] }> {
  const userMap: Record<string, { username: string, email: string, overdueTasks: Task[], upcomingTasks: Task[] }> = {};
  
  tasks.forEach(task => {
    if (!task.email) return; // Skip tasks without email
    
    if (!userMap[task.user_id]) {
      userMap[task.user_id] = {
        username: task.username,
        email: task.email,
        overdueTasks: [],
        upcomingTasks: []
      };
    }
    
    if (isOverdue(task)) {
      userMap[task.user_id].overdueTasks.push(task);
    } else if (isDueSoon(task)) {
      userMap[task.user_id].upcomingTasks.push(task);
    }
  });
  
  return userMap;
}

// Send reminder emails to users
async function sendReminderEmails(userTaskMap: Record<string, { username: string, email: string, overdueTasks: Task[], upcomingTasks: Task[] }>) {
  const emailPromises = [];
  
  for (const userId in userTaskMap) {
    const { username, email, overdueTasks, upcomingTasks } = userTaskMap[userId];
    
    // Send overdue tasks email if there are any
    if (overdueTasks.length > 0) {
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
    
    // Send upcoming tasks email if there are any
    if (upcomingTasks.length > 0) {
      emailPromises.push(
        resend.emails.send({
          from: 'TodoList <notifications@yourtodoapp.com>',
          to: [email],
          subject: `Reminder: You have ${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's' : ''} due soon`,
          react: React.createElement(EmailTemplate, { 
            firstName: username.split(' ')[0], 
            tasks: upcomingTasks,
            type: 'reminder'
          }),
        })
      );
    }
  }
  
  return Promise.all(emailPromises);
}

// Handle POST requests to send task reminders
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, taskId, type } = body;
    
    // If specific user and task are provided, send a targeted reminder
    if (userId && taskId) {
      const task = await convex.query(api.tasks.getTask, { id: taskId });
      
      if (!task || !task.email) {
        return Response.json({ error: 'Task or email not found' }, { status: 404 });
      }
      
      const { data, error } = await resend.emails.send({
        from: 'TodoList <notifications@yourtodoapp.com>',
        to: [task.email],
        subject: type === 'overdue' ? 'Task Overdue: Action Required' : 'Task Reminder',
        react: React.createElement(EmailTemplate, { 
          firstName: task.username.split(' ')[0], 
          tasks: [task],
          type: type || (isOverdue(task as Task) ? 'overdue' : 'reminder')
        }),
      });
      
      if (error) {
        return Response.json({ error }, { status: 500 });
      }
      
      return Response.json(data);
    } 
    // If no specific user/task, process all tasks for reminders
    else {
      // Get all tasks
      const allTasks = await convex.query(api.tasks.getAllTasks);
      
      if (!allTasks || !Array.isArray(allTasks)) {
        return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 });
      }
      
      // Group tasks by user
      const userTaskMap = groupTasksByUser(allTasks as Task[]);
      
      // Send emails
      const results = await sendReminderEmails(userTaskMap);
      
      return Response.json({ 
        success: true, 
        emailsSent: results.length,
        results 
      });
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
    return Response.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}

// Handle GET requests to check for overdue tasks
export async function GET() {
  try {
    // Get all tasks
    const allTasks = await convex.query(api.tasks.getAllTasks);
    
    if (!allTasks || !Array.isArray(allTasks)) {
      return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
    
    // Count overdue and upcoming tasks
    const overdueTasks = (allTasks as Task[]).filter(isOverdue);
    const upcomingTasks = (allTasks as Task[]).filter(isDueSoon);
    
    return Response.json({
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length
    });
  } catch (error) {
    console.error('Error checking tasks:', error);
    return Response.json({ error: 'Failed to check tasks' }, { status: 500 });
  }
}