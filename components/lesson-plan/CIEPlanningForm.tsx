// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Textarea } from "@/components/ui/textarea"
// import { Plus, Trash2, AlertTriangle } from "lucide-react"
// import { toast } from "sonner"
// import { Badge } from "@/components/ui/badge"
// import { Card } from "@/components/ui/card"
// import { supabase } from "@/utils/supabase/client"

// interface PSOPEOItem {
//   id: string
//   label?: string
//   description: string
// }

// interface CIEPlanningFormProps {
//   lessonPlan: any
//   setLessonPlan: React.Dispatch<React.SetStateAction<any>>
// }

// // CIE Type Options
// const cieTypeOptions = [
//   "Lecture CIE",
//   "Course Prerequisites CIE",
//   "Mid-term/Internal Exam",
//   "Practical CIE",
//   "Internal Practical",
// ]

// // Evaluation Pedagogy Options
// const evaluationPedagogyOptions = {
//   traditional: [
//     "Objective-Based Assessment (Quiz/MCQ)",
//     "Short/Descriptive Evaluation",
//     "Oral/Visual Communication-Based Evaluation (Presentation/Public Speaking/Viva)",
//     "Assignment-Based Evaluation (Homework/Take-home assignments)",
//   ],
//   alternative: [
//     "Problem-Based Evaluation",
//     "Open Book Assessment",
//     "Peer Assessment",
//     "Case Study-Based Evaluation",
//     "Concept Mapping Evaluation",
//     "Analytical Reasoning Test",
//     "Critical Thinking Assessment",
//     "Project-Based Assessment",
//     "Group/Team Assessment",
//     "Certification-Based Evaluation",
//   ],
//   other: ["Other"],
// }

// // Bloom's Taxonomy Options
// const bloomsTaxonomyOptions = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

// // Skill Mapping Options
// const skillMappingOptions = [
//   "Technical Skills",
//   "Cognitive Skills",
//   "Professional Skills",
//   "Research and Innovation Skills",
//   "Entrepreneurial or Managerial Skills",
//   "Communication Skills",
//   "Leadership and Teamwork Skills",
//   "Creativity and Design Thinking Skills",
//   "Ethical, Social, and Environmental Awareness Skills",
// ]

// export default function CIEPlanningForm({ lessonPlan, setLessonPlan }: CIEPlanningFormProps) {
//   const [activeCIE, setActiveCIE] = useState(0)
//   const [validationErrors, setValidationErrors] = useState<string[]>([])
//   const [departmentPsoPeo, setDepartmentPsoPeo] = useState<{ pso_data: PSOPEOItem[]; peo_data: PSOPEOItem[] }>({
//     pso_data: [],
//     peo_data: [],
//   })
//   const [loadingPsoPeo, setLoadingPsoPeo] = useState(false)

//   // Field-specific error states
//   const [typeError, setTypeError] = useState("")
//   const [unitsCoveredError, setUnitsCoveredError] = useState("")
//   const [dateError, setDateError] = useState("")
//   const [marksError, setMarksError] = useState("")
//   const [durationError, setDurationError] = useState("")
//   const [bloomsError, setBloomsError] = useState("")
//   const [pedagogyError, setPedagogyError] = useState("")
//   const [coMappingError, setCoMappingError] = useState("")
//   const [skillMappingError, setSkillMappingError] = useState("")

//   // Initialize CIEs if empty
//   useEffect(() => {
//     if (!lessonPlan.cies || lessonPlan.cies.length === 0) {
//       const initialCIE = {
//         id: "cie1",
//         type: "",
//         units_covered: [],
//         practicals_covered: [],
//         date: "",
//         marks: 50,
//         duration: 45,
//         blooms_taxonomy: [],
//         evaluation_pedagogy: "",
//         other_pedagogy: "",
//         co_mapping: [],
//         pso_mapping: [],
//         peo_mapping: [],
//         skill_mapping: [{ skill: "", details: "" }],
//       }

//       setLessonPlan((prev: any) => ({
//         ...prev,
//         cies: [initialCIE],
//       }))
//     }
//   }, [lessonPlan?.cies, setLessonPlan])

//   // Load PSO/PEO data from the current subject (which should have department-wide data)
//   useEffect(() => {
//     const loadPsoPeoData = async () => {
//       if (lessonPlan.subject?.id) {
//         setLoadingPsoPeo(true)
//         try {
//           console.log("Loading PSO/PEO for subject:", lessonPlan.subject.id)

//           // First, try to get PSO/PEO from the current subject
//           const { data: subjectData, error: subjectError } = await supabase
//             .from("subjects")
//             .select("pso, peo, department_id")
//             .eq("id", lessonPlan.subject.id)
//             .single()

//           if (subjectError) {
//             console.error("Error fetching subject PSO/PEO data:", subjectError)
//             return
//           }

//           console.log("Subject data:", subjectData)

//           let psoData: PSOPEOItem[] = []
//           let peoData: PSOPEOItem[] = []

//           // Check if current subject has PSO/PEO data
//           if (subjectData?.pso?.items && subjectData.pso.items.length > 0) {
//             psoData = subjectData.pso.items
//           }
//           if (subjectData?.peo?.items && subjectData.peo.items.length > 0) {
//             peoData = subjectData.peo.items
//           }

//           // If no data in current subject, try to get from any subject in the same department
//           if (psoData.length === 0 || peoData.length === 0) {
//             console.log("No PSO/PEO in current subject, checking department:", subjectData.department_id)

//             const { data: departmentSubjects, error: deptError } = await supabase
//               .from("subjects")
//               .select("pso, peo")
//               .eq("department_id", subjectData.department_id)
//               .not("pso", "is", null)
//               .not("peo", "is", null)
//               .limit(1)

//             if (!deptError && departmentSubjects && departmentSubjects.length > 0) {
//               const deptSubject = departmentSubjects[0]
//               console.log("Found department subject with PSO/PEO:", deptSubject)

//               if (psoData.length === 0 && deptSubject.pso?.items) {
//                 psoData = deptSubject.pso.items
//               }
//               if (peoData.length === 0 && deptSubject.peo?.items) {
//                 peoData = deptSubject.peo.items
//               }
//             }
//           }

//           console.log("Final PSO data:", psoData)
//           console.log("Final PEO data:", peoData)

//           setDepartmentPsoPeo({
//             pso_data: psoData,
//             peo_data: peoData,
//           })
//         } catch (error) {
//           console.error("Error loading PSO/PEO data:", error)
//           setDepartmentPsoPeo({
//             pso_data: [],
//             peo_data: [],
//           })
//         } finally {
//           setLoadingPsoPeo(false)
//         }
//       }
//     }

//     loadPsoPeoData()
//   }, [lessonPlan.subject?.id])

//   const handleCIEChange = (index: number, field: string, value: any) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     updatedCIEs[index] = {
//       ...updatedCIEs[index],
//       [field]: value,
//     }

//     // Auto-calculate duration based on marks and bloom's taxonomy
//     if (field === "marks" || field === "blooms_taxonomy") {
//       const marks = field === "marks" ? value : updatedCIEs[index].marks
//       const blooms = field === "blooms_taxonomy" ? value : updatedCIEs[index].blooms_taxonomy

//       const calculatedDuration = calculateMinimumDuration(marks, blooms)
//       if (calculatedDuration > updatedCIEs[index].duration) {
//         updatedCIEs[index].duration = calculatedDuration
//       }
//     }

//     // Clear units/practicals based on CIE type
//     if (field === "type") {
//       if (value === "Course Prerequisites CIE") {
//         updatedCIEs[index].units_covered = []
//         updatedCIEs[index].practicals_covered = []
//       } else if (value === "Practical CIE" || value === "Internal Practical") {
//         updatedCIEs[index].units_covered = []
//       } else {
//         updatedCIEs[index].practicals_covered = []
//       }
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))

//     // Validate on change
//     validateCIE(updatedCIEs[index], index)
//   }

//   const calculateMinimumDuration = (marks: number, bloomsLevels: string[]): number => {
//     if (!marks || !bloomsLevels || bloomsLevels.length === 0) return 0

//     const hasHigherOrder = bloomsLevels.some((level) => ["Analyze", "Evaluate", "Create"].includes(level))
//     const hasOnlyLowerOrder = bloomsLevels.every((level) => ["Remember", "Understand"].includes(level))

//     let duration = 0

//     if (hasOnlyLowerOrder) {
//       duration = marks * 2 // 1 mark = 2 minutes
//     } else {
//       duration = marks * 3 // 1 mark = 3 minutes
//     }

//     // Minimum 30 minutes for higher order thinking
//     if (hasHigherOrder && duration < 30) {
//       duration = 30
//     }

//     return duration
//   }

//   const validateCIE = (cie: any, index: number) => {
//     const errors: string[] = []

//     // Validate Bloom's taxonomy based on semester
//     const semester = lessonPlan.subject?.semester || 1
//     if (semester > 2 && cie.blooms_taxonomy?.includes("Remember")) {
//       errors.push(`CIE ${index + 1}: 'Remember' level not allowed for semester ${semester}`)
//     }

//     // Validate duration for practical CIEs
//     if ((cie.type === "Practical CIE" || cie.type === "Internal Practical") && cie.duration < 120) {
//       errors.push(`CIE ${index + 1}: Practical CIE must be minimum 2 hours (120 minutes)`)
//     }

//     // Validate Mid-term duration
//     if (cie.type === "Mid-term/Internal Exam" && cie.duration <= 60) {
//       errors.push(`CIE ${index + 1}: Warning - Mid-term exam duration should be more than 60 minutes`)
//     }

//     // Validate Open Book Assessment
//     if (cie.evaluation_pedagogy === "Open Book Assessment") {
//       const allowedBlooms = ["Analyze", "Evaluate", "Create"]
//       const hasInvalidBlooms = cie.blooms_taxonomy?.some((bloom: string) => !allowedBlooms.includes(bloom))
//       if (hasInvalidBlooms) {
//         errors.push(`CIE ${index + 1}: Open Book Assessment only allows Analyze, Evaluate, and Create levels`)
//       }
//     }

//     // NEW: Validate Traditional CIE rule - exactly one traditional pedagogy across all CIEs
//     const traditionalPedagogies = evaluationPedagogyOptions.traditional
//     if (traditionalPedagogies.includes(cie.evaluation_pedagogy)) {
//       const allCIEs = lessonPlan.cies || []
//       const otherTraditionalCIEs = allCIEs.filter(
//         (otherCIE: any, otherIndex: number) =>
//           otherIndex !== index && traditionalPedagogies.includes(otherCIE.evaluation_pedagogy),
//       )

//       if (otherTraditionalCIEs.length > 0) {
//         errors.push(`CIE ${index + 1}: Only one traditional pedagogy allowed across all CIEs`)
//       }
//     }

//     setValidationErrors(errors)
//   }

//   const resetFieldErrors = () => {
//     setTypeError("")
//     setUnitsCoveredError("")
//     setDateError("")
//     setMarksError("")
//     setDurationError("")
//     setBloomsError("")
//     setPedagogyError("")
//     setCoMappingError("")
//     setSkillMappingError("")
//   }

//   const addCIE = () => {
//     const currentCIEs = lessonPlan.cies || []
//     const newCIENumber = currentCIEs.length + 1
//     const newCIE = {
//       id: `cie${newCIENumber}`,
//       type: "",
//       units_covered: [],
//       practicals_covered: [],
//       date: "",
//       marks: 50,
//       duration: 45,
//       blooms_taxonomy: [],
//       evaluation_pedagogy: "",
//       other_pedagogy: "",
//       co_mapping: [],
//       pso_mapping: [],
//       peo_mapping: [],
//       skill_mapping: [{ skill: "", details: "" }],
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: [...currentCIEs, newCIE],
//     }))

//     setActiveCIE(currentCIEs.length)
//   }

//   const removeCIE = (index: number) => {
//     const currentCIEs = lessonPlan.cies || []
//     if (currentCIEs.length <= 1) {
//       toast.error("At least one CIE is required")
//       return
//     }

//     const updatedCIEs = currentCIEs.filter((_: any, i: number) => i !== index)
//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))

//     if (activeCIE >= index && activeCIE > 0) {
//       setActiveCIE(activeCIE - 1)
//     }
//   }

//   const addSkillMapping = (cieIndex: number) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     if (!updatedCIEs[cieIndex].skill_mapping) {
//       updatedCIEs[cieIndex].skill_mapping = []
//     }
//     updatedCIEs[cieIndex].skill_mapping.push({ skill: "", details: "" })

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))
//   }

//   const removeSkillMapping = (cieIndex: number, skillIndex: number) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     if (updatedCIEs[cieIndex].skill_mapping && Array.isArray(updatedCIEs[cieIndex].skill_mapping)) {
//       updatedCIEs[cieIndex].skill_mapping = updatedCIEs[cieIndex].skill_mapping.filter(
//         (_: any, i: number) => i !== skillIndex,
//       )
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))
//   }

//   const handleSkillMappingChange = (cieIndex: number, skillIndex: number, field: string, value: string) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     if (!updatedCIEs[cieIndex].skill_mapping) {
//       updatedCIEs[cieIndex].skill_mapping = []
//     }
//     if (!updatedCIEs[cieIndex].skill_mapping[skillIndex]) {
//       updatedCIEs[cieIndex].skill_mapping[skillIndex] = { skill: "", details: "" }
//     }
//     updatedCIEs[cieIndex].skill_mapping[skillIndex][field] = value

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))
//   }

//   const validateAllCIEs = () => {
//     const errors: string[] = []
//     const currentCIEs = lessonPlan.cies || []

//     // Check minimum 3 CIEs for theory
//     if (currentCIEs.length < 3) {
//       errors.push("Minimum 3 CIEs are required for theory subjects")
//     }

//     // Check date gaps
//     const sortedCIEs = [...currentCIEs]
//       .filter((cie) => cie.date)
//       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

//     for (let i = 1; i < sortedCIEs.length; i++) {
//       const prevDate = new Date(sortedCIEs[i - 1].date)
//       const currDate = new Date(sortedCIEs[i].date)
//       const daysDiff = Math.abs((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

//       if (daysDiff < 7) {
//         errors.push(`CIE dates must be at least 7 days apart`)
//       }
//       if (daysDiff > 30) {
//         errors.push(`CIE dates must not exceed 30 days gap`)
//       }
//     }

//     // Check all CIE types covered
//     const cieTypes = currentCIEs.map((cie: any) => cie.type).filter(Boolean)
//     const requiredTypes = ["Lecture CIE", "Course Prerequisites CIE", "Mid-term/Internal Exam"]
//     const missingTypes = requiredTypes.filter((type) => !cieTypes.includes(type))

//     if (missingTypes.length > 0) {
//       errors.push(`Missing CIE types: ${missingTypes.join(", ")}`)
//     }

//     // NEW: Validate exactly one traditional pedagogy across all CIEs
//     const traditionalPedagogies = evaluationPedagogyOptions.traditional
//     const usedTraditional = currentCIEs
//       .filter((cie: any) => cie.type === "Lecture CIE") // Only apply to Lecture CIEs
//       .map((cie: any) => cie.evaluation_pedagogy)
//       .filter((pedagogy: string) => traditionalPedagogies.includes(pedagogy))

//     const uniqueTraditional = new Set(usedTraditional)

//     if (usedTraditional.length !== uniqueTraditional.size) {
//       errors.push("Each traditional pedagogy method must be used only once across Lecture CIEs")
//     }

//     if (usedTraditional.length === 0) {
//       errors.push("At least one traditional pedagogy is required for Lecture CIEs")
//     }

//     // NEW: Validate at least two alternative pedagogies
//     const alternativePedagogies = evaluationPedagogyOptions.alternative
//     const usedAlternative = currentCIEs
//       .map((cie: any) => cie.evaluation_pedagogy)
//       .filter((pedagogy: string) => alternativePedagogies.includes(pedagogy))

//     if (usedAlternative.length < 2) {
//       errors.push("At least two alternative pedagogies are required")
//     }

//     return errors
//   }

//   const handleSave = () => {
//     // Reset field-specific errors
//     resetFieldErrors()

//     // Validate current CIE fields
//     let hasFieldErrors = false

//     if (!currentCIE.type) {
//       setTypeError("Type of evaluation is required")
//       hasFieldErrors = true
//     }

//     if (currentCIE.type !== "Course Prerequisites CIE") {
//       if (currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical") {
//         if (!currentCIE.practicals_covered || currentCIE.practicals_covered.length === 0) {
//           setUnitsCoveredError("Practicals covered is required")
//           hasFieldErrors = true
//         }
//       } else {
//         if (!currentCIE.units_covered || currentCIE.units_covered.length === 0) {
//           setUnitsCoveredError("Units covered is required")
//           hasFieldErrors = true
//         }
//       }
//     }

//     if (!currentCIE.date) {
//       setDateError("Date is required")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.marks || currentCIE.marks < 1) {
//       setMarksError("Marks must be at least 1")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.duration || currentCIE.duration < 1) {
//       setDurationError("Duration must be at least 1 minute")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.blooms_taxonomy || currentCIE.blooms_taxonomy.length === 0) {
//       setBloomsError("At least one Bloom's taxonomy level is required")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.evaluation_pedagogy) {
//       setPedagogyError("Evaluation pedagogy is required")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.co_mapping || currentCIE.co_mapping.length === 0) {
//       setCoMappingError("At least one CO mapping is required")
//       hasFieldErrors = true
//     }

//     if (
//       !currentCIE.skill_mapping ||
//       currentCIE.skill_mapping.length === 0 ||
//       currentCIE.skill_mapping.some((skill: any) => !skill.skill || !skill.details)
//     ) {
//       setSkillMappingError("All skill mappings must have both skill and details")
//       hasFieldErrors = true
//     }

//     const errors = validateAllCIEs()

//     if (errors.length > 0 || hasFieldErrors) {
//       setValidationErrors(errors)
//       toast.error("Please fix validation errors before saving")
//       return
//     }

//     toast.success("CIE details saved successfully")
//     setValidationErrors([])
//   }

//   const currentCIEs = lessonPlan.cies || []
//   const currentCIE = currentCIEs[activeCIE]

//   if (!currentCIE) {
//     return <div>Loading...</div>
//   }

//   // Ensure skill_mapping is always an array
//   if (!currentCIE.skill_mapping || !Array.isArray(currentCIE.skill_mapping)) {
//     currentCIE.skill_mapping = [{ skill: "", details: "" }]
//   }

//   return (
//     <div className="p-6">
//       {/* Validation Errors */}
//       {validationErrors.length > 0 && (
//         <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-4">
//           <div className="flex items-start">
//             <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
//             <div className="text-red-800">
//               <ul className="list-disc list-inside space-y-1">
//                 {validationErrors.map((error, index) => (
//                   <li key={index}>{error}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CIE Navigation */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex space-x-2 flex-wrap">
//           {currentCIEs.map((cie: any, index: number) => (
//             <Button
//               key={cie.id}
//               variant={activeCIE === index ? "default" : "outline"}
//               className={activeCIE === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""}
//               onClick={() => setActiveCIE(index)}
//             >
//               CIE {index + 1}
//               {cie.type && (
//                 <Badge variant="secondary" className="ml-2 text-xs">
//                   {cie.type.split(" ")[0]}
//                 </Badge>
//               )}
//             </Button>
//           ))}
//           <Button variant="outline" onClick={addCIE}>
//             <Plus className="h-4 w-4 mr-1" />
//             Add CIE
//           </Button>
//         </div>
//         {currentCIEs.length > 1 && (
//           <Button
//             variant="ghost"
//             className="text-red-500 hover:text-red-700 hover:bg-red-50"
//             onClick={() => removeCIE(activeCIE)}
//           >
//             <Trash2 className="h-4 w-4 mr-1" />
//             Remove CIE
//           </Button>
//         )}
//       </div>

//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h3 className="text-xl font-semibold">CIE {activeCIE + 1}</h3>
//         </div>

//         {/* Type of Evaluation */}
//         <div className="grid grid-cols-2 gap-6">
//           <div>
//             <Label htmlFor="type-of-evaluation">Type of Evaluation *</Label>
//             <Select value={currentCIE.type || ""} onValueChange={(value) => handleCIEChange(activeCIE, "type", value)}>
//               <SelectTrigger id="type-of-evaluation" className="mt-1">
//                 <SelectValue placeholder="Select Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 {cieTypeOptions.map((type) => (
//                   <SelectItem key={type} value={type}>
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {typeError && <p className="text-red-500 text-xs mt-1">{typeError}</p>}
//           </div>

