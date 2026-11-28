import { Pet, Task, Item, Location, MeetingEvent } from "../models/";

// ----------------------------------------------------------------------------
// 6. USER MODEL & SERVICES
// ----------------------------------------------------------------------------
export class User {
  private userId: string;
  private username: string;
  private email: string;
  private currentStreak: number;
  private currentLocation: Location;
  private pet: Pet;
  private tasks: Task[];
  private inventory: Item[];
  private friends: User[];

  constructor(
    userId: string,
    username: string,
    email: string,
    pet: Pet,
    location: Location
  ) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.pet = pet;
    this.currentLocation = location;
    this.currentStreak = 0;
    this.tasks = [];
    this.inventory = [];
    this.friends = [];
  }

  public getUserId(): string {
    return this.userId;
  }
  public getUsername(): string {
    return this.username;
  }
  public getEmail(): string {
    return this.email;
  }
  public getPet(): Pet {
    return this.pet;
  }
  public getCurrentLocation(): Location {
    return this.currentLocation;
  }
  public setLocation(loc: Location): void {
    this.currentLocation = loc;
  }

  public addTask(task: Task): void {
    task.attachObserver(this.pet);
    this.tasks.push(task);
  }

  public removeTask(taskId: string): boolean {
    const index = this.tasks.findIndex((t) => t.getTaskId() === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  public getPendingTasks(): Task[] {
    return this.tasks.filter((t) => !t.getIsCompleted());
  }

  public addItemToInventory(item: Item): void {
    this.inventory.push(item);
  }

  public addFriend(friend: User): void {
    if (!this.friends.includes(friend)) {
      this.friends.push(friend);
    }
  }

  public checkInToMeeting(eventId: string): boolean {
    const task = this.tasks.find((t) => t.getTaskId() === eventId);
    if (task instanceof MeetingEvent) {
      return task.checkIn(this.currentLocation);
    }
    return false;
  }
}
