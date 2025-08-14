/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server"
import ViewActualCie from "./view-actual-cie"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type paramsType = Promise<{ formId: string }>

export default async function ViewActualCiePage(props: { params: paramsType }) {
  const { formId } = await props.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Authentication Required")
  }

  // Try both approaches and see which one works
  let userRoleData = null
  let formData = null
  let allCie = null
  let departmentPsoPeoData = null

  // First, try the UUID approach (for user_role table)
  try {
    const { data: userRoleResult, error: userRoleError } = await supabase
      .from("user_role")
      .select("users(*), role_name, subjects(*), departments(*, institutes(*))")
      .eq("id", formId)
      .single()

    if (!userRoleError && userRoleResult) {
      console.log("Successfully fetched using user_role approach")
      userRoleData = userRoleResult

      // Get forms data
      const { data: allForms, error: allFormsError } = await supabase
        .from("forms")
        .select("form, id")
        .eq("faculty_id", userRoleData.users.id)
        .eq("subject_id", userRoleData.subjects.id)

      if (!allFormsError && allForms && allForms.length > 0) {
        formData = allForms[0]

        // Get CIE data
        const { data: cieResult, error: cieError } = await supabase
          .from("actual_cies")
          .select("*")
          .eq("forms", formData.id)
          .order("cie_number", { ascending: true })

        if (!cieError) {
          allCie = cieResult || []
        }

        // Get department PSO/PEO data
        const { data: psoPeoResult, error: psoPeoError } = await supabase
          .from("department_pso_peo")
          .select("pso_data")
          .eq("department_id", userRoleData?.subjects?.department_id)
          .single()

        if (!psoPeoError) {
          departmentPsoPeoData = psoPeoResult
        }
      }
    }
  } catch (error) {
    console.log("User role approach failed, trying forms approach")
  }

  // If user_role approach didn't work, try the forms approach
  if (!userRoleData) {
    try {
      // Try parsing as integer for forms.id
      const formIdAsInt = Number.parseInt(formId, 10)
      if (!isNaN(formIdAsInt)) {
        const { data: formResult, error: formError } = await supabase
          .from("forms")
          .select("id, faculty_id, subject_id, form")
          .eq("id", formIdAsInt)
          .single()

        if (!formError && formResult) {
          console.log("Successfully fetched using forms approach with integer")
          formData = formResult

          // Get user data
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("id", formData.faculty_id)
            .single()

          // Get subject data
          const { data: subjectData, error: subjectError } = await supabase
            .from("subjects")
            .select("id, name, code, semester, department_id")
            .eq("id", formData.subject_id)
            .single()

          // Get department data
          let departmentData = null
          if (subjectData?.department_id) {
            const { data: deptData, error: deptError } = await supabase
              .from("departments")
              .select("id, name, abbreviation_depart, institute_id")
              .eq("id", subjectData.department_id)
              .single()

            if (!deptError) {
              departmentData = deptData
            }
          }

          // Get institute data
          let instituteData = null
          if (departmentData?.institute_id) {
            const { data: instData, error: instError } = await supabase
              .from("institutes")
              .select("id, name, abbreviation_insti")
              .eq("id", departmentData.institute_id)
              .single()

            if (!instError) {
              instituteData = instData
            }
          }

          // Get CIE data
          const { data: cieResult, error: cieError } = await supabase
            .from("actual_cies")
            .select("*")
            .eq("forms", formIdAsInt)
            .order("cie_number", { ascending: true })

          if (!cieError) {
            allCie = cieResult || []
          }

          // Get department PSO/PEO data
          const { data: psoPeoResult, error: psoPeoError } = await supabase
            .from("department_pso_peo")
            .select("pso_data")
            .eq("department_id", subjectData?.department_id)
            .single()

          if (!psoPeoError) {
            departmentPsoPeoData = psoPeoResult
          }

          // Create userRoleData structure
          userRoleData = {
            users: userData || {},
            subjects: {
              ...(subjectData || {}),
              departments: {
                ...(departmentData || {}),
                institutes: instituteData || {},
              },
            },
            departments: {
              ...(departmentData || {}),
              institutes: instituteData || {},
            },
          }
        }
      }
    } catch (error) {
      console.log("Forms approach also failed")
    }
  }

  // If still no data, try forms approach with UUID
  if (!userRoleData) {
    try {
      const { data: formResult, error: formError } = await supabase
        .from("forms")
        .select("id, faculty_id, subject_id, form")
        .eq("id", formId)
        .single()

      if (!formError && formResult) {
        console.log("Successfully fetched using forms approach with UUID")
        formData = formResult

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", formData.faculty_id)
          .single()

        // Get subject data
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("id, name, code, semester, department_id")
          .eq("id", formData.subject_id)
          .single()

        // Get department data
        let departmentData = null
        if (subjectData?.department_id) {
          const { data: deptData, error: deptError } = await supabase
            .from("departments")
            .select("id, name, abbreviation_depart, institute_id")
            .eq("id", subjectData.department_id)
            .single()

          if (!deptError) {
            departmentData = deptData
          }
        }

        // Get institute data
        let instituteData = null
        if (departmentData?.institute_id) {
          const { data: instData, error: instError } = await supabase
            .from("institutes")
            .select("id, name, abbreviation_insti")
            .eq("id", departmentData.institute_id)
            .single()

          if (!instError) {
            instituteData = instData
          }
        }

        // Get CIE data
        const { data: cieResult, error: cieError } = await supabase
          .from("actual_cies")
          .select("*")
          .eq("forms", formId)
          .order("cie_number", { ascending: true })

        if (!cieError) {
          allCie = cieResult || []
        }

        // Get department PSO/PEO data
        const { data: psoPeoResult, error: psoPeoError } = await supabase
          .from("department_pso_peo")
          .select("pso_data")
          .eq("department_id", subjectData?.department_id)
          .single()

        if (!psoPeoError) {
          departmentPsoPeoData = psoPeoResult
        }

        // Create userRoleData structure
        userRoleData = {
          users: userData || {},
          subjects: {
            ...(subjectData || {}),
            departments: {
              ...(departmentData || {}),
              institutes: instituteData || {},
            },
          },
          departments: {
            ...(departmentData || {}),
            institutes: instituteData || {},
          },
        }
      }
    } catch (error) {
      console.log("All approaches failed")
    }
  }

  // If we still don't have data, show error
  if (!userRoleData || !formData) {
    return (
      <div className="mx-4 mt-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to fetch data. Please try again.</p>
            <p className="text-sm text-gray-500 mt-2">Form ID: {formId}</p>
            <p className="text-sm text-gray-500">
              Tried multiple approaches but none worked. Please check the database schema.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  function getOrdinalParts(n: number): [number, string] {
    const suffixes = ["th", "st", "nd", "rd"]
    const v = n % 100
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
    return [n, suffix]
  }

  const semester = userRoleData?.subjects?.semester || 1
  const [semNum, semSuffix] = getOrdinalParts(semester)

  if (!allCie || allCie.length === 0) {
    return (
      <div className="mx-4 mt-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
              View Actual CIEs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold w-full text-base mt-2">
              {userRoleData?.users?.name || "Unknown Faculty"} │ {userRoleData?.subjects?.name || "Unknown Subject"} │{" "}
              {userRoleData?.subjects?.code || "N/A"} │ {userRoleData?.departments?.abbreviation_depart || "UNK"} │
              <span>
                {semNum}
                <sup className=" text-[0.6rem] align-super">{semSuffix} </sup>
                Sem
              </span>
            </div>
            <div className="mt-4">
              <p>No Actual Implementation Record for this CIE</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="m-4 mt-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
            View Actual CIEs
          </CardTitle>
          <div className="font-semibold w-full text-base mt-2">
            {userRoleData?.users?.name || "Unknown Faculty"} │ {userRoleData?.subjects?.name || "Unknown Subject"} │{" "}
            {userRoleData?.subjects?.code || "N/A"} │ {userRoleData?.departments?.abbreviation_depart || "UNK"} │
            <span>
              {semNum}
              <sup className=" text-[0.6rem] align-super">{semSuffix} </sup>
              Sem
            </span>
          </div>

          <div className="font-semibold w-full text-red-700 text-base mt-2">
            <p>
              Total Actual CIEs : {allCie?.length || 0} / {formData?.form?.cies?.length || 0}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ViewActualCie
            formsData={formData}
            actualCieData={allCie || []}
            userRoleData={userRoleData}
            departmentPsoPeoData={departmentPsoPeoData || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
