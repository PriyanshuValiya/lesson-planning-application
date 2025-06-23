import { NextRequest, NextResponse } from 'next/server';
import { getStudentAttendanceAverage } from '@/app/actions/studentsApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const average = await getStudentAttendanceAverage(studentId);
    return NextResponse.json({ success: true, data: average });
  } catch (error) {
    console.error('Error fetching student attendance average:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance average' },
      { status: 500 }
    );
  }
}
