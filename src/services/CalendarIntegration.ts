import { Task } from "../models/";

export class CalendarIntegration {
  private calendarId: string;
  private isAuthorized: boolean;

  constructor(calendarId: string) {
    this.calendarId = calendarId;
    this.isAuthorized = false;
  }

  public syncWithExternalCalendar(): Task[] {
    return [];
  }
}
