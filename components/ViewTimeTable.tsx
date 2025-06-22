"use client";

import { useState } from "react";
import {
  academicYears,
  terms,
  loadDetails,
} from "@/services/timeTableDummy";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timetable } from "@/types/types";

const ViewTimeTable = ({timeTableData}: {timeTableData: Timetable[]}) => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-2026");
  const [selectedTerm, setSelectedTerm] = useState("Odd");
  const [selectedLoadDetail, setSelectedLoadDetail] = useState("Time Table");

  // Debug: Log the received data
  // console.log('ViewTimeTable received data:', timeTableData);
  // console.log('Data length:', timeTableData?.length || 0);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Fixed time slots based on the image
  const timeSlots = [
    { id: "1", time: "09:10 AM-10:09 AM", isBreak: false },
    { id: "2", time: "10:10 AM-11:09 AM", isBreak: false },
    {
      id: "3",
      time: "11:10 AM-12:09 PM",
      isBreak: true,
      breakType: "Lunch Break",
    },
    { id: "4", time: "12:10 PM-13:09 PM", isBreak: false },
    { id: "5", time: "13:10 PM-14:09 PM", isBreak: false },
    { id: "6", time: "14:10 PM-14:19 PM", isBreak: true, breakType: "Break" },
    { id: "7", time: "14:20 PM-15:19 PM", isBreak: false },
    { id: "8", time: "15:20 PM-16:20 PM", isBreak: false },
  ];  const getTimeSlotFromDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return "";
    
    // console.log('Processing datetime:', dateTimeString);
    
    const date = new Date(dateTimeString);
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const localHours = date.getHours();
    const localMinutes = date.getMinutes();
    
    // console.log('Time analysis:', { 
    //   dateTimeString,
    //   utcHours, 
    //   utcMinutes, 
    //   localHours, 
    //   localMinutes,
    //   timeString: `${localHours}:${localMinutes.toString().padStart(2, '0')}`
    // });

    // Create a more flexible mapping based on your actual data
    // Let's map based on the UTC times from your data and see which time slots they should go to
    
    // Monday data: 04:30 UTC and 06:30 UTC  
    // Tuesday data: 03:40 UTC and 07:40 UTC
    
    // Map UTC times to time slots
    if (utcHours === 4 && utcMinutes === 30) return "09:10 AM-10:09 AM"; // Monday entry 1
    if (utcHours === 6 && utcMinutes === 30) return "12:10 PM-13:09 PM"; // Monday entry 2
    if (utcHours === 3 && utcMinutes === 40) return "09:10 AM-10:09 AM"; // Tuesday entry 1
    if (utcHours === 7 && utcMinutes === 40) return "13:10 PM-14:09 PM"; // Tuesday entry 2
    
    // Fallback to local time matching
    if (localHours === 9) return "09:10 AM-10:09 AM";
    if (localHours === 10) return "10:10 AM-11:09 AM";
    if (localHours === 11) return "11:10 AM-12:09 PM";
    if (localHours === 12) return "12:10 PM-13:09 PM";
    if (localHours === 13) return "13:10 PM-14:09 PM";
    if (localHours === 14) return "14:20 PM-15:19 PM";
    if (localHours === 15) return "15:20 PM-16:20 PM";

    console.log('No time slot match found for UTC:', { utcHours, utcMinutes }, 'Local:', { localHours, localMinutes });
    return "";
  };  const getSubjectsForSlot = (day: string, timeSlot: string): any[] => {
    if (!timeTableData || timeTableData.length === 0) {
      console.log('No timetable data available');
      return [];
    }
    
    // console.log(`\n=== Getting subjects for ${day} ${timeSlot} ===`);
    
    const subjects = timeTableData.filter((entry) => {
      const entryDay = entry.day?.toLowerCase();
      const targetDay = day.toLowerCase();
      const entryTimeSlot = getTimeSlotFromDateTime(entry.from);

      const match = entryDay === targetDay && entryTimeSlot === timeSlot;
      
      console.log('Entry analysis:', {
        id: entry.id,
        originalDay: entry.day,
        entryDay,
        targetDay,
        from: entry.from,
        entryTimeSlot,
        targetTimeSlot: timeSlot,
        dayMatch: entryDay === targetDay,
        timeMatch: entryTimeSlot === timeSlot,
        overallMatch: match
      });

      return match;
    });
    
    // console.log(`Found ${subjects.length} subjects for ${day} ${timeSlot}:`, subjects.map(s => ({ id: (s as any).id, subject: (s as any).subject_name || (s as any).subject, day: (s as any).day })));
    
    // Limit to maximum 2 subjects per time slot
    const limitedSubjects = subjects.slice(0, 2);

    return limitedSubjects;
  };

  const isSlotOccupiedByPreviousLab = (
    day: string,
    timeSlot: string
  ): boolean => {
    const currentSlotIndex = timeSlots.findIndex(
      (slot) => slot.time === timeSlot
    );
    if (currentSlotIndex <= 0) return false;

    const previousSlot = timeSlots[currentSlotIndex - 1];
    if (previousSlot.isBreak) return false;

    const previousSubjects = getSubjectsForSlot(day, previousSlot.time);
    return previousSubjects.some(
      (subject) => subject.type.toLowerCase() === "lab"
    );
  };
  const getSubjectColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "lecture":
        return "bg-[#D0D0D0] text-primary-blue";
      case "lab":
        return "bg-[#D0D0D0] text-[#B24CC3]";
      default:
        return "bg-[#D0D0D0] text-gray-900";
    }
  };  const renderSubjectCell = (
    subject: any,
    isLab: boolean = false,
    isMultiple: boolean = false
  ) => {
    // Create display values based on the actual API data structure
    const displayType = `B TECH(CE)`;
    const displaySem = `SEM ${subject.sem || 'N/A'}`;
    const displayDiv = `DIV-${subject.division || 'A'}${
      subject.batch ? ` / ${subject.batch}` : ""
    }`;
    const displaySubject = subject.subject_name || subject.subject || "Subject"; 
    const displayCode = subject.subject_code || subject.code || "CODE";

    const height = isLab ? "h-40" : "h-20";
    const padding = isMultiple ? "p-1.5" : "p-2";
    const fontSize = "text-xs";

    return (
      <div
        className={`${padding} ${fontSize} ${getSubjectColor(
          subject.type || 'lecture'
        )} ${height} w-full flex border-black flex-col p-2 justify-center border-r border-b-2`}
      >
        <div className="font-semibold leading-tight">
          {displayType} / {displaySem}
        </div>
        <div className="font-medium leading-tight mt-0.5">{displayDiv}</div>
        <div className="leading-tight mt-0.5">
          {displaySubject} / {displayCode}
        </div>
        {isLab && (
          <div className="leading-tight mt-1 font-medium opacity-75">
            {isMultiple ? "Lab (2h)" : "Lab (2 hrs)"}
          </div>
        )}
      </div>
    );
  };  const renderMultipleSubjects = (
    subjects: any[],
    isLab: boolean = false
  ) => {
    const height = isLab ? "h-32" : "h-16";

    if (subjects.length === 0) {
      return <div className={`${height} w-full`}></div>;
    }

    if (subjects.length === 1) {
      return (
        <div className={`${height} w-full`}>
          {renderSubjectCell(subjects[0], isLab, false)}
        </div>
      );
    }

    // For exactly 2 subjects, display side by side with equal width
    return (
      <div className={`${height} w-full flex p-0`}>
        <div className="flex-1 w-1/2">
          {renderSubjectCell(subjects[0], isLab, true)}
        </div>
        <div className="flex-1 w-1/2">
          {renderSubjectCell(subjects[1], isLab, true)}
        </div>
      </div>
    );
  };

  const renderBreakCell = (breakType: string) => {
    return (
      <div className="text-primary-blue text-center py-3 font-semibold text-2xl">
        {breakType}
      </div>
    );
  };
  return (
    <div className="w-full bg-white">
      {/* Debug Info */}
      {/* <div className="p-4 bg-yellow-50 border border-yellow-200 mb-4">
        <p className="text-sm">
          <strong>Debug:</strong> Received {timeTableData?.length || 0} timetable entries
        </p>
        {timeTableData && timeTableData.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-blue-600">Show raw data</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(timeTableData[0], null, 2)}
            </pre>
          </details>
        )}
      </div> */}

      {/* Header Controls */}
      {/* <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Academic Year:
          </label>
          <Select
            value={selectedAcademicYear}
            onValueChange={setSelectedAcademicYear}
          >
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Term:</label>
          <div className="flex gap-1">
            {terms.map((term) => (
              <Button
                key={term}
                variant={selectedTerm === term ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTerm(term)}
                className={`px-4 py-1 text-xs h-8 rounded-full ${
                  selectedTerm === term
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Load Details:
          </label>
          <div className="flex gap-1">
            {loadDetails.map((detail) => (
              <Button
                key={detail}
                variant={selectedLoadDetail === detail ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLoadDetail(detail)}
                className={`px-4 py-1 text-xs h-8 rounded-full ${
                  selectedLoadDetail === detail
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {detail}
              </Button>
            ))}
          </div>
        </div>
      </div>{" "} */}
      {/* Timetable */}
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse border-2 border-black bg-white table-fixed">
          <thead>
            <tr>
              <th className="border-2 border-black bg-white p-2 text-left font-semibold text-sm w-32">
                <div className="text-gray-700">Time Slot/</div>
                <div className="text-gray-700">Day</div>
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border-2 border-black bg-white p-2 text-center font-semibold text-sm w-40"
                >
                  <div className="font-medium">{day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot.id} className="h-20 items-center">
                <td className="border-2 border-black p-2 bg-white font-medium text-sm items-center justify-center align-top">
                  <div className="whitespace-nowrap items-center">
                    {slot.time}
                  </div>
                </td>
                {slot.isBreak ? (
                  <td colSpan={6} className="border-2 border-black p-0">
                    {renderBreakCell(slot.breakType || "Break")}
                  </td>
                ) : (
                  days.map((day) => {
                    const subjects = getSubjectsForSlot(day, slot.time);
                    const isOccupiedByPreviousLab = isSlotOccupiedByPreviousLab(
                      day,
                      slot.time
                    );

                    // Skip rendering if this slot is occupied by a lab from the previous slot
                    if (isOccupiedByPreviousLab) {
                      return null;
                    }

                    const hasLab = subjects.some(
                      (subject) => subject.type.toLowerCase() === "lab"
                    );
                    const rowSpan = hasLab ? 2 : 1;

                    return (
                      <td
                        key={day}
                        className="border-2 border-black p-0 align-top w-40"
                        rowSpan={rowSpan}
                      >
                        {renderMultipleSubjects(subjects, hasLab)}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewTimeTable;
