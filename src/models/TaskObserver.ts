import { Task } from "../models/";

// ----------------------------------------------------------------------------
// 2. OBSERVER PATTERN INTERFACE & PET STATE ENUM
// ----------------------------------------------------------------------------
export enum PetState {
  HYPED = "HYPED", // 95 - 100% Health
  REGULAR = "REGULAR", // 66 - 94% Health
  SAD = "SAD", // 40 - 65% Health
  DYING = "DYING", // 1 - 39% Health
  DEAD_PASSED_OUT = "DEAD_PASSED_OUT", // 0% Health
}

export interface TaskObserver {
  onTaskCompleted(task: Task): void;
  onTaskExpired(task: Task): void;
}
