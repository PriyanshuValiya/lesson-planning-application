//@ts-nocheck
//@ts-ignore
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Save,
  InfoIcon,
  X,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  unitPlanningSchema,
  type UnitPlanningFormValues,
  teachingPedagogyOptions,
  skillMappingOptions,
} from "@/utils/schema";
import { saveUnitPlanningForm } from "@/app/dashboard/actions/saveUnitPlanningForm";
import { useDashboardContext } from "@/context/DashboardContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';

interface UnitPlanningFormProps {
  lessonPlan: any;
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>;
}

export default function UnitPlanningForm({
  lessonPlan,
  setLessonPlan,
}: UnitPlanningFormProps) {
  const { userData } = useDashboardContext();
  const [isSaving, setIsSaving] = useState(false);
  const [activeUnit, setActiveUnit] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [allFaculty, setAllFaculty] = useState<any[]>([]);
  const [primaryFaculty, setPrimaryFaculty] = useState<any>(null);
  const [secondaryFaculty, setSecondaryFaculty] = useState<any[]>([]);

  // State persistence cache
  const [unitDataCache, setUnitDataCache] = useState<{ [key: number]: any }>(
    {}
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm<UnitPlanningFormValues>({
    resolver: zodResolver(unitPlanningSchema),
    defaultValues: {
      faculty_id: userData?.id || "",
      subject_id: lessonPlan?.subject?.id || "",
      units:
        lessonPlan?.units?.length > 0
          ? lessonPlan.units
          : [
              {
                id: uuidv4(),
                unit_name: "",
                unit_topics: "",
                probable_start_date: "",
                probable_end_date: "",
                no_of_lectures: 1,
                self_study_topics: "",
                self_study_materials: "",
                unit_materials: "",
                teaching_pedagogy: [],
                other_pedagogy: "",
                co_mapping: [],
                skill_mapping: [],
                skill_objectives: "",
                interlink_topics: "",
                topics_beyond_unit: "",
                assigned_faculty_id: userData?.id || "",
                isNew: true,
              },
            ],
      remarks: lessonPlan?.unit_remarks || "",
    },
  });

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: "units",
  });

  // Save current unit data to cache
  const saveCurrentUnitToCache = () => {
    const currentUnitData = getValues(`units.${activeUnit}`);
    if (currentUnitData) {
      setUnitDataCache((prev) => ({
        ...prev,
        [activeUnit]: { ...currentUnitData },
      }));

      // Also update lesson plan state immediately
      setLessonPlan((prev: any) => {
        const updatedUnits = [...(prev.units || [])];
        if (updatedUnits[activeUnit]) {
          updatedUnits[activeUnit] = { ...currentUnitData };
        }
        return {
          ...prev,
          units: updatedUnits,
        };
      });
    }
  };

  // Load unit data from cache
  const loadUnitFromCache = (unitIndex: number) => {
    const cachedData = unitDataCache[unitIndex];
    if (cachedData) {
      // Set all form values for the unit
      Object.keys(cachedData).forEach((key) => {
        //@ts-ignore
        setValue(`units.${unitIndex}.${key}`, cachedData[key]);
      });
    }
  };

  // Enhanced unit switching with state persistence
  const switchToUnit = (newUnitIndex: number) => {
    if (newUnitIndex === activeUnit) return;

    // Save current unit data before switching
    saveCurrentUnitToCache();

    // Switch to new unit
    setActiveUnit(newUnitIndex);

    // Load cached data for new unit after a brief delay to ensure state update
    setTimeout(() => {
      loadUnitFromCache(newUnitIndex);
    }, 50);
  };

  // Initialize cache with existing unit data on mount
  useEffect(() => {
    if (lessonPlan?.units && lessonPlan.units.length > 0) {
      const initialCache: { [key: number]: any } = {};
      lessonPlan.units.forEach((unit: any, index: number) => {
        initialCache[index] = { ...unit };
      });
      setUnitDataCache(initialCache);
    }
  }, [lessonPlan?.units]);

  // Auto-save current unit data when form values change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.startsWith(`units.${activeUnit}`)) {
        // Debounce the save operation
        const timeoutId = setTimeout(() => {
          saveCurrentUnitToCache();
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, activeUnit, getValues, setLessonPlan]);

  // Check for faculty sharing when component mounts
  useEffect(() => {
    const loadFacultySharing = async () => {
      if (!lessonPlan?.subject?.id) return;

      try {
        console.log(
          "Checking faculty sharing for subject:",
          lessonPlan.subject.id
        );

        // Call the API route directly from client
        const response = await fetch(
          `/api/faculty-sharing?subjectId=${lessonPlan.subject.id}`
        );
        const result = await response.json();

        console.log("Faculty sharing result:", result);

        if (result.success) {
          setIsSharing(result.isSharing);
          setAllFaculty(result.allFaculty);
          setPrimaryFaculty(result.primaryFaculty);
          setSecondaryFaculty(result.secondaryFaculty);

          // If sharing is detected, update form state
          if (result.isSharing) {
            setValue("is_sharing", true);
            setValue("sharing_faculty", result.allFaculty);
          }
        } else {
          console.error("Failed to check faculty sharing:", result.error);
        }
      } catch (error) {
        console.error("Error loading faculty sharing:", error);
      }
    };

    loadFacultySharing();
  }, [lessonPlan?.subject?.id, setValue]);

  // Load existing unit assignments when lesson plan data is available
  useEffect(() => {
    if (lessonPlan?.units && lessonPlan.units.length > 0) {
      lessonPlan.units.forEach((unit: any, index: number) => {
        if (unit.assigned_faculty_id) {
          setValue(
            `units.${index}.assigned_faculty_id`,
            unit.assigned_faculty_id
          );
        }
      });
    }
  }, [lessonPlan?.units, setValue]);

  const addUnit = () => {
    // Save current unit before adding new one
    saveCurrentUnitToCache();

    const newUnit = {
      id: uuidv4(),
      unit_name: "",
      unit_topics: "",
      probable_start_date: "",
      probable_end_date: "",
      no_of_lectures: 1,
      self_study_topics: "",
      self_study_materials: "",
      unit_materials: "",
      teaching_pedagogy: [],
      other_pedagogy: "",
      co_mapping: [],
      skill_mapping: [],
      skill_objectives: "",
      interlink_topics: "",
      topics_beyond_unit: "",
      assigned_faculty_id: userData?.id || "",
      isNew: true,
    };

    appendUnit(newUnit);

    // Cache the new unit
    const newIndex = unitFields.length;
    setUnitDataCache((prev) => ({
      ...prev,
      [newIndex]: { ...newUnit },
    }));

    setActiveUnit(newIndex);
  };

  const removeUnitHandler = (index: number) => {
    if (unitFields.length === 1) {
      toast.error("You must have at least one unit");
      return;
    }

    // Remove from cache
    setUnitDataCache((prev) => {
      const newCache = { ...prev };
      delete newCache[index];

      // Reindex remaining cache entries
      const reindexedCache: { [key: number]: any } = {};
      Object.keys(newCache).forEach((key) => {
        const numKey = Number.parseInt(key);
        if (numKey > index) {
          reindexedCache[numKey - 1] = newCache[numKey];
        } else {
          reindexedCache[numKey] = newCache[numKey];
        }
      });

      return reindexedCache;
    });

    removeUnit(index);

    if (activeUnit >= index && activeUnit > 0) {
      setActiveUnit(activeUnit - 1);
    }
  };

  const handlePedagogyChange = (
    unitIndex: number,
    pedagogy: string,
    checked: boolean
  ) => {
    const currentPedagogies =
      getValues(`units.${unitIndex}.teaching_pedagogy`) || [];
    if (checked) {
      setValue(`units.${unitIndex}.teaching_pedagogy`, [
        ...currentPedagogies,
        pedagogy,
      ]);
    } else {
      setValue(
        `units.${unitIndex}.teaching_pedagogy`,
        currentPedagogies.filter((p) => p !== pedagogy)
      );
    }
  };

  const handleCOMapping = (unitIndex: number, co: string, checked: boolean) => {
    const currentCOs = getValues(`units.${unitIndex}.co_mapping`) || [];
    if (checked) {
      setValue(`units.${unitIndex}.co_mapping`, [...currentCOs, co]);
    } else {
      setValue(
        `units.${unitIndex}.co_mapping`,
        currentCOs.filter((c) => c !== co)
      );
    }
  };

  const handleSkillMapping = (
    unitIndex: number,
    skill: string,
    checked: boolean
  ) => {
    const currentSkills = getValues(`units.${unitIndex}.skill_mapping`) || [];
    if (checked) {
      setValue(`units.${unitIndex}.skill_mapping`, [...currentSkills, skill]);
    } else {
      setValue(
        `units.${unitIndex}.skill_mapping`,
        currentSkills.filter((s) => s !== skill)
      );
    }
  };

  // Update the handleFacultyAssignment function to store both faculty ID and name
  const handleFacultyAssignment = (unitIndex: number, facultyId: string) => {
    // Get faculty name
    const faculty = allFaculty.find((f) => f.id === facultyId);
    const facultyName = faculty ? faculty.name : "Unknown Faculty";

    // Update the form state directly and trigger validation
    setValue(`units.${unitIndex}.assigned_faculty_id`, facultyId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Also store faculty name for display purposes
    setValue(`units.${unitIndex}.faculty_name`, facultyName, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Force re-render by triggering validation
    trigger(`units.${unitIndex}.assigned_faculty_id`);

    // Update the lesson plan state immediately for UI feedback
    setLessonPlan((prev: any) => {
      const updatedUnits = [...(prev.units || [])];
      if (updatedUnits[unitIndex]) {
        updatedUnits[unitIndex] = {
          ...updatedUnits[unitIndex],
          assigned_faculty_id: facultyId,
          faculty_name: facultyName,
        };
      }
      return {
        ...prev,
        units: updatedUnits,
      };
    });
  };

  // Function to validate a specific field in the current unit
  const validateField = (fieldName: string) => {
    const result = trigger(`units.${activeUnit}.${fieldName}`);
    return result;
  };

  // Function to show field-specific error message
  const getFieldError = (fieldName: string) => {
    return errors.units?.[activeUnit]?.[fieldName]?.message;
  };

  const showFormDialog = (title: string, message: string) => {
    // Create a custom dialog for form messages
    const dialog = document.createElement("div");
    dialog.className =
      "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4";
    dialog.innerHTML = `
      <div class="bg-white rounded-lg w-full max-w-2xl shadow-xl">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-red-600">${title}</h3>
          <button class="text-gray-400 hover:text-gray-600 text-2xl font-bold" onclick="this.closest('.fixed').remove()">
            ×
          </button>
        </div>
        <div class="p-6">
          <div class="text-sm leading-relaxed whitespace-pre-line text-gray-700">${message}</div>
        </div>
        <div class="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium" onclick="this.closest('.fixed').remove()">
            OK
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    // Add click outside to close
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  };

  const onSubmit = async (data: UnitPlanningFormValues) => {
    setIsSaving(true);

    // Save current unit to cache before submitting
    saveCurrentUnitToCache();

    // Validate all fields in the current unit
    const fieldsToValidate = [
      "unit_name",
      "unit_topics",
      "probable_start_date",
      "probable_end_date",
      "no_of_lectures",
      "unit_materials",
      "teaching_pedagogy",
      "co_mapping",
      "skill_mapping",
      "skill_objectives",
      "topics_beyond_unit",
    ];

    let hasFieldErrors = false;
    fieldsToValidate.forEach((field) => {
      if (!validateField(field)) {
        hasFieldErrors = true;
        // Scroll to the first error
        if (!hasFieldErrors) {
          const errorElement = document.getElementById(
            `${field}-${activeUnit}`
          );
          errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    if (hasFieldErrors) {
      toast.error("Please fix all validation errors before saving");
      setIsSaving(false);
      return;
    }

    // Merge cached data with form data
    const mergedUnits = data.units.map((unit, index) => ({
      ...unit,
      ...(unitDataCache[index] || {}),
    }));

    const finalData = {
      ...data,
      units: mergedUnits,
    };

    // Debug: Log the data being submitted
    console.log(
      "Submitting data:",
      finalData.units.map((u, i) => ({
        unit: i + 1,
        assigned_faculty_id: u.assigned_faculty_id,
        faculty_name: u.faculty_name,
      }))
    );

    // Validate faculty assignments for shared subjects
    if (isSharing) {
      const unassignedUnits = finalData.units.filter(
        (unit) => !unit.assigned_faculty_id
      );
      if (unassignedUnits.length > 0) {
        const unitNumbers = unassignedUnits
          .map((_, idx) => {
            const originalIndex = finalData.units.findIndex(
              (u) => u.id === unassignedUnits[idx].id
            );
            return originalIndex + 1;
          })
          .join(", ");

        showFormDialog(
          "Faculty Assignment Required",
          `Please assign faculty to Unit ${unitNumbers} before saving.`
        );
        setIsSaving(false);
        return;
      }
    } else {
      // For non-shared subjects, automatically assign current faculty to all units
      finalData.units = finalData.units.map((unit) => ({
        ...unit,
        assigned_faculty_id: unit.assigned_faculty_id || userData?.id || "",
        faculty_name: unit.faculty_name || userData?.name || "Current Faculty",
      }));
    }

    try {
      // Add sharing information to the form data
      const formDataWithSharing = {
        ...finalData,
        is_sharing: isSharing,
        sharing_faculty: allFaculty,
      };

      const result = await saveUnitPlanningForm({
        faculty_id: userData?.id || "",
        subject_id: lessonPlan?.subject?.id || "",
        formData: formDataWithSharing,
      });

      if (result.success) {
        toast.success("Unit planning saved successfully!");
        setLessonPlan((prev: any) => ({
          ...prev,
          units: finalData.units,
          unit_remarks: finalData.remarks,
          is_sharing: isSharing,
          sharing_faculty: allFaculty,
          unit_planning_completed: true,
        }));
      } else {
        // Show validation dialog
        if (result.error?.includes("Dear Professor")) {
          showFormDialog("Validation Required", result.error);
        } else {
          toast.error(result.error || "Failed to save unit planning");
        }
      }
    } catch (error) {
      console.error("Error saving unit planning:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const showValidationDialog = (message: string) => {
    // Create a custom dialog for validation messages
    const dialog = document.createElement("div");
    dialog.className =
      "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4";
    dialog.innerHTML = `
    <div class="bg-white rounded-lg w-full max-w-2xl shadow-xl">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-red-600">Validation Required</h3>
        <button class="text-gray-400 hover:text-gray-600 text-2xl font-bold" onclick="this.closest('.fixed').remove()">
          ×
        </button>
      </div>
      <div class="p-6">
        <div class="text-sm leading-relaxed whitespace-pre-line text-gray-700">${message}</div>
      </div>
      <div class="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
        <button class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium" onclick="this.closest('.fixed').remove()">
          OK
        </button>
      </div>
    </div>
  `;
    document.body.appendChild(dialog);

    // Add click outside to close
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  };

  // Generate CO options based on course outcomes
  const courseOutcomes = lessonPlan?.courseOutcomes || [];
  const coOptions = courseOutcomes.map(
    (_: any, index: number) => `CO${index + 1}`
  );

  // Get faculty name by ID
  const getFacultyName = (facultyId: string) => {
    const faculty = allFaculty.find((f) => f.id === facultyId);
    return faculty ? faculty.name : "Unknown Faculty";
  };

  // Get short faculty name for badges
  const getShortFacultyName = (facultyId: string) => {
    const faculty = allFaculty.find((f) => f.id === facultyId);
    if (!faculty) return "?";

    // Extract initials or short name
    const nameParts = faculty.name.split(" ");
    if (nameParts.length >= 2) {
      return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
    }
    return faculty.name.substring(0, 2).toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Unit Planning Guidelines
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInstructions(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">
                Guidelines for Unit Planning
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    Teaching Pedagogy Requirements:
                  </h3>
                  <p>
                    At least two alternative pedagogies (items 3-15) must be
                    selected across different units to ensure diverse teaching
                    methods.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">CO Mapping:</h3>
                  <p>
                    All Course Outcomes (COs) entered in General Details must be
                    covered across all units to ensure complete curriculum
                    coverage.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Lecture Count:</h3>
                  <p>
                    Total number of lectures across all units must equal Credits
                    × 15 to maintain academic standards.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Skill Mapping:</h3>
                  <p>
                    Skills should be mentioned in measurable terms (e.g.,
                    &quot;Ability to build and deploy a basic web application
                    using Flask framework&quot; instead of just &quot;web
                    development skills&quot;).
                  </p>
                </div>
                {isSharing && (
                  <div>
                    <h3 className="font-semibold">Faculty Assignment:</h3>
                    <p>
                      Since this subject is shared among multiple faculty,
                      please assign each unit to the appropriate faculty member
                      who will be responsible for teaching that unit.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowInstructions(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {/* {Object.keys(errors).length > 0 && (
        <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-red-800">
              <h4 className="font-semibold mb-1">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errors.units &&
                  unitFields.map((unit, index) => {
                    const unitErrors = errors.units[index];
                    if (!unitErrors) return null;

                    return Object.keys(unitErrors).map((fieldName) => (
                      <li key={`${index}-${fieldName}`}>
                        Unit {index + 1}: {unitErrors[fieldName]?.message}
                      </li>
                    ));
                  })}
              </ul>
            </div>
          </div>
        </div>
      )} */}

      {/* Faculty Sharing Information */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Unit Planning Details</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-blue-600"
            onClick={() => setShowInstructions(true)}
          >
            <InfoIcon className="h-4 w-4 mr-1" />
            View Guidelines
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Faculty Sharing Status */}
          {isSharing && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Sharing Enabled
              </Badge>
              <div className="text-sm text-gray-600">
                {allFaculty.length} Faculty:{" "}
                {allFaculty.map((f) => f.name).join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Sharing Status - Only show when sharing is detected */}
      {isSharing && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-blue-800">
                  Shared Subject Detected
                </h4>
                <p className="text-sm text-blue-600">
                  This subject is shared among multiple faculty members. Please
                  assign each unit to the appropriate faculty.
                </p>
              </div>
            </div>
            <Badge
              variant="default"
              className="bg-blue-600 text-white px-3 py-1"
            >
              {allFaculty.length} Faculty Sharing
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="bg-white rounded p-3 border border-blue-200">
              <span className="text-sm font-medium text-gray-700">
                Primary Faculty:
              </span>
              <p className="font-semibold text-blue-800">
                {primaryFaculty?.name || "Not assigned"}
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-blue-200">
              <span className="text-sm font-medium text-gray-700">
                Secondary Faculty:
              </span>
              <p className="font-semibold text-blue-800">
                {secondaryFaculty?.[0]?.name || "Not assigned"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unit Tabs */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {unitFields.map((unit, index) => (
            <Button
              key={unit.id}
              type="button"
              variant={activeUnit === index ? "default" : "outline"}
              className={`${
                activeUnit === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""
              } relative whitespace-nowrap`}
              onClick={() => switchToUnit(index)}
              title={
                isSharing && watch(`units.${index}.assigned_faculty_id`)
                  ? `Assigned to: ${getFacultyName(
                      watch(`units.${index}.assigned_faculty_id`)
                    )}`
                  : undefined
              }
            >
              <span>Unit {index + 1}</span>
              {isSharing && watch(`units.${index}.assigned_faculty_id`) && (
                <Badge variant="outline" className="ml-2 text-xs bg-white">
                  {getFacultyName(watch(`units.${index}.assigned_faculty_id`))
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Badge>
              )}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addUnit}
            className="whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Unit
          </Button>
        </div>
        {unitFields.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeUnitHandler(activeUnit)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove Unit
          </Button>
        )}
      </div>

      {/* Faculty Assignment Summary - Only visible when sharing is enabled */}
      {isSharing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center text-sm">
            <Users className="h-4 w-4 mr-2" />
            Faculty Assignment Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {unitFields.map((unit, index) => {
              const assignedFacultyId = watch(
                `units.${index}.assigned_faculty_id`
              );
              const facultyName = getFacultyName(assignedFacultyId);
              return (
                <div
                  key={unit.id}
                  className="flex items-center justify-between bg-white rounded p-1.5 border text-sm"
                >
                  <span className="font-medium">Unit {index + 1}</span>
                  <Badge
                    variant={assignedFacultyId ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {facultyName}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unit Form */}
      {unitFields[activeUnit] && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span>Unit {activeUnit + 1}</span>
              </div>

              {/* Faculty Assignment Dropdown - Only show when sharing is enabled */}
              {isSharing && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">
                    Faculty Assignment:
                  </span>
                  <Select
                    value={
                      watch(`units.${activeUnit}.assigned_faculty_id`) || ""
                    }
                    onValueChange={(value) =>
                      handleFacultyAssignment(activeUnit, value)
                    }
                  >
                    <SelectTrigger className="w-[200px] bg-white border-blue-300">
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {allFaculty.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Shared Subject
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Unit Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2" htmlFor={`unit-name-${activeUnit}`}>
                  Unit Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`unit-name-${activeUnit}`}
                  {...register(`units.${activeUnit}.unit_name`)}
                  placeholder="Enter unit name"
                />
                {errors.units?.[activeUnit]?.unit_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.units[activeUnit]?.unit_name?.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2" htmlFor={`no-of-lectures-${activeUnit}`}>
                  No. of Lectures <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`no-of-lectures-${activeUnit}`}
                  type="number"
                  min="1"
                  {...register(`units.${activeUnit}.no_of_lectures`)}
                  placeholder="Enter number of lectures"
                />
                {errors.units?.[activeUnit]?.no_of_lectures && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.units[activeUnit]?.no_of_lectures?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Unit Topics */}
            <div>
              <Label className="mb-2" htmlFor={`unit-topics-${activeUnit}`}>
                Unit Topics <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`unit-topics-${activeUnit}`}
                {...register(`units.${activeUnit}.unit_topics`)}
                placeholder="Enter unit topics"
                rows={4}
              />
              {errors.units?.[activeUnit]?.unit_topics && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.units[activeUnit]?.unit_topics?.message}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2" htmlFor={`start-date-${activeUnit}`}>
                  Probable Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`start-date-${activeUnit}`}
                  type="date"
                  {...register(`units.${activeUnit}.probable_start_date`)}
                />
                {errors.units?.[activeUnit]?.probable_start_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.units[activeUnit]?.probable_start_date?.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2" htmlFor={`end-date-${activeUnit}`}>
                  Probable End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`end-date-${activeUnit}`}
                  type="date"
                  {...register(`units.${activeUnit}.probable_end_date`)}
                />
                {errors.units?.[activeUnit]?.probable_end_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.units[activeUnit]?.probable_end_date?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Self-Study Topics and Materials */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="mb-2" htmlFor={`self-study-topics-${activeUnit}`}>
                  Self-Study Topics (Optional)
                </Label>
                <Textarea
                  id={`self-study-topics-${activeUnit}`}
                  {...register(`units.${activeUnit}.self_study_topics`)}
                  placeholder="Enter self-study topics"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor={`self-study-materials-${activeUnit}`}>
                  Self-Study Materials (Optional)
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 ml-2"
                    onClick={() => setShowInstructions(true)}
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </Label>
                <Textarea
                  id={`self-study-materials-${activeUnit}`}
                  {...register(`units.${activeUnit}.self_study_materials`)}
                  placeholder="Enter self-study materials with specific references"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor={`unit-materials-${activeUnit}`}>
                  Unit Materials <span className="text-red-500">*</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 ml-2"
                    onClick={() => setShowInstructions(true)}
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </Label>
                <Textarea
                  id={`unit-materials-${activeUnit}`}
                  {...register(`units.${activeUnit}.unit_materials`)}
                  placeholder="Enter unit materials with specific references"
                  rows={3}
                />
                {errors.units?.[activeUnit]?.unit_materials && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.units[activeUnit]?.unit_materials?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Teaching Pedagogy */}
            <div>
              <Label className="mb-2">
                Teaching Pedagogy <span className="text-red-500">*</span>{" "}
                (Select at least 2)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {teachingPedagogyOptions.map((pedagogy) => (
                  <div key={pedagogy} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pedagogy-${activeUnit}-${pedagogy}`}
                      checked={
                        watch(
                          `units.${activeUnit}.teaching_pedagogy`
                        )?.includes(pedagogy) || false
                      }
                      onCheckedChange={(checked) =>
                        handlePedagogyChange(
                          activeUnit,
                          pedagogy,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`pedagogy-${activeUnit}-${pedagogy}`}
                      className="text-sm"
                    >
                      {pedagogy}
                    </Label>
                  </div>
                ))}
              </div>
              {watch(`units.${activeUnit}.teaching_pedagogy`)?.includes(
                "Other"
              ) && (
                <div className="mt-3">
                  <Label htmlFor={`other-pedagogy-${activeUnit}`}>
                    Other Pedagogy
                  </Label>
                  <Input
                    id={`other-pedagogy-${activeUnit}`}
                    {...register(`units.${activeUnit}.other_pedagogy`)}
                    placeholder="Specify other pedagogy"
                  />
                </div>
              )}
              {errors.units?.[activeUnit]?.teaching_pedagogy && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.units[activeUnit]?.teaching_pedagogy?.message}
                </p>
              )}
            </div>

            {/* CO Mapping */}
            <div>
              <Label>
                CO Mapping <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-2">
                {coOptions.map((co) => (
                  <div key={co} className="flex items-center space-x-2">
                    <Checkbox
                      id={`co-${activeUnit}-${co}`}
                      checked={
                        watch(`units.${activeUnit}.co_mapping`)?.includes(co) ||
                        false
                      }
                      onCheckedChange={(checked) =>
                        handleCOMapping(activeUnit, co, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`co-${activeUnit}-${co}`}
                      className="text-sm"
                    >
                      {co}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.units?.[activeUnit]?.co_mapping && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.units[activeUnit]?.co_mapping?.message}
                </p>
              )}
            </div>

            {/* Skill Mapping */}
            <div>
              <Label>
                Skill Mapping <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {skillMappingOptions.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${activeUnit}-${skill}`}
                      checked={
                        watch(`units.${activeUnit}.skill_mapping`)?.includes(
                          skill
                        ) || false
                      }
                      onCheckedChange={(checked) =>
                        handleSkillMapping(
                          activeUnit,
                          skill,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`skill-${activeUnit}-${skill}`}
                      className="text-sm"
                    >
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.units?.[activeUnit]?.skill_mapping && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.units[activeUnit]?.skill_mapping?.message}
                </p>
              )}
            </div>

            {/* Skill Objectives */}
            <div>
              <Label className="mb-2" htmlFor={`skill-objectives-${activeUnit}`}>
                Objective for Selected Skills{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`skill-objectives-${activeUnit}`}
                {...register(`units.${activeUnit}.skill_objectives`)}
                placeholder="Skills should be mentioned in measurable terms (e.g., 'Ability to build and deploy a basic web application using Flask framework.' instead of just 'web development skills')."
                rows={3}
              />
              {errors.units?.[activeUnit]?.skill_objectives && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.units[activeUnit]?.skill_objectives?.message}
                </p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="mb-2" htmlFor={`interlink-topics-${activeUnit}`}>
                  Interlink of this unit topic(s) with other subject&apos;s
                  topic (Optional)
                </Label>
                <Textarea
                  id={`interlink-topics-${activeUnit}`}
                  {...register(`units.${activeUnit}.interlink_topics`)}
                  placeholder="Describe connections with other subjects"
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-2" htmlFor={`topics-beyond-unit-${activeUnit}`}>
                  Topic beyond Unit Topics{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`topics-beyond-unit-${activeUnit}`}
                  {...register(`units.${activeUnit}.topics_beyond_unit`)}
                  placeholder="Enter topics beyond the unit syllabus"
                  rows={3}
                />
                {errors.units?.[activeUnit]?.topics_beyond_unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.units[activeUnit]?.topics_beyond_unit?.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remarks */}
      <div>
        <Label className="mb-2" htmlFor="remarks">Remarks (Optional)</Label>
        <Textarea
          id="remarks"
          {...register("remarks")}
          placeholder="Any additional remarks for all units"
          rows={3}
        />
      </div>

      <div className="flex justify-end w-full">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#1A5CA1] hover:bg-[#154A80]"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Unit Details"}
        </Button>
      </div>
    </form>
  );
}
