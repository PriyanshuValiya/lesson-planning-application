/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server"
import FormsTable from "./forms-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Loading component for the forms table
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
  )
}

async function FormsContent() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return <div className="text-red-600">Authentication error. Please log in again.</div>
  }

  // Fetch user role data with better error handling
  const { data: userData, error: userError } = await supabase
    .from("user_role")
    .select(`
      *,
      departments(*),
      institutes(*)
    `)
    .eq("user_id", user.id)

  if (userError) {
    console.error("Error fetching user roles:", userError)
    return <div className="text-red-600">Error loading user roles. Please try again later.</div>
  }

  if (!userData || userData.length === 0) {
    return <div className="text-yellow-600">No role assigned. Please contact administrator.</div>
  }

  const userRole = userData[0]
  const isPrincipal = userRole?.role_name === "Principal"
  const isHOD = userData.some((role) => role.role_name === "HOD")

  if (!isPrincipal && !isHOD) {
    return <div className="text-red-600">You are not authorized to access this page.</div>
  }

  // Step 1: Get department IDs based on user role
  let allowedDepartmentIds: string[] = []

  if (isHOD && !isPrincipal) {
    // HOD: Get their department(s)
    allowedDepartmentIds = userData
      .filter(role => role.role_name === "HOD" && role.depart_id)
      .map(role => role.depart_id)
  } else if (isPrincipal) {
    // Principal: Get all departments from their institute
    if (userRole.institute) {
      const { data: instituteDepartments, error: deptError } = await supabase
        .from("departments")
        .select("id")
        .eq("institute_id", userRole.institute)
      
      if (deptError) {
        console.error("Error fetching institute departments:", deptError)
        return <div className="text-red-600">Error loading departments. Please try again later.</div>
      }
      
      allowedDepartmentIds = instituteDepartments?.map(dept => dept.id) || []
    }
  }

  if (allowedDepartmentIds.length === 0) {
    return <div className="text-yellow-600">No departments assigned to your role.</div>
  }

  // Step 2: Get all subjects from the allowed departments
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      code,
      semester,
      departments!subjects_department_id_fkey(
        id,
        name,
        abbreviation_depart,
        institutes!departments_institute_id_fkey(
          id,
          name
        )
      )
    `)
    .in("department_id", allowedDepartmentIds)

  if (subjectsError) {
    console.error("Error fetching subjects:", subjectsError)
    return <div className="text-red-600">Error loading subjects. Please try again later.</div>
  }

  if (!subjects || subjects.length === 0) {
    return <div className="text-yellow-600">No subjects found for your department(s).</div>
  }

  // Step 3: Get all subject IDs for forms lookup
  const subjectIds = subjects.map(subject => subject.id)

  // Step 4: Get all forms for these subjects
  const { data: forms, error: formsError } = await supabase
    .from("forms")
    .select(`
      *,
      users!forms_faculty_id_fkey(
        id,
        auth_id,
        name,
        email
      )
    `)
    .in("subject_id", subjectIds)

  if (formsError) {
    console.error("Error fetching forms:", formsError)
    return <div className="text-red-600">Error loading forms. Please try again later.</div>
  }

  // Step 5: Combine forms with subject data
  const formsWithSubjects = (forms || []).map(form => {
    const subject = subjects.find(sub => sub.id === form.subject_id)
    return {
      ...form,
      subjects: subject || null
    }
  }).filter(form => form.subjects !== null) // Filter out forms without valid subjects

  // Filter out forms with null/invalid data
  const validForms = formsWithSubjects.filter((form) => {
    return (
      form &&
      form.users &&
      form.users.name &&
      form.subjects &&
      form.subjects.name &&
      form.subjects.departments &&
      form.subjects.departments.name
    )
  })

  // Step 6: Get departments data for filtering dropdown
  let departmentsData: any[] = []
  if (isPrincipal && allowedDepartmentIds.length > 1) {
    // Principal: Get all their institute departments for filtering
    const { data: instituteDepartments } = await supabase
      .from("departments")
      .select("*")
      .in("id", allowedDepartmentIds)
      .order("name")

    departmentsData = instituteDepartments || []
  } else if (isHOD && !isPrincipal) {
    // HOD: Get their department(s)
    const { data: hodDepartments } = await supabase
      .from("departments")
      .select("*")
      .in("id", allowedDepartmentIds)
      .order("name")

    departmentsData = hodDepartments || []
  }

  console.log("Query Flow Results:")
  console.log("- Allowed Department IDs:", allowedDepartmentIds)
  console.log("- Subjects found:", subjects.length)
  console.log("- Forms found:", forms?.length || 0)
  console.log("- Valid forms:", validForms.length)

  return <FormsTable forms={validForms} userrole={userData} allDepartments={departmentsData} />
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
  )
}