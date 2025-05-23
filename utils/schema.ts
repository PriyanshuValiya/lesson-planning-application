import { z } from "zod"

// General Details Form Schema
export const generalDetailsSchema = z.object({
  faculty_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  division: z.enum(["Div 1", "Div 2", "Div 1 & 2", "Division 1 & 2"], {
    required_error: "Division is required",
  }),
  lecture_hours: z.coerce.number().min(1, "Lecture hours must be at least 1"),
  lab_hours: z.coerce.number().min(0, "Lab hours cannot be negative"),
  credits: z.coerce.number().min(1, "Credits must be at least 1"),
  term_start_date: z.string().min(1, "Term start date is required"),
  term_end_date: z.string().min(1, "Term end date is required"),
  course_prerequisites: z.string().min(1, "Course prerequisites are required"),
  course_prerequisites_materials: z.string().min(1, "Course prerequisites materials are required"),
  courseOutcomes: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().min(1, "Course outcome text is required"),
      }),
    )
    .min(1, "At least one course outcome is required"),
  remarks: z.string().optional(),
})

export type GeneralDetailsFormValues = z.infer<typeof generalDetailsSchema>

// Additional Information Form Schema
export const additionalInfoSchema = z.object({
  faculty_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  // Additional Planning Information (Required fields)
  classroom_conduct: z.string().min(1, "Classroom conduct and instructions are required"),
  attendance_policy: z.string().min(1, "Attendance policy and criteria are required"),
  cie_guidelines: z.string().min(1, "CIE guidelines are required"),
  self_study_guidelines: z.string().min(1, "Self-study/homework guidelines are required"),
  reference_materials: z.string().min(1, "Reference materials and tools are required"),
  academic_integrity: z.string().min(1, "Academic integrity policy is required"),
  communication_channels: z.string().min(1, "Communication channels are required"),

  // Optional fields
  lesson_planning_guidelines: z.string().optional(),
  topics_beyond_syllabus: z.string().optional(),
  interdisciplinary_integration: z.string().optional(),

  // Event Planning details (Optional)
  events: z
    .array(
      z.object({
        id: z.string(),
        event_type: z.enum([
          "Expert Talk",
          "Workshop",
          "Seminar",
          "Webinar",
          "Competition",
          "Panel Discussion",
          "Round Table Discussion",
          "Poster Presentations",
          "Project Exhibitions",
          "Knowledge Sharing Session",
          "Debate",
          "Idea/Innovation Contest",
          "Other",
        ]),
        other_event_type: z.string().optional(),
        tentative_title: z.string().min(1, "Event title is required"),
        proposed_week: z.string().min(1, "Proposed week is required"),
        duration: z.coerce.number().min(1, "Duration must be at least 1 hour"),
        target_audience: z
          .array(
            z.enum([
              "1st Semester",
              "2nd Semester",
              "3rd Semester",
              "4th Semester",
              "5th Semester",
              "6th Semester",
              "7th Semester",
              "8th Semester",
              "Staff",
            ]),
          )
          .min(1, "At least one target audience must be selected"),
        mode_of_conduct: z.enum(["Offline", "Online", "Hybrid"]),
        expected_outcomes: z.string().min(1, "Expected outcomes are required"),
        skill_mapping: z.array(z.string()).min(1, "At least one skill must be mapped"),
        proposed_speaker: z.string().optional(),
      }),
    )
    .optional(),
})

export type AdditionalInfoFormValues = z.infer<typeof additionalInfoSchema>

// Action to save general details form
export const saveGeneralDetailsSchema = z.object({
  faculty_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  formData: generalDetailsSchema,
})

// Action to save additional info form
export const saveAdditionalInfoSchema = z.object({
  faculty_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  formData: additionalInfoSchema,
})
