"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type Priority = "high" | "medium" | "low" | null

interface PrioritySelectorProps {
  value: Priority
  onChange: (value: Priority) => void
  className?: string
}

export function PrioritySelector({ value, onChange, className }: PrioritySelectorProps) {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "text-red-500 border-red-500"
      case "medium":
        return "text-orange-500 border-orange-500"
      case "low":
        return "text-blue-500 border-blue-500"
      default:
        return "text-gray-500 border-gray-300"
    }
  }

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "High"
      case "medium":
        return "Medium"
      case "low":
        return "Low"
      default:
        return "No Priority"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between border",
            getPriorityColor(value),
            className
          )}
        >
          {getPriorityLabel(value)}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => onChange("high")}
        >
          <span className="text-red-500 font-medium">High</span>
          {value === "high" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => onChange("medium")}
        >
          <span className="text-orange-500 font-medium">Medium</span>
          {value === "medium" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => onChange("low")}
        >
          <span className="text-blue-500 font-medium">Low</span>
          {value === "low" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => onChange(null)}
        >
          <span className="text-gray-500 font-medium">No Priority</span>
          {value === null && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
