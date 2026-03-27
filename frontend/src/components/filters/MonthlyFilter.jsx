"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i)
const MONTHS = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
]

// Group months into rows of 3
const MONTH_ROWS = [
  MONTHS.slice(0, 3),
  MONTHS.slice(3, 6),
  MONTHS.slice(6, 9),
  MONTHS.slice(9, 12),
]

export function MonthlyFilter({
  selectedMonth = "January",
  year,
  onYearChange,
  onMonthChange,
  className,
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg p-4 w-[280px]",
        className
      )}
    >
      {/* Header with month display and year dropdown */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">
          {selectedMonth}
        </span>
        <Select
          value={String(year)}
          onValueChange={(val) => onYearChange?.(Number(val))}
        >
          <SelectTrigger className="h-8 w-[90px] text-sm border-gray-300">
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

      {/* Month grid - 3 columns, 4 rows */}
      <div className="flex flex-col gap-2">
        {MONTH_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-2">
            {row.map((month) => (
              <button
                key={month}
                onClick={() => onMonthChange?.(month)}
                className={cn(
                  "px-2 py-2 text-xs font-medium rounded-md transition-colors",
                  selectedMonth === month
                    ? "bg-[#2D317F] text-white"
                    : "bg-[#B8C5E8] text-[#2D317F] hover:bg-[#9BAED9]"
                )}
              >
                {month}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { MONTHS, YEARS }
