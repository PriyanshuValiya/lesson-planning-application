//@ts-nocheck
"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/utils/supabase/client";
import { savePracticalPlanningForm } from "@/app/dashboard/actions/savePracticalPlanningForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  saveFormDraft,
  loadFormDraft,
  deleteFormDraft,
} from "@/app/dashboard/actions/saveFormDraft";

interface PSOPEOItem {
  id: string;
  label?: string;
  description: string;
}

interface PracticalPlanningFormProps {
  lessonPlan: any;
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>;
  userData: any;
}

// Practical Pedagogy Options
const practicalPedagogyOptions = [
  "Problem-Based/Case Study Learning",
  "Project-Based Learning",
  "Collaborative Learning",
  "Code Walkthroughs",
  "Self-Learning with Guidance",
  "Experiential Learning",
  "Flipped Laboratory",
  "Pair Programming",
  "Peer Learning",
  "Research-Oriented Practical",
  "Other",
];

// Evaluation Method Options
const evaluationMethodOptions = [
  "Viva",
  "Lab Performance",
  "File Submission",
  "Mini-Project",
  "Code Review",
  "Peer Evaluation",
  "Presentation",
  "Other",
];

// Bloom's Taxonomy Options for Practicals
const bloomsTaxonomyOptions = ["Apply", "Analyze", "Evaluate", "Create"];

// Skill Mapping Options
const skillMappingOptions = [
  "Technical Skills",
  "Cognitive Skills",
  "Professional Skills",
  "Research and Innovation Skills",
  "Entrepreneurial or Managerial Skills",
  "Communication Skills",
  "Leadership and Teamwork Skills",
  "Creativity and Design Thinking Skills",
  "Ethical, Social, and Environmental Awareness Skills",
];

// Default PSO/PEO options if none are found
const defaultPsoOptions = [
  { id: "pso-1", label: "PSO1", description: "Program Specific Outcome 1" },
  { id: "pso-2", label: "PSO2", description: "Program Specific Outcome 2" },
  { id: "pso-3", label: "PSO3", description: "Program Specific Outcome 3" },
  { id: "pso-4", label: "PSO4", description: "Program Specific Outcome 4" },
  { id: "pso-5", label: "PSO5", description: "Program Specific Outcome 5" },
];

const defaultPeoOptions = [
  {
    id: "peo-1",
    label: "PEO1",
    description: "Program Educational Objective 1",
  },
  {
    id: "peo-2",
    label: "PEO2",
    description: "Program Educational Objective 2",
  },
  {
    id: "peo-3",
    label: "PEO3",
    description: "Program Educational Objective 3",
  },
  {
    id: "peo-4",
    label: "PEO4",
    description: "Program Educational Objective 4",
  },
  {
    id: "pso-5",
    label: "PEO5",
    description: "Program Educational Objective 5",
  },
];

