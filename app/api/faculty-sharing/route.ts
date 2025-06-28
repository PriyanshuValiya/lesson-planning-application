

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

    // Get all faculty assigned to this subject from user_role table (with division)
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

    // 🔧 NEW: Check division sharing logic
    console.log("=== DIVISION ANALYSIS ===")
    userRoles.forEach((ur: any, index: number) => {
      console.log(`Faculty ${index + 1}: ${ur.users?.name} - Division: "${ur.division}"`)
    })

    // Group faculty by division
    const facultyByDivision = new Map()
    userRoles.forEach((ur: any) => {
      if (ur.division) {
        const division = ur.division
        if (!facultyByDivision.has(division)) {
          facultyByDivision.set(division, [])
        }
        facultyByDivision.get(division).push(ur)
      }
    })

    console.log("Faculty grouped by division:", Object.fromEntries(facultyByDivision))

    // Check for TRUE sharing (multiple faculty for SAME division)
    let isSharing = false
    let sharingDivision = null
    let sharingFaculty = []

    for (const [division, facultyList] of facultyByDivision) {
      console.log(`Division "${division}": ${facultyList.length} faculty`)

      if (facultyList.length > 1) {
        console.log(`✅ SHARING FOUND in division: ${division}`)
        console.log(`Faculty: ${facultyList.map((f: any) => f.users?.name).join(", ")}`)

        isSharing = true
        sharingDivision = division
        sharingFaculty = facultyList
        break // Found sharing
      }
    }

    // If no division-based sharing, fall back to simple count check
    if (!isSharing && userRoles.length > 1) {
      console.log("⚠️ Multiple faculty but different divisions - checking if we should still consider as sharing")
      // You can decide: should different divisions count as sharing?
      // For now, let's say NO - only same division = sharing
    }

    console.log("Final Is sharing:", isSharing)
    console.log("=== END DIVISION ANALYSIS ===")

    // Extract faculty information
    const allFaculty = userRoles.map((ur: any) => ({
      id: ur.users?.id,
      name: ur.users?.name,
      email: ur.users?.email,
      role: ur.role_name || "faculty",
      division: ur.division, // 🔧 NEW: Include division info
    }))

    // Find primary and secondary faculty
    let primaryFaculty = null
    let secondaryFaculty = []

    if (isSharing && sharingFaculty.length > 0) {
      // From sharing faculty only
      const primaryRole = sharingFaculty.find((sf: any) => sf.role_name === "primary")
      primaryFaculty = primaryRole?.users || sharingFaculty[0]?.users
      secondaryFaculty = sharingFaculty
        .filter((sf: any) => sf.users?.id !== primaryFaculty?.id)
        .map((sf: any) => sf.users)
    } else {
      // No sharing - first faculty as primary
      primaryFaculty = userRoles.find((ur: any) => ur.role_name === "primary")?.users || allFaculty[0]
      secondaryFaculty = userRoles.filter((ur: any) => ur.role_name !== "primary").map((ur: any) => ur.users)
    }

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
      sharingDivision, // 🔧 NEW: Which division is shared
      totalFacultyCount: userRoles.length,
      sharingFacultyCount: sharingFaculty.length,
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