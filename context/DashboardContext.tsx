
// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"

// type UserData = {
//   id: string
//   auth_id: string
//   email: string
//   profile_photo: string | null
//   name: string
// }

// type RoleDataItem = {
//   id: string
//   role_name: string
//   user_id: string
//   depart_id: string
//   departments: {
//     id: string
//     name: string
//     abbreviation_depart: string
//     institutes: {
//       id: string
//       name: string
//       abbreviation_insti: string
//     }
//   }
// }

// interface DashboardContextType {
//   userData: UserData
//   roleData: RoleDataItem[]
//   currentRole: RoleDataItem
//   setCurrentRole: (role: RoleDataItem) => void
// }

// const DashboardContext = createContext<DashboardContextType | null>(null)

// export const DashboardProvider = ({
//   children,
//   value,
// }: {
//   children: React.ReactNode
//   value: Omit<DashboardContextType, "currentRole" | "setCurrentRole">
// }) => {
//   // Add null check for roleData and provide a default empty array
//   const safeRoleData = value?.roleData || []

//   // Initialize currentRole with a safe default if roleData is empty
//   const [currentRole, setCurrentRole] = useState<RoleDataItem | null>(safeRoleData.length > 0 ? safeRoleData[0] : null)

//   useEffect(() => {
//     // Only update currentRole if roleData exists and has items
//     if (value?.roleData && value.roleData.length > 0) {
//       // If currentRole is null or invalid, set it to the first role
//       if (!currentRole || !currentRole.id) {
//         setCurrentRole(value.roleData[0])
//       }
//     }
//   }, [value?.roleData, currentRole])

//   const contextValue = {
//     userData: value?.userData || ({} as UserData),
//     roleData: safeRoleData,
//     currentRole: currentRole as RoleDataItem, // Type assertion since we handle null internally
//     setCurrentRole,
//   }


//   return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>
// }

// export const useDashboardContext = () => {
//   const context = useContext(DashboardContext)
//   if (!context) {
//     throw new Error("useDashboardContext must be used within DashboardProvider")
//   }
//   return context
// }

'use client';

import { createContext, useContext, ReactNode, useState } from "react";

export type UserData = {
  id: string;
  auth_id: string;
  email: string;
  profile_photo: string | null;
  name: string;
};

export type RoleDataItem = {
  id: string;
  role_name: string;
  user_id: string;
  depart_id: string;
  departments: {
    id: string;
    name: string;
    abbreviation_depart: string;
    institutes: {
      id: string;
      name: string;
      abbreviation_insti: string;
    };
  };
};

interface DashboardContextType {
  userData: UserData;
  roleData: RoleDataItem[];
  currentRole: RoleDataItem;
  setCurrentRole: (role: RoleDataItem) => void;
}
const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider = ({ 
  children,
  value 
}: { 
  children: ReactNode;
  value: Omit<DashboardContextType, 'currentRole' | 'setCurrentRole'>;
}) => {
  const [currentRole, setCurrentRole] = useState<RoleDataItem>(value.roleData[0]);

  return (
    <DashboardContext.Provider value={{ ...value, currentRole, setCurrentRole }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return context;
};