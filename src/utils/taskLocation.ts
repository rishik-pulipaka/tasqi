import AsyncStorage from "@react-native-async-storage/async-storage";
 
export type TaskLocation = { lat: number; lng: number }
 
const KEY = "pending_task_location"
 
export const savePendingLocation = (loc: TaskLocation) => AsyncStorage.setItem(KEY, JSON.stringify(loc))
 
export async function takePendingLocation(): Promise<TaskLocation | null> {
  const raw = await AsyncStorage.getItem(KEY)
  if (!raw) return null
  await AsyncStorage.removeItem(KEY) // dekete it so a stale pin can't attach to a later task
  try {
    return JSON.parse(raw) as TaskLocation
  } catch {
    return null
  }
}