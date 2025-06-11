// @ts-nocheck
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InfoIcon, PlusCircle, XCircle } from 'lucide-react'
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { saveGeneralDetailsForm } from "@/app/dashboard/actions/saveGeneralDetailsForm"
import { useDashboardContext } from "@/context/DashboardContext"
import { createClient } from "@/utils/supabase/client"

interface GeneralDetailsFormProps {
  lessonPlan: any
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>
  openPdfViewer: (file: string) => void
}

// COMPREHENSIVE DATE HANDLING FUNCTIONS
const parseAnyDateFormat = (dateStr: string): Date | null => {
  if (!dateStr) return null

  // Handle DD-MM-YYYY format (database format)
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = dateStr.split("-")
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
  }

  // Handle MM/DD/YYYY format (HOD input format)
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [month, day, year] = dateStr.split("/")
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
  }

  // Handle DD/MM/YYYY format
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateStr.split("/")
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
  }

  // Handle YYYY-MM-DD format (ISO format)
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateStr)
  }

  // Try default parsing as fallback
  try {
    return new Date(dateStr)
  } catch (error) {
    console.error("Error parsing date:", error)
    return null
  }
}

const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return ""

  const date = parseAnyDateFormat(dateStr)
  if (!date || isNaN(date.getTime())) return dateStr

  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  
  return `${day}-${month}-${year}` // Always return DD-MM-YYYY format
}

