/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server"
import FormsTable from "./forms-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

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

  const actualCiesQuery = supabase
    .from("actual_cies")
    .select(`*, users(*), subjects(*, departments(*, institutes(*)))`)
    .order("created_at", { ascending: false })

  const { data: actualCies, error: actualCiesError } = await actualCiesQuery

  if (actualCiesError) {
    console.error("Error fetching actual CIEs:", actualCiesError)
    return <div className="text-red-600">Error loading CIE forms.</div>
  }

  if (!actualCies || actualCies.length === 0) {
    return <div className="text-red-600">No CIE forms found.</div>
  }

  const filteredCies = actualCies.filter((cie) => {
    if (!cie.forms?.subjects?.departments) return false

    const cieDepartmentId = cie.forms.subjects.departments.id
    const cieInstituteId = cie.forms.subjects.departments.institute_id

    if (isHOD) {
      return departmentIds.includes(cieDepartmentId)
    } else if (isPrincipal && instituteId) {
      return cieInstituteId === instituteId
    }

    return false
  })

  const tableData = filteredCies.map((cie) => ({
    id: cie.id,
    cie_number: cie.cie_number,
    faculty_name: cie.forms?.users?.name || "Unknown",
    subject_name: cie.forms?.subjects?.name || "Unknown",
    subject_code: cie.forms?.subjects?.code || "Unknown",
    semester: cie.forms?.subjects?.semester || "Unknown",
    department_name: cie.forms?.subjects?.departments?.name || "Unknown",
    abbreviation: cie.forms?.subjects?.departments?.abbreviation_depart || "-",
    actual_date: cie.actual_date,
    actual_marks: cie.actual_marks,
    actual_duration: cie.actual_duration,
    is_submitted: cie.is_submitted,
    quality_review_completed: cie.quality_review_completed,
    created_at: cie.created_at,
    department_id: cie.forms?.subjects?.departments?.id,
  }))

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
      cies={tableData}
      userrole={userRoles}
      allDepartments={allDepartments}
      isPrincipal={isPrincipal}
      currentDepartmentIds={isHOD ? departmentIds : []}
    />
  )
}

export default async function DepartmentFormsPage() {
  return (
    <div className="mx-4 mt-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
            List of CIE Forms
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
