import { TaskObserver, Location } from "../models/";

// ----------------------------------------------------------------------------
// 4. TASK HIERARCHY (ABSTRACT SUBJECT & SUBCLASSES)
// ----------------------------------------------------------------------------
export abstract class Task {
  private taskId: string;
  private title: string;
  private dueDate: Date;
  private isCompleted: boolean;
  private baseRewardCoins: number;
  private observers: TaskObserver[];

  constructor(
    taskId: string,
    title: string,
    dueDate: Date,
    baseRewardCoins: number = 20
  ) {
    this.taskId = taskId;
    this.title = title;
    this.dueDate = dueDate;
    this.baseRewardCoins = baseRewardCoins;
    this.isCompleted = false;
    this.observers = [];
  }

  public getTaskId(): string {
    return this.taskId;
  }
  public getTitle(): string {
    return this.title;
  }
  public getDueDate(): Date {
    return this.dueDate;
  }
  public getIsCompleted(): boolean {
    return this.isCompleted;
  }

  public attachObserver(observer: TaskObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  public detachObserver(observer: TaskObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) this.observers.splice(index, 1);
  }

  public notifyObservers(isSuccess: boolean): void {
    for (const observer of this.observers) {
      if (isSuccess) observer.onTaskCompleted(this);
      else observer.onTaskExpired(this);
    }
  }

  public markAsCompleted(): void {
    if (!this.isCompleted) {
      this.isCompleted = true;
      this.notifyObservers(true);
    }
  }

  public isOverdue(): boolean {
    return !this.isCompleted && new Date() > this.dueDate;
  }

  public calculateRewardCoins(): number {
    return this.baseRewardCoins;
  }

  public getHealthPenalty(): number {
    return 15;
  }
}

export class MeetingEvent extends Task {
  private location: Location;
  private durationMinutes: number;
  private checkInWindowStart: Date;
  private checkInWindowEnd: Date;

  constructor(
    taskId: string,
    title: string,
    dueDate: Date,
    location: Location,
    durationMinutes: number,
    windowStart: Date,
    windowEnd: Date
  ) {
    super(taskId, title, dueDate, 50);
    this.location = location;
    this.durationMinutes = durationMinutes;
    this.checkInWindowStart = windowStart;
    this.checkInWindowEnd = windowEnd;
  }

  public checkIn(userLocation: Location): boolean {
    const now = new Date();
    const isWithinWindow =
      now >= this.checkInWindowStart && now <= this.checkInWindowEnd;
    const isAtLocation = this.location.contains(userLocation);

    if (isWithinWindow && isAtLocation) {
      this.markAsCompleted();
      return true;
    } else if (now > this.checkInWindowEnd && !this.getIsCompleted()) {
      this.notifyObservers(false);
    }
    return false;
  }

  public isUserAtLocation(userLocation: Location): boolean {
    return this.location.contains(userLocation);
  }
}

export class ToDoTask extends Task {
  private allowExtension: boolean;
  private extensionCostHealth: number;

  constructor(
    taskId: string,
    title: string,
    dueDate: Date,
    allowExtension: boolean = true,
    extensionCostHealth: number = 5
  ) {
    super(taskId, title, dueDate, 20);
    this.allowExtension = allowExtension;
    this.extensionCostHealth = extensionCostHealth;
  }

  public requestDeadlineExtension(hours: number): boolean {
    if (this.allowExtension && !this.getIsCompleted()) {
      const due = this.getDueDate();
      due.setHours(due.getHours() + hours);
      return true;
    }
    return false;
  }
}

export class JointTask extends Task {
  private participantIds: string[];
  private groupMultiplier: number;

  constructor(
    taskId: string,
    title: string,
    dueDate: Date,
    participantIds: string[],
    groupMultiplier: number = 1.5
  ) {
    super(taskId, title, dueDate, 30);
    this.participantIds = participantIds;
    this.groupMultiplier = groupMultiplier;
  }

  public override calculateRewardCoins(): number {
    return Math.floor(super.calculateRewardCoins() * this.groupMultiplier);
  }

  public verifyAllParticipantsAttended(): boolean {
    return true;
  }
}
