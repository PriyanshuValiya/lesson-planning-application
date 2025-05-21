"use client";
import { useState } from "react";
import { Home, BookOpen, Calendar, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [Section, setSection] = useState("home");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-0" : "w-72"
      } h-screen bg-gray-100 border-r flex flex-col transition-all duration-300 relative ${className}`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute -right-4 top-28 bg-white border border-gray-200 rounded-full p-1 shadow-md z-10 ${
          isCollapsed ? "mr-[-15px] px-4" : ""
        }`}
      >
        <ChevronRight
          className={`w-8 h-8 text-blue-600 transition-transform ${
            isCollapsed ? "mr-[-15px]" : "rotate-180"
          }`}
        />
      </button>

      {/* Sidebar Content */}
      <div
        className={`${
          isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
        } transition-opacity duration-200 flex flex-col flex-grow justify-center`}
      >
        {/* Top Section */}
        <div>
          {/* Profile Section */}
          <div className="flex items-center space-x-3 px-5 py-10 bg-white border-b-2">
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
              <span>P</span>
            </div>
            <div>
              <h2 className="text-blue-900 font-bold text-2xl">
                Dr. Parth Goel
              </h2>
              <p className="text-xs text-gray-600">Subject Teacher</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4">
            <ul className="space-y-1 px-4 ">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2 bg-primary-blue text-white rounded-full"
                >
                  <Home className="w-5 h-5 mr-3" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center px-4 py-2 hover:bg-gray-200"
                >
                  <BookOpen className="w-5 h-5 mr-3" />
                  Lesson Planning (LP)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center px-4 py-2 hover:bg-gray-200"
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Attendance Module
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Spacer to push Logout down */}
        <div className="flex-grow" />

        {/* Logout Button at Bottom */}
        <div className="mb-4 justify-center items-center px-5">
          <button className="flex items-center w-full px-8 py-2 rounded-lg text-white bg-primary-dark hover:bg-blue-800">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
