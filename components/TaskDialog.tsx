import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description: string; date: string }) => void;
}

export function TaskDialog({ isOpen, onClose, onSave }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      date: selectedDate,
    });
    setTitle('');
    setDescription('');
    setSelectedDate('Today');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full mt-2 bg-transparent border-none outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              rows={2}
            />
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex flex-wrap gap-2">
            <button 
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <CalendarIcon className="h-3 w-3" />
              <span>{selectedDate}</span>
            </button>
            
            <button 
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>Priority</span>
            </button>
            
            <button 
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>Reminders</span>
            </button>
            
            <button 
              type="button"
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>...</span>
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
            <div className="relative">
              <button 
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span>Inbox</span>
                <span className="text-xs">▼</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-3 py-1 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className={cn(
                  "px-3 py-1 text-sm rounded-md bg-blue-600 text-white",
                  !title.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                )}
                disabled={!title.trim()}
              >
                Add task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
