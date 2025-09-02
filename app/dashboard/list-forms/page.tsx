/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";
import FormsTable from "./forms-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FormsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[300px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function FormsContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return (
      <div className="text-red-600">
        Authentication error. Please log in again.
      </div>
    );
  }

  // Get user data first (matching layout.tsx logic)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (userError || !userData) {
    return (
      <div className="text-red-600">
        User data not found. Please contact administrator.
      </div>
    );
  }

  // Try multiple approaches to find the role data (matching layout.tsx logic)
  const { data: roleDataWithUserId, error: roleErrorWithUserId } = await supabase
    .from("user_role")
    .select(`
      *,
      departments(*),
      institutes(*)
    `)
    .eq("user_id", userData.id);

  const { data: roleDataWithAuthId, error: roleErrorWithAuthId } = await supabase
    .from("user_role")
    .select(`
      *,
      departments(*),
      institutes(*)
    `)
    .eq("user_id", userData.auth_id);

  const { data: roleDataWithSupabaseId, error: roleErrorWithSupabaseId } = await supabase
    .from("user_role")
    .select(`
      *,
      departments(*),
      institutes(*)
    `)
    .eq("user_id", user.id);

  // Use whichever query returns data
  let userRoles = null;
  if (roleDataWithUserId && roleDataWithUserId.length > 0) {
    userRoles = roleDataWithUserId;
  } else if (roleDataWithAuthId && roleDataWithAuthId.length > 0) {
    userRoles = roleDataWithAuthId;
  } else if (roleDataWithSupabaseId && roleDataWithSupabaseId.length > 0) {
    userRoles = roleDataWithSupabaseId;
  }

  if (!userRoles || userRoles.length === 0) {
    return (
      <div className="text-red-600">
        No role assigned. Please contact administrator.
        <br />
        <small>Debug: User email: {userData.email}, User ID: {userData.id}, Auth ID: {user.id}</small>
      </div>
    );
  }

  // Determine user role
  const isPrincipal = userRoles.some((role) => role.role_name === "Principal");
  const isHOD = userRoles.some((role) => role.role_name === "HOD");
  const isFaculty = userRoles.some((role) => role.role_name === "Faculty");

  console.log("User roles found:", userRoles);
  console.log("User email:", userData.email);

  // Allow access for Principal, HOD, Faculty, or the specific user
  if (!isPrincipal && !isHOD && !isFaculty && userData.email !== "radhikapatel.it@charusat.ac.in") {
    return (
      <div className="text-red-600">
        You are not authorized to access this page.
        <br />
        <small>Debug: Roles found: {userRoles.map(r => r.role_name).join(', ')}</small>
      </div>
    );
  }

  // Get department IDs based on role
  let departmentIds: string[] = [];
  let instituteId: string | null = null;

  if (isHOD) {
    // HOD: Get only their assigned departments
    departmentIds = userRoles
      .filter((role) => role.role_name === "HOD" && role.depart_id)
      .map((role) => role.depart_id);
  } else if (isPrincipal || userData.email === "radhikapatel.it@charusat.ac.in") {
    // Principal or special faculty: Get institute ID
    instituteId = userRoles.find((role) => role.institute)?.institute || null;
    
    // If no institute found in roles, try to get it from department
    if (!instituteId) {
      const departmentRole = userRoles.find((role) => role.departments);
      if (departmentRole && departmentRole.departments) {
        instituteId = departmentRole.departments.institute_id;
      }
    }
  } else if (isFaculty) {
    // Regular faculty: Get their assigned departments
    departmentIds = userRoles
      .filter((role) => role.depart_id)
      .map((role) => role.depart_id);
  }

  if ((isHOD || isFaculty) && departmentIds.length === 0 && userData.email !== "radhikapatel.it@charusat.ac.in") {
    return (
      <div className="text-red-600">
        No departments assigned to your role.
      </div>
    );
  }

  // Get subjects based on role
  let subjectsQuery = supabase
    .from("subjects")
    .select(`
      id,
      name,
      code,
      semester,
      department_id,
      departments(*)
    `)
    .order("name", { ascending: true });

  if ((isHOD || isFaculty) && departmentIds.length > 0) {
    subjectsQuery = subjectsQuery.in("department_id", departmentIds);
  } else if ((isPrincipal || userData.email === "radhikapatel.it@charusat.ac.in") && instituteId) {
    // Get all departments in institute first
    const { data: departments, error } = await supabase
      .from("departments")
      .select("id")
      .eq("institute_id", instituteId);

    if (error || !departments) {
      return <div className="text-red-600">Error loading departments !!</div>;
    }
    subjectsQuery = subjectsQuery.in(
      "department_id",
      departments.map((d) => d.id)
    );
  }

  const { data: subjects, error: subjectsError } = await subjectsQuery;

  if (subjectsError || !subjects || subjects.length === 0) {
    return (
      <div className="text-red-600">
        No subjects found !!
        <br />
        <small>Debug: Department IDs: {departmentIds.join(', ')}, Institute ID: {instituteId}</small>
      </div>
    );
  }

  // Get faculty assignments - IMPORTANT: Filter by department for HODs
  let assignmentsQuery = supabase
    .from("user_role")
    .select(`
      id,
      user_id,
      subject_id,
      depart_id,
      users!user_role_user_id_fkey(
        id,
        auth_id,
        name,
        email,
        department
      )
    `)
    .in("subject_id", subjects.map((sub) => sub.id))
    .not("subject_id", "is", null);

  if ((isHOD || isFaculty) && departmentIds.length > 0) {
    assignmentsQuery = assignmentsQuery.in("depart_id", departmentIds);
  }

  const { data: assignments, error: assignmentsError } = await assignmentsQuery;

  if (assignmentsError) {
    console.error("Error fetching faculty assignments:", assignmentsError);
    return (
      <div className="text-red-600">Error loading faculty assignments.</div>
    );
  }

  const { data: forms, error: formsError } = await supabase
    .from("forms")
    .select(`
      id,
      created_at,
      faculty_id,
      subject_id,
      users!forms_faculty_id_fkey(
        id,
        auth_id,
        name,
        email
      )
    `)
    .in("subject_id", subjects.map((sub) => sub.id));

  if (formsError) {
    console.error("Error fetching forms:", formsError);
    return <div className="text-red-600">Error loading forms.</div>;
  }

  const tableData = subjects
    //@ts-expect-error
    .flatMap((subject) => {
      const subjectAssignments = (isHOD || isFaculty) && departmentIds.length > 0
        ? assignments?.filter(
            (a) =>
              a.subject_id === subject.id && departmentIds.includes(a.depart_id)
          ) || []
        : assignments?.filter((a) => a.subject_id === subject.id) || [];

      if (subjectAssignments.length === 0) {
        return [
          {
            faculty_name: "Not assigned",
            subject_name: subject.name,
            subject_code: subject.code,
            semester: subject.semester,
            department_id: subject.department_id,
            //@ts-expect-error
            department_name: subject.departments?.name || "",
            //@ts-expect-error
            abbreviation: subject.departments?.abbreviation_depart || "-",
            form_id: null,
            has_form: false,
          },
        ];
      }

      return subjectAssignments.map((assignment) => {
        const facultyForms =
          forms?.filter(
            (f) =>
              f.subject_id === subject.id &&
              //@ts-expect-error
              f.users?.auth_id === assignment.users?.auth_id
          ) || [];

        const mostRecentForm = facultyForms.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        return {
          subject_id: subject.id,
          //@ts-expect-error
          faculty_name: assignment.users?.name || "",
          //@ts-expect-error
          faculty_id: assignment.users?.auth_id || "",
          subject_name: subject.name,
          subject_code: subject.code,
          semester: subject.semester,
          department_id: subject.department_id,
          //@ts-expect-error
          department_name: subject.departments?.name || "",
          //@ts-expect-error
          abbreviation: subject.departments?.abbreviation_depart || "-",
          form_id: mostRecentForm?.id || null,
          has_form: !!mostRecentForm,
        };
      });
    })
    //@ts-expect-error
    .filter((item) => item.faculty_name !== "");

  // Get all departments for filter dropdown (for Principal only)
  let allDepartments: any[] = [];
  if ((isPrincipal || userData.email === "radhikapatel.it@charusat.ac.in") && instituteId) {
    const { data: departments } = await supabase
      .from("departments")
      .select("*")
      .eq("institute_id", instituteId)
      .order("name");

    allDepartments = departments || [];
  }

  return (
    <FormsTable
      forms={tableData}
      userrole={userRoles}
      allDepartments={allDepartments}
      isPrincipal={isPrincipal || userData.email === "radhikapatel.it@charusat.ac.in"}
      currentDepartmentIds={(isHOD || isFaculty) ? departmentIds : []}
    />
  );
}

export default async function DepartmentFormsPage() {
  return (
    <div className="mx-4 mt-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
            List of Lesson Planning Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<FormsTableSkeleton />}>
            <FormsContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}