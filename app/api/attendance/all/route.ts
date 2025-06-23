import { NextRequest, NextResponse } from 'next/server';
import { getAllAttendance } from '@/app/actions/AttendanceApi';

export async function GET(request: NextRequest) {
  try {
    const attendance = await getAllAttendance();
    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}
