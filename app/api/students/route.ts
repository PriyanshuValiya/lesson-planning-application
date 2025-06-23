import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents } from '@/app/actions/studentsApi';

export async function GET(request: NextRequest) {
  try {
    const students = await getAllStudents();
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
