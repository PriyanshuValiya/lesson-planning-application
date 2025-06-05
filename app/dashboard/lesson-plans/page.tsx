"use client"

import { useState, useEffect, useMemo } from "react"
import { useDashboardContext } from "@/context/DashboardContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Upload, FileText, ChevronDown, ChevronRight, Printer } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchFaculty } from "@/app/dashboard/actions/fetchFaculty"
import type { User_Role } from "@/types/types"
import Link from "next/link"
import type { RoleDataItem } from "@/context/DashboardContext"

export default function LessonPlansPage() {
  const { roleData, currentRole, setCurrentRole, userData } = useDashboardContext()
  const [subjects, setSubjects] = useState<User_Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean
  }>({})

  const uniqueRoles = useMemo(() => {
    const unique = new Map<string, RoleDataItem>()
    roleData.forEach((role) => {
      if (!unique.has(role.role_name)) {
        unique.set(role.role_name, role)
      }
    })
    return Array.from(unique.values())
  }, [roleData])

  useEffect(() => {
    const getSubjectData = async () => {
      try {
        setIsLoading(true)

        // Only fetch subjects if current role is Faculty
        if (currentRole?.role_name === "Faculty") {
          // Fetch faculty assignments from the HOD's subject assignments
          const facultyData = await fetchFaculty()

          // Filter to get only this user's assignments where subjects is not null
          const userSubjects = facultyData.filter(
            (faculty) =>
              faculty.users?.auth_id === userData?.auth_id &&
              faculty.role_name === "Faculty" &&
              faculty.subjects !== null,
          )

          console.log("User subjects found:", userSubjects)
          setSubjects(userSubjects)
        } else {
          // Clear subjects if not in Faculty role
          setSubjects([])
        }
      } catch (error) {
        console.error("Error fetching faculty subjects:", error)
        setSubjects([])
      } finally {
        setIsLoading(false)
      }
    }

    if (userData?.auth_id && currentRole) {
      getSubjectData()
    }
  }, [userData?.auth_id, currentRole?.role_name])

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

  const handleRoleChange = (roleName: string) => {
    console.log("Attempting to change role to:", roleName)
    console.log("Available roles:", roleData)

    const selectedRole = roleData.find((role) => role.role_name === roleName)
    console.log("Selected role found:", selectedRole)

    if (selectedRole) {
      setCurrentRole(selectedRole)
      console.log("Role changed successfully to:", selectedRole)
    } else {
      console.error("Role not found:", roleName)
    }
  }

  // Show loading state
  if (!currentRole) {
    return (
      <div className="min-h-screen bg-white pt-3 px-5">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-3 px-5">
      <div className="flex justify-between items-center px-5 py-3 border-2 rounded-lg">
        <p className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
          {currentRole.role_name === "Faculty" ? "Lesson Planning" : `${currentRole.role_name} Dashboard`}
        </p>
        <div>
          <Select onValueChange={handleRoleChange} value={currentRole.role_name}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={currentRole.role_name} />
            </SelectTrigger>
            <SelectContent>
              {uniqueRoles.map((role, idx) => (
                <SelectItem value={role.role_name} key={idx}>
                  {role.role_name === "Faculty" ? "Subject Teacher" : role.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5">
        {currentRole.role_name === "Faculty" ? (
          // Faculty view - show lesson plans
          <>
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
                            {isUnitExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
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
          </>
        ) : currentRole.role_name === "HOD" ? (
          // HOD view - redirect to HOD dashboard or show appropriate content
          <div className="text-center py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-[#1A5CA1] mb-2">HOD Dashboard</h3>
              <p className="text-gray-600 mb-4">
                You are now viewing as HOD. Lesson planning is available for Faculty role.
              </p>
              <Link href="/dashboard">
                <Button className="bg-[#1A5CA1] hover:bg-[#154A80]">Go to HOD Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : currentRole.role_name === "Principal" ? (
          // Principal view
          <div className="text-center py-8">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-[#1A5CA1] mb-2">Principal Dashboard</h3>
              <p className="text-gray-600 mb-4">
                You are now viewing as Principal. Lesson planning is available for Faculty role.
              </p>
              <Link href="/dashboard">
                <Button className="bg-[#1A5CA1] hover:bg-[#154A80]">Go to Principal Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : (
          // Default view for other roles
          <div className="text-center py-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-[#1A5CA1] mb-2">{currentRole.role_name} View</h3>
              <p className="text-gray-600 mb-4">Lesson planning is available for Faculty role only.</p>
              <Button
                onClick={() => {
                  const facultyRole = roleData.find((role) => role.role_name === "Faculty")
                  if (facultyRole) {
                    setCurrentRole(facultyRole)
                  }
                }}
                className="bg-[#1A5CA1] hover:bg-[#154A80]"
              >
                Switch to Faculty View
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
