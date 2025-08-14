//@ts-nocheck
import { createClient } from "@/utils/supabase/server"
import EditActualForm from "./edit-actual-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type paramsType = Promise<{ formId: string }>

async function EditActualCIE(props: { params: paramsType }) {
  const { formId } = await props.params
  const supabase = await createClient()

  // Get the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Authentication required")
  }

  const { data: userRoleData, error: errorUserRoleData } = await supabase
    .from("user_role")
    .select("users(*), role_name, subjects(*), departments(*, institutes(*))")
    .eq("id", formId)
    .single()

  if (errorUserRoleData) {
    console.error("Error fetching lesson plan:", errorUserRoleData)
    throw new Error("Failed to fetch lesson plan")
  }

  const { data: formsData, error: errorFormsData } = await supabase
    .from("forms")
    .select("*, subjects(*, departments(*)), users(*)")
    //@ts-expect-error
    .eq("faculty_id", userRoleData.users.id)
    .eq("subject_id", userRoleData.subjects.id)
    .single()

  if (errorFormsData) {
    console.error("Error fetching user data:", errorFormsData)
    throw new Error("Failed to fetch user data")
  }

  // Fetch existing actual CIE data
  const { data: actualCiesData, error: actualCiesError } = await supabase
    .from("actual_cies")
    .select("*")
    .eq("forms", formsData.id)

  if (actualCiesError) {
    console.error("Error fetching actual CIEs:", actualCiesError)
  }

  // Fetch department_pso_peo data for PSO mapping
  const { data: departmentPsoPeoData, error: departmentPsoPeoError } = await supabase
    .from("department_pso_peo")
    .select("pso_data")
    .eq("department_id", userRoleData?.subjects?.department_id)
    .single()

  if (departmentPsoPeoError) {
    console.error("Error fetching department PSO/PEO data:", departmentPsoPeoError)
  }

  return (
    <div className="mx-4 my-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px] ">
            Actual CIEs Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditActualForm
            formsData={formsData}
            actualCiesData={actualCiesData || []}
            userRoleData={userRoleData}
            departmentPsoPeoData={departmentPsoPeoData || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default EditActualCIE
