import type { Task } from "../types"
import { dayKey } from "../utils/dates"

const shiftedDate = (amount: number) => {
  const date = new Date()
  date.setDate(date.getDate() + amount)
  return dayKey(date)
}

export const initialTasks: Task[] = [
  { id: 1, title: "Finish math problem set", time: "10:00 AM", date: shiftedDate(0), done: false },
  { id: 2, title: "Walk around the block", time: "1:30 PM", date: shiftedDate(0), done: true },
  { id: 3, title: "Review lecture notes", time: "4:00 PM", date: shiftedDate(0), done: false },
  { id: 4, title: "Submit lab report", time: "9:00 AM", date: shiftedDate(1), done: false },
  { id: 5, title: "Clean up desk", time: "6:00 PM", date: shiftedDate(-1), done: true },
]
