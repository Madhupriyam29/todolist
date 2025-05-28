import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CalendarIcon, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  _id: Id<"task">;
  title: string;
  date?: string;
  priority?: string;
  completed?: boolean;
  user_id: string;
  username: string;
  email?: string;
}

interface OverdueTasksSectionProps {
  tasks: Task[];
  onRescheduleAll: () => void;
}

export function OverdueTasksSection({ tasks, onRescheduleAll }: OverdueTasksSectionProps) {
  const [expanded, setExpanded] = React.useState(true);
  const updateTask = useMutation(api.tasks.updateTask);
  
  // Filter only overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.date || task.completed) return false;
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
  });

  if (overdueTasks.length === 0) {
    return null;
  }

  const toggleTaskCompletion = (taskId: Id<"task">, completed: boolean) => {
    updateTask({
      id: taskId,
      completed: !completed
    });
  };

  const sendTaskReminder = async (task: Task) => {
    try {
      // Call the API route to send a reminder for this specific task
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: task.user_id,
          taskId: task._id,
          type: 'overdue'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }
      
      // Show a success message
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  return (
    <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
      <div className="flex items-center justify-between mb-2">
        <button 
          className="flex items-center gap-2 text-sm font-medium text-red-600"
          onClick={() => setExpanded(!expanded)}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Overdue - {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'}</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button 
          className="text-sm text-red-600 hover:text-red-800 font-medium"
          onClick={onRescheduleAll}
        >
          Reschedule All
        </button>
      </div>
      
      {expanded && (
        <div className="space-y-2 mt-3">
          {overdueTasks.map(task => (
            <div 
              key={task._id} 
              className="flex items-center justify-between p-3 bg-white rounded-md border border-red-100 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <input 
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() => toggleTaskCompletion(task._id, task.completed || false)}
                  className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </div>
                  {task.date && (
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>Due {format(new Date(task.date), 'PPP')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                )}
                <button 
                  onClick={() => sendTaskReminder(task)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                >
                  Send Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
