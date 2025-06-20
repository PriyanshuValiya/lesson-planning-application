"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { EyeIcon, Printer, ArrowUpDown, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";

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
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [loadingRow, setLoadingRow] = useState<string | null>(null);

  const currentUser = userrole[0]?.users?.name || "User";
  const currentDepartment = userrole[0]?.departments?.name || "Department";

  const filteredForms = isPrincipal
    ? selectedDepartment === "all"
      ? forms
      : forms.filter((form) => form.department_id === selectedDepartment)
    : forms.filter((form) => currentDepartmentIds.includes(form.department_id));

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

  const handleOnClick = async (
    userID: string,
    subjectID: string,
    action: string
  ) => {
    const rowKey = `${userID}-${subjectID}-${action}`;
    setLoadingRow(rowKey);

    const { data: formData, error: formError } = await supabase
      .from("user_role")
      .select("id")
      .eq("user_id", userID)
      .eq("subject_id", subjectID);

    if (formError || !formData || formData.length === 0) {
      toast.error(
        `No lesson planning form found for ${currentUser} in ${currentDepartment} for the selected subject.`
      );
      console.error("Error fetching form data:", formError);
      setLoadingRow(null);
      return;
    }

    const targetUrl =
      action === "view"
        ? `/dashboard/lesson-plans/${formData[0].id}/view-lp`
        : `/print/${formData[0].id}`;

    router.push(targetUrl);
  };

  return (
    <div className="space-y-4">
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
                <Button
                  variant="ghost"
                  onClick={() => requestSort("faculty_name")}
                  className="p-0 text-lg"
                >
                  Faculty Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("subject_name")}
                  className="p-0 text-lg"
                >
                  Subject Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("subject_code")}
                  className="p-0 text-lg"
                >
                  Subject Code <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("semester")}
                  className="p-0 text-lg"
                >
                  Sem <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {isPrincipal && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("department_name")}
                    className="p-0 text-lg"
                  >
                    Depart. <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedForms.length > 0 ? (
              sortedForms.map((form, index) => {
                const rowKeyView = `${form.faculty_id}-${form.subject_id}-view`;
                const rowKeyPrint = `${form.faculty_id}-${form.subject_id}-print`;

                return (
                  <TableRow key={index}>
                    <TableCell className="text-base pl-5">
                      {form.faculty_name}
                    </TableCell>
                    <TableCell className="text-base pl-5">
                      {form.subject_name}
                    </TableCell>
                    <TableCell className="text-base pl-5">
                      {form.subject_code}
                    </TableCell>
                    <TableCell className="text-base pl-5">
                      {form.semester}
                    </TableCell>
                    {isPrincipal && (
                      <TableCell className="text-base pl-5">
                        {form.abbreviation}
                      </TableCell>
                    )}
                    <TableCell className="space-x-2">
                      {form.has_form ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingRow === rowKeyView}
                            onClick={() =>
                              handleOnClick(
                                form.faculty_id,
                                form.subject_id,
                                "view"
                              )
                            }
                          >
                            {loadingRow === rowKeyView ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingRow === rowKeyPrint}
                            onClick={() =>
                              handleOnClick(
                                form.faculty_id,
                                form.subject_id,
                                "print"
                              )
                            }
                          >
                            {loadingRow === rowKeyPrint ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Printer className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" disabled>
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Printer className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
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
