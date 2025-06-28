import { createClient } from '@/utils/supabase/server';
import { Student_data } from '@/types/types';

export async function insertStudent(student: Student_data) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .insert([student])
    .select();
  if (error) throw error;
  return data;
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Student_data>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .update(updates)
    .eq('student_id', studentId)
    .select();
  if (error) throw error;
  return data;
}

export async function deleteStudent(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .delete()
    .eq('student_id', studentId)
    .select();
  if (error) throw error;
  return data;
}

export async function getAllStudents() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('student_data').select();
  if (error) throw error;
  return data;
}

export async function getStudentById(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('student_id', studentId)
    .single();
  if (error) throw error;
  return data;
}

export async function getStudentByRollNo(rollNo: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Roll_No', rollNo)
    .single();
  if (error) throw error;
  return data;
}

// Get all students by semester
export async function getStudentsBySem(sem: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Sem', sem);
  if (error) throw error;
  return data;
}

// Get all students by division and semester
export async function getStudentsByDivisionAndSem(
  division: number,
  sem: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Division', division)
    .eq('Sem', sem);
  if (error) throw error;
  return data;
}

// Get all students by division, batch, and semester
export async function getStudentsByDivisionBatchAndSem(
  division: number,
  batch: string,
  sem: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Division', division)
    .eq('Batch', batch)
    .eq('Sem', sem);
  if (error) throw error;
  return data;
}

// Get students by department
export async function getStudentsByDepartment(department: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Department', department);
  if (error) throw error;
  return data;
}

// Get students by counsellor
export async function getStudentsByCounsellor(counsellor: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Counsellor', counsellor);
  if (error) throw error;
  return data;
}

// Get students by Roll_No range (lexicographical comparison)
export async function getStudentsByRollNoRange(start: string, end: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .gte('Roll_No', start)
    .lte('Roll_No', end);
  if (error) throw error;
  return data;
}

// Get students by department and semester
export async function getStudentsByDepartmentAndSem(
  department: string,
  sem: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Department', department)
    .eq('Sem', sem);
  if (error) throw error;
  return data;
}

// Get students by department, semester and batch
export async function getStudentsByDepartmentSemAndBatch(
  department: string,
  sem: number,
  batch: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Department', department)
    .eq('Sem', sem)
    .eq('Batch', batch);
  if (error) throw error;
  return data;
}

// Get students by division, batch, department, and semester
export async function getStudentsByDivisionBatchDeptAndSem(
  division: number,
  batch: string,
  department: string,
  sem: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Division', division)
    .eq('Batch', batch)
    .eq('Department', department)
    .eq('Sem', sem);
  if (error) throw error;
  return data;
}

// Get students by department and division
export async function getStudentsByDepartmentAndDivision(
  department: string,
  division: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Department', department)
    .eq('Division', division);
  if (error) throw error;
  return data;
}

// THIS FUNCTION WAS REMOVED - Use getStudentsByDivisionBatchDeptAndSem with a null/empty batch parameter
// The functionality is covered by the more general getStudentsByDivisionBatchDeptAndSem function

// Get students by department and batch
export async function getStudentsByDepartmentAndBatch(
  department: string,
  batch: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_data')
    .select()
    .eq('Department', department)
    .eq('Batch', batch);
  if (error) throw error;
  return data;
}

// Get student attendance average (JavaScript-based calculation)
export async function getStudentAttendanceAverage(student_id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('attendance')
    .select('is_present')
    .eq('student_id', student_id);

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      student_id,
      totalClasses: 0,
      presentClasses: 0,
      absentClasses: 0,
      attendancePercentage: 0,
    };
  }

  const totalClasses = data.length;
  const presentClasses = data.filter((record) => record.is_present).length;
  const absentClasses = totalClasses - presentClasses;
  const attendancePercentage =
    totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  return {
    student_id,
    totalClasses,
    presentClasses,
    absentClasses,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100, // Round to 2 decimal places
  };
}

// Get student attendance average per subject (JavaScript-based calculation)
export async function getStudentAttendanceAveragePerSubject(
  student_id: string
) {
  const supabase = await createClient();

  // Get attendance data with related timetable and subject information
  const { data, error } = await supabase
    .from('attendance')
    .select(
      `
      is_present,
      lecture,
      timetable:lecture (
        subject,
        subjects:subject (
          id,
          name,
          code
        )
      )
    `
    )
    .eq('student_id', student_id);

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      student_id,
      subjects: [],
      overallAttendance: {
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        attendancePercentage: 0,
      },
    };
  }

  // Group attendance by subject
  interface SubjectStats {
    present: number;
    total: number;
    subjectInfo: {
      id: string;
      name: string;
      code: string;
    };
  }

  const subjectAttendance: { [key: string]: SubjectStats } = {};

  data.forEach((record) => {
    // Handle the nested structure safely
    if (
      record.timetable &&
      Array.isArray(record.timetable) &&
      record.timetable[0]?.subjects
    ) {
      const timetableData = record.timetable[0];
      const subjectArray = timetableData.subjects;

      // Handle case where subjects might be an array
      const subject = Array.isArray(subjectArray)
        ? subjectArray[0]
        : subjectArray;

      if (subject && subject.id) {
        const subjectKey = subject.id;

        if (!subjectAttendance[subjectKey]) {
          subjectAttendance[subjectKey] = {
            present: 0,
            total: 0,
            subjectInfo: {
              id: subject.id,
              name: subject.name,
              code: subject.code,
            },
          };
        }

        subjectAttendance[subjectKey].total++;
        if (record.is_present) {
          subjectAttendance[subjectKey].present++;
        }
      }
    }
  });

  // Calculate percentages for each subject
  const subjects = Object.entries(subjectAttendance).map(
    ([subjectId, stats]) => ({
      subjectId,
      subjectName: stats.subjectInfo.name,
      subjectCode: stats.subjectInfo.code,
      totalClasses: stats.total,
      presentClasses: stats.present,
      absentClasses: stats.total - stats.present,
      attendancePercentage:
        stats.total > 0
          ? Math.round((stats.present / stats.total) * 10000) / 100
          : 0,
    })
  );

  // Calculate overall attendance
  const totalClasses = data.length;
  const presentClasses = data.filter((record) => record.is_present).length;
  const absentClasses = totalClasses - presentClasses;
  const overallPercentage =
    totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  return {
    student_id,
    subjects,
    overallAttendance: {
      totalClasses,
      presentClasses,
      absentClasses,
      attendancePercentage: Math.round(overallPercentage * 100) / 100,
    },
  };
}
