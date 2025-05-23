"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface UnitPlanningFormProps {
  lessonPlan: any
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>
}

export default function UnitPlanningForm({ lessonPlan, setLessonPlan }: UnitPlanningFormProps) {
  const [activeUnit, setActiveUnit] = useState(0)

  const handleUnitChange = (index: number, field: string, value: string) => {
    const updatedUnits = [...lessonPlan.units]
    updatedUnits[index] = {
      ...updatedUnits[index],
      [field]: value,
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      units: updatedUnits,
    }))
  }

  const addUnit = () => {
    const newUnitNumber = lessonPlan.units.length + 1
    const newUnit = {
      id: `unit${newUnitNumber}`,
      name: "",
      lectures: 0,
      topics: "",
      self_study_topics: "",
      self_study_materials: "",
      materials: "",
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      units: [...prev.units, newUnit],
    }))

    setActiveUnit(lessonPlan.units.length)
  }

  const removeUnit = (index: number) => {
    if (lessonPlan.units.length <= 1) {
      return // Don't remove the last unit
    }

    const updatedUnits = lessonPlan.units.filter((_: any, i: number) => i !== index)
    setLessonPlan((prev: any) => ({
      ...prev,
      units: updatedUnits,
    }))

    if (activeUnit >= index && activeUnit > 0) {
      setActiveUnit(activeUnit - 1)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {lessonPlan.units.map((unit: any, index: number) => (
            <Button
              key={unit.id}
              variant={activeUnit === index ? "default" : "outline"}
              className={activeUnit === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""}
              onClick={() => setActiveUnit(index)}
            >
              Unit {index + 1}
            </Button>
          ))}
          <Button variant="outline" onClick={addUnit}>
            <Plus className="h-4 w-4 mr-1" />
            Add Unit
          </Button>
        </div>
        {lessonPlan.units.length > 1 && (
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeUnit(activeUnit)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove Unit
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Unit {activeUnit + 1}</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="unit-name">Unit Name</Label>
            <Input
              id="unit-name"
              value={lessonPlan.units[activeUnit]?.name || ""}
              onChange={(e) => handleUnitChange(activeUnit, "name", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="no-of-lecture">No. of Lecture</Label>
            <Input
              id="no-of-lecture"
              type="number"
              value={lessonPlan.units[activeUnit]?.lectures || ""}
              onChange={(e) => handleUnitChange(activeUnit, "lectures", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="unit-topics">Unit Topics</Label>
          <Textarea
            id="unit-topics"
            value={lessonPlan.units[activeUnit]?.topics || ""}
            onChange={(e) => handleUnitChange(activeUnit, "topics", e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="self-study-topics">Self-Study Topics</Label>
          <Textarea
            id="self-study-topics"
            value={lessonPlan.units[activeUnit]?.self_study_topics || ""}
            onChange={(e) => handleUnitChange(activeUnit, "self_study_topics", e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="self-study-materials">Self-Study Materials</Label>
          <Textarea
            id="self-study-materials"
            value={lessonPlan.units[activeUnit]?.self_study_materials || ""}
            onChange={(e) => handleUnitChange(activeUnit, "self_study_materials", e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="unit-materials">Unit Materials</Label>
          <Textarea
            id="unit-materials"
            value={lessonPlan.units[activeUnit]?.materials || ""}
            onChange={(e) => handleUnitChange(activeUnit, "materials", e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
