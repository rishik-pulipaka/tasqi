import * as Calendar from "expo-calendar";

export type CalendarEventItem = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  calendarTitle: string;
};

export async function requestCalendarAccess(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

export async function hasCalendarAccess(): Promise<boolean> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  return status === "granted";
}

export async function fetchCalendarEvents(
  start: Date,
  end: Date,
): Promise<CalendarEventItem[]> {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  );
  if (!calendars.length) return [];

  const events = await Calendar.getEventsAsync(
    calendars.map((c) => c.id),
    start,
    end,
  );
  const titleById = new Map(calendars.map((c) => [c.id, c.title]));

  return events
    .map((e) => ({
      id: e.id,
      title: e.title ?? "(untitled event)",
      start: new Date(e.startDate),
      end: new Date(e.endDate),
      allDay: !!e.allDay,
      calendarTitle: titleById.get(e.calendarId) ?? "",
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function createCalendarEvent(input: {
  title: string;
  start: Date;
  end: Date;
}): Promise<string | null> {
  try {
    if (!(await hasCalendarAccess())) return null;
    const cal = await Calendar.getDefaultCalendarAsync();
    if (!cal) return null;
    return await Calendar.createEventAsync(cal.id, {
      title: input.title,
      startDate: input.start,
      endDate: input.end,
    });
  } catch {
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch {
    // Already gone or no access; deleting the task still stands.
  }
}
