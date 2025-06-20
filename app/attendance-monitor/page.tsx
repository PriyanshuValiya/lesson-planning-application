"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

import { attendanceRecords, attendanceMetrics } from "@/services/attendanceData";

// Mock data for the attendance monitoring
const attendanceData = attendanceRecords;

const AttendanceMonitorPage = () => {
  const [selectedDate, setSelectedDate] = useState("04/10/2025");
  const [selectedIdRange, setSelectedIdRange] = useState("24CE001 to 24CE179");
  const [selectedDepartment, setSelectedDepartment] = useState("Computer Engineering");
  const [selectedSubject, setSelectedSubject] = useState("CE263 DBMS");
  const [selectedTeacher, setSelectedTeacher] = useState("Dr.Parth Goel");
  const [selectedCounselor, setSelectedCounselor] = useState("Dr.Parth Goel");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "text-red-500";
      case "Warning":
        return "text-orange-500";
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
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-800">Attendance Monitor</h1>
        <div className="flex items-center">
          <div className="px-4 py-2 bg-white border rounded-md shadow-sm">
            <span className="text-sm font-medium text-blue-800">
              Subject Teacher
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Section */}
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Filters for Attendance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Day-wise Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day-wise
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>

              {/* ID-wise Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID-wise
                </label>
                <Select value={selectedIdRange} onValueChange={setSelectedIdRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24CE001 to 24CE179">24CE001 to 24CE179</SelectItem>
                    <SelectItem value="24CSE001 to 24CSE120">24CSE001 to 24CSE120</SelectItem>
                    <SelectItem value="24IT001 to 24IT060">24IT001 to 24IT060</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Wise Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Wise
                </label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Wise Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Wise
                </label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CE263 DBMS">CE263 DBMS</SelectItem>
                    <SelectItem value="CE264 OS">CE264 OS</SelectItem>
                    <SelectItem value="CE265 CN">CE265 CN</SelectItem>
                    <SelectItem value="CE266 SE">CE266 SE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Teacher Wise Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Teacher Wise
                </label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr.Parth Goel">Dr.Parth Goel</SelectItem>
                    <SelectItem value="Dr.Amit Shah">Dr.Amit Shah</SelectItem>
                    <SelectItem value="Dr.Priya Patel">Dr.Priya Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Counselor Wise Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Counselor Wise
                </label>
                <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr.Parth Goel">Dr.Parth Goel</SelectItem>
                    <SelectItem value="Dr.Amit Shah">Dr.Amit Shah</SelectItem>
                    <SelectItem value="Dr.Priya Patel">Dr.Priya Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Metrics and Data Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Metrics Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Attendance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                {/* Total Sessions */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm text-gray-600 mb-1">Total sessions conducted</h3>
                  <p className="text-3xl font-bold text-gray-800">{attendanceMetrics.totalSessions}</p>
                </div>

                {/* Sessions Attended */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm text-gray-600 mb-1">Sessions attended per student</h3>
                  <p className="text-lg font-semibold text-gray-500">{attendanceMetrics.currentMonth}</p>
                </div>
              </div>

              {/* Overall Attendance Percentage */}
              <div className="mt-6">
                <h3 className="text-sm text-gray-600 mb-3">Overall attendance percentage</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">&gt;85%</span>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Critical</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Warning</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">75-85%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">&lt;75%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Attendance Table */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Student ID
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Department
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                        Attendance % Alert Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((student, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {student.studentId}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {student.department}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              {student.attendancePercentage}%
                            </span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusDot(student.status)}`}></div>
                              <span className={`text-sm ${getStatusColor(student.status)}`}>
                                {student.status}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMonitorPage;
