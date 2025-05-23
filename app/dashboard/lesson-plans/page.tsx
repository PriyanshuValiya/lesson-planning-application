"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useDashboardContext } from "@/context/DashboardContext"
import { Edit, Eye, Printer, Upload } from "lucide-react"
import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchFacultySubjects } from "@/app/dashboard/actions/fetchFacultySubjects"

export default function LessonPlansPage() {
  const router = useRouter()
  const { userData } = useDashboardContext()
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({})
  const [expandedCIEs, setExpandedCIEs] = useState<Record<string, boolean>>({})
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSubjectData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchFacultySubjects(userData.id)

        // Filter out subjects where subjects is null
        const validSubjects = data.filter((subject: any) => subject.subjects !== null)

        // Add a sample subject if none exist
        if (validSubjects.length === 0) {
          validSubjects.push({
            id: "sample-1",
            subject_id: "sample-subject-1",
            academic_year: "2025",
            division: "Division 1",
            subjects: {
              id: "sample-subject-1",
              code: "CEU102",
              name: "Programming in C++",
              semester: 2,
              lecture_hours: 3,
              lab_hours: 2,
              abbreviation_name: "C++",
              credits: 4,
              is_practical: false,
              is_theory: true,
            },
          })
        }

        setSubjects(validSubjects)
      } catch (error) {
        console.error("Error fetching faculty subjects:", error)

        // Add a sample subject if there's an error
        setSubjects([
          {
            id: "sample-1",
            subject_id: "sample-subject-1",
            academic_year: "2025",
            division: "Division 1",
            subjects: {
              id: "sample-subject-1",
              code: "CEU102",
              name: "Programming in C++",
              semester: 2,
              lecture_hours: 3,
              lab_hours: 2,
              abbreviation_name: "C++",
              credits: 4,
              is_practical: false,
              is_theory: true,
            },
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (userData.id) {
      getSubjectData()
    }
  }, [userData.id])

  const toggleUnitExpand = (subjectId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }))
  }

  const toggleCIEExpand = (subjectId: string) => {
    setExpandedCIEs((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1A5CA1]">Lesson Planning</h1>
        <div className="relative">
          <Select defaultValue="subject-teacher">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Subject Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subject-teacher">Subject Teacher</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg">Loading subjects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1A5CA1]">{subject.subjects.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      Sem {subject.subjects.semester}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Submitted</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {subject.subjects.code}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/lesson-plans/${subject.subjects.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" /> Edit LP
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/lesson-plans/${subject.subjects.id}`}>
                    <Eye className="h-4 w-4 mr-1" /> View LP
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" /> Upload Syllabus
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> View Syllabus
                </Button>
              </div>

              <div className="border rounded-md mb-3">
                <button
                  className="w-full flex justify-between items-center p-3 text-left"
                  onClick={() => toggleUnitExpand(subject.id)}
                >
                  <span className="font-medium">Actual Unit Details</span>
                  {expandedUnits[subject.id] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                {expandedUnits[subject.id] && (
                  <div className="p-3 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Actual Unit Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View Actual Unit
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-md">
                <button
                  className="w-full flex justify-between items-center p-3 text-left"
                  onClick={() => toggleCIEExpand(subject.id)}
                >
                  <span className="font-medium">Actual CIE Details</span>
                  {expandedCIEs[subject.id] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                {expandedCIEs[subject.id] && (
                  <div className="p-3 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Actual CIE Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View Actual CIE
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
