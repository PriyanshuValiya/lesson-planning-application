//@ts-nocheck
import { createClient } from "@/utils/supabase/server";
import ViewActualCie from "./view-actual-cie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type paramsType = Promise<{ formId: string }>;

export default async function ViewActualCiePage(props: { params: paramsType }) {
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

  const { data: allCie, error: allCieError } = await supabase
    .from("actual_cies")
    .select("*")
    .eq("forms", allForms[0].id);

  if (allCieError) {
    console.error("Error Fetching all CIE data:", allCieError);
  }

  const { data: departmentPsoPeoData, error: departmentPsoPeoError } =
    await supabase
      .from("department_pso_peo")
      .select("pso_data")
      .eq("department_id", userRoleData?.subjects?.department_id)
      .single();

  if (departmentPsoPeoError) {
    console.error(
      "Error fetching department PSO/PEO data:",
      departmentPsoPeoError
    );
  }

  function getOrdinalParts(n: number): [number, string] {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    return [n, suffix];
  }

  const semester = userRoleData?.subjects?.semester;
  const [semNum, semSuffix] = getOrdinalParts(semester);

  if (!allCie || allCie.length === 0) {
    return (
      <div className="mx-4 mt-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[20px]">
              Actual CIE Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p>No Actual Implementation Record for this CIE</p>
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
            View Actual CIEs
          </CardTitle>
          <div className="font-semibold w-full text-base mt-2">
            {userRoleData.users.name} │ {userRoleData.subjects.name} │{" "}
            {userRoleData.subjects.code} │{" "}
            {userRoleData.departments.abbreviation_depart} │
            <span>
              {semNum}
              <sup className=" text-[0.6rem] align-super">{semSuffix} </sup>
              Sem
            </span>
          </div>

          <div className="font-semibold w-full text-red-700 text-base mt-2">
            <p>
              Total Actual CIEs : {allCie.length} /{" "}
              {allForms[0].form?.cies.length}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ViewActualCie
            formsData={allForms[0]}
            actualCieData={allCie || []}
            userRoleData={userRoleData}
            departmentPsoPeoData={departmentPsoPeoData || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
