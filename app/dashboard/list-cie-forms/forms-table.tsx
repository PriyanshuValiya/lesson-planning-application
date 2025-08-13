"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { EyeIcon, ArrowUpDown, CheckCircle, XCircle, Clock } from "lucide-react"

export default function FormsTable({
  cies,
  allDepartments,
  isPrincipal,
  userrole,
  currentDepartmentIds,
}: {
  cies: any[]
  allDepartments: any[]
  isPrincipal: boolean
  userrole: any[]
  currentDepartmentIds: string[]
}) {
  const router = useRouter()
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  const filteredCies = isPrincipal
    ? selectedDepartment === "all"
      ? cies
      : cies.filter((cie) => cie.department_id === selectedDepartment)
    : cies.filter((cie) => currentDepartmentIds.includes(cie.department_id))

  const sortedCies = [...filteredCies]
  if (sortConfig !== null) {
    sortedCies.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const handleViewCie = (cieId: string) => {
    router.push(`/dashboard/cie-forms/${cieId}/view`)
  }

  const renderStatusBadge = (isSubmitted: boolean, qualityReviewCompleted: boolean) => {
    if (qualityReviewCompleted) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    } else if (isSubmitted) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Under Review
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        {isPrincipal && allDepartments.length > 1 && (
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[250px] cursor-pointer">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {allDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("cie_number")} className="p-0 text-lg">
                  CIE # <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("faculty_name")} className="p-0 text-lg">
                  Faculty Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("subject_name")} className="p-0 text-lg">
                  Subject <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("semester")} className="p-0 text-lg">
                  Sem <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("actual_marks")} className="p-0 text-lg">
                  Marks <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("actual_date")} className="p-0 text-lg">
                  Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {isPrincipal && (
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("department_name")} className="p-0 text-lg">
                    Depart. <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-lg">Status</TableHead>
              <TableHead className="text-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCies.length > 0 ? (
              sortedCies.map((cie, index) => (
                <TableRow key={cie.id || index}>
                  <TableCell className="text-base pl-5 font-medium">{cie.cie_number || "-"}</TableCell>
                  <TableCell className="text-base pl-5">{cie.faculty_name}</TableCell>
                  <TableCell className="text-base pl-5">
                    <div>
                      <div className="font-medium">{cie.subject_name}</div>
                      <div className="text-sm text-gray-500">{cie.subject_code}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-base pl-5">{cie.semester}</TableCell>
                  <TableCell className="text-base pl-5">{cie.actual_marks || "-"}</TableCell>
                  <TableCell className="text-base pl-5">{cie.actual_date || "-"}</TableCell>
                  {isPrincipal && <TableCell className="text-base pl-5">{cie.abbreviation}</TableCell>}
                  <TableCell className="pl-5">
                    {renderStatusBadge(cie.is_submitted, cie.quality_review_completed)}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewCie(cie.id)}>
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isPrincipal ? 9 : 8} className="text-center py-8">
                  No CIE forms found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
