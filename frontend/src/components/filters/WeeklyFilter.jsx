"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i)
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

// Predefined week ranges
const WEEK_RANGES = {
  1: [1, 7],
  2: [8, 15],
  3: [16, 22],
  4: [23, "end"],
}

function getWeekRange(week, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const range = WEEK_RANGES[week] || [1, 7]
  const startDay = range[0]
  const endDay = range[1] === "end" ? daysInMonth : range[1]
  return [startDay, Math.min(endDay, daysInMonth)]
}

function getWeekNumber(day) {
  if (day >= 1 && day <= 7) return 1
  if (day >= 8 && day <= 15) return 2
  if (day >= 16 && day <= 22) return 3
  return 4 // day >= 23
}

export function WeeklyFilter({
  selectedWeek = 1,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  onWeekSelect,
  className,
}) {
  const [startDay, endDay] = getWeekRange(selectedWeek, year, month)

  // Building the calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startPad = new Date(year, month, 1).getDay()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const trailingDays = (7 - ((startPad + daysInMonth) % 7)) % 7

  const handleDayClick = (day) => {
    const week = getWeekNumber(day)
    const [start, end] = getWeekRange(week, year, month)
    onWeekSelect?.(week, start, end)
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg p-4 w-[280px]",
        className
      )}
    >
      {/* Header with navigation and dropdowns */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onPrevMonth}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Select
            value={String(month)}
            onValueChange={(val) => onMonthChange?.(Number(val))}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(year)}
            onValueChange={(val) => onYearChange?.(Number(val))}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onNextMonth}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Day labels */}
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}

        {/* Previous month days */}
        {Array.from({ length: startPad }, (_, i) => (
          <div
            key={`prev-${i}`}
            className="text-center text-xs text-muted-foreground/50 py-2"
          >
            {prevMonthDays - startPad + 1 + i}
          </div>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1
          const isStart = d === startDay
          const isEnd = d === endDay
          const isInRange = d > startDay && d < endDay

          // Determine if this day is at the start/end of a visual row
          const dayPosition = (startPad + d - 1) % 7
          const isRowStart = dayPosition === 0
          const isRowEnd = dayPosition === 6

          return (
            <button
              key={d}
              onClick={() => handleDayClick(d)}
              className={cn(
                "text-center text-xs py-2 transition-colors",
                isStart && "bg-[#2D317F] text-white",
                isStart && !isRowStart && "rounded-l-md",
                isEnd && "bg-[#2D317F] text-white",
                isEnd && !isRowEnd && "rounded-r-md",
                isInRange && "bg-[#B8C5E8] text-[#2D317F]",
                !isStart && !isEnd && !isInRange && "hover:bg-gray-100 rounded-md"
              )}
            >
              {d}
            </button>
          )
        })}

        {/* Next month days */}
        {Array.from({ length: trailingDays }, (_, i) => (
          <div
            key={`next-${i}`}
            className="text-center text-xs text-muted-foreground/50 py-2"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

export { getWeekRange, getWeekNumber }
