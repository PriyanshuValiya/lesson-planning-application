// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import ViewActualUnit from "./view-actual-unit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export type paramsType = Promise<{ formId: string }>;
export default async function ViewActualUnitPage(props: { params: paramsType }) {
  const { formId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication Required");
  }

  const { data: userRoleData, error: errorUserRoleData } = await supabase
    .from("user_role")
    .select("users(*), role_name, subjects(*), departments(*, institutes(*))")
    .eq("id", formId)
    .single();

  if (errorUserRoleData) {
    console.error("Error fetching user role:", errorUserRoleData);
    throw new Error("Failed to fetch user role");
  }

  const { data: allForms, error: allFormsError } = await supabase
    .from("forms")
    .select("form, id")
    .eq("faculty_id", userRoleData.users.id)
    .eq("subject_id", userRoleData.subjects.id);

  if (allFormsError) {
    console.error("Error fetching forms:", allFormsError);
    throw new Error("Failed to fetch forms");
  }

  const formUnits = allForms?.filter(
    (row) => row.form && Array.isArray(row.form.units)
  ) || [];

  const lesson_planning = formUnits[0];

  const { data: actualUnitData, error: actualUnitError } = await supabase
    .from("actual_units")
    .select("*")
    .eq("forms_id", formUnits[0]?.id);

  if (actualUnitError) {
    console.error("Error fetching actual Units:", actualUnitError);
  }

  const { data: departmentPsoPeoData, error: departmentPsoPeoError } =
    await supabase
      .from("department_pso_peo")
      .select("pso_data")
      .eq("department_id", userRoleData?.subjects?.department_id)
      .maybeSingle();

  if (departmentPsoPeoError) {
    console.error("Error fetching department PSO/PEO data:", departmentPsoPeoError);
  }

  if (!actualUnitData || actualUnitData.length === 0) {
    return (
      <div className="mx-4 mt-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[20px]">
              Actual Unit Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p>No Actual Implementation Record for this Unit</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
            Unit Implementation Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ViewActualUnit
            formsData={lesson_planning}
            actualUnitData={actualUnitData || []}
            userRoleData={userRoleData}
            departmentPsoPeoData={departmentPsoPeoData || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
