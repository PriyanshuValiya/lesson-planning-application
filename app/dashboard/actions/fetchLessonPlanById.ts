// "use server"

// import { createClient } from "@/utils/supabase/server"

// export const fetchLessonPlanById = async (id: string) => {
//   const supabase = await createClient()

//   const { data, error } = await supabase
//     .from("lesson_plans")
//     .select(`
//       id,
//       faculty_id,
//       subject_id,
//       academic_year,
//       division,
//       status,
//       created_at,
//       updated_at,
//       subjects(
//         id,
//         code,
//         name,
//         semester,
//         lecture_hours,
//         lab_hours,
//         abbreviation_name,
//         credits,
//         is_practical,
//         is_theory
//       ),
//       lesson_plan_topics(
//         id,
//         title,
//         description,
//         hours,
//         order,
//         is_completed
//       )
//     `)
//     .eq("id", id)
//     .single()

//   if (error) {
//     console.error("Error fetching lesson plan:", error)
//     throw new Error(`Failed to fetch lesson plan: ${error.message}`)
//   }

//   return data
// }

"use server"

import { createClient } from "@/utils/supabase/server"

export async function fetchLessonPlanById(lessonPlanId: string) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    // Find the user record in the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("auth_id", user.id)
      .single()

    if (userError || !userData) {
      // Try finding by email as fallback
      if (user.email) {
        const { data: userByEmail, error: emailError } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("email", user.email)
          .single()

        if (emailError || !userByEmail) {
          throw new Error("User not found in database")
        }

        const userData = userByEmail
      } else {
        throw new Error("User not found in database")
      }
    }

    // Get the user role assignment for this lesson plan
    const { data: assignment, error: assignmentError } = await supabase
      .from("user_role")
      .select(`
        *,
        subjects (*),
        users (*)
      `)
      .eq("id", lessonPlanId)
      .single()

    if (assignmentError || !assignment) {
      throw new Error("Assignment not found")
    }

    // Get existing form data
    const { data: existingForm, error: formError } = await supabase
      .from("forms")
      .select("form")
      .eq("faculty_id", userData.id)
      .eq("subject_id", assignment.subjects.id)
      .single()

    // Get lesson plan data
    const { data: lessonPlanData, error: lessonPlanError } = await supabase
      .from("lesson_plans")
      .select("*")
      .eq("subject_id", assignment.subjects.id)
      .eq("faculty_id", userData.id)
      .single()

    // Check for faculty sharing
    const { data: sharingFaculty, error: sharingError } = await supabase
      .from("user_role")
      .select(`
        *,
        users (*)
      `)
      .eq("subject_id", assignment.subjects.id)
      .eq("role_name", "Faculty")

    const isSharing = sharingFaculty && sharingFaculty.length > 1
    const allFaculty =
      sharingFaculty?.map((sf) => ({
        id: sf.users.id,
        name: sf.users.name,
        email: sf.users.email,
      })) || []

    // Extract saved form data
    const savedFormData = existingForm?.form || {}
    const generalDetails = savedFormData.generalDetails || {}
    const units = savedFormData.units || []
    const practicals = savedFormData.practicals || []
    const cies = savedFormData.cies || []
    const additionalInfo = savedFormData.additionalInfo || {}

    // Construct the lesson plan object with saved data
    const lessonPlan = {
      id: lessonPlanData?.id || lessonPlanId,
      subject: {
        id: assignment.subjects.id,
        code: assignment.subjects.code,
        name: assignment.subjects.name,
        semester: assignment.subjects.semester,
        lecture_hours: assignment.subjects.lecture_hours,
        lab_hours: assignment.subjects.lab_hours,
        abbreviation_name: assignment.subjects.abbreviation_name,
        credits: assignment.subjects.credits,
        is_theory: assignment.subjects.is_theory,
        is_practical: assignment.subjects.is_practical,
        department: {
          id: assignment.subjects.department_id,
          name: "Computer Science and Engineering",
          abbreviation_depart: "CSE",
        },
      },
      faculty: {
        id: assignment.users.id,
        name: assignment.users.name,
        email: assignment.users.email,
      },
      academic_year: assignment.academic_year || "2025",
      division: generalDetails.division || assignment.division || "Division 1",
      term_start_date: generalDetails.term_start_date || lessonPlanData?.term_start_date || "2024-12-10",
      term_end_date: generalDetails.term_end_date || lessonPlanData?.term_end_date || "2025-05-30",
      course_prerequisites: generalDetails.course_prerequisites || "",
      course_prerequisites_materials: generalDetails.course_prerequisites_materials || "",
      courseOutcomes: generalDetails.courseOutcomes || [],
      units: units,
      practicals: practicals,
      cies: cies,
      additional_info: additionalInfo,
      unit_remarks: savedFormData.unit_remarks || "",
      practical_remarks: savedFormData.practical_remarks || "",
      cie_remarks: savedFormData.cie_remarks || "",
      status: lessonPlanData?.status || assignment.status || "Draft",
      is_sharing: isSharing,
      sharing_faculty: allFaculty,
      general_details_completed: lessonPlanData?.general_details_completed || false,
      unit_planning_completed: lessonPlanData?.unit_planning_completed || false,
      practical_planning_completed: lessonPlanData?.practical_planning_completed || false,
      cie_planning_completed: lessonPlanData?.cie_planning_completed || false,
      additional_info_completed: lessonPlanData?.additional_info_completed || false,
    }

    return {
      success: true,
      data: lessonPlan,
    }
  } catch (error) {
    console.error("Error fetching lesson plan:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch lesson plan",
    }
  }
}