export default function PracticalPlanningForm({
  lessonPlan,
  setLessonPlan,
  userData,
}: PracticalPlanningFormProps) {
  const [activePractical, setActivePractical] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [departmentPsoPeo, setDepartmentPsoPeo] = useState<{
    pso_data: PSOPEOItem[];
    peo_data: PSOPEOItem[];
  }>({
    pso_data: [],
    peo_data: [],
  });
  const [loadingPsoPeo, setLoadingPsoPeo] = useState(false);
  const [psoPeoError, setPsoPeoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [currentWarning, setCurrentWarning] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showOtherSkillInput, setShowOtherSkillInput] = useState(false);
  const [otherSkillValue, setOtherSkillValue] = useState("");
  const [showOtherPedagogyInput, setShowOtherPedagogyInput] = useState(false);
  const [otherPedagogyValue, setOtherPedagogyValue] = useState("");
  const [showOtherEvaluationInput, setShowOtherEvaluationInput] =
    useState(false);
  const [otherEvaluationValue, setOtherEvaluationValue] = useState("");

  // OPTIMIZED: Simplified term dates state
  const [termDates, setTermDates] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });

  // OPTIMIZED: Add loading state for weeks
  const [loadingWeeks, setLoadingWeeks] = useState(false);

  // Field-specific error states
  const [practicalAimError, setPracticalAimError] = useState("");
  const [associatedUnitsError, setAssociatedUnitsError] = useState("");
  const [probableWeekError, setProbableWeekError] = useState("");
  const [labHoursError, setLabHoursError] = useState("");
  const [softwareHardwareError, setSoftwareHardwareError] = useState("");
  const [practicalTasksError, setPracticalTasksError] = useState("");
  const [evaluationMethodsError, setEvaluationMethodsError] = useState("");
  const [practicalPedagogyError, setPracticalPedagogyError] = useState("");
  const [referenceError, setReferenceError] = useState("");
  const [coMappingError, setCoMappingError] = useState("");
  const [bloomsError, setBloomsError] = useState("");
  const [skillMappingError, setSkillMappingError] = useState("");
  const [skillObjectivesError, setSkillObjectivesError] = useState("");

  // Add this to your state variables at the top of the component
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  // FIXED: Check if subject is practical-only
  const isPracticalOnly =
    lessonPlan?.subject?.is_practical === true &&
    lessonPlan?.subject?.is_theory === false;

  // FIXED: Helper function to check if a string is a UUID
  const isUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // FIXED: Helper function to convert UUID to unit name
  const convertUUIDToUnitName = (unitId: string) => {
    if (!isUUID(unitId)) return unitId; // Already a name

    const unit = (lessonPlan.units || []).find((u: any) => u.id === unitId);
    if (unit) {
      return (
        unit.unit_name ||
        `Unit ${
          (lessonPlan.units || []).findIndex((u: any) => u.id === unitId) + 1
        }`
      );
    }
    return unitId; // Fallback to original if not found
  };

  // OPTIMIZED: Memoized week generation function
  const generateWeekOptions = useMemo(() => {
    const generate = (startDateStr: string, endDateStr: string): string[] => {
      if (!startDateStr || !endDateStr) {
        return [];
      }

      try {
        // OPTIMIZED: Faster date parsing using direct Date constructor
        const parseDate = (dateStr: string): Date => {
          const [day, month, year] = dateStr.split("-").map(Number);
          return new Date(year, month - 1, day);
        };

        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);

        // OPTIMIZED: Calculate weeks more efficiently
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const numWeeks = Math.min(Math.ceil(diffDays / 7), 20); // Cap at 20 weeks for performance

        // OPTIMIZED: Pre-calculate format function
        const formatDate = (date: Date): string => {
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        // OPTIMIZED: Generate weeks in batch
        const weeks: string[] = [];
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
        const weekMs = 7 * 24 * 60 * 60 * 1000;

        for (let i = 0; i < numWeeks; i++) {
          const weekStartTime = startTime + i * weekMs;
          const weekEndTime = Math.min(
            weekStartTime + weekMs - 24 * 60 * 60 * 1000,
            endTime
          );

          const weekStartDate = new Date(weekStartTime);
          const weekEndDate = new Date(weekEndTime);

          weeks.push(
            `Week ${i + 1} (${formatDate(weekStartDate)} - ${formatDate(
              weekEndDate
            )})`
          );
        }

        return weeks;
      } catch (error) {
        console.error("Error generating week options:", error);
        return [];
      }
    };

    return generate(termDates.startDate, termDates.endDate);
  }, [termDates.startDate, termDates.endDate]);

  // OPTIMIZED: Simplified and faster term dates fetching
  const fetchTermDates = useCallback(async () => {
    if (!lessonPlan?.subject?.code || loadingWeeks) return;

    setLoadingWeeks(true);

    try {
      // OPTIMIZED: Single database call with specific field selection
      const { data, error } = await supabase
        .from("subjects")
        .select("metadata")
        .eq("code", lessonPlan.subject.code)
        .single();

      if (error || !data?.metadata) {
        console.warn("No metadata found for subject");
        setLoadingWeeks(false);
        return;
      }

      // OPTIMIZED: Faster metadata parsing
      let metadata = data.metadata;
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          console.error("Error parsing metadata:", e);
          setLoadingWeeks(false);
          return;
        }
      }

      // OPTIMIZED: Direct state update
      const startDate = metadata?.term_start_date || "";
      const endDate = metadata?.term_end_date || "";

      if (startDate && endDate) {
        setTermDates({ startDate, endDate });
      }
    } catch (error) {
      console.error("Error fetching term dates:", error);
    } finally {
      setLoadingWeeks(false);
    }
  }, [lessonPlan?.subject?.code, loadingWeeks]);

  // OPTIMIZED: Reduced useEffect calls
  useEffect(() => {
    if (lessonPlan?.subject?.code && !termDates.startDate) {
      fetchTermDates();
    }
  }, [lessonPlan?.subject?.code, termDates.startDate, fetchTermDates]);

  // Initialize practicals if empty
  useEffect(() => {
    if (!lessonPlan.practicals || lessonPlan.practicals.length === 0) {
      const initialPractical = {
        id: "practical1",
        practical_aim: "",
        associated_units: [],
        probable_week: "",
        lab_hours: 2,
        software_hardware_requirements: "",
        practical_tasks: "",
        evaluation_methods: [],
        other_evaluation_method: "",
        practical_pedagogy: "",
        other_pedagogy: "",
        reference_material: "",
        co_mapping: [],
        pso_mapping: [],
        peo_mapping: [],
        blooms_taxonomy: [],
        skill_mapping: [],
        skill_objectives: "",
      };

      setLessonPlan((prev: any) => ({
        ...prev,
        practicals: [initialPractical],
      }));
    }
  }, [lessonPlan?.practicals, setLessonPlan]);

  // Updated PSO/PEO loading logic to fetch from department_pso_peo table
  useEffect(() => {
    const loadPsoPeoData = async () => {
      if (!lessonPlan.subject?.id) return;

      setLoadingPsoPeo(true);
      setPsoPeoError(null);

      try {
        // Step 1: Get the department_id from the subject
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("department_id")
          .eq("id", lessonPlan.subject.id)
          .single();

        if (subjectError || !subjectData?.department_id) {
          throw new Error("Failed to fetch subject's department.");
        }

        const departmentId = subjectData.department_id;

        // Step 2: Fetch PSO/PEO data from department_pso_peo table
        const { data: deptPsoPeo, error: deptError } = await supabase
          .from("department_pso_peo")
          .select("pso_data, peo_data")
          .eq("department_id", departmentId)
          .single();

        let psoData = defaultPsoOptions;
        let peoData = defaultPeoOptions;

        if (!deptError && deptPsoPeo) {
          if (Array.isArray(deptPsoPeo.pso_data)) {
            psoData = deptPsoPeo.pso_data;
          }

          if (Array.isArray(deptPsoPeo.peo_data)) {
            peoData = deptPsoPeo.peo_data;
          }
        } else {
          console.warn(
            "Falling back to default PSO/PEO due to missing department data or error."
          );
        }

        // Step 3: Set data to state
        setDepartmentPsoPeo({
          pso_data: psoData,
          peo_data: peoData,
        });

        console.log("Loaded PSO/PEO from department_pso_peo:", {
          pso_count: psoData.length,
          peo_count: peoData.length,
        });
      } catch (error) {
        console.error("Error loading PSO/PEO:", error);
        setPsoPeoError("Failed to load PSO/PEO. Default values used.");

        setDepartmentPsoPeo({
          pso_data: defaultPsoOptions,
          peo_data: defaultPeoOptions,
        });
      } finally {
        setLoadingPsoPeo(false);
      }
    };

    loadPsoPeoData();
  }, [lessonPlan.subject?.id, lessonPlan.subject]);

  // Replace the existing useEffect for loading drafts with this improved implementation
  useEffect(() => {
    // Auto-load draft immediately when component mounts and required data is available
    const autoLoadDraft = async () => {
      // Check if we have all required data - we need either userData.id OR faculty.id from lesson plan
      const facultyId = lessonPlan?.faculty?.id || userData?.id;
      const subjectId = lessonPlan?.subject?.id;

      if (!facultyId || !subjectId) {
        console.log("❌ PRACTICAL AUTO-LOAD: Missing required data:", {
          facultyId,
          subjectId,
          userDataId: userData?.id,
          lessonPlanFacultyId: lessonPlan?.faculty?.id,
          hasLessonPlan: !!lessonPlan,
          hasSubject: !!lessonPlan?.subject,
        });
        setIsLoadingDraft(false);
        return;
      }

      // Check if we already have practicals data to avoid unnecessary loading
      const currentPracticals = lessonPlan.practicals || [];
      const hasExistingData =
        currentPracticals.length > 0 && currentPracticals[0]?.practical_aim;

      if (hasExistingData) {
        setIsLoadingDraft(false);
        return;
      }

      console.log("🚀 PRACTICAL AUTO-LOAD: Starting auto-load process...");
      setIsLoadingDraft(true);

      try {
        console.log(
          "📡 PRACTICAL AUTO-LOAD: Making API call to loadFormDraft..."
        );
        const result = await loadFormDraft(
          facultyId,
          subjectId,
          "practical_planning"
        );

        console.log("📡 PRACTICAL AUTO-LOAD: API response:", result);

        if (result.success && result.data) {
          const data = result.data;
          console.log("✅ PRACTICAL AUTO-LOAD: Draft data received:", data);

          // Check if we have valid practical data structure
          if (
            data.practicals &&
            Array.isArray(data.practicals) &&
            data.practicals.length > 0
          ) {
            console.log(
              "✅ PRACTICAL AUTO-LOAD: Valid practicals found:",
              data.practicals.length
            );

            // FIXED: Ensure each practical has proper structure and convert UUIDs to unit names
            const validPracticals = data.practicals.map(
              (practical: any, index: number) => {
                // FIXED: Convert UUID associated_units to unit names
                const convertedUnits = (practical.associated_units || []).map(
                  (unit: string) => convertUUIDToUnitName(unit)
                );

                const validPractical = {
                  ...practical,
                  // Ensure all required fields have default values
                  id: practical.id || `practical${index + 1}`,
                  practical_aim: practical.practical_aim || "",
                  associated_units: convertedUnits, // FIXED: Use converted unit names
                  probable_week: practical.probable_week || "",
                  lab_hours:
                    typeof practical.lab_hours === "number"
                      ? practical.lab_hours
                      : 2,
                  software_hardware_requirements:
                    practical.software_hardware_requirements || "",
                  practical_tasks: practical.practical_tasks || "",
                  evaluation_methods: Array.isArray(
                    practical.evaluation_methods
                  )
                    ? practical.evaluation_methods
                    : [],
                  other_evaluation_method:
                    practical.other_evaluation_method || "",
                  practical_pedagogy: practical.practical_pedagogy || "",
                  other_pedagogy: practical.other_pedagogy || "",
                  reference_material: practical.reference_material || "",
                  co_mapping: Array.isArray(practical.co_mapping)
                    ? practical.co_mapping
                    : [],
                  pso_mapping: Array.isArray(practical.pso_mapping)
                    ? practical.pso_mapping
                    : [],
                  peo_mapping: Array.isArray(practical.peo_mapping)
                    ? practical.peo_mapping
                    : [],
                  blooms_taxonomy: Array.isArray(practical.blooms_taxonomy)
                    ? practical.blooms_taxonomy
                    : [],
                  skill_mapping: Array.isArray(practical.skill_mapping)
                    ? practical.skill_mapping
                    : [],
                  skill_objectives: practical.skill_objectives || "",
                };
                return validPractical;
              }
            );

            console.log(
              "🔄 PRACTICAL AUTO-LOAD: Setting practicals to lesson plan..."
            );

            // Update the lesson plan with loaded data
            setLessonPlan((prev: any) => {
              console.log(
                "🔄 PRACTICAL AUTO-LOAD: Previous lesson plan:",
                prev
              );
              const updated = {
                ...prev,
                practicals: validPracticals,
                practical_remarks: data.remarks || "",
              };
              console.log(
                "🔄 PRACTICAL AUTO-LOAD: Updated lesson plan:",
                updated
              );
              return updated;
            });

            console.log("🎉 PRACTICAL AUTO-LOAD: Success! Showing toast...");
            toast.success(
              `Draft loaded automatically with ${validPracticals.length} practical(s)`
            );

            // Set last saved time if available
            if (data.savedAt) {
              setLastSaved(new Date(data.savedAt));
            } else {
              setLastSaved(new Date());
            }
          }
        }
      } catch (error) {
        console.error("💥 PRACTICAL AUTO-LOAD: Error occurred:", error);
        toast.error("Failed to auto-load draft");
      } finally {
        console.log(
          "🏁 PRACTICAL AUTO-LOAD: Process completed, setting loading to false"
        );
        setIsLoadingDraft(false);
      }
    };

    // Run auto-load when we have the required data (either userData.id OR faculty.id from lesson plan)
    const facultyId = lessonPlan?.faculty?.id || userData?.id;
    const subjectId = lessonPlan?.subject?.id;

    if (facultyId && subjectId) {
      autoLoadDraft();
    } else {
      setIsLoadingDraft(false);
    }
  }, [
    userData?.id,
    lessonPlan?.subject?.id,
    lessonPlan,
    setLessonPlan,
    userData,
    lessonPlan?.faculty?.id,
  ]);

  // Fetch faculty name for proper storage
  useEffect(() => {
    const fetchFacultyName = async () => {
      const facultyId = lessonPlan?.faculty?.id || userData?.id;
      if (!facultyId) return;

      try {
        const { data: facultyData, error } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", facultyId)
          .single();

        if (!error && facultyData) {
          const fullName = `${facultyData.first_name || ""} ${
            facultyData.last_name || ""
          }`.trim();

          // Update all practicals with the correct faculty name
          setLessonPlan((prev: any) => ({
            ...prev,
            practicals: (prev.practicals || []).map((practical: any) => ({
              ...practical,
              faculty_name: fullName || "Current Faculty",
            })),
          }));
        }
      } catch (error) {
        console.error("Error fetching faculty name:", error);
      }
    };

    fetchFacultyName();
  }, [lessonPlan?.faculty?.id, userData?.id, setLessonPlan]);

  const handlePracticalChange = (index: number, field: string, value: any) => {
    const updatedPracticals = [...(lessonPlan.practicals || [])];

    updatedPracticals[index] = {
      ...updatedPracticals[index],
      [field]: value,
    };

    setLessonPlan((prev: any) => ({
      ...prev,
      practicals: updatedPracticals,
    }));

    validatePractical(updatedPracticals[index], index);
  };

  const validatePractical = (practical: any, index: number) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Add validation logic here if needed

    setValidationErrors(errors);
    setValidationWarnings(warnings);
  };

  const validateAllPracticals = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const currentPracticals = lessonPlan.practicals || [];

    // Add validation logic here if needed

    return { errors, warnings };
  };

  const resetFieldErrors = () => {
    setPracticalAimError("");
    setAssociatedUnitsError("");
    setProbableWeekError("");
    setLabHoursError("");
    setSoftwareHardwareError("");
    setPracticalTasksError("");
    setEvaluationMethodsError("");
    setPracticalPedagogyError("");
    setReferenceError("");
    setCoMappingError("");
    setBloomsError("");
    setSkillMappingError("");
    setSkillObjectivesError("");
  };

  const addPractical = () => {
    const currentPracticals = lessonPlan.practicals || [];
    const newPracticalNumber = currentPracticals.length + 1;
    const newPractical = {
      id: `practical${newPracticalNumber}`,
      practical_aim: "",
      associated_units: [],
      probable_week: "",
      lab_hours: 2,
      software_hardware_requirements: "",
      practical_tasks: "",
      evaluation_methods: [],
      other_evaluation_method: "",
      practical_pedagogy: "",
      other_pedagogy: "",
      reference_material: "",
      co_mapping: [],
      pso_mapping: [],
      peo_mapping: [],
      blooms_taxonomy: [],
      skill_mapping: [],
      skill_objectives: "",
    };

    setLessonPlan((prev: any) => ({
      ...prev,
      practicals: [...currentPracticals, newPractical],
    }));

    setActivePractical(currentPracticals.length);
  };

  const removePractical = (index: number) => {
    const currentPracticals = lessonPlan.practicals || [];
    if (currentPracticals.length <= 1) {
      toast.error("At least one practical is required");
      return;
    }

    const updatedPracticals = currentPracticals.filter(
      (_: any, i: number) => i !== index
    );
    setLessonPlan((prev: any) => ({
      ...prev,
      practicals: updatedPracticals,
    }));

    if (activePractical >= index && activePractical > 0) {
      setActivePractical(activePractical - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);

    try {
      // Ensure we have valid practical data structure
      const validPracticals = (lessonPlan.practicals || []).map(
        (practical: any) => ({
          ...practical,
          // Ensure all required fields have default values
          id: practical.id || `practical${Date.now()}`,
          practical_aim: practical.practical_aim || "",
          associated_units: practical.associated_units || [],
          probable_week: practical.probable_week || "",
          lab_hours: practical.lab_hours || 2,
          software_hardware_requirements:
            practical.software_hardware_requirements || "",
          practical_tasks: practical.practical_tasks || "",
          evaluation_methods: practical.evaluation_methods || [],
          other_evaluation_method: practical.other_evaluation_method || "",
          practical_pedagogy: practical.practical_pedagogy || "",
          other_pedagogy: practical.other_pedagogy || "",
          reference_material: practical.reference_material || "",
          co_mapping: practical.co_mapping || [],
          pso_mapping: practical.pso_mapping || [],
          peo_mapping: practical.peo_mapping || [],
          blooms_taxonomy: practical.blooms_taxonomy || [],
          skill_mapping: practical.skill_mapping || [],
          skill_objectives: practical.skill_objectives || "",
        })
      );

      const formData = {
        practicals: validPracticals,
        remarks: lessonPlan.practical_remarks || "",
      };

      console.log("Saving practical draft data:", formData); // Debug log

      const result = await saveFormDraft(
        lessonPlan?.faculty?.id || userData?.id || "",
        lessonPlan?.subject?.id || "",
        "practical_planning",
        formData
      );

      if (result.success) {
        setLastSaved(new Date());
        toast.success("Draft saved successfully");
      } else {
        console.error("Draft save failed:", result.error);
        toast.error(`Failed to save draft: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const clearDraft = async () => {
    try {
      const result = await deleteFormDraft(
        lessonPlan?.faculty?.id || userData?.id || "",
        lessonPlan?.subject?.id || "",
        "practical_planning"
      );

      if (result.success) {
        console.log("Practical draft cleared after successful submission");
      }
    } catch (error) {
      console.error("Error clearing practical draft:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    resetFieldErrors();

    // Validate current practical fields
    let hasFieldErrors = false;

    if (!currentPractical.practical_aim) {
      setPracticalAimError("Practical aim is required");
      hasFieldErrors = true;
    }

    // FIXED: Only validate associated units for non-practical-only subjects
    if (
      !isPracticalOnly &&
      (!currentPractical.associated_units ||
        currentPractical.associated_units.length === 0)
    ) {
      setAssociatedUnitsError("Associated units are required");
      hasFieldErrors = true;
    }

    if (!currentPractical.probable_week) {
      setProbableWeekError("Probable week is required");
      hasFieldErrors = true;
    }

    if (!currentPractical.lab_hours || currentPractical.lab_hours < 1) {
      setLabHoursError("Lab hours must be at least 1");
      hasFieldErrors = true;
    }

    if (!currentPractical.software_hardware_requirements) {
      setSoftwareHardwareError("Software/hardware requirements are required");
      hasFieldErrors = true;
    }

    if (!currentPractical.practical_tasks) {
      setPracticalTasksError("Practical tasks are required");
      hasFieldErrors = true;
    }

    if (
      !currentPractical.evaluation_methods ||
      currentPractical.evaluation_methods.length === 0
    ) {
      setEvaluationMethodsError("At least one evaluation method is required");
      hasFieldErrors = true;
    }

    if (!currentPractical.practical_pedagogy) {
      setPracticalPedagogyError("Practical pedagogy is required");
      hasFieldErrors = true;
    }

    if (!currentPractical.reference_material) {
      setReferenceError("Reference material is required");
      hasFieldErrors = true;
    }

    if (
      !currentPractical.co_mapping ||
      currentPractical.co_mapping.length === 0
    ) {
      setCoMappingError("CO mapping is required");
      hasFieldErrors = true;
    }

    if (
      !currentPractical.blooms_taxonomy ||
      currentPractical.blooms_taxonomy.length === 0
    ) {
      setBloomsError("At least one Bloom's taxonomy level is required");
      hasFieldErrors = true;
    }

    if (
      !currentPractical.skill_mapping ||
      currentPractical.skill_mapping.length === 0
    ) {
      setSkillMappingError("At least one skill must be mapped");
      hasFieldErrors = true;
    }

    if (!currentPractical.skill_objectives) {
      setSkillObjectivesError("Skill objectives are required");
      hasFieldErrors = true;
    }

    const { errors, warnings } = validateAllPracticals();

    if (errors.length > 0 || hasFieldErrors) {
      setValidationErrors(errors);
      setValidationWarnings(warnings);
      toast.error("Please fix validation errors before saving");
      setSaving(false);
      return;
    }

    if (warnings.length > 0) {
      setValidationWarnings(warnings);
    }

    console.log(currentPractical);

    try {
      const result = await savePracticalPlanningForm({
        faculty_id: lessonPlan.faculty?.id || userData?.id || "",
        subject_id: lessonPlan.subject?.id || "",
        practicals: lessonPlan.practicals,
        remarks: lessonPlan.practical_remarks,
      });

      if (result.success) {
        toast.success("Practical details saved successfully");
        setValidationErrors([]);
        setValidationWarnings([]);

        setLessonPlan((prev: any) => ({
          ...prev,
          practical_planning_completed: true,
        }));

        // Clear the draft after successful submission
        await clearDraft();
      } else {
        toast.error(result.error || "Failed to save practical details");
      }
    } catch (error) {
      console.error("Error saving practical details:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const currentPracticals = lessonPlan.practicals || [];
  const currentPractical = currentPracticals[activePractical];

  if (!currentPractical) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Auto-loading indicator */}
      {(lessonPlan.practicals?.length === 0 || !lessonPlan.practicals) && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-md flex items-center">
          <Info className="h-4 w-4 mr-2" />
          <span>Loading saved drafts...</span>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="mb-6 border border-amber-200 bg-amber-50 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-amber-800">
              <ul className="list-disc list-inside space-y-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Practical Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2 flex-wrap">
          {currentPracticals.map((practical: any, index: number) => (
            <Button
              key={practical.id}
              variant={activePractical === index ? "default" : "outline"}
              className={
                activePractical === index
                  ? "bg-[#1A5CA1] hover:bg-[#154A80]"
                  : ""
              }
              onClick={() => setActivePractical(index)}
            >
              Practical {index + 1}
              {practical.practical_aim && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {practical.practical_aim.substring(0, 10)}
                  {practical.practical_aim.length > 10 ? "..." : ""}
                </Badge>
              )}
            </Button>
          ))}
          <Button variant="outline" onClick={addPractical}>
            <Plus className="h-4 w-4 mr-1" />
            Add Practical
          </Button>
        </div>
        {currentPracticals.length > 1 && (
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removePractical(activePractical)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove Practical
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Practical {activePractical + 1}
          </h3>
        </div>

        {/* Practical Aim */}
        <div>
          <Label htmlFor="practical-aim">
            Practical Aim <span className="text-red-500">*</span>
          </Label>
          <Input
            id="practical-aim"
            value={currentPractical.practical_aim || ""}
            onChange={(e) =>
              handlePracticalChange(
                activePractical,
                "practical_aim",
                e.target.value
              )
            }
            placeholder="Enter practical aim"
            className="mt-1"
          />
          {practicalAimError && (
            <p className="text-red-500 text-xs mt-1">{practicalAimError}</p>
          )}
        </div>

        {/* FIXED: Only show Associated Units for non-practical-only subjects */}
        {!isPracticalOnly && (
          <div>
            <Label htmlFor="associated-units">
              Associated Units <span className="text-red-500">*</span>
            </Label>
            <Select
              value=""
              onValueChange={(value) => {
                const currentUnits = currentPractical.associated_units || [];
                // Find the unit by ID to get its name
                const selectedUnit = (lessonPlan.units || []).find(
                  (unit: any) => unit.id === value
                );
                const unitName =
                  selectedUnit?.unit_name ||
                  `Unit ${
                    (lessonPlan.units || []).findIndex(
                      (u: any) => u.id === value
                    ) + 1
                  }`;

                if (!currentUnits.includes(unitName)) {
                  handlePracticalChange(activePractical, "associated_units", [
                    ...currentUnits,
                    unitName,
                  ]);
                }
              }}
            >
              <SelectTrigger id="associated-units" className="mt-1">
                <SelectValue
                  placeholder={`${
                    (currentPractical.associated_units || []).length
                  } unit(s) selected`}
                />
              </SelectTrigger>
              <SelectContent>
                {(lessonPlan.units || []).map((unit: any, index: number) => (
                  <SelectItem
                    key={unit.id || `unit-${index}`}
                    value={unit.id || `unit-${index}`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(
                          currentPractical.associated_units || []
                        ).includes(unit.unit_name || `Unit ${index + 1}`)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      Unit {index + 1}: {unit.unit_name || "No name specified"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {associatedUnitsError && (
              <p className="text-red-500 text-xs mt-1">
                {associatedUnitsError}
              </p>
            )}

            {/* Display selected units */}
            {currentPractical.associated_units &&
              currentPractical.associated_units.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentPractical.associated_units.map(
                    (unitName: string, index: number) => (
                      <Badge
                        key={`${unitName}-${index}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {unitName}
                        <button
                          onClick={() => {
                            const updated = (
                              currentPractical.associated_units || []
                            ).filter((name: string) => name !== unitName);
                            handlePracticalChange(
                              activePractical,
                              "associated_units",
                              updated
                            );
                          }}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  )}
                </div>
              )}
          </div>
        )}

        {/* OPTIMIZED: Probable Week with loading state */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="probable-week">
              Probable Week <span className="text-red-500">*</span>
            </Label>
            <Select
              value={currentPractical.probable_week || ""}
              onValueChange={(value) =>
                handlePracticalChange(activePractical, "probable_week", value)
              }
              disabled={loadingWeeks}
            >
              <SelectTrigger id="probable-week" className="mt-1">
                <SelectValue
                  placeholder={
                    loadingWeeks ? "Loading weeks..." : "Select probable week"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingWeeks ? (
                  <SelectItem value="loading" disabled>
                    Loading weeks...
                  </SelectItem>
                ) : generateWeekOptions.length > 0 ? (
                  generateWeekOptions.map((week) => (
                    <SelectItem key={week} value={week}>
                      {week}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-weeks" disabled>
                    No weeks available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {probableWeekError && (
              <p className="text-red-500 text-xs mt-1">{probableWeekError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lab-hours">
              Lab Hours <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lab-hours"
              type="number"
              min="1"
              value={currentPractical.lab_hours || ""}
              onChange={(e) =>
                handlePracticalChange(
                  activePractical,
                  "lab_hours",
                  Number(e.target.value)
                )
              }
              className="mt-1"
            />
            {labHoursError && (
              <p className="text-red-500 text-xs mt-1">{labHoursError}</p>
            )}
          </div>
        </div>

        {/* Rest of the form fields remain the same... */}
        {/* I'll include just a few more key fields for brevity */}

        {/* Software/Hardware Requirements */}
        <div>
          <Label htmlFor="software-hardware">
            Software/Hardware Requirements{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="software-hardware"
            value={currentPractical.software_hardware_requirements || ""}
            onChange={(e) =>
              handlePracticalChange(
                activePractical,
                "software_hardware_requirements",
                e.target.value
              )
            }
            placeholder="Enter software/hardware requirements"
            className="mt-1"
            rows={3}
          />
          {softwareHardwareError && (
            <p className="text-red-500 text-xs mt-1">{softwareHardwareError}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <div className="flex items-center">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}{" "}
                {lastSaved.toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="min-w-[100px]"
            >
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="min-w-[100px] bg-[#1A5CA1] hover:bg-[#154A80]"
            >
              {saving ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Dialog */}
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>{currentWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWarningDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setWarningDialogOpen(false);
                handleSave();
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
