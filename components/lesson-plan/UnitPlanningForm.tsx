"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, InfoIcon, X, Users } from "lucide-react"
import { toast } from "sonner"
import {
  unitPlanningSchema,
  type UnitPlanningFormValues,
  teachingPedagogyOptions,
  skillMappingOptions,
} from "@/utils/schema"
import { saveUnitPlanningForm } from "@/app/dashboard/actions/saveUnitPlanningForm"
import { checkFacultySharing } from "@/app/dashboard/actions/checkFacultySharing"
import { useDashboardContext } from "@/context/DashboardContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface UnitPlanningFormProps {
  lessonPlan: any
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>
}

export default function UnitPlanningForm({ lessonPlan, setLessonPlan }: UnitPlanningFormProps) {
  const { userData } = useDashboardContext()
  const [isSaving, setIsSaving] = useState(false)
  const [activeUnit, setActiveUnit] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [allFaculty, setAllFaculty] = useState<any[]>([])
  const [primaryFaculty, setPrimaryFaculty] = useState<any>(null)
  const [secondaryFaculty, setSecondaryFaculty] = useState<any[]>([])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UnitPlanningFormValues>({
    resolver: zodResolver(unitPlanningSchema),
    defaultValues: {
      faculty_id: userData?.id || "",
      subject_id: lessonPlan?.subject?.id || "",
      units: lessonPlan?.units || [
        {
          id: crypto.randomUUID(),
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
  })

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: "units",
  })

  // Check for faculty sharing when component mounts
  useEffect(() => {
    const loadFacultySharing = async () => {
      if (!lessonPlan?.subject?.id) return

      try {
        const result = await checkFacultySharing(lessonPlan.subject.id)

        if (result.success) {
          setIsSharing(result.isSharing)
          setAllFaculty(result.allFaculty)
          setPrimaryFaculty(result.primaryFaculty)
          setSecondaryFaculty(result.secondaryFaculty)

          // If sharing is detected, update form state
          if (result.isSharing) {
            setValue("is_sharing", true)
            setValue("sharing_faculty", result.allFaculty)
          }
        }
      } catch (error) {
        console.error("Error loading faculty sharing:", error)
      }
    }

    loadFacultySharing()
  }, [lessonPlan?.subject?.id, setValue])

  const addUnit = () => {
    appendUnit({
      id: crypto.randomUUID(),
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
    })
    setActiveUnit(unitFields.length)
  }

  const removeUnitHandler = (index: number) => {
    if (unitFields.length === 1) {
      toast.error("You must have at least one unit")
      return
    }
    removeUnit(index)
    if (activeUnit >= index && activeUnit > 0) {
      setActiveUnit(activeUnit - 1)
    }
  }

  const handlePedagogyChange = (unitIndex: number, pedagogy: string, checked: boolean) => {
    const currentPedagogies = getValues(`units.${unitIndex}.teaching_pedagogy`) || []
    if (checked) {
      setValue(`units.${unitIndex}.teaching_pedagogy`, [...currentPedagogies, pedagogy])
    } else {
      setValue(
        `units.${unitIndex}.teaching_pedagogy`,
        currentPedagogies.filter((p) => p !== pedagogy),
      )
    }
  }

  const handleCOMapping = (unitIndex: number, co: string, checked: boolean) => {
    const currentCOs = getValues(`units.${unitIndex}.co_mapping`) || []
    if (checked) {
      setValue(`units.${unitIndex}.co_mapping`, [...currentCOs, co])
    } else {
      setValue(
        `units.${unitIndex}.co_mapping`,
        currentCOs.filter((c) => c !== co),
      )
    }
  }

  const handleSkillMapping = (unitIndex: number, skill: string, checked: boolean) => {
    const currentSkills = getValues(`units.${unitIndex}.skill_mapping`) || []
    if (checked) {
      setValue(`units.${unitIndex}.skill_mapping`, [...currentSkills, skill])
    } else {
      setValue(
        `units.${unitIndex}.skill_mapping`,
        currentSkills.filter((s) => s !== skill),
      )
    }
  }

  const handleFacultyAssignment = (unitIndex: number, facultyId: string) => {
    setValue(`units.${unitIndex}.assigned_faculty_id`, facultyId)
  }

  const onSubmit = async (data: UnitPlanningFormValues) => {
    setIsSaving(true)
    try {
      // Add sharing information to the form data
      const formDataWithSharing = {
        ...data,
        is_sharing: isSharing,
        sharing_faculty: allFaculty,
      }

      const result = await saveUnitPlanningForm({
        faculty_id: userData?.id || "",
        subject_id: lessonPlan?.subject?.id || "",
        formData: formDataWithSharing,
      })

      if (result.success) {
        toast.success("Unit planning saved successfully!")
        setLessonPlan((prev: any) => ({
          ...prev,
          units: data.units,
          unit_remarks: data.remarks,
          is_sharing: isSharing,
          sharing_faculty: allFaculty,
        }))
      } else {
        // Show validation dialog
        if (result.error?.includes("Dear Professor")) {
          showValidationDialog(result.error)
        } else {
          toast.error(result.error || "Failed to save unit planning")
        }
      }
    } catch (error) {
      console.error("Error saving unit planning:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const showValidationDialog = (message: string) => {
    // Create a custom dialog for validation messages
    const dialog = document.createElement("div")
    dialog.className = "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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
  `
    document.body.appendChild(dialog)

    // Add click outside to close
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.remove()
      }
    })
  }

  // Generate CO options based on course outcomes
  const courseOutcomes = lessonPlan?.courseOutcomes || []
  const coOptions = courseOutcomes.map((_: any, index: number) => `CO${index + 1}`)

  // Get faculty name by ID
  const getFacultyName = (facultyId: string) => {
    const faculty = allFaculty.find((f) => f.id === facultyId)
    return faculty ? faculty.name : "Unknown Faculty"
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Unit Planning Guidelines</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowInstructions(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Guidelines for Unit Planning</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Teaching Pedagogy Requirements:</h3>
                  <p>
                    At least two alternative pedagogies (items 3-15) must be selected across different units to ensure
                    diverse teaching methods.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">CO Mapping:</h3>
                  <p>
                    All Course Outcomes (COs) entered in General Details must be covered across all units to ensure
                    complete curriculum coverage.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Lecture Count:</h3>
                  <p>
                    Total number of lectures across all units must equal Credits × 15 to maintain academic standards.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Skill Mapping:</h3>
                  <p>
                    Skills should be mentioned in measurable terms (e.g., "Ability to build and deploy a basic web
                    application using Flask framework" instead of just "web development skills").
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowInstructions(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Sharing Enabled
              </Badge>
              <div className="text-sm text-gray-600">
                {allFaculty.length} Faculty: {allFaculty.map((f) => f.name).join(", ")}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSaving} className="bg-[#1A5CA1] hover:bg-[#154A80]">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Unit Details"}
          </Button>
        </div>
      </div>

      {/* Unit Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2 flex-wrap">
          {unitFields.map((unit, index) => (
            <Button
              key={unit.id}
              type="button"
              variant={activeUnit === index ? "default" : "outline"}
              className={activeUnit === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""}
              onClick={() => setActiveUnit(index)}
            >
              Unit {index + 1}
              {isSharing && watch(`units.${index}.assigned_faculty_id`) && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {getFacultyName(watch(`units.${index}.assigned_faculty_id`))}
                </Badge>
              )}
            </Button>
          ))}
          <Button type="button" variant="outline" onClick={addUnit}>
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

      {/* Unit Form */}
      {unitFields[activeUnit] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Unit {activeUnit + 1}</span>

              {/* Faculty Assignment Dropdown - Only visible when sharing is enabled */}
              {isSharing && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-gray-600">Assigned Faculty:</span>
                  <Select
                    value={watch(`units.${activeUnit}.assigned_faculty_id`) || userData?.id}
                    onValueChange={(value) => handleFacultyAssignment(activeUnit, value)}
                  >
                    <SelectTrigger className="w-[200px] h-8 text-sm">
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
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Unit Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor={`unit-name-${activeUnit}`}>
                  Unit Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`unit-name-${activeUnit}`}
                  {...register(`units.${activeUnit}.unit_name`)}
                  placeholder="Enter unit name"
                />
                {errors.units?.[activeUnit]?.unit_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.unit_name?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`no-of-lectures-${activeUnit}`}>
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
                  <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.no_of_lectures?.message}</p>
                )}
              </div>
            </div>

            {/* Unit Topics */}
            <div>
              <Label htmlFor={`unit-topics-${activeUnit}`}>
                Unit Topics <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`unit-topics-${activeUnit}`}
                {...register(`units.${activeUnit}.unit_topics`)}
                placeholder="Enter unit topics"
                rows={4}
              />
              {errors.units?.[activeUnit]?.unit_topics && (
                <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.unit_topics?.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor={`start-date-${activeUnit}`}>
                  Probable Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`start-date-${activeUnit}`}
                  type="date"
                  {...register(`units.${activeUnit}.probable_start_date`)}
                />
                {errors.units?.[activeUnit]?.probable_start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.probable_start_date?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`end-date-${activeUnit}`}>
                  Probable End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`end-date-${activeUnit}`}
                  type="date"
                  {...register(`units.${activeUnit}.probable_end_date`)}
                />
                {errors.units?.[activeUnit]?.probable_end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.probable_end_date?.message}</p>
                )}
              </div>
            </div>

            {/* Self-Study Topics and Materials */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor={`self-study-topics-${activeUnit}`}>Self-Study Topics (Optional)</Label>
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
                  <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.unit_materials?.message}</p>
                )}
              </div>
            </div>

            {/* Teaching Pedagogy */}
            <div>
              <Label>
                Teaching Pedagogy <span className="text-red-500">*</span> (Select at least 2)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {teachingPedagogyOptions.map((pedagogy) => (
                  <div key={pedagogy} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pedagogy-${activeUnit}-${pedagogy}`}
                      checked={watch(`units.${activeUnit}.teaching_pedagogy`)?.includes(pedagogy) || false}
                      onCheckedChange={(checked) => handlePedagogyChange(activeUnit, pedagogy, checked as boolean)}
                    />
                    <Label htmlFor={`pedagogy-${activeUnit}-${pedagogy}`} className="text-sm">
                      {pedagogy}
                    </Label>
                  </div>
                ))}
              </div>
              {watch(`units.${activeUnit}.teaching_pedagogy`)?.includes("Other") && (
                <div className="mt-3">
                  <Label htmlFor={`other-pedagogy-${activeUnit}`}>Other Pedagogy</Label>
                  <Input
                    id={`other-pedagogy-${activeUnit}`}
                    {...register(`units.${activeUnit}.other_pedagogy`)}
                    placeholder="Specify other pedagogy"
                  />
                </div>
              )}
              {errors.units?.[activeUnit]?.teaching_pedagogy && (
                <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.teaching_pedagogy?.message}</p>
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
                      checked={watch(`units.${activeUnit}.co_mapping`)?.includes(co) || false}
                      onCheckedChange={(checked) => handleCOMapping(activeUnit, co, checked as boolean)}
                    />
                    <Label htmlFor={`co-${activeUnit}-${co}`} className="text-sm">
                      {co}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.units?.[activeUnit]?.co_mapping && (
                <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.co_mapping?.message}</p>
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
                      checked={watch(`units.${activeUnit}.skill_mapping`)?.includes(skill) || false}
                      onCheckedChange={(checked) => handleSkillMapping(activeUnit, skill, checked as boolean)}
                    />
                    <Label htmlFor={`skill-${activeUnit}-${skill}`} className="text-sm">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.units?.[activeUnit]?.skill_mapping && (
                <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.skill_mapping?.message}</p>
              )}
            </div>

            {/* Skill Objectives */}
            <div>
              <Label htmlFor={`skill-objectives-${activeUnit}`}>
                Objective for Selected Skills <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`skill-objectives-${activeUnit}`}
                {...register(`units.${activeUnit}.skill_objectives`)}
                placeholder="Skills should be mentioned in measurable terms (e.g., 'Ability to build and deploy a basic web application using Flask framework.' instead of just 'web development skills')."
                rows={3}
              />
              {errors.units?.[activeUnit]?.skill_objectives && (
                <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.skill_objectives?.message}</p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor={`interlink-topics-${activeUnit}`}>
                  Interlink of this unit topic(s) with other subject's topic (Optional)
                </Label>
                <Textarea
                  id={`interlink-topics-${activeUnit}`}
                  {...register(`units.${activeUnit}.interlink_topics`)}
                  placeholder="Describe connections with other subjects"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor={`topics-beyond-unit-${activeUnit}`}>
                  Topic beyond Unit Topics <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`topics-beyond-unit-${activeUnit}`}
                  {...register(`units.${activeUnit}.topics_beyond_unit`)}
                  placeholder="Enter topics beyond the unit syllabus"
                  rows={3}
                />
                {errors.units?.[activeUnit]?.topics_beyond_unit && (
                  <p className="text-red-500 text-sm mt-1">{errors.units[activeUnit]?.topics_beyond_unit?.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remarks */}
      <div>
        <Label htmlFor="remarks">Remarks (Optional)</Label>
        <Textarea id="remarks" {...register("remarks")} placeholder="Any additional remarks for all units" rows={3} />
      </div>
    </form>
  )
}
