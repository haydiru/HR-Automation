import { createClient } from "@/lib/supabase/server";

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
  location?: string;
  attendees?: { email: string; name?: string }[];
}

/**
 * Creates a Google Calendar event for an interview schedule.
 */
export async function createGoogleCalendarEvent(
  userId: string,
  eventData: CalendarEventPayload
) {
  const supabase = await createClient();

  // 1. Get user's Google Calendar token
  const { data: tokenData } = await supabase
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_type", "calendar")
    .maybeSingle();

  if (!tokenData || !tokenData.access_token) {
    console.warn(`[Google Calendar] User ${userId} has not connected Google Calendar.`);
    return null;
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: eventData.summary,
          description: eventData.description,
          start: { dateTime: eventData.startDateTime, timeZone: "Asia/Jakarta" },
          end: { dateTime: eventData.endDateTime, timeZone: "Asia/Jakarta" },
          location: eventData.location || "",
          attendees: eventData.attendees || [],
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 24 * 60 },
              { method: "popup", minutes: 30 },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Google Calendar Error]", errText);
      return null;
    }

    const createdEvent = await response.json();
    return createdEvent.id as string;
  } catch (err: any) {
    console.error("[Google Calendar Exception]", err.message);
    return null;
  }
}

/**
 * Updates an existing Google Calendar event.
 */
export async function updateGoogleCalendarEvent(
  userId: string,
  eventId: string,
  eventData: Partial<CalendarEventPayload>
) {
  const supabase = await createClient();

  const { data: tokenData } = await supabase
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_type", "calendar")
    .maybeSingle();

  if (!tokenData || !tokenData.access_token) return false;

  try {
    const updateBody: any = {};
    if (eventData.summary) updateBody.summary = eventData.summary;
    if (eventData.description) updateBody.description = eventData.description;
    if (eventData.startDateTime) updateBody.start = { dateTime: eventData.startDateTime, timeZone: "Asia/Jakarta" };
    if (eventData.endDateTime) updateBody.end = { dateTime: eventData.endDateTime, timeZone: "Asia/Jakarta" };
    if (eventData.location) updateBody.location = eventData.location;

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      }
    );

    return response.ok;
  } catch (err: any) {
    console.error("[Google Calendar Update Exception]", err.message);
    return false;
  }
}

/**
 * Deletes a Google Calendar event.
 */
export async function deleteGoogleCalendarEvent(userId: string, eventId: string) {
  const supabase = await createClient();

  const { data: tokenData } = await supabase
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_type", "calendar")
    .maybeSingle();

  if (!tokenData || !tokenData.access_token) return false;

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    return response.ok;
  } catch (err: any) {
    console.error("[Google Calendar Delete Exception]", err.message);
    return false;
  }
}
