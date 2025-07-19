// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

const pedagogyOptions = [
  "Active Learning", "Blended Learning", "Concept/Mind Mapping", "Demonstration/Simulation-Based Learning",
  "Experiential Learning", "Flipped Classroom", "Collaborative Learning", "Peer Learning",
  "Problem-Based Learning", "Project-Based Learning", "Reflective Learning", "Role Play",
  "Storytelling/Narrative Pedagogy", "Other",
];

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
type UnitFormData = z.infer<typeof unitSchema>;
export default function EditActualForm({
  formsData,
  actualUnitData,
  userRoleData,
  departmentPsoPeoData,
}) {
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const allUnits = formsData.form?.units || [];
  const [visibleUnit, setVisibleUnit] = useState("unit-0");
  const allCOs = Array.from(
    new Set(
      (formsData.form?.units || []).flatMap(unit => unit.co_mapping || [])
    )
  );
  const comapping = formsData?.form?.generalDetails?.courseOutcomes || [];

  const coIdToTextMap = comapping.reduce((acc, co) => {
    acc[co.id] = co.text;
    return acc;
  }, {});
  //idk if im even allowed to query here
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from("users").select("id, name");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    }

    fetchUsers();
  }, []);
  const idToNameFaculty = users.reduce((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {});



  //Disabling scroll because if not then we have 2 scrolls then ui gets weird 
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);



  return (
    <div className="min-h-screen  bg-white px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {allUnits.map((_, index) => {
          if (visibleUnit !== `unit-${index}`) return null;

          const actual = actualUnitData;

          const actualDefaults = actualUnitData?.[0]?.forms?.[index] ?? {};

          const unitDefaults = formsData.form?.units?.[index] ?? {};
          const displayData = Object.entries(
            Object.keys(actualDefaults).length > 0 ? actualDefaults : unitDefaults
          ).filter(([key]) => !["id", "isNew"].includes(key));
          const form = useForm<UnitFormData>({
            resolver: zodResolver(unitSchema),
            defaultValues: {
              unit_name: "",
              faculty_name: "",
              co_mapping: [],
              pso: [],
              unit_topics: "",
              self_study_topics: "",
              self_study_materials: "",
              teaching_pedagogy: [],
              skill_mapping: [],
              unit_materials: "",
              skill_objectives: "",
              topics_beyond_unit: "",
              interlink_topics: "",
              probable_start_date: "",
              probable_end_date: "",
              topics_covered: "",
              no_of_lectures: 1,
            },
          });

          useEffect(() => {
            form.reset({
              unit_name: actualDefaults.unit_name || unitDefaults.unit_name || "",
              faculty_name: actualDefaults.faculty_name || unitDefaults.faculty_name || "",
              co_mapping: actualDefaults.co_mapping || unitDefaults.co_mapping || [],
              pso: actualDefaults.pso || unitDefaults.pso || [],
              unit_topics: actualDefaults.unit_topics || unitDefaults.unit_topics || "",
              self_study_topics: actualDefaults.self_study_topics || unitDefaults.self_study_topics || "",
              self_study_materials: actualDefaults.self_study_materials || unitDefaults.self_study_materials || "",
              teaching_pedagogy: actualDefaults.teaching_pedagogy || unitDefaults.teaching_pedagogy || [],
              skill_mapping: actualDefaults.skill_mapping || unitDefaults.skill_mapping || [],
              unit_materials: actualDefaults.unit_materials || unitDefaults.unit_materials || "",
              skill_objectives: actualDefaults.skill_objectives || unitDefaults.skill_objectives || "",
              topics_beyond_unit: actualDefaults.topics_beyond_unit || unitDefaults.topics_beyond_unit || "",
              interlink_topics: actualDefaults.interlink_topics || unitDefaults.interlink_topics || "",
              actual_start_date: actualDefaults.actual_start_date || unitDefaults.actual_start_date || unitDefaults.probable_start_date || "",
              actual_end_date: actualDefaults.actual_end_date || unitDefaults.actual_end_date || unitDefaults.probable_end_date || "",
              topics_covered: actualDefaults.topics_covered || unitDefaults.topics_covered || "",
              no_of_lectures: actualDefaults.no_of_lectures || unitDefaults.no_of_lectures || 1,
            });
          }, [form, actualDefaults, unitDefaults]);


          const onSubmit = async (values: UnitFormData) => {
            setIsSubmitting(true);

            try {
              const payload = {
                forms_id: formsData.id,
                subject_id: userRoleData.subjects.id,
                faculty_id: userRoleData.users.id,
                forms: [values]
              };

              console.log("Submitting to Supabase:", payload);

              const { data, error } = await supabase
                .from("actual_units")
                .upsert(payload, {
                  onConflict: ["forms_id", "faculty_id"]
                });

              if (error) {
                console.error("Supabase error:", error);
                toast.error(`Error: ${error.message}`);
                return;
              }

              toast.success(`Unit ${index + 1} saved successfully`);
              console.log("Supabase insert success:", data);
            } catch (err) {
              console.error("Unhandled error during submit:", err);
              toast.error("Unexpected error occurred");
            } finally {
              setIsSubmitting(false);
            }
          };

          return (
            <div key={index} className="flex flex-col lg:flex-row gap-2">
              <Card className="flex-1 w-full bg-gray-50">
                <CardContent className="py-6 space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Unit Planning</h2>

                  {displayData.map(([key, value]) => {
                    if (Array.isArray(value) && value.length === 0) return null;

                    const label =
                      key === "assigned_faculty_id"
                        ? "Assigned Faculty Name"
                        : key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());



                    return (
                      <div key={key}>
                        <p className="text-sm font-medium text-gray-700">{label}</p>
                        {Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {value.map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {key === "co_mapping" ? coIdToTextMap[item] || item : item}
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
                </CardContent>
              </Card>
              <Card key={index} className="flex-1 w-full">
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
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {[
                        ["unit_name", "Unit Name"],
                        ["no_of_lectures", "No. of Lectures", "number"],
                        ["unit_topics", "Unit Topics"],
                        ["probable_start_date", "Actual Start Date", "date"],
                        ["probable_end_date", "Actual End Date", "date"],
                        ["self_study_topics", "Self Study Topics"],
                        ["self_study_materials", "Self Study Materials"],
                        ["unit_materials", "Unit Materials"],
                        // ["faculty_name", "Faculty Name"],
                        ["co", "CO"],
                        ["pso", "PSO"],
                        ["skill_objectives", "Skill Objectives"],
                        ["teaching_pedagogy", "Teaching Pedagogy"],
                        ["topics_beyond_unit", "Topics Beyond Unit"],
                        ["interlink_topics", "Interlink Topics"],
                        ["topics_covered", "Topics Covered"],
                        ["remarks", "Remarks (To be filled if diverted from lesson plan)"]

                      ].map(([name, label, type = "text"]) => {
                        if (name === "co") {
                          return (
                            <div key={name}>
                              <FormField
                                control={form.control}
                                name="co_mapping"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CO Mapping</FormLabel>
                                    <Select onValueChange={() => { }}>
                                      <SelectTrigger className="mt-1 w-full h-11">
                                        <SelectValue
                                          placeholder={`${field.value?.length || 0} Selected`}
                                        />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60 overflow-y-auto">
                                        {comapping.map((co) => {
                                          const selected = field.value.includes(co.id);
                                          return (
                                            <div
                                              key={co.id}
                                              className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100"
                                              onClick={() => {
                                                const updated = selected
                                                  ? field.value.filter((item) => item !== co.id)
                                                  : [...field.value, co.id];
                                                field.onChange(updated);
                                              }}
                                            >
                                              <Checkbox checked={selected} className="mr-2" />
                                              <span className="text-sm font-mono">{co.text}</span>
                                            </div>
                                          );
                                        })}
                                      </SelectContent>

                                    </Select>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {(field.value || []).map((coId: string) => (
                                        <Badge key={coId} variant="secondary" className="text-xs font-mono">
                                          {coIdToTextMap[coId] || coId}

                                          <button
                                            onClick={() => {
                                              const updated = field.value.filter((v) => v !== coId);
                                              field.onChange(updated);
                                            }}
                                            className="ml-1 text-red-500 hover:text-red-700"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )
                        }

                        else if (name == "pso") {
                          return (
                            <div key={name}>
                              <FormField
                                control={form.control}
                                name="pso"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Program Specific Outcome (PSO)</FormLabel>
                                    <Select onValueChange={() => { }}>
                                      <SelectTrigger className="mt-1 w-full h-11">
                                        <SelectValue placeholder={`${field.value?.length || 0} Selected`} />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60 overflow-y-auto">
                                        {(departmentPsoPeoData?.pso_data ?? []).map((pso) => {
                                          const selected = field.value?.includes(pso.id);
                                          return (
                                            <div
                                              key={pso.id}
                                              className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100"
                                              onClick={() => {
                                                const updated = selected
                                                  ? field.value.filter((item) => item !== pso.id)
                                                  : [...(field.value || []), pso.id];
                                                field.onChange(updated);
                                              }}
                                            >
                                              <Checkbox checked={selected} className="mr-2" />
                                              <span className="text-sm">{pso.description}</span>
                                            </div>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>

                                    {/* Display selected PSOs as badges */}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {(field.value || []).map((psoId: string) => {
                                        const pso = departmentPsoPeoData.pso_data.find((p) => p.id === psoId);
                                        return (
                                          <Badge key={psoId} variant="secondary" className="text-xs">
                                            {pso?.description || psoId}
                                            <button
                                              onClick={() => {
                                                const updated = field.value.filter((v) => v !== psoId);
                                                field.onChange(updated);
                                              }}
                                              className="ml-1 text-red-500 hover:text-red-700"
                                            >
                                              ×
                                            </button>
                                          </Badge>
                                        );
                                      })}
                                    </div>

                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )
                        }
                        else if (name === "teaching_pedagogy") {
                          return (
                            <div key={name}>
                              <FormField
                                control={form.control}
                                name="teaching_pedagogy"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Teaching Pedagogy</FormLabel>
                                    <Select onValueChange={() => { }}>
                                      <SelectTrigger className="mt-1 w-full h-11">
                                        <SelectValue placeholder={`${field.value?.length || 0} Selected`} />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60 overflow-y-auto">
                                        {pedagogyOptions.map((option) => {
                                          const selected = field.value.includes(option);
                                          return (
                                            <div
                                              key={option}
                                              className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100"
                                              onClick={() => {
                                                const updated = selected
                                                  ? field.value.filter((item) => item !== option)
                                                  : [...field.value, option];
                                                field.onChange(updated);
                                              }}
                                            >
                                              <Checkbox checked={selected} className="mr-2" />
                                              <span className="text-sm">{option}</span>
                                            </div>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {(field.value || []).map((option: string) => (
                                        <Badge key={option} variant="secondary" className="text-xs">
                                          {option}
                                          <button
                                            onClick={() => {
                                              const updated = field.value.filter((v) => v !== option);
                                              field.onChange(updated);
                                            }}
                                            className="ml-1 text-red-500 hover:text-red-700"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          );
                        }
                        else if (name === "skill_objectives") {
                          return (
                            <div key={name}>
                              <FormField
                                control={form.control}
                                name="skill_mapping"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Skill Mapping</FormLabel>
                                    <Select onValueChange={() => { }}>
                                      <SelectTrigger className="mt-1 w-full h-11">
                                        <SelectValue placeholder={`${field.value?.length || 0} Selected`} />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60 overflow-y-auto">
                                        {["critical_thinking", "teamwork", "communication", "coding"].map((skill) => {
                                          const selected = field.value.includes(skill);
                                          return (
                                            <div
                                              key={skill}
                                              className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100"
                                              onClick={() => {
                                                const updated = selected
                                                  ? field.value.filter((item) => item !== skill)
                                                  : [...field.value, skill];
                                                field.onChange(updated);
                                              }}
                                            >
                                              <Checkbox checked={selected} className="mr-2" />
                                              <span className="capitalize">{skill.replace(/_/g, " ")}</span>
                                            </div>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {(field.value || []).map((skill: string) => (
                                        <Badge key={skill} variant="secondary" className="text-xs">
                                          {skill}
                                          <button
                                            onClick={() => {
                                              const updated = field.value.filter((v) => v !== skill);
                                              field.onChange(updated);
                                            }}
                                            className="ml-1 text-red-500 hover:text-red-700"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )
                        }
                        return (
                          <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                  {name.includes("topics") || name.includes("materials") || name.includes("remarks") ? (
                                    <Textarea {...field} />
                                  ) : (
                                    <Input type={type} {...field} />
                                  )}
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      })
                      }
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save Unit"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
