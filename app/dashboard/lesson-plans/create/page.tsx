// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useDashboardContext } from "@/context/DashboardContext"
// import { fetchFacultySubjects } from "@/app/dashboard/actions/fetchFacultySubjects"
// import { createLessonPlan } from "@/app/dashboard/actions/createLessonPlan"
// import { toast } from "sonner"
// import { ArrowLeft, Plus, Trash2 } from "lucide-react"
// import Link from "next/link"

// type FacultySubject = {
//   id: string
//   user_id: string
//   role_name: string
//   depart_id: string
//   subject_id: string
//   academic_year: string
//   division: string
//   subjects: {
//     id: string
//     code: string
//     name: string
//     semester: number
//     lecture_hours: number
//     lab_hours: number
//     abbreviation_name: string
//     credits: number
//     is_practical: boolean
//     is_theory: boolean
//   } | null
//   departments: {
//     id: string
//     name: string
//     abbreviation_depart: string
//     institutes: {
//       id: string
//       name: string
//       abbreviation_insti: string
//     } | null
//   } | null
// }

// type Topic = {
//   id: string
//   title: string
//   description: string
//   hours: number
//   order: number
// }

// export default function CreateLessonPlanPage() {
//   const router = useRouter()
//   const { userData } = useDashboardContext()
//   const [subjects, setSubjects] = useState<FacultySubject[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSaving, setIsSaving] = useState(false)
//   const [selectedSubject, setSelectedSubject] = useState<string>("")
//   const [topics, setTopics] = useState<Topic[]>([
//     { id: crypto.randomUUID(), title: "", description: "", hours: 1, order: 0 },
//   ])

//   useEffect(() => {
//     const getSubjectData = async () => {
//       try {
//         setIsLoading(true)
//         const data = await fetchFacultySubjects(userData.id)
//         // Filter out subjects where subjects is null
//         const validSubjects = data.filter((subject) => subject.subjects !== null)
//         setSubjects(validSubjects)
//         if (validSubjects.length > 0) {
//           setSelectedSubject(validSubjects[0].subject_id)
//         }
//       } catch (error) {
//         console.error("Error fetching faculty subjects:", error)
//         toast.error("Failed to load subjects")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     if (userData.id) {
//       getSubjectData()
//     }
//   }, [userData.id])

//   const addTopic = () => {
//     setTopics([
//       ...topics,
//       {
//         id: crypto.randomUUID(),
//         title: "",
//         description: "",
//         hours: 1,
//         order: topics.length,
//       },
//     ])
//   }

//   const removeTopic = (id: string) => {
//     if (topics.length === 1) {
//       toast.error("You must have at least one topic")
//       return
//     }
//     setTopics(topics.filter((topic) => topic.id !== id))
//   }

//   const updateTopic = (id: string, field: keyof Topic, value: string | number) => {
//     setTopics(
//       topics.map((topic) => {
//         if (topic.id === id) {
//           return { ...topic, [field]: value }
//         }
//         return topic
//       }),
//     )
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     // Validate form
//     if (!selectedSubject) {
//       toast.error("Please select a subject")
//       return
//     }

//     const invalidTopics = topics.filter((topic) => !topic.title.trim())
//     if (invalidTopics.length > 0) {
//       toast.error("All topics must have a title")
//       return
//     }

//     setIsSaving(true)

//     try {
//       const selectedSubjectData = subjects.find((s) => s.subject_id === selectedSubject)

//       if (!selectedSubjectData) {
//         throw new Error("Selected subject not found")
//       }

//       const result = await createLessonPlan({
//         faculty_id: userData.id,
//         subject_id: selectedSubject,
//         academic_year: selectedSubjectData.academic_year,
//         division: selectedSubjectData.division,
//         topics: topics.map((topic, index) => ({
//           ...topic,
//           order: index,
//         })),
//       })

//       if (result.success) {
//         toast.success("Lesson plan created successfully")
//         router.push("/dashboard/lesson-plans")
//       } else {
//         throw new Error(result.error || "Failed to create lesson plan")
//       }
//     } catch (error) {
//       console.error("Error creating lesson plan:", error)
//       toast.error("Failed to create lesson plan")
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-2">
//           <Link href="/dashboard/lesson-plans">
//             <Button variant="outline" size="icon" className="h-8 w-8">
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold">Create New Lesson Plan</h1>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Lesson Plan Details</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="subject">Subject</Label>
//                 <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isLoading}>
//                   <SelectTrigger id="subject">
//                     <SelectValue placeholder="Select a subject" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {subjects.map((subject) => (
//                       <SelectItem key={subject.subject_id} value={subject.subject_id}>
//                         {subject.subjects?.code} - {subject.subjects?.name} (Div: {subject.division})
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {isLoading && <p className="text-sm text-muted-foreground">Loading subjects...</p>}
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="mb-6">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Topics</CardTitle>
//             <Button type="button" onClick={addTopic} variant="outline" size="sm">
//               <Plus className="mr-2 h-4 w-4" /> Add Topic
//             </Button>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {topics.map((topic, index) => (
//               <div key={topic.id} className="space-y-4 border-b pb-6 last:border-0">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-medium">Topic {index + 1}</h3>
//                   <Button
//                     type="button"
//                     onClick={() => removeTopic(topic.id)}
//                     variant="ghost"
//                     size="sm"
//                     className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor={`topic-title-${topic.id}`}>Title</Label>
//                     <Input
//                       id={`topic-title-${topic.id}`}
//                       value={topic.title}
//                       onChange={(e) => updateTopic(topic.id, "title", e.target.value)}
//                       placeholder="Topic title"
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor={`topic-hours-${topic.id}`}>Hours</Label>
//                     <Input
//                       id={`topic-hours-${topic.id}`}
//                       type="number"
//                       min="1"
//                       value={topic.hours}
//                       onChange={(e) => updateTopic(topic.id, "hours", Number.parseInt(e.target.value) || 1)}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor={`topic-description-${topic.id}`}>Description</Label>
//                   <Textarea
//                     id={`topic-description-${topic.id}`}
//                     value={topic.description}
//                     onChange={(e) => updateTopic(topic.id, "description", e.target.value)}
//                     placeholder="Topic description and learning objectives"
//                     rows={3}
//                   />
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//           <CardFooter className="flex justify-between">
//             <Button type="button" variant="outline" onClick={() => router.back()}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSaving}>
//               {isSaving ? "Saving..." : "Create Lesson Plan"}
//             </Button>
//           </CardFooter>
//         </Card>
//       </form>
//     </div>
//   )
// }

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useDashboardContext } from "@/context/DashboardContext"
import { toast } from "sonner"

export default function CreateLessonPlanPage() {
  const { userData, currentRole } = useDashboardContext()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    subjectCode: "",
    semester: "",
    division: "",
    description: "",
    objectives: "",
    duration: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Here you would call your API to create the lesson plan
      console.log("Creating lesson plan:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast("Lesson plan created successfully!")

      // Redirect to lesson plans list or the new plan
      // router.push("/dashboard/lesson-plans")
    } catch (error) {
      console.error("Error creating lesson plan:", error)
      toast("Failed to create lesson plan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/lesson-plans">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-[#1A5CA1]">Create Lesson Plan</h1>
            <p className="text-gray-600 mt-2">Create a new lesson plan for your subject</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1A5CA1]">Lesson Plan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter lesson title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Enter subject name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjectCode">Subject Code *</Label>
                  <Input
                    id="subjectCode"
                    value={formData.subjectCode}
                    onChange={(e) => handleInputChange("subjectCode", e.target.value)}
                    placeholder="e.g., CSE301"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <Select onValueChange={(value) => handleInputChange("semester", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="division">Division *</Label>
                  <Select onValueChange={(value) => handleInputChange("division", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Division 1">Division 1</SelectItem>
                      <SelectItem value="Division 2">Division 2</SelectItem>
                      <SelectItem value="Division 1 & Division 2">Division 1 & Division 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g., 60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the lesson"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Learning Objectives</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange("objectives", e.target.value)}
                  placeholder="What students will learn from this lesson"
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading} className="bg-[#1A5CA1] hover:bg-[#154A80]">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Lesson Plan"}
                </Button>
                <Link href="/dashboard/lesson-plans">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
