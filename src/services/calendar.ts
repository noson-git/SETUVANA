/**
 * SETUVANA - Google Calendar Integration Service
 * Uses Google Calendar REST API with OAuth Access Token
 * Also provides offline .ics calendar file export for zero-connectivity situations.
 */

import { Booking } from '../types';

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
}

export async function addBookingToGoogleCalendar(
  booking: Booking,
  accessToken: string
): Promise<CalendarEventResult> {
  try {
    const eventBody = {
      summary: `SETUVANA Stay: ${booking.propertyName}`,
      description: [
        `Booking Ref: ${booking.reference}`,
        `Homestay: ${booking.propertyName} (${booking.propertyVillage}, ${booking.propertyDistrict})`,
        `Host: ${booking.hostName} (Ph: ${booking.hostPhone})`,
        `Guests: ${booking.guestsCount} | Room: ${booking.roomName}`,
        `Estimated Arrival: ${booking.estimatedArrivalTime}`,
        `Total (Pay at Homestay): ₹${booking.totalAmount}`,
        `SETUVANA - Every Village Connected to Opportunity`,
      ].join('\n'),
      location: `${booking.propertyVillage}, ${booking.propertyDistrict}, Odisha, India`,
      start: {
        date: booking.checkInDate,
      },
      end: {
        date: booking.checkOutDate,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 3 * 60 },  // 3 hours before
        ],
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink,
    };
  } catch (error: any) {
    console.error('Error adding to Google Calendar:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync with Google Calendar',
    };
  }
}

/**
 * Generates an RFC 5545 iCalendar (.ics) string for offline calendar import.
 * Works even when completely disconnected from the internet!
 */
export function generateICSFile(booking: Booking): string {
  const startDateStr = booking.checkInDate.replace(/-/g, '');
  const endDateStr = booking.checkOutDate.replace(/-/g, '');
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SETUVANA//Odisha Rural Tourism//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.reference}@setuvana.rural.odisha`,
    `DTSTAMP:${nowStr}`,
    `DTSTART;VALUE=DATE:${startDateStr}`,
    `DTEND;VALUE=DATE:${endDateStr}`,
    `SUMMARY:SETUVANA: ${booking.propertyName}`,
    `DESCRIPTION:Stay at ${booking.propertyName} in ${booking.propertyVillage}. Host: ${booking.hostName} (${booking.hostPhone}). Reference: ${booking.reference}.`,
    `LOCATION:${booking.propertyVillage}\\, ${booking.propertyDistrict}\\, Odisha`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICSFile(booking: Booking): void {
  const icsContent = generateICSFile(booking);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SETUVANA_Booking_${booking.reference}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
