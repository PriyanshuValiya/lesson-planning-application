"use client";

import { useState } from "react";
import { Timetable } from "@/types/types";

const ViewTimeTable = ({timeTableData}: {timeTableData: Timetable[]}) => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-2026");
  const [selectedTerm, setSelectedTerm] = useState("Odd");
  const [selectedLoadDetail, setSelectedLoadDetail] = useState("Time Table");
  // Debug: Log the received data
  console.log('ViewTimeTable received data:', timeTableData);
  console.log('Data length:', timeTableData?.length || 0);

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
  ];  const getTimeSlotFromDateTime = (timeString: string): string => {
    if (!timeString) return "";
    
    console.log('Processing time:', timeString);
    
    // Handle the new format: "03:40:00+00" (time only with timezone)
    // Parse the time string to get hours and minutes
    const timeMatch = timeString.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!timeMatch) {
      console.log('Invalid time format:', timeString);
      return "";
    }
    
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    
    // console.log('Parsed time:', { hours, minutes, originalTime: timeString });

    // Map the actual times from your data to time slots
    // Based on your data:
    // 03:40:00+00 -> 09:10 AM-10:09 AM
    // 04:30:00+00 -> 09:10 AM-10:09 AM  
    // 05:40:00+00 -> 11:10 AM-12:09 PM
    // 06:30:00+00 -> 12:10 PM-13:09 PM
    // 07:40:00+00 -> 13:10 PM-14:09 PM
    
    // Create mappings based on the actual time data
    if (hours === 3 && minutes === 40) return "09:10 AM-10:09 AM"; // Tuesday Lab
    if (hours === 4 && minutes === 30) return "09:10 AM-10:09 AM"; // Monday Lecture
    if (hours === 5 && minutes === 40) return "11:10 AM-12:09 PM"; // Tuesday Lab end -> maps to after lunch
    if (hours === 6 && minutes === 30) return "12:10 PM-13:09 PM"; // Monday Lab
    if (hours === 7 && minutes === 40) return "13:10 PM-14:09 PM"; // Tuesday Lecture
    if (hours === 8 && minutes === 30) return "14:20 PM-15:19 PM"; // Monday Lab end
    
    // Add some flexibility for similar times
    if (hours >= 3 && hours <= 4) return "09:10 AM-10:09 AM";
    if (hours === 5) return "11:10 AM-12:09 PM";
    if (hours === 6) return "12:10 PM-13:09 PM";
    if (hours === 7) return "13:10 PM-14:09 PM";
    if (hours >= 8 && hours <= 9) return "14:20 PM-15:19 PM";
    if (hours >= 10) return "15:20 PM-16:20 PM";

    // console.log('No time slot match found for:', { hours, minutes, timeString });
    return "";
  };const getSubjectsForSlot = (day: string, timeSlot: string): any[] => {
    if (!timeTableData || timeTableData.length === 0) {
      console.log('No timetable data available');
      return [];
    }
    
    console.log(`\n=== Getting subjects for ${day} ${timeSlot} ===`);
      const subjects = timeTableData.filter((entry) => {
      const entryDay = entry.day?.toLowerCase();
      const targetDay = day.toLowerCase();
      const entryTimeSlot = getTimeSlotFromDateTime(entry.from || "");

      const match = entryDay === targetDay && entryTimeSlot === timeSlot;

      return match;
    });
    
    console.log(`Found ${subjects.length} subjects for ${day} ${timeSlot}:`, subjects.map(s => ({ id: (s as any).id, subject: (s as any).subject_name || (s as any).subject, day: (s as any).day })));
    
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
    
    // Check if any previous lab extends into this time slot
    return previousSubjects.some((subject) => {
      if (subject.type?.toLowerCase() !== "lab") return false;
      
      // Get the lab's end time and see if it extends into the current slot
      const labEndTime = subject.to;
      if (!labEndTime) return false;
      
      const labEndSlot = getTimeSlotFromDateTime(labEndTime);
      return labEndSlot === timeSlot;
    });
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
    <div className="w-full bg-white">      {/* Debug Info */}
      

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
                ) : (                  days.map((day) => {
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
                      (subject) => subject.type?.toLowerCase() === "lab"
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
                  }).filter(Boolean)
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
