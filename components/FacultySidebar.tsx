"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, LogOut, ChevronLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { useDashboardContext } from "@/context/DashboardContext"

interface FacultySidebarProps {
  signOut: () => void
}

export default function FacultySidebar({ signOut }: FacultySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { userData, currentRole } = useDashboardContext()

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
      <div className="p-4 border-b">
        <div className="flex items-center justify-center space-x-2">
          <Avatar className="h-16 w-16">
            {userData.profile_photo ? (
              <Image
                src={userData.profile_photo || "/placeholder.svg"}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback className="text-2xl bg-[#1A5CA1] text-white">{getInitials(userData.name)}</AvatarFallback>
            )}
          </Avatar>
          {!isCollapsed && (
            <div className="pt-1">
              <p className="text-[#1A5CA1] font-bold text-xl">{userData.name}</p>
              <p className="text-gray-600">Subject Teacher</p>
            </div>
          )}
        </div>
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
          className="group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50 focus:outline-none focus:bg-blue-100 transition ease-in-out duration-150 mb-2"
        >
          <Home className="h-5 w-5 text-gray-500 group-hover:text-[#1A5CA1] mr-3" />
          {!isCollapsed && <span>Home</span>}
        </Link>

        <Link
          href="/dashboard/lesson-plans"
          className="group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50 focus:outline-none focus:bg-blue-100 transition ease-in-out duration-150 mb-2"
        >
          <FileText className="h-5 w-5 text-gray-500 group-hover:text-[#1A5CA1] mr-3" />
          {!isCollapsed && <span>Lesson Planning (LP)</span>}
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-2 mb-4">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full bg-[#010922] text-white hover:bg-[#010922]/90 hover:text-white cursor-pointer flex items-center justify-center py-6"
        >
          <LogOut className="h-5 w-5 mr-2" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
