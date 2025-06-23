import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { signOut } from "@/app/actions/auth";
import ClientAttendanceMonitor from "./ClientAttendanceMonitor";

export default function AttendanceMonitorPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <CollapsibleSidebar signOut={signOut} />
      <main className="flex-1 overflow-y-auto transition-all duration-300 p-5">
        <ClientAttendanceMonitor />
      </main>
    </div>
  );
}
