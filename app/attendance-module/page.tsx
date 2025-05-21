"use client";
import SubjectCard from "@/components/SubjectCard"
import { lectures } from "@/services/lectureDummyData"

const AttendanceModulePage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-800">Attendance Module</h1>
        <div className="flex items-center">
          <div className="px-4 py-2 bg-white border rounded-md shadow-sm">
            <span className="text-sm font-medium text-blue-800">Subject Teacher</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium text-blue-800 mb-2">Welcome Dr. Parth Goel</h2>
          <p className="text-gray-600">Faculty, Department of Computer Science and Engineering</p>
          <p className="text-gray-700 font-semibold uppercase mt-1">DEVANG PATEL INSTITUTE OF ADVANCE TECHNOLOGY AND RESEARCH</p>
        </div>
      </div>
      
      <div className=" flex gap-4 mt-6">
        {
          lectures.map((lecture) => (
            <div key={lecture._id} className="mb-4">
              <SubjectCard lecture={lecture} />
            </div>
          ))
        }
      </div>    </div>
  )
}

export default AttendanceModulePage;