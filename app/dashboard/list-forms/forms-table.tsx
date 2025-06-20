"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { EyeIcon, Printer, ArrowUpDown } from "lucide-react";

export default function FormsTable({
  forms,
  allDepartments,
  isPrincipal,
  userrole,
  currentDepartmentIds,
}: {
  forms: any[];
  allDepartments: any[];
  isPrincipal: boolean;
  userrole: any[];
  currentDepartmentIds: string[];
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);

  // Get current user's name and department for display
  const currentUser = userrole[0]?.users?.name || "User";
  const currentDepartment = userrole[0]?.departments?.name || "Department";

  // Filter forms based on selected department (for Principal) or current department (for HOD)
  const filteredForms = isPrincipal
    ? selectedDepartment === "all"
      ? forms
      : forms.filter((form) => form.department_id === selectedDepartment)
    : forms.filter((form) => currentDepartmentIds.includes(form.department_id));

  // Sort the forms
  const sortedForms = [...filteredForms];
  if (sortConfig !== null) {
    sortedForms.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleOnClick = (userID: string, subjectID: string, action: string) => {
    console.log(userID, subjectID, action);
  }

  console.log(forms[0]);

  return (
    <div className="space-y-4">
      {/* User header */}
      <div className="flex justify-end items-center">
        {isPrincipal && allDepartments.length > 1 && (
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[250px] cursor-pointer">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Departments</SelectItem>
              {allDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id} className="cursor-pointer">
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Forms table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("faculty_name")}
                  className="p-0 text-lg"
                >
                  Faculty Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("subject_name")}
                  className="p-0 text-lg"
                >
                  Subject Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("subject_code")}
                  className="p-0 text-lg"
                >
                  Subject Code
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("semester")}
                  className="p-0 text-lg"
                >
                  Sem
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {isPrincipal && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("department_name")}
                    className="p-0 text-lg"
                  >
                    Depart.
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedForms.length > 0 ? (
              sortedForms.map((form, index) => (
                <TableRow key={index}>
                  <TableCell className="text-base pl-5">
                    {form.faculty_name}
                  </TableCell>
                  <TableCell className="text-base pl-5">{form.subject_name}</TableCell>
                  <TableCell className="text-base pl-5">{form.subject_code}</TableCell>
                  <TableCell className="text-base pl-5">{form.semester}</TableCell>
                  {isPrincipal && <TableCell className="text-base pl-5">{form.abbreviation}</TableCell>}
                  <TableCell className="space-x-2">
                    {form.has_form ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleOnClick(form.faculty_id, form.subject_id, 'view')}>
                          <EyeIcon />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOnClick(form.faculty_id, form.subject_id, 'print')}>
                          <Printer />
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-500">
                        <>
                          <Button variant="outline" size="sm" disabled>
                            <EyeIcon />
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Printer />
                          </Button>
                        </>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isPrincipal ? 6 : 5}
                  className="text-center"
                >
                  No lesson planning forms found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
