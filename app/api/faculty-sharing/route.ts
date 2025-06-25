import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get("subjectId")

    if (!subjectId) {
      return NextResponse.json({
        success: false,
        error: "Subject ID is required",
        isSharing: false,
        allFaculty: [],
        primaryFaculty: null,
        secondaryFaculty: [],
      })
    }

    const supabase = await createClient()

    console.log("=== API DEBUG ===")
    console.log("Checking faculty sharing for subject ID:", subjectId)

    // Get all faculty assigned to this subject from user_role table
    const { data: userRoles, error: userRoleError } = await supabase
      .from("user_role")
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        ),
        subjects:subject_id (
          id,
          name,
          semester
        )
      `)
      .eq("subject_id", subjectId)

    console.log("User roles query result:", userRoles)
    console.log("User roles query error:", userRoleError)

    if (userRoleError) {
      console.error("Error fetching user roles:", userRoleError)
      return NextResponse.json({
        success: false,
        error: "Failed to fetch faculty assignments",
        isSharing: false,
        allFaculty: [],
        primaryFaculty: null,
        secondaryFaculty: [],
      })
    }

    if (!userRoles || userRoles.length === 0) {
      console.log("No faculty assignments found for subject")
      return NextResponse.json({
        success: true,
        isSharing: false,
        allFaculty: [],
        primaryFaculty: null,
        secondaryFaculty: [],
      })
    }

    // Check if multiple faculty are assigned
    const isSharing = userRoles.length > 1
    console.log("Is sharing:", isSharing, "Faculty count:", userRoles.length)

    // Extract faculty information
    const allFaculty = userRoles.map((ur: any) => ({
      id: ur.users?.id,
      name: ur.users?.name,
      email: ur.users?.email,
      role: ur.role_name || "faculty",
    }))

    // Find primary and secondary faculty (assuming first one is primary if no specific role)
    const primaryFaculty = userRoles.find((ur: any) => ur.role_name === "primary")?.users || allFaculty[0]
    const secondaryFaculty = userRoles.filter((ur: any) => ur.role_name !== "primary").map((ur: any) => ur.users)

    console.log("All Faculty:", allFaculty)
    console.log("Primary Faculty:", primaryFaculty)
    console.log("Secondary Faculty:", secondaryFaculty)
    console.log("Subject Info:", userRoles[0]?.subjects)
    console.log("=== END API DEBUG ===")

    return NextResponse.json({
      success: true,
      isSharing,
      allFaculty,
      primaryFaculty,
      secondaryFaculty,
      subjectInfo: userRoles[0]?.subjects,
    })
  } catch (error) {
    console.error("Unexpected error in faculty-sharing API:", error)
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      isSharing: false,
      allFaculty: [],
      primaryFaculty: null,
      secondaryFaculty: [],
    })
  }
}
