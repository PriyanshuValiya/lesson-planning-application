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

type UserData = {
  id: string
  auth_id: string
  email: string
  profile_photo: string | null
  name: string
}

type RoleDataItem = {
  id: string
  role_name: string
  user_id: string
  depart_id: string
  departments: {
    id: string
    name: string
    abbreviation_depart: string
    institutes: {
      id: string
      name: string
      abbreviation_insti: string
    }
  }
}

interface DashboardContextType {
  userData: UserData
  roleData: RoleDataItem[]
  currentRole: RoleDataItem
  setCurrentRole: (role: RoleDataItem) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export const DashboardProvider = ({
  children,
  value,
}: {
  children: React.ReactNode
  value: Omit<DashboardContextType, "currentRole" | "setCurrentRole">
}) => {
  const [currentRole, setCurrentRole] = useState<RoleDataItem>(value.roleData[0])

  useEffect(() => {
    if (value.roleData && value.roleData.length > 0) {
      // Set the first role as default if no current role is set
      if (!currentRole || !currentRole.id) {
        setCurrentRole(value.roleData[0])
      }
    }
  }, [value.roleData, currentRole])

  return (
    <DashboardContext.Provider value={{ ...value, currentRole, setCurrentRole }}>{children}</DashboardContext.Provider>
  )
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboardContext must be used within DashboardProvider")
  }
  return context
}
