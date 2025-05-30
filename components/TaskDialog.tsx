"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DatePickerWithPresets } from "@/components/DatePickerWithPresets";
import { PrioritySelector, type Priority } from "./PrioritySelector";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description: string; date: string; priority: Priority; completed: boolean }) => void;
  initialDate?: string;
}

export function TaskDialog({ isOpen, onClose, onSave, initialDate }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate ? new Date(initialDate) : new Date());
  const [priority, setPriority] = useState<Priority>(null);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      date: selectedDate ? new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        day: 'numeric' 
      }).format(selectedDate) : 'No Date',
      priority,
      completed
    });
    setTitle('');
    setDescription('');
    setSelectedDate(new Date());
    setPriority(null);
    setCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-4 overflow-y-auto">
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="h-5 w-5 rounded-full border-2 border-gray-400 dark:border-gray-500"
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task name"
                className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full mt-2 bg-transparent border-none outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              rows={2}
            />
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex flex-wrap gap-2">
            <DatePickerWithPresets 
              date={selectedDate} 
              setDate={setSelectedDate} 
            />
            
            <PrioritySelector
              value={priority}
              onChange={setPriority}
            />
            
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0"
            >
              <span>Reminders</span>
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 p-0"
            >
              <span>...</span>
            </Button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
            <div className="relative">
              <Button 
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs rounded-md text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                <span>Inbox</span>
                <span className="text-xs">▼</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-sm rounded-md text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="default"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm rounded-md bg-blue-600 text-white",
                  !title.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                )}
                disabled={!title.trim()}
              >
                Add task
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
