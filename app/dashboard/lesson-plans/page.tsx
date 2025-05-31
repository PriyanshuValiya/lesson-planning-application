// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { useDashboardContext } from "@/context/DashboardContext"
// import { Edit, Eye, Printer, Upload } from "lucide-react"
// import { ChevronDown, ChevronRight } from "lucide-react"
// import Link from "next/link"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { fetchFacultySubjects } from "@/app/dashboard/actions/fetchFacultySubjects"

// export default function LessonPlansPage() {
//   const router = useRouter()
//   const { userData } = useDashboardContext()
//   const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({})
//   const [expandedCIEs, setExpandedCIEs] = useState<Record<string, boolean>>({})
//   const [subjects, setSubjects] = useState<any[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const getSubjectData = async () => {
//       try {
//         setIsLoading(true)
//         const data = await fetchFacultySubjects(userData.id)

//         // Filter out subjects where subjects is null
//         const validSubjects = data.filter((subject: any) => subject.subjects !== null)

//         // Add a sample subject if none exist
//         if (validSubjects.length === 0) {
//           validSubjects.push({
//             id: "sample-1",
//             subject_id: "sample-subject-1",
//             academic_year: "2025",
//             division: "Division 1",
//             subjects: {
//               id: "sample-subject-1",
//               code: "CEU102",
//               name: "Programming in C++",
//               semester: 2,
//               lecture_hours: 3,
//               lab_hours: 2,
//               abbreviation_name: "C++",
//               credits: 4,
//               is_practical: false,
//               is_theory: true,
//             },
//           })
//         }

//         setSubjects(validSubjects)
//       } catch (error) {
//         console.error("Error fetching faculty subjects:", error)

