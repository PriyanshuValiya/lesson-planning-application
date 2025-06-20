import { getTimetablesByFacultyId } from "@/app/actions/timtableApi";
import ClientAttendanceModule from "@/app/attendance-module/ClientAttendanceModule";

export default async function AttendanceModulePage() {
  // Fetch timetable for the specified faculty ID using existing backend function
  const timetable = await getTimetablesByFacultyId("2d8711ec-57eb-4bd6-8028-3f0593af8638");
  
  return <ClientAttendanceModule timetable={timetable} />;
}