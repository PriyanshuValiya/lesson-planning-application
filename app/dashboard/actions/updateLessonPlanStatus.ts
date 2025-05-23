"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export const updateLessonPlanStatus = async (lessonPlanId: string, status: "active" | "completed") => {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("lesson_plans")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonPlanId)

    if (error) {
      console.error("Error updating lesson plan status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/lesson-plans")
    revalidatePath(`/dashboard/lesson-plans/${lessonPlanId}`)

    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating lesson plan status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
