/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";
import FormsTable from "./forms-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DepartmentFormsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return <div>Authentication error. Please log in again.</div>;
  } 

  // Fetch user role data first to determine access level
  const { data: userData, error: userError } = await supabase
    .from("user_role")
    .select(
      `
      *,
      departments(*),
      institutes(*)
    `
    )
    .eq("user_id", user.id);

  if (userError) {
    console.error("Error fetching user roles:", userError);
    return <div>Error loading user roles. Please try again later.</div>;
  }

  if (!userData || userData.length === 0) {
    return <div>No role assigned. Please contact administrator.</div>;
  }

  const userRole = userData[0];
  const isPrincipal = userRole?.role_name === "Principal";
  let isHOD = false;

  for (const role of userData) {
    if (role.role_name === "HOD") {
      isHOD = true;
      break;
    }
  }

  if (!isPrincipal && !isHOD) {
    return <div>You are not authorized to access this page.</div>;
  }

  // Build query based on user role
  let formsQuery = supabase.from("forms").select(`
    *,
    users(*),
    subjects(*, departments(*, institutes(*)))
  `);

  // Apply role-based filtering at database level for better performance
  if (isHOD && userRole.depart_id) {
    // HOD: Filter by their department through subjects
    formsQuery = formsQuery.eq("subjects.department_id", userRole.depart_id);
  } else if (isPrincipal && userRole.institute) {
    // Principal: Filter by their institute through departments
    formsQuery = formsQuery.eq(
      "subjects.departments.institute_id",
      userRole.institute
    );
  }

  const { data: forms, error } = await formsQuery;

  if (error) {
    console.error("Error fetching forms:", error);
    return <div>Error loading forms. Please try again later.</div>;
  }

  // Fetch departments based on user role
  let departmentsData = [];
  if (isPrincipal && userRole.institute) {
    // Principal: Get departments from their institute only
    const { data: instituteDepartments } = await supabase
      .from("departments")
      .select("*")
      .eq("institute_id", userRole.institute)
      .order("name");

    departmentsData = instituteDepartments || [];
  } else if (isHOD && userRole.depart_id) {
    // HOD: Get only their department
    const { data: hodDepartment } = await supabase
      .from("departments")
      .select("*")
      .eq("id", userRole.depart_id);

    departmentsData = hodDepartment || [];
  }

  return (
    <div className="mx-4 mt-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
            List of Lesson Planning Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormsTable
            forms={forms || []}
            userrole={userData}
            allDepartments={departmentsData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
