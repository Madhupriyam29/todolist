"use client";

import { useState } from "react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
import { CalendarIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TaskDialog } from "@/components/TaskDialog";
import { type Priority } from "@/components/PrioritySelector";
import { Id } from "@/convex/_generated/dataModel";

// Define Task interface based on Convex schema
interface Task {
  _id?: Id<"task">;
  _creationTime?: number;
  title: string;
  date?: string;
  priority?: string;
  reminder?: string;
  completed?: boolean;
  user_id: string;
  username: string;
  email?: string;
}

export default function Upcoming() {
  const user = useUser({ or: "redirect" });
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch tasks from Convex
  const userTasks = useQuery(api.tasks.getTasksByUser, { 
    user_id: user?.id || "" 
  }) || [];

  // Convex mutations
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);

  // Get current date and next few days
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Format dates for display
  const formatDate = (date: Date) => {
    return `${date.getDate()} ${months[date.getMonth()]} · ${weekdays[date.getDay()]}`;
  };
  
  console.log(formatDate(today));
  // Get the month and year for the header
  const currentMonth = months[today.getMonth()];
  const currentYear = today.getFullYear();

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  
  // Initialize dates for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    tasksByDate[dateStr] = [];
  }

  // Group tasks into their respective dates
  userTasks.forEach((task) => {
    if (task.date) {
      // If the task has a date, add it to that date's array
      if (!tasksByDate[task.date]) {
        tasksByDate[task.date] = [];
      }
      tasksByDate[task.date].push(task);
    }
  });

  // Handle adding a new task
  const handleAddTask = async (task: { title: string; description: string; date: string; priority: Priority; completed: boolean }) => {
    if (!user) return;
    
    try {
      await createTask({
        title: task.title,
        date: task.date,
        priority: task.priority || undefined,
        reminder: undefined,
        completed: task.completed,
        user_id: user.id,
        username: user.displayName || 'Anonymous',
        email: `${user.id}@example.com`, // Add a placeholder email based on user ID
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Generate the next 7 days for the calendar header
  const calendarDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    calendarDays.push({
      date: date,
      day: weekdays[date.getDay()].substring(0, 3),
      dayOfMonth: date.getDate(),
      isToday: i === 0
    });
  }

  // Format a date for display in the task list
  const formatTaskDate = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    const dayOfWeek = weekdays[date.getDay()];
    
    if (index === 0) {
      return `${date.getDate()} ${months[date.getMonth()]} · Today · ${dayOfWeek}`;
    } else if (index === 1) {
      return `${date.getDate()} ${months[date.getMonth()]} · Tomorrow · ${dayOfWeek}`;
    } else {
      return `${date.getDate()} ${months[date.getMonth()]} · ${dayOfWeek}`;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Task Dialog */}
      <TaskDialog 
        isOpen={isTaskDialogOpen} 
        onClose={() => setIsTaskDialogOpen(false)} 
        onSave={handleAddTask}
        initialDate={selectedDate || undefined}
      />
      
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
            {user?.displayName?.charAt(0) || 'M'}
          </div>
          <div className="ml-2 text-sm font-medium truncate">{user?.displayName || 'Madhupriyam29'}</div>
        </div>
        
        <button 
          className="mx-4 my-3 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md py-2 px-3 text-sm font-medium"
          onClick={() => {
            setSelectedDate(null);
            setIsTaskDialogOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Add task
        </button>
        
        <div className="mx-4 my-2 relative">
          <SearchIcon className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full pl-9 pr-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm"
          />
        </div>
        
        <nav className="mt-2 flex-1">
          <ul className="space-y-1">
            <li>
              <Link href="/inbox" className="flex items-center px-4 py-2 text-sm hover:bg-secondary">
                <span className="flex-1">Inbox</span>
                <span className="text-muted-foreground">3</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm hover:bg-secondary">
                <span className="flex-1">Today</span>
                <span className="text-muted-foreground">3</span>
              </Link>
            </li>
            <li>
              <Link href="/upcoming" className="flex items-center px-4 py-2 text-sm bg-secondary">
                <span className="flex-1">Upcoming</span>
              </Link>
            </li>
            <li>
              <Link href="/filters" className="flex items-center px-4 py-2 text-sm hover:bg-secondary">
                <span className="flex-1">Filters & Labels</span>
              </Link>
            </li>
            <li>
              <Link href="/completed" className="flex items-center px-4 py-2 text-sm hover:bg-secondary">
                <span className="flex-1">Completed</span>
              </Link>
            </li>
          </ul>
          
          <div className="mt-6 px-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">My Projects</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/home" className="flex items-center px-4 py-2 text-sm hover:bg-secondary">
                  <span className="flex-1">Home</span>
                  <span className="text-muted-foreground">5</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="mt-auto p-4">
          <button className="w-full flex items-center justify-center text-sm text-muted-foreground hover:text-foreground py-2">
            Add a team
          </button>
          <button className="w-full flex items-center justify-center text-sm text-muted-foreground hover:text-foreground py-2">
            Help
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Upcoming</h1>
            <div className="flex items-center gap-2">
              <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Connect calendar
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground">
                View
              </button>
            </div>
          </div>
          
          {/* Month and year */}
          <div className="text-sm text-muted-foreground mb-4">
            <span>{currentMonth} {currentYear} ·</span>
          </div>
          
          {/* Calendar days */}
          <div className="flex mb-8 border-b pb-4">
            {calendarDays.map((day, index) => (
              <div key={index} className={`flex-1 flex flex-col items-center ${day.isToday ? 'text-primary' : ''}`}>
                <div className="text-xs">{day.day}</div>
                <div className={`text-sm mt-1 w-8 h-8 flex items-center justify-center rounded-full ${day.isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                  {day.dayOfMonth}
                </div>
              </div>
            ))}
          </div>
          
          {/* Overdue section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <button className="flex items-center gap-1 text-sm font-medium">
                <span className="transform rotate-90">▶</span> Overdue
              </button>
              <button className="text-sm text-destructive">Reschedule</button>
            </div>
          </div>
          
          {/* Tasks by date */}
          {Object.keys(tasksByDate).sort().map((dateStr, index) => (
            <div key={dateStr} className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium">{formatTaskDate(dateStr, index)}</span>
              </div>
              
              <div className="space-y-1 mt-2">
                {tasksByDate[dateStr].map(task => (
                  <div key={task._id} className="flex items-center p-2 hover:bg-secondary rounded-md">
                    <input 
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={() => {
                        if (task._id) {
                          updateTask({
                            id: task._id,
                            completed: !task.completed
                          });
                        }
                      }}
                      className="h-4 w-4 rounded-full border-2 border-muted-foreground mr-3"
                    />
                    <span className="flex-1">{task.title}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mt-2 p-2"
                onClick={() => {
                  setSelectedDate(dateStr);
                  setIsTaskDialogOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add task</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
