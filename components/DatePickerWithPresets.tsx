"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, Clock as ClockIcon, Repeat as RepeatIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithPresetsProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function DatePickerWithPresets({ date, setDate }: DatePickerWithPresetsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  // Preset dates
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const inTwoDays = addDays(today, 2)
  const inOneWeek = addDays(today, 7)

  // Get day name for tomorrow
  const tomorrowDayName = format(tomorrow, 'EEE')
  
  // Get day name for weekend
  const weekendDayName = format(inTwoDays, 'EEE')
  
  // Get day and month for next week
  const nextWeekDay = format(inOneWeek, 'EEE d MMM')

  // Format date for display
  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "Today"
    
    // If date is today
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return "Today"
    }
    
    // If date is tomorrow
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return "Tomorrow"
    }
    
    // Otherwise return formatted date
    return format(date, 'd MMMM')
  }

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {formatDisplayDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 flex flex-col" 
        align="start" 
        sideOffset={8}
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      >
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-xs font-medium py-1 px-2 rounded mb-1">
            {format(today, 'd MMMM')}
          </div>
          <div className="grid grid-cols-1 gap-1">
            <Button
              variant="ghost"
              className="justify-start text-left font-normal px-2 py-1 h-auto"
              onClick={() => {
                setDate(today)
                setIsCalendarOpen(false)
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center text-blue-500 mr-2">☀️</span>
              <span>Today</span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-left font-normal px-2 py-1 h-auto"
              onClick={() => {
                setDate(tomorrow)
                setIsCalendarOpen(false)
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center text-blue-500 mr-2">🌅</span>
              <span>Tomorrow</span>
              <span className="ml-auto text-xs text-gray-500">{tomorrowDayName}</span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-left font-normal px-2 py-1 h-auto"
              onClick={() => {
                setDate(inTwoDays)
                setIsCalendarOpen(false)
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center text-blue-500 mr-2">🏖️</span>
              <span>This weekend</span>
              <span className="ml-auto text-xs text-gray-500">{weekendDayName}</span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-left font-normal px-2 py-1 h-auto"
              onClick={() => {
                setDate(inOneWeek)
                setIsCalendarOpen(false)
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center text-blue-500 mr-2">📅</span>
              <span>Next week</span>
              <span className="ml-auto text-xs text-gray-500">{nextWeekDay}</span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-left font-normal px-2 py-1 h-auto"
              onClick={() => {
                setDate(undefined)
                setIsCalendarOpen(false)
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center text-gray-400 mr-2">⊘</span>
              <span>No Date</span>
            </Button>
          </div>
        </div>
        
        <div className="calendar-container p-3 overflow-y-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date: Date | undefined) => {
              setDate(date)
              setIsCalendarOpen(false)
            }}
            initialFocus
            className="rounded-md"
          />
        </div>
        
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal px-2 py-1 h-auto"
          >
            <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span>Time</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal px-2 py-1 h-auto"
          >
            <RepeatIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span>Repeat</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
