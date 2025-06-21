"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Loader2, RefreshCw } from "lucide-react";

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

export default function ClientAttendanceMonitor() {  const [selectedDate, setSelectedDate] = useState(() => {
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
  
  const [students, setStudents] = useState<StudentData[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedStudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch students and attendance data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/students');
      const studentsData = await studentsResponse.json();
      
      if (!studentsData.success) {
        throw new Error('Failed to fetch students');
      }
      
      // Fetch attendance records
      const attendanceResponse = await fetch('/api/attendance/all');
      const attendanceData = await attendanceResponse.json();
      
      if (!attendanceData.success) {
        throw new Error('Failed to fetch attendance records');
      }
      
      setStudents(studentsData.data || []);
      setAttendanceRecords(attendanceData.data || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
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
  }, [students, attendanceRecords]);  // Filter data based on selected filters
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading attendance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-800">
          Attendance Monitor
        </h1>
        <Button
          onClick={fetchData}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
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
                    <span className="font-semibold">20</span>
                  </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Sessions attended per student:</span>
                    <span className="font-semibold text-blue-600">April 2055</span>
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