//           {/* Units/Practicals Covered */}
//           <div>
//             <Label htmlFor="units-covered">
//               {currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical"
//                 ? "Practicals Covered *"
//                 : "Units Covered *"}
//             </Label>
//             <Select
//               value={currentCIE.type === "Course Prerequisites CIE" ? "disabled" : ""}
//               disabled={currentCIE.type === "Course Prerequisites CIE"}
//               onValueChange={(value) => {
//                 if (currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical") {
//                   handleCIEChange(activeCIE, "practicals_covered", [value])
//                 } else {
//                   handleCIEChange(activeCIE, "units_covered", [value])
//                 }
//               }}
//             >
//               <SelectTrigger id="units-covered" className="mt-1">
//                 <SelectValue
//                   placeholder={
//                     currentCIE.type === "Course Prerequisites CIE"
//                       ? "N/A for Prerequisites CIE"
//                       : currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical"
//                         ? "Select Practical(s)"
//                         : "Select Unit(s)"
//                   }
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 {currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical"
//                   ? lessonPlan.practicals?.map((practical: any, index: number) => (
//                       <SelectItem key={practical.id} value={practical.id}>
//                         Practical {index + 1}: {practical.practical_aim}
//                       </SelectItem>
//                     ))
//                   : lessonPlan.units?.map((unit: any, index: number) => (
//                       <SelectItem key={unit.id} value={unit.id}>
//                         Unit {index + 1}: {unit.unit_name}
//                       </SelectItem>
//                     ))}
//               </SelectContent>
//             </Select>
//             {unitsCoveredError && <p className="text-red-500 text-xs mt-1">{unitsCoveredError}</p>}
//           </div>
//         </div>

//         {/* Date, Marks, Duration */}
//         <div className="grid grid-cols-3 gap-6">
//           <div>
//             <Label htmlFor="date">Date *</Label>
//             <Input
//               id="date"
//               type="date"
//               value={currentCIE.date || ""}
//               onChange={(e) => handleCIEChange(activeCIE, "date", e.target.value)}
//               className="mt-1"
//             />
//             {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
//             {currentCIE.type === "Course Prerequisites CIE" && (
//               <p className="text-xs text-amber-600 mt-1">Must be within 10 days of term start date</p>
//             )}
//           </div>
//           <div>
//             <Label htmlFor="marks">Marks *</Label>
//             <Input
//               id="marks"
//               type="number"
//               min="1"
//               value={currentCIE.marks || ""}
//               onChange={(e) => handleCIEChange(activeCIE, "marks", Number(e.target.value))}
//               className="mt-1"
//             />
//             {marksError && <p className="text-red-500 text-xs mt-1">{marksError}</p>}
//           </div>
//           <div>
//             <Label htmlFor="duration">Duration (minutes) *</Label>
//             <Input
//               id="duration"
//               type="number"
//               min="1"
//               value={currentCIE.duration || ""}
//               onChange={(e) => handleCIEChange(activeCIE, "duration", Number(e.target.value))}
//               className="mt-1"
//             />
//             {durationError && <p className="text-red-500 text-xs mt-1">{durationError}</p>}
//             <p className="text-xs text-gray-500 mt-1">Auto-calculated based on marks and Bloom's levels</p>
//           </div>
//         </div>

//         {/* Bloom's Taxonomy */}
//         <div>
//           <Label>Bloom's Taxonomy *</Label>
//           <div className="grid grid-cols-3 gap-4 mt-2">
//             {bloomsTaxonomyOptions.map((level) => {
//               const isDisabled = lessonPlan.subject?.semester > 2 && level === "Remember"
//               return (
//                 <div key={level} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`bloom-${level}`}
//                     checked={currentCIE.blooms_taxonomy?.includes(level) || false}
//                     disabled={isDisabled}
//                     onCheckedChange={(checked) => {
//                       const current = currentCIE.blooms_taxonomy || []
//                       const updated = checked ? [...current, level] : current.filter((l: string) => l !== level)
//                       handleCIEChange(activeCIE, "blooms_taxonomy", updated)
//                     }}
//                   />
//                   <Label htmlFor={`bloom-${level}`} className={isDisabled ? "text-gray-400" : ""}>
//                     {level}
//                   </Label>
//                 </div>
//               )
//             })}
//           </div>
//           {bloomsError && <p className="text-red-500 text-xs mt-1">{bloomsError}</p>}
//           {lessonPlan.subject?.semester > 2 && (
//             <p className="text-xs text-amber-600 mt-2">
//               'Remember' level is disabled for semester {lessonPlan.subject.semester}
//             </p>
//           )}
//         </div>

//         {/* Evaluation Pedagogy */}
//         <div>
//           <Label htmlFor="evaluation-pedagogy">Evaluation Pedagogy *</Label>
//           <Select
//             value={currentCIE.evaluation_pedagogy || ""}
//             onValueChange={(value) => handleCIEChange(activeCIE, "evaluation_pedagogy", value)}
//           >
//             <SelectTrigger id="evaluation-pedagogy" className="mt-1">
//               <SelectValue placeholder="Select Evaluation Pedagogy" />
//             </SelectTrigger>
//             <SelectContent>
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700">Traditional Pedagogy</div>
//               {evaluationPedagogyOptions.traditional.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">
//                 Alternative Pedagogy
//               </div>
//               {evaluationPedagogyOptions.alternative.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">Other</div>
//               {evaluationPedagogyOptions.other.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           {pedagogyError && <p className="text-red-500 text-xs mt-1">{pedagogyError}</p>}

//           {currentCIE.evaluation_pedagogy === "Other" && (
//             <div className="mt-2">
//               <Label htmlFor="other-pedagogy">Specify Other Pedagogy</Label>
//               <Input
//                 id="other-pedagogy"
//                 value={currentCIE.other_pedagogy || ""}
//                 onChange={(e) => handleCIEChange(activeCIE, "other_pedagogy", e.target.value)}
//                 placeholder="Enter custom pedagogy"
//                 className="mt-1"
//               />
//             </div>
//           )}
//         </div>

//         {/* CO, PSO, PEO Mapping */}
//         <div className="grid grid-cols-3 gap-6">
//           <div>
//             <Label>CO Mapping *</Label>
//             <div className="grid grid-cols-2 gap-2 mt-2">
//               {lessonPlan.courseOutcomes?.map((co: any, index: number) => (
//                 <div key={co.id} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`co-${co.id}`}
//                     checked={currentCIE.co_mapping?.includes(co.id) || false}
//                     onCheckedChange={(checked) => {
//                       const current = currentCIE.co_mapping || []
//                       const updated = checked ? [...current, co.id] : current.filter((id: string) => id !== co.id)
//                       handleCIEChange(activeCIE, "co_mapping", updated)
//                     }}
//                   />
//                   <Label htmlFor={`co-${co.id}`} className="text-sm">
//                     CO{index + 1}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//             {coMappingError && <p className="text-red-500 text-xs mt-1">{coMappingError}</p>}
//           </div>

//           <div>
//             <Label>PSO Mapping</Label>
//             {loadingPsoPeo ? (
//               <p className="text-sm text-gray-500 mt-2">Loading PSO data...</p>
//             ) : departmentPsoPeo.pso_data.length > 0 ? (
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 {departmentPsoPeo.pso_data.map((pso, index) => (
//                   <div key={pso.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={`pso-${pso.id}`}
//                       checked={currentCIE.pso_mapping?.includes(pso.id) || false}
//                       onCheckedChange={(checked) => {
//                         const current = currentCIE.pso_mapping || []
//                         const updated = checked ? [...current, pso.id] : current.filter((p: string) => p !== pso.id)
//                         handleCIEChange(activeCIE, "pso_mapping", updated)
//                       }}
//                     />
//                     <Label htmlFor={`pso-${pso.id}`} className="text-sm" title={pso.description}>
//                       {pso.label || `PSO${index + 1}`}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mt-2">
//                 No PSO data configured for this department. Please contact your HOD to set up PSO/PEO data.
//               </p>
//             )}
//           </div>

//           <div>
//             <Label>PEO Mapping</Label>
//             {loadingPsoPeo ? (
//               <p className="text-sm text-gray-500 mt-2">Loading PEO data...</p>
//             ) : departmentPsoPeo.peo_data.length > 0 ? (
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 {departmentPsoPeo.peo_data.map((peo, index) => (
//                   <div key={peo.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={`peo-${peo.id}`}
//                       checked={currentCIE.peo_mapping?.includes(peo.id) || false}
//                       onCheckedChange={(checked) => {
//                         const current = currentCIE.peo_mapping || []
//                         const updated = checked ? [...current, peo.id] : current.filter((p: string) => p !== peo.id)
//                         handleCIEChange(activeCIE, "peo_mapping", updated)
//                       }}
//                     />
//                     <Label htmlFor={`peo-${peo.id}`} className="text-sm" title={peo.description}>
//                       {peo.label || `PEO${index + 1}`}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mt-2">
//                 No PEO data configured for this department. Please contact your HOD to set up PSO/PEO data.
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Skill Mapping */}
//         <div>
//           <div className="flex items-center justify-between mb-3">
//             <Label>Skill Mapping *</Label>
//             <Button type="button" variant="outline" size="sm" onClick={() => addSkillMapping(activeCIE)}>
//               <Plus className="h-4 w-4 mr-1" />
//               Add Skill
//             </Button>
//           </div>

//           <div className="space-y-4">
//             {currentCIE.skill_mapping?.map((skillMap: any, skillIndex: number) => (
//               <Card key={skillIndex} className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor={`skill-${skillIndex}`}>Skill</Label>
//                     <Select
//                       value={skillMap.skill || ""}
//                       onValueChange={(value) => handleSkillMappingChange(activeCIE, skillIndex, "skill", value)}
//                     >
//                       <SelectTrigger id={`skill-${skillIndex}`} className="mt-1">
//                         <SelectValue placeholder="Select Skill" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {skillMappingOptions.map((skill) => (
//                           <SelectItem key={skill} value={skill}>
//                             {skill}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div>
//                     <Label htmlFor={`skill-details-${skillIndex}`}>Details</Label>
//                     <Textarea
//                       id={`skill-details-${skillIndex}`}
//                       value={skillMap.details || ""}
//                       onChange={(e) => handleSkillMappingChange(activeCIE, skillIndex, "details", e.target.value)}
//                       placeholder="Skills should be mentioned in measurable terms (e.g., 'Ability to build and deploy a basic web application using Flask framework' instead of just 'web development skills')"
//                       className="mt-1"
//                       rows={3}
//                     />
//                   </div>
//                 </div>

//                 {currentCIE.skill_mapping.length > 1 && (
//                   <div className="flex justify-end mt-3">
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="text-red-500 hover:text-red-700"
//                       onClick={() => removeSkillMapping(activeCIE, skillIndex)}
//                     >
//                       <Trash2 className="h-4 w-4 mr-1" />
//                       Remove
//                     </Button>
//                   </div>
//                 )}
//               </Card>
//             ))}
//           </div>
//           {skillMappingError && <p className="text-red-500 text-xs mt-1">{skillMappingError}</p>}
//         </div>

//         {/* Remarks */}
//         <div>
//           <Label htmlFor="cie-remarks">Remarks (Optional)</Label>
//           <Textarea
//             id="cie-remarks"
//             value={lessonPlan.cie_remarks || ""}
//             onChange={(e) =>
//               setLessonPlan((prev: any) => ({
//                 ...prev,
//                 cie_remarks: e.target.value,
//               }))
//             }
//             placeholder="Enter any additional remarks for all CIEs"
//             className="mt-1"
//             rows={3}
//           />
//         </div>

//         {/* Save Button */}
//         <div className="flex justify-end pt-6 border-t">
//           <Button onClick={handleSave} className="bg-[#1A5CA1] hover:bg-[#154A80]">
//             Save CIE Details
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Textarea } from "@/components/ui/textarea"
// import { Plus, Trash2, AlertTriangle } from "lucide-react"
// import { toast } from "sonner"
// import { Badge } from "@/components/ui/badge"
// import { Card } from "@/components/ui/card"
// import { supabase } from "@/utils/supabase/client"

// interface PSOPEOItem {
//   id: string
//   label?: string
//   description: string
// }

// interface CIEPlanningFormProps {
//   lessonPlan: any
//   setLessonPlan: React.Dispatch<React.SetStateAction<any>>
// }

// // CIE Type Options
// const cieTypeOptions = [
//   "Lecture CIE",
//   "Course Prerequisites CIE",
//   "Mid-term/Internal Exam",
//   "Practical CIE",
//   "Internal Practical",
// ]

// // Evaluation Pedagogy Options
// const evaluationPedagogyOptions = {
//   traditional: [
//     "Objective-Based Assessment (Quiz/MCQ)",
//     "Short/Descriptive Evaluation",
//     "Oral/Visual Communication-Based Evaluation (Presentation/Public Speaking/Viva)",
//     "Assignment-Based Evaluation (Homework/Take-home assignments)",
//   ],
//   alternative: [
//     "Problem-Based Evaluation",
//     "Open Book Assessment",
//     "Peer Assessment",
//     "Case Study-Based Evaluation",
//     "Concept Mapping Evaluation",
//     "Analytical Reasoning Test",
//     "Critical Thinking Assessment",
//     "Project-Based Assessment",
//     "Group/Team Assessment",
//     "Certification-Based Evaluation",
//   ],
//   other: ["Other"],
// }

// // Bloom's Taxonomy Options
// const bloomsTaxonomyOptions = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

// // Skill Mapping Options
// const skillMappingOptions = [
//   "Technical Skills",
//   "Cognitive Skills",
//   "Professional Skills",
//   "Research and Innovation Skills",
//   "Entrepreneurial or Managerial Skills",
//   "Communication Skills",
//   "Leadership and Teamwork Skills",
//   "Creativity and Design Thinking Skills",
//   "Ethical, Social, and Environmental Awareness Skills",
// ]

// export default function CIEPlanningForm({ lessonPlan, setLessonPlan }: CIEPlanningFormProps) {
//   const [activeCIE, setActiveCIE] = useState(0)
//   const [validationErrors, setValidationErrors] = useState<string[]>([])
//   const [departmentPsoPeo, setDepartmentPsoPeo] = useState<{ pso_data: PSOPEOItem[]; peo_data: PSOPEOItem[] }>({
//     pso_data: [],
//     peo_data: [],
//   })
//   const [loadingPsoPeo, setLoadingPsoPeo] = useState(false)

//   // Field-specific error states
//   const [typeError, setTypeError] = useState("")
//   const [unitsCoveredError, setUnitsCoveredError] = useState("")
//   const [dateError, setDateError] = useState("")
//   const [marksError, setMarksError] = useState("")
//   const [durationError, setDurationError] = useState("")
//   const [bloomsError, setBloomsError] = useState("")
//   const [pedagogyError, setPedagogyError] = useState("")
//   const [coMappingError, setCoMappingError] = useState("")
//   const [skillMappingError, setSkillMappingError] = useState("")

//   // Initialize CIEs if empty
//   useEffect(() => {
//     if (!lessonPlan.cies || lessonPlan.cies.length === 0) {
//       const initialCIE = {
//         id: "cie1",
//         type: "",
//         units_covered: [],
//         practicals_covered: [],
//         date: "",
//         marks: 50,
//         duration: 45,
//         blooms_taxonomy: [],
//         evaluation_pedagogy: "",
//         other_pedagogy: "",
//         co_mapping: [],
//         pso_mapping: [],
//         peo_mapping: [],
//         skill_mapping: [{ skill: "", details: "" }],
//       }

//       setLessonPlan((prev: any) => ({
//         ...prev,
//         cies: [initialCIE],
//       }))
//     }
//   }, [lessonPlan?.cies, setLessonPlan])

//   // Load PSO/PEO data from the current subject (which should have department-wide data)
//   useEffect(() => {
//     const loadPsoPeoData = async () => {
//       if (lessonPlan.subject?.id) {
//         setLoadingPsoPeo(true)
//         try {
//           console.log("Loading PSO/PEO for subject:", lessonPlan.subject.id)

//           // First, try to get PSO/PEO from the current subject
//           const { data: subjectData, error: subjectError } = await supabase
//             .from("subjects")
//             .select("pso, peo, department_id")
//             .eq("id", lessonPlan.subject.id)
//             .single()

//           if (subjectError) {
//             console.error("Error fetching subject PSO/PEO data:", subjectError)
//             return
//           }

//           console.log("Subject data:", subjectData)

//           let psoData: PSOPEOItem[] = []
//           let peoData: PSOPEOItem[] = []

//           // Check if current subject has PSO/PEO data
//           if (subjectData?.pso?.items && subjectData.pso.items.length > 0) {
//             psoData = subjectData.pso.items
//           }
//           if (subjectData?.peo?.items && subjectData.peo.items.length > 0) {
//             peoData = subjectData.peo.items
//           }

//           // If no data in current subject, try to get from any subject in the same department
//           if (psoData.length === 0 || peoData.length === 0) {
//             console.log("No PSO/PEO in current subject, checking department:", subjectData.department_id)

//             const { data: departmentSubjects, error: deptError } = await supabase
//               .from("subjects")
//               .select("pso, peo")
//               .eq("department_id", subjectData.department_id)
//               .not("pso", "is", null)
//               .not("peo", "is", null)
//               .limit(1)

//             if (!deptError && departmentSubjects && departmentSubjects.length > 0) {
//               const deptSubject = departmentSubjects[0]
//               console.log("Found department subject with PSO/PEO:", deptSubject)

//               if (psoData.length === 0 && deptSubject.pso?.items) {
//                 psoData = deptSubject.pso.items
//               }
//               if (peoData.length === 0 && deptSubject.peo?.items) {
//                 peoData = deptSubject.peo.items
//               }
//             }
//           }

//           console.log("Final PSO data:", psoData)
//           console.log("Final PEO data:", peoData)

//           setDepartmentPsoPeo({
//             pso_data: psoData,
//             peo_data: peoData,
//           })
//         } catch (error) {
//           console.error("Error loading PSO/PEO data:", error)
//           setDepartmentPsoPeo({
//             pso_data: [],
//             peo_data: [],
//           })
//         } finally {
//           setLoadingPsoPeo(false)
//         }
//       }
//     }

//     loadPsoPeoData()
//   }, [lessonPlan.subject?.id])

//   const handleCIEChange = (index: number, field: string, value: any) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     updatedCIEs[index] = {
//       ...updatedCIEs[index],
//       [field]: value,
//     }

//     // Auto-calculate duration based on marks and bloom's taxonomy
//     if (field === "marks" || field === "blooms_taxonomy") {
//       const marks = field === "marks" ? value : updatedCIEs[index].marks
//       const blooms = field === "blooms_taxonomy" ? value : updatedCIEs[index].blooms_taxonomy

//       const calculatedDuration = calculateMinimumDuration(marks, blooms)
//       if (calculatedDuration > updatedCIEs[index].duration) {
//         updatedCIEs[index].duration = calculatedDuration
//       }
//     }

//     // Clear units/practicals based on CIE type
//     if (field === "type") {
//       if (value === "Course Prerequisites CIE") {
//         updatedCIEs[index].units_covered = []
//         updatedCIEs[index].practicals_covered = []
//       } else if (value === "Practical CIE" || value === "Internal Practical") {
//         updatedCIEs[index].units_covered = []
//       } else {
//         updatedCIEs[index].practicals_covered = []
//       }
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))

//     // Validate on change
//     validateCIE(updatedCIEs[index], index)
//   }

//   const calculateMinimumDuration = (marks: number, bloomsLevels: string[]): number => {
//     if (!marks || !bloomsLevels || bloomsLevels.length === 0) return 0

//     const hasHigherOrder = bloomsLevels.some((level) => ["Analyze", "Evaluate", "Create"].includes(level))
//     const hasOnlyLowerOrder = bloomsLevels.every((level) => ["Remember", "Understand"].includes(level))

//     let duration = 0

//     if (hasOnlyLowerOrder) {
//       duration = marks * 2 // 1 mark = 2 minutes
//     } else {
//       duration = marks * 3 // 1 mark = 3 minutes
//     }

//     // Minimum 30 minutes for higher order thinking
//     if (hasHigherOrder && duration < 30) {
//       duration = 30
//     }

//     return duration
//   }

//   const validateCIE = (cie: any, index: number) => {
//     const errors: string[] = []

//     // Validate Bloom's taxonomy based on semester
//     const semester = lessonPlan.subject?.semester || 1
//     if (semester > 2 && cie.blooms_taxonomy?.includes("Remember")) {
//       errors.push(`CIE ${index + 1}: 'Remember' level not allowed for semester ${semester}`)
//     }

//     // Validate duration for practical CIEs
//     if ((cie.type === "Practical CIE" || cie.type === "Internal Practical") && cie.duration < 120) {
//       errors.push(`CIE ${index + 1}: Practical CIE must be minimum 2 hours (120 minutes)`)
//     }

//     // Validate Mid-term duration
//     if (cie.type === "Mid-term/Internal Exam" && cie.duration <= 60) {
//       errors.push(`CIE ${index + 1}: Warning - Mid-term exam duration should be more than 60 minutes`)
//     }

//     // Validate Open Book Assessment
//     if (cie.evaluation_pedagogy === "Open Book Assessment") {
//       const allowedBlooms = ["Analyze", "Evaluate", "Create"]
//       const hasInvalidBlooms = cie.blooms_taxonomy?.some((bloom: string) => !allowedBlooms.includes(bloom))
//       if (hasInvalidBlooms) {
//         errors.push(`CIE ${index + 1}: Open Book Assessment only allows Analyze, Evaluate, and Create levels`)
//       }
//     }

//     // Remove or comment out this section in validateCIE function:
//     // const traditionalPedagogies = evaluationPedagogyOptions.traditional
//     // if (traditionalPedagogies.includes(cie.evaluation_pedagogy)) {
//     //   const allCIEs = lessonPlan.cies || []
//     //   const otherTraditionalCIEs = allCIEs.filter(
//     //     (otherCIE: any, otherIndex: number) =>
//     //       otherIndex !== index && traditionalPedagogies.includes(otherCIE.evaluation_pedagogy),
//     //   )
//     //   if (otherTraditionalCIEs.length > 0) {
//     //     errors.push(`CIE ${index + 1}: Only one traditional pedagogy allowed across all CIEs`)
//     //   }
//     // }

//     setValidationErrors(errors)
//   }

//   const resetFieldErrors = () => {
//     setTypeError("")
//     setUnitsCoveredError("")
//     setDateError("")
//     setMarksError("")
//     setDurationError("")
//     setBloomsError("")
//     setPedagogyError("")
//     setCoMappingError("")
//     setSkillMappingError("")
//   }

//   const addCIE = () => {
//     const currentCIEs = lessonPlan.cies || []
//     const newCIENumber = currentCIEs.length + 1
//     const newCIE = {
//       id: `cie${newCIENumber}`,
//       type: "",
//       units_covered: [],
//       practicals_covered: [],
//       date: "",
//       marks: 50,
//       duration: 45,
//       blooms_taxonomy: [],
//       evaluation_pedagogy: "",
//       other_pedagogy: "",
//       co_mapping: [],
//       pso_mapping: [],
//       peo_mapping: [],
//       skill_mapping: [{ skill: "", details: "" }],
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: [...currentCIEs, newCIE],
//     }))

//     setActiveCIE(currentCIEs.length)
//   }

//   const removeCIE = (index: number) => {
//     const currentCIEs = lessonPlan.cies || []
//     if (currentCIEs.length <= 1) {
//       toast.error("At least one CIE is required")
//       return
//     }

//     const updatedCIEs = currentCIEs.filter((_: any, i: number) => i !== index)
//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))

//     if (activeCIE >= index && activeCIE > 0) {
//       setActiveCIE(activeCIE - 1)
//     }
//   }

//   const addSkillMapping = (cieIndex: number) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     if (!updatedCIEs[cieIndex].skill_mapping) {
//       updatedCIEs[cieIndex].skill_mapping = []
//     }
//     updatedCIEs[cieIndex].skill_mapping.push({ skill: "", details: "" })

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))
//   }

//   const removeSkillMapping = (cieIndex: number, skillIndex: number) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     if (updatedCIEs[cieIndex].skill_mapping && Array.isArray(updatedCIEs[cieIndex].skill_mapping)) {
//       updatedCIEs[cieIndex].skill_mapping = updatedCIEs[cieIndex].skill_mapping.filter(
//         (_: any, i: number) => i !== skillIndex,
//       )
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))
//   }

