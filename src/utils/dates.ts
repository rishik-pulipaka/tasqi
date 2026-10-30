import type { Period } from "../types"

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`

// Parse "YYYY-MM-DD" into a local-noon Date (safer than new Date(`${key}T12:00:00`) on Hermes)
export function parseDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d, 12)
}

export function scopeKeys(date: Date, period: Period) {
  if (period === "day") return [dayKey(date)]

  if (period === "week") {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(start)
      current.setDate(start.getDate() + index)
      return dayKey(current)
    })
  }

  const total = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Array.from({ length: total }, (_, index) =>
    dayKey(new Date(date.getFullYear(), date.getMonth(), index + 1)),
  )
}