//         // Add a sample subject if there's an error
//         setSubjects([
//           {
//             id: "sample-1",
//             subject_id: "sample-subject-1",
//             academic_year: "2025",
//             division: "Division 1",
//             subjects: {
//               id: "sample-subject-1",
//               code: "CEU102",
//               name: "Programming in C++",
//               semester: 2,
//               lecture_hours: 3,
//               lab_hours: 2,
//               abbreviation_name: "C++",
//               credits: 4,
//               is_practical: false,
//               is_theory: true,
//             },
//           },
//         ])
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     if (userData.id) {
//       getSubjectData()
//     }
//   }, [userData.id])

//   const toggleUnitExpand = (subjectId: string) => {
//     setExpandedUnits((prev) => ({
//       ...prev,
//       [subjectId]: !prev[subjectId],
//     }))
//   }

//   const toggleCIEExpand = (subjectId: string) => {
//     setExpandedCIEs((prev) => ({
//       ...prev,
//       [subjectId]: !prev[subjectId],
//     }))
//   }

//   return (
//     <div className="p-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-[#1A5CA1]">Lesson Planning</h1>
//         <div className="relative">
//           <Select defaultValue="subject-teacher">
//             <SelectTrigger className="w-[180px] bg-white">
//               <SelectValue placeholder="Subject Teacher" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="subject-teacher">Subject Teacher</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="text-center py-12">
//           <p className="text-lg">Loading subjects...</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {subjects.map((subject) => (
//             <div key={subject.id} className="bg-white rounded-lg border p-6 shadow-sm">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h2 className="text-xl font-bold text-[#1A5CA1]">{subject.subjects.name}</h2>
//                   <div className="flex items-center gap-2 mt-2">
//                     <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
//                       Sem {subject.subjects.semester}
//                     </span>
//                     <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Submitted</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-2 mb-4">
//                 <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
//                   {subject.subjects.code}
//                 </span>
//               </div>

//               <div className="grid grid-cols-3 gap-2 mb-4">
//                 <Button variant="outline" size="sm" asChild>
//                   <Link href={`/dashboard/lesson-plans/${subject.subjects.id}/edit`}>
//                     <Edit className="h-4 w-4 mr-1" /> Edit LP
//                   </Link>
//                 </Button>
//                 <Button variant="outline" size="sm" asChild>
//                   <Link href={`/dashboard/lesson-plans/${subject.subjects.id}`}>
//                     <Eye className="h-4 w-4 mr-1" /> View LP
//                   </Link>
//                 </Button>
//                 <Button variant="outline" size="sm">
//                   <Printer className="h-4 w-4" />
//                 </Button>
//               </div>

//               <div className="grid grid-cols-2 gap-2 mb-4">
//                 <Button variant="outline" size="sm">
//                   <Upload className="h-4 w-4 mr-1" /> Upload Syllabus
//                 </Button>
//                 <Button variant="outline" size="sm">
//                   <Eye className="h-4 w-4 mr-1" /> View Syllabus
//                 </Button>
//               </div>

//               <div className="border rounded-md mb-3">
//                 <button
//                   className="w-full flex justify-between items-center p-3 text-left"
//                   onClick={() => toggleUnitExpand(subject.id)}
//                 >
//                   <span className="font-medium">Actual Unit Details</span>
//                   {expandedUnits[subject.id] ? (
//                     <ChevronDown className="h-5 w-5" />
//                   ) : (
//                     <ChevronRight className="h-5 w-5" />
//                   )}
//                 </button>
//                 {expandedUnits[subject.id] && (
//                   <div className="p-3 border-t">
//                     <div className="grid grid-cols-2 gap-2">
//                       <Button variant="outline" size="sm">
//                         <Edit className="h-4 w-4 mr-1" /> Actual Unit Details
//                       </Button>
//                       <Button variant="outline" size="sm">
//                         <Eye className="h-4 w-4 mr-1" /> View Actual Unit
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="border rounded-md">
//                 <button
//                   className="w-full flex justify-between items-center p-3 text-left"
//                   onClick={() => toggleCIEExpand(subject.id)}
//                 >
//                   <span className="font-medium">Actual CIE Details</span>
//                   {expandedCIEs[subject.id] ? (
//                     <ChevronDown className="h-5 w-5" />
//                   ) : (
//                     <ChevronRight className="h-5 w-5" />
//                   )}
//                 </button>
//                 {expandedCIEs[subject.id] && (
//                   <div className="p-3 border-t">
//                     <div className="grid grid-cols-2 gap-2">
//                       <Button variant="outline" size="sm">
//                         <Edit className="h-4 w-4 mr-1" /> Actual CIE Details
//                       </Button>
//                       <Button variant="outline" size="sm">
//                         <Eye className="h-4 w-4 mr-1" /> View Actual CIE
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { useDashboardContext } from "@/context/DashboardContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Upload, FileText, ChevronDown, ChevronRight, Printer } from "lucide-react"
import { fetchFaculty } from "@/app/dashboard/actions/fetchFaculty"
import type { User_Role } from "@/types/types"
import Link from "next/link"

export default function LessonPlansPage() {
  const { userData } = useDashboardContext()
  const [subjects, setSubjects] = useState<User_Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const getSubjectData = async () => {
      try {
        setIsLoading(true)

        // Fetch faculty assignments from the HOD's subject assignments
        const facultyData = await fetchFaculty()

        // Filter to get only this user's assignments where subjects is not null
        const userSubjects = facultyData.filter(
          (faculty) =>
            faculty.users.auth_id === userData.auth_id && faculty.role_name === "Faculty" && faculty.subjects !== null,
        )

        console.log("User subjects found:", userSubjects)
        setSubjects(userSubjects)
      } catch (error) {
        console.error("Error fetching faculty subjects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userData.auth_id) {
      getSubjectData()
    }
  }, [userData.auth_id])

  const toggleExpanded = (subjectId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }))
  }

  const getStatusBadge = (index: number) => {
    const statuses = ["Submitted", "In Progress"]
    return statuses[index % statuses.length]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1A5CA1]">Lesson Planning</h1>
          </div>
          <div className="text-[#1A5CA1] font-medium">Subject Teacher</div>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading lesson plans...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2">No subjects assigned yet.</p>
            <p className="text-sm text-gray-500">Please contact your HOD to assign subjects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject, index) => {
              const status = getStatusBadge(index)
              const isUnitExpanded = expandedCards[`unit-${subject.id}`]
              const isCIEExpanded = expandedCards[`cie-${subject.id}`]

              return (
                <div key={subject.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#1A5CA1] mb-2">
                        {subject.subjects?.name || "Unknown Subject"}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-[#1A5CA1] text-white">
                          Sem {subject.subjects?.semester}
                        </Badge>
                        <Badge className={getStatusColor(status)}>{status}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{subject.subjects?.code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Link href={`/dashboard/lesson-plans/${subject.id}/edit`}>
                      <Button size="sm" className="w-full bg-[#1A5CA1] hover:bg-[#154A80]">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit LP
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      View LP
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button size="sm" variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Syllabus
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-1" />
                      View Syllabus
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="border-t pt-2">
                      <button
                        onClick={() => toggleExpanded(`unit-${subject.id}`)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 p-2"
                      >
                        <span>Actual Unit Details</span>
                        {isUnitExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {isUnitExpanded && (
                        <div className="mt-2 space-y-2 pl-4">
                          <Button size="sm" variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-1" />
                            Actual Unit Details
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            View Actual Unit
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-2">
                      <button
                        onClick={() => toggleExpanded(`cie-${subject.id}`)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 p-2"
                      >
                        <span>Actual CIE Details</span>
                        {isCIEExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {isCIEExpanded && (
                        <div className="mt-2 space-y-2 pl-4">
                          <Button size="sm" variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-1" />
                            Actual CIE Details
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            View Actual CIE
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
