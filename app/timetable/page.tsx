import ViewTimeTable from "@/components/ViewTimeTable";
import { getTimetablesByFacultyId } from "../actions/timtableApi";
import { Timetable } from "@/types/types";

const TimeTablePage = async () => {
  let timeTableData: Timetable[];

  try {
    timeTableData = await getTimetablesByFacultyId(
      "2d8711ec-57eb-4bd6-8028-3f0593af8638"
    );
    console.log("Time Table Data:", timeTableData);
  } catch (error) {
    console.error("Error fetching time table data:", error);
    timeTableData = [];
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-blue-800">Time Table</h1>
        <div className="flex items-center">
          {/* <div className="px-4 py-2 bg-white border rounded-md shadow-sm">
            <span className="text-sm font-medium text-blue-800">
              Subject Teacher
            </span>
          </div> */}
        </div>
      </div>

      <ViewTimeTable timeTableData={timeTableData} />
    </div>
  );
};

export default TimeTablePage;
