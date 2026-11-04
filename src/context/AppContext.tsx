import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import { initialTasks } from "../data/initialTasks"
import type { Task } from "../types"

type AppState = {
  tasks: Task[]
  setTasks: Dispatch<SetStateAction<Task[]>>
  username: string | null
  login: (name: string) => void
  logout: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [username, setUsername] = useState<string | null>(null)

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        username,
        login: setUsername,
        logout: () => setUsername(null),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside AppProvider")
  return ctx
}
