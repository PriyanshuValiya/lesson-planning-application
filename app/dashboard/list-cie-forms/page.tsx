
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FormsTable from "./forms-table"

export default async function ListCieFormsPage() {
  const supabase = await createClient()

  try {
    // Simple query to get all forms with CIEs - no role restrictions
    // Removed updated_at column since it doesn't exist
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
      .order("created_at", { ascending: false })

    if (formsError) {
      console.error("Error fetching forms:", formsError)
      return (
        <div className="mx-4 mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Unable to load CIE forms. Please try again later.</p>
              <p className="text-sm text-gray-500 mt-2">Error: {formsError.message}</p>
            </CardContent>
          </Card>
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

          // Get subject data
          const { data: subjectData } = await supabase
            .from("subjects")
            .select(`
              id,
              name,
              code,
              semester,
              department_id
            `)
            .eq("id", form.subject_id)
            .single()

          // Get department data
          let departmentData = null
          if (subjectData?.department_id) {
            const { data: deptData } = await supabase
              .from("departments")
              .select(`
                id,
                name,
                abbreviation_depart,
                institute_id
              `)
              .eq("id", subjectData.department_id)
              .single()
            departmentData = deptData
          }

          // Get institute data
          let instituteData = null
          if (departmentData?.institute_id) {
            const { data: instData } = await supabase
              .from("institutes")
              .select("id, name, abbreviation_insti")
              .eq("id", departmentData.institute_id)
              .single()
            instituteData = instData
          }

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
                ...departmentData,
                institutes: instituteData,
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

    return (
      <div className="mx-4 mt-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
              List of CIE Forms
            </CardTitle>
            <div className="text-sm text-gray-600 mt-2">Total Forms: {formsWithUserData.length}</div>
          </CardHeader>
          <CardContent>
            <FormsTable forms={formsWithUserData} isPrincipal={true} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return (
      <div className="mx-4 mt-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Unexpected Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>An unexpected error occurred. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
