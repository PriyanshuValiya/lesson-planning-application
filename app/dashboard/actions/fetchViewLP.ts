"use server";

import { createClient } from "@/utils/supabase/server";

export const fetchViewLP = async (paramsId: string) => {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  const { data: userRoleData, error: errorUserRoleData } = await supabase
    .from("user_role")
    .select("users(*), role_name, subjects(*), departments(*, institutes(*))")
    .eq("id", paramsId)
    .single();

  if (errorUserRoleData) {
    console.error("Error fetching lesson plan:", errorUserRoleData);
    throw new Error("Failed to fetch lesson plan");
  }

  const { data: formsData, error: errorFormsData } = await supabase
    .from("forms")
    .select("*, subjects(*, departments(*)), users(*)")
    //@ts-expect-error
    .eq("faculty_id", userRoleData.users.id).eq("subject_id", userRoleData.subjects.id)
    .single();

  if (errorFormsData) {
    console.error("Error fetching user data:", errorFormsData);
    throw new Error("Failed to fetch user data");
  } 

  return {
      success: true,
      userRoleData: userRoleData,
      data: formsData,
    }
};