export default function GeneralDetailsForm({ lessonPlan, setLessonPlan, openPdfViewer }: GeneralDetailsFormProps) {
  const { userData } = useDashboardContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [facultyTermDates, setFacultyTermDates] = useState<{
    termStartDate: string
    termEndDate: string
  }>({
    termStartDate: "",
    termEndDate: "",
  })

  // Form state
  const [division, setDivision] = useState(lessonPlan?.division || "Div 1 & 2")
  const [lectureHours, setLectureHours] = useState(lessonPlan?.subject?.lecture_hours || 0)
  const [labHours, setLabHours] = useState(lessonPlan?.subject?.lab_hours || 0)
  const [credits, setCredits] = useState(lessonPlan?.subject?.credits || 0)
  const [coursePrerequisites, setCoursePrerequisites] = useState(lessonPlan?.course_prerequisites || "")
  const [coursePrerequisitesMaterials, setCoursePrerequisitesMaterials] = useState(
    lessonPlan?.course_prerequisites_materials || "",
  )
  const [courseOutcomes, setCourseOutcomes] = useState(lessonPlan?.courseOutcomes || [{ id: uuidv4(), text: "" }])
  const [remarks, setRemarks] = useState(lessonPlan?.remarks || "")

  const [divisionError, setDivisionError] = useState("")
  const [lectureHoursError, setLectureHoursError] = useState("")
  const [labHoursError, setLabHoursError] = useState("")
  const [creditsError, setCreditsError] = useState("")
  const [coursePrerequisitesError, setCoursePrerequisitesError] = useState("")
  const [coursePrerequisitesMaterialsError, setCoursePrerequisitesMaterialsError] = useState("")
  const [courseOutcomesError, setCourseOutcomesError] = useState("")

  // COMPREHENSIVE DATE FETCHING WITH ALL POSSIBLE PATHS
  useEffect(() => {
    const fetchTermDates = async () => {
      try {
        let termStartDate = ""
        let termEndDate = ""

        // Path 1: Try to get from lessonPlan.subject.metadata (direct object)
        if (lessonPlan?.subject?.metadata?.term_start_date) {
          termStartDate = lessonPlan.subject.metadata.term_start_date
          termEndDate = lessonPlan.subject.metadata.term_end_date
          console.log("Found dates in lessonPlan.subject.metadata (object):", { termStartDate, termEndDate })
        }

        // Path 2: Try to parse metadata if it's a JSON string
        if (!termStartDate && typeof lessonPlan?.subject?.metadata === "string") {
          try {
            const parsedMetadata = JSON.parse(lessonPlan.subject.metadata)
            termStartDate = parsedMetadata?.term_start_date || ""
            termEndDate = parsedMetadata?.term_end_date || ""
            console.log("Found dates in lessonPlan.subject.metadata (parsed JSON):", { termStartDate, termEndDate })
          } catch (e) {
            console.error("Error parsing metadata JSON:", e)
          }
        }

        // Path 3: Try direct from lessonPlan
        if (!termStartDate && lessonPlan?.term_start_date) {
          termStartDate = lessonPlan.term_start_date
          termEndDate = lessonPlan.term_end_date
          console.log("Found dates in lessonPlan (direct):", { termStartDate, termEndDate })
        }

        // Path 4: Fetch from database if we have subject code
        if (!termStartDate && lessonPlan?.subject?.code) {
          const supabase = createClient()
          
          const { data: subjects, error: subjectError } = await supabase
            .from("subjects")
            .select("metadata")
            .eq("code", lessonPlan.subject.code)
            .single()

          if (!subjectError && subjects?.metadata) {
            let metadata = subjects.metadata
            
            if (typeof metadata === "string") {
              try {
                metadata = JSON.parse(metadata)
              } catch (e) {
                console.error("Failed to parse database metadata:", e)
              }
            }
            
            if (metadata?.term_start_date) {
              termStartDate = metadata.term_start_date
              termEndDate = metadata.term_end_date
              console.log("Found dates in database:", { termStartDate, termEndDate })
            }
          }
        }

        // Format dates consistently to DD-MM-YYYY
        if (termStartDate && termEndDate) {
          setFacultyTermDates({
            termStartDate: formatDateForDisplay(termStartDate),
            termEndDate: formatDateForDisplay(termEndDate),
          })
          console.log("Final formatted dates:", {
            termStartDate: formatDateForDisplay(termStartDate),
            termEndDate: formatDateForDisplay(termEndDate)
          })
        } else {
          console.log("No term dates found in any path")
        }

      } catch (error) {
        console.error("Error fetching term dates:", error)
      }
    }

    fetchTermDates()
  }, [lessonPlan?.subject?.code, lessonPlan?.subject?.metadata])

  const handleAddCourseOutcome = () => {
    setCourseOutcomes([...courseOutcomes, { id: uuidv4(), text: "" }])
  }

  const handleRemoveCourseOutcome = (index: number) => {
    if (courseOutcomes.length > 1) {
      setCourseOutcomes(courseOutcomes.filter((_, i) => i !== index))
    }
  }

  const handleCourseOutcomeChange = (index: number, value: string) => {
    const updatedOutcomes = [...courseOutcomes]
    updatedOutcomes[index].text = value
    setCourseOutcomes(updatedOutcomes)
  }

  const resetErrors = () => {
    setDivisionError("")
    setLectureHoursError("")
    setLabHoursError("")
    setCreditsError("")
    setCoursePrerequisitesError("")
    setCoursePrerequisitesMaterialsError("")
    setCourseOutcomesError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      resetErrors()
      let hasErrors = false

      // Validation
      if (!division) {
        setDivisionError("Division is required")
        hasErrors = true
      }

      if (lectureHours < 1) {
        setLectureHoursError("Lecture hours must be at least 1")
        hasErrors = true
      }

      if (labHours < 0) {
        setLabHoursError("Lab hours cannot be negative")
        hasErrors = true
      }

      if (credits < 1) {
        setCreditsError("Credits must be at least 1")
        hasErrors = true
      }

      if (!coursePrerequisites) {
        setCoursePrerequisitesError("Course prerequisites are required")
        hasErrors = true
      }

      if (!coursePrerequisitesMaterials) {
        setCoursePrerequisitesMaterialsError("Course prerequisites materials are required")
        hasErrors = true
      }

      if (courseOutcomes.length === 0 || courseOutcomes.some((co) => !co.text)) {
        setCourseOutcomesError("Please enter all CO's details")
        hasErrors = true
      }

      if (hasErrors) {
        setIsSubmitting(false)
        toast.error("Please resolve validation errors before submitting")
        return
      }

      // Prepare form data with consistent date format
      const formData = {
        subject_id: lessonPlan?.subject?.id,
        division,
        lecture_hours: Number(lectureHours),
        lab_hours: Number(labHours),
        credits: Number(credits),
        term_start_date: facultyTermDates.termStartDate, // DD-MM-YYYY format
        term_end_date: facultyTermDates.termEndDate, // DD-MM-YYYY format
        course_prerequisites: coursePrerequisites,
        course_prerequisites_materials: coursePrerequisitesMaterials,
        courseOutcomes,
        remarks,
      }

      const result = await saveGeneralDetailsForm(formData)

      if (result.success) {
        setLessonPlan((prev: any) => ({
          ...prev,
          division,
          lecture_hours: Number(lectureHours),
          lab_hours: Number(labHours),
          credits: Number(credits),
          term_start_date: facultyTermDates.termStartDate,
          term_end_date: facultyTermDates.termEndDate,
          course_prerequisites: coursePrerequisites,
          course_prerequisites_materials: coursePrerequisitesMaterials,
          courseOutcomes,
          remarks,
          general_details_completed: true,
          status: "in_progress",
        }))

        toast.success("General details saved successfully! Status: In Progress")

        setTimeout(() => {
          const nextTab = lessonPlan?.subject?.is_theory
            ? document.querySelector('[value="unit-planning"]')
            : document.querySelector('[value="practical-planning"]')
          if (nextTab) {
            ;(nextTab as HTMLElement).click()
          }
        }, 500)
      } else {
        toast.error(result.error || "Failed to save general details")
        console.error("Save error:", result)
      }
    } catch (error) {
      console.error("Error saving general details:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Course Prerequisites Instructions</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowInstructions(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Guidelines for learning materials</h2>
              <p className="mb-4">
                It is mandatory to provide specific learning materials by ensuring the quality of content. Avoid
                providing vague references such as just the name of a textbook, a chapter title, or a general media/web
                link. Instead, ensure that the materials are clearly and precisely mentioned as follows:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">I. Book:</h3>
                  <p>
                    Include the book title, edition, author, chapter number and name, and the specific page numbers to
                    be referred.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Example: "Machine Learning" (2nd Edition) by Tom M. Mitchell, Chapter 5: Neural Networks, Pages
                    123–140
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">II. Video:</h3>
                  <p>
                    Provide the exact video link, and if only a portion is relevant, specify the start and end
                    timestamps.
                  </p>
                  <p className="text-sm text-gray-600 italic">Example: [YouTube link], watch from 02:15 to 10:30</p>
                </div>

                <div>
                  <h3 className="font-semibold">III. Web Material:</h3>
                  <p>Provide the full and direct URL to the web page/article that should be studied.</p>
                  <p className="text-sm text-gray-600 italic">
                    Example: [https://www.analyticsvidhya.com/neural-network-basics]
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">IV. Research Papers / Journal Articles:</h3>
                  <p>
                    Provide the full title, author(s), publication year, journal/conference name, and either the PDF or
                    DOI/link.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Example: "A Survey on Deep Learning for Image Captioning" by Y. Zhang et al., IEEE Access, 2020,
                    DOI: 10.1109/ACCESS.2020.299234
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">V. Lecture Notes (Prepared by Faculty):</h3>
                  <p>
                    If you create custom lecture notes, share the direct file or link, and mention specific slide/page
                    numbers to be studied (If required to maintain continuity).
                  </p>
                  <p className="text-sm text-gray-600 italic">Example: Note 1: "Introduction to Classification"</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowInstructions(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div>
          <Label htmlFor="subject-teacher-name">Subject Teacher Name</Label>
          <Input id="subject-teacher-name" value={lessonPlan?.faculty?.name || ""} disabled className="mt-1" />
        </div>
        <div>
          <Label htmlFor="subject-code">Subject Code</Label>
          <Input id="subject-code" value={lessonPlan?.subject?.code || ""} disabled className="mt-1" />
        </div>
        <div>
          <Label htmlFor="subject-name">Subject Name</Label>
          <Input id="subject-name" value={lessonPlan?.subject?.name || ""} disabled className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <Label htmlFor="department">Department</Label>
          <Input id="department" value={lessonPlan?.subject?.department?.name || ""} disabled className="mt-1" />
        </div>
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Input id="semester" value={lessonPlan?.subject?.semester || ""} disabled className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="division">Division</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger id="division" className="mt-1">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Div 1 & 2">Div 1 & 2</SelectItem>
                <SelectItem value="Div 1">Div 1</SelectItem>
                <SelectItem value="Div 2">Div 2</SelectItem>
              </SelectContent>
            </Select>
            {divisionError && <p className="text-red-500 text-xs mt-1">{divisionError}</p>}
          </div>
          <div>
            <Label htmlFor="credits">Credits</Label>
            <Input
              id="credits"
              type="number"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="mt-1"
            />
            {creditsError && <p className="text-red-500 text-xs mt-1">{creditsError}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div>
          <Label htmlFor="lecture-hour">Lecture Hour/week</Label>
          <Input
            id="lecture-hour"
            type="number"
            value={lectureHours}
            onChange={(e) => setLectureHours(Number(e.target.value))}
            className="mt-1"
          />
          {lectureHoursError && <p className="text-red-500 text-xs mt-1">{lectureHoursError}</p>}
        </div>
        <div>
          <Label htmlFor="lab-hour">Lab Hour/week</Label>
          <Input
            id="lab-hour"
            type="number"
            value={labHours}
            onChange={(e) => setLabHours(Number(e.target.value))}
            className="mt-1"
          />
          {labHoursError && <p className="text-red-500 text-xs mt-1">{labHoursError}</p>}
        </div>
        <div>
          <Label htmlFor="term-start-date">Term Start Date</Label>
          <Input
            id="term-start-date"
            type="text"
            value={facultyTermDates.termStartDate || "Not set by HOD"}
            disabled
            className={`mt-1 ${facultyTermDates.termStartDate ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
          />
          <p
            className={`text-xs mt-1 font-medium ${
              facultyTermDates.termStartDate ? "text-green-600" : "text-orange-600"
            }`}
          >
            {facultyTermDates.termStartDate ? "Set by HOD for this subject" : "HOD needs to set term dates"}
          </p>
        </div>
        <div>
          <Label htmlFor="term-end-date">Term End Date</Label>
          <Input
            id="term-end-date"
            type="text"
            value={facultyTermDates.termEndDate || "Not set by HOD"}
            disabled
            className={`mt-1 ${facultyTermDates.termEndDate ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
          />
          <p
            className={`text-xs mt-1 font-medium ${
              facultyTermDates.termEndDate ? "text-green-600" : "text-orange-600"
            }`}
          >
            {facultyTermDates.termEndDate ? "Set by HOD for this subject" : "HOD needs to set term dates"}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="course-prerequisites">
            Course Prerequisites<span className="text-red-500">*</span>
          </Label>
        </div>
        <Textarea
          id="course-prerequisites"
          placeholder="List the topics or concepts students are expected to be familiar with before studying this course."
          value={coursePrerequisites}
          onChange={(e) => setCoursePrerequisites(e.target.value)}
          className="mt-2"
          rows={4}
        />
        {coursePrerequisitesError && <p className="text-red-500 text-xs mt-1">{coursePrerequisitesError}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="course-prerequisites-materials">
            Course Prerequisites materials <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-blue-600"
            onClick={() => setShowInstructions(true)}
          >
            <InfoIcon className="h-4 w-4 mr-1" />
            View Instructions
          </Button>
        </div>
        <Textarea
          id="course-prerequisites-materials"
          placeholder="List any materials students should review before starting this course."
          value={coursePrerequisitesMaterials}
          onChange={(e) => setCoursePrerequisitesMaterials(e.target.value)}
          className="mt-1"
          rows={4}
        />
        {coursePrerequisitesMaterialsError && (
          <p className="text-red-500 text-xs mt-1">{coursePrerequisitesMaterialsError}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Course Outcomes (CO)</Label>

        {courseOutcomes.map((outcome, index) => (
          <div key={outcome.id} className="flex items-center gap-4">
            <div className="w-24">
              <Label>CO {index + 1}</Label>
            </div>
            <div className="flex-1">
              <Input
                placeholder={`Enter Course Outcome ${index + 1}`}
                value={outcome.text}
                onChange={(e) => handleCourseOutcomeChange(index, e.target.value)}
              />
            </div>
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCourseOutcome(index)}
                className="text-red-500"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
        {courseOutcomesError && <p className="text-red-500 text-xs mt-1">{courseOutcomesError}</p>}

        <Button type="button" onClick={handleAddCourseOutcome} className="bg-[#1A5CA1] hover:bg-[#154A80]">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Course Outcome
        </Button>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks (Optional)</Label>
        <Textarea
          id="remarks"
          placeholder="Any additional remarks or notes"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-[#1A5CA1] hover:bg-[#154A80]" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save General Details"}
        </Button>
      </div>
    </form>
  )
}