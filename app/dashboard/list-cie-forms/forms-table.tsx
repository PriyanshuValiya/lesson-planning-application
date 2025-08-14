"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Printer, Search, ArrowUpDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormData {
  id: string
  faculty_id: string
  subject_id: string
  form: any
  created_at: string
  totalPlannedCies: number
  totalActualCies: number
  completionPercentage: number
  users?: {
    id: string
    name: string
    email: string
  }
  subjects?: {
    id: string
    name: string
    code: string
    semester: number
    department_id: string
    departments?: {
      id: string
      name: string
      abbreviation_depart: string
      institute_id: string
      institutes?: {
        id: string
        name: string
        abbreviation_insti: string
      }
    }
  }
}

interface FormsTableProps {
  forms: FormData[]
  isPrincipal?: boolean
}

export default function FormsTable({ forms, isPrincipal = false }: FormsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [sortField, setSortField] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = forms
      .filter((form) => form.subjects?.departments)
      .map((form) => ({
        id: form.subjects?.departments?.id || "",
        name: form.subjects?.departments?.name || "Unknown",
        abbreviation: form.subjects?.departments?.abbreviation_depart || "UNK",
      }))
    return Array.from(new Map(depts.map((d) => [d.id, d])).values())
  }, [forms])

  // Filter and sort forms
  const filteredAndSortedForms = useMemo(() => {
    const filtered = forms.filter((form) => {
      const matchesSearch =
        form.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.subjects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.subjects?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.subjects?.departments?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = departmentFilter === "all" || form.subjects?.departments?.id === departmentFilter

      return matchesSearch && matchesDepartment
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "faculty_name":
          aValue = a.users?.name || ""
          bValue = b.users?.name || ""
          break
        case "subject_name":
          aValue = a.subjects?.name || ""
          bValue = b.subjects?.name || ""
          break
        case "semester":
          aValue = a.subjects?.semester || 0
          bValue = b.subjects?.semester || 0
          break
        case "department":
          aValue = a.subjects?.departments?.name || ""
          bValue = b.subjects?.departments?.name || ""
          break
        case "completion":
          aValue = a.completionPercentage || 0
          bValue = b.completionPercentage || 0
          break
        default:
          aValue = a.created_at || ""
          bValue = b.created_at || ""
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [forms, searchTerm, departmentFilter, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleView = (formId: string) => {
    try {
      router.push(`/dashboard/actuals/view-cie/${formId}`)
    } catch (error) {
      console.error("Navigation error:", error)
      alert("Error navigating to view page")
    }
  }

  const handlePrint = (formId: string) => {
    try {
      window.open(`/print/${formId}`, "_blank")
    } catch (error) {
      console.error("Print error:", error)
      alert("Error opening print page")
    }
  }

  const getStatusBadge = (completionPercentage: number) => {
    if (completionPercentage === 0) {
      return <Badge variant="destructive">Not Started</Badge>
    } else if (completionPercentage < 100) {
      return <Badge variant="secondary">In Progress ({completionPercentage}%)</Badge>
    } else {
      return (
        <Badge variant="default" className="bg-green-600">
          Completed
        </Badge>
      )
    }
  }

  const getOrdinalSuffix = (num: number) => {
    const suffixes = ["th", "st", "nd", "rd"]
    const v = num % 100
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by faculty name, subject, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {departments.length > 1 && (
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.abbreviation} - {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedForms.length} of {forms.length} forms
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">
                <Button variant="ghost" onClick={() => handleSort("faculty_name")} className="h-auto p-0 font-semibold">
                  Faculty Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[200px]">
                <Button variant="ghost" onClick={() => handleSort("subject_name")} className="h-auto p-0 font-semibold">
                  Subject
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px]">
                <Button variant="ghost" onClick={() => handleSort("department")} className="h-auto p-0 font-semibold">
                  Department
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[80px]">
                <Button variant="ghost" onClick={() => handleSort("semester")} className="h-auto p-0 font-semibold">
                  Semester
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[120px]">CIE Progress</TableHead>
              <TableHead className="min-w-[100px]">
                <Button variant="ghost" onClick={() => handleSort("completion")} className="h-auto p-0 font-semibold">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold">
                  Created Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {forms.length === 0 ? "No CIE forms found." : "No forms match your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.users?.name || "Unknown Faculty"}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{form.subjects?.name || "Unknown Subject"}</div>
                      <div className="text-sm text-gray-500">{form.subjects?.code || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{form.subjects?.departments?.abbreviation_depart || "UNK"}</div>
                      <div className="text-xs text-gray-500">
                        {form.subjects?.departments?.institutes?.abbreviation_insti || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {form.subjects?.semester || 0}
                    <sup className="text-[0.6rem]">{getOrdinalSuffix(form.subjects?.semester || 0)}</sup>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {form.totalActualCies} / {form.totalPlannedCies}
                      </div>
                      <div className="text-gray-500">{form.completionPercentage}% Complete</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(form.completionPercentage)}</TableCell>
                  <TableCell>{new Date(form.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(form.id)}
                        className="h-8 w-8 p-0"
                        title="View CIE Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(form.id)}
                        className="h-8 w-8 p-0"
                        title="Print CIE Form"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
