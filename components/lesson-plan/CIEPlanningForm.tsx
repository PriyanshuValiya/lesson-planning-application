"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface CIEPlanningFormProps {
  lessonPlan: any
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>
}

export default function CIEPlanningForm({ lessonPlan, setLessonPlan }: CIEPlanningFormProps) {
  const [activeCIE, setActiveCIE] = useState(0)

  const handleCIEChange = (index: number, field: string, value: string | string[]) => {
    const updatedCIEs = [...lessonPlan.cies]
    updatedCIEs[index] = {
      ...updatedCIEs[index],
      [field]: value,
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      cies: updatedCIEs,
    }))
  }

  const addCIE = () => {
    const newCIENumber = lessonPlan.cies.length + 1
    const newCIE = {
      id: `cie${newCIENumber}`,
      type: "",
      units_covered: [],
      date: "",
      marks: 50,
      duration: 45,
      blooms_taxonomy: "",
      evaluation_pedagogy: "",
      skill_mapping: "",
      co_mapping: "",
      pso_mapping: "",
      peo_mapping: "",
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      cies: [...prev.cies, newCIE],
    }))

    setActiveCIE(lessonPlan.cies.length)
  }

  const removeCIE = (index: number) => {
    if (lessonPlan.cies.length <= 1) {
      return // Don't remove the last CIE
    }

    const updatedCIEs = lessonPlan.cies.filter((_: any, i: number) => i !== index)
    setLessonPlan((prev: any) => ({
      ...prev,
      cies: updatedCIEs,
    }))

    if (activeCIE >= index && activeCIE > 0) {
      setActiveCIE(activeCIE - 1)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {lessonPlan.cies.map((cie: any, index: number) => (
            <Button
              key={cie.id}
              variant={activeCIE === index ? "default" : "outline"}
              className={activeCIE === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""}
              onClick={() => setActiveCIE(index)}
            >
              CIE {index + 1}
            </Button>
          ))}
          <Button variant="outline" onClick={addCIE}>
            <Plus className="h-4 w-4 mr-1" />
            Add CIE
          </Button>
        </div>
        {lessonPlan.cies.length > 1 && (
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeCIE(activeCIE)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove CIE
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">CIE {activeCIE + 1}</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="type-of-evaluation">Type of Evaluation</Label>
            <Select
              value={lessonPlan.cies[activeCIE]?.type || ""}
              onValueChange={(value) => handleCIEChange(activeCIE, "type", value)}
            >
              <SelectTrigger id="type-of-evaluation" className="mt-1">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Quiz">Quiz</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Mid-term">Mid-term</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Presentation">Presentation</SelectItem>
                <SelectItem value="Lab Test">Lab Test</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="units-covered">Units Covered / Practical Covered</Label>
            <Select
              value={lessonPlan.cies[activeCIE]?.units_covered?.[0] || ""}
              onValueChange={(value) => handleCIEChange(activeCIE, "units_covered", [value])}
            >
              <SelectTrigger id="units-covered" className="mt-1">
                <SelectValue placeholder="Select Unit(s) / Practical(s)" />
              </SelectTrigger>
              <SelectContent>
                {lessonPlan.units.map((unit: any, index: number) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    Unit {index + 1}: {unit.name}
                  </SelectItem>
                ))}
                {lessonPlan.practicals.map((practical: any, index: number) => (
                  <SelectItem key={practical.id} value={practical.id}>
                    Practical {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="text"
              placeholder="DD / MM / YYYY"
              value={lessonPlan.cies[activeCIE]?.date || ""}
              onChange={(e) => handleCIEChange(activeCIE, "date", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="marks">Marks</Label>
            <Input
              id="marks"
              type="number"
              value={lessonPlan.cies[activeCIE]?.marks || ""}
              onChange={(e) => handleCIEChange(activeCIE, "marks", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={lessonPlan.cies[activeCIE]?.duration || ""}
              onChange={(e) => handleCIEChange(activeCIE, "duration", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="blooms-taxonomy-cie">Bloom's Taxonomy</Label>
            <Select
              value={lessonPlan.cies[activeCIE]?.blooms_taxonomy || ""}
              onValueChange={(value) => handleCIEChange(activeCIE, "blooms_taxonomy", value)}
            >
              <SelectTrigger id="blooms-taxonomy-cie" className="mt-1">
                <SelectValue placeholder="Select Bloom's Taxonomy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remember">Remember</SelectItem>
                <SelectItem value="Understand">Understand</SelectItem>
                <SelectItem value="Apply">Apply</SelectItem>
                <SelectItem value="Analyze">Analyze</SelectItem>
                <SelectItem value="Evaluate">Evaluate</SelectItem>
                <SelectItem value="Create">Create</SelectItem>
                <SelectItem value="Remember, Understand, Apply">Remember, Understand, Apply</SelectItem>
                <SelectItem value="Apply, Analyze, Evaluate">Apply, Analyze, Evaluate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="evaluation-pedagogy">Evaluation Pedagogy</Label>
            <Select
              value={lessonPlan.cies[activeCIE]?.evaluation_pedagogy || ""}
              onValueChange={(value) => handleCIEChange(activeCIE, "evaluation_pedagogy", value)}
            >
              <SelectTrigger id="evaluation-pedagogy" className="mt-1">
                <SelectValue placeholder="Select Evaluation Pedagogy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Written test">Written test</SelectItem>
                <SelectItem value="Oral test">Oral test</SelectItem>
                <SelectItem value="Practical demonstration">Practical demonstration</SelectItem>
                <SelectItem value="Project submission">Project submission</SelectItem>
                <SelectItem value="Presentation">Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="skill-mapping">Skill Mapping</Label>
          <Select
            value={lessonPlan.cies[activeCIE]?.skill_mapping || ""}
            onValueChange={(value) => handleCIEChange(activeCIE, "skill_mapping", value)}
          >
            <SelectTrigger id="skill-mapping" className="mt-1">
              <SelectValue placeholder="Select Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Problem-solving">Problem-solving</SelectItem>
              <SelectItem value="Critical thinking">Critical thinking</SelectItem>
              <SelectItem value="Analytical skills">Analytical skills</SelectItem>
              <SelectItem value="Programming skills">Programming skills</SelectItem>
              <SelectItem value="Communication skills">Communication skills</SelectItem>
              <SelectItem value="Problem-solving, Logical thinking">Problem-solving, Logical thinking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="co-mapping">CO Mapping</Label>
          <Select
            value={lessonPlan.cies[activeCIE]?.co_mapping || ""}
            onValueChange={(value) => handleCIEChange(activeCIE, "co_mapping", value)}
          >
            <SelectTrigger id="co-mapping" className="mt-1">
              <SelectValue placeholder="Select COs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CO1">CO1</SelectItem>
              <SelectItem value="CO2">CO2</SelectItem>
              <SelectItem value="CO3">CO3</SelectItem>
              <SelectItem value="CO4">CO4</SelectItem>
              <SelectItem value="CO1, CO2">CO1, CO2</SelectItem>
              <SelectItem value="CO2, CO3">CO2, CO3</SelectItem>
              <SelectItem value="CO3, CO4">CO3, CO4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pso-mapping">PSO Mapping</Label>
          <Select
            value={lessonPlan.cies[activeCIE]?.pso_mapping || ""}
            onValueChange={(value) => handleCIEChange(activeCIE, "pso_mapping", value)}
          >
            <SelectTrigger id="pso-mapping" className="mt-1">
              <SelectValue placeholder="Select PSOs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PSO1">PSO1</SelectItem>
              <SelectItem value="PSO2">PSO2</SelectItem>
              <SelectItem value="PSO3">PSO3</SelectItem>
              <SelectItem value="PSO1, PSO2">PSO1, PSO2</SelectItem>
              <SelectItem value="PSO2, PSO3">PSO2, PSO3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="peo-mapping">PEO Mapping</Label>
          <Select
            value={lessonPlan.cies[activeCIE]?.peo_mapping || ""}
            onValueChange={(value) => handleCIEChange(activeCIE, "peo_mapping", value)}
          >
            <SelectTrigger id="peo-mapping" className="mt-1">
              <SelectValue placeholder="Select PEOs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEO1">PEO1</SelectItem>
              <SelectItem value="PEO2">PEO2</SelectItem>
              <SelectItem value="PEO3">PEO3</SelectItem>
              <SelectItem value="PEO4">PEO4</SelectItem>
              <SelectItem value="PEO1, PEO2">PEO1, PEO2</SelectItem>
              <SelectItem value="PEO3, PEO4">PEO3, PEO4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
