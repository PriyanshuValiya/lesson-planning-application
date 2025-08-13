"use client";

import { useDashboardContext } from "@/context/DashboardContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type RoleDataItem } from "@/context/DashboardContext";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";

export default function FacultyDashboard() {
  const { userData, roleData, currentRole, setCurrentRole } =
    useDashboardContext();
  const [department, setDepartment] = useState<string | null>(null);

  const uniqueRoles = useMemo(() => {
    const unique = new Map<string, RoleDataItem>();
    roleData.forEach((role) => {
      if (!unique.has(role.role_name)) {
        unique.set(role.role_name, role);
      }
    });
    return Array.from(unique.values());
  }, [roleData]);

  const handleRoleChange = (roleName: string) => {
    const selectedRole = roleData.find((role) => role.role_name === roleName);
    if (selectedRole) {
      setCurrentRole(selectedRole);
    }
  };

  useEffect(() => {
    const getDepartment = async () => {
      const { data: depart, error: deprtError } = await supabase
        .from("users")
        .select("departments(*)")
        .eq("id", userData.id)
        .single();

      if (deprtError) {
        console.error("Error fetching department:", deprtError);
      } else {
        //@ts-expect-error
        setDepartment(depart.departments?.name || null);
      }
    };

    if (userData.id) {
      getDepartment();
    }
  }, []);

  return (
    <div className="min-h-screen pt-3 px-5">
      <div className="flex justify-between items-center px-5 py-3 border-2 rounded-lg">
        <p className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
          {currentRole.role_name} Dashboard
        </p>
        <div>
          <Select
            onValueChange={handleRoleChange}
            value={currentRole.role_name}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={currentRole.role_name} />
            </SelectTrigger>
            <SelectContent>
              {uniqueRoles.map((role, idx) => (
                <SelectItem value={role.role_name} key={idx}>
                  {role.role_name === "Faculty"
                    ? "Subject Teacher"
                    : role.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-5 pl-2">
        <h2 className="text-3xl font-bold text-[#1A5CA1] mb-2">
          Welcome {userData.name}
        </h2>
        <p className="text-xl text-gray-700 mb-1">
          Subject Teacher, {department || ""}
        </p>
        <p className="text-xl text-gray-900 font-semibold uppercase tracking-wide">
          {currentRole?.departments?.institutes?.name || "Institute"}
        </p>
      </div>
    </div>
  );
}
