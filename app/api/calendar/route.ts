/**
 * app/api/calendar/route.ts
 *
 * Fetches the user's next 5 Google Calendar events (within 24 hours).
 * Called with the user's OAuth access token in the Authorization header.
 *
 * GET /api/calendar
 * Authorization: Bearer <access_token>
 *
 * Response: { events: CalendarEvent[] }
 */

import { NextRequest, NextResponse } from "next/server";

export interface CalendarEvent {
  id:          string;
  title:       string;
  startTime:   string; // ISO 8601
  endTime:     string;
  description: string;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const now     = new Date();
  const in24h   = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin",      now.toISOString());
  url.searchParams.set("timeMax",      in24h.toISOString());
  url.searchParams.set("maxResults",   "5");
  url.searchParams.set("orderBy",      "startTime");
  url.searchParams.set("singleEvents", "true");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const body = await res.json();
      console.error("[Calendar API error]", body);
      return NextResponse.json({ error: "Calendar API error" }, { status: 502 });
    }

    const data = await res.json();

    const events: CalendarEvent[] = (data.items ?? []).map((item: any) => ({
      id:          item.id,
      title:       item.summary ?? "Untitled event",
      startTime:   item.start?.dateTime ?? item.start?.date ?? "",
      endTime:     item.end?.dateTime   ?? item.end?.date   ?? "",
      description: item.description ?? "",
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[Calendar fetch failed]", err);
    return NextResponse.json({ error: "Failed to reach Calendar API" }, { status: 502 });
  }
}
