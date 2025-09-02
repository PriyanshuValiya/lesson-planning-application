import ViewTimeTable from "@/components/ViewTimeTable";
import { getTimetablesByFacultyId } from "../actions/timtableApi";
import { Timetable } from "@/types/types";
import { signOut } from "@/app/actions/auth";
import { AuthProvider } from "@/lib/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const TimeTablePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  

  if (authError || !user) {
    console.error("Authentication error or user not found:", authError);
    redirect("/auth/login");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user data:", userError);
    redirect("/auth/login");
  }

  // Try multiple approaches to find the role data
  const { data: roleDataWithUserId, error: roleErrorWithUserId } = await supabase
    .from("user_role")
    .select("*, departments(*, institutes(*))")
    .eq("user_id", userData.id);

  const { data: roleDataWithAuthId, error: roleErrorWithAuthId } = await supabase
    .from("user_role")
    .select("*, departments(*, institutes(*))")
    .eq("user_id", userData.auth_id);

  const { data: roleDataWithSupabaseId, error: roleErrorWithSupabaseId } = await supabase
    .from("user_role")
    .select("*, departments(*, institutes(*))")
    .eq("user_id", user.id);

  // Use whichever query returns data
  let roleData = null;

  if (roleDataWithUserId && roleDataWithUserId.length > 0) {
    roleData = roleDataWithUserId;
  } else if (roleDataWithAuthId && roleDataWithAuthId.length > 0) {
    roleData = roleDataWithAuthId;
  } else if (roleDataWithSupabaseId && roleDataWithSupabaseId.length > 0) {
    roleData = roleDataWithSupabaseId;
  }

  let timeTableData: Timetable[];
  // console.log('data:', roleData);
  

  try {
    timeTableData = await getTimetablesByFacultyId(
      userData.id || userData.auth_id || user.id
    );
    console.log("Time Table Data:", timeTableData);
  } catch (error) {
    console.error("Error fetching time table data:", error);
    timeTableData = [];
  }

  return (
    <AuthProvider>
      <DashboardProvider value={{ userData, roleData: roleData || [] }}>
        <div className="flex h-screen bg-gray-100">
          <main className="flex-1 overflow-y-auto">
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
          </main>
        </div>
      </DashboardProvider>
    </AuthProvider>
  );
};

export default TimeTablePage;
