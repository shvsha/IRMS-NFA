"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i)
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function DailyFilter({
  value,
  onChange,
  className,
}) {
  const today = new Date()
  const [viewMonth, setViewMonth] = React.useState(
    value ? value.getMonth() : today.getMonth()
  )
  const [viewYear, setViewYear] = React.useState(
    value ? value.getFullYear() : today.getFullYear()
  )

  React.useEffect(() => {
    if (value) {
      setViewMonth(value.getMonth())
      setViewYear(value.getFullYear())
    }
  }, [value])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startPad = new Date(viewYear, viewMonth, 1).getDay()
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  const trailingDays = (7 - ((startPad + daysInMonth) % 7)) % 7

  const isSelected = (day) =>
    value &&
    value.getFullYear() === viewYear &&
    value.getMonth() === viewMonth &&
    value.getDate() === day

  const handleDayClick = (day) => {
    onChange?.(new Date(viewYear, viewMonth, day))
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-lg p-4 w-[280px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handlePrevMonth}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Select
            value={String(viewMonth)}
            onValueChange={(val) => setViewMonth(Number(val))}
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
            value={String(viewYear)}
            onValueChange={(val) => setViewYear(Number(val))}
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
          onClick={handleNextMonth}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}

        {/* Prev month padding */}
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
          const day = i + 1
          const selected = isSelected(day)
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={cn(
                "text-center text-xs py-2 rounded-md transition-colors",
                selected
                  ? "bg-[#2D317F] text-white"
                  : "hover:bg-gray-100 text-foreground"
              )}
            >
              {day}
            </button>
          )
        })}

        {/* Next month padding */}
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