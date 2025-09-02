"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  LogOut,
  ChevronLeft,
  FileText,
  Target,
  Upload,
  FileLock2,
  UserCheck,
  List,
  ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { useDashboardContext } from "@/context/DashboardContext";
import { usePathname } from "next/navigation";
import PsoPeoManagementModal from "@/components/modals/PsoPeoManagementModal";
import ProfilePhotoUploadModal from "@/components/modals/ProfilePhotoUploadModal";
import GuidelineModel from "@/components/modals/GuidelineModel";

interface CollapsibleSidebarProps {
  signOut: () => void;
}

export default function CollapsibleSidebar({ signOut }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userData, currentRole, updateUserData } = useDashboardContext();
  const pathname = usePathname();
  const [isPsoPeoModalOpen, setIsPsoPeoModalOpen] = useState(false);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);

  // Special case: Faculty who can see Principal dashboard
  const canAccessPrincipalDashboard = userData.email === "radhikapatel.it@charusat.ac.in";

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  // Check if user has a profile photo
  const hasProfilePhoto =
    userData.profile_photo &&
    userData.profile_photo !== "NULL" &&
    userData.profile_photo !== null;

  // Handle photo upload completion
  const handlePhotoUploaded = (photoUrl: string) => {
    updateUserData({
      ...userData,
      profile_photo: photoUrl,
    });
  };

  // Handle photo deletion completion
  const handlePhotoDeleted = () => {
    updateUserData({
      ...userData,
      profile_photo: null,
    });
  };

  // Determine user display role
  const getDisplayRole = () => {
    if (currentRole?.role_name === "Faculty") {
      return "Subject Teacher";
    }
    return currentRole?.role_name || "User";
  };

  // Check if user should see HOD features
  const shouldShowHODFeatures = currentRole?.role_name === "HOD";
  
  // Check if user should see Principal features
  const shouldShowPrincipalFeatures = 
    currentRole?.role_name === "Principal" || canAccessPrincipalDashboard;
  
  // Check if user should see Faculty features
  const shouldShowFacultyFeatures = 
    currentRole?.role_name === "Faculty";

  return (
    <>
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-white shadow-md flex flex-col h-screen relative transition-all duration-300`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-20 w-20 mb-3">
              {hasProfilePhoto ? (
                <Image
                  src={userData.profile_photo || "/placeholder.svg"}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <AvatarFallback className="text-2xl bg-[#1A5CA1] text-white">
                  {getInitials(userData.name)}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Upload/Update photo button - always visible for easy access */}
            {!isCollapsed && (
              <button
                onClick={() => setIsPhotoUploadModalOpen(true)}
                className="absolute bottom-2 right-0 bg-white rounded-full p-1 shadow-md border hover:bg-gray-50 cursor-pointer"
                title={
                  hasProfilePhoto
                    ? "Update profile photo"
                    : "Upload profile photo"
                }
              >
                <Upload className="h-4 w-4 text-[#1A5CA1]" />
              </button>
            )}
          </div>

          {!isCollapsed && (
            <div className="text-center">
              <p className="text-[#1A5CA1] font-bold text-xl">
                {userData.name}
              </p>
              <p className="text-gray-600">
                {getDisplayRole()}
              </p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 p-1.5 rounded-full bg-white shadow-md border text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
        >
          <ChevronLeft
            className={`h-4 w-4 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Navigation */}
        <nav className="mt-5 px-2 flex-grow">
          <div className="flex flex-col justify-between h-[87%]">
            <div>
              {/* Home Link */}
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
                    pathname === "/dashboard"
                      ? "text-[#1A5CA1]"
                      : "text-gray-500 group-hover:text-[#1A5CA1]"
                  }`}
                />
                {!isCollapsed && <span>Home</span>}
              </Link>

              {/* HOD Features */}
              {shouldShowHODFeatures && (
                <>
                  <Link href="/dashboard/list-forms">
                    <button
                      className={`cursor-pointer group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50`}
                    >
                      <List className="h-5 w-5 mr-3 text-gray-500 group-hover:text-[#1A5CA1]" />
                      {!isCollapsed && <span>View LP Forms</span>}
                    </button>
                  </Link>
                  
                  <Link href="/dashboard/list-cie-forms">
                    <button
                      className={`cursor-pointer group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50`}
                    >
                      <ScrollText className="h-5 w-5 mr-3 text-gray-500 group-hover:text-[#1A5CA1]" />
                      {!isCollapsed && <span>View CIE Forms</span>}
                    </button>
                  </Link>

                  <button
                    onClick={() => setIsPsoPeoModalOpen(true)}
                    className={`cursor-pointer group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50`}
                  >
                    <Target className="h-5 w-5 mr-3 text-gray-500 group-hover:text-[#1A5CA1]" />
                    {!isCollapsed && <span>PSO/PEO Management</span>}
                  </button>
                </>
              )}

              {/* Principal Features */}
              {shouldShowPrincipalFeatures && (
                <>
                  <Link href="/dashboard/list-forms">
                    <button
                      className={`cursor-pointer group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50`}
                    >
                      <List className="h-5 w-5 mr-3 text-gray-500 group-hover:text-[#1A5CA1]" />
                      {!isCollapsed && <span>View LP Forms</span>}
                    </button>
                  </Link>
                  
                  <Link href="/dashboard/list-cie-forms">
                    <button
                      className={`cursor-pointer group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 w-full text-left text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50`}
                    >
                      <ScrollText className="h-5 w-5 mr-3 text-gray-500 group-hover:text-[#1A5CA1]" />
                      {!isCollapsed && <span>View CIE Forms</span>}
                    </button>
                  </Link>
                </>
              )}

              {/* Faculty Features */}
              {shouldShowFacultyFeatures && (
                <>
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
                </>
              )}
            </div>
          </div>
          
          {/* Guidelines Link */}
          <div>
            <button
              onClick={() => setIsGuidelineModalOpen(true)}
              className={`w-full cursor-pointer group flex items-center px-3 py-3 text-base leading-6 font-medium rounded-md transition ease-in-out duration-150 mb-2 text-gray-600 hover:text-[#1A5CA1] hover:bg-blue-50`}
            >
              <FileLock2
                className={`h-5 w-5 mr-3 text-gray-500 group-hover:text-[#1A5CA1]`}
              />
              {!isCollapsed && <span>Guidelines</span>}
            </button>
          </div>
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

      {/* PSO/PEO Management Modal */}
      <PsoPeoManagementModal
        isOpen={isPsoPeoModalOpen}
        onClose={() => setIsPsoPeoModalOpen(false)}
      />

      {/* Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={isPhotoUploadModalOpen}
        onClose={() => setIsPhotoUploadModalOpen(false)}
        userId={userData.id}
        currentPhotoUrl={userData.profile_photo}
        onPhotoUploaded={handlePhotoUploaded}
        onPhotoDeleted={handlePhotoDeleted}
      />
      
      {/* Guidelines Modal */}
      <GuidelineModel
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
      />
    </>
  );
}