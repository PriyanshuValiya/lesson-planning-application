// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Home, LogOut, ChevronLeft, FileText, Users } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import Image from "next/image"
// import { useDashboardContext } from "@/context/DashboardContext"
// import { useRouter, usePathname } from "next/navigation"

// interface FacultySidebarProps {
//   signOut: () => void
// }

// export default function FacultySidebar({ signOut }: FacultySidebarProps) {
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const { userData, roleData, currentRole, setCurrentRole } = useDashboardContext()
//   const router = useRouter()
//   const pathname = usePathname()

//   // Get initials for avatar fallback
//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//   }

//   // Check if user has HOD role
//   const hasHODRole = roleData?.some((role) => role.role_name === "HOD")
//   const hasFacultyRole = roleData?.some((role) => role.role_name === "Faculty")

//   // Determine current role display
//   const getCurrentRoleDisplay = () => {
//     if (hasFacultyRole && hasHODRole) {
//       return currentRole?.role_name || "Faculty & HOD"
//     } else if (hasHODRole) {
//       return "HOD"
//     } else if (hasFacultyRole) {
//       return "Subject Teacher"
//     }
//     return "User"
//   }

//   const handleHODDashboard = () => {
//     const hodRole = roleData?.find((role) => role.role_name === "HOD")
//     if (hodRole) {
//       setCurrentRole(hodRole)
//       router.push("/dashboard/hod")
//     }
//   }

//   const handleHomeDashboard = () => {
//     const facultyRole = roleData?.find((role) => role.role_name === "Faculty")
//     if (facultyRole) {
//       setCurrentRole(facultyRole)
//     }
//     router.push("/dashboard")
//   }

//   return (
//     <aside
//       className={`${
//         isCollapsed ? "w-20" : "w-64"
//       } bg-white shadow-md flex flex-col h-screen relative transition-all duration-300`}
//     >
//       {/* Sidebar Header */}
//       <div className="p-4 border-b">
//         <div className="flex items-center justify-center space-x-2">
//           <Avatar className="h-16 w-16">
//             {userData.profile_photo ? (
//               <Image
//                 src={userData.profile_photo || "/placeholder.svg"}
//                 alt="Profile"
//                 width={64}
//                 height={64}
//                 className="rounded-full"
//               />
//             ) : (
//               <AvatarFallback className="text-2xl bg-[#1A5CA1] text-white">{getInitials(userData.name)}</AvatarFallback>
//             )}
//           </Avatar>
//           {!isCollapsed && (
//             <div className="pt-1">
//               <p className="text-[#1A5CA1] font-bold text-xl">{userData.name}</p>
//               <p className="text-gray-600">{getCurrentRoleDisplay()}</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsCollapsed(!isCollapsed)}
//         className="absolute -right-3 top-24 p-1.5 rounded-full bg-white shadow-md border text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
//       >
//         <ChevronLeft className={`h-4 w-4 ${isCollapsed ? "rotate-180" : ""}`} />
//       </button>

//       {/* Navigation */}
//       <nav className="mt-5 px-2 flex-grow">
//         <button
//           onClick={handleHomeDashboard}
//           className={`group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left ${
//             pathname === "/dashboard" && currentRole?.role_name === "Faculty"
//               ? "text-[#1A5CA1] bg-blue-50"
//               : "text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50"
//           }`}
//         >
//           <Home
//             className={`h-5 w-5 mr-3 ${
//               pathname === "/dashboard" && currentRole?.role_name === "Faculty"
//                 ? "text-[#1A5CA1]"
//                 : "text-gray-500 group-hover:text-[#1A5CA1]"
//             }`}
//           />
//           {!isCollapsed && <span>Home</span>}
//         </button>

//         {hasFacultyRole && (
//           <Link
//             href="/dashboard/lesson-plans"
//             className={`group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 ${
//               pathname.startsWith("/dashboard/lesson-plans")
//                 ? "text-[#1A5CA1] bg-blue-50"
//                 : "text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50"
//             }`}
//           >
//             <FileText
//               className={`h-5 w-5 mr-3 ${
//                 pathname.startsWith("/dashboard/lesson-plans")
//                   ? "text-[#1A5CA1]"
//                   : "text-gray-500 group-hover:text-[#1A5CA1]"
//               }`}
//             />
//             {!isCollapsed && <span>Lesson Planning (LP)</span>}
//           </Link>
//         )}

//         {hasHODRole && (
//           <button
//             onClick={handleHODDashboard}
//             className={`group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left ${
//               pathname.startsWith("/dashboard/hod")
//                 ? "text-[#1A5CA1] bg-blue-50"
//                 : "text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50"
//             }`}
//           >
//             <Users
//               className={`h-5 w-5 mr-3 ${
//                 pathname.startsWith("/dashboard/hod") ? "text-[#1A5CA1]" : "text-gray-500 group-hover:text-[#1A5CA1]"
//               }`}
//             />
//             {!isCollapsed && <span>HOD Dashboard</span>}
//           </button>
//         )}
//       </nav>

//       {/* Footer */}
//       <div className="px-2 mb-4">
//         <Button
//           onClick={signOut}
//           variant="ghost"
//           className="w-full bg-[#010922] text-white hover:bg-[#010922]/90 hover:text-white cursor-pointer flex items-center justify-center py-6"
//         >
//           <LogOut className="h-5 w-5 mr-2" />
//           {!isCollapsed && <span>Logout</span>}
//         </Button>
//       </div>
//     </aside>
//   )
// }
"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, LogOut, ChevronLeft, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { useDashboardContext } from "@/context/DashboardContext"
import { usePathname } from "next/navigation"

interface FacultySidebarProps {
  signOut: () => void
}

export default function FacultySidebar({ signOut }: FacultySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { userData, currentRole } = useDashboardContext()
  const pathname = usePathname()

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white shadow-md flex flex-col h-screen relative transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-3">
          {userData.profile_photo && userData.profile_photo !== "NULL" ? (
            <Image
              src={userData.profile_photo || "/placeholder.svg"}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <AvatarFallback className="text-2xl bg-[#1A5CA1] text-white">
              <User className="h-10 w-10" />
            </AvatarFallback>
          )}
        </Avatar>
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-[#1A5CA1] font-bold text-xl">{userData.name}</p>
            <p className="text-gray-600">Subject Teacher</p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 p-1.5 rounded-full bg-white shadow-md border text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
      >
        <ChevronLeft className={`h-4 w-4 ${isCollapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Navigation */}
      <nav className="mt-5 px-2 flex-grow">
        <Link
          href="/dashboard"
          className={`group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left ${
            pathname === "/dashboard"
              ? "text-[#1A5CA1] bg-blue-50"
              : "text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50"
          }`}
        >
          <Home
            className={`h-5 w-5 mr-3 ${
              pathname === "/dashboard" ? "text-[#1A5CA1]" : "text-gray-500 group-hover:text-[#1A5CA1]"
            }`}
          />
          {!isCollapsed && <span>Home</span>}
        </Link>

        <Link
          href="/dashboard/lesson-plans"
          className={`group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 ${
            pathname.startsWith("/dashboard/lesson-plans")
              ? "text-[#1A5CA1] bg-blue-50"
              : "text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50"
          }`}
        >
          <FileText
            className={`h-5 w-5 mr-3 ${
              pathname.startsWith("/dashboard/lesson-plans")
                ? "text-[#1A5CA1]"
                : "text-gray-500 group-hover:text-[#1A5CA1]"
            }`}
          />
          {!isCollapsed && <span>Lesson Planning (LP)</span>}
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-2 mb-4">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full bg-[#010922] text-white hover:bg-[#010922]/90 hover:text-white cursor-pointer flex items-center justify-center py-6"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </form>
      </div>
    </aside>
  )
}