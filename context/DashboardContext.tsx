// 'use client';

// import { createContext, useContext, ReactNode, useState } from "react";

// type UserData = {
//   id: string;
//   auth_id: string;
//   email: string;
//   profile_photo: string | null;
//   name: string;
// };

// type RoleDataItem = {
//   id: string;
//   role_name: string;
//   user_id: string;
//   depart_id: string;
//   departments: {
//     id: string;
//     name: string;
//     abbreviation_depart: string;
//     institutes: {
//       id: string;
//       name: string;
//       abbreviation_insti: string;

//     }
//   }
// };

// interface DashboardContextType {
//   userData: UserData;
//   roleData: RoleDataItem[];
//   currentRole: RoleDataItem;
//   setCurrentRole: (role: RoleDataItem) => void;
// }
// const DashboardContext = createContext<DashboardContextType | null>(null);

// export const DashboardProvider = ({ 
//   children,
//   value 
// }: { 
//   children: ReactNode;
//   value: Omit<DashboardContextType, 'currentRole' | 'setCurrentRole'>;
// }) => {
//   const [currentRole, setCurrentRole] = useState<RoleDataItem>(value.roleData[0]);

//   return (
//     <DashboardContext.Provider value={{ ...value, currentRole, setCurrentRole }}>
//       {children}
//     </DashboardContext.Provider>
//   );
// };

// export const useDashboardContext = () => {
//   const context = useContext(DashboardContext);
//   if (!context) {
//     throw new Error("useDashboardContext must be used within DashboardProvider");
//   }
//   return context;
// };

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

type DashboardContextType = {
  userData: any
  roleData: any[]
  currentRole: any
  setCurrentRole: (role: any) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: { userData: any; roleData: any[] }
}) {
  const { userData, roleData } = value
  const [currentRole, setCurrentRole] = useState<any>({})
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (roleData && roleData.length > 0) {
      // Check if any role is HOD
      const hodRole = roleData.find((role) => role.role_name === "HOD")

      // If we're on the HOD page and there's an HOD role, set it as current
      if (pathname.includes("/dashboard/hod") && hodRole) {
        setCurrentRole(hodRole)
      }
      // Otherwise, set the first role as current
      else if (!currentRole.role_name) {
        setCurrentRole(roleData[0])
      }
    }
  }, [roleData, pathname, currentRole])

  const handleSetCurrentRole = (role: any) => {
    setCurrentRole(role)

    // If changing to HOD role, redirect to HOD dashboard
    if (role.role_name === "HOD" && !pathname.includes("/dashboard/hod")) {
      router.push("/dashboard/hod")
    }
    // If changing from HOD role to another role, redirect to main dashboard
    else if (role.role_name !== "HOD" && pathname.includes("/dashboard/hod")) {
      router.push("/dashboard")
    }
  }

  return (
    <DashboardContext.Provider
      value={{
        userData,
        roleData,
        currentRole,
        setCurrentRole: handleSetCurrentRole,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider")
  }
  return context
}
