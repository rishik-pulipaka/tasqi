import type { Task } from "../types"
import { dayKey } from "./dates"

const API_URL = "http://LOCALIP:5000" // copy pasta whatever constant you already use for /api/route-eta

export async function fetchCanvasTasks(): Promise<Omit<Task, "id">[]> {
  const res = await fetch(`${API_URL}/api/canvas/assignments`)
  if (!res.ok) throw new Error(`Canvas sync failed (${res.status})`)
  const { assignments } = await res.json()

  return assignments.map((a: any) => {
    const due = new Date(a.due_at)
    return {
      canvasId: a.canvas_id,
      url: a.url ?? undefined,
      title: a.title,
      date: dayKey(due),
      time: due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      done: a.submitted,
    }
  })
}

export function mergeCanvasTasks(current: Task[], incoming: Omit<Task, "id">[]): Task[] {
  const byCanvasId = new Map(current.filter((t) => t.canvasId != null).map((t) => [t.canvasId, t]))
  const next = [...current]

  for (const item of incoming) {
    const existing = byCanvasId.get(item.canvasId)
    if (existing) {

      const i = next.findIndex((t) => t.id === existing.id)
      next[i] = { ...existing, title: item.title, date: item.date, time: item.time, done: existing.done || item.done }
    } else {
      next.push({ ...item, id: item.canvasId! } as Task)
    }
  }
  return next
}