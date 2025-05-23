"use server"

import { createClient } from "@/utils/supabase/server"

export const fetchFacultySubjects = async (userId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_role")
    .select(`
      id,
      user_id,
      role_name,
      depart_id,
      subject_id,
      academic_year,
      division,
      departments:depart_id(
        id,
        name,
        abbreviation_depart,
        institutes:institute_id(
          id,
          name,
          abbreviation_insti
        )
      ),
      subjects:subject_id(
        id,
        code,
        name,
        semester,
        lecture_hours,
        lab_hours,
        abbreviation_name,
        credits,
        is_practical,
        is_theory
      )
    `)
    .eq("user_id", userId)
    .eq("role_name", "Faculty")
    .not("subject_id", "is", null)

  if (error) {
    console.error("Error fetching faculty subjects:", error)
    return []
  }

  return data || []
}