//   const handleSkillMappingChange = (cieIndex: number, skillIndex: number, field: string, value: string) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])]
//     if (!updatedCIEs[cieIndex].skill_mapping) {
//       updatedCIEs[cieIndex].skill_mapping = []
//     }
//     if (!updatedCIEs[cieIndex].skill_mapping[skillIndex]) {
//       updatedCIEs[cieIndex].skill_mapping[skillIndex] = { skill: "", details: "" }
//     }
//     updatedCIEs[cieIndex].skill_mapping[skillIndex][field] = value

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }))
//   }

//   const validateAllCIEs = () => {
//     const errors: string[] = []
//     const currentCIEs = lessonPlan.cies || []

//     // Check minimum 3 CIEs for theory
//     if (currentCIEs.length < 3) {
//       errors.push("Minimum 3 CIEs are required for theory subjects")
//     }

//     // Check date gaps
//     const sortedCIEs = [...currentCIEs]
//       .filter((cie) => cie.date)
//       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

//     for (let i = 1; i < sortedCIEs.length; i++) {
//       const prevDate = new Date(sortedCIEs[i - 1].date)
//       const currDate = new Date(sortedCIEs[i].date)
//       const daysDiff = Math.abs((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

//       if (daysDiff < 7) {
//         errors.push(`CIE dates must be at least 7 days apart`)
//       }
//       if (daysDiff > 30) {
//         errors.push(`CIE dates must not exceed 30 days gap`)
//       }
//     }

//     // Check all CIE types covered
//     const cieTypes = currentCIEs.map((cie: any) => cie.type).filter(Boolean)
//     const requiredTypes = [
//       "Lecture CIE",
//       "Course Prerequisites CIE",
//       "Mid-term/Internal Exam",
//       "Practical CIE",
//       "Internal Practical",
//     ]
//     const missingTypes = requiredTypes.filter((type) => !cieTypes.includes(type))

//     if (missingTypes.length > 0) {
//       errors.push(`Missing CIE types (all 5 types required): ${missingTypes.join(", ")}`)
//     }

//     // NEW: Validate exactly one traditional pedagogy across ALL CIEs (only in Lecture CIEs)
//     const traditionalPedagogies = evaluationPedagogyOptions.traditional
//     const allCIEs = lessonPlan.cies || []

//     // Check if any non-Lecture CIE uses traditional pedagogy
//     const nonLectureTraditional = allCIEs.filter(
//       (cie: any) => cie.type !== "Lecture CIE" && traditionalPedagogies.includes(cie.evaluation_pedagogy),
//     )

//     if (nonLectureTraditional.length > 0) {
//       errors.push("Traditional pedagogy can only be used in Lecture CIEs")
//     }

//     // Check traditional pedagogy usage across ALL CIEs
//     const usedTraditional = allCIEs
//       .filter((cie: any) => cie.evaluation_pedagogy && traditionalPedagogies.includes(cie.evaluation_pedagogy))
//       .map((cie: any) => cie.evaluation_pedagogy)

//     const uniqueTraditional = new Set(usedTraditional)

//     if (usedTraditional.length > 1) {
//       errors.push("Only ONE traditional pedagogy is allowed across ALL CIEs")
//     }

//     if (usedTraditional.length !== uniqueTraditional.size) {
//       errors.push("Each traditional pedagogy method must be used only once")
//     }

//     // At least one traditional pedagogy is required in Lecture CIEs
//     const lectureTraditional = allCIEs.filter(
//       (cie: any) => cie.type === "Lecture CIE" && traditionalPedagogies.includes(cie.evaluation_pedagogy),
//     )

//     if (lectureTraditional.length === 0) {
//       errors.push("At least one traditional pedagogy is required in Lecture CIEs")
//     }

//     // NEW: Validate at least ONE alternative pedagogy (changed from two)
//     const alternativePedagogies = evaluationPedagogyOptions.alternative
//     const usedAlternative = allCIEs
//       .map((cie: any) => cie.evaluation_pedagogy)
//       .filter((pedagogy: string) => alternativePedagogies.includes(pedagogy))

//     if (usedAlternative.length < 1) {
//       errors.push("At least one alternative pedagogy is required")
//     }

//     // NEW: Validate that all COs are covered across all Lecture CIEs
//     const lectureCIEs = allCIEs.filter((cie: any) => cie.type === "Lecture CIE")
//     const allCOMappings = new Set()

//     // Collect all CO mappings from Lecture CIEs
//     lectureCIEs.forEach((cie: any) => {
//       if (cie.co_mapping && Array.isArray(cie.co_mapping)) {
//         cie.co_mapping.forEach((coId: string) => allCOMappings.add(coId))
//       }
//     })

//     // Check if all COs are covered
//     const totalCOs = lessonPlan.courseOutcomes?.length || 0
//     if (totalCOs > 0 && allCOMappings.size < totalCOs) {
//       const coveredCOs = Array.from(allCOMappings)
//       const allCOIds = lessonPlan.courseOutcomes?.map((co: any) => co.id) || []
//       const missingCOs = allCOIds.filter((coId: string) => !coveredCOs.includes(coId))

//       errors.push(
//         `All COs must be covered across Lecture CIEs. Missing COs: ${missingCOs
//           .map((coId: string) => {
//             const coIndex = lessonPlan.courseOutcomes?.findIndex((co: any) => co.id === coId)
//             return `CO${(coIndex || 0) + 1}`
//           })
//           .join(", ")}`,
//       )
//     }

//     return errors
//   }

//   const handleSave = () => {
//     // Reset field-specific errors
//     resetFieldErrors()

//     // Validate current CIE fields
//     let hasFieldErrors = false

//     if (!currentCIE.type) {
//       setTypeError("Type of evaluation is required")
//       hasFieldErrors = true
//     }

//     if (currentCIE.type !== "Course Prerequisites CIE") {
//       if (currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical") {
//         if (!currentCIE.practicals_covered || currentCIE.practicals_covered.length === 0) {
//           setUnitsCoveredError("Practicals covered is required")
//           hasFieldErrors = true
//         }
//       } else {
//         if (!currentCIE.units_covered || currentCIE.units_covered.length === 0) {
//           setUnitsCoveredError("Units covered is required")
//           hasFieldErrors = true
//         }
//       }
//     }

//     if (!currentCIE.date) {
//       setDateError("Date is required")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.marks || currentCIE.marks < 1) {
//       setMarksError("Marks must be at least 1")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.duration || currentCIE.duration < 1) {
//       setDurationError("Duration must be at least 1 minute")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.blooms_taxonomy || currentCIE.blooms_taxonomy.length === 0) {
//       setBloomsError("At least one Bloom's taxonomy level is required")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.evaluation_pedagogy) {
//       setPedagogyError("Evaluation pedagogy is required")
//       hasFieldErrors = true
//     }

//     if (!currentCIE.co_mapping || currentCIE.co_mapping.length === 0) {
//       setCoMappingError("At least one CO mapping is required")
//       hasFieldErrors = true
//     }

//     if (
//       !currentCIE.skill_mapping ||
//       currentCIE.skill_mapping.length === 0 ||
//       currentCIE.skill_mapping.some((skill: any) => !skill.skill || !skill.details)
//     ) {
//       setSkillMappingError("All skill mappings must have both skill and details")
//       hasFieldErrors = true
//     }

//     const errors = validateAllCIEs()

//     if (errors.length > 0 || hasFieldErrors) {
//       setValidationErrors(errors)
//       toast.error("Please fix validation errors before saving")
//       return
//     }

//     toast.success("CIE details saved successfully")
//     setValidationErrors([])
//   }

//   const currentCIEs = lessonPlan.cies || []
//   const currentCIE = currentCIEs[activeCIE]

//   if (!currentCIE) {
//     return <div>Loading...</div>
//   }

//   // Ensure skill_mapping is always an array
//   if (!currentCIE.skill_mapping || !Array.isArray(currentCIE.skill_mapping)) {
//     currentCIE.skill_mapping = [{ skill: "", details: "" }]
//   }

//   return (
//     <div className="p-6">
//       {/* Validation Errors */}
//       {validationErrors.length > 0 && (
//         <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-4">
//           <div className="flex items-start">
//             <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
//             <div className="text-red-800">
//               <ul className="list-disc list-inside space-y-1">
//                 {validationErrors.map((error, index) => (
//                   <li key={index}>{error}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CIE Navigation */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex space-x-2 flex-wrap">
//           {currentCIEs.map((cie: any, index: number) => (
//             <Button
//               key={cie.id}
//               variant={activeCIE === index ? "default" : "outline"}
//               className={activeCIE === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""}
//               onClick={() => setActiveCIE(index)}
//             >
//               CIE {index + 1}
//               {cie.type && (
//                 <Badge variant="secondary" className="ml-2 text-xs">
//                   {cie.type.split(" ")[0]}
//                 </Badge>
//               )}
//             </Button>
//           ))}
//           <Button variant="outline" onClick={addCIE}>
//             <Plus className="h-4 w-4 mr-1" />
//             Add CIE
//           </Button>
//         </div>
//         {currentCIEs.length > 1 && (
//           <Button
//             variant="ghost"
//             className="text-red-500 hover:text-red-700 hover:bg-red-50"
//             onClick={() => removeCIE(activeCIE)}
//           >
//             <Trash2 className="h-4 w-4 mr-1" />
//             Remove CIE
//           </Button>
//         )}
//       </div>

//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h3 className="text-xl font-semibold">CIE {activeCIE + 1}</h3>
//         </div>

//         {/* Type of Evaluation */}
//         <div className="grid grid-cols-2 gap-6">
//           <div>
//             <Label htmlFor="type-of-evaluation">Type of Evaluation *</Label>
//             <Select value={currentCIE.type || ""} onValueChange={(value) => handleCIEChange(activeCIE, "type", value)}>
//               <SelectTrigger id="type-of-evaluation" className="mt-1">
//                 <SelectValue placeholder="Select Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 {cieTypeOptions.map((type) => (
//                   <SelectItem key={type} value={type}>
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {typeError && <p className="text-red-500 text-xs mt-1">{typeError}</p>}
//           </div>

