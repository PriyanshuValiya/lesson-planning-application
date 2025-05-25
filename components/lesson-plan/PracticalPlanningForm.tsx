"use client"

import type React from "react"
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, InfoIcon, X } from "lucide-react"
import { toast } from "sonner"
import {
  practicalPlanningSchema,
  type PracticalPlanningFormValues,
  practicalPedagogyOptions,
  evaluationMethodOptions,
  bloomsTaxonomyOptions,
  skillMappingOptions,
  psoOptions,
  peoOptions,
} from "@/utils/schema"
import { generateWeekOptions } from "@/utils/dateUtils"
import { savePracticalPlanningForm } from "@/app/dashboard/actions/savePracticalPlanningForm"
import { useDashboardContext } from "@/context/DashboardContext"

interface PracticalPlanningFormProps {
  lessonPlan: any
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>
}

export default function PracticalPlanningForm({ lessonPlan, setLessonPlan }: PracticalPlanningFormProps) {
  const { userData } = useDashboardContext()
  const [isSaving, setIsSaving] = useState(false)
  const [activePractical, setActivePractical] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)

  // Generate week options from term dates
  const weekOptions = generateWeekOptions(lessonPlan?.term_start_date || "", lessonPlan?.term_end_date || "")

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PracticalPlanningFormValues>({
    resolver: zodResolver(practicalPlanningSchema),
    defaultValues: {
      faculty_id: userData?.id || "",
      subject_id: lessonPlan?.subject?.id || "",
      practicals: lessonPlan?.practicals || [
        {
          id: crypto.randomUUID(),
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
          isNew: true,
        },
      ],
      remarks: lessonPlan?.practical_remarks || "",
    },
  })

  const {
    fields: practicalFields,
    append: appendPractical,
    remove: removePractical,
  } = useFieldArray({
    control,
    name: "practicals",
  })

  const addPractical = () => {
    appendPractical({
      id: crypto.randomUUID(),
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
      isNew: true,
    })
    setActivePractical(practicalFields.length)
  }

  const removePracticalHandler = (index: number) => {
    if (practicalFields.length === 1) {
      toast.error("You must have at least one practical")
      return
    }
    removePractical(index)
    if (activePractical >= index && activePractical > 0) {
      setActivePractical(activePractical - 1)
    }
  }

  const handleAssociatedUnitsChange = (practicalIndex: number, unitId: string, checked: boolean) => {
    const currentUnits = getValues(`practicals.${practicalIndex}.associated_units`) || []
    if (checked) {
      setValue(`practicals.${practicalIndex}.associated_units`, [...currentUnits, unitId])
    } else {
      setValue(
        `practicals.${practicalIndex}.associated_units`,
        currentUnits.filter((u) => u !== unitId),
      )
    }
  }

  const handleEvaluationMethodChange = (practicalIndex: number, method: string, checked: boolean) => {
    const currentMethods = getValues(`practicals.${practicalIndex}.evaluation_methods`) || []
    if (checked) {
      setValue(`practicals.${practicalIndex}.evaluation_methods`, [...currentMethods, method])
    } else {
      setValue(
        `practicals.${practicalIndex}.evaluation_methods`,
        currentMethods.filter((m) => m !== method),
      )
    }
  }

  const handleCOMapping = (practicalIndex: number, co: string, checked: boolean) => {
    const currentCOs = getValues(`practicals.${practicalIndex}.co_mapping`) || []
    if (checked) {
      setValue(`practicals.${practicalIndex}.co_mapping`, [...currentCOs, co])
    } else {
      setValue(
        `practicals.${practicalIndex}.co_mapping`,
        currentCOs.filter((c) => c !== co),
      )
    }
  }

  const handlePSOMapping = (practicalIndex: number, pso: string, checked: boolean) => {
    const currentPSOs = getValues(`practicals.${practicalIndex}.pso_mapping`) || []
    if (checked) {
      setValue(`practicals.${practicalIndex}.pso_mapping`, [...currentPSOs, pso])
    } else {
      setValue(
        `practicals.${practicalIndex}.pso_mapping`,
        currentPSOs.filter((p) => p !== pso),
      )
    }
  }

  const handlePEOMapping = (practicalIndex: number, peo: string, checked: boolean) => {
    const currentPEOs = getValues(`practicals.${practicalIndex}.peo_mapping`) || []
    if (checked) {
      setValue(`practicals.${practicalIndex}.peo_mapping`, [...currentPEOs, peo])
    } else {
      setValue(
        `practicals.${practicalIndex}.peo_mapping`,
        currentPEOs.filter((p) => p !== peo),
      )
    }
  }

  const handleBloomsTaxonomyChange = (practicalIndex: number, taxonomy: string, checked: boolean) => {
    const currentTaxonomy = getValues(`practicals.${practicalIndex}.blooms_taxonomy`) || []
    if (checked) {
      setValue(`practicals.${practicalIndex}.blooms_taxonomy`, [...currentTaxonomy, taxonomy])
    } else {
      setValue(
        `practicals.${practicalIndex}.blooms_taxonomy`,
        currentTaxonomy.filter((t) => t !== taxonomy),
      )
    }
  }

  const handleSkillMapping = (practicalIndex: number, skill: string, checked: boolean) => {
    const currentSkills = getValues(`practicals.${practicalIndex}.skill_mapping`) || []
    if (checked) {
      setValue(`practicals.${practicalIndex}.skill_mapping`, [...currentSkills, skill])
    } else {
      setValue(
        `practicals.${practicalIndex}.skill_mapping`,
        currentSkills.filter((s) => s !== skill),
      )
    }
  }

  const onSubmit = async (data: PracticalPlanningFormValues) => {
    setIsSaving(true)
    try {
      const result = await savePracticalPlanningForm({
        faculty_id: userData?.id || "",
        subject_id: lessonPlan?.subject?.id || "",
        formData: data,
      })

      if (result.success) {
        toast.success("Practical planning saved successfully!")
        setLessonPlan((prev: any) => ({
          ...prev,
          practicals: data.practicals,
          practical_remarks: data.remarks,
        }))
      } else {
        if (result.error?.includes("Dear Professor")) {
          showValidationDialog(result.error)
        } else {
          toast.error(result.error || "Failed to save practical planning")
        }
      }
    } catch (error) {
      console.error("Error saving practical planning:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const showValidationDialog = (message: string) => {
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

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.remove()
      }
    })
  }

  // Generate CO options based on course outcomes
  const courseOutcomes = lessonPlan?.courseOutcomes || []
  const coOptions = courseOutcomes.map((_: any, index: number) => `CO${index + 1}`)

  // Get units for associated units dropdown
  const units = lessonPlan?.units || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Practical Planning Guidelines</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowInstructions(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Guidelines for Practical Planning</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Practical Aim:</h3>
                  <p>
                    Provide a clear and concise description of what students will achieve in this practical session.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Associated Units:</h3>
                  <p>
                    Select one or more units that this practical session relates to. Multiple units can be selected for
                    comprehensive practicals.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Software/Hardware Requirements:</h3>
                  <p>
                    List required software/tools, e.g., Visual Studio, Code::Blocks, Python, Blockchain Simulation
                    Tools, ML Libraries, etc.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Reference Materials:</h3>
                  <p>Include dataset links, lab manual references, sample codes, documentation links, etc.</p>
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

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Practical Planning Details</h3>
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
        <Button type="submit" disabled={isSaving} className="bg-[#1A5CA1] hover:bg-[#154A80]">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Practical Details"}
        </Button>
      </div>

      {/* Practical Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2 flex-wrap">
          {practicalFields.map((practical, index) => (
            <Button
              key={practical.id}
              type="button"
              variant={activePractical === index ? "default" : "outline"}
              className={activePractical === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""}
              onClick={() => setActivePractical(index)}
            >
              Practical {index + 1}
            </Button>
          ))}
          <Button type="button" variant="outline" onClick={addPractical}>
            <Plus className="h-4 w-4 mr-1" />
            Add Practical
          </Button>
        </div>
        {practicalFields.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removePracticalHandler(activePractical)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove Practical
          </Button>
        )}
      </div>

      {/* Practical Form */}
      {practicalFields[activePractical] && (
        <Card>
          <CardHeader>
            <CardTitle>Practical {activePractical + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Practical Aim */}
            <div>
              <Label htmlFor={`practical-aim-${activePractical}`}>
                Practical Aim <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`practical-aim-${activePractical}`}
                {...register(`practicals.${activePractical}.practical_aim`)}
                placeholder="Enter the aim of this practical session"
                rows={3}
              />
              {errors.practicals?.[activePractical]?.practical_aim && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.practical_aim?.message}
                </p>
              )}
            </div>

            {/* Associated Units */}
            <div>
              <Label>
                Associated Unit(s) <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {units.map((unit: any, index: number) => (
                  <div key={unit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unit-${activePractical}-${unit.id}`}
                      checked={watch(`practicals.${activePractical}.associated_units`)?.includes(unit.id) || false}
                      onCheckedChange={(checked) =>
                        handleAssociatedUnitsChange(activePractical, unit.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`unit-${activePractical}-${unit.id}`} className="text-sm">
                      Unit {index + 1} - {unit.unit_name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.practicals?.[activePractical]?.associated_units && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.associated_units?.message}
                </p>
              )}
            </div>

            {/* Probable Week and Lab Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor={`probable-week-${activePractical}`}>
                  Probable Week <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch(`practicals.${activePractical}.probable_week`) || ""}
                  onValueChange={(value) => setValue(`practicals.${activePractical}.probable_week`, value)}
                >
                  <SelectTrigger id={`probable-week-${activePractical}`}>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekOptions.map((week) => (
                      <SelectItem key={week.value} value={week.value}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.practicals?.[activePractical]?.probable_week && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.practicals[activePractical]?.probable_week?.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={`lab-hours-${activePractical}`}>
                  Lab Hours <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`lab-hours-${activePractical}`}
                  type="number"
                  min="1"
                  {...register(`practicals.${activePractical}.lab_hours`)}
                  placeholder="Enter lab hours"
                />
                {errors.practicals?.[activePractical]?.lab_hours && (
                  <p className="text-red-500 text-sm mt-1">{errors.practicals[activePractical]?.lab_hours?.message}</p>
                )}
              </div>
            </div>

            {/* Software/Hardware Requirements */}
            <div>
              <Label htmlFor={`software-hardware-${activePractical}`}>
                Software/Hardware Requirements <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`software-hardware-${activePractical}`}
                {...register(`practicals.${activePractical}.software_hardware_requirements`)}
                placeholder="List required software/tools, e.g., Visual Studio, Code::Blocks, Python, Blockchain Simulation Tools, ML Libraries, etc."
                rows={3}
              />
              {errors.practicals?.[activePractical]?.software_hardware_requirements && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.software_hardware_requirements?.message}
                </p>
              )}
            </div>

            {/* Practical Tasks/Problem Statement */}
            <div>
              <Label htmlFor={`practical-tasks-${activePractical}`}>
                Practical Tasks/Problem Statement <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`practical-tasks-${activePractical}`}
                {...register(`practicals.${activePractical}.practical_tasks`)}
                placeholder="Provide a clear and concise problem/task description that students will solve or implement during the lab."
                rows={4}
              />
              {errors.practicals?.[activePractical]?.practical_tasks && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.practical_tasks?.message}
                </p>
              )}
            </div>

            {/* Evaluation Methods */}
            <div>
              <Label>
                Evaluation Method <span className="text-red-500">*</span> (Select one or more)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {evaluationMethodOptions.map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={`evaluation-${activePractical}-${method}`}
                      checked={watch(`practicals.${activePractical}.evaluation_methods`)?.includes(method) || false}
                      onCheckedChange={(checked) =>
                        handleEvaluationMethodChange(activePractical, method, checked as boolean)
                      }
                    />
                    <Label htmlFor={`evaluation-${activePractical}-${method}`} className="text-sm">
                      {method}
                    </Label>
                  </div>
                ))}
              </div>
              {watch(`practicals.${activePractical}.evaluation_methods`)?.includes("Other") && (
                <div className="mt-3">
                  <Label htmlFor={`other-evaluation-${activePractical}`}>Other Evaluation Method</Label>
                  <Input
                    id={`other-evaluation-${activePractical}`}
                    {...register(`practicals.${activePractical}.other_evaluation_method`)}
                    placeholder="Specify other evaluation method"
                  />
                </div>
              )}
              {errors.practicals?.[activePractical]?.evaluation_methods && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.evaluation_methods?.message}
                </p>
              )}
            </div>

            {/* Practical Pedagogy */}
            <div>
              <Label htmlFor={`practical-pedagogy-${activePractical}`}>
                Practical Pedagogy <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch(`practicals.${activePractical}.practical_pedagogy`) || ""}
                onValueChange={(value) => setValue(`practicals.${activePractical}.practical_pedagogy`, value)}
              >
                <SelectTrigger id={`practical-pedagogy-${activePractical}`}>
                  <SelectValue placeholder="Select pedagogy" />
                </SelectTrigger>
                <SelectContent>
                  {practicalPedagogyOptions.map((pedagogy) => (
                    <SelectItem key={pedagogy} value={pedagogy}>
                      {pedagogy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {watch(`practicals.${activePractical}.practical_pedagogy`) === "Other" && (
                <div className="mt-3">
                  <Label htmlFor={`other-pedagogy-${activePractical}`}>Other Pedagogy</Label>
                  <Input
                    id={`other-pedagogy-${activePractical}`}
                    {...register(`practicals.${activePractical}.other_pedagogy`)}
                    placeholder="Specify other pedagogy"
                  />
                </div>
              )}
              {errors.practicals?.[activePractical]?.practical_pedagogy && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.practical_pedagogy?.message}
                </p>
              )}
            </div>

            {/* Reference Material */}
            <div>
              <Label htmlFor={`reference-material-${activePractical}`}>
                Reference Material for Practical <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`reference-material-${activePractical}`}
                {...register(`practicals.${activePractical}.reference_material`)}
                placeholder="Dataset, Lab manual links, sample codes, documentation links, etc."
                rows={3}
              />
              {errors.practicals?.[activePractical]?.reference_material && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.reference_material?.message}
                </p>
              )}
            </div>

            {/* CO/PSO/PEO Mapping */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>
                  CO Mapping <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {coOptions.map((co) => (
                    <div key={co} className="flex items-center space-x-2">
                      <Checkbox
                        id={`co-${activePractical}-${co}`}
                        checked={watch(`practicals.${activePractical}.co_mapping`)?.includes(co) || false}
                        onCheckedChange={(checked) => handleCOMapping(activePractical, co, checked as boolean)}
                      />
                      <Label htmlFor={`co-${activePractical}-${co}`} className="text-sm">
                        {co}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.practicals?.[activePractical]?.co_mapping && (
                  <p className="text-red-500 text-sm mt-1">{errors.practicals[activePractical]?.co_mapping?.message}</p>
                )}
              </div>

              <div>
                <Label>PSO Mapping (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {psoOptions.map((pso) => (
                    <div key={pso} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pso-${activePractical}-${pso}`}
                        checked={watch(`practicals.${activePractical}.pso_mapping`)?.includes(pso) || false}
                        onCheckedChange={(checked) => handlePSOMapping(activePractical, pso, checked as boolean)}
                      />
                      <Label htmlFor={`pso-${activePractical}-${pso}`} className="text-sm">
                        {pso}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>PEO Mapping (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {peoOptions.map((peo) => (
                    <div key={peo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`peo-${activePractical}-${peo}`}
                        checked={watch(`practicals.${activePractical}.peo_mapping`)?.includes(peo) || false}
                        onCheckedChange={(checked) => handlePEOMapping(activePractical, peo, checked as boolean)}
                      />
                      <Label htmlFor={`peo-${activePractical}-${peo}`} className="text-sm">
                        {peo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloom's Taxonomy */}
            <div>
              <Label>
                Bloom's Taxonomy <span className="text-red-500">*</span> (Multiple selection)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {bloomsTaxonomyOptions.map((taxonomy) => (
                  <div key={taxonomy} className="flex items-center space-x-2">
                    <Checkbox
                      id={`blooms-${activePractical}-${taxonomy}`}
                      checked={watch(`practicals.${activePractical}.blooms_taxonomy`)?.includes(taxonomy) || false}
                      onCheckedChange={(checked) =>
                        handleBloomsTaxonomyChange(activePractical, taxonomy, checked as boolean)
                      }
                    />
                    <Label htmlFor={`blooms-${activePractical}-${taxonomy}`} className="text-sm">
                      {taxonomy}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.practicals?.[activePractical]?.blooms_taxonomy && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.blooms_taxonomy?.message}
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
                      id={`skill-${activePractical}-${skill}`}
                      checked={watch(`practicals.${activePractical}.skill_mapping`)?.includes(skill) || false}
                      onCheckedChange={(checked) => handleSkillMapping(activePractical, skill, checked as boolean)}
                    />
                    <Label htmlFor={`skill-${activePractical}-${skill}`} className="text-sm">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.practicals?.[activePractical]?.skill_mapping && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.skill_mapping?.message}
                </p>
              )}
            </div>

            {/* Skill Objectives */}
            <div>
              <Label htmlFor={`skill-objectives-${activePractical}`}>
                Objective for Selected Skills <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`skill-objectives-${activePractical}`}
                {...register(`practicals.${activePractical}.skill_objectives`)}
                placeholder="Skills should be mentioned in measurable terms (e.g., 'Ability to implement and test sorting algorithms with time complexity analysis.' instead of just 'programming skills')."
                rows={3}
              />
              {errors.practicals?.[activePractical]?.skill_objectives && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.practicals[activePractical]?.skill_objectives?.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remarks */}
      <div>
        <Label htmlFor="remarks">Remarks (Optional)</Label>
        <Textarea
          id="remarks"
          {...register("remarks")}
          placeholder="Any additional remarks for all practicals"
          rows={3}
        />
      </div>
    </form>
  )
}
