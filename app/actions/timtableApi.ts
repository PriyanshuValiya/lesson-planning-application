import { createClient } from '@/utils/supabase/server';
import { Timetable } from '@/types/types';
import { formatTimeWithTimeZone, formatTimeForDisplay } from '@/lib/utils';

export async function insertTimetable(timetable: Timetable) {
  const supabase = await createClient();
  // Format the time fields before insertion
  const formattedTimetable = prepareTimetableEntryForSave(timetable);

  const { data, error } = await supabase
    .from('timetable')
    .insert([formattedTimetable])
    .select();
  if (error) throw error;
  return data;
}

export async function updateTimetable(id: string, updates: Partial<Timetable>) {
  const supabase = await createClient();
  // Format any time fields in the updates
  const formattedUpdates = prepareTimetableEntryForSave(
    updates as TimetableWithFormatted
  );

  const { data, error } = await supabase
    .from('timetable')
    .update(formattedUpdates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
}

export async function deleteTimetable(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('timetable')
    .delete()
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
}

export async function getAllTimetables() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('timetable').select();
  if (error) throw error;
  return data;
}

export async function getTimetableById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('timetable')
    .select()
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getTimetablesByFacultyId(facultyId: string) {
  const supabase = await createClient();
  // Use join (dot notation) to fetch subject code and name in one query
  const { data, error } = await supabase
    .from('timetable')
    .select('*, subjects:subject(code, name)')
    .eq('faculty', facultyId);
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Flatten the subject fields for convenience, but do not duplicate
  const timetableWithSubjects = data.map((item: any) => {
    const { subjects, ...rest } = item;
    return {
      ...rest,
      subject_code: subjects?.code,
      subject_name: subjects?.name,
    };
  });

  return timetableWithSubjects;
}

// --- Merged from timetableAttendanceUtils.ts ---

export async function getTimetableForDateAndFaculty(
  dateStr: string,
  facultyId: string
) {
  const supabase = await createClient();
  // Get the day of week for the date (e.g., 'Monday')
  const date = new Date(dateStr);
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayOfWeek = days[date.getUTCDay()];

  // Query timetable for that day and faculty
  // Since 'from' and 'to' are now time with timezone, we don't filter by date range
  // We only filter by day of week and faculty
  const { data, error } = await supabase
    .from('timetable')
    .select()
    .eq('day', dayOfWeek)
    .eq('faculty', facultyId);
  if (error) throw error;
  return data;
}

export async function isAttendanceTaken(timetableId: string, dateStr: string) {
  const supabase = await createClient();
  // Convert dateStr to start and end of day in ISO format for timestampz comparison
  const date = new Date(dateStr);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
  const { data, error } = await supabase
    .from('attendance')
    .select('id')
    .eq('lecture', timetableId)
    .gte('Date', startOfDay)
    .lte('Date', endOfDay);
  if (error) throw error;
  return Array.isArray(data) && data.length > 0;
}

export async function getTimetableAndAttendanceStatus(
  day: string,
  facultyId: string,
  dateStr: string
) {
  const timetables = await getTimetableForDayAndFaculty(day, facultyId);
  const results = [];
  for (const timetable of timetables) {
    const taken = await isAttendanceTaken(timetable.id, dateStr);
    results.push({ ...timetable, attendanceTaken: taken });
  }
  return results;
}

// Helper to get timetable for a specific day and faculty
export async function getTimetableForDayAndFaculty(
  day: string,
  facultyId: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('timetable')
    .select()
    .eq('day', day)
    .eq('faculty', facultyId);
  if (error) throw error;
  return data;
}

/**
 * Type for a timetable entry with additional formatted fields
 */
// Extend the Timetable type with additional formatted fields
export interface TimetableWithFormatted extends Timetable {
  fromFormatted?: string;
  toFormatted?: string;
  subject_name?: string;
  faculty_name?: string;
  department_name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow for dynamic properties - necessary for flexible data handling
}

/**
 * Format timetable entry times for proper display and API handling
 * @param timetableEntry - A timetable entry with time fields
 * @returns The timetable entry with properly formatted time fields
 */
export function formatTimetableEntry(
  timetableEntry: TimetableWithFormatted
): TimetableWithFormatted {
  const result = { ...timetableEntry };

  // Format the time fields for display
  if (timetableEntry.from) {
    result.fromFormatted = formatTimeForDisplay(timetableEntry.from);
  }

  if (timetableEntry.to) {
    result.toFormatted = formatTimeForDisplay(timetableEntry.to);
  }

  return result;
}

/**
 * Format an array of timetable entries with proper time formatting
 * @param timetableEntries - Array of timetable entries
 * @returns Array with formatted entries
 */
export function formatTimetableEntries(
  timetableEntries: TimetableWithFormatted[]
): TimetableWithFormatted[] {
  if (!timetableEntries || !Array.isArray(timetableEntries)) return [];
  return timetableEntries.map((entry) => formatTimetableEntry(entry));
}

/**
 * Prepare a timetable entry for saving to the database
 * @param entry - Timetable entry with string time values
 * @returns Entry with properly formatted time fields for database storage
 */
export function prepareTimetableEntryForSave(
  entry: TimetableWithFormatted
): TimetableWithFormatted {
  const result = { ...entry };

  // Format 'from' and 'to' times if they exist
  if (entry.from && typeof entry.from === 'string') {
    result.from = formatTimeWithTimeZone(entry.from);
  }

  if (entry.to && typeof entry.to === 'string') {
    result.to = formatTimeWithTimeZone(entry.to);
  }

  return result;
}

/**
 * Get timetable entries for a specific day with nicely formatted time fields
 */
export async function getTimetableByDay(
  day: string,
  options: {
    facultyId?: string;
    departmentId?: string;
    sem?: number;
    division?: string;
  } = {}
) {
  const supabase = await createClient();

  let query = supabase
    .from('timetable')
    .select(
      `
      id, 
      day, 
      type, 
      subject, 
      faculty, 
      department, 
      "to", 
      "from", 
      division, 
      batch, 
      sem,
      location
    `
    )
    .eq('day', day);

  // Add optional filters if provided
  if (options.facultyId) {
    query = query.eq('faculty', options.facultyId);
  }

  if (options.departmentId) {
    query = query.eq('department', options.departmentId);
  }

  if (options.sem) {
    query = query.eq('sem', options.sem);
  }

  if (options.division) {
    query = query.eq('division', options.division);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Format the time fields for display
  const formattedData = formatTimetableEntries(data || []);

  return formattedData;
}
