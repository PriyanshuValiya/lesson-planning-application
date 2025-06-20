"use client";

import { useState } from "react";
import Image from "next/image";
import { students } from "@/services/studentDummyData";
import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";
import { DummyLecture } from "@/services/dummyTypes";
import { insertAttendance } from "@/app/actions/AttendanceApi";
import { toast } from "sonner";

const MarkAttendance = ({ lecture }: { lecture: DummyLecture }) => {
  const [attendanceData, setAttendanceData] = useState(students);
  const [selectAll, setSelectAll] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toggleAttendance = (studentId: number) => {
    setSelectAll(false);  
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, present: !student.present }
          : student
      )
    );
  };

  const toggleSelectAll = () => {
    let allStudents: typeof students = [];
    if (selectAll) {
      setAttendanceData([]);
      setSelectAll(false);
    } else {
      students.forEach((student: typeof students[0]) => {
        allStudents.push({ ...student, present: true });
      });
      setAttendanceData(allStudents);
      setSelectAll(true);
    }
  };  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get IDs of present students
      const presentStudentIds = attendanceData
        .filter(student => student.present)
        .map(student => student.student_id);

      console.log("Present student IDs:", presentStudentIds);

      // Save attendance for each present student
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      for (const studentId of presentStudentIds) {
        await insertAttendance({
          lecture: lecture.name || lecture._id || 'unknown',
          student: studentId,
          is_present: true,
          Date: currentDate,
          student_id: studentId,
          faculty_id: lecture.facultyName || 'unknown' // Optional field
        });
      }

      toast.success(`Attendance saved successfully for ${presentStudentIds.length} students`);
      console.log("Attendance saved for students:", presentStudentIds);
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full border rounded-lg overflow-hidden bg-white">
        {" "}
        <div className="grid grid-cols-5 gap-1 text-white border-b border-blue-800">
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Sr. No.</div>
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Photo</div>
          <div
                className={`w-32 h-10 border rounded-md flex items-center justify-start px-2 gap-2 ${
                  selectAll ? "bg-blue-50" : "bg-gray-50"
                }`}
                onClick={() => toggleSelectAll()}
              >
                <div
                  className={`w-4 h-4 border ${
                    selectAll
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300"
                  } rounded flex items-center justify-center cursor-pointer`}
                >
                  {selectAll && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold">
                  Student_ID
                </span>
              </div>
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">Student_Name</div>
          <div className="py-3 px-4 bg-primary-blue font-medium text-center">
            Counselor Name
          </div>
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
            </div>
            <div className="p-3 flex justify-center items-center">
              <div
                className={`w-32 h-10 border rounded-md flex items-center justify-start px-2 gap-2 ${
                  student.present ? "bg-blue-50" : "bg-gray-50"
                }`}
                onClick={() => toggleAttendance(student.id)}
              >
                <div
                  className={`w-4 h-4 border ${
                    student.present
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300"
                  } rounded flex items-center justify-center cursor-pointer`}
                >
                  {student.present && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold">
                  {student.student_id}
                </span>
              </div>
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
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-4">        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 font-semibold text-white px-6 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save"}
        </Button>
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
