"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface PracticalPlanningFormProps {
  lessonPlan: any
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>
}

export default function PracticalPlanningForm({ lessonPlan, setLessonPlan }: PracticalPlanningFormProps) {
  const [activePractical, setActivePractical] = useState(0)

  const handlePracticalChange = (index: number, field: string, value: string) => {
    const updatedPracticals = [...lessonPlan.practicals]
    updatedPracticals[index] = {
      ...updatedPracticals[index],
      [field]: value,
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      practicals: updatedPracticals,
    }))
  }

  const addPractical = () => {
    const newPracticalNumber = lessonPlan.practicals.length + 1
    const newPractical = {
      id: `practical${newPracticalNumber}`,
      aim: "",
      lab_hours: 2,
      probable_week: "",
      associated_unit: "",
      software_hardware_requirements: "",
      tasks: "",
      evaluation_method: "",
      pedagogy: "",
      blooms_taxonomy: "",
      reference_material: "",
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      practicals: [...prev.practicals, newPractical],
    }))

    setActivePractical(lessonPlan.practicals.length)
  }

  const removePractical = (index: number) => {
    if (lessonPlan.practicals.length <= 1) {
      return // Don't remove the last practical
    }

    const updatedPracticals = lessonPlan.practicals.filter((_: any, i: number) => i !== index)
    setLessonPlan((prev: any) => ({
      ...prev,
      practicals: updatedPracticals,
    }))

    if (activePractical >= index && activePractical > 0) {
      setActivePractical(activePractical - 1)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {lessonPlan.practicals.map((practical: any, index: number) => (
            <Button
              key={practical.id}
              variant={activePractical === index ? "default" : "outline"}
              className={activePractical === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""}
              onClick={() => setActivePractical(index)}
            >
              Practical {index + 1}
            </Button>
          ))}
          <Button variant="outline" onClick={addPractical}>
            <Plus className="h-4 w-4 mr-1" />
            Add Practical
          </Button>
        </div>
        {lessonPlan.practicals.length > 1 && (
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
        <h3 className="text-xl font-semibold">Practical {activePractical + 1}</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="practical-aim">Practical Aim</Label>
            <Input
              id="practical-aim"
              value={lessonPlan.practicals[activePractical]?.aim || ""}
              onChange={(e) => handlePracticalChange(activePractical, "aim", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lab-hours">Lab Hours</Label>
            <Input
              id="lab-hours"
              type="number"
              value={lessonPlan.practicals[activePractical]?.lab_hours || ""}
              onChange={(e) => handlePracticalChange(activePractical, "lab_hours", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="probable-week">Probable Week</Label>
            <Select
              value={lessonPlan.practicals[activePractical]?.probable_week || ""}
              onValueChange={(value) => handlePracticalChange(activePractical, "probable_week", value)}
            >
              <SelectTrigger id="probable-week" className="mt-1">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 15 }, (_, i) => (
                  <SelectItem key={i} value={`Week ${i + 1}`}>
                    Week {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="associated-unit">Associated Unit</Label>
            <Select
              value={lessonPlan.practicals[activePractical]?.associated_unit || ""}
              onValueChange={(value) => handlePracticalChange(activePractical, "associated_unit", value)}
            >
              <SelectTrigger id="associated-unit" className="mt-1">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                {lessonPlan.units.map((unit: any, index: number) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    Unit {index + 1}: {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="software-hardware-requirements">Software/Hardware Requirements</Label>
          <Textarea
            id="software-hardware-requirements"
            value={lessonPlan.practicals[activePractical]?.software_hardware_requirements || ""}
            onChange={(e) => handlePracticalChange(activePractical, "software_hardware_requirements", e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="practical-tasks">Practical Tasks/Problem Statement</Label>
          <Textarea
            id="practical-tasks"
            value={lessonPlan.practicals[activePractical]?.tasks || ""}
            onChange={(e) => handlePracticalChange(activePractical, "tasks", e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="evaluation-method">Evaluation Method</Label>
            <Select
              value={lessonPlan.practicals[activePractical]?.evaluation_method || ""}
              onValueChange={(value) => handlePracticalChange(activePractical, "evaluation_method", value)}
            >
              <SelectTrigger id="evaluation-method" className="mt-1">
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Code review">Code review</SelectItem>
                <SelectItem value="Demonstration">Demonstration</SelectItem>
                <SelectItem value="Report submission">Report submission</SelectItem>
                <SelectItem value="Viva">Viva</SelectItem>
                <SelectItem value="Multiple methods">Multiple methods</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="practical-pedagogy">Practical Pedagogy</Label>
            <Select
              value={lessonPlan.practicals[activePractical]?.pedagogy || ""}
              onValueChange={(value) => handlePracticalChange(activePractical, "pedagogy", value)}
            >
              <SelectTrigger id="practical-pedagogy" className="mt-1">
                <SelectValue placeholder="Select Pedagogy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Guided practice">Guided practice</SelectItem>
                <SelectItem value="Problem-based learning">Problem-based learning</SelectItem>
                <SelectItem value="Inquiry-based learning">Inquiry-based learning</SelectItem>
                <SelectItem value="Collaborative learning">Collaborative learning</SelectItem>
                <SelectItem value="Project-based learning">Project-based learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="blooms-taxonomy">Bloom's Taxonomy</Label>
            <Select
              value={lessonPlan.practicals[activePractical]?.blooms_taxonomy || ""}
              onValueChange={(value) => handlePracticalChange(activePractical, "blooms_taxonomy", value)}
            >
              <SelectTrigger id="blooms-taxonomy" className="mt-1">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remember">Remember</SelectItem>
                <SelectItem value="Understand">Understand</SelectItem>
                <SelectItem value="Apply">Apply</SelectItem>
                <SelectItem value="Analyze">Analyze</SelectItem>
                <SelectItem value="Evaluate">Evaluate</SelectItem>
                <SelectItem value="Create">Create</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="reference-material">Reference Material for Practical</Label>
          <Textarea
            id="reference-material"
            value={lessonPlan.practicals[activePractical]?.reference_material || ""}
            onChange={(e) => handlePracticalChange(activePractical, "reference_material", e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
