
//@ts-nocheck
//@ts-ignore
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Copy, X, RefreshCw } from "lucide-react"
import Link from "next/link"
import GeneralDetailsForm from "@/components/lesson-plan/GeneralDetailsForm"
import UnitPlanningForm from "@/components/lesson-plan/UnitPlanningForm"
import PracticalPlanningForm from "@/components/lesson-plan/PracticalPlanningForm"
import CIEPlanningForm from "@/components/lesson-plan/CIEPlanningForm"
import AdditionalInfoForm from "@/components/lesson-plan/AdditionalInfoForm"
import { toast } from "sonner"
import { useDashboardContext } from "@/context/DashboardContext"
import { isSubjectTheoryOnly, isSubjectPracticalOnly, isSubjectBoth } from "@/utils/dateUtils"
import { fetchLessonPlanById } from "@/app/dashboard/actions/fetchLessonPlanById"
import { loadFormDraft } from "@/app/dashboard/actions/saveFormDraft"
import { supabase } from "@/utils/supabase/client"

export default function EditLessonPlanPage() {
  const router = useRouter()
  const params = useParams()
  const { userData } = useDashboardContext()
  const [activeTab, setActiveTab] = useState("general-details")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lessonPlan, setLessonPlan] = useState<any>(null)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [pdfFile, setPdfFile] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)

  // 🔧 OPTIMIZED: Enhanced state management for same subject code logic
  const [commonSubject, setCommonSubject] = useState<any>([])
  const [isLoadingCommonSubjects, setIsLoadingCommonSubjects] = useState(false)
  const [commonSubjectsError, setCommonSubjectsError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Helper function to safely convert faculty object to string
  const getFacultyName = (faculty: any): string => {
    if (!faculty) return "Unknown Faculty"
    if (typeof faculty === "string") return faculty
    if (faculty.name && typeof faculty.name === "string") return faculty.name
    if (faculty.first_name || faculty.last_name) {
      return `${faculty.first_name || ""} ${faculty.last_name || ""}`.trim() || "Unknown Faculty"
    }
    return "Unknown Faculty"
  }

  // Helper function to clean lesson plan data
  const cleanLessonPlanData = (data: any) => {
    if (!data) return null

    return {
      ...data,
      // Clean faculty data
      faculty: data.faculty
        ? {
            ...data.faculty,
            name: getFacultyName(data.faculty),
          }
        : null,
      // Clean sharing faculty array
      sharing_faculty: Array.isArray(data.sharing_faculty)
        ? data.sharing_faculty.map((faculty: any) => ({
            ...faculty,
            name: getFacultyName(faculty),
          }))
        : [],
      // Clean practicals if they exist
      practicals: Array.isArray(data.practicals)
        ? data.practicals.map((practical: any) => ({
            ...practical,
            faculty_name: practical.faculty_name ? String(practical.faculty_name) : undefined,
          }))
        : [],
    }
  }

  // Helper function to check if a string is a UUID
  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // Helper function to convert UUID to unit name
  const convertUUIDToUnitName = (unitId: string, units: any[]) => {
    if (!isUUID(unitId)) return unitId // Already a name

    const unit = (units || []).find((u: any) => u.id === unitId)
    if (unit) {
      return unit.unit_name || `Unit ${(units || []).findIndex((u: any) => u.id === unitId) + 1}`
    }
    return unitId // Fallback to original if not found
  }

  // 🔧 ENHANCED: Function to merge lesson plan with draft data (CIE + Practical)
  const mergeLessonPlanWithDrafts = async (baseLessonPlan: any) => {
    if (!baseLessonPlan || !userData?.id) return baseLessonPlan

    const facultyId = baseLessonPlan.faculty?.id || userData.id
    const subjectId = baseLessonPlan.subject?.id

    if (!facultyId || !subjectId) return baseLessonPlan

    console.log("🔄 EDIT PAGE: Checking for draft data to merge...")

    try {
      let draftLoadedCount = 0

      // 1. Check for CIE planning draft
      const cieDraftResult = await loadFormDraft(facultyId, subjectId, "cie_planning")

      if (cieDraftResult.success && cieDraftResult.data?.cies) {
        console.log("✅ EDIT PAGE: Found CIE draft data, merging...")

        // Merge CIE draft data with lesson plan
        baseLessonPlan.cies = cieDraftResult.data.cies
        baseLessonPlan.cie_remarks = cieDraftResult.data.remarks || baseLessonPlan.cie_remarks

        draftLoadedCount++
        console.log(`📝 CIE Draft: ${cieDraftResult.data.cies.length} CIE(s) loaded`)
      }

      // 2. 🔧 NEW: Check for Practical planning draft
      const practicalDraftResult = await loadFormDraft(facultyId, subjectId, "practical_planning")

      if (practicalDraftResult.success && practicalDraftResult.data?.practicals) {
        console.log("✅ EDIT PAGE: Found Practical draft data, merging...")

        const draftPracticals = practicalDraftResult.data.practicals

        // Convert UUID unit references to unit names if needed
        const validPracticals = draftPracticals.map((practical: any, index: number) => {
          const convertedUnits = (practical.associated_units || []).map((unit: string) =>
            convertUUIDToUnitName(unit, baseLessonPlan.units || []),
          )

          return {
            ...practical,
            id: practical.id || `practical${index + 1}`,
            practical_aim: practical.practical_aim || "",
            associated_units: convertedUnits,
            probable_week: practical.probable_week || "",
            lab_hours: typeof practical.lab_hours === "number" ? practical.lab_hours : 2,
            software_hardware_requirements: practical.software_hardware_requirements || "",
            practical_tasks: practical.practical_tasks || "",
            evaluation_methods: Array.isArray(practical.evaluation_methods) ? practical.evaluation_methods : [],
            other_evaluation_method: practical.other_evaluation_method || "",
            practical_pedagogy: practical.practical_pedagogy || "",
            other_pedagogy: practical.other_pedagogy || "",
            reference_material: practical.reference_material || "",
            co_mapping: Array.isArray(practical.co_mapping) ? practical.co_mapping : [],
            pso_mapping: Array.isArray(practical.pso_mapping) ? practical.pso_mapping : [],
            peo_mapping: Array.isArray(practical.peo_mapping) ? practical.peo_mapping : [],
            blooms_taxonomy: Array.isArray(practical.blooms_taxonomy) ? practical.blooms_taxonomy : [],
            skill_mapping: Array.isArray(practical.skill_mapping) ? practical.skill_mapping : [],
            skill_objectives: practical.skill_objectives || "",
            assigned_faculty_id: practical.assigned_faculty_id || userData?.id || null,
          }
        })

        // Merge Practical draft data with lesson plan
        baseLessonPlan.practicals = validPracticals
        baseLessonPlan.practical_remarks = practicalDraftResult.data.remarks || baseLessonPlan.practical_remarks

        draftLoadedCount++
        console.log(`📝 Practical Draft: ${validPracticals.length} practical(s) loaded`)
      }

      // 3. Show consolidated toast message
      if (draftLoadedCount > 0) {
        const draftTypes = []
        if (cieDraftResult.success && cieDraftResult.data?.cies) draftTypes.push("CIE Planning")
        if (practicalDraftResult.success && practicalDraftResult.data?.practicals) draftTypes.push("Practical Planning")

        toast.info(`Draft data loaded`)
      }

      // You can add other draft types here if needed
      // const unitDraftResult = await loadFormDraft(facultyId, subjectId, "unit_planning")
      // const additionalDraftResult = await loadFormDraft(facultyId, subjectId, "additional_info")
    } catch (error) {
      console.error("🔄 EDIT PAGE: Error loading draft data:", error)
    }

    return baseLessonPlan
  }

  // 🔧 OPTIMIZED: Enhanced loadCopyLP with retry logic and better error handling
  const loadCopyLP = async (forceRetry = false) => {
    // Enhanced validation checks
    if (!lessonPlan?.subject?.code) {
      console.log("❌ No subject code found, skipping loadCopyLP")
      return
    }

    if (!userData?.id) {
      console.log("❌ No userData found, skipping loadCopyLP")
      return
    }

    if (isLoadingCommonSubjects && !forceRetry) {
      console.log("⏳ Already loading common subjects, skipping")
      return
    }

    try {
      setIsLoadingCommonSubjects(true)
      setCommonSubjectsError(null)

      console.log("🔍 OPTIMIZED: Searching for subject code:", lessonPlan.subject.code)
      console.log("🔍 Current user ID:", userData.id)
      console.log("🔍 Current lesson plan ID:", lessonPlan.id)

      // Step 1: Find all subjects with the same code across departments
      const { data: allSubjectsWithCode, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, code, name, department_id")
        .eq("code", lessonPlan.subject.code)

      if (subjectsError) {
        console.error("❌ Error fetching subjects:", subjectsError)
        setCommonSubjectsError("Failed to fetch subjects")
        return
      }

      console.log("📊 Found subjects with same code:", allSubjectsWithCode?.length || 0)

      if (!allSubjectsWithCode || allSubjectsWithCode.length <= 1) {
        console.log("ℹ️ No other subjects found with code:", lessonPlan.subject.code)
        setCommonSubject([])
        return
      }

      // Step 2: Get all subject IDs
      const subjectIds = allSubjectsWithCode.map((subject) => subject.id)
      console.log("🎯 Subject IDs to check:", subjectIds)

      // Step 3: Find faculty assigned to any of these subjects
      const { data: facultyWithSubjects, error: facultyError } = await supabase
        .from("user_role")
        .select("*, users(*), subjects(*), departments(*)")
        .in("subject_id", subjectIds)
        .eq("role_name", "Faculty") // Only get faculty roles

      if (facultyError) {
        console.error("❌ Error fetching faculty:", facultyError)
        setCommonSubjectsError("Failed to fetch faculty")
        return
      }

      console.log("👥 Found faculty assignments:", facultyWithSubjects?.length || 0)

      if (facultyWithSubjects && facultyWithSubjects.length > 0) {
        // Filter out current lesson plan and ensure we have valid data
        const validFaculty = facultyWithSubjects.filter(
          (faculty) =>
            faculty.id !== lessonPlan.id &&
            faculty.users &&
            faculty.subjects &&
            faculty.departments &&
            faculty.users.id !== userData.id, // Exclude current user
        )

        console.log("✅ Valid faculty for copying:", validFaculty.length)

        if (validFaculty.length > 0) {
          setCommonSubject(validFaculty)
          // console.log("🎉 Copy button should now appear!")

          // Show success message on first load (not on retry)
          if (!forceRetry && retryCount === 0) {
            // toast.success(`Found ${validFaculty.length} other faculty with same subject code`)
          }
        } else {
          console.log("⚠️ No valid faculty found for copying")
          setCommonSubject([])
        }
      } else {
        console.log("❌ No faculty assignments found")
        setCommonSubject([])
      }

      // Reset retry count on success
      setRetryCount(0)
    } catch (error) {
      console.error("💥 Error in loadCopyLP:", error)
      setCommonSubjectsError(error instanceof Error ? error.message : "Unknown error")
      setCommonSubject([])
    } finally {
      setIsLoadingCommonSubjects(false)
    }
  }

  // Fetch actual lesson plan data
  useEffect(() => {
    const loadLessonPlan = async () => {
      try {
        setIsLoading(true)
        const result = await fetchLessonPlanById(params.id as string)

        if (result.success) {
          // Clean the data before setting it
          let cleanedData = cleanLessonPlanData(result.data)

          // 🔧 ENHANCED: Merge with draft data (CIE + Practical)
          cleanedData = await mergeLessonPlanWithDrafts(cleanedData)

          setLessonPlan(cleanedData)
        } else {
          toast.error(result.error || "Failed to load lesson plan")
        }
      } catch (error) {
        console.error("Error loading lesson plan:", error)
        toast.error("Failed to load lesson plan")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id && userData?.id) {
      loadLessonPlan()
    }
  }, [params.id, userData?.id])

  // 🔧 OPTIMIZED: Enhanced useEffect with better dependency management and retry logic
  useEffect(() => {
    // Add delay to ensure all data is loaded
    const timer = setTimeout(() => {
      if (lessonPlan?.subject?.code && userData?.id && !isLoading) {
        console.log("🚀 Triggering loadCopyLP from useEffect")
        loadCopyLP()
      }
    }, 500) // 500ms delay to ensure everything is loaded

    return () => clearTimeout(timer)
  }, [lessonPlan?.subject?.code, userData?.id, isLoading]) // Better dependencies

  // 🔧 NEW: Manual retry function
  const handleRetryLoadCommonSubjects = () => {
    setRetryCount((prev) => prev + 1)
    console.log(`🔄 Manual retry attempt #${retryCount + 1}`)
    loadCopyLP(true)
  }

  const handleSave = async () => {
    setIsSaving(true)

    // This would be replaced with an actual API call
    setTimeout(() => {
      toast.success("Lesson plan saved successfully")
      setIsSaving(false)
    }, 1500)
  }

  // 🎯 ENHANCED: Combined copy functionality for BOTH shared subjects AND same subject code
  const handleCopy = async () => {
    try {
      setIsCopying(true)
      console.log("🔄 Starting copy process...")

      // 🔧 ENHANCED: Handle BOTH shared subjects AND same subject code
      const isSharedSubject =
        lessonPlan?.is_sharing && lessonPlan?.sharing_faculty && lessonPlan.sharing_faculty.length > 0
      const hasSameSubjectCode = commonSubject.length >= 2

      console.log("🔍 Copy conditions:")
      console.log("  - Is shared subject:", isSharedSubject)
      console.log("  - Has same subject code:", hasSameSubjectCode)

      const allForms = []

      // 1. 🔧 PRIORITY 1: Check shared faculty first (if it's a shared subject)
      if (isSharedSubject) {
        console.log("🤝 Processing shared subject...")
        const currentSubjectId = lessonPlan.subject.id
        const currentFacultyId = lessonPlan.faculty.id

        for (const sharedFaculty of lessonPlan.sharing_faculty) {
          if (sharedFaculty.id !== currentFacultyId) {
            console.log(`📋 Checking shared faculty: ${sharedFaculty.name}`)

            const { data: formData, error: formError } = await supabase
              .from("forms")
              .select("*")
              .eq("faculty_id", sharedFaculty.id)
              .eq("subject_id", currentSubjectId)

            if (!formError && formData && formData.length > 0) {
              const form = formData[0]

              // Count completion flags
              let completionCount = 0
              if (form.complete_general) completionCount++
              if (form.complete_unit) completionCount++
              if (form.complete_practical) completionCount++
              if (form.complete_cie) completionCount++
              if (form.complete_additional) completionCount++

              console.log(`    ✅ Shared faculty form - ${completionCount}/5 sections complete`)

              if (form.form && completionCount > 0) {
                allForms.push({
                  faculty: sharedFaculty,
                  department: { name: "Same Department" }, // Shared subjects are same department
                  subject: lessonPlan.subject,
                  formData: form.form,
                  trueCount: completionCount,
                  completionFlags: {
                    general: form.complete_general,
                    unit: form.complete_unit,
                    practical: form.complete_practical,
                    cie: form.complete_cie,
                    additional: form.complete_additional,
                  },
                  source: "shared_faculty",
                })
              }
            }
          }
        }
      }

      // 2. 🔧 PRIORITY 2: Check same subject code faculty (if available and no shared data found)
      if (hasSameSubjectCode && allForms.length === 0) {
        console.log("🔍 Processing same subject code...")

        for (const subject of commonSubject) {
          if (subject.id !== lessonPlan.id) {
            console.log(
              `📋 Checking same code faculty: ${subject.users.name} - ${subject.subjects.name} (${subject.departments.name})`,
            )

            const { data: formData, error: formError } = await supabase
              .from("forms")
              .select(
                `
                *,
                complete_general,
                complete_unit,
                complete_practical,
                complete_cie,
                complete_additional,
                users(*),
                subjects(*, departments(*))
              `,
              )
              .eq("faculty_id", subject.users.id)
              .eq("subject_id", subject.subjects.id)

            if (!formError && formData && formData.length > 0) {
              const form = formData[0]

              // Count TRUE flags in completion columns
              let trueCount = 0
              if (form.complete_general === true) trueCount++
              if (form.complete_unit === true) trueCount++
              if (form.complete_practical === true) trueCount++
              if (form.complete_cie === true) trueCount++
              if (form.complete_additional === true) trueCount++

              console.log(`    ✅ Same code form - ${trueCount}/5 TRUE flags`)

              if (form.form && trueCount > 0) {
                allForms.push({
                  faculty: subject.users,
                  department: subject.departments,
                  subject: subject.subjects,
                  formData: form.form,
                  trueCount: trueCount,
                  completionFlags: {
                    general: form.complete_general,
                    unit: form.complete_unit,
                    practical: form.complete_practical,
                    cie: form.complete_cie,
                    additional: form.complete_additional,
                  },
                  source: "same_subject_code",
                })
              }
            }
          }
        }
      }

      if (allForms.length === 0) {
        if (isSharedSubject) {
          toast.warning("No completed lesson plan data found from shared faculty members")
        } else if (hasSameSubjectCode) {
          toast.warning("No completed lesson plan data found from faculty with same subject code")
        } else {
          toast.warning("No data available to copy from")
        }
        return
      }

      // Step 3: Sort by completion count (highest first)
      allForms.sort((a, b) => b.trueCount - a.trueCount)

      // Step 4: Select the form with maximum completion
      const bestForm = allForms[0]

      console.log("\n🏆 ALL FORMS RANKED BY COMPLETION:")
      allForms.forEach((form, index) => {
        console.log(
          `${index + 1}. ${form.faculty.name} (${form.department.name}) - ${form.subject.name}: ${form.trueCount}/5 complete [${form.source}]`,
        )
      })

      console.log(
        `\n✅ SELECTED: ${bestForm.faculty.name} with ${bestForm.trueCount}/5 complete from ${bestForm.source}`,
      )

      // Step 5: Copy the data
      const formData = bestForm.formData

      setLessonPlan((prevLessonPlan) => {
        const updatedPlan = {
          ...prevLessonPlan,
          // Copy General Details
          division: formData.generalDetails?.division || prevLessonPlan.division,
          lecture_hours: formData.generalDetails?.lecture_hours || prevLessonPlan.lecture_hours,
          lab_hours: formData.generalDetails?.lab_hours || prevLessonPlan.lab_hours,
          credits: formData.generalDetails?.credits || prevLessonPlan.credits,
          term_start_date: formData.generalDetails?.term_start_date || prevLessonPlan.term_start_date,
          term_end_date: formData.generalDetails?.term_end_date || prevLessonPlan.term_end_date,
          course_prerequisites: formData.generalDetails?.course_prerequisites || prevLessonPlan.course_prerequisites,
          course_prerequisites_materials:
            formData.generalDetails?.course_prerequisites_materials || prevLessonPlan.course_prerequisites_materials,
          courseOutcomes: formData.generalDetails?.courseOutcomes || prevLessonPlan.courseOutcomes,
          course_outcomes: formData.generalDetails?.courseOutcomes || prevLessonPlan.course_outcomes,
          remarks: formData.generalDetails?.remarks || prevLessonPlan.remarks,

          // Copy Unit Planning
          unitPlanning: formData.unitPlanning || prevLessonPlan.unitPlanning,
          units: formData.unitPlanning?.units || prevLessonPlan.units,

          // Copy Practical Planning
          practicalPlanning: formData.practicalPlanning || prevLessonPlan.practicalPlanning,
          practicals: formData.practicalPlanning?.practicals || formData.practicals || prevLessonPlan.practicals,

          // Copy CIE Planning
          ciePlanning: formData.ciePlanning || prevLessonPlan.ciePlanning,
          cieDetails: formData.ciePlanning?.cieDetails || formData.cieDetails || prevLessonPlan.cieDetails,
          cie_components:
            formData.ciePlanning?.cie_components || formData.cie_components || prevLessonPlan.cie_components,
          cies: formData.ciePlanning?.cies || formData.cies || prevLessonPlan.cies,

          // Copy Additional Information
          additional_info: {
            ...prevLessonPlan.additional_info,
            classroom_conduct:
              formData.additionalInfo?.classroom_conduct || prevLessonPlan.additional_info?.classroom_conduct,
            attendance_policy:
              formData.additionalInfo?.attendance_policy || prevLessonPlan.additional_info?.attendance_policy,
            lesson_planning_guidelines:
              formData.additionalInfo?.lesson_planning_guidelines ||
              prevLessonPlan.additional_info?.lesson_planning_guidelines,
            cie_guidelines: formData.additionalInfo?.cie_guidelines || prevLessonPlan.additional_info?.cie_guidelines,
            self_study_guidelines:
              formData.additionalInfo?.self_study_guidelines || prevLessonPlan.additional_info?.self_study_guidelines,
            topics_beyond_syllabus:
              formData.additionalInfo?.topics_beyond_syllabus || prevLessonPlan.additional_info?.topics_beyond_syllabus,
            reference_materials:
              formData.additionalInfo?.reference_materials || prevLessonPlan.additional_info?.reference_materials,
            academic_integrity:
              formData.additionalInfo?.academic_integrity || prevLessonPlan.additional_info?.academic_integrity,
            communication_channels:
              formData.additionalInfo?.communication_channels || prevLessonPlan.additional_info?.communication_channels,
            interdisciplinary_integration:
              formData.additionalInfo?.interdisciplinary_integration ||
              prevLessonPlan.additional_info?.interdisciplinary_integration,
            fast_learner_planning:
              formData.additionalInfo?.fast_learner_planning || prevLessonPlan.additional_info?.fast_learner_planning,
            medium_learner_planning:
              formData.additionalInfo?.medium_learner_planning ||
              prevLessonPlan.additional_info?.medium_learner_planning,
            slow_learner_planning:
              formData.additionalInfo?.slow_learner_planning || prevLessonPlan.additional_info?.slow_learner_planning,
            events: formData.additionalInfo?.events || prevLessonPlan.additional_info?.events || [],

            // Keep existing PDF URLs
            fast_learner_file_url: prevLessonPlan.additional_info?.fast_learner_file_url,
            medium_learner_file_url: prevLessonPlan.additional_info?.medium_learner_file_url,
            slow_learner_file_url: prevLessonPlan.additional_info?.slow_learner_file_url,
          },

          status: "in_progress",
          general_details_completed: true,
        }

        return updatedPlan
      })

  
 // Show enhanced success message with section details
 const sourceText = bestForm.source === "shared_faculty" ? "shared faculty" : "same subject code"

 // Create section abbreviations for completed sections
 const completedSections = []
 if (bestForm.completionFlags.general) completedSections.push("G")
 if (bestForm.completionFlags.unit) completedSections.push("U")
 if (bestForm.completionFlags.practical) completedSections.push("P")
 if (bestForm.completionFlags.cie) completedSections.push("C")
 if (bestForm.completionFlags.additional) completedSections.push("A")

 const sectionsText = completedSections.length > 0 ? ` (${completedSections.join(", ")})` : ""

 toast.success(
   `✅ Copied from ${bestForm.faculty.name} (${bestForm.department.name}) - ` +
     `${bestForm.trueCount}/5 sections complete${sectionsText}`,
 )
} catch (error) {
 console.error("💥 Error in copy process:", error)
 toast.error("Failed to copy lesson plan data")
} finally {
 setIsCopying(false)
}
}

  const openPdfViewer = (file: string) => {
    setPdfFile(file)
    setShowPdfViewer(true)
  }

  const closePdfViewer = () => {
    setShowPdfViewer(false)
    setPdfFile(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-lg">Loading lesson plan...</p>
        </div>
      </div>
    )
  }

  if (!lessonPlan) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-lg text-red-600">Failed to load lesson plan</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/lesson-plans">Back to Lesson Plans</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Determine which tabs to show based on subject type
  const showUnitPlanning = !isSubjectPracticalOnly(lessonPlan?.subject)
  const showPracticalPlanning = !isSubjectTheoryOnly(lessonPlan?.subject)

  // 🔧 FIXED: Combined conditions for showing the Fetch Data button
  const isSharedSubject = lessonPlan?.is_sharing && lessonPlan?.sharing_faculty && lessonPlan.sharing_faculty.length > 0
  const hasSameSubjectCode = commonSubject.length >= 2
  const showFetchButton = isSharedSubject || hasSameSubjectCode

  return (
    <div className="p-8">
      {/* PDF Viewer Modal */}
      {showPdfViewer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Course Prerequisites Instructions</h3>
              <Button variant="ghost" size="icon" onClick={closePdfViewer}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {pdfFile ? (
                <iframe src={`/annexure-i.pdf`} className="w-full h-full" title="PDF Viewer" />
              ) : (
                <p>No PDF file specified</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={closePdfViewer}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-5 py-3 border-2 rounded-lg">
        <p className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">Lesson Planning</p>
      </div>

      <div className="flex items-center justify-between mb-6 mt-5">
        <div className="flex items-center w-full gap-2">
          <Link href={`/dashboard/lesson-plans`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">{lessonPlan?.subject?.name}</h2>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{lessonPlan?.subject?.code}</span>
          {isSubjectTheoryOnly(lessonPlan?.subject) && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Theory Only</span>
          )}
          {isSubjectPracticalOnly(lessonPlan?.subject) && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Practical Only</span>
          )}
          {isSubjectBoth(lessonPlan?.subject) && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Theory + Practical</span>
          )}
          {lessonPlan?.is_sharing && (
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              Shared ({Array.isArray(lessonPlan.sharing_faculty) ? lessonPlan.sharing_faculty.length : 0} Faculty)
            </span>
          )}

          {/* 🔧 FIXED: Enhanced button logic for BOTH shared subjects AND same subject code */}
          <div className="ml-auto flex gap-2">
            {/* Show loading state */}
            {isLoadingCommonSubjects && (
              <Button disabled className="text-white">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </Button>
            )}

            {/* Show error state with retry button */}
            {commonSubjectsError && !isLoadingCommonSubjects && !showFetchButton && (
              <Button variant="outline" onClick={handleRetryLoadCommonSubjects}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Search
              </Button>
            )}

            {/* 🔧 MAIN BUTTON: Show when EITHER shared subject OR same subject code */}
            {showFetchButton && !isLoadingCommonSubjects && (
              <Button className="text-white" onClick={handleCopy} disabled={isCopying}>
                <Copy className="mr-2" />
                {isCopying ? "Finding Best Form..." : "Fetch Data"}
              </Button>
            )}

            {/* Show manual refresh button for debugging */}
            {!isLoadingCommonSubjects && !showFetchButton && !commonSubjectsError && (
              <Button variant="ghost" size="sm" onClick={handleRetryLoadCommonSubjects}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 🔧 ENHANCED: Debug info showing both conditions */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug Info:</strong> Shared Subject: {isSharedSubject ? "Yes" : "No"} | Same Subject Code:{" "}
          {hasSameSubjectCode ? "Yes" : "No"} | Common Subjects: {commonSubject.length} | Loading:{" "}
          {isLoadingCommonSubjects ? "Yes" : "No"} | Error: {commonSubjectsError || "None"} | Show Button:{" "}
          {showFetchButton ? "Yes" : "No"}
        </div>
      )} */}

      <Card className="mb-6">
        <Tabs defaultValue="general-details" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${
              showUnitPlanning && showPracticalPlanning
                ? "grid-cols-5"
                : showUnitPlanning || showPracticalPlanning
                  ? "grid-cols-4"
                  : "grid-cols-3"
            }`}
          >
            <TabsTrigger value="general-details">General Details</TabsTrigger>
            {showUnitPlanning && <TabsTrigger value="unit-planning">Unit Planning</TabsTrigger>}
            {showPracticalPlanning && <TabsTrigger value="practical-planning">Practical Planning</TabsTrigger>}
            <TabsTrigger value="cie-planning">CIE Planning</TabsTrigger>
            <TabsTrigger value="additional-info">Additional Information</TabsTrigger>
          </TabsList>

          <TabsContent value="general-details">
            <GeneralDetailsForm lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} openPdfViewer={openPdfViewer} />
          </TabsContent>

          {showUnitPlanning && (
            <TabsContent value="unit-planning">
              <UnitPlanningForm lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />
            </TabsContent>
          )}

          {showPracticalPlanning && (
            <TabsContent value="practical-planning">
              <PracticalPlanningForm lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />
            </TabsContent>
          )}

          <TabsContent value="cie-planning">
            <CIEPlanningForm lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />
          </TabsContent>

          <TabsContent value="additional-info">
            <AdditionalInfoForm lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
