// Mock data for attendance monitoring
export interface AttendanceRecord {
  studentId: string;
  department: string;
  attendancePercentage: number;
  status: 'Critical' | 'Warning' | 'Good';
  sessionsAttended: number;
  totalSessions: number;
}

export const attendanceRecords: AttendanceRecord[] = [
  {
    studentId: "24DCE001",
    department: "CSE",
    attendancePercentage: 64,
    status: "Critical",
    sessionsAttended: 13,
    totalSessions: 20
  },
  {
    studentId: "24DCE002", 
    department: "CE",
    attendancePercentage: 72,
    status: "Warning",
    sessionsAttended: 14,
    totalSessions: 20
  },
  {
    studentId: "24DCE003",
    department: "CSE", 
    attendancePercentage: 79,
    status: "Warning",
    sessionsAttended: 16,
    totalSessions: 20
  },
  {
    studentId: "24DCE004",
    department: "IT",
    attendancePercentage: 85,
    status: "Good",
    sessionsAttended: 17,
    totalSessions: 20
  },
  {
    studentId: "24DCE005",
    department: "CE",
    attendancePercentage: 91,
    status: "Good",
    sessionsAttended: 18,
    totalSessions: 20
  },
  {
    studentId: "24DCE006",
    department: "CSE",
    attendancePercentage: 68,
    status: "Critical",
    sessionsAttended: 14,
    totalSessions: 20
  },
  {
    studentId: "24DCE007",
    department: "IT",
    attendancePercentage: 76,
    status: "Warning",
    sessionsAttended: 15,
    totalSessions: 20
  },
  {
    studentId: "24DCE008",
    department: "CE",
    attendancePercentage: 88,
    status: "Good",
    sessionsAttended: 18,
    totalSessions: 20
  }
];

export const attendanceMetrics = {
  totalSessions: 20,
  currentMonth: "April 2025",
  overallStats: {
    excellent: 15, // >85%
    good: 25,      // 75-85%
    warning: 12,   // 65-75%
    critical: 8    // <65%
  }
};