//           {/* Units/Practicals Covered */}
//           <div>
//             <Label htmlFor="units-covered">
//               {currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical"
//                 ? "Practicals Covered *"
//                 : "Units Covered *"}
//             </Label>
//             <Select
//               value={currentCIE.type === "Course Prerequisites CIE" ? "disabled" : ""}
//               disabled={currentCIE.type === "Course Prerequisites CIE"}
//               onValueChange={(value) => {
//                 if (currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical") {
//                   // For practicals, update practicals_covered array
//                   const currentPracticals = currentCIE.practicals_covered || []
//                   const updatedPracticals = currentPracticals.includes(value)
//                     ? currentPracticals.filter((id) => id !== value)
//                     : [...currentPracticals, value]
//                   handleCIEChange(activeCIE, "practicals_covered", updatedPracticals)
//                 } else {
//                   // For units, update units_covered array
//                   const currentUnits = currentCIE.units_covered || []
//                   const updatedUnits = currentUnits.includes(value)
//                     ? currentUnits.filter((id) => id !== value)
//                     : [...currentUnits, value]
//                   handleCIEChange(activeCIE, "units_covered", updatedUnits)
//                 }
//               }}
//             >
//               <SelectTrigger id="units-covered" className="mt-1">
//                 <SelectValue
//                   placeholder={
//                     currentCIE.type === "Course Prerequisites CIE"
//                       ? "N/A for Prerequisites CIE"
//                       : currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical"
//                         ? `${(currentCIE.practicals_covered || []).length} practical(s) selected`
//                         : `${(currentCIE.units_covered || []).length} unit(s) selected`
//                   }
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 {currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical"
//                   ? lessonPlan.practicals?.map((practical: any, index: number) => (
//                       <SelectItem
//                         key={practical.id || `practical-${index}`}
//                         value={practical.id || `practical-${index}`}
//                       >
//                         <div className="flex items-center space-x-2">
//                           <input
//                             type="checkbox"
//                             checked={(currentCIE.practicals_covered || []).includes(
//                               practical.id || `practical-${index}`,
//                             )}
//                             onChange={() => {}} // Handled by onValueChange
//                             className="mr-2"
//                           />
//                           Practical {index + 1}: {practical.practical_aim || "No aim specified"}
//                         </div>
//                       </SelectItem>
//                     ))
//                   : lessonPlan.units?.map((unit: any, index: number) => (
//                       <SelectItem key={unit.id || `unit-${index}`} value={unit.id || `unit-${index}`}>
//                         <div className="flex items-center space-x-2">
//                           <input
//                             type="checkbox"
//                             checked={(currentCIE.units_covered || []).includes(unit.id || `unit-${index}`)}
//                             onChange={() => {}} // Handled by onValueChange
//                             className="mr-2"
//                           />
//                           Unit {index + 1}: {unit.unit_name || "No name specified"}
//                         </div>
//                       </SelectItem>
//                     ))}
//               </SelectContent>
//             </Select>
//             {unitsCoveredError && <p className="text-red-500 text-xs mt-1">{unitsCoveredError}</p>}

//             {/* Display selected items */}
//             {currentCIE.type === "Practical CIE" || currentCIE.type === "Internal Practical"
//               ? currentCIE.practicals_covered &&
//                 currentCIE.practicals_covered.length > 0 && (
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {currentCIE.practicals_covered.map((practicalId: string) => {
//                       const practical = lessonPlan.practicals?.find((p: any) => p.id === practicalId)
//                       const practicalIndex = lessonPlan.practicals?.findIndex((p: any) => p.id === practicalId)
//                       return (
//                         <Badge key={practicalId} variant="secondary" className="text-xs">
//                           Practical {(practicalIndex || 0) + 1}: {practical?.practical_aim || "Unknown"}
//                           <button
//                             onClick={() => {
//                               const updated = currentCIE.practicals_covered.filter((id: string) => id !== practicalId)
//                               handleCIEChange(activeCIE, "practicals_covered", updated)
//                             }}
//                             className="ml-1 text-red-500 hover:text-red-700"
//                           >
//                             ×
//                           </button>
//                         </Badge>
//                       )
//                     })}
//                   </div>
//                 )
//               : currentCIE.units_covered &&
//                 currentCIE.units_covered.length > 0 && (
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {currentCIE.units_covered.map((unitId: string) => {
//                       const unit = lessonPlan.units?.find((u: any) => u.id === unitId)
//                       const unitIndex = lessonPlan.units?.findIndex((u: any) => u.id === unitId)
//                       return (
//                         <Badge key={unitId} variant="secondary" className="text-xs">
//                           Unit {(unitIndex || 0) + 1}: {unit?.unit_name || "Unknown"}
//                           <button
//                             onClick={() => {
//                               const updated = currentCIE.units_covered.filter((id: string) => id !== unitId)
//                               handleCIEChange(activeCIE, "units_covered", updated)
//                             }}
//                             className="ml-1 text-red-500 hover:text-red-700"
//                           >
//                             ×
//                           </button>
//                         </Badge>
//                       )
//                     })}
//                   </div>
//                 )}
//           </div>
//         </div>

//         {/* Date, Marks, Duration */}
//         <div className="grid grid-cols-3 gap-6">
//           <div>
//             <Label htmlFor="date">Date *</Label>
//             <Input
//               id="date"
//               type="date"
//               value={currentCIE.date || ""}
//               onChange={(e) => handleCIEChange(activeCIE, "date", e.target.value)}
//               className="mt-1"
//             />
//             {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
//             {currentCIE.type === "Course Prerequisites CIE" && (
//               <p className="text-xs text-amber-600 mt-1">Must be within 10 days of term start date</p>
//             )}
//           </div>
//           <div>
//             <Label htmlFor="marks">Marks *</Label>
//             <Input
//               id="marks"
//               type="number"
//               min="1"
//               value={currentCIE.marks || ""}
//               onChange={(e) => handleCIEChange(activeCIE, "marks", Number(e.target.value))}
//               className="mt-1"
//             />
//             {marksError && <p className="text-red-500 text-xs mt-1">{marksError}</p>}
//           </div>
//           <div>
//             <Label htmlFor="duration">Duration (minutes) *</Label>
//             <Input
//               id="duration"
//               type="number"
//               min="1"
//               value={currentCIE.duration || ""}
//               onChange={(e) => handleCIEChange(activeCIE, "duration", Number(e.target.value))}
//               className="mt-1"
//             />
//             {durationError && <p className="text-red-500 text-xs mt-1">{durationError}</p>}
//             <p className="text-xs text-gray-500 mt-1">Auto-calculated based on marks and Bloom's levels</p>
//           </div>
//         </div>

//         {/* Bloom's Taxonomy */}
//         <div>
//           <Label>Bloom's Taxonomy *</Label>
//           <div className="grid grid-cols-3 gap-4 mt-2">
//             {bloomsTaxonomyOptions.map((level) => {
//               const isDisabled = lessonPlan.subject?.semester > 2 && level === "Remember"
//               return (
//                 <div key={level} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`bloom-${level}`}
//                     checked={currentCIE.blooms_taxonomy?.includes(level) || false}
//                     disabled={isDisabled}
//                     onCheckedChange={(checked) => {
//                       const current = currentCIE.blooms_taxonomy || []
//                       const updated = checked ? [...current, level] : current.filter((l: string) => l !== level)
//                       handleCIEChange(activeCIE, "blooms_taxonomy", updated)
//                     }}
//                   />
//                   <Label htmlFor={`bloom-${level}`} className={isDisabled ? "text-gray-400" : ""}>
//                     {level}
//                   </Label>
//                 </div>
//               )
//             })}
//           </div>
//           {bloomsError && <p className="text-red-500 text-xs mt-1">{bloomsError}</p>}
//           {lessonPlan.subject?.semester > 2 && (
//             <p className="text-xs text-amber-600 mt-2">
//               'Remember' level is disabled for semester {lessonPlan.subject.semester}
//             </p>
//           )}
//         </div>

//         {/* Evaluation Pedagogy */}
//         <div>
//           <Label htmlFor="evaluation-pedagogy">Evaluation Pedagogy *</Label>
//           <Select
//             value={currentCIE.evaluation_pedagogy || ""}
//             onValueChange={(value) => handleCIEChange(activeCIE, "evaluation_pedagogy", value)}
//           >
//             <SelectTrigger id="evaluation-pedagogy" className="mt-1">
//               <SelectValue placeholder="Select Evaluation Pedagogy" />
//             </SelectTrigger>
//             <SelectContent>
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700">Traditional Pedagogy</div>
//               {evaluationPedagogyOptions.traditional.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">
//                 Alternative Pedagogy
//               </div>
//               {evaluationPedagogyOptions.alternative.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">Other</div>
//               {evaluationPedagogyOptions.other.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           {pedagogyError && <p className="text-red-500 text-xs mt-1">{pedagogyError}</p>}

//           {currentCIE.evaluation_pedagogy === "Other" && (
//             <div className="mt-2">
//               <Label htmlFor="other-pedagogy">Specify Other Pedagogy</Label>
//               <Input
//                 id="other-pedagogy"
//                 value={currentCIE.other_pedagogy || ""}
//                 onChange={(e) => handleCIEChange(activeCIE, "other_pedagogy", e.target.value)}
//                 placeholder="Enter custom pedagogy"
//                 className="mt-1"
//               />
//             </div>
//           )}
//         </div>

//         {/* CO, PSO, PEO Mapping */}
//         <div className="grid grid-cols-3 gap-6">
//           <div>
//             <Label>CO Mapping *</Label>
//             <div className="grid grid-cols-2 gap-2 mt-2">
//               {lessonPlan.courseOutcomes?.map((co: any, index: number) => (
//                 <div key={co.id} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`co-${co.id}`}
//                     checked={currentCIE.co_mapping?.includes(co.id) || false}
//                     onCheckedChange={(checked) => {
//                       const current = currentCIE.co_mapping || []
//                       const updated = checked ? [...current, co.id] : current.filter((id: string) => id !== co.id)
//                       handleCIEChange(activeCIE, "co_mapping", updated)
//                     }}
//                   />
//                   <Label htmlFor={`co-${co.id}`} className="text-sm">
//                     CO{index + 1}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//             {coMappingError && <p className="text-red-500 text-xs mt-1">{coMappingError}</p>}
//           </div>

//           <div>
//             <Label>PSO Mapping</Label>
//             {loadingPsoPeo ? (
//               <p className="text-sm text-gray-500 mt-2">Loading PSO data...</p>
//             ) : departmentPsoPeo.pso_data.length > 0 ? (
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 {departmentPsoPeo.pso_data.map((pso, index) => (
//                   <div key={pso.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={`pso-${pso.id}`}
//                       checked={currentCIE.pso_mapping?.includes(pso.id) || false}
//                       onCheckedChange={(checked) => {
//                         const current = currentCIE.pso_mapping || []
//                         const updated = checked ? [...current, pso.id] : current.filter((p: string) => p !== pso.id)
//                         handleCIEChange(activeCIE, "pso_mapping", updated)
//                       }}
//                     />
//                     <Label htmlFor={`pso-${pso.id}`} className="text-sm" title={pso.description}>
//                       {pso.label || `PSO${index + 1}`}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mt-2">
//                 No PSO data configured for this department. Please contact your HOD to set up PSO/PEO data.
//               </p>
//             )}
//           </div>

//           <div>
//             <Label>PEO Mapping</Label>
//             {loadingPsoPeo ? (
//               <p className="text-sm text-gray-500 mt-2">Loading PEO data...</p>
//             ) : departmentPsoPeo.peo_data.length > 0 ? (
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 {departmentPsoPeo.peo_data.map((peo, index) => (
//                   <div key={peo.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={`peo-${peo.id}`}
//                       checked={currentCIE.peo_mapping?.includes(peo.id) || false}
//                       onCheckedChange={(checked) => {
//                         const current = currentCIE.peo_mapping || []
//                         const updated = checked ? [...current, peo.id] : current.filter((p: string) => p !== peo.id)
//                         handleCIEChange(activeCIE, "peo_mapping", updated)
//                       }}
//                     />
//                     <Label htmlFor={`peo-${peo.id}`} className="text-sm" title={peo.description}>
//                       {peo.label || `PEO${index + 1}`}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mt-2">
//                 No PEO data configured for this department. Please contact your HOD to set up PSO/PEO data.
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Skill Mapping */}
//         <div>
//           <div className="flex items-center justify-between mb-3">
//             <Label>Skill Mapping *</Label>
//             <Button type="button" variant="outline" size="sm" onClick={() => addSkillMapping(activeCIE)}>
//               <Plus className="h-4 w-4 mr-1" />
//               Add Skill
//             </Button>
//           </div>

//           <div className="space-y-4">
//             {currentCIE.skill_mapping?.map((skillMap: any, skillIndex: number) => (
//               <Card key={skillIndex} className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor={`skill-${skillIndex}`}>Skill</Label>
//                     <Select
//                       value={skillMap.skill || ""}
//                       onValueChange={(value) => handleSkillMappingChange(activeCIE, skillIndex, "skill", value)}
//                     >
//                       <SelectTrigger id={`skill-${skillIndex}`} className="mt-1">
//                         <SelectValue placeholder="Select Skill" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {skillMappingOptions.map((skill) => (
//                           <SelectItem key={skill} value={skill}>
//                             {skill}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div>
//                     <Label htmlFor={`skill-details-${skillIndex}`}>Details</Label>
//                     <Textarea
//                       id={`skill-details-${skillIndex}`}
//                       value={skillMap.details || ""}
//                       onChange={(e) => handleSkillMappingChange(activeCIE, skillIndex, "details", e.target.value)}
//                       placeholder="Skills should be mentioned in measurable terms (e.g., 'Ability to build and deploy a basic web application using Flask framework' instead of just 'web development skills')"
//                       className="mt-1"
//                       rows={3}
//                     />
//                   </div>
//                 </div>

//                 {currentCIE.skill_mapping.length > 1 && (
//                   <div className="flex justify-end mt-3">
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="text-red-500 hover:text-red-700"
//                       onClick={() => removeSkillMapping(activeCIE, skillIndex)}
//                     >
//                       <Trash2 className="h-4 w-4 mr-1" />
//                       Remove
//                     </Button>
//                   </div>
//                 )}
//               </Card>
//             ))}
//           </div>
//           {skillMappingError && <p className="text-red-500 text-xs mt-1">{skillMappingError}</p>}
//         </div>

//         {/* Remarks */}
//         <div>
//           <Label htmlFor="cie-remarks">Remarks (Optional)</Label>
//           <Textarea
//             id="cie-remarks"
//             value={lessonPlan.cie_remarks || ""}
//             onChange={(e) =>
//               setLessonPlan((prev: any) => ({
//                 ...prev,
//                 cie_remarks: e.target.value,
//               }))
//             }
//             placeholder="Enter any additional remarks for all CIEs"
//             className="mt-1"
//             rows={3}
//           />
//         </div>

//         {/* Save Button */}
//         <div className="flex justify-end pt-6 border-t">
//           <Button onClick={handleSave} className="bg-[#1A5CA1] hover:bg-[#154A80]">
//             Save CIE Details
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

//3rd version

// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, Trash2, AlertTriangle, Info } from "lucide-react";
// import { toast } from "sonner";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import { supabase } from "@/utils/supabase/client";
// import { saveCIEPlanningForm } from "@/app/dashboard/actions/saveCIEPlanningForm";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";

// interface PSOPEOItem {
//   id: string;
//   label?: string;
//   description: string;
// }

// interface CIEPlanningFormProps {
//   lessonPlan: any;
//   setLessonPlan: React.Dispatch<React.SetStateAction<any>>;
// }

// // CIE Type Options
// const cieTypeOptions = [
//   "Lecture CIE",
//   "Course Prerequisites CIE",
//   "Mid-term/Internal Exam",
//   "Practical CIE",
//   "Internal Practical",
// ];

// // Evaluation Pedagogy Options
// const evaluationPedagogyOptions = {
//   traditional: [
//     "Objective-Based Assessment (Quiz/MCQ)",
//     "Short/Descriptive Evaluation",
//     "Oral/Visual Communication-Based Evaluation (Presentation/Public Speaking/Viva)",
//     "Assignment-Based Evaluation (Homework/Take-home assignments)",
//   ],
//   alternative: [
//     "Problem-Based Evaluation",
//     "Open Book Assessment",
//     "Peer Assessment",
//     "Case Study-Based Evaluation",
//     "Concept Mapping Evaluation",
//     "Analytical Reasoning Test",
//     "Critical Thinking Assessment",
//     "Project-Based Assessment",
//     "Group/Team Assessment",
//     "Certification-Based Evaluation",
//   ],
//   other: ["Other"],
// };

// // Bloom's Taxonomy Options
// const bloomsTaxonomyOptions = [
//   "Remember",
//   "Understand",
//   "Apply",
//   "Analyze",
//   "Evaluate",
//   "Create",
// ];

// // Skill Mapping Options
// const skillMappingOptions = [
//   "Technical Skills",
//   "Cognitive Skills",
//   "Professional Skills",
//   "Research and Innovation Skills",
//   "Entrepreneurial or Managerial Skills",
//   "Communication Skills",
//   "Leadership and Teamwork Skills",
//   "Creativity and Design Thinking Skills",
//   "Ethical, Social, and Environmental Awareness Skills",
// ];

// export default function CIEPlanningForm({
//   lessonPlan,
//   setLessonPlan,
// }: CIEPlanningFormProps) {
//   const [activeCIE, setActiveCIE] = useState(0);
//   const [validationErrors, setValidationErrors] = useState<string[]>([]);
//   const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
//   const [departmentPsoPeo, setDepartmentPsoPeo] = useState<{
//     pso_data: PSOPEOItem[];
//     peo_data: PSOPEOItem[];
//   }>({
//     pso_data: [],
//     peo_data: [],
//   });
//   const [loadingPsoPeo, setLoadingPsoPeo] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [warningDialogOpen, setWarningDialogOpen] = useState(false);
//   const [currentWarning, setCurrentWarning] = useState("");

//   // Field-specific error states
//   const [typeError, setTypeError] = useState("");
//   const [unitsCoveredError, setUnitsCoveredError] = useState("");
//   const [dateError, setDateError] = useState("");
//   const [marksError, setMarksError] = useState("");
//   const [durationError, setDurationError] = useState("");
//   const [bloomsError, setBloomsError] = useState("");
//   const [pedagogyError, setPedagogyError] = useState("");
//   const [coMappingError, setCoMappingError] = useState("");
//   const [skillMappingError, setSkillMappingError] = useState("");

//   // Initialize CIEs if empty
//   useEffect(() => {
//     if (!lessonPlan.cies || lessonPlan.cies.length === 0) {
//       const initialCIE = {
//         id: "cie1",
//         type: "",
//         units_covered: [],
//         practicals_covered: [],
//         date: "",
//         marks: 50,
//         duration: 45,
//         blooms_taxonomy: [],
//         evaluation_pedagogy: "",
//         other_pedagogy: "",
//         co_mapping: [],
//         pso_mapping: [],
//         peo_mapping: [],
//         skill_mapping: [{ skill: "", details: "" }],
//       };

//       setLessonPlan((prev: any) => ({
//         ...prev,
//         cies: [initialCIE],
//       }));
//     }
//   }, [lessonPlan?.cies, setLessonPlan]);

//   // Load PSO/PEO data
//   useEffect(() => {
//     const loadPsoPeoData = async () => {
//       if (lessonPlan.subject?.id) {
//         setLoadingPsoPeo(true);
//         try {
//           const { data: subjectData, error: subjectError } = await supabase
//             .from("subjects")
//             .select("pso, peo, department_id")
//             .eq("id", lessonPlan.subject.id)
//             .single();

//           if (subjectError) {
//             console.error("Error fetching subject PSO/PEO data:", subjectError);
//             return;
//           }

//           let psoData: PSOPEOItem[] = [];
//           let peoData: PSOPEOItem[] = [];

//           if (subjectData?.pso?.items && subjectData.pso.items.length > 0) {
//             psoData = subjectData.pso.items;
//           }
//           if (subjectData?.peo?.items && subjectData.peo.items.length > 0) {
//             peoData = subjectData.peo.items;
//           }

//           if (psoData.length === 0 || peoData.length === 0) {
//             const { data: departmentSubjects, error: deptError } =
//               await supabase
//                 .from("subjects")
//                 .select("pso, peo")
//                 .eq("department_id", subjectData.department_id)
//                 .not("pso", "is", null)
//                 .not("peo", "is", null)
//                 .limit(1);

//             if (
//               !deptError &&
//               departmentSubjects &&
//               departmentSubjects.length > 0
//             ) {
//               const deptSubject = departmentSubjects[0];
//               if (psoData.length === 0 && deptSubject.pso?.items) {
//                 psoData = deptSubject.pso.items;
//               }
//               if (peoData.length === 0 && deptSubject.peo?.items) {
//                 peoData = deptSubject.peo.items;
//               }
//             }
//           }

//           setDepartmentPsoPeo({
//             pso_data: psoData,
//             peo_data: peoData,
//           });
//         } catch (error) {
//           console.error("Error loading PSO/PEO data:", error);
//           setDepartmentPsoPeo({
//             pso_data: [],
//             peo_data: [],
//           });
//         } finally {
//           setLoadingPsoPeo(false);
//         }
//       }
//     };

//     loadPsoPeoData();
//   }, [lessonPlan.subject?.id]);

//   const handleCIEChange = (index: number, field: string, value: any) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])];
//     updatedCIEs[index] = {
//       ...updatedCIEs[index],
//       [field]: value,
//     };

//     // Auto-calculate duration based on marks and bloom's taxonomy
//     if (field === "marks" || field === "blooms_taxonomy") {
//       const marks = field === "marks" ? value : updatedCIEs[index].marks;
//       const blooms =
//         field === "blooms_taxonomy"
//           ? value
//           : updatedCIEs[index].blooms_taxonomy;

//       const calculatedDuration = calculateMinimumDuration(marks, blooms);
//       if (calculatedDuration > updatedCIEs[index].duration) {
//         updatedCIEs[index].duration = calculatedDuration;
//       }
//     }

//     // Clear units/practicals based on CIE type
//     if (field === "type") {
//       if (value === "Course Prerequisites CIE") {
//         updatedCIEs[index].units_covered = [];
//         updatedCIEs[index].practicals_covered = [];
//       } else if (value === "Practical CIE" || value === "Internal Practical") {
//         updatedCIEs[index].units_covered = [];
//       } else {
//         updatedCIEs[index].practicals_covered = [];
//       }
//     }

//     // VALIDATION 4: Check for Bloom's taxonomy warnings when selecting bloom's levels (THEORY CIEs ONLY)
//     if (field === "blooms_taxonomy" && value.length > 0) {
//       const theoryCIETypes = [
//         "Lecture CIE",
//         "Course Prerequisites CIE",
//         "Mid-term/Internal Exam",
//       ];
//       if (theoryCIETypes.includes(updatedCIEs[index].type)) {
//         const hasRememberOrUnderstand = value.some((level: string) =>
//           ["Remember", "Understand"].includes(level)
//         );
//         const currentUnits = updatedCIEs[index].units_covered || [];

//         if (hasRememberOrUnderstand && currentUnits.length > 0) {
//           const units = lessonPlan.units || [];
//           const selectedUnits = currentUnits.map((unitId: string) => {
//             const unitIndex = units.findIndex((u: any) => u.id === unitId);
//             return { id: unitId, index: unitIndex };
//           });

//           // Check if any selected unit is not first or last
//           const hasMiddleChapter = selectedUnits.some((unit: any) => {
//             const unitIndex = unit.index;
//             const totalUnits = units.length;
//             return unitIndex > 0 && unitIndex < totalUnits - 1; // Not first or last unit
//           });

//           if (hasMiddleChapter) {
//             const warning =
//               "You should avoid Remember & Understand bloom's taxonomy except first and last chapter.";
//             setCurrentWarning(warning);
//             setWarningDialogOpen(true);
//           }
//         }
//       }
//     }

//     // VALIDATION 4: Check for Bloom's taxonomy warnings when selecting units (THEORY CIEs ONLY)
//     if (field === "units_covered" && value.length > 0) {
//       const theoryCIETypes = [
//         "Lecture CIE",
//         "Course Prerequisites CIE",
//         "Mid-term/Internal Exam",
//       ];
//       if (theoryCIETypes.includes(updatedCIEs[index].type)) {
//         const currentBlooms = updatedCIEs[index].blooms_taxonomy || [];
//         const hasRememberOrUnderstand = currentBlooms.some((level: string) =>
//           ["Remember", "Understand"].includes(level)
//         );

//         if (hasRememberOrUnderstand) {
//           const units = lessonPlan.units || [];
//           const selectedUnits = value.map((unitId: string) => {
//             const unitIndex = units.findIndex((u: any) => u.id === unitId);
//             return { id: unitId, index: unitIndex };
//           });

//           // Check if any selected unit is not first or last
//           const hasMiddleChapter = selectedUnits.some((unit: any) => {
//             const unitIndex = unit.index;
//             const totalUnits = units.length;
//             return unitIndex > 0 && unitIndex < totalUnits - 1; // Not first or last unit
//           });

//           if (hasMiddleChapter) {
//             const warning =
//               "You should avoid Remember & Understand bloom's taxonomy except first and last chapter.";
//             setCurrentWarning(warning);
//             setWarningDialogOpen(true);
//           }
//         }
//       }
//     }

//     // VALIDATION 5: Check for Bloom's taxonomy restrictions when selecting Open Book Assessment
//     if (field === "evaluation_pedagogy" && value === "Open Book Assessment") {
//       const currentBlooms = updatedCIEs[index].blooms_taxonomy || [];
//       const allowedBlooms = ["Analyze", "Evaluate", "Create"];
//       const filteredBlooms = currentBlooms.filter((bloom: string) =>
//         allowedBlooms.includes(bloom)
//       );

//       if (filteredBlooms.length !== currentBlooms.length) {
//         updatedCIEs[index].blooms_taxonomy = filteredBlooms;
//         toast.warning(
//           "For Open Book Assessment, only Analyze, Evaluate, and Create levels are allowed. Other levels have been removed."
//         );
//       }
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }));

//     validateCIE(updatedCIEs[index], index);
//   };

//   const calculateMinimumDuration = (
//     marks: number,
//     bloomsLevels: string[]
//   ): number => {
//     if (!marks || !bloomsLevels || bloomsLevels.length === 0) return 0;

//     const hasHigherOrder = bloomsLevels.some((level) =>
//       ["Analyze", "Evaluate", "Create"].includes(level)
//     );
//     const hasOnlyLowerOrder = bloomsLevels.every((level) =>
//       ["Remember", "Understand"].includes(level)
//     );

//     let duration = 0;

//     if (hasOnlyLowerOrder) {
//       duration = marks * 2; // 1 mark = 2 minutes
//     } else {
//       duration = marks * 3; // 1 mark = 3 minutes
//     }

//     // Minimum 30 minutes for higher order thinking
//     if (hasHigherOrder && duration < 30) {
//       duration = 30;
//     }

//     return duration;
//   };

//   const validateCIE = (cie: any, index: number) => {
//     const errors: string[] = [];
//     const warnings: string[] = [];

//     // VALIDATION 3: Validate Bloom's taxonomy based on semester
//     const semester = lessonPlan.subject?.semester || 1;
//     if (semester > 2 && cie.blooms_taxonomy?.includes("Remember")) {
//       errors.push(
//         `CIE ${
//           index + 1
//         }: 'Remember' level not allowed for semester ${semester}`
//       );
//     }

//     // Validate duration for practical CIEs
//     if (
//       (cie.type === "Practical CIE" || cie.type === "Internal Practical") &&
//       cie.duration < 120
//     ) {
//       errors.push(
//         `CIE ${index + 1}: Practical CIE must be minimum 2 hours (120 minutes)`
//       );
//     }

//     // Validate Mid-term duration
//     if (cie.type === "Mid-term/Internal Exam" && cie.duration <= 60) {
//       errors.push(
//         `CIE ${
//           index + 1
//         }: Warning - Mid-term exam duration should be more than 60 minutes`
//       );
//     }

//     // VALIDATION 5: Validate Open Book Assessment
//     if (cie.evaluation_pedagogy === "Open Book Assessment") {
//       const allowedBlooms = ["Analyze", "Evaluate", "Create"];
//       const hasInvalidBlooms = cie.blooms_taxonomy?.some(
//         (bloom: string) => !allowedBlooms.includes(bloom)
//       );
//       if (hasInvalidBlooms) {
//         errors.push(
//           `CIE ${
//             index + 1
//           }: Open Book Assessment only allows Analyze, Evaluate, and Create levels`
//         );
//       }
//     }

//     setValidationErrors(errors);
//     setValidationWarnings(warnings);
//   };

//   const validateAllCIEs = () => {
//     const errors: string[] = [];
//     const warnings: string[] = [];
//     const currentCIEs = lessonPlan.cies || [];

//     // VALIDATION 1: Date gap validation (must not exceed Course Term End Date)
//     const sortedCIEs = [...currentCIEs]
//       .filter((cie) => cie.date)
//       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//     if (lessonPlan.term_end_date) {
//       const termEndDate = new Date(lessonPlan.term_end_date);
//       sortedCIEs.forEach((cie, index) => {
//         const cieDate = new Date(cie.date);
//         if (cieDate > termEndDate) {
//           errors.push(
//             `CIE ${index + 1} date (${
//               cie.date
//             }) cannot exceed the Course Term End Date (${
//               lessonPlan.term_end_date
//             })`
//           );
//         }
//       });
//     }

//     // Minimum 7 days gap between consecutive CIEs
//     for (let i = 1; i < sortedCIEs.length; i++) {
//       const prevDate = new Date(sortedCIEs[i - 1].date);
//       const currDate = new Date(sortedCIEs[i].date);
//       const daysDiff = Math.abs(
//         (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
//       );

//       if (daysDiff < 7) {
//         errors.push(`CIE dates must be at least 7 days apart`);
//       }
//     }

//     // VALIDATION 2: Check that at least one of each CIE type is present
//     const cieTypes = currentCIEs.map((cie: any) => cie.type).filter(Boolean);
//     const allRequiredTypes = [
//       "Lecture CIE",
//       "Course Prerequisites CIE",
//       "Mid-term/Internal Exam",
//       "Practical CIE",
//       "Internal Practical",
//     ];

//     let hasAtLeastOne = false;
//     allRequiredTypes.forEach((type) => {
//       if (cieTypes.includes(type)) {
//         hasAtLeastOne = true;
//       }
//     });

//     if (!hasAtLeastOne) {
//       errors.push("At least one CIE from the available types must be present");
//     }

//     // VALIDATION 6: Total duration validation (n credit = n - 1 hours) - ONLY FOR THEORY CIEs
//     const totalCredits = lessonPlan.subject?.credits || 0;
//     const requiredMinimumHours = Math.max(0, totalCredits - 1); // n - 1 hours

//     const theoryCIETypes = [
//       "Lecture CIE",
//       "Course Prerequisites CIE",
//       "Mid-term/Internal Exam",
//     ];
//     const theoryCIEs = currentCIEs.filter((cie: any) =>
//       theoryCIETypes.includes(cie.type)
//     );
//     const totalTheoryDurationHours =
//       theoryCIEs.reduce((sum, cie) => sum + (cie.duration || 0), 0) / 60;

//     if (totalTheoryDurationHours < requiredMinimumHours) {
//       errors.push(
//         `Total Theory CIE duration must be at least ${requiredMinimumHours} hours (currently ${totalTheoryDurationHours.toFixed(
//           1
//         )} hours). Practical CIEs are not counted in this validation.`
//       );
//     }

//     // VALIDATION 7: Pedagogy usage validation
//     const traditionalPedagogies = evaluationPedagogyOptions.traditional;
//     const alternativePedagogies = evaluationPedagogyOptions.alternative;

//     const allPedagogies = currentCIEs
//       .map((cie: any) => cie.evaluation_pedagogy)
//       .filter(Boolean);
//     const usedTraditional = allPedagogies.filter((pedagogy: string) =>
//       traditionalPedagogies.includes(pedagogy)
//     );
//     const usedAlternative = allPedagogies.filter((pedagogy: string) =>
//       alternativePedagogies.includes(pedagogy)
//     );

//     // At least one traditional pedagogy is required
//     if (usedTraditional.length === 0) {
//       errors.push("At least one traditional pedagogy method must be used");
//     }

//     // Traditional pedagogy should be unique across all CIEs
//     const uniqueTraditional = new Set(usedTraditional);
//     if (usedTraditional.length !== uniqueTraditional.size) {
//       errors.push(
//         "Each traditional pedagogy method must be used only once across all CIEs"
//       );
//     }

//     // VALIDATION 8: At least one alternative pedagogy is required
//     if (usedAlternative.length === 0) {
//       errors.push("At least one alternative pedagogy is required");
//     }

//     // Validate Course Prerequisites CIE date (must be within 10 days of term start)
//     const prereqCIE = currentCIEs.find(
//       (cie: any) => cie.type === "Course Prerequisites CIE"
//     );
//     if (prereqCIE && prereqCIE.date && lessonPlan.term_start_date) {
//       const termStart = new Date(lessonPlan.term_start_date);
//       const prereqDate = new Date(prereqCIE.date);
//       const daysDiff = Math.abs(
//         (prereqDate.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24)
//       );

//       if (daysDiff > 10) {
//         errors.push(
//           "Course Prerequisites CIE must be conducted within 10 days of term start date"
//         );
//       }
//     }

//     // VALIDATION 9: CO coverage across Lecture CIEs + Course Prerequisites CIEs + Mid-term/Internal Exams
//     const relevantCIETypes = [
//       "Lecture CIE",
//       "Course Prerequisites CIE",
//       "Mid-term/Internal Exam",
//     ];
//     const relevantCIEs = currentCIEs.filter((cie: any) =>
//       relevantCIETypes.includes(cie.type)
//     );

//     if (relevantCIEs.length > 0) {
//       const allCOMappings = new Set();

//       relevantCIEs.forEach((cie: any) => {
//         if (cie.co_mapping && Array.isArray(cie.co_mapping)) {
//           cie.co_mapping.forEach((coId: string) => allCOMappings.add(coId));
//         }
//       });

//       const totalCOs = lessonPlan.courseOutcomes?.length || 0;
//       if (totalCOs > 0 && allCOMappings.size < totalCOs) {
//         const coveredCOs = Array.from(allCOMappings);
//         const allCOIds =
//           lessonPlan.courseOutcomes?.map((co: any) => co.id) || [];
//         const missingCOs = allCOIds.filter(
//           (coId: string) => !coveredCOs.includes(coId)
//         );

//         errors.push(
//           `All COs must be covered across Lecture CIEs + Course Prerequisites CIEs + Mid-term/Internal Exams. Missing COs: ${missingCOs
//             .map((coId: string) => {
//               const coIndex = lessonPlan.courseOutcomes?.findIndex(
//                 (co: any) => co.id === coId
//               );
//               return `CO${(coIndex || 0) + 1}`;
//             })
//             .join(", ")}`
//         );
//       }
//     }

//     // VALIDATION 3: Validate Bloom's taxonomy usage limits
//     const allBloomsUsage = currentCIEs.flatMap(
//       (cie: any) => cie.blooms_taxonomy || []
//     );
//     const rememberCount = allBloomsUsage.filter(
//       (bloom: string) => bloom === "Remember"
//     ).length;
//     const understandCount = allBloomsUsage.filter(
//       (bloom: string) => bloom === "Understand"
//     ).length;

//     if (rememberCount > 1) {
//       errors.push(
//         "'Remember' bloom's taxonomy can be used maximum once across all CIEs"
//       );
//     }

//     if (understandCount > 2) {
//       errors.push(
//         "'Understand' bloom's taxonomy can be used maximum twice across all CIEs"
//       );
//     }

//     // VALIDATION 3: Check if all CIEs have the same Bloom's taxonomy
//     const allBloomsCombinations = currentCIEs
//       .map((cie: any) => (cie.blooms_taxonomy || []).sort().join(","))
//       .filter(Boolean);

//     const uniqueBloomsCombinations = new Set(allBloomsCombinations);
//     if (
//       allBloomsCombinations.length > 1 &&
//       uniqueBloomsCombinations.size === 1
//     ) {
//       errors.push(
//         "All CIEs should not have the same Bloom's Taxonomy combination"
//       );
//     }

//     return { errors, warnings };
//   };

//   const resetFieldErrors = () => {
//     setTypeError("");
//     setUnitsCoveredError("");
//     setDateError("");
//     setMarksError("");
//     setDurationError("");
//     setBloomsError("");
//     setPedagogyError("");
//     setCoMappingError("");
//     setSkillMappingError("");
//   };

//   const addCIE = () => {
//     const currentCIEs = lessonPlan.cies || [];
//     const newCIENumber = currentCIEs.length + 1;
//     const newCIE = {
//       id: `cie${newCIENumber}`,
//       type: "",
//       units_covered: [],
//       practicals_covered: [],
//       date: "",
//       marks: 50,
//       duration: 45,
//       blooms_taxonomy: [],
//       evaluation_pedagogy: "",
//       other_pedagogy: "",
//       co_mapping: [],
//       pso_mapping: [],
//       peo_mapping: [],
//       skill_mapping: [{ skill: "", details: "" }],
//     };

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: [...currentCIEs, newCIE],
//     }));

//     setActiveCIE(currentCIEs.length);
//   };

//   const removeCIE = (index: number) => {
//     const currentCIEs = lessonPlan.cies || [];
//     if (currentCIEs.length <= 1) {
//       toast.error("At least one CIE is required");
//       return;
//     }

//     const updatedCIEs = currentCIEs.filter((_: any, i: number) => i !== index);
//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }));

//     if (activeCIE >= index && activeCIE > 0) {
//       setActiveCIE(activeCIE - 1);
//     }
//   };

//   const addSkillMapping = (cieIndex: number) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])];
//     if (!updatedCIEs[cieIndex].skill_mapping) {
//       updatedCIEs[cieIndex].skill_mapping = [];
//     }
//     updatedCIEs[cieIndex].skill_mapping.push({ skill: "", details: "" });

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }));
//   };

//   const removeSkillMapping = (cieIndex: number, skillIndex: number) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])];
//     if (
//       updatedCIEs[cieIndex].skill_mapping &&
//       Array.isArray(updatedCIEs[cieIndex].skill_mapping)
//     ) {
//       updatedCIEs[cieIndex].skill_mapping = updatedCIEs[
//         cieIndex
//       ].skill_mapping.filter((_: any, i: number) => i !== skillIndex);
//     }

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }));
//   };

//   const handleSkillMappingChange = (
//     cieIndex: number,
//     skillIndex: number,
//     field: string,
//     value: string
//   ) => {
//     const updatedCIEs = [...(lessonPlan.cies || [])];
//     if (!updatedCIEs[cieIndex].skill_mapping) {
//       updatedCIEs[cieIndex].skill_mapping = [];
//     }
//     if (!updatedCIEs[cieIndex].skill_mapping[skillIndex]) {
//       updatedCIEs[cieIndex].skill_mapping[skillIndex] = {
//         skill: "",
//         details: "",
//       };
//     }
//     updatedCIEs[cieIndex].skill_mapping[skillIndex][field] = value;

//     setLessonPlan((prev: any) => ({
//       ...prev,
//       cies: updatedCIEs,
//     }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     resetFieldErrors();

//     // Validate current CIE fields
//     let hasFieldErrors = false;

//     if (!currentCIE.type) {
//       setTypeError("Type of evaluation is required");
//       hasFieldErrors = true;
//     }

//     if (currentCIE.type !== "Course Prerequisites CIE") {
//       if (
//         currentCIE.type === "Practical CIE" ||
//         currentCIE.type === "Internal Practical"
//       ) {
//         if (
//           !currentCIE.practicals_covered ||
//           currentCIE.practicals_covered.length === 0
//         ) {
//           setUnitsCoveredError("Practicals covered is required");
//           hasFieldErrors = true;
//         }
//       } else {
//         if (
//           !currentCIE.units_covered ||
//           currentCIE.units_covered.length === 0
//         ) {
//           setUnitsCoveredError("Units covered is required");
//           hasFieldErrors = true;
//         }
//       }
//     }

//     if (!currentCIE.date) {
//       setDateError("Date is required");
//       hasFieldErrors = true;
//     }

//     if (!currentCIE.marks || currentCIE.marks < 1) {
//       setMarksError("Marks must be at least 1");
//       hasFieldErrors = true;
//     }

//     if (!currentCIE.duration || currentCIE.duration < 1) {
//       setDurationError("Duration must be at least 1 minute");
//       hasFieldErrors = true;
//     }

//     if (
//       !currentCIE.blooms_taxonomy ||
//       currentCIE.blooms_taxonomy.length === 0
//     ) {
//       setBloomsError("At least one Bloom's taxonomy level is required");
//       hasFieldErrors = true;
//     }

//     if (!currentCIE.evaluation_pedagogy) {
//       setPedagogyError("Evaluation pedagogy is required");
//       hasFieldErrors = true;
//     }

//     const requiresCOMapping = [
//       "Lecture CIE",
//       "Course Prerequisites CIE",
//       "Mid-term/Internal Exam",
//     ];
//     if (
//       requiresCOMapping.includes(currentCIE.type) &&
//       (!currentCIE.co_mapping || currentCIE.co_mapping.length === 0)
//     ) {
//       setCoMappingError(`CO mapping is required for ${currentCIE.type}`);
//       hasFieldErrors = true;
//     }

//     if (
//       !currentCIE.skill_mapping ||
//       currentCIE.skill_mapping.length === 0 ||
//       currentCIE.skill_mapping.some(
//         (skill: any) => !skill.skill || !skill.details
//       )
//     ) {
//       setSkillMappingError(
//         "All skill mappings must have both skill and details"
//       );
//       hasFieldErrors = true;
//     }

//     const { errors, warnings } = validateAllCIEs();

//     if (errors.length > 0 || hasFieldErrors) {
//       setValidationErrors(errors);
//       setValidationWarnings(warnings);
//       toast.error("Please fix validation errors before saving");
//       setSaving(false);
//       return;
//     }

//     if (warnings.length > 0) {
//       setValidationWarnings(warnings);
//     }

//     try {
//       const result = await saveCIEPlanningForm({
//         faculty_id: lessonPlan.faculty?.id || "",
//         subject_id: lessonPlan.subject?.id || "",
//         cies: lessonPlan.cies,
//         remarks: lessonPlan.cie_remarks,
//       });

//       if (result.success) {
//         toast.success("CIE details saved successfully");
//         setValidationErrors([]);
//         setValidationWarnings([]);

//         setLessonPlan((prev: any) => ({
//           ...prev,
//           cie_planning_completed: true,
//         }));
//       } else {
//         toast.error(result.error || "Failed to save CIE details");
//       }
//     } catch (error) {
//       console.error("Error saving CIE details:", error);
//       toast.error("An unexpected error occurred");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const currentCIEs = lessonPlan.cies || [];
//   const currentCIE = currentCIEs[activeCIE];

//   if (!currentCIE) {
//     return <div>Loading...</div>;
//   }

//   if (!currentCIE.skill_mapping || !Array.isArray(currentCIE.skill_mapping)) {
//     currentCIE.skill_mapping = [{ skill: "", details: "" }];
//   }

//   return (
//     <div className="p-6">
//       {/* Validation Errors */}
//       {validationErrors.length > 0 && (
//         <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-4">
//           <div className="flex items-start">
//             <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
//             <div className="text-red-800">
//               <ul className="list-disc list-inside space-y-1">
//                 {validationErrors.map((error, index) => (
//                   <li key={index}>{error}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Validation Warnings */}
//       {validationWarnings.length > 0 && (
//         <div className="mb-6 border border-amber-200 bg-amber-50 rounded-lg p-4">
//           <div className="flex items-start">
//             <Info className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
//             <div className="text-amber-800">
//               <ul className="list-disc list-inside space-y-1">
//                 {validationWarnings.map((warning, index) => (
//                   <li key={index}>{warning}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CIE Navigation */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex space-x-2 flex-wrap">
//           {currentCIEs.map((cie: any, index: number) => (
//             <Button
//               key={cie.id}
//               variant={activeCIE === index ? "default" : "outline"}
//               className={
//                 activeCIE === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""
//               }
//               onClick={() => setActiveCIE(index)}
//             >
//               CIE {index + 1}
//               {cie.type && (
//                 <Badge variant="secondary" className="ml-2 text-xs">
//                   {cie.type.split(" ")[0]}
//                 </Badge>
//               )}
//             </Button>
//           ))}
//           <Button variant="outline" onClick={addCIE}>
//             <Plus className="h-4 w-4 mr-1" />
//             Add CIE
//           </Button>
//         </div>
//         {currentCIEs.length > 1 && (
//           <Button
//             variant="ghost"
//             className="text-red-500 hover:text-red-700 hover:bg-red-50"
//             onClick={() => removeCIE(activeCIE)}
//           >
//             <Trash2 className="h-4 w-4 mr-1" />
//             Remove CIE
//           </Button>
//         )}
//       </div>

//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h3 className="text-xl font-semibold">CIE {activeCIE + 1}</h3>
//         </div>

//         {/* Type of Evaluation */}
//         <div className="grid grid-cols-2 gap-6">
//           <div>
//             <Label htmlFor="type-of-evaluation">Type of Evaluation *</Label>
//             <Select
//               value={currentCIE.type || ""}
//               onValueChange={(value) =>
//                 handleCIEChange(activeCIE, "type", value)
//               }
//             >
//               <SelectTrigger id="type-of-evaluation" className="mt-1">
//                 <SelectValue placeholder="Select Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 {cieTypeOptions.map((type) => (
//                   <SelectItem key={type} value={type}>
//                     {type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {typeError && (
//               <p className="text-red-500 text-xs mt-1">{typeError}</p>
//             )}
//           </div>

//           {/* Units/Practicals Covered */}
//           <div>
//             <Label htmlFor="units-covered">
//               {currentCIE.type === "Practical CIE" ||
//               currentCIE.type === "Internal Practical"
//                 ? "Practicals Covered *"
//                 : "Units Covered *"}
//             </Label>
//             <Select
//               value={
//                 currentCIE.type === "Course Prerequisites CIE" ? "disabled" : ""
//               }
//               disabled={currentCIE.type === "Course Prerequisites CIE"}
//               onValueChange={(value) => {
//                 if (
//                   currentCIE.type === "Practical CIE" ||
//                   currentCIE.type === "Internal Practical"
//                 ) {
//                   const currentPracticals = currentCIE.practicals_covered || [];
//                   const updatedPracticals = currentPracticals.includes(value)
//                     ? currentPracticals.filter((id) => id !== value)
//                     : [...currentPracticals, value];
//                   handleCIEChange(
//                     activeCIE,
//                     "practicals_covered",
//                     updatedPracticals
//                   );
//                 } else {
//                   const currentUnits = currentCIE.units_covered || [];
//                   const updatedUnits = currentUnits.includes(value)
//                     ? currentUnits.filter((id) => id !== value)
//                     : [...currentUnits, value];
//                   handleCIEChange(activeCIE, "units_covered", updatedUnits);
//                 }
//               }}
//             >
//               <SelectTrigger id="units-covered" className="mt-1">
//                 <SelectValue
//                   placeholder={
//                     currentCIE.type === "Course Prerequisites CIE"
//                       ? "N/A for Prerequisites CIE"
//                       : currentCIE.type === "Practical CIE" ||
//                         currentCIE.type === "Internal Practical"
//                       ? `${
//                           (currentCIE.practicals_covered || []).length
//                         } practical(s) selected`
//                       : `${
//                           (currentCIE.units_covered || []).length
//                         } unit(s) selected`
//                   }
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 {currentCIE.type === "Practical CIE" ||
//                 currentCIE.type === "Internal Practical"
//                   ? lessonPlan.practicals?.map(
//                       (practical: any, index: number) => (
//                         <SelectItem
//                           key={practical.id || `practical-${index}`}
//                           value={practical.id || `practical-${index}`}
//                         >
//                           <div className="flex items-center space-x-2">
//                             <input
//                               type="checkbox"
//                               checked={(
//                                 currentCIE.practicals_covered || []
//                               ).includes(practical.id || `practical-${index}`)}
//                               onChange={() => {}}
//                               className="mr-2"
//                             />
//                             Practical {index + 1}:{" "}
//                             {practical.practical_aim || "No aim specified"}
//                           </div>
//                         </SelectItem>
//                       )
//                     )
//                   : lessonPlan.units?.map((unit: any, index: number) => (
//                       <SelectItem
//                         key={unit.id || `unit-${index}`}
//                         value={unit.id || `unit-${index}`}
//                       >
//                         <div className="flex items-center space-x-2">
//                           <input
//                             type="checkbox"
//                             checked={(currentCIE.units_covered || []).includes(
//                               unit.id || `unit-${index}`
//                             )}
//                             onChange={() => {}}
//                             className="mr-2"
//                           />
//                           Unit {index + 1}:{" "}
//                           {unit.unit_name || "No name specified"}
//                         </div>
//                       </SelectItem>
//                     ))}
//               </SelectContent>
//             </Select>
//             {unitsCoveredError && (
//               <p className="text-red-500 text-xs mt-1">{unitsCoveredError}</p>
//             )}

//             {/* Display selected items */}
//             {currentCIE.type === "Practical CIE" ||
//             currentCIE.type === "Internal Practical"
//               ? currentCIE.practicals_covered &&
//                 currentCIE.practicals_covered.length > 0 && (
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {currentCIE.practicals_covered.map(
//                       (practicalId: string) => {
//                         const practical = lessonPlan.practicals?.find(
//                           (p: any) => p.id === practicalId
//                         );
//                         const practicalIndex = lessonPlan.practicals?.findIndex(
//                           (p: any) => p.id === practicalId
//                         );
//                         return (
//                           <Badge
//                             key={practicalId}
//                             variant="secondary"
//                             className="text-xs"
//                           >
//                             Practical {(practicalIndex || 0) + 1}:{" "}
//                             {practical?.practical_aim || "Unknown"}
//                             <button
//                               onClick={() => {
//                                 const updated =
//                                   currentCIE.practicals_covered.filter(
//                                     (id: string) => id !== practicalId
//                                   );
//                                 handleCIEChange(
//                                   activeCIE,
//                                   "practicals_covered",
//                                   updated
//                                 );
//                               }}
//                               className="ml-1 text-red-500 hover:text-red-700"
//                             >
//                               ×
//                             </button>
//                           </Badge>
//                         );
//                       }
//                     )}
//                   </div>
//                 )
//               : currentCIE.units_covered &&
//                 currentCIE.units_covered.length > 0 && (
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {currentCIE.units_covered.map((unitId: string) => {
//                       const unit = lessonPlan.units?.find(
//                         (u: any) => u.id === unitId
//                       );
//                       const unitIndex = lessonPlan.units?.findIndex(
//                         (u: any) => u.id === unitId
//                       );
//                       return (
//                         <Badge
//                           key={unitId}
//                           variant="secondary"
//                           className="text-xs"
//                         >
//                           Unit {(unitIndex || 0) + 1}:{" "}
//                           {unit?.unit_name || "Unknown"}
//                           <button
//                             onClick={() => {
//                               const updated = currentCIE.units_covered.filter(
//                                 (id: string) => id !== unitId
//                               );
//                               handleCIEChange(
//                                 activeCIE,
//                                 "units_covered",
//                                 updated
//                               );
//                             }}
//                             className="ml-1 text-red-500 hover:text-red-700"
//                           >
//                             ×
//                           </button>
//                         </Badge>
//                       );
//                     })}
//                   </div>
//                 )}
//           </div>
//         </div>

//         {/* Date, Marks, Duration */}
//         <div className="grid grid-cols-3 gap-6">
//           <div>
//             <Label htmlFor="date">Date *</Label>
//             <Input
//               id="date"
//               type="date"
//               value={currentCIE.date || ""}
//               onChange={(e) =>
//                 handleCIEChange(activeCIE, "date", e.target.value)
//               }
//               className="mt-1"
//             />
//             {dateError && (
//               <p className="text-red-500 text-xs mt-1">{dateError}</p>
//             )}
//             {currentCIE.type === "Course Prerequisites CIE" && (
//               <p className="text-xs text-amber-600 mt-1">
//                 Must be within 10 days of term start date
//               </p>
//             )}
//           </div>
//           <div>
//             <Label htmlFor="marks">Marks *</Label>
//             <Input
//               id="marks"
//               type="number"
//               min="1"
//               value={currentCIE.marks || ""}
//               onChange={(e) =>
//                 handleCIEChange(activeCIE, "marks", Number(e.target.value))
//               }
//               className="mt-1"
//             />
//             {marksError && (
//               <p className="text-red-500 text-xs mt-1">{marksError}</p>
//             )}
//           </div>
//           <div>
//             <Label htmlFor="duration">Duration (minutes) *</Label>
//             <Input
//               id="duration"
//               type="number"
//               min="1"
//               value={currentCIE.duration || ""}
//               onChange={(e) =>
//                 handleCIEChange(activeCIE, "duration", Number(e.target.value))
//               }
//               className="mt-1"
//             />
//             {durationError && (
//               <p className="text-red-500 text-xs mt-1">{durationError}</p>
//             )}
//             <p className="text-xs text-gray-500 mt-1">
//               Auto-calculated based on marks and Bloom's levels
//             </p>
//           </div>
//         </div>

//         {/* Bloom's Taxonomy */}
//         <div>
//           <Label>
//             Bloom's Taxonomy *
//             <span className="text-xs text-amber-600 ml-1">
//               (Remember max once, Understand max twice across all CIEs)
//             </span>
//           </Label>
//           <div className="grid grid-cols-3 gap-4 mt-2">
//             {bloomsTaxonomyOptions.map((level) => {
//               const semester = lessonPlan.subject?.semester || 1;
//               const isDisabled = semester > 2 && level === "Remember";

//               // Count usage of this level across all CIEs
//               const levelUsage = currentCIEs
//                 .filter((cie: any, i: number) => i !== activeCIE)
//                 .flatMap((cie: any) => cie.blooms_taxonomy || [])
//                 .filter((bloom: string) => bloom === level).length;

//               const isRememberDisabled =
//                 level === "Remember" && levelUsage >= 1;
//               const isUnderstandDisabled =
//                 level === "Understand" && levelUsage >= 2;

//               const finalDisabled =
//                 isDisabled || isRememberDisabled || isUnderstandDisabled;

//               return (
//                 <div key={level} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`bloom-${level}`}
//                     checked={
//                       currentCIE.blooms_taxonomy?.includes(level) || false
//                     }
//                     disabled={finalDisabled}
//                     onCheckedChange={(checked) => {
//                       const current = currentCIE.blooms_taxonomy || [];
//                       const updated = checked
//                         ? [...current, level]
//                         : current.filter((l: string) => l !== level);
//                       handleCIEChange(activeCIE, "blooms_taxonomy", updated);
//                     }}
//                   />
//                   <Label
//                     htmlFor={`bloom-${level}`}
//                     className={finalDisabled ? "text-gray-400" : ""}
//                     title={
//                       isRememberDisabled
//                         ? "Remember can be used maximum once across all CIEs"
//                         : isUnderstandDisabled
//                         ? "Understand can be used maximum twice across all CIEs"
//                         : ""
//                     }
//                   >
//                     {level}
//                     {level === "Remember" && (
//                       <span className="text-xs text-amber-600 ml-1">
//                         (max 1)
//                       </span>
//                     )}
//                     {level === "Understand" && (
//                       <span className="text-xs text-amber-600 ml-1">
//                         (max 2)
//                       </span>
//                     )}
//                   </Label>
//                 </div>
//               );
//             })}
//           </div>
//           {bloomsError && (
//             <p className="text-red-500 text-xs mt-1">{bloomsError}</p>
//           )}
//           {lessonPlan.subject?.semester > 2 && (
//             <p className="text-xs text-amber-600 mt-2">
//               'Remember' level is disabled for semester{" "}
//               {lessonPlan.subject.semester}
//             </p>
//           )}
//         </div>

//         {/* Evaluation Pedagogy */}
//         <div>
//           <Label htmlFor="evaluation-pedagogy">Evaluation Pedagogy *</Label>
//           <Select
//             value={currentCIE.evaluation_pedagogy || ""}
//             onValueChange={(value) =>
//               handleCIEChange(activeCIE, "evaluation_pedagogy", value)
//             }
//           >
//             <SelectTrigger id="evaluation-pedagogy" className="mt-1">
//               <SelectValue placeholder="Select Evaluation Pedagogy" />
//             </SelectTrigger>
//             <SelectContent>
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700">
//                 Traditional Pedagogy
//               </div>
//               {evaluationPedagogyOptions.traditional.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">
//                 Alternative Pedagogy
//               </div>
//               {evaluationPedagogyOptions.alternative.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                   {pedagogy === "Open Book Assessment" && (
//                     <span className="text-xs text-amber-600 ml-1">
//                       (only Analyze, Evaluate, Create levels)
//                     </span>
//                   )}
//                 </SelectItem>
//               ))}
//               <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">
//                 Other
//               </div>
//               {evaluationPedagogyOptions.other.map((pedagogy) => (
//                 <SelectItem key={pedagogy} value={pedagogy}>
//                   {pedagogy}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           {pedagogyError && (
//             <p className="text-red-500 text-xs mt-1">{pedagogyError}</p>
//           )}
//           {currentCIE.evaluation_pedagogy === "Open Book Assessment" && (
//             <p className="text-xs text-amber-600 mt-1">
//               Open Book Assessment only allows Analyze, Evaluate, and Create
//               levels
//             </p>
//           )}

//           {currentCIE.evaluation_pedagogy === "Other" && (
//             <div className="mt-2">
//               <Label htmlFor="other-pedagogy">Specify Other Pedagogy</Label>
//               <Input
//                 id="other-pedagogy"
//                 value={currentCIE.other_pedagogy || ""}
//                 onChange={(e) =>
//                   handleCIEChange(activeCIE, "other_pedagogy", e.target.value)
//                 }
//                 placeholder="Enter custom pedagogy"
//                 className="mt-1"
//               />
//             </div>
//           )}
//         </div>

//         {/* CO, PSO, PEO Mapping */}
//         <div className="grid grid-cols-3 gap-6">
//           <div>
//             <Label>
//               CO Mapping{" "}
//               {[
//                 "Lecture CIE",
//                 "Course Prerequisites CIE",
//                 "Mid-term/Internal Exam",
//               ].includes(currentCIE.type)
//                 ? "*"
//                 : "(Optional)"}
//               {[
//                 "Lecture CIE",
//                 "Course Prerequisites CIE",
//                 "Mid-term/Internal Exam",
//               ].includes(currentCIE.type) && (
//                 <span className="text-xs text-amber-600 ml-1">
//                   (All COs must be covered across Lecture CIEs + Course
//                   Prerequisites CIEs + Mid-term/Internal Exams)
//                 </span>
//               )}
//             </Label>
//             <div className="grid grid-cols-2 gap-2 mt-2">
//               {lessonPlan.courseOutcomes?.map((co: any, index: number) => (
//                 <div key={co.id} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={`co-${co.id}`}
//                     checked={currentCIE.co_mapping?.includes(co.id) || false}
//                     onCheckedChange={(checked) => {
//                       const current = currentCIE.co_mapping || [];
//                       const updated = checked
//                         ? [...current, co.id]
//                         : current.filter((id: string) => id !== co.id);
//                       handleCIEChange(activeCIE, "co_mapping", updated);
//                     }}
//                   />
//                   <Label htmlFor={`co-${co.id}`} className="text-sm">
//                     CO{index + 1}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//             {coMappingError && (
//               <p className="text-red-500 text-xs mt-1">{coMappingError}</p>
//             )}
//           </div>

//           <div>
//             <Label>PSO Mapping (Optional)</Label>
//             {loadingPsoPeo ? (
//               <p className="text-sm text-gray-500 mt-2">Loading PSO data...</p>
//             ) : departmentPsoPeo.pso_data.length > 0 ? (
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 {departmentPsoPeo.pso_data.map((pso, index) => (
//                   <div key={pso.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={`pso-${pso.id}`}
//                       checked={
//                         currentCIE.pso_mapping?.includes(pso.id) || false
//                       }
//                       onCheckedChange={(checked) => {
//                         const current = currentCIE.pso_mapping || [];
//                         const updated = checked
//                           ? [...current, pso.id]
//                           : current.filter((p: string) => p !== pso.id);
//                         handleCIEChange(activeCIE, "pso_mapping", updated);
//                       }}
//                     />
//                     <Label
//                       htmlFor={`pso-${pso.id}`}
//                       className="text-sm"
//                       title={pso.description}
//                     >
//                       {pso.label || `PSO${index + 1}`}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mt-2">
//                 No PSO data configured for this department. Please contact your
//                 HOD to set up PSO/PEO data.
//               </p>
//             )}
//           </div>

//           <div>
//             <Label>PEO Mapping (Optional)</Label>
//             {loadingPsoPeo ? (
//               <p className="text-sm text-gray-500 mt-2">Loading PEO data...</p>
//             ) : departmentPsoPeo.peo_data.length > 0 ? (
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 {departmentPsoPeo.peo_data.map((peo, index) => (
//                   <div key={peo.id} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={`peo-${peo.id}`}
//                       checked={
//                         currentCIE.peo_mapping?.includes(peo.id) || false
//                       }
//                       onCheckedChange={(checked) => {
//                         const current = currentCIE.peo_mapping || [];
//                         const updated = checked
//                           ? [...current, peo.id]
//                           : current.filter((p: string) => p !== peo.id);
//                         handleCIEChange(activeCIE, "peo_mapping", updated);
//                       }}
//                     />
//                     <Label
//                       htmlFor={`peo-${peo.id}`}
//                       className="text-sm"
//                       title={peo.description}
//                     >
//                       {peo.label || `PEO${index + 1}`}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500 mt-2">
//                 No PEO data configured for this department. Please contact your
//                 HOD to set up PSO/PEO data.
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Skill Mapping */}
//         <div>
//           <div className="flex items-center justify-between mb-3">
//             <Label>Skill Mapping *</Label>
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               onClick={() => addSkillMapping(activeCIE)}
//             >
//               <Plus className="h-4 w-4 mr-1" />
//               Add Skill
//             </Button>
//           </div>

//           <div className="space-y-4">
//             {currentCIE.skill_mapping?.map(
//               (skillMap: any, skillIndex: number) => (
//                 <Card key={skillIndex} className="p-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor={`skill-${skillIndex}`}>Skill</Label>
//                       <Select
//                         value={skillMap.skill || ""}
//                         onValueChange={(value) =>
//                           handleSkillMappingChange(
//                             activeCIE,
//                             skillIndex,
//                             "skill",
//                             value
//                           )
//                         }
//                       >
//                         <SelectTrigger
//                           id={`skill-${skillIndex}`}
//                           className="mt-1"
//                         >
//                           <SelectValue placeholder="Select Skill" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {skillMappingOptions.map((skill) => (
//                             <SelectItem key={skill} value={skill}>
//                               {skill}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div>
//                       <Label htmlFor={`skill-details-${skillIndex}`}>
//                         Details
//                       </Label>
//                       <Textarea
//                         id={`skill-details-${skillIndex}`}
//                         value={skillMap.details || ""}
//                         onChange={(e) =>
//                           handleSkillMappingChange(
//                             activeCIE,
//                             skillIndex,
//                             "details",
//                             e.target.value
//                           )
//                         }
//                         placeholder="Skills should be mentioned in measurable terms"
//                         className="mt-1"
//                         rows={3}
//                       />
//                     </div>
//                   </div>

//                   {currentCIE.skill_mapping.length > 1 && (
//                     <div className="flex justify-end mt-3">
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700"
//                         onClick={() =>
//                           removeSkillMapping(activeCIE, skillIndex)
//                         }
//                       >
//                         <Trash2 className="h-4 w-4 mr-1" />
//                         Remove
//                       </Button>
//                     </div>
//                   )}
//                 </Card>
//               )
//             )}
//           </div>
//           {skillMappingError && (
//             <p className="text-red-500 text-xs mt-1">{skillMappingError}</p>
//           )}
//         </div>

//         {/* Remarks */}
//         <div>
//           <Label htmlFor="cie-remarks">Remarks (Optional)</Label>
//           <Textarea
//             id="cie-remarks"
//             value={lessonPlan.cie_remarks || ""}
//             onChange={(e) =>
//               setLessonPlan((prev: any) => ({
//                 ...prev,
//                 cie_remarks: e.target.value,
//               }))
//             }
//             placeholder="Enter any additional remarks for all CIEs"
//             className="mt-1"
//             rows={3}
//           />
//         </div>

//         {/* Save Button */}
//         <div className="flex justify-end pt-6 border-t">
//           <Button
//             onClick={handleSave}
//             className="bg-[#1A5CA1] hover:bg-[#154A80]"
//             disabled={saving}
//           >
//             {saving ? "Saving..." : "Save CIE Details"}
//           </Button>
//         </div>
//       </div>

//       {/* Warning Dialog */}
//       <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Warning</DialogTitle>
//             <DialogDescription>{currentWarning}</DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setWarningDialogOpen(false)}
//             >
//               OK
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/utils/supabase/client";
import { saveCIEPlanningForm } from "@/app/dashboard/actions/saveCIEPlanningForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PSOPEOItem {
  id: string;
  label?: string;
  description: string;
}

interface CIEPlanningFormProps {
  lessonPlan: any;
  setLessonPlan: React.Dispatch<React.SetStateAction<any>>;
}

// CIE Type Options
const cieTypeOptions = [
  "Lecture CIE",
  "Course Prerequisites CIE",
  "Mid-term/Internal Exam",
  "Practical CIE",
  "Internal Practical",
];

// Evaluation Pedagogy Options
const evaluationPedagogyOptions = {
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
};

// Bloom's Taxonomy Options
const bloomsTaxonomyOptions = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

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

export default function CIEPlanningForm({
  lessonPlan,
  setLessonPlan,
}: CIEPlanningFormProps) {
  const [activeCIE, setActiveCIE] = useState(0);
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
  const [saving, setSaving] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [currentWarning, setCurrentWarning] = useState("");

  // Field-specific error states
  const [typeError, setTypeError] = useState("");
  const [unitsCoveredError, setUnitsCoveredError] = useState("");
  const [dateError, setDateError] = useState("");
  const [marksError, setMarksError] = useState("");
  const [durationError, setDurationError] = useState("");
  const [bloomsError, setBloomsError] = useState("");
  const [pedagogyError, setPedagogyError] = useState("");
  const [coMappingError, setCoMappingError] = useState("");
  const [skillMappingError, setSkillMappingError] = useState("");

  // Initialize CIEs if empty
  useEffect(() => {
    if (!lessonPlan.cies || lessonPlan.cies.length === 0) {
      const initialCIE = {
        id: "cie1",
        type: "",
        units_covered: [],
        practicals_covered: [],
        date: "",
        marks: 50,
        duration: 45,
        blooms_taxonomy: [],
        evaluation_pedagogy: "",
        other_pedagogy: "",
        co_mapping: [],
        pso_mapping: [],
        peo_mapping: [],
        skill_mapping: [{ skill: "", details: "" }],
      };

      setLessonPlan((prev: any) => ({
        ...prev,
        cies: [initialCIE],
      }));
    }
  }, [lessonPlan?.cies, setLessonPlan]);

  // Load PSO/PEO data
  useEffect(() => {
    const loadPsoPeoData = async () => {
      if (lessonPlan.subject?.id) {
        setLoadingPsoPeo(true);
        try {
          const { data: subjectData, error: subjectError } = await supabase
            .from("subjects")
            .select("pso, peo, department_id")
            .eq("id", lessonPlan.subject.id)
            .single();

          if (subjectError) {
            console.error("Error fetching subject PSO/PEO data:", subjectError);
            return;
          }

          let psoData: PSOPEOItem[] = [];
          let peoData: PSOPEOItem[] = [];

          if (subjectData?.pso?.items && subjectData.pso.items.length > 0) {
            psoData = subjectData.pso.items;
          }
          if (subjectData?.peo?.items && subjectData.peo.items.length > 0) {
            peoData = subjectData.peo.items;
          }

          if (psoData.length === 0 || peoData.length === 0) {
            const { data: departmentSubjects, error: deptError } =
              await supabase
                .from("subjects")
                .select("pso, peo")
                .eq("department_id", subjectData.department_id)
                .not("pso", "is", null)
                .not("peo", "is", null)
                .limit(1);

            if (
              !deptError &&
              departmentSubjects &&
              departmentSubjects.length > 0
            ) {
              const deptSubject = departmentSubjects[0];
              if (psoData.length === 0 && deptSubject.pso?.items) {
                psoData = deptSubject.pso.items;
              }
              if (peoData.length === 0 && deptSubject.peo?.items) {
                peoData = deptSubject.peo.items;
              }
            }
          }

          setDepartmentPsoPeo({
            pso_data: psoData,
            peo_data: peoData,
          });
        } catch (error) {
          console.error("Error loading PSO/PEO data:", error);
          setDepartmentPsoPeo({
            pso_data: [],
            peo_data: [],
          });
        } finally {
          setLoadingPsoPeo(false);
        }
      }
    };

    loadPsoPeoData();
  }, [lessonPlan.subject?.id]);

  const handleCIEChange = (index: number, field: string, value: any) => {
    const updatedCIEs = [...(lessonPlan.cies || [])];
    updatedCIEs[index] = {
      ...updatedCIEs[index],
      [field]: value,
    };

    // Auto-calculate duration based on marks and bloom's taxonomy
    if (field === "marks" || field === "blooms_taxonomy") {
      const marks = field === "marks" ? value : updatedCIEs[index].marks;
      const blooms =
        field === "blooms_taxonomy"
          ? value
          : updatedCIEs[index].blooms_taxonomy;

      const calculatedDuration = calculateMinimumDuration(marks, blooms);
      if (calculatedDuration > updatedCIEs[index].duration) {
        updatedCIEs[index].duration = calculatedDuration;
      }
    }

    // Clear units/practicals based on CIE type
    if (field === "type") {
      if (value === "Course Prerequisites CIE") {
        updatedCIEs[index].units_covered = [];
        updatedCIEs[index].practicals_covered = [];
      } else if (value === "Practical CIE" || value === "Internal Practical") {
        updatedCIEs[index].units_covered = [];
      } else {
        updatedCIEs[index].practicals_covered = [];
      }
    }

    // VALIDATION 4: Check for Bloom's taxonomy warnings when selecting bloom's levels (THEORY CIEs ONLY)
    if (field === "blooms_taxonomy" && value.length > 0) {
      const theoryCIETypes = [
        "Lecture CIE",
        "Course Prerequisites CIE",
        "Mid-term/Internal Exam",
      ];
      if (theoryCIETypes.includes(updatedCIEs[index].type)) {
        const hasRememberOrUnderstand = value.some((level: string) =>
          ["Remember", "Understand"].includes(level)
        );
        const currentUnits = updatedCIEs[index].units_covered || [];

        if (hasRememberOrUnderstand && currentUnits.length > 0) {
          const units = lessonPlan.units || [];
          const selectedUnits = currentUnits.map((unitId: string) => {
            const unitIndex = units.findIndex((u: any) => u.id === unitId);
            return { id: unitId, index: unitIndex };
          });

          // Check if any selected unit is not first or last
          const hasMiddleChapter = selectedUnits.some((unit: any) => {
            const unitIndex = unit.index;
            const totalUnits = units.length;
            return unitIndex > 0 && unitIndex < totalUnits - 1; // Not first or last unit
          });

          if (hasMiddleChapter) {
            const warning =
              "You should avoid Remember & Understand bloom's taxonomy except first and last chapter.";
            setCurrentWarning(warning);
            setWarningDialogOpen(true);
          }
        }
      }
    }

    // VALIDATION 4: Check for Bloom's taxonomy warnings when selecting units (THEORY CIEs ONLY)
    if (field === "units_covered" && value.length > 0) {
      const theoryCIETypes = [
        "Lecture CIE",
        "Course Prerequisites CIE",
        "Mid-term/Internal Exam",
      ];
      if (theoryCIETypes.includes(updatedCIEs[index].type)) {
        const currentBlooms = updatedCIEs[index].blooms_taxonomy || [];
        const hasRememberOrUnderstand = currentBlooms.some((level: string) =>
          ["Remember", "Understand"].includes(level)
        );

        if (hasRememberOrUnderstand) {
          const units = lessonPlan.units || [];
          const selectedUnits = value.map((unitId: string) => {
            const unitIndex = units.findIndex((u: any) => u.id === unitId);
            return { id: unitId, index: unitIndex };
          });

          // Check if any selected unit is not first or last
          const hasMiddleChapter = selectedUnits.some((unit: any) => {
            const unitIndex = unit.index;
            const totalUnits = units.length;
            return unitIndex > 0 && unitIndex < totalUnits - 1; // Not first or last unit
          });

          if (hasMiddleChapter) {
            const warning =
              "You should avoid Remember & Understand bloom's taxonomy except first and last chapter.";
            setCurrentWarning(warning);
            setWarningDialogOpen(true);
          }
        }
      }
    }

    // VALIDATION 5: Check for Bloom's taxonomy restrictions when selecting Open Book Assessment
    if (field === "evaluation_pedagogy" && value === "Open Book Assessment") {
      const currentBlooms = updatedCIEs[index].blooms_taxonomy || [];
      const allowedBlooms = ["Analyze", "Evaluate", "Create"];
      const filteredBlooms = currentBlooms.filter((bloom: string) =>
        allowedBlooms.includes(bloom)
      );

      if (filteredBlooms.length !== currentBlooms.length) {
        updatedCIEs[index].blooms_taxonomy = filteredBlooms;
        toast.warning(
          "For Open Book Assessment, only Analyze, Evaluate, and Create levels are allowed. Other levels have been removed."
        );
      }
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      cies: updatedCIEs,
    }));

    validateCIE(updatedCIEs[index], index);
  };

  const calculateMinimumDuration = (
    marks: number,
    bloomsLevels: string[]
  ): number => {
    if (!marks || !bloomsLevels || bloomsLevels.length === 0) return 0;

    const hasHigherOrder = bloomsLevels.some((level) =>
      ["Analyze", "Evaluate", "Create"].includes(level)
    );
    const hasOnlyLowerOrder = bloomsLevels.every((level) =>
      ["Remember", "Understand"].includes(level)
    );

    let duration = 0;

    if (hasOnlyLowerOrder) {
      duration = marks * 2; // 1 mark = 2 minutes
    } else {
      duration = marks * 3; // 1 mark = 3 minutes
    }

    // Minimum 30 minutes for higher order thinking
    if (hasHigherOrder && duration < 30) {
      duration = 30;
    }

    return duration;
  };

  const validateCIE = (cie: any, index: number) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // VALIDATION 3: Validate Bloom's taxonomy based on semester
    const semester = lessonPlan.subject?.semester || 1;
    if (semester > 2 && cie.blooms_taxonomy?.includes("Remember")) {
      errors.push(
        `CIE ${
          index + 1
        }: 'Remember' level not allowed for semester ${semester}`
      );
    }

    // Validate duration for practical CIEs
    if (
      (cie.type === "Practical CIE" || cie.type === "Internal Practical") &&
      cie.duration < 120
    ) {
      errors.push(
        `CIE ${index + 1}: Practical CIE must be minimum 2 hours (120 minutes)`
      );
    }

    // Validate Mid-term duration
    if (cie.type === "Mid-term/Internal Exam" && cie.duration <= 60) {
      errors.push(
        `CIE ${
          index + 1
        }: Warning - Mid-term exam duration should be more than 60 minutes`
      );
    }

    // VALIDATION 5: Validate Open Book Assessment
    if (cie.evaluation_pedagogy === "Open Book Assessment") {
      const allowedBlooms = ["Analyze", "Evaluate", "Create"];
      const hasInvalidBlooms = cie.blooms_taxonomy?.some(
        (bloom: string) => !allowedBlooms.includes(bloom)
      );
      if (hasInvalidBlooms) {
        errors.push(
          `CIE ${
            index + 1
          }: Open Book Assessment only allows Analyze, Evaluate, and Create levels`
        );
      }
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);
  };

  const validateAllCIEs = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const currentCIEs = lessonPlan.cies || [];

    // VALIDATION 1: Date gap validation (must not exceed Course Term End Date)
    const sortedCIEs = [...currentCIEs]
      .filter((cie) => cie.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (lessonPlan.term_end_date) {
      const termEndDate = new Date(lessonPlan.term_end_date);
      sortedCIEs.forEach((cie, index) => {
        const cieDate = new Date(cie.date);
        if (cieDate > termEndDate) {
          errors.push(
            `CIE ${index + 1} date (${
              cie.date
            }) cannot exceed the Course Term End Date (${
              lessonPlan.term_end_date
            })`
          );
        }
      });
    }

    // Minimum 7 days gap between consecutive CIEs
    for (let i = 1; i < sortedCIEs.length; i++) {
      const prevDate = new Date(sortedCIEs[i - 1].date);
      const currDate = new Date(sortedCIEs[i].date);
      const daysDiff = Math.abs(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff < 7) {
        errors.push(`CIE dates must be at least 7 days apart`);
      }
    }

    // VALIDATION 2: Check that at least one of each CIE type is present
    const cieTypes = currentCIEs.map((cie: any) => cie.type).filter(Boolean);
    const allRequiredTypes = [
      "Lecture CIE",
      "Course Prerequisites CIE",
      "Mid-term/Internal Exam",
      "Practical CIE",
      "Internal Practical",
    ];

    let hasAtLeastOne = false;
    allRequiredTypes.forEach((type) => {
      if (cieTypes.includes(type)) {
        hasAtLeastOne = true;
      }
    });

    if (!hasAtLeastOne) {
      errors.push("At least one CIE from the available types must be present");
    }

    // VALIDATION 6: Total duration validation (n credit = n - 1 hours) - ONLY FOR THEORY CIEs
    const totalCredits = lessonPlan.subject?.credits || 0;
    const requiredMinimumHours = Math.max(0, totalCredits - 1); // n - 1 hours

    const theoryCIETypes = [
      "Lecture CIE",
      "Course Prerequisites CIE",
      "Mid-term/Internal Exam",
    ];
    const theoryCIEs = currentCIEs.filter((cie: any) =>
      theoryCIETypes.includes(cie.type)
    );
    const totalTheoryDurationHours =
      theoryCIEs.reduce((sum, cie) => sum + (cie.duration || 0), 0) / 60;

    if (totalTheoryDurationHours < requiredMinimumHours) {
      errors.push(
        `Total Theory CIE duration must be at least ${requiredMinimumHours} hours (currently ${totalTheoryDurationHours.toFixed(
          1
        )} hours). Practical CIEs are not counted in this validation.`
      );
    }

    // VALIDATION 7: Pedagogy usage validation
    const traditionalPedagogies = evaluationPedagogyOptions.traditional;
    const alternativePedagogies = evaluationPedagogyOptions.alternative;

    const allPedagogies = currentCIEs
      .map((cie: any) => cie.evaluation_pedagogy)
      .filter(Boolean);
    const usedTraditional = allPedagogies.filter((pedagogy: string) =>
      traditionalPedagogies.includes(pedagogy)
    );
    const usedAlternative = allPedagogies.filter((pedagogy: string) =>
      alternativePedagogies.includes(pedagogy)
    );

    // At least one traditional pedagogy is required
    if (usedTraditional.length === 0) {
      errors.push("At least one traditional pedagogy method must be used");
    }

    // Traditional pedagogy should be unique across all CIEs
    const uniqueTraditional = new Set(usedTraditional);
    if (usedTraditional.length !== uniqueTraditional.size) {
      errors.push(
        "Each traditional pedagogy method must be used only once across all CIEs"
      );
    }

    // VALIDATION 8: At least one alternative pedagogy is required
    if (usedAlternative.length === 0) {
      errors.push("At least one alternative pedagogy is required");
    }

    // Validate Course Prerequisites CIE date (must be within 10 days of term start)
    // Replace the existing Course Prerequisites CIE validation logic with this:

    // Validate Course Prerequisites CIE date (must be within 10 days of term start)
    // Replace the error message construction in validateAllCIEs function with this:

    // Validate Course Prerequisites CIE date (must be within 10 days of term start)
    const prereqCIE = currentCIEs.find(
      (cie: any) => cie.type === "Course Prerequisites CIE"
    );
    if (prereqCIE && prereqCIE.date && lessonPlan.term_start_date) {
      // Helper function to convert date to YYYY-MM-DD format
      const convertToStandardDate = (dateStr: string): string => {
        // If already in YYYY-MM-DD format
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateStr;
        }

        // If in DD-MM-YYYY format
        if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
          const [day, month, year] = dateStr.split("-");
          return `${year}-${month}-${day}`;
        }

        // If in DD/MM/YYYY format
        if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [day, month, year] = dateStr.split("/");
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        return dateStr;
      };

      // Format dates for display in error messages
      const formatDateForDisplay = (dateStr: string): string => {
        // Try to create a date object
        try {
          if (typeof dateStr === "object") {
            // If it's already a Date object
            return dateStr.toLocaleDateString();
          }

          // If it's a string that might be a date
          if (dateStr.includes("T")) {
            // Handle ISO format
            return new Date(dateStr).toLocaleDateString();
          }

          // Return the original string for DD-MM-YYYY format
          if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
            return dateStr;
          }

          // For other formats, try to parse and format
          const date = new Date(convertToStandardDate(dateStr));
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          console.error("Error formatting date:", e);
        }

        // Fallback to original string
        return dateStr;
      };

      const termStartFormatted = convertToStandardDate(
        lessonPlan.term_start_date
      );
      const prereqDateFormatted = convertToStandardDate(prereqCIE.date);

      const termStart = new Date(termStartFormatted);
      const prereqDate = new Date(prereqDateFormatted);

      // Calculate difference in days
      const timeDiff = prereqDate.getTime() - termStart.getTime();
      const daysDiff = Math.abs(timeDiff / (1000 * 60 * 60 * 24));

      console.log("Date validation debug:", {
        termStartOriginal: lessonPlan.term_start_date,
        prereqDateOriginal: prereqCIE.date,
        termStartFormatted,
        prereqDateFormatted,
        daysDiff,
      });

      if (daysDiff > 10) {
        // Use the formatDateForDisplay function to ensure clean date display in error message
        const termStartDisplay = formatDateForDisplay(
          lessonPlan.term_start_date
        );
        errors.push(
          `Course Prerequisites CIE must be conducted within 10 days of term start date (${termStartDisplay})`
        );
      }
    }

    // VALIDATION 9: CO coverage across Lecture CIEs + Course Prerequisites CIEs + Mid-term/Internal Exams
    const relevantCIETypes = [
      "Lecture CIE",
      "Course Prerequisites CIE",
      "Mid-term/Internal Exam",
    ];
    const relevantCIEs = currentCIEs.filter((cie: any) =>
      relevantCIETypes.includes(cie.type)
    );

    if (relevantCIEs.length > 0) {
      const allCOMappings = new Set();

      relevantCIEs.forEach((cie: any) => {
        if (cie.co_mapping && Array.isArray(cie.co_mapping)) {
          cie.co_mapping.forEach((coId: string) => allCOMappings.add(coId));
        }
      });

      const totalCOs = lessonPlan.courseOutcomes?.length || 0;
      if (totalCOs > 0 && allCOMappings.size < totalCOs) {
        const coveredCOs = Array.from(allCOMappings);
        const allCOIds =
          lessonPlan.courseOutcomes?.map((co: any) => co.id) || [];
        const missingCOs = allCOIds.filter(
          (coId: string) => !coveredCOs.includes(coId)
        );

        errors.push(
          `All COs must be covered across Lecture CIEs + Course Prerequisites CIEs + Mid-term/Internal Exams. Missing COs: ${missingCOs
            .map((coId: string) => {
              const coIndex = lessonPlan.courseOutcomes?.findIndex(
                (co: any) => co.id === coId
              );
              return `CO${(coIndex || 0) + 1}`;
            })
            .join(", ")}`
        );
      }
    }

    // VALIDATION 3: Validate Bloom's taxonomy usage limits
    const allBloomsUsage = currentCIEs.flatMap(
      (cie: any) => cie.blooms_taxonomy || []
    );
    const rememberCount = allBloomsUsage.filter(
      (bloom: string) => bloom === "Remember"
    ).length;
    const understandCount = allBloomsUsage.filter(
      (bloom: string) => bloom === "Understand"
    ).length;

    if (rememberCount > 1) {
      errors.push(
        "'Remember' bloom's taxonomy can be used maximum once across all CIEs"
      );
    }

    if (understandCount > 2) {
      errors.push(
        "'Understand' bloom's taxonomy can be used maximum twice across all CIEs"
      );
    }

    // VALIDATION 3: Check if all CIEs have the same Bloom's taxonomy
    const allBloomsCombinations = currentCIEs
      .map((cie: any) => (cie.blooms_taxonomy || []).sort().join(","))
      .filter(Boolean);

    const uniqueBloomsCombinations = new Set(allBloomsCombinations);
    if (
      allBloomsCombinations.length > 1 &&
      uniqueBloomsCombinations.size === 1
    ) {
      errors.push(
        "All CIEs should not have the same Bloom's Taxonomy combination"
      );
    }

    return { errors, warnings };
  };

  const resetFieldErrors = () => {
    setTypeError("");
    setUnitsCoveredError("");
    setDateError("");
    setMarksError("");
    setDurationError("");
    setBloomsError("");
    setPedagogyError("");
    setCoMappingError("");
    setSkillMappingError("");
  };

  const addCIE = () => {
    const currentCIEs = lessonPlan.cies || [];
    const newCIENumber = currentCIEs.length + 1;
    const newCIE = {
      id: `cie${newCIENumber}`,
      type: "",
      units_covered: [],
      practicals_covered: [],
      date: "",
      marks: 50,
      duration: 45,
      blooms_taxonomy: [],
      evaluation_pedagogy: "",
      other_pedagogy: "",
      co_mapping: [],
      pso_mapping: [],
      peo_mapping: [],
      skill_mapping: [{ skill: "", details: "" }],
    };

    setLessonPlan((prev: any) => ({
      ...prev,
      cies: [...currentCIEs, newCIE],
    }));

    setActiveCIE(currentCIEs.length);
  };

  const removeCIE = (index: number) => {
    const currentCIEs = lessonPlan.cies || [];
    if (currentCIEs.length <= 1) {
      toast.error("At least one CIE is required");
      return;
    }

    const updatedCIEs = currentCIEs.filter((_: any, i: number) => i !== index);
    setLessonPlan((prev: any) => ({
      ...prev,
      cies: updatedCIEs,
    }));

    if (activeCIE >= index && activeCIE > 0) {
      setActiveCIE(activeCIE - 1);
    }
  };

  const addSkillMapping = (cieIndex: number) => {
    const updatedCIEs = [...(lessonPlan.cies || [])];
    if (!updatedCIEs[cieIndex].skill_mapping) {
      updatedCIEs[cieIndex].skill_mapping = [];
    }
    updatedCIEs[cieIndex].skill_mapping.push({ skill: "", details: "" });

    setLessonPlan((prev: any) => ({
      ...prev,
      cies: updatedCIEs,
    }));
  };

  const removeSkillMapping = (cieIndex: number, skillIndex: number) => {
    const updatedCIEs = [...(lessonPlan.cies || [])];
    if (
      updatedCIEs[cieIndex].skill_mapping &&
      Array.isArray(updatedCIEs[cieIndex].skill_mapping)
    ) {
      updatedCIEs[cieIndex].skill_mapping = updatedCIEs[
        cieIndex
      ].skill_mapping.filter((_: any, i: number) => i !== skillIndex);
    }

    setLessonPlan((prev: any) => ({
      ...prev,
      cies: updatedCIEs,
    }));
  };

  const handleSkillMappingChange = (
    cieIndex: number,
    skillIndex: number,
    field: string,
    value: string
  ) => {
    const updatedCIEs = [...(lessonPlan.cies || [])];
    if (!updatedCIEs[cieIndex].skill_mapping) {
      updatedCIEs[cieIndex].skill_mapping = [];
    }
    if (!updatedCIEs[cieIndex].skill_mapping[skillIndex]) {
      updatedCIEs[cieIndex].skill_mapping[skillIndex] = {
        skill: "",
        details: "",
      };
    }
    updatedCIEs[cieIndex].skill_mapping[skillIndex][field] = value;

    setLessonPlan((prev: any) => ({
      ...prev,
      cies: updatedCIEs,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    resetFieldErrors();

    // Validate current CIE fields
    let hasFieldErrors = false;

    if (!currentCIE.type) {
      setTypeError("Type of evaluation is required");
      hasFieldErrors = true;
    }

    if (currentCIE.type !== "Course Prerequisites CIE") {
      if (
        currentCIE.type === "Practical CIE" ||
        currentCIE.type === "Internal Practical"
      ) {
        if (
          !currentCIE.practicals_covered ||
          currentCIE.practicals_covered.length === 0
        ) {
          setUnitsCoveredError("Practicals covered is required");
          hasFieldErrors = true;
        }
      } else {
        if (
          !currentCIE.units_covered ||
          currentCIE.units_covered.length === 0
        ) {
          setUnitsCoveredError("Units covered is required");
          hasFieldErrors = true;
        }
      }
    }

    if (!currentCIE.date) {
      setDateError("Date is required");
      hasFieldErrors = true;
    }

    if (!currentCIE.marks || currentCIE.marks < 1) {
      setMarksError("Marks must be at least 1");
      hasFieldErrors = true;
    }

    if (!currentCIE.duration || currentCIE.duration < 1) {
      setDurationError("Duration must be at least 1 minute");
      hasFieldErrors = true;
    }

    if (
      !currentCIE.blooms_taxonomy ||
      currentCIE.blooms_taxonomy.length === 0
    ) {
      setBloomsError("At least one Bloom's taxonomy level is required");
      hasFieldErrors = true;
    }

    if (!currentCIE.evaluation_pedagogy) {
      setPedagogyError("Evaluation pedagogy is required");
      hasFieldErrors = true;
    }

    const requiresCOMapping = [
      "Lecture CIE",
      "Course Prerequisites CIE",
      "Mid-term/Internal Exam",
    ];
    if (
      requiresCOMapping.includes(currentCIE.type) &&
      (!currentCIE.co_mapping || currentCIE.co_mapping.length === 0)
    ) {
      setCoMappingError(`CO mapping is required for ${currentCIE.type}`);
      hasFieldErrors = true;
    }

    if (
      !currentCIE.skill_mapping ||
      currentCIE.skill_mapping.length === 0 ||
      currentCIE.skill_mapping.some(
        (skill: any) => !skill.skill || !skill.details
      )
    ) {
      setSkillMappingError(
        "All skill mappings must have both skill and details"
      );
      hasFieldErrors = true;
    }

    const { errors, warnings } = validateAllCIEs();

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

    try {
      const result = await saveCIEPlanningForm({
        faculty_id: lessonPlan.faculty?.id || "",
        subject_id: lessonPlan.subject?.id || "",
        cies: lessonPlan.cies,
        remarks: lessonPlan.cie_remarks,
      });

      if (result.success) {
        toast.success("CIE details saved successfully");
        setValidationErrors([]);
        setValidationWarnings([]);

        setLessonPlan((prev: any) => ({
          ...prev,
          cie_planning_completed: true,
        }));
      } else {
        toast.error(result.error || "Failed to save CIE details");
      }
    } catch (error) {
      console.error("Error saving CIE details:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const currentCIEs = lessonPlan.cies || [];
  const currentCIE = currentCIEs[activeCIE];

  if (!currentCIE) {
    return <div>Loading...</div>;
  }

  if (!currentCIE.skill_mapping || !Array.isArray(currentCIE.skill_mapping)) {
    currentCIE.skill_mapping = [{ skill: "", details: "" }];
  }

  return (
    <div className="p-6">
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

      {/* CIE Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2 flex-wrap">
          {currentCIEs.map((cie: any, index: number) => (
            <Button
              key={cie.id}
              variant={activeCIE === index ? "default" : "outline"}
              className={
                activeCIE === index ? "bg-[#1A5CA1] hover:bg-[#154A80]" : ""
              }
              onClick={() => setActiveCIE(index)}
            >
              CIE {index + 1}
              {cie.type && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cie.type.split(" ")[0]}
                </Badge>
              )}
            </Button>
          ))}
          <Button variant="outline" onClick={addCIE}>
            <Plus className="h-4 w-4 mr-1" />
            Add CIE
          </Button>
        </div>
        {currentCIEs.length > 1 && (
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">CIE {activeCIE + 1}</h3>
        </div>

        {/* Type of Evaluation */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="type-of-evaluation">Type of Evaluation *</Label>
            <Select
              value={currentCIE.type || ""}
              onValueChange={(value) =>
                handleCIEChange(activeCIE, "type", value)
              }
            >
              <SelectTrigger id="type-of-evaluation" className="mt-1">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {cieTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {typeError && (
              <p className="text-red-500 text-xs mt-1">{typeError}</p>
            )}
          </div>

          {/* Units/Practicals Covered */}
          <div>
            <Label htmlFor="units-covered">
              {currentCIE.type === "Practical CIE" ||
              currentCIE.type === "Internal Practical"
                ? "Practicals Covered *"
                : "Units Covered *"}
            </Label>
            <Select
              value={
                currentCIE.type === "Course Prerequisites CIE" ? "disabled" : ""
              }
              disabled={currentCIE.type === "Course Prerequisites CIE"}
              onValueChange={(value) => {
                if (
                  currentCIE.type === "Practical CIE" ||
                  currentCIE.type === "Internal Practical"
                ) {
                  const currentPracticals = currentCIE.practicals_covered || [];
                  const updatedPracticals = currentPracticals.includes(value)
                    ? currentPracticals.filter((id) => id !== value)
                    : [...currentPracticals, value];
                  handleCIEChange(
                    activeCIE,
                    "practicals_covered",
                    updatedPracticals
                  );
                } else {
                  const currentUnits = currentCIE.units_covered || [];
                  const updatedUnits = currentUnits.includes(value)
                    ? currentUnits.filter((id) => id !== value)
                    : [...currentUnits, value];
                  handleCIEChange(activeCIE, "units_covered", updatedUnits);
                }
              }}
            >
              <SelectTrigger id="units-covered" className="mt-1">
                <SelectValue
                  placeholder={
                    currentCIE.type === "Course Prerequisites CIE"
                      ? "N/A for Prerequisites CIE"
                      : currentCIE.type === "Practical CIE" ||
                        currentCIE.type === "Internal Practical"
                      ? `${
                          (currentCIE.practicals_covered || []).length
                        } practical(s) selected`
                      : `${
                          (currentCIE.units_covered || []).length
                        } unit(s) selected`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {currentCIE.type === "Practical CIE" ||
                currentCIE.type === "Internal Practical"
                  ? lessonPlan.practicals?.map(
                      (practical: any, index: number) => (
                        <SelectItem
                          key={practical.id || `practical-${index}`}
                          value={practical.id || `practical-${index}`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={(
                                currentCIE.practicals_covered || []
                              ).includes(practical.id || `practical-${index}`)}
                              onChange={() => {}}
                              className="mr-2"
                            />
                            Practical {index + 1}:{" "}
                            {practical.practical_aim || "No aim specified"}
                          </div>
                        </SelectItem>
                      )
                    )
                  : lessonPlan.units?.map((unit: any, index: number) => (
                      <SelectItem
                        key={unit.id || `unit-${index}`}
                        value={unit.id || `unit-${index}`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(currentCIE.units_covered || []).includes(
                              unit.id || `unit-${index}`
                            )}
                            onChange={() => {}}
                            className="mr-2"
                          />
                          Unit {index + 1}:{" "}
                          {unit.unit_name || "No name specified"}
                        </div>
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {unitsCoveredError && (
              <p className="text-red-500 text-xs mt-1">{unitsCoveredError}</p>
            )}

            {/* Display selected items */}
            {currentCIE.type === "Practical CIE" ||
            currentCIE.type === "Internal Practical"
              ? currentCIE.practicals_covered &&
                currentCIE.practicals_covered.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentCIE.practicals_covered.map(
                      (practicalId: string) => {
                        const practical = lessonPlan.practicals?.find(
                          (p: any) => p.id === practicalId
                        );
                        const practicalIndex = lessonPlan.practicals?.findIndex(
                          (p: any) => p.id === practicalId
                        );
                        return (
                          <Badge
                            key={practicalId}
                            variant="secondary"
                            className="text-xs"
                          >
                            Practical {(practicalIndex || 0) + 1}:{" "}
                            {practical?.practical_aim || "Unknown"}
                            <button
                              onClick={() => {
                                const updated =
                                  currentCIE.practicals_covered.filter(
                                    (id: string) => id !== practicalId
                                  );
                                handleCIEChange(
                                  activeCIE,
                                  "practicals_covered",
                                  updated
                                );
                              }}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      }
                    )}
                  </div>
                )
              : currentCIE.units_covered &&
                currentCIE.units_covered.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentCIE.units_covered.map((unitId: string) => {
                      const unit = lessonPlan.units?.find(
                        (u: any) => u.id === unitId
                      );
                      const unitIndex = lessonPlan.units?.findIndex(
                        (u: any) => u.id === unitId
                      );
                      return (
                        <Badge
                          key={unitId}
                          variant="secondary"
                          className="text-xs"
                        >
                          Unit {(unitIndex || 0) + 1}:{" "}
                          {unit?.unit_name || "Unknown"}
                          <button
                            onClick={() => {
                              const updated = currentCIE.units_covered.filter(
                                (id: string) => id !== unitId
                              );
                              handleCIEChange(
                                activeCIE,
                                "units_covered",
                                updated
                              );
                            }}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
          </div>
        </div>

        {/* Date, Marks, Duration */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={currentCIE.date || ""}
              onChange={(e) =>
                handleCIEChange(activeCIE, "date", e.target.value)
              }
              className="mt-1"
            />
            {dateError && (
              <p className="text-red-500 text-xs mt-1">{dateError}</p>
            )}
            {currentCIE.type === "Course Prerequisites CIE" && (
              <p className="text-xs text-amber-600 mt-1">
                Must be within 10 days of term start date
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="marks">Marks *</Label>
            <Input
              id="marks"
              type="number"
              min="1"
              value={currentCIE.marks || ""}
              onChange={(e) =>
                handleCIEChange(activeCIE, "marks", Number(e.target.value))
              }
              className="mt-1"
            />
            {marksError && (
              <p className="text-red-500 text-xs mt-1">{marksError}</p>
            )}
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={currentCIE.duration || ""}
              onChange={(e) =>
                handleCIEChange(activeCIE, "duration", Number(e.target.value))
              }
              className="mt-1"
            />
            {durationError && (
              <p className="text-red-500 text-xs mt-1">{durationError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated based on marks and Bloom's levels
            </p>
          </div>
        </div>

        {/* Bloom's Taxonomy */}
        <div>
          <Label>
            Bloom's Taxonomy *
            <span className="text-xs text-amber-600 ml-1">
              (Remember max once, Understand max twice across all CIEs)
            </span>
          </Label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {bloomsTaxonomyOptions.map((level) => {
              const semester = lessonPlan.subject?.semester || 1;
              const isDisabled = semester > 2 && level === "Remember";

              // Count usage of this level across all CIEs
              const levelUsage = currentCIEs
                .filter((cie: any, i: number) => i !== activeCIE)
                .flatMap((cie: any) => cie.blooms_taxonomy || [])
                .filter((bloom: string) => bloom === level).length;

              const isRememberDisabled =
                level === "Remember" && levelUsage >= 1;
              const isUnderstandDisabled =
                level === "Understand" && levelUsage >= 2;

              const finalDisabled =
                isDisabled || isRememberDisabled || isUnderstandDisabled;

              return (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bloom-${level}`}
                    checked={
                      currentCIE.blooms_taxonomy?.includes(level) || false
                    }
                    disabled={finalDisabled}
                    onCheckedChange={(checked) => {
                      const current = currentCIE.blooms_taxonomy || [];
                      const updated = checked
                        ? [...current, level]
                        : current.filter((l: string) => l !== level);
                      handleCIEChange(activeCIE, "blooms_taxonomy", updated);
                    }}
                  />
                  <Label
                    htmlFor={`bloom-${level}`}
                    className={finalDisabled ? "text-gray-400" : ""}
                    title={
                      isRememberDisabled
                        ? "Remember can be used maximum once across all CIEs"
                        : isUnderstandDisabled
                        ? "Understand can be used maximum twice across all CIEs"
                        : ""
                    }
                  >
                    {level}
                    {level === "Remember" && (
                      <span className="text-xs text-amber-600 ml-1">
                        (max 1)
                      </span>
                    )}
                    {level === "Understand" && (
                      <span className="text-xs text-amber-600 ml-1">
                        (max 2)
                      </span>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
          {bloomsError && (
            <p className="text-red-500 text-xs mt-1">{bloomsError}</p>
          )}
          {lessonPlan.subject?.semester > 2 && (
            <p className="text-xs text-amber-600 mt-2">
              'Remember' level is disabled for semester{" "}
              {lessonPlan.subject.semester}
            </p>
          )}
        </div>

        {/* Evaluation Pedagogy */}
        <div>
          <Label htmlFor="evaluation-pedagogy">Evaluation Pedagogy *</Label>
          <Select
            value={currentCIE.evaluation_pedagogy || ""}
            onValueChange={(value) =>
              handleCIEChange(activeCIE, "evaluation_pedagogy", value)
            }
          >
            <SelectTrigger id="evaluation-pedagogy" className="mt-1">
              <SelectValue placeholder="Select Evaluation Pedagogy" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-sm font-semibold text-gray-700">
                Traditional Pedagogy
              </div>
              {evaluationPedagogyOptions.traditional.map((pedagogy) => (
                <SelectItem key={pedagogy} value={pedagogy}>
                  {pedagogy}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">
                Alternative Pedagogy
              </div>
              {evaluationPedagogyOptions.alternative.map((pedagogy) => (
                <SelectItem key={pedagogy} value={pedagogy}>
                  {pedagogy}
                  {pedagogy === "Open Book Assessment" && (
                    <span className="text-xs text-amber-600 ml-1">
                      (only Analyze, Evaluate, Create levels)
                    </span>
                  )}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-sm font-semibold text-gray-700 border-t mt-2 pt-2">
                Other
              </div>
              {evaluationPedagogyOptions.other.map((pedagogy) => (
                <SelectItem key={pedagogy} value={pedagogy}>
                  {pedagogy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {pedagogyError && (
            <p className="text-red-500 text-xs mt-1">{pedagogyError}</p>
          )}
          {currentCIE.evaluation_pedagogy === "Open Book Assessment" && (
            <p className="text-xs text-amber-600 mt-1">
              Open Book Assessment only allows Analyze, Evaluate, and Create
              levels
            </p>
          )}

          {currentCIE.evaluation_pedagogy === "Other" && (
            <div className="mt-2">
              <Label htmlFor="other-pedagogy">Specify Other Pedagogy</Label>
              <Input
                id="other-pedagogy"
                value={currentCIE.other_pedagogy || ""}
                onChange={(e) =>
                  handleCIEChange(activeCIE, "other_pedagogy", e.target.value)
                }
                placeholder="Enter custom pedagogy"
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* CO, PSO, PEO Mapping */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label>
              CO Mapping{" "}
              {[
                "Lecture CIE",
                "Course Prerequisites CIE",
                "Mid-term/Internal Exam",
              ].includes(currentCIE.type)
                ? "*"
                : "(Optional)"}
              {[
                "Lecture CIE",
                "Course Prerequisites CIE",
                "Mid-term/Internal Exam",
              ].includes(currentCIE.type) && (
                <span className="text-xs text-amber-600 ml-1">
                  (All COs must be covered across Lecture CIEs + Course
                  Prerequisites CIEs + Mid-term/Internal Exams)
                </span>
              )}
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {lessonPlan.courseOutcomes?.map((co: any, index: number) => (
                <div key={co.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`co-${co.id}`}
                    checked={currentCIE.co_mapping?.includes(co.id) || false}
                    onCheckedChange={(checked) => {
                      const current = currentCIE.co_mapping || [];
                      const updated = checked
                        ? [...current, co.id]
                        : current.filter((id: string) => id !== co.id);
                      handleCIEChange(activeCIE, "co_mapping", updated);
                    }}
                  />
                  <Label htmlFor={`co-${co.id}`} className="text-sm">
                    CO{index + 1}
                  </Label>
                </div>
              ))}
            </div>
            {coMappingError && (
              <p className="text-red-500 text-xs mt-1">{coMappingError}</p>
            )}
          </div>

          <div>
            <Label>PSO Mapping (Optional)</Label>
            {loadingPsoPeo ? (
              <p className="text-sm text-gray-500 mt-2">Loading PSO data...</p>
            ) : departmentPsoPeo.pso_data.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {departmentPsoPeo.pso_data.map((pso, index) => (
                  <div key={pso.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pso-${pso.id}`}
                      checked={
                        currentCIE.pso_mapping?.includes(pso.id) || false
                      }
                      onCheckedChange={(checked) => {
                        const current = currentCIE.pso_mapping || [];
                        const updated = checked
                          ? [...current, pso.id]
                          : current.filter((p: string) => p !== pso.id);
                        handleCIEChange(activeCIE, "pso_mapping", updated);
                      }}
                    />
                    <Label
                      htmlFor={`pso-${pso.id}`}
                      className="text-sm"
                      title={pso.description}
                    >
                      {pso.label || `PSO${index + 1}`}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                No PSO data configured for this department. Please contact your
                HOD to set up PSO/PEO data.
              </p>
            )}
          </div>

          <div>
            <Label>PEO Mapping (Optional)</Label>
            {loadingPsoPeo ? (
              <p className="text-sm text-gray-500 mt-2">Loading PEO data...</p>
            ) : departmentPsoPeo.peo_data.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {departmentPsoPeo.peo_data.map((peo, index) => (
                  <div key={peo.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`peo-${peo.id}`}
                      checked={
                        currentCIE.peo_mapping?.includes(peo.id) || false
                      }
                      onCheckedChange={(checked) => {
                        const current = currentCIE.peo_mapping || [];
                        const updated = checked
                          ? [...current, peo.id]
                          : current.filter((p: string) => p !== peo.id);
                        handleCIEChange(activeCIE, "peo_mapping", updated);
                      }}
                    />
                    <Label
                      htmlFor={`peo-${peo.id}`}
                      className="text-sm"
                      title={peo.description}
                    >
                      {peo.label || `PEO${index + 1}`}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                No PEO data configured for this department. Please contact your
                HOD to set up PSO/PEO data.
              </p>
            )}
          </div>
        </div>

        {/* Skill Mapping */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Skill Mapping *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSkillMapping(activeCIE)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
            </Button>
          </div>

          <div className="space-y-4">
            {currentCIE.skill_mapping?.map(
              (skillMap: any, skillIndex: number) => (
                <Card key={skillIndex} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`skill-${skillIndex}`}>Skill</Label>
                      <Select
                        value={skillMap.skill || ""}
                        onValueChange={(value) =>
                          handleSkillMappingChange(
                            activeCIE,
                            skillIndex,
                            "skill",
                            value
                          )
                        }
                      >
                        <SelectTrigger
                          id={`skill-${skillIndex}`}
                          className="mt-1"
                        >
                          <SelectValue placeholder="Select Skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillMappingOptions.map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`skill-details-${skillIndex}`}>
                        Details
                      </Label>
                      <Textarea
                        id={`skill-details-${skillIndex}`}
                        value={skillMap.details || ""}
                        onChange={(e) =>
                          handleSkillMappingChange(
                            activeCIE,
                            skillIndex,
                            "details",
                            e.target.value
                          )
                        }
                        placeholder="Skills should be mentioned in measurable terms"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  {currentCIE.skill_mapping.length > 1 && (
                    <div className="flex justify-end mt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          removeSkillMapping(activeCIE, skillIndex)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </Card>
              )
            )}
          </div>
          {skillMappingError && (
            <p className="text-red-500 text-xs mt-1">{skillMappingError}</p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <Label htmlFor="cie-remarks">Remarks (Optional)</Label>
          <Textarea
            id="cie-remarks"
            value={lessonPlan.cie_remarks || ""}
            onChange={(e) =>
              setLessonPlan((prev: any) => ({
                ...prev,
                cie_remarks: e.target.value,
              }))
            }
            placeholder="Enter any additional remarks for all CIEs"
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <Button
            onClick={handleSave}
            className="bg-[#1A5CA1] hover:bg-[#154A80]"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save CIE Details"}
          </Button>
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
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
