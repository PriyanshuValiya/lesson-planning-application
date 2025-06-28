"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

// Types for real data
interface StudentData {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  division: string;
  batch: string;
  sem: number;
  departments?: {
    name: string;
  };
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  is_present: boolean;
  Date: string;
  subject_code?: string;
  subject_name?: string;
  department_name?: string;
  student_first_name?: string;
  student_last_name?: string;
}

interface ProcessedStudentData {
  studentId: string;
  name: string;
  department: string;
  attendancePercentage: number;
  status: 'Critical' | 'Warning' | 'Good' | 'Excellent';
  sessionsAttended: number;
  totalSessions: number;
}

export default function ClientAttendanceMonitor() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric' 
    });
  });
  const [selectedIdRange, setSelectedIdRange] = useState("24CE001 to 24CE179");
  const [selectedDepartment, setSelectedDepartment] = useState("Computer Engineering");
  const [selectedSubject, setSelectedSubject] = useState("CE263 DBMS");
  const [selectedTeacher, setSelectedTeacher] = useState("Dr.Parth Goel");
  const [selectedCounselor, setSelectedCounselor] = useState("Dr.Parth Goel");
  
  // Dummy data for students
  const dummyStudents: StudentData[] = [
    {
      student_id: "24CE001",
      first_name: "Aarav",
      last_name: "Patel",
      email: "aarav.patel@example.com",
      division: "A",
      batch: "A1",
      sem: 5,
      departments: { name: "Computer Engineering" }
    },
    {
      student_id: "24CE002",
      first_name: "Priya",
      last_name: "Shah",
      email: "priya.shah@example.com",
      division: "A",
      batch: "A1",
      sem: 5,
      departments: { name: "Computer Engineering" }
    },
    {
      student_id: "24CE003",
      first_name: "Rohan",
      last_name: "Mehta",
      email: "rohan.mehta@example.com",
      division: "A",
      batch: "A2",
      sem: 5,
      departments: { name: "Computer Engineering" }
    },
    {
      student_id: "24CE004",
      first_name: "Kavya",
      last_name: "Desai",
      email: "kavya.desai@example.com",
      division: "B",
      batch: "B1",
      sem: 5,
      departments: { name: "Computer Engineering" }
    },
    {
      student_id: "24CE005",
      first_name: "Arjun",
      last_name: "Joshi",
      email: "arjun.joshi@example.com",
      division: "B",
      batch: "B1",
      sem: 5,
      departments: { name: "Computer Engineering" }
    },
    {
      student_id: "24CE006",
      first_name: "Ananya",
      last_name: "Gupta",
      email: "ananya.gupta@example.com",
      division: "B",
      batch: "B2",
      sem: 5,
      departments: { name: "Computer Engineering" }
    },
    {
      student_id: "24CE007",
      first_name: "Karan",
      last_name: "Singh",
      email: "karan.singh@example.com",
      division: "C",
      batch: "C1",
      sem: 5,
      departments: { name: "Computer Engineering" }
    },
    {
      student_id: "24CE008",
      first_name: "Shruti",
      last_name: "Agarwal",
      email: "shruti.agarwal@example.com",
      division: "C",
      batch: "C1",
      sem: 5,
      departments: { name: "Computer Engineering" }
    }
  ];

  // Dummy attendance records
  const dummyAttendanceRecords: AttendanceRecord[] = [
    // High attendance student (24CE001)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-001-${i}`,
      student_id: "24CE001",
      is_present: i < 16, // 16/18 = 88.8%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    })),
    // Good attendance student (24CE002)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-002-${i}`,
      student_id: "24CE002",
      is_present: i < 14, // 14/18 = 77.7%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    })),
    // Warning attendance student (24CE003)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-003-${i}`,
      student_id: "24CE003",
      is_present: i < 12, // 12/18 = 66.6%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    })),
    // Critical attendance student (24CE004)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-004-${i}`,
      student_id: "24CE004",
      is_present: i < 10, // 10/18 = 55.5%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    })),
    // Excellent attendance student (24CE005)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-005-${i}`,
      student_id: "24CE005",
      is_present: i < 17, // 17/18 = 94.4%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    })),
    // Good attendance student (24CE006)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-006-${i}`,
      student_id: "24CE006",
      is_present: i < 15, // 15/18 = 83.3%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    })),
    // Warning attendance student (24CE007)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-007-${i}`,
      student_id: "24CE007",
      is_present: i < 13, // 13/18 = 72.2%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    })),
    // Critical attendance student (24CE008)
    ...Array.from({ length: 18 }, (_, i) => ({
      id: `att-008-${i}`,
      student_id: "24CE008",
      is_present: i < 9, // 9/18 = 50%
      Date: `2024-06-${10 + i}`,
      subject_code: "CE263",
      subject_name: "DBMS"
    }))
  ];
  const [students] = useState<StudentData[]>(dummyStudents);
  const [attendanceRecords] = useState<AttendanceRecord[]>(dummyAttendanceRecords);
  const [processedData, setProcessedData] = useState<ProcessedStudentData[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Process data whenever students or attendance records change
  useEffect(() => {
    if (students.length === 0) return;

    const processStudentData = () => {
      const processed: ProcessedStudentData[] = students
        .filter(student => student.student_id != null && student.student_id.trim() !== '') // Filter out undefined/empty student IDs
        .map(student => {
          // Filter attendance records for this student
          const studentAttendance = attendanceRecords.filter(
            record => record.student_id === student.student_id
          );
          
          const totalSessions = studentAttendance.length;
          const sessionsAttended = studentAttendance.filter(
            record => record.is_present
          ).length;
          
          const attendancePercentage = totalSessions > 0 
            ? Math.round((sessionsAttended / totalSessions) * 100)
            : 0;
          
          // Determine status based on percentage
          let status: 'Critical' | 'Warning' | 'Good' | 'Excellent';
          if (attendancePercentage >= 85) status = 'Excellent';
          else if (attendancePercentage >= 75) status = 'Good';
          else if (attendancePercentage >= 65) status = 'Warning';
          else status = 'Critical';
          
          return {
            studentId: student.student_id,
            name: `${student.first_name} ${student.last_name}`,
            department: student.departments?.name || 'Unknown',
            attendancePercentage,
            status,
            sessionsAttended,
            totalSessions
          };
        });
      
      setProcessedData(processed);
    };

    processStudentData();
  }, [students, attendanceRecords]);// Filter data based on selected filters
  const filteredData = processedData.filter(student => {
    // Only include students with valid student IDs
    if (!student.studentId || student.studentId.trim() === '') {
      return false;
    }
    
    const studentData = students.find(s => s.student_id === student.studentId);
    
    if (selectedDepartment !== "All Departments" && student.department !== selectedDepartment) {
      return false;
    }
    
    // Add more specific filtering logic based on the selected filters if needed
    
    return true;
  });

  // Calculate metrics
  const attendanceMetrics = {
    totalSessions: processedData.reduce((sum, student) => sum + student.totalSessions, 0) / Math.max(processedData.length, 1),
    overallStats: {
      excellent: filteredData.filter(s => s.status === 'Excellent').length,
      good: filteredData.filter(s => s.status === 'Good').length,
      warning: filteredData.filter(s => s.status === 'Warning').length,
      critical: filteredData.filter(s => s.status === 'Critical').length,
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "text-red-500";
      case "Warning":
        return "text-orange-500";
      case "Good":
        return "text-blue-500";
      case "Excellent":
        return "text-green-500";
      default:
        return "text-green-500";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-red-500";
      case "Warning":
        return "bg-orange-500";
      case "Good":
        return "bg-blue-500";
      case "Excellent":
        return "bg-green-500";
      default:
        return "bg-green-500";
    }
  };  // Get unique departments for filter (only from students with valid IDs)
  const departments = Array.from(new Set(
    students
      .filter(s => s.student_id != null && s.student_id.trim() !== '')
      .map(s => s.departments?.name)
      .filter(Boolean)
  )) as string[];

  return (
    <div className="p-6">      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-800">
          Attendance Monitor
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing dummy data for demonstration</span>
        </div>
      </div>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">        {/* Left Panel - Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-800">
                Filters for Attendance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">              {/* Day-wise Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Day-wise</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-3 pr-10"
                    placeholder="DD/MM/YYYY"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* ID-wise Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">ID-wise</label>
                <Select value={selectedIdRange} onValueChange={setSelectedIdRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24CE001 to 24CE179">24CE001 to 24CE179</SelectItem>
                    <SelectItem value="24CSE001 to 24CSE160">24CSE001 to 24CSE160</SelectItem>
                    <SelectItem value="24IT001 to 24IT120">24IT001 to 24IT120</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Wise */}
              <div>
                <label className="block text-sm font-medium mb-2">Department Wise</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                    <SelectItem value="CSE">Computer Science and Engineering</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="CE">Civil Engineering</SelectItem>
                    <SelectItem value="ME">Mechanical Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Wise */}
              <div>
                <label className="block text-sm font-medium mb-2">Subject Wise</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CE263 DBMS">CE263 DBMS</SelectItem>
                    <SelectItem value="CE264 OS">CE264 Operating Systems</SelectItem>
                    <SelectItem value="CE265 CN">CE265 Computer Networks</SelectItem>
                    <SelectItem value="CE266 SE">CE266 Software Engineering</SelectItem>
                    <SelectItem value="CE267 TOC">CE267 Theory of Computation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Teacher Wise */}
              <div>
                <label className="block text-sm font-medium mb-2">Subject Teacher Wise</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr.Parth Goel">Dr.Parth Goel</SelectItem>
                    <SelectItem value="Dr.Rashmi Thakkar">Dr.Rashmi Thakkar</SelectItem>
                    <SelectItem value="Prof.Amit Patel">Prof.Amit Patel</SelectItem>
                    <SelectItem value="Dr.Snehal Shah">Dr.Snehal Shah</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Counselor Wise */}
              <div>
                <label className="block text-sm font-medium mb-2">Counselor Wise</label>
                <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select counselor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr.Parth Goel">Dr.Parth Goel</SelectItem>
                    <SelectItem value="Dr.Rashmi Thakkar">Dr.Rashmi Thakkar</SelectItem>
                    <SelectItem value="Prof.Amit Patel">Prof.Amit Patel</SelectItem>
                    <SelectItem value="Dr.Snehal Shah">Dr.Snehal Shah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Attendance Metrics and Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-800">
                Attendance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sessions Info */}
                <div className="space-y-4">                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Total sessions conducted:</span>
                    <span className="font-semibold">18</span>
                  </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Average attendance:</span>
                    <span className="font-semibold text-blue-600">
                      {Math.round(filteredData.reduce((sum, student) => sum + student.attendancePercentage, 0) / Math.max(filteredData.length, 1))}%
                    </span>
                  </div>
                </div>                {/* Overall Statistics */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm mb-3">Overall Attendance:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>&gt;85%</span>
                      </div>
                      <span className="font-semibold">{attendanceMetrics.overallStats.excellent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>75-85%</span>
                      </div>
                      <span className="font-semibold">{attendanceMetrics.overallStats.good}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>&lt;75%</span>
                      </div>
                      <span className="font-semibold">{attendanceMetrics.overallStats.warning + attendanceMetrics.overallStats.critical}</span>
                    </div>
                  </div>
                </div>              </div>
            </CardContent>
          </Card>{/* Student Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-blue-800">
                  Student Attendance Data
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredData.length}</span> of{" "}
                  <span className="font-semibold">{processedData.length}</span> students
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium">Student ID</th>
                      <th className="text-left p-3 font-medium">Department</th>
                      <th className="text-left p-3 font-medium">Attendance % Alert Status</th>
                    </tr>
                  </thead>                  <tbody>
                    {filteredData.map((student, index) => (
                      <tr key={student.studentId} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{student.studentId}</td>
                        <td className="p-3">{student.department}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusDot(student.status)}`}></div>
                            <span className={`font-semibold ${getStatusColor(student.status)}`}>
                              {student.attendancePercentage}%
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              student.status === 'Critical' ? 'bg-red-100 text-red-700' :
                              student.status === 'Warning' ? 'bg-orange-100 text-orange-700' :
                              student.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {student.status}
                            </span>
                            <span className="text-gray-500 text-xs ml-2">
                              ({student.sessionsAttended}/{student.totalSessions})
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">
                          No student data available with the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
