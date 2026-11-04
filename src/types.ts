export type Period = "day" | "week" | "month"

export type Task = {
  id: number
  title: string
  time: string
  date: string
  done: boolean
}
