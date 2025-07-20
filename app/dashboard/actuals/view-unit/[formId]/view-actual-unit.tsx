// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const unitSchema = z.object({
  unit_name: z.string().min(1, "Required"),
  faculty_name: z.string().min(1, "Required"),
  co_mapping: z.array(z.string().min(1, "Required")),
  pso: z.array(z.string()),
  unit_topics: z.string().min(1, "Required"),
  self_study_topics: z.string(),
  self_study_materials: z.string(),
  teaching_pedagogy: z.array(z.string().min(1, "Required")),
  skill_mapping: z.array(z.string().min(1, "Required")),
  unit_materials: z.string().optional(),
  skill_objectives: z.string().optional(),
  topics_beyond_unit: z.string().optional(),
  interlink_topics: z.string().optional(),
  actual_start_date: z.string().min(1),
  actual_end_date: z.string().optional(),
  topics_covered: z.string().min(1),
  no_of_lectures: z.number().min(1),
});

export default function ViewActualUnit({
  formsData,
  actualUnitData,
  userRoleData,
  departmentPsoPeoData,
}) {
  const supabase = createClientComponentClient();
  const allUnits = actualUnitData?.[0]?.forms || [];
  const [visibleUnit, setVisibleUnit] = useState("unit-0");

  const comapping = formsData?.form?.generalDetails?.courseOutcomes || [];
  const coIdToTextMap = comapping.reduce((acc, co) => {
    acc[co.id] = co.text;
    return acc;
  }, {});

  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from("users").select("id, name");
      if (!error) setUsers(data);
      else console.error("Error fetching users:", error);
    }
    fetchUsers();
  }, []);

  const idToNameFaculty = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-6xl mx-auto">
        

        {/* Display Unit Card */}
        {allUnits.map((_, index) => {
          if (visibleUnit !== `unit-${index}`) return null;

          const unitData = actualUnitData?.[0]?.forms?.[index] ?? {};
          const displayData = Object.entries(unitData).filter(
            ([key]) => !["id", "isNew"].includes(key)
          );

          return (
            <div key={index} className="flex flex-col gap-4">
              <Card className="w-full bg-gray-50">
                <CardContent className="py-6">
                  <div className="flex flex-wrap gap-2 mb-6">
          {allUnits.map((_, index) => (
            <Button
              key={index}
              size="sm"
              variant={visibleUnit === `unit-${index}` ? "default" : "outline"}
              onClick={() => setVisibleUnit(`unit-${index}`)}
            >
              Unit {index + 1}
            </Button>
          ))}
        </div>
                  <h2 className="text-lg font-semibold mb-4">Actual Implementation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 w-full">
                    {displayData.map(([key, value]) => {
                      if (Array.isArray(value) && value.length === 0) return null;

                      const label =
                        key === "assigned_faculty_id"
                          ? "Assigned Faculty Name"
                          : key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (char) => char.toUpperCase());

                      return (
                        <div key={key}>
                          <p className="text-sm font-medium text-gray-700">{label}</p>
                          {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {value.map((item, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {key === "co_mapping"
                                    ? coIdToTextMap[item] || item
                                    : item}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm mt-1 text-gray-900 whitespace-pre-line">
                              {key === "assigned_faculty_id"
                                ? idToNameFaculty?.[value] || value
                                : value || "-"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
