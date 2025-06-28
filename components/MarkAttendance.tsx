"use client";

import { useState } from "react";
import Image from "next/image";
import { students } from "@/services/studentDummyData";
import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";
import { DummyLecture } from "@/services/dummyTypes";
import { toast } from "sonner";

const MarkAttendance = ({ lecture }: { lecture: any }) => {
  const [attendanceData, setAttendanceData] = useState(
    students.map(student => ({ ...student, present: true }))
  );
  const [isSaving, setIsSaving] = useState(false);
  
  // Calculate if all students are selected
  const allSelected = attendanceData.length > 0 && attendanceData.every(student => student.present);
  const someSelected = attendanceData.some(student => student.present);
  
  const toggleAttendance = (studentId: number) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, present: !student.present }
          : student
      )
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      // If all are selected, unselect all
      setAttendanceData(prev => 
        prev.map(student => ({ ...student, present: false }))
      );
    } else {
      // If not all are selected, select all
      setAttendanceData(prev => 
        prev.map(student => ({ ...student, present: true }))
      );
    }
  };const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Lecture data structure:", lecture);
      
      // Get IDs of present students
      const presentStudentIds = attendanceData
        .filter(student => student.present)
        .map(student => student.id);

      console.log("Present student IDs:", presentStudentIds);// Prepare attendance records for API call
      const currentDate = new Date().toISOString(); // Full ISO string for timestamp
      
      const attendanceRecords = presentStudentIds.map(studentId => ({
        lecture: lecture.id || lecture._id, // Use the timetable ID as the lecture reference
        student: studentId, // This field might be legacy, keeping for compatibility
        is_present: true,
        Date: currentDate,
        student_id: studentId, // The actual student ID for the foreign key
        faculty_id: lecture.faculty || 'unknown' // Use the actual faculty ID from timetable
      }));

      // Call the API route
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceRecords }),
      });      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save attendance');
      }

      const result = await response.json();
      toast.success(`Attendance saved successfully for ${presentStudentIds.length} students`);
      console.log("Attendance saved for students:", presentStudentIds);
      console.log("API response:", result);    } catch (error) {
      console.error("Error saving attendance:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      toast.error(`Failed to save attendance: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="w-full overflow-x-auto">
      {/* Select All Controls */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={toggleSelectAll}
          className={`
            px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm
            flex items-center gap-2 hover:shadow-md
            ${allSelected 
              ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
              : someSelected 
                ? 'bg-blue-50 border-blue-600 text-blue-600 hover:bg-blue-100'
                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <div
            className={`
              w-4 h-4 border-2 rounded flex items-center justify-center
              ${allSelected 
                ? 'bg-white border-white' 
                : someSelected
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-400'
              }
            `}
          >
            {allSelected && <Check size={12} className="text-blue-600" />}
            {someSelected && !allSelected && <Check size={12} className="text-white" />}
          </div>
          {allSelected ? 'Unselect All' : 'Select All'}
          <span className="text-xs opacity-75">
            ({attendanceData.filter(s => s.present).length}/{attendanceData.length})
          </span>
        </button>
        
        <div className="text-sm text-gray-600">
          <span className="font-medium">{attendanceData.filter(s => s.present).length}</span> students selected for attendance
        </div>
      </div>

      <div className="min-w-full border rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-5 gap-1 text-white border-b border-blue-800">
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Sr. No.</div>
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Photo</div>
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Student_ID</div>
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Student_Name</div>
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Counselor Name</div>
        </div>
        {/* Student Rows */}
        {attendanceData.map((student) => (
          <div
            key={student.id}
            className="grid grid-cols-5 border-b hover:bg-gray-50"
          >
            <div className="p-3 text-center flex justify-center items-center">
              <div className="w-16 h-10 border rounded-md flex font-semibold items-center text-sm justify-center">
                {student.id}
              </div>
            </div>
            <div className="p-3 flex justify-center items-center">
              {" "}
              <div className="w-16 h-16 border rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  src={student.photo}
                  alt={`${student.name}'s photo`}
                  width={64}
                  height={64}
                  onError={(e) => {
                    // Fallback to a user placeholder if image fails to load
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/64?text=User";
                  }}
                  className="object-cover"
                />
              </div>
            </div>            <div className="p-3 flex justify-center items-center">
              <button
                onClick={() => toggleAttendance(student.id)}
                className={`
                  w-32 h-10 border-2 rounded-md flex items-center justify-start px-2 gap-2 
                  transition-all duration-200 cursor-pointer hover:shadow-sm
                  ${student.present 
                    ? "bg-blue-50 border-blue-600" 
                    : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                  }
                `}
              >
                <div
                  className={`
                    w-4 h-4 border-2 rounded flex items-center justify-center
                    ${student.present
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-400"
                    }
                  `}
                >
                  {student.present && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {student.student_id}
                </span>
              </button>
            </div>
            <div className="p-3 flex justify-center items-center">
              <div className="w-32 h-10 border rounded-md text-sm font-semibold flex items-center justify-center">
                {student.name}
              </div>
            </div>
            <div className="p-3 flex justify-center items-center">
              <div className="w-32 h-10 border rounded-md font-semibold text-sm flex items-center justify-center">
                {student.counselorName}
              </div>
            </div>
          </div>
        ))}
      </div>      {/* Save Button */}
      <div className="flex justify-between items-center mt-6">
        {attendanceData.filter(s => s.present).length === 0 && (
          <div className="text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-md text-sm font-medium">
            ⚠️ No students selected for attendance
          </div>
        )}
        
        <div className="ml-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving || attendanceData.filter(s => s.present).length === 0}
            className="bg-blue-600 hover:bg-blue-700 font-semibold text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Save size={16} />
            {isSaving 
              ? "Saving..." 
              : `Save Attendance (${attendanceData.filter(s => s.present).length} selected)`
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;







// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { students } from "@/services/studentDummyData";
// import { Button } from "@/components/ui/button";
// import { Check, Save } from "lucide-react";
// import { DummyLecture } from "@/services/dummyTypes";

// const MarkAttendance = ({ lecture }: { lecture: DummyLecture }) => {
//   const [attendanceData, setAttendanceData] = useState(students);
//   const [selectAll, setSelectAll] = useState(true);
//   const toggleAttendance = (studentId: number) => {
//     setSelectAll(false);  
//     setAttendanceData(prev => 
//       prev.map(student => 
//         student.id === studentId 
//           ? { ...student, present: !student.present }
//           : student
//       )
//     );
//   };

//   const toggleSelectAll = () => {
//     let allStudents: typeof students = [];
//     if (selectAll) {
//       setAttendanceData([]);
//       setSelectAll(false);
//     } else {
//       students.forEach((student: typeof students[0]) => {
//         allStudents.push({ ...student, present: true });
//       });
//       setAttendanceData(allStudents);
//       setSelectAll(true);
//     }
//   };

//   const handleSave = () => {
//     console.log("Saving attendance for ", lecture.name, " :", attendanceData);
//     // Here you would typically send the data to an API
//   };

//   return (
//     <div className="w-full overflow-x-auto">
//       <div className="min-w-full border rounded-lg overflow-hidden bg-white">
//         {" "}
//         <div className="grid grid-cols-5 gap-1 text-white border-b border-blue-800">
//           <div className="py-3 px-4 bg-primary-blue font-medium text-center">Sr. No.</div>
//           <div className="py-3 px-4 bg-primary-blue font-medium text-center">Photo</div>
//           <div
//                 className={`w-32 h-10 border rounded-md flex items-center justify-start px-2 gap-2 ${
//                   selectAll ? "bg-blue-50" : "bg-gray-50"
//                 }`}
//                 onClick={() => toggleSelectAll()}
//               >
//                 <div
//                   className={`w-4 h-4 border ${
//                     selectAll
//                       ? "bg-blue-600 border-blue-600"
//                       : "bg-white border-gray-300"
//                   } rounded flex items-center justify-center cursor-pointer`}
//                 >
//                   {selectAll && (
//                     <Check size={12} className="text-white" />
//                   )}
//                 </div>
//                 <span className="text-sm font-semibold">
//                   Student_ID
//                 </span>
//               </div>
//           <div className="py-3 px-4 bg-primary-blue font-medium text-center">Student_Name</div>
//           <div className="py-3 px-4 bg-primary-blue font-medium text-center">
//             Counselor Name
//           </div>
//         </div>
//         {/* Student Rows */}
//         {attendanceData.map((student) => (
//           <div
//             key={student.id}
//             className="grid grid-cols-5 border-b hover:bg-gray-50"
//           >
//             <div className="p-3 text-center flex justify-center items-center">
//               <div className="w-16 h-10 border rounded-md flex font-semibold items-center text-sm justify-center">
//                 {student.id}
//               </div>
//             </div>
//             <div className="p-3 flex justify-center items-center">
//               {" "}
//               <div className="w-16 h-16 border rounded-md overflow-hidden flex items-center justify-center">
//                 <Image
//                   src={student.photo}
//                   alt={`${student.name}'s photo`}
//                   width={64}
//                   height={64}
//                   onError={(e) => {
//                     // Fallback to a user placeholder if image fails to load
//                     (e.target as HTMLImageElement).src =
//                       "https://via.placeholder.com/64?text=User";
//                   }}
//                   className="object-cover"
//                 />
//               </div>
//             </div>
//             <div className="p-3 flex justify-center items-center">
//               <div
//                 className={`w-32 h-10 border rounded-md flex items-center justify-start px-2 gap-2 ${
//                   student.present ? "bg-blue-50" : "bg-gray-50"
//                 }`}
//                 onClick={() => toggleAttendance(student.id)}
//               >
//                 <div
//                   className={`w-4 h-4 border ${
//                     student.present
//                       ? "bg-blue-600 border-blue-600"
//                       : "bg-white border-gray-300"
//                   } rounded flex items-center justify-center cursor-pointer`}
//                 >
//                   {student.present && (
//                     <Check size={12} className="text-white" />
//                   )}
//                 </div>
//                 <span className="text-sm font-semibold">
//                   {student.student_id}
//                 </span>
//               </div>
//             </div>
//             <div className="p-3 flex justify-center items-center">
//               <div className="w-32 h-10 border rounded-md text-sm font-semibold flex items-center justify-center">
//                 {student.name}
//               </div>
//             </div>
//             <div className="p-3 flex justify-center items-center">
//               <div className="w-32 h-10 border rounded-md font-semibold text-sm flex items-center justify-center">
//                 {student.counselorName}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Save Button */}
//       <div className="flex justify-end mt-4">
//         <Button
//           onClick={handleSave}
//           className="bg-blue-600 hover:bg-blue-700 font-semibold text-white px-6 py-2 rounded-md flex items-center gap-2"
//         >
//           <Save size={16} />
//           Save
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default MarkAttendance;
