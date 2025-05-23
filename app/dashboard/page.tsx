"use client"

import { useDashboardContext } from "@/context/DashboardContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Dashboard() {
  const { userData, currentRole } = useDashboardContext()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1A5CA1]">Dashboard</h1>
        <div className="relative">
          <Select defaultValue="subject-teacher">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Subject Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subject-teacher">Subject Teacher</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1A5CA1]">Welcome {userData.name}</h2>
        <p className="text-gray-600 mt-1">
          {currentRole?.role_name}, {currentRole?.departments?.name}
        </p>
        <p className="text-gray-800 font-semibold mt-1">{currentRole?.departments?.institutes?.name}</p>
      </div>

      {/* Add more dashboard content here */}
    </div>
  )
}
