import { MeetingEvent, Task, TaskObserver } from "../models/";

export class NotificationManager implements TaskObserver {
  private pushToken: string;

  constructor(pushToken: string) {
    this.pushToken = pushToken;
  }

  public scheduleTaskReminder(task: Task): void {}
  public sendTimeToLeaveAlert(event: MeetingEvent): void {}
  public cancelNotification(taskId: string): void {}

  public onTaskCompleted(task: Task): void {
    this.cancelNotification(task.getTaskId());
  }

  public onTaskExpired(task: Task): void {}
}
