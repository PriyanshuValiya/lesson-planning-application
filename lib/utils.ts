import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date object or time string into a time with time zone format
 * suitable for the timetable schema
 * @param time - Date object or time string (HH:MM or HH:MM:SS format)
 * @returns Time with time zone format (e.g., "14:30:00+00")
 */
export function formatTimeWithTimeZone(time: Date | string): string {
  let timeObj: Date;

  if (typeof time === 'string') {
    // If it's already in the correct format, return it
    if (time.includes('+') || time.includes('-')) {
      return time;
    }

    // Parse time string (HH:MM or HH:MM:SS)
    const [hours, minutes, seconds = '00'] = time.split(':');
    timeObj = new Date();
    timeObj.setHours(parseInt(hours, 10));
    timeObj.setMinutes(parseInt(minutes, 10));
    timeObj.setSeconds(parseInt(seconds, 10));
  } else {
    timeObj = time;
  }

  // Format to "HH:MM:SS+00" format
  const timeString = timeObj.toTimeString().split(' ')[0];
  const tzOffset = timeObj.getTimezoneOffset();
  const tzSign = tzOffset <= 0 ? '+' : '-';
  const tzHours = Math.floor(Math.abs(tzOffset) / 60)
    .toString()
    .padStart(2, '0');
  const tzMinutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');

  return `${timeString}${tzSign}${tzHours}:${tzMinutes}`;
}

/**
 * Format time with time zone to a user-friendly format
 * @param timeWithTz - Time with time zone string (e.g., "14:30:00+00")
 * @param format - Format option: '12h' for 12-hour format, '24h' for 24-hour format
 * @returns Formatted time string (e.g., "2:30 PM" or "14:30")
 */
export function formatTimeForDisplay(
  timeWithTz: string | null,
  format: '12h' | '24h' = '12h'
): string {
  if (!timeWithTz) return '';

  // Parse the time part
  const timePart = timeWithTz.split(/[+-]/)[0];
  const [hours, minutes] = timePart.split(':').map((num) => parseInt(num, 10));

  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  } else {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
