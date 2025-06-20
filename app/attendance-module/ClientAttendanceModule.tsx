"use client";
import AttendanceDetails from "@/components/AttendanceDetails";
import MarkAttendance from "@/components/MarkAttendance";
import SubjectCard from "@/components/SubjectCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ClientAttendanceModuleProps {
  timetable: any[];
}

export default function ClientAttendanceModule({ timetable }: ClientAttendanceModuleProps) {
  // Defensive: fallback to null if timetable[0] is undefined
  const [selectedLecture, setSelectedLecture] = useState(timetable?.[0] ?? null);
  const [showList, setShowList] = useState(true);
  const [fillAttendance, setFillAttendance] = useState(false);

  const handleBackClick = () => {
    setShowList(true);
    setFillAttendance(false);
  };  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-800">
          Attendance Module
        </h1>
        <div className="flex items-center">
          <div className="px-4 py-2 bg-white border rounded-md shadow-sm">
            <span className="text-sm font-medium text-blue-800">
              Subject Teacher
            </span>
          </div>
        </div>
      </div>
      
      {showList ? (
        timetable && timetable.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {timetable.map((lecture) => (
              <div key={lecture?.id ?? Math.random()} className="mb-4">
                <SubjectCard 
                  lecture={lecture} 
                  setLecture={setSelectedLecture} 
                  setShowList={setShowList} 
                  setFillAttendance={setFillAttendance} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No lectures available for this faculty.</p>
          </div>
        )
      ) : fillAttendance ? (
        selectedLecture ? (
          <>
            <div className="mb-4">
              <Button 
                onClick={handleBackClick} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Subject List
              </Button>
            </div>
            
            <div className="mt-4 mb-8">
              <AttendanceDetails lecture={selectedLecture} />
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
              <MarkAttendance lecture={selectedLecture} />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No lecture selected.</p>
          </div>
        )
      ) : null}
    </div>
  );
}
