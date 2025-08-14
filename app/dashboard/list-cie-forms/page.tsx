/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import FormsTable from "./forms-table"

function CieFormsTableSkeleton() {
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

async function CieFormsContent() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return <div className="text-red-600">Authentication error. Please log in again.</div>
  }

  // Get user roles with department and institute info
  const { data: userRoles, error: rolesError } = await supabase
    .from("user_role")
    .select(
      `
      *,
      departments(*),
      institutes(*)
    `,
    )
    .eq("user_id", user.id)

  if (rolesError || !userRoles || userRoles.length === 0) {
    return <div className="text-red-600">No role assigned. Please contact administrator.</div>
  }

  // Determine user role
  const isPrincipal = userRoles.some((role) => role.role_name === "Principal")
  const isHOD = userRoles.some((role) => role.role_name === "HOD")

  if (!isPrincipal && !isHOD) {
    return <div className="text-red-600">You are not authorized to access this page.</div>
  }

  // Get department IDs based on role
  let departmentIds: string[] = []
  let instituteId: string | null = null

  if (isHOD) {
    // HOD: Get only their assigned departments
    departmentIds = userRoles.filter((role) => role.role_name === "HOD" && role.depart_id).map((role) => role.depart_id)
  } else if (isPrincipal) {
    // Principal: Get institute ID
    instituteId = userRoles.find((role) => role.institute)?.institute || null
  }

  if (isHOD && departmentIds.length === 0) {
    return <div className="text-red-600">No departments assigned to your HOD role.</div>
  }

  // Get subjects based on role to filter forms
  let subjectsQuery = supabase
    .from("subjects")
    .select(
      `
      id,
      name,
      code,
      semester,
      department_id,
      departments(*)
    `,
    )
    .order("name", { ascending: true })

  if (isHOD) {
    subjectsQuery = subjectsQuery.in("department_id", departmentIds)
  } else if (isPrincipal && instituteId) {
    // Get all departments in institute first
    const { data: departments, error } = await supabase.from("departments").select("id").eq("institute_id", instituteId)

    if (error || !departments) {
      return <div className="text-red-600">Error loading departments.</div>
    }
    subjectsQuery = subjectsQuery.in(
      "department_id",
      departments.map((d) => d.id),
    )
  }

  const { data: subjects, error: subjectsError } = await subjectsQuery

  if (subjectsError || !subjects || subjects.length === 0) {
    return <div className="text-red-600">No subjects found for your role.</div>
  }

  // Get forms filtered by subjects (which are already filtered by role)
  const { data: allForms, error: formsError } = await supabase
    .from("forms")
    .select(`
      id,
      faculty_id,
      subject_id,
      form,
      created_at
    `)
    .not("form", "is", null)
    .in(
      "subject_id",
      subjects.map((sub) => sub.id),
    )
    .order("created_at", { ascending: false })

  if (formsError) {
    console.error("Error fetching forms:", formsError)
    return (
      <div className="text-red-600">
        Error loading CIE forms. Please try again later.
        <p className="text-sm text-gray-500 mt-2">Error: {formsError.message}</p>
      </div>
    )
  }

  // Get user details for each form
  const formsWithUserData = []
  if (allForms && allForms.length > 0) {
    for (const form of allForms) {
      try {
        // Get user data
        const { data: userData } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", form.faculty_id)
          .single()

        // Get subject data (we already have it from subjects query)
        const subjectData = subjects.find((sub) => sub.id === form.subject_id)

        if (!subjectData) continue // Skip if subject not found (shouldn't happen)

        // Get actual CIEs count
        const { data: actualCies } = await supabase.from("actual_cies").select("id").eq("forms", form.id)

        const totalPlannedCies = form.form?.cies?.length || 0
        const totalActualCies = actualCies?.length || 0

        formsWithUserData.push({
          ...form,
          users: userData,
          subjects: {
            ...subjectData,
            departments: {
              ...subjectData.departments,
              institutes: null, // Will be populated if needed
            },
          },
          totalPlannedCies,
          totalActualCies,
          completionPercentage: totalPlannedCies > 0 ? Math.round((totalActualCies / totalPlannedCies) * 100) : 0,
        })
      } catch (error) {
        console.error("Error processing form:", form.id, error)
        // Continue with next form even if this one fails
      }
    }
  }

  // Get all departments for filter dropdown (for Principal only)
  let allDepartments: any[] = []
  if (isPrincipal && instituteId) {
    const { data: departments } = await supabase
      .from("departments")
      .select("*")
      .eq("institute_id", instituteId)
      .order("name")

    allDepartments = departments || []
  }

  return (
    <FormsTable
      forms={formsWithUserData}
      userrole={userRoles}
      allDepartments={allDepartments}
      isPrincipal={isPrincipal}
      currentDepartmentIds={isHOD ? departmentIds : []}
    />
  )
}

export default async function ListCieFormsPage() {
  return (
    <div className="mx-4 mt-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px] pl-1">
            List of CIEs Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CieFormsTableSkeleton />}>
            <CieFormsContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
