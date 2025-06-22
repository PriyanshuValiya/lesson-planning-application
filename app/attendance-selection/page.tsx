import Link from "next/link";
import { Calendar, UserCheck, BarChart3 } from "lucide-react";
import FacultySidebar from "@/components/FacultySidebar";
import { signOut } from "@/app/actions/auth";
import { AuthProvider } from "@/lib/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AttendanceModuleSelectionPage() {
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

  return (
    <AuthProvider>
      <DashboardProvider value={{ userData, roleData: roleData || [] }}>
        <div className="flex h-screen bg-gray-100">
          <FacultySidebar signOut={signOut} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold text-blue-800 mb-2">
                    Attendance Module
                  </h1>
                  <p className="text-gray-600">
                    Select an option to manage attendance and timetables
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Timetable Option */}
                  <Link
                    href="/timetable"
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:border-blue-300 group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-blue-100 rounded-full p-4 mb-4 group-hover:bg-blue-200 transition-colors">
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Timetable
                      </h3>
                      <p className="text-gray-600 text-sm">
                        View your class schedule and timetable
                      </p>
                    </div>
                  </Link>

                  {/* Take Attendance Option */}
                  <Link
                    href="/attendance-module"
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:border-green-300 group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-green-100 rounded-full p-4 mb-4 group-hover:bg-green-200 transition-colors">
                        <UserCheck className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Take Attendance
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Mark student attendance for your classes
                      </p>
                    </div>
                  </Link>

                  {/* View Attendance Option */}
                  <Link
                    href="/attendance-monitor"
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:border-purple-300 group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-purple-100 rounded-full p-4 mb-4 group-hover:bg-purple-200 transition-colors">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        View Attendance
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Monitor and review attendance records
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </DashboardProvider>
    </AuthProvider>
  );
}
