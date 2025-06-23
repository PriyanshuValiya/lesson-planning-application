import { NextRequest, NextResponse } from 'next/server';
import { insertAttendance } from '@/app/actions/AttendanceApi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attendanceRecords } = body;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { error: 'Invalid attendance records' },
        { status: 400 }
      );
    }

    // Validate each record
    for (const record of attendanceRecords) {
      if (!record.student_id || !record.lecture) {
        return NextResponse.json(
          { error: 'Missing required fields: student_id and lecture are required' },
          { status: 400 }
        );
      }
    }

    // Insert all attendance records
    const results = [];
    const errors = [];
    
    for (const record of attendanceRecords) {
      try {
        const result = await insertAttendance(record);
        results.push(result);
      } catch (error) {
        console.error('Error inserting record:', error);
        errors.push({
          student_id: record.student_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some records failed to save',
          details: errors,
          successful: results.length,
          failed: errors.length
        },
        { status: 207 } // Multi-status
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Attendance saved for ${results.length} students`,
        data: results 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save attendance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
