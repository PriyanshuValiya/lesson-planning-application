//@ts-nocheck
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CalendarIcon,
  Eye,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, parse } from "date-fns";
import { Progress } from "@/components/ui/progress";

// Helper function to parse DD-MM-YYYY and format to a readable string
const parseAndFormatDate = (dateString: string) => {
  if (!dateString) return "Not specified";
  const parsedDate = parse(dateString, "dd-MM-yyyy", new Date());
  if (isNaN(parsedDate.getTime())) {
    try {
      const isoParsedDate = parseISO(dateString);
      if (!isNaN(isoParsedDate.getTime())) {
        return format(isoParsedDate, "PPPP");
      }
    } catch (e) {
      const genericDate = new Date(dateString);
      if (!isNaN(genericDate.getTime())) {
        return format(genericDate, "PPPP");
      }
    }
    return "Invalid Date";
  }
  return format(parsedDate, "PPPP");
};

const formSchema = z.object({
  actual_units: z.array(z.string()).min(1, "At least one unit is required"),
  actual_pedagogy: z.string().min(1, "Required"),
  custom_pedagogy: z.string().optional(),
  actual_date: z.string().min(1, "Required"),
  actual_duration: z.string().min(1, "Required"),
  actual_marks: z.number().min(0.1, "Must be positive"),
  co: z.array(z.string()).min(1, "At least one CO is required"),
  pso: z.array(z.string()).min(1, "At least one PSO is required"),
  actual_blooms: z.string().min(1, "Required"),
  actual_skills: z.array(z.string()).optional(), // Added skills field
  reason_for_change: z.string().optional(),
  quality_review_completed: z.boolean().default(false),
  moderation_start_date: z.string().optional(),
  moderation_end_date: z.string().optional(),
  marks_display_date: z.string().optional(),
  cie_paper_file: z.any().optional(),
  evaluation_analysis_file: z.any().optional(),
  marks_display_document: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditActualFormProps {
  formsData: any;
  actualCiesData: any[];
  userRoleData: any;
  departmentPsoPeoData: any;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
}

// Fixed Multi-select component
const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
  getLabel,
  getValue,
}: {
  options: any[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  getLabel: (option: any) => string;
  getValue: (option: any) => string;
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeItem = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
          >
            {value.length > 0 ? `${value.length} selected` : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="max-h-60 overflow-auto">
            {options.map((option) => {
              const optionValue = getValue(option);
              const isSelected = value.includes(optionValue);
              return (
                <div
                  key={optionValue}
                  className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(optionValue)}
                >
                  <Checkbox checked={isSelected} />
                  <span className="text-sm">{getLabel(option)}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((selectedValue) => {
            const option = options.find(
              (opt) => getValue(opt) === selectedValue
            );
            return (
              <Badge
                key={selectedValue}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option ? getLabel(option) : selectedValue}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeItem(selectedValue)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function EditActualForm({
  formsData,
  actualCiesData,
  userRoleData,
  departmentPsoPeoData,
}: EditActualFormProps) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, any>
  >({});

  // Extract CIEs from forms data
  const ciesFromForm = formsData.form?.cies || [];

  // Memoized evaluation pedagogy options
  const evaluationPedagogyOptions = useMemo(
    () => ({
      traditional: [
        "Objective-Based Assessment (Quiz/MCQ)",
        "Short/Descriptive Evaluation",
        "Oral/Visual Communication-Based Evaluation (Presentation/Public Speaking/Viva)",
        "Assignment-Based Evaluation (Homework/Take-home assignments)",
      ],
      alternative: [
        "Problem-Based Evaluation",
        "Open Book Assessment",
        "Peer Assessment",
        "Case Study-Based Evaluation",
        "Concept Mapping Evaluation",
        "Analytical Reasoning Test",
        "Critical Thinking Assessment",
        "Project-Based Assessment",
        "Group/Team Assessment",
        "Certification-Based Evaluation",
      ],
      other: ["Other"],
    }),
    []
  );

  // Memoized extracted options
  const extractedOptions = useMemo(
    () => ({
      pedagogies: [
        ...evaluationPedagogyOptions.traditional,
        ...evaluationPedagogyOptions.alternative,
        ...evaluationPedagogyOptions.other,
      ],
      bloomsTaxonomy: [
        "Remember",
        "Understand",
        "Apply",
        "Analyze",
        "Evaluate",
        "Create",
      ],
      courseOutcomes: formsData.form?.generalDetails?.courseOutcomes || [],
      units: formsData.form?.units || [],
      psoOptions: departmentPsoPeoData?.pso_data || [],
      peoOptions: departmentPsoPeoData?.peo_data || [],
      // Extract all unique skills from units
      skillsOptions: Array.from(
        new Set(
          (formsData.form?.units || [])
            .flatMap((unit: any) => unit.skill_mapping || [])
            .filter(Boolean)
        )
      ).map((skill) => ({
        id: skill,
        name: skill.replace(/^Other:\s*/i, "").trim(), // Remove 'Other: ' prefix
      })),
    }),
    [formsData, departmentPsoPeoData, evaluationPedagogyOptions]
  );

  // Set initial active tab
  useEffect(() => {
    if (ciesFromForm.length > 0 && !activeTab) {
      setActiveTab(`cie-${ciesFromForm[0].id}`);
    }
  }, [ciesFromForm, activeTab]);

  // Check if CIE date has passed
  const isCieActive = useCallback((cieDate: string) => {
    if (!cieDate) return false;
    const today = new Date();
    const cie = parse(cieDate, "dd-MM-yyyy", new Date());
    if (isNaN(cie.getTime())) {
      const fallbackCie = new Date(cieDate);
      return fallbackCie.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0);
    }
    return cie.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0);
  }, []);

  // Get existing actual data for a CIE
  const getExistingActual = useCallback(
    (cieId: string) => {
      const cieNumber = Number.parseInt(cieId.replace("cie", ""));
      const existing = actualCiesData.find(
        (actual) => actual.cie_number === cieNumber
      );
      return optimisticUpdates[cieId] || existing;
    },
    [actualCiesData, optimisticUpdates]
  );

  // Fast file upload with chunking for large files
  const uploadFileOptimized = useCallback(
    async (
      file: File,
      fileType: string,
      cieId: string,
      existingFilePath?: string
    ): Promise<string | null> => {
      if (!file) return null;

      const fileName = `${fileType}-${file.name}`;

      // Add to upload progress
      setUploadProgress((prev) => [
        ...prev.filter((p) => p.fileName !== fileName),
        {
          fileName,
          progress: 0,
          status: "uploading" as const,
        },
      ]);

      try {
        const fileExt = file.name?.split(".").pop() || "pdf";
        const bucketName = "actual-cies";
        const subjectId = formsData.subject_id || "unknown-subject";
        const formId = formsData.id;
        const cieNumber = cieId.replace("cie", "");
        const folderPath = `${subjectId}/${formId}/cie${cieNumber}`;
        const filePath = `${folderPath}/${fileType}-${Date.now()}.${fileExt}`;

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.fileName === fileName
                ? { ...p, progress: Math.min(p.progress + 10, 90) }
                : p
            )
          );
        }, 100);

        // Upload file
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type || "application/pdf",
          });

        clearInterval(progressInterval);

        if (error) {
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.fileName === fileName
                ? { ...p, status: "error" as const, progress: 0 }
                : p
            )
          );
          throw new Error(`Upload failed: ${error.message}`);
        }

        // Mark as completed
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === fileName
              ? { ...p, status: "completed" as const, progress: 100 }
              : p
          )
        );

        // Delete old file asynchronously (non-blocking)
        if (existingFilePath) {
          supabase.storage
            .from(bucketName)
            .remove([existingFilePath])
            .catch((err) => console.warn("Failed to delete old file:", err));
        }

        // Remove from progress after 2 seconds
        setTimeout(() => {
          setUploadProgress((prev) =>
            prev.filter((p) => p.fileName !== fileName)
          );
        }, 2000);

        return filePath;
      } catch (error: any) {
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === fileName
              ? { ...p, status: "error" as const, progress: 0 }
              : p
          )
        );
        throw error;
      }
    },
    [formsData, supabase]
  );

  // Optimistic draft save (instant UI update)
  const handleSaveDraft = useCallback(
    async (values: FormData, cieData: any) => {
      const cieNumber = Number.parseInt(cieData.id.replace("cie", ""));
      const existingActual = getExistingActual(cieData.id);

      // Optimistic update
      const optimisticData = {
        ...existingActual,
        actual_blooms: values.actual_blooms || "",
        actual_date: values.actual_date || "",
        actual_duration: values.actual_duration || "",
        actual_marks: values.actual_marks || 0,
        actual_pedagogy:
          values.actual_pedagogy === "Other"
            ? values.custom_pedagogy
            : values.actual_pedagogy || "",
        actual_units: values.actual_units.join(", "),
        actual_skills: values.actual_skills?.join(", ") || "", // Added skills
        co: values.co.join(", "),
        pso: values.pso.join(", "),
        is_submitted: false,
        marks_display_date: values.marks_display_date || null,
        quality_review_completed: values.quality_review_completed || false,
        moderation_start_date: values.moderation_start_date || null,
        moderation_end_date: values.moderation_end_date || null,
        reason_for_change: values.reason_for_change || "",
      };

      setOptimisticUpdates((prev) => ({
        ...prev,
        [cieData.id]: optimisticData,
      }));

      toast.success("Draft saved!");

      try {
        setIsDraftSaving(true);
        const draftData = {
          ...optimisticData,
          cie_number: cieNumber,
          created_at: new Date().toISOString(),
          forms: formsData.id,
          cie_paper_document: existingActual?.cie_paper_document || null,
          evalution_analysis_document:
            existingActual?.evalution_analysis_document || null,
          marks_display_document:
            existingActual?.marks_display_document || null,
        };

        let response;
        if (existingActual?.id) {
          response = await supabase
            .from("actual_cies")
            .update(draftData)
            .eq("id", existingActual.id)
            .select();
        } else {
          response = await supabase
            .from("actual_cies")
            .insert(draftData)
            .select();
        }

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update with real data
        if (response.data?.[0]) {
          setOptimisticUpdates((prev) => ({
            ...prev,
            [cieData.id]: response.data[0],
          }));
        }
      } catch (error: any) {
        // Revert optimistic update on error
        setOptimisticUpdates((prev) => {
          const newState = { ...prev };
          delete newState[cieData.id];
          return newState;
        });
        toast.error("Failed to save draft");
        console.error("Error saving draft:", error);
      } finally {
        setIsDraftSaving(false);
      }
    },
    [formsData, getExistingActual, supabase]
  );

  // Fast submit with parallel uploads
  const handleSubmit = useCallback(
    async (values: FormData, cieData: any) => {
      try {
        setIsSubmitting(true);
        const cieNumber = Number.parseInt(cieData.id.replace("cie", ""));
        const existingActual = getExistingActual(cieData.id);

        // Optimistic update for immediate feedback
        const optimisticData = {
          ...existingActual,
          ...values,
          actual_units: values.actual_units.join(", "),
          actual_skills: values.actual_skills?.join(", ") || "", // Added skills
          co: values.co.join(", "),
          pso: values.pso.join(", "),
          is_submitted: true,
          cie_number: cieNumber,
        };

        setOptimisticUpdates((prev) => ({
          ...prev,
          [cieData.id]: optimisticData,
        }));

        // Start file uploads in parallel
        const uploadPromises: Promise<string | null>[] = [];
        const fileFields = [
          {
            file: values.cie_paper_file,
            type: "paper",
            existing: existingActual?.cie_paper_document,
          },
          {
            file: values.evaluation_analysis_file,
            type: "analysis",
            existing: existingActual?.evalution_analysis_document,
          },
          {
            file: values.marks_display_document,
            type: "marks",
            existing: existingActual?.marks_display_document,
          },
        ];

        fileFields.forEach(({ file, type, existing }) => {
          if (file instanceof File) {
            uploadPromises.push(
              uploadFileOptimized(file, type, cieData.id, existing)
            );
          } else {
            uploadPromises.push(Promise.resolve(existing || null));
          }
        });

        // Wait for all uploads to complete
        const [ciePaperPath, analysisPath, marksPath] = await Promise.all(
          uploadPromises
        );

        console.log("Upload results");

        // Submit to database
        const actualData = {
          faculty_id: userRoleData.users.id,
          subject_id: userRoleData.subjects.id,
          actual_blooms: values.actual_blooms,
          actual_date: values.actual_date,
          actual_duration: values.actual_duration,
          actual_marks: values.actual_marks,
          actual_pedagogy:
            values.actual_pedagogy === "Other"
              ? values.custom_pedagogy
              : values.actual_pedagogy,
          actual_units: values.actual_units.join(", "),
          actual_skills: values.actual_skills?.join(", ") || "", // Added skills
          cie_number: cieNumber,
          cie_paper_document: ciePaperPath,
          co: values.co.join(", "),
          pso: values.pso.join(", "),
          created_at: new Date().toISOString(),
          evalution_analysis_document: analysisPath,
          is_submitted: true,
          marks_display_date: values.marks_display_date,
          quality_review_completed: values.quality_review_completed || false,
          moderation_start_date: values.moderation_start_date,
          moderation_end_date: values.moderation_end_date,
          reason_for_change: values.reason_for_change,
          forms: formsData.id,
          marks_display_document: marksPath,
        };

        let response;
        if (existingActual?.id) {
          response = await supabase
            .from("actual_cies")
            .update(actualData)
            .eq("id", existingActual.id)
            .select();
        } else {
          response = await supabase
            .from("actual_cies")
            .insert(actualData)
            .select();
        }

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update with real data
        if (response.data?.[0]) {
          setOptimisticUpdates((prev) => ({
            ...prev,
            [cieData.id]: response.data[0],
          }));
        }

        toast.success("CIE submitted successfully!");
      } catch (error: any) {
        // Revert optimistic update on error
        setOptimisticUpdates((prev) => {
          const newState = { ...prev };
          delete newState[cieData.id];
          return newState;
        });
        toast.error("Submission failed!");
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formsData, getExistingActual, supabase, uploadFileOptimized]
  );

  const CieTabContent = ({ cieData }: { cieData: any }) => {
    const existingActual = getExistingActual(cieData.id);
    const isActive = isCieActive(cieData.date);

    // Memoized planned data calculations
    const plannedData = useMemo(() => {
      const plannedCoNumbers =
        cieData.co_mapping
          ?.map((coId: string) => {
            const coIndex = extractedOptions.courseOutcomes.findIndex(
              (co: any) => co.id === coId
            );
            return coIndex !== -1 ? `CO${coIndex + 1}` : null;
          })
          .filter(Boolean)
          .join(", ") || "Not specified";

      const plannedPsoNumbers =
        cieData.pso_mapping
          ?.map((psoId: string) => {
            const psoIndex = extractedOptions.psoOptions.findIndex(
              (pso: any) => pso.id === psoId
            );
            return psoIndex !== -1 ? `PSO${psoIndex + 1}` : null;
          })
          .filter(Boolean)
          .join(", ") || "Not specified";

      const plannedUnitNumbers =
        cieData.units_covered
          ?.map((unitId: string) => {
            const unitIndex = extractedOptions.units.findIndex(
              (u: any) => u.id === unitId
            );
            return unitIndex !== -1 ? `Unit ${unitIndex + 1}` : null;
          })
          .filter(Boolean)
          .join(", ") || "Not specified";

      // Get skills from planned units and COs
      const plannedSkills = new Set<string>();
      // Skills from units
      cieData.units_covered?.forEach((unitId: string) => {
        const unit = extractedOptions.units.find((u: any) => u.id === unitId);
        if (unit?.skill_mapping) {
          unit.skill_mapping.forEach((skill: string) => {
            // Remove 'Other: ' prefix from planned skills as well
            const cleanedSkill = skill.replace(/^Other:\s*/i, "").trim();
            plannedSkills.add(cleanedSkill);
          });
        }
      });

      return {
        plannedCoNumbers,
        plannedPsoNumbers,
        plannedUnitNumbers,
        plannedSkills: Array.from(plannedSkills),
      };
    }, [cieData, extractedOptions]);

    const defaultValues: FormData = useMemo(
      () => ({
        actual_units: existingActual?.actual_units
          ? existingActual.actual_units.split(", ").map((unit: string) => {
              const unitMatch = unit.match(/Unit (\d+)/);
              if (unitMatch) {
                const unitIndex = Number.parseInt(unitMatch[1]) - 1;
                return extractedOptions.units[unitIndex]?.id || unit;
              }
              return unit;
            })
          : cieData.units_covered || [],
        actual_pedagogy:
          existingActual?.actual_pedagogy || cieData.evaluation_pedagogy || "",
        custom_pedagogy: existingActual?.custom_pedagogy || "",
        actual_date: existingActual?.actual_date || "",
        actual_duration:
          existingActual?.actual_duration || cieData.duration?.toString() || "",
        actual_marks: existingActual?.actual_marks || cieData.marks || 0,
        co: existingActual?.co
          ? existingActual.co.split(", ").map((co: string) => {
              const coMatch = co.match(/CO(\d+)/);
              if (coMatch) {
                const coIndex = Number.parseInt(coMatch[1]) - 1;
                return extractedOptions.courseOutcomes[coIndex]?.id || co;
              }
              return co;
            })
          : cieData.co_mapping || [],
        pso: existingActual?.pso
          ? existingActual.pso.split(", ").map((pso: string) => {
              const psoMatch = pso.match(/PSO(\d+)/);
              if (psoMatch) {
                const psoIndex = Number.parseInt(psoMatch[1]) - 1;
                return extractedOptions.psoOptions[psoIndex]?.id || pso;
              }
              return pso;
            })
          : cieData.pso_mapping || [],
        actual_blooms:
          existingActual?.actual_blooms ||
          (cieData.blooms_taxonomy ? cieData.blooms_taxonomy.join(", ") : ""),
        actual_skills: existingActual?.actual_skills
          ? existingActual.actual_skills.split(", ")
          : plannedData.plannedSkills || [], // Added skills with default from planned
        reason_for_change: existingActual?.reason_for_change || "",
        quality_review_completed:
          existingActual?.quality_review_completed || false,
        moderation_start_date: existingActual?.moderation_start_date || "",
        moderation_end_date: existingActual?.moderation_end_date || "",
        marks_display_date: existingActual?.marks_display_date || "",
        cie_paper_file: null,
        evaluation_analysis_file: null,
        marks_display_document: null,
      }),
      [existingActual, cieData, extractedOptions, plannedData]
    );

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
    });

    if (!isActive) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">CIE Not Yet Conducted</h3>
          <p className="text-muted-foreground mb-4">
            This CIE is scheduled for {parseAndFormatDate(cieData.date)}
          </p>
          <Badge variant="secondary">Scheduled</Badge>
        </div>
      );
    }

    const onSubmit = (values: FormData) => handleSubmit(values, cieData);
    const onSaveDraft = () => handleSaveDraft(form.getValues(), cieData);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Planned Details Card */}
            <Card className="shadow-sm">
              <CardContent>
                <h3 className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px] mb-4">
                  Planned Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">CIE Type:</p>
                    <p className="text-muted-foreground">
                      {cieData.type || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Date:</p>
                    <p className="text-muted-foreground">
                      {cieData.date
                        ? parseAndFormatDate(cieData.date)
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Duration:</p>
                    <p className="text-muted-foreground">
                      {cieData.duration || 0} minutes
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Marks:</p>
                    <p className="text-muted-foreground">
                      {cieData.marks || 0} marks
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Pedagogy:</p>
                    <p className="text-muted-foreground">
                      {cieData.evaluation_pedagogy || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Units Covered:</p>
                    <div className="flex flex-wrap gap-1">
                      {cieData.units_covered?.map((unitId: string) => {
                        const unitIndex = extractedOptions.units.findIndex(
                          (u: any) => u.id === unitId
                        );
                        const unitNumber =
                          unitIndex !== -1 ? unitIndex + 1 : "?";
                        const unitName =
                          unitIndex !== -1
                            ? extractedOptions.units[unitIndex].unit_name
                            : "Unknown";
                        return (
                          <Badge
                            key={unitId}
                            variant="outline"
                            className="text-xs"
                            title={unitName}
                          >
                            Unit {unitNumber}
                          </Badge>
                        );
                      }) || (
                        <span className="text-muted-foreground">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">CO Mapping:</p>
                    <div className="flex flex-wrap gap-1">
                      {cieData.co_mapping?.map((coId: string) => {
                        const coIndex =
                          extractedOptions.courseOutcomes.findIndex(
                            (c: any) => c.id === coId
                          );
                        const coNumber = coIndex !== -1 ? coIndex + 1 : "?";
                        const coText =
                          coIndex !== -1
                            ? extractedOptions.courseOutcomes[coIndex].text
                            : "Unknown";
                        return (
                          <Badge
                            key={coId}
                            variant="outline"
                            className="text-xs"
                            title={coText}
                          >
                            CO{coNumber}
                          </Badge>
                        );
                      }) || (
                        <span className="text-muted-foreground">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                  {plannedData.plannedSkills.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {plannedData.plannedSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">PSO Mapping:</p>
                    <div className="flex flex-wrap gap-1">
                      {cieData.pso_mapping?.map((psoId: string) => {
                        const psoIndex = extractedOptions.psoOptions.findIndex(
                          (pso: any) => pso.id === psoId
                        );
                        const psoNumber = psoIndex !== -1 ? psoIndex + 1 : "?";
                        const psoDescription =
                          psoIndex !== -1
                            ? extractedOptions.psoOptions[psoIndex].description
                            : "Unknown";
                        return (
                          <Badge
                            key={psoId}
                            variant="outline"
                            className="text-xs"
                            title={psoDescription}
                          >
                            PSO{psoNumber}
                          </Badge>
                        );
                      }) || (
                        <span className="text-muted-foreground">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Blooms Taxonomy:</p>
                    <p className="text-muted-foreground">
                      {cieData.blooms_taxonomy
                        ? cieData.blooms_taxonomy.join(", ")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actual Details Form */}
            <div className="space-y-6 mt-6">
              <h3 className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">
                Actual Implementation Details
              </h3>

              <FormField
                control={form.control}
                name="actual_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Actual CIE Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              parseAndFormatDate(field.value)
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date ? date.toISOString() : "")
                          }
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="actual_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Duration (minutes) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter duration"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actual_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Marks *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter marks"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="actual_pedagogy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Pedagogy *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select evaluation pedagogy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                          Traditional Pedagogy
                        </div>
                        {evaluationPedagogyOptions.traditional.map(
                          (pedagogy) => (
                            <SelectItem
                              key={pedagogy}
                              value={pedagogy}
                              className="pl-4"
                            >
                              {pedagogy}
                            </SelectItem>
                          )
                        )}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 mt-2">
                          Alternative Pedagogy
                        </div>
                        {evaluationPedagogyOptions.alternative.map(
                          (pedagogy) => (
                            <SelectItem
                              key={pedagogy}
                              value={pedagogy}
                              className="pl-4"
                            >
                              {pedagogy}
                            </SelectItem>
                          )
                        )}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 mt-2">
                          Other
                        </div>
                        {evaluationPedagogyOptions.other.map((pedagogy) => (
                          <SelectItem
                            key={pedagogy}
                            value={pedagogy}
                            className="pl-4"
                          >
                            {pedagogy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("actual_pedagogy") === "Other" && (
                <FormField
                  control={form.control}
                  name="custom_pedagogy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify the pedagogy *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter custom pedagogy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="actual_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Units Covered *</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={extractedOptions.units}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select units covered"
                        getLabel={(unit) =>
                          `Unit ${
                            extractedOptions.units.findIndex(
                              (u) => u.id === unit.id
                            ) + 1
                          }: ${unit.unit_name}`
                        }
                        getValue={(unit) => unit.id}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Added Skills Field */}
              <FormField
                control={form.control}
                name="actual_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Skills Covered</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={extractedOptions.skillsOptions}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select skills covered"
                        getLabel={(skill) => skill.name}
                        getValue={(skill) => skill.id}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="co"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CO Mapping *</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={extractedOptions.courseOutcomes}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select course outcomes"
                          getLabel={(co) =>
                            `CO${
                              extractedOptions.courseOutcomes.findIndex(
                                (c) => c.id === co.id
                              ) + 1
                            }`
                          }
                          getValue={(co) => co.id}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PSO Mapping *</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={extractedOptions.psoOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select PSO mapping"
                          getLabel={(pso) =>
                            `PSO${
                              extractedOptions.psoOptions.findIndex(
                                (p) => p.id === pso.id
                              ) + 1
                            }`
                          }
                          getValue={(pso) => pso.id}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="actual_blooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Blooms Taxonomy *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Remember, Understand, Apply"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason_for_change"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change (if any)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain any deviations from planned implementation"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">
              Additional Information & Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="quality_review_completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Moderation Process Completed</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("quality_review_completed") && (
                  <div className="space-y-4 ml-6">
                    <FormField
                      control={form.control}
                      name="moderation_start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Moderation Process Start Date</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            When teacher submits paper to course owner
                          </p>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    parseAndFormatDate(field.value)
                                  ) : (
                                    <span>Select start date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.onChange(date ? date.toISOString() : "")
                                }
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="moderation_end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Moderation Process End Date</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            When HoD signs the moderation report
                          </p>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    parseAndFormatDate(field.value)
                                  ) : (
                                    <span>Select end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.onChange(date ? date.toISOString() : "")
                                }
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="marks_display_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Marks Display Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                parseAndFormatDate(field.value)
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date ? date.toISOString() : "")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cie_paper_file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>CIE Paper (PDF)</FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <FormControl>
                            <Input
                              {...fieldProps}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                              }}
                              className="cursor-pointer"
                            />
                          </FormControl>
                        </div>
                        {existingActual?.cie_paper_document && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const { data } = await supabase.storage
                                .from("actual-cies")
                                .getPublicUrl(
                                  existingActual.cie_paper_document
                                );
                              window.open(data.publicUrl, "_blank");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marks_display_document"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Marks Sheet Submission (PDF)</FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <FormControl>
                            <Input
                              {...fieldProps}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                              }}
                              className="cursor-pointer"
                            />
                          </FormControl>
                        </div>
                        {existingActual?.marks_display_document && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const { data } = await supabase.storage
                                .from("actual-cies")
                                .getPublicUrl(
                                  existingActual.marks_display_document
                                );
                              window.open(data.publicUrl, "_blank");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaluation_analysis_file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Evaluation Analysis (PDF)</FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <FormControl>
                            <Input
                              {...fieldProps}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                              }}
                              className="cursor-pointer"
                            />
                          </FormControl>
                        </div>
                        {existingActual?.evalution_analysis_document && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const { data } = await supabase.storage
                                .from("actual-cies")
                                .getPublicUrl(
                                  existingActual.evalution_analysis_document
                                );
                              window.open(data.publicUrl, "_blank");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isDraftSaving || isSubmitting}
              className="min-w-[120px] bg-transparent"
            >
              {isDraftSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isDraftSaving ||
                uploadProgress.some((p) => p.status === "uploading")
              }
              className="min-w-[120px]"
            >
              {isSubmitting ? "Submitting..." : "Submit CIE Data"}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  if (ciesFromForm.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No CIEs Found</h3>
          <p className="text-muted-foreground text-center">
            No CIE data found in the form. Please ensure CIEs are properly
            configured in the lesson plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="grid w-full grid-cols-auto gap-2"
          style={{ gridTemplateColumns: `repeat(${ciesFromForm.length}, 1fr)` }}
        >
          {ciesFromForm.map((cie: any) => {
            const isActive = isCieActive(cie.date);
            const existingActual = getExistingActual(cie.id);
            const isSubmitted = existingActual?.is_submitted;
            const isDraft = existingActual && !isSubmitted;

            return (
              <TabsTrigger
                key={cie.id}
                value={`cie-${cie.id}`}
                disabled={!isActive}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  <span>CIE {cie.id.replace("cie", "")}</span>
                  {isSubmitted && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-200 border border-green-600"
                    >
                      Submitted
                    </Badge>
                  )}
                  {isDraft && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-200 border border-yellow-600"
                    >
                      Draft
                    </Badge>
                  )}
                  {!isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Not Taken
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ciesFromForm.map((cie: any) => (
          <TabsContent key={cie.id} value={`cie-${cie.id}`} className="mt-6">
            <CieTabContent cieData={cie} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
