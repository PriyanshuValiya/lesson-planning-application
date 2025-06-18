/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
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
import { EyeIcon, ArrowUpDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Form = {
  id: string;
  created_at: string;
  form: any;
  complete_general?: boolean;
  complete_unit?: boolean;
  complete_practical?: boolean;
  complete_cie?: boolean;
  complete_additional?: boolean;
  users: {
    id: string;
    auth_id: string;
    name: string;
    email: string;
  };
  subjects: {
    id: string;
    name: string;
    code: string;
    departments: {
      id: string;
      name: string;
      abbreviation_depart: string;
      institutes: {
        id: string;
        name: string;
      };
    };
  };
};

type UserRole = {
  id: string;
  user_id: string;
  role_name: string;
  depart_id: string;
  institute?: string;
  departments?: {
    id: string;
    name: string;
  };
  institutes?: {
    id: string;
    name: string;
  };
};

type Department = {
  id: string;
  name: string;
};

type FormsTableProps = {
  forms: Form[];
  userrole: UserRole[];
  allDepartments: Department[];
};

export default function FormsTable({
  forms,
  userrole,
  allDepartments,
}: FormsTableProps) {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get user role information
  const userRole = userrole[0];
  const isPrincipal = userRole?.role_name === "Principal";
  let isHOD = false;

  for (const role of userrole) {
    if (role.role_name === "HOD") {
      isHOD = true;
      break;
    }
  }
  // Get completion status
  const getCompletionStatus = (form: Form) => {
    const completionFields = [
      form.complete_general,
      form.complete_unit,
      form.complete_practical,
      form.complete_cie,
      form.complete_additional,
    ];

    const completedCount = completionFields.filter(Boolean).length;
    const totalFields = completionFields.length;

    if (completedCount === totalFields) {
      return { status: "Complete", variant: "default" as const };
    } else if (completedCount > 0) {
      return {
        status: `${completedCount}/${totalFields} Complete`,
        variant: "secondary" as const,
      };
    } else {
      return { status: "Not Started", variant: "destructive" as const };
    }
  };

  // Filter forms by selected department (for principal)
  const departmentFilteredForms = useMemo(() => {
    if (!isPrincipal || selectedDepartment === "all") {
      return forms;
    }
    return forms.filter(
      (form) => form.subjects.departments.id === selectedDepartment
    );
  }, [forms, selectedDepartment, isPrincipal]);

  // Sort forms
  const sortedForms = useMemo(() => {
    if (!sortField) return departmentFilteredForms;

    return [...departmentFilteredForms].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      switch (sortField) {
        case "faculty":
          aValue = a.users.name;
          bValue = b.users.name;
          break;
        case "subject":
          aValue = a.subjects.name;
          bValue = b.subjects.name;
          break;
        case "code":
          aValue = a.subjects.code;
          bValue = b.subjects.code;
          break;
        case "department":
          aValue = a.subjects.departments.name;
          bValue = b.subjects.departments.name;
          break;
        case "date":
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        default:
          return 0;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [departmentFilteredForms, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return (
      <ArrowUpDown
        className={`ml-2 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`}
      />
    );
  };

  const handleOnView = async (userId: string, formId: string) => {
    const { data: IdData, error: IdError } = await supabase
      .from("user_role")
      .select("*")
      .eq("subject_id", formId)
      .eq("user_id", userId);
      // .single();

    if (IdError) {
      console.error("Error fetching user role for form:", IdError);
      return;
    }
    
    router.push(`/dashboard/lesson-plans/${IdData[0].id}/view-lp`);
  };

  
  const handleOnPrint = async (userId: string, formId: string) => {
    const { data: IdData, error: IdError } = await supabase
      .from("user_role")
      .select("*")
      .eq("subject_id", formId)
      .eq("user_id", userId);
      // .single();

    if (IdError) {
      console.error("Error fetching user role for form:", IdError);
      return;
    }

    if(!IdData || IdData.length === 0) {
      console.error("No user role found for the given form and user.");
      return;
    }
    
    router.push(`/print/${IdData[0].id}`);
  };

  return (
    <div className="space-y-4">
      {/* Header with role info and department filter */}
      <div className="flex justify-end items-center">
        {isPrincipal && allDepartments.length > 1 && (
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[300px] cursor-pointer">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="all">
                All Departments
              </SelectItem>
              {allDepartments.map((dept) => (
                <SelectItem
                  key={dept.id}
                  value={dept.id}
                  className="cursor-pointer"
                >
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{sortedForms.length}</div>
          <div className="text-sm text-blue-800">Total Forms</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {sortedForms.filter((form) => getCompletionStatus(form).status === "Complete").length}
          </div>
          <div className="text-sm text-green-800">Completed Forms</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {sortedForms.filter((form) => getCompletionStatus(form).status === "Not Started").length}
          </div>
          <div className="text-sm text-orange-800">Pending Forms</div>
        </div>
      </div> */}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-black font-bold text-lg">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("faculty")}
                  className="h-auto p-0 font-bold text-lg hover:bg-transparent"
                >
                  Faculty Name
                  {getSortIcon("faculty")}
                </Button>
              </TableHead>
              <TableHead className="text-black font-bold text-lg">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("subject")}
                  className="h-auto p-0 font-bold text-lg hover:bg-transparent"
                >
                  Subject Name
                  {getSortIcon("subject")}
                </Button>
              </TableHead>
              <TableHead className="text-black font-bold text-lg">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("code")}
                  className="h-auto p-0 font-bold text-lg hover:bg-transparent"
                >
                  Subject Code
                  {getSortIcon("code")}
                </Button>
              </TableHead>
              {isPrincipal && (
                <TableHead className="text-black font-bold text-lg">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("department")}
                    className="h-auto p-0 font-bold text-lg hover:bg-transparent"
                  >
                    Department
                    {getSortIcon("department")}
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-black font-bold text-lg">
                Status
              </TableHead>
              {/* <TableHead className="text-black font-bold text-lg">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("date")}
                  className="h-auto p-0 font-bold text-lg hover:bg-transparent"
                >
                  Created Date
                  {getSortIcon("date")}
                </Button>
              </TableHead> */}
              <TableHead className="text-black font-bold text-lg">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedForms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isPrincipal ? 7 : 6}
                  className="text-center py-8 text-gray-500"
                >
                  No lesson plan forms found.
                </TableCell>
              </TableRow>
            ) : (
              sortedForms.map((form) => {
                const completionStatus = getCompletionStatus(form);
                return (
                  <TableRow className="hover:bg-gray-50 text-lg" key={form.id}>
                    <TableCell className="pl-5">{form.users.name}</TableCell>
                    <TableCell className="pl-5">{form.subjects.name}</TableCell>
                    <TableCell className="pl-5">{form.subjects.code}</TableCell>
                    {isPrincipal && (
                      <TableCell className="pl-5">
                        {form.subjects.departments.abbreviation_depart}
                      </TableCell>
                    )}
                    <TableCell className="">
                      <Badge variant={completionStatus.variant}>
                        {completionStatus.status}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="pl-5">
                      {new Date(form.created_at).toLocaleDateString()}
                    </TableCell> */}
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* <Link
                          href={`/dashboard/lesson-plans/${form.subjects.id}/view-lp`}
                        > */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOnView(form.users.auth_id, form.subjects.id)}
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOnPrint(form.users.auth_id, form.subjects.id)}
                        >
                            <Printer className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
