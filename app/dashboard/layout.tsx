import { AuthProvider } from "@/lib/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "../actions/auth";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { redirect } from "next/navigation"; // ✅ Use this in server components

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login"); 
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
  }

  const { data: roleData, error: roleError } = await supabase
    .from("user_role")
    .select("*, departments(*, institutes(*))")
    .eq("user_id", user.id);

  if (roleError || !roleData) {
    console.error("Error fetching role data:", roleError);
    redirect("/auth/login");
  }

  return (
    <AuthProvider>
      <DashboardProvider value={{ userData, roleData }}>
        <div className="flex h-screen bg-gray-100">
          <CollapsibleSidebar signOut={signOut} />
          <main className="flex-1 overflow-y-auto p-5 transition-all duration-300">
            {children}
          </main>
        </div>
      </DashboardProvider>
    </AuthProvider>
  );
}
