// //@ts-nocheck
// "use client";

// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { CalendarIcon, Eye, FileText } from "lucide-react";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { toast } from "sonner";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import { format, parseISO, parse } from "date-fns"; // Import parse for DD-MM-YYYY

// // Helper function to parse DD-MM-YYYY and format to a readable string
// const parseAndFormatDate = (dateString: string) => {
//   if (!dateString) return "Not specified";
//   // Attempt to parse DD-MM-YYYY format explicitly
//   const parsedDate = parse(dateString, "dd-MM-yyyy", new Date());
//   if (isNaN(parsedDate.getTime())) {
//     // If parsing DD-MM-YYYY fails, try ISO or default Date constructor
//     try {
//       const isoParsedDate = parseISO(dateString);
//       if (!isNaN(isoParsedDate.getTime())) {
//         return format(isoParsedDate, "PPPP");
//       }
//     } catch (e) {
//       // Fallback to direct Date constructor if all else fails
//       const genericDate = new Date(dateString);
//       if (!isNaN(genericDate.getTime())) {
//         return format(genericDate, "PPPP");
//       }
//     }
//     return "Invalid Date";
//   }
//   return format(parsedDate, "PPPP"); // e.g., "Thursday, February 6, 2025"
// };

// const formSchema = z.object({
//   actual_units: z.string().min(1, "Required"),
//   actual_pedagogy: z.string().min(1, "Required"),
//   actual_date: z.string().min(1, "Required"),
//   actual_duration: z.string().min(1, "Required"),
//   actual_marks: z.number().min(0.1, "Must be positive"),
//   co: z.string().min(1, "Required"),
//   pso: z.string().min(1, "Required"),
//   actual_blooms: z.string().min(1, "Required"),
//   reason_for_change: z.string().optional(),
//   quality_review_completed: z.boolean().default(false),
//   quality_review_date: z.string().optional(),
//   marks_display_date: z.string().optional(),
//   cie_paper_file: z.any().optional(),
//   evaluation_analysis_file: z.any().optional(),
//   marks_display_document: z.any().optional(), // Added missing field
// });

// type FormData = z.infer<typeof formSchema>;

// interface EditActualFormProps {
//   formsData: any;
//   actualCiesData: any[];
//   userRoleData: any;
//   departmentPsoPeoData: any; // Added department PSO/PEO data
// }

// export default function EditActualForm({
//   formsData,
//   actualCiesData,
//   userRoleData,
//   departmentPsoPeoData,
// }: EditActualFormProps) {
//   const supabase = createClientComponentClient();
//   const [activeTab, setActiveTab] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Extract CIEs from forms data
//   const ciesFromForm = formsData.form?.cies || [];

//   // Extract options from forms data for dropdowns
//   const extractedOptions = {
//     pedagogies: [
//       ...new Set([
//         "Concept Mapping Evaluation",
//         "Short/Descriptive Evaluation",
//         "MCQ Evaluation",
//         "Practical Evaluation",
//         "Assignment Evaluation",
//         "Quiz Evaluation",
//         "Presentation Evaluation",
//       ]),
//     ],
//     bloomsTaxonomy: [
//       ...new Set([
//         "Remember",
//         "Understand",
//         "Apply",
//         "Analyze",
//         "Evaluate",
//         "Create",
//       ]),
//     ],
//     courseOutcomes: formsData.form?.generalDetails?.courseOutcomes || [],
//     units: formsData.form?.units || [],
//     // Use fetched PSO data, assuming pso_data is an array of { name: string, id: string }
//     psoOptions:
//       departmentPsoPeoData?.pso_data?.map((pso: any) => pso.name) || [],
//     peoOptions:
//       departmentPsoPeoData?.peo_data?.map((peo: any) => peo.name) || [],
//   };

//   // Set initial active tab
//   useEffect(() => {
//     if (ciesFromForm.length > 0 && !activeTab) {
//       setActiveTab(`cie-${ciesFromForm[0].id}`);
//     }
//   }, [ciesFromForm, activeTab]);

//   // Check if CIE date has passed
//   const isCieActive = (cieDate: string) => {
//     if (!cieDate) return false;
//     const today = new Date();
//     // Parse the CIE date explicitly as DD-MM-YYYY
//     const cie = parse(cieDate, "dd-MM-yyyy", new Date());
//     if (isNaN(cie.getTime())) {
//       // Fallback for other formats if DD-MM-YYYY fails
//       const fallbackCie = new Date(cieDate);
//       return fallbackCie.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0);
//     }
//     return cie.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0);
//   };

//   // Get existing actual data for a CIE
//   const getExistingActual = (cieId: string) => {
//     const cieNumber = Number.parseInt(cieId.replace("cie", ""));
//     return actualCiesData.find((actual) => actual.cie_number === cieNumber);
//   };

//   const handleFileUpload = async (file: File, path: string, cieId: string) => {
//     if (!file) return null;
//     console.log(`Uploading file for CIE`);
//     try {
//       const fileExt = file.name?.split(".").pop() || "pdf";
//       // Use the new 'actual-cies' bucket for all uploads
//       const bucketName = "actual-cies";
//       const fileName = `${
//         formsData.id
//       }-${cieId}-${path}-${Date.now()}.${fileExt}`;
//       const filePath = `${formsData.id}/${fileName}`;

//       const { data, error } = await supabase.storage
//         .from(bucketName)
//         .upload(filePath, file, {
//           upsert: true,
//           contentType: "application/pdf",
//         });
//       if (error) {
//         toast.error("Error while uploading files !!");
//         return null;
//       }

//       console.log(`File uploaded successfully: ${filePath}`);
//       return filePath;
//     } catch (error: any) {
//       toast.error("Error while uploading files !!");
//       console.error("File upload error:", error);
//       return null;
//     }
//   };

//   const handleSubmit = async (values: FormData, cieData: any) => {
//     try {
//       setIsSubmitting(true);
//       const cieNumber = Number.parseInt(cieData.id.replace("cie", ""));

//       // Handle file uploads
//       let ciePaperDocument = null;
//       let evaluationAnalysisDocument = null;
//       let marksDisplayDocument = null; 

//       if (values.cie_paper_file && values.cie_paper_file instanceof File) {
//         ciePaperDocument = await handleFileUpload(
//           values.cie_paper_file,
//           "paper",
//           cieData.id
//         );
//       }

//       if (
//         values.evaluation_analysis_file &&
//         values.evaluation_analysis_file instanceof File
//       ) {
//         evaluationAnalysisDocument = await handleFileUpload(
//           values.evaluation_analysis_file,
//           "analysis",
//           cieData.id
//         );
//       }

//       if (
//         values.marks_display_document &&
//         values.marks_display_document instanceof File
//       ) {
//         marksDisplayDocument = await handleFileUpload(
//           values.marks_display_document,
//           "marks",
//           cieData.id
//         );
//       }

//       const actualData = {
//         actual_blooms: values.actual_blooms,
//         actual_date: values.actual_date,
//         actual_duration: values.actual_duration,
//         actual_marks: values.actual_marks,
//         actual_pedagogy: values.actual_pedagogy,
//         actual_units: values.actual_units,
//         cie_number: cieNumber,
//         cie_paper_document: ciePaperDocument,
//         co: values.co,
//         pso: values.pso,
//         created_at: new Date().toISOString(),
//         evalution_analysis_document: evaluationAnalysisDocument,
//         is_submitted: true,
//         marks_display_date: values.marks_display_date,
//         quality_review_completed: values.quality_review_completed || false,
//         quality_review_date: values.quality_review_date,
//         reason_for_change: values.reason_for_change,
//         forms: formsData.id,
//         marks_display_document: marksDisplayDocument, 
//       };

//       const existingActual = getExistingActual(cieData.id);
//       let response;

//       if (existingActual) {
//         response = await supabase
//           .from("actual_cies")
//           .update(actualData)
//           .eq("id", existingActual.id);
//       } else {
//         response = await supabase.from("actual_cies").insert(actualData);
//       }

//       if (response.error) {
//         throw new Error(response.error.message);
//       }

//       toast.success("Data Saved Successfully...");

//       // Reload page to reflect changes
//       window.location.reload();
//     } catch (error: any) {
//       toast.error("Error while submitting data !!");

//       console.error("Error while submitting data", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const CieTabContent = ({ cieData }: { cieData: any }) => {
//     const existingActual = getExistingActual(cieData.id);
//     const isActive = isCieActive(cieData.date);

//     // Map CO IDs to names (assuming courseOutcomes has { id: UUID, text: "CO1" } structure)
//     const plannedCoNames =
//       cieData.co_mapping
//         ?.map((coId: string) => {
//           const co = extractedOptions.courseOutcomes.find(
//             (c: any) => c.id === coId
//           );
//           return co ? co.text : coId; // Fallback to ID if name not found
//         })
//         .join(", ") || "Not specified";

//     // Map PSO IDs/names to display names (assuming pso_data has { name: "PSO1" } structure)
//     const plannedPsoNames =
//       cieData.pso_mapping
//         ?.map((psoIdentifier: string) => {
//           // Try to find by name first, then by a potential ID if it exists in pso_data
//           const pso = extractedOptions.psoOptions.find(
//             (psoName: string) => psoName === psoIdentifier
//           );
//           return pso || psoIdentifier; // Fallback to identifier if not found
//         })
//         .join(", ") || "Not specified";

//     // Map Unit IDs to Unit Numbers (index + 1)
//     const plannedUnitNumbers =
//       cieData.units_covered
//         ?.map((unitId: string) => {
//           const unitIndex = extractedOptions.units.findIndex(
//             (u: any) => u.id === unitId
//           );
//           return unitIndex !== -1 ? `Unit ${unitIndex + 1}` : unitId; // Fallback to ID if not found
//         })
//         .join(", ") || "Not specified";

//     const defaultValues: FormData = {
//       actual_units: existingActual?.actual_units || "",
//       actual_pedagogy:
//         existingActual?.actual_pedagogy || cieData.evaluation_pedagogy || "",
//       actual_date: existingActual?.actual_date || "",
//       actual_duration:
//         existingActual?.actual_duration || cieData.duration?.toString() || "",
//       actual_marks: existingActual?.actual_marks || cieData.marks || 0,
//       co: existingActual?.co || plannedCoNames, // Use mapped CO names
//       pso: existingActual?.pso || plannedPsoNames, // Use mapped PSO names
//       actual_blooms:
//         existingActual?.actual_blooms ||
//         (cieData.blooms_taxonomy ? cieData.blooms_taxonomy.join(", ") : ""),
//       reason_for_change: existingActual?.reason_for_change || "",
//       quality_review_completed:
//         existingActual?.quality_review_completed || false,
//       quality_review_date: existingActual?.quality_review_date || "",
//       marks_display_date: existingActual?.marks_display_date || "",
//       cie_paper_file: null,
//       evaluation_analysis_file: null,
//       marks_display_document: null, // Initialize new field
//     };

//     const form = useForm<FormData>({
//       resolver: zodResolver(formSchema),
//       defaultValues,
//     });

//     if (!isActive) {
//       return (
//         <div className="flex flex-col items-center justify-center py-12 text-center">
//           <FileText className="h-16 w-16 text-muted-foreground mb-4" />
//           <h3 className="text-lg font-semibold mb-2">CIE Not Yet Conducted</h3>
//           <p className="text-muted-foreground mb-4">
//             This CIE is scheduled for {parseAndFormatDate(cieData.date)}
//           </p>
//           <Badge variant="secondary">Scheduled</Badge>
//         </div>
//       );
//     }

//     const onSubmit = (values: FormData) => {
//       handleSubmit(values, cieData);
//     };

//     return (
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Planned Details Card */}
//             <Card className="shadow-sm">
//               <CardContent className="">
//                 <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
//                   <p className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">
//                     Planned Details
//                   </p>
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="font-medium text-sm">CIE Type:</p>
//                     <p className="text-muted-foreground">
//                       {cieData.type || "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Planned Date:</p>
//                     <p className="text-muted-foreground">
//                       {cieData.date
//                         ? parseAndFormatDate(cieData.date)
//                         : "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Planned Duration:</p>
//                     <p className="text-muted-foreground">
//                       {cieData.duration || 0} minutes
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Planned Marks:</p>
//                     <p className="text-muted-foreground">
//                       {cieData.marks || 0} marks
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Planned Pedagogy:</p>
//                     <p className="text-muted-foreground">
//                       {cieData.evaluation_pedagogy || "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">CO Mapping:</p>
//                     <p className="text-muted-foreground">{plannedCoNames}</p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">PSO Mapping:</p>
//                     <p className="text-muted-foreground">{plannedPsoNames}</p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Blooms Taxonomy:</p>
//                     <p className="text-muted-foreground">
//                       {cieData.blooms_taxonomy
//                         ? cieData.blooms_taxonomy.join(", ")
//                         : "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Units Covered:</p>
//                     <p className="text-muted-foreground">
//                       {plannedUnitNumbers}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Actual Details Form */}
//             <div className="space-y-6 mt-5">
//               <h3 className="text-lg font-medium">
//                 <p className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">
//                   Actual Implementation Details
//                 </p>
//               </h3>
//               <FormField
//                 control={form.control}
//                 name="actual_date"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Actual CIE Date *</FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant="outline"
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               parseAndFormatDate(field.value)
//                             ) : (
//                               <span>Select date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={
//                             field.value ? new Date(field.value) : undefined
//                           }
//                           onSelect={(date) =>
//                             field.onChange(date ? date.toISOString() : "")
//                           }
//                           disabled={(date) => date > new Date()}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="actual_duration"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Actual Duration (minutes) *</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="Enter duration"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="actual_marks"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Actual Marks *</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="Enter marks"
//                           {...field}
//                           onChange={(e) =>
//                             field.onChange(Number(e.target.value))
//                           }
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <FormField
//                 control={form.control}
//                 name="actual_pedagogy"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Actual Pedagogy *</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select evaluation pedagogy" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {extractedOptions.pedagogies.map((pedagogy) => (
//                           <SelectItem key={pedagogy} value={pedagogy}>
//                             {pedagogy}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="actual_units"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Actual Units Covered *</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Enter unit numbers (e.g., 1, 2, 3)"
//                         className="min-h-[80px]"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="co"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>CO Mapping *</FormLabel>
//                       <FormControl>
//                         <Input placeholder="e.g., CO1, CO2" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="pso"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>PSO Mapping *</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select PSO" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {extractedOptions.psoOptions.map((pso) => (
//                             <SelectItem key={pso} value={pso}>
//                               {pso}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <FormField
//                 control={form.control}
//                 name="actual_blooms"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Actual Blooms Taxonomy *</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="e.g., Remember, Understand, Apply"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="reason_for_change"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Reason for Change (if any)</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Explain any deviations from planned implementation"
//                         className="min-h-[100px]"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>

//           {/* Additional Information Section */}
//           <div className="space-y-6 pt-6 border-t">
//             <h3 className="text-lg font-medium">
//               <p className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">
//                 Additional Information & Documents
//               </p>
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <FormField
//                   control={form.control}
//                   name="quality_review_completed"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value}
//                           onCheckedChange={field.onChange}
//                         />
//                       </FormControl>
//                       <div className="space-y-1 leading-none">
//                         <FormLabel>Quality Review Completed</FormLabel>
//                       </div>
//                     </FormItem>
//                   )}
//                 />
//                 {form.watch("quality_review_completed") && (
//                   <FormField
//                     control={form.control}
//                     name="quality_review_date"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-col ml-6">
//                         <FormLabel>Quality Review Date</FormLabel>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <FormControl>
//                               <Button
//                                 variant="outline"
//                                 className={cn(
//                                   "w-full pl-3 text-left font-normal",
//                                   !field.value && "text-muted-foreground"
//                                 )}
//                               >
//                                 {field.value ? (
//                                   parseAndFormatDate(field.value)
//                                 ) : (
//                                   <span>Select review date</span>
//                                 )}
//                                 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                               </Button>
//                             </FormControl>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={
//                                 field.value ? new Date(field.value) : undefined
//                               }
//                               onSelect={(date) =>
//                                 field.onChange(date ? date.toISOString() : "")
//                               }
//                               disabled={(date) => date > new Date()}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 )}
//                 <FormField
//                   control={form.control}
//                   name="marks_display_date"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-col">
//                       <FormLabel>Marks Display Date</FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button
//                               variant="outline"
//                               className={cn(
//                                 "w-full pl-3 text-left font-normal",
//                                 !field.value && "text-muted-foreground"
//                               )}
//                             >
//                               {field.value ? (
//                                 parseAndFormatDate(field.value)
//                               ) : (
//                                 <span>Select date</span>
//                               )}
//                               <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={
//                               field.value ? new Date(field.value) : undefined
//                             }
//                             onSelect={(date) =>
//                               field.onChange(date ? date.toISOString() : "")
//                             }
//                             initialFocus
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div className="space-y-4">
//                 <FormField
//                   control={form.control}
//                   name="cie_paper_file"
//                   render={({ field: { value, onChange, ...fieldProps } }) => (
//                     <FormItem>
//                       <FormLabel>CIE Paper (PDF)</FormLabel>
//                       <div className="flex items-center gap-2">
//                         <div className="relative flex-1">
//                           <FormControl>
//                             <Input
//                               {...fieldProps}
//                               type="file"
//                               accept=".pdf"
//                               onChange={(e) => {
//                                 const file = e.target.files?.[0];
//                                 if (file) {
//                                   onChange(file);
//                                 }
//                               }}
//                               className="cursor-pointer"
//                             />
//                           </FormControl>
//                         </div>
//                         {existingActual?.cie_paper_document && (
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={async () => {
//                               const { data } = await supabase.storage
//                                 .from("actual-cies") // Changed to new bucket
//                                 .getPublicUrl(
//                                   existingActual.cie_paper_document
//                                 );
//                               window.open(data.publicUrl, "_blank");
//                             }}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="marks_display_document" // New field
//                   render={({ field: { value, onChange, ...fieldProps } }) => (
//                     <FormItem>
//                       <FormLabel>Marks Sheet Submission (PDF)</FormLabel>
//                       <div className="flex items-center gap-2">
//                         <div className="relative flex-1">
//                           <FormControl>
//                             <Input
//                               {...fieldProps}
//                               type="file"
//                               accept=".pdf"
//                               onChange={(e) => {
//                                 const file = e.target.files?.[0];
//                                 if (file) {
//                                   onChange(file);
//                                 }
//                               }}
//                               className="cursor-pointer"
//                             />
//                           </FormControl>
//                         </div>
//                         {existingActual?.marks_display_document && (
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={async () => {
//                               const { data } = await supabase.storage
//                                 .from("actual-cies") // Changed to new bucket
//                                 .getPublicUrl(
//                                   existingActual.marks_display_document
//                                 );
//                               window.open(data.publicUrl, "_blank");
//                             }}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="evaluation_analysis_file"
//                   render={({ field: { value, onChange, ...fieldProps } }) => (
//                     <FormItem>
//                       <FormLabel>Evaluation Analysis (PDF)</FormLabel>
//                       <div className="flex items-center gap-2">
//                         <div className="relative flex-1">
//                           <FormControl>
//                             <Input
//                               {...fieldProps}
//                               type="file"
//                               accept=".pdf"
//                               onChange={(e) => {
//                                 const file = e.target.files?.[0];
//                                 if (file) {
//                                   onChange(file);
//                                 }
//                               }}
//                               className="cursor-pointer"
//                             />
//                           </FormControl>
//                         </div>
//                         {existingActual?.evalution_analysis_document && (
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={async () => {
//                               const { data } = await supabase.storage
//                                 .from("actual-cies") // Changed to new bucket
//                                 .getPublicUrl(
//                                   existingActual.evalution_analysis_document
//                                 );
//                               window.open(data.publicUrl, "_blank");
//                             }}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         )}
//                       </div>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex justify-end">
//             <Button
//               type="submit"
//               disabled={isSubmitting}
//               className="min-w-[120px]"
//             >
//               {isSubmitting ? "Submitting..." : "Submit CIE Data"}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     );
//   };

//   if (ciesFromForm.length === 0) {
//     return (
//       <Card>
//         <CardContent className="flex flex-col items-center justify-center py-12">
//           <FileText className="h-16 w-16 text-muted-foreground mb-4" />
//           <h3 className="text-lg font-semibold mb-2">No CIEs Found</h3>
//           <p className="text-muted-foreground text-center">
//             No CIE data found in the form. Please ensure CIEs are properly
//             configured in the lesson plan.
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList
//           className="grid w-full grid-cols-auto gap-2"
//           style={{ gridTemplateColumns: `repeat(${ciesFromForm.length}, 1fr)` }}
//         >
//           {ciesFromForm.map((cie: any) => {
//             const isActive = isCieActive(cie.date);
//             const existingActual = getExistingActual(cie.id);
//             const isSubmitted = existingActual?.is_submitted;
//             return (
//               <TabsTrigger
//                 key={cie.id}
//                 value={`cie-${cie.id}`}
//                 disabled={!isActive}
//                 className="relative"
//               >
//                 <div className="flex items-center gap-3">
//                   <span>CIE {cie.id.replace("cie", "")}</span>
//                   {isSubmitted && (
//                     <Badge variant="outline" className="text-xs bg-green-200 border border-green-600">
//                       Submitted
//                     </Badge>
//                   )}
//                   {!isActive && (
//                     <Badge variant="secondary" className="text-xs">
//                       Not Taken
//                     </Badge>
//                   )}
//                 </div>
//               </TabsTrigger>
//             );
//           })}
//         </TabsList>
//         {ciesFromForm.map((cie: any) => (
//           <TabsContent key={cie.id} value={`cie-${cie.id}`} className="mt-6">
//             <CieTabContent cieData={cie} />
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   );
// }





//@ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CalendarIcon, Eye, FileText } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, parse } from "date-fns"

// Helper function to parse DD-MM-YYYY and format to a readable string
const parseAndFormatDate = (dateString: string) => {
  if (!dateString) return "Not specified"
  const parsedDate = parse(dateString, "dd-MM-yyyy", new Date())
  if (isNaN(parsedDate.getTime())) {
    try {
      const isoParsedDate = parseISO(dateString)
      if (!isNaN(isoParsedDate.getTime())) {
        return format(isoParsedDate, "PPPP")
      }
    } catch (e) {
      const genericDate = new Date(dateString)
      if (!isNaN(genericDate.getTime())) {
        return format(genericDate, "PPPP")
      }
    }
    return "Invalid Date"
  }
  return format(parsedDate, "PPPP")
}

const formSchema = z.object({
  actual_units: z.string().min(1, "Required"),
  actual_pedagogy: z.string().min(1, "Required"),
  actual_date: z.string().min(1, "Required"),
  actual_duration: z.string().min(1, "Required"),
  actual_marks: z.number().min(0.1, "Must be positive"),
  co: z.string().min(1, "Required"),
  pso: z.string().min(1, "Required"),
  actual_blooms: z.string().min(1, "Required"),
  reason_for_change: z.string().optional(),
  quality_review_completed: z.boolean().default(false),
  quality_review_date: z.string().optional(),
  marks_display_date: z.string().optional(),
  cie_paper_file: z.any().optional(),
  evaluation_analysis_file: z.any().optional(),
  marks_display_document: z.any().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditActualFormProps {
  formsData: any
  actualCiesData: any[]
  userRoleData: any
  departmentPsoPeoData: any
}

export default function EditActualForm({
  formsData,
  actualCiesData,
  userRoleData,
  departmentPsoPeoData,
}: EditActualFormProps) {
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")

  // Extract CIEs from forms data
  const ciesFromForm = formsData.form?.cies || []

  // Structured evaluation pedagogy options matching the CIE planning form
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
  }

  // Flatten all pedagogy options for easy access
  const allPedagogyOptions = [
    ...evaluationPedagogyOptions.traditional,
    ...evaluationPedagogyOptions.alternative,
    ...evaluationPedagogyOptions.other,
  ]

  // Extract options from forms data for dropdowns
  const extractedOptions = {
    pedagogies: allPedagogyOptions,
    bloomsTaxonomy: [...new Set(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"])],
    courseOutcomes: formsData.form?.generalDetails?.courseOutcomes || [],
    units: formsData.form?.units || [],
    psoOptions: departmentPsoPeoData?.pso_data || [],
    peoOptions: departmentPsoPeoData?.peo_data || [],
  }

  // Set initial active tab
  useEffect(() => {
    if (ciesFromForm.length > 0 && !activeTab) {
      setActiveTab(`cie-${ciesFromForm[0].id}`)
    }
  }, [ciesFromForm, activeTab])

  // Check if CIE date has passed
  const isCieActive = (cieDate: string) => {
    if (!cieDate) return false
    const today = new Date()
    const cie = parse(cieDate, "dd-MM-yyyy", new Date())
    if (isNaN(cie.getTime())) {
      const fallbackCie = new Date(cieDate)
      return fallbackCie.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0)
    }
    return cie.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0)
  }

  // Get existing actual data for a CIE
  const getExistingActual = (cieId: string) => {
    const cieNumber = Number.parseInt(cieId.replace("cie", ""))
    return actualCiesData.find((actual) => actual.cie_number === cieNumber)
  }

  // Optimized file upload with parallel operations and better progress tracking
  const handleFileUpload = async (file: File, fileType: string, cieId: string, existingFilePath?: string) => {
    if (!file) return null

    try {
      const fileExt = file.name?.split(".").pop() || "pdf"
      const bucketName = "actual-cies"

      // Get subject info from formsData for better organization
      const subjectId = formsData.subject_id || "unknown-subject"
      const formId = formsData.id
      const cieNumber = cieId.replace("cie", "")

      // Create organized folder structure: subject_id/form_id/cie_number/
      const folderPath = `${subjectId}/${formId}/cie${cieNumber}`
      const fileName = `${fileType}-${Date.now()}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

      setUploadProgress(`Uploading ${fileType} file...`)

      // Upload new file first (faster approach)
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
        upsert: false,
        contentType: "application/pdf",
      })

      if (error) {
        console.error("File upload error:", error)
        setUploadProgress("")
        return null
      }

      // Delete old file in background (non-blocking)
      if (existingFilePath) {
        // Don't await this - let it run in background
        supabase.storage
          .from(bucketName)
          .remove([existingFilePath])
          .then(({ error: deleteError }) => {
            if (deleteError) {
              console.error("Error deleting old file:", deleteError)
            } else {
              console.log("Old file deleted successfully:", existingFilePath)
            }
          })
      }

      setUploadProgress("")
      console.log(`File uploaded successfully: ${filePath}`)
      return filePath
    } catch (error: any) {
      setUploadProgress("")
      console.error("File upload error:", error)
      return null
    }
  }

  // Save draft functionality - NO PDF uploads
  const handleSaveDraft = async (values: FormData, cieData: any) => {
    try {
      setIsDraftSaving(true)
      toast.info("Saving draft...")

      const cieNumber = Number.parseInt(cieData.id.replace("cie", ""))
      const existingActual = getExistingActual(cieData.id)

      // Draft data - exclude file uploads and file-related fields
      const draftData = {
        actual_blooms: values.actual_blooms || "",
        actual_date: values.actual_date || "",
        actual_duration: values.actual_duration || "",
        actual_marks: values.actual_marks || 0,
        actual_pedagogy: values.actual_pedagogy || "",
        actual_units: values.actual_units || "",
        cie_number: cieNumber,
        co: values.co || "",
        pso: values.pso || "",
        created_at: new Date().toISOString(),
        is_submitted: false,
        marks_display_date: values.marks_display_date || null,
        quality_review_completed: values.quality_review_completed || false,
        quality_review_date: values.quality_review_date || null,
        reason_for_change: values.reason_for_change || "",
        forms: formsData.id,
        // Keep existing file paths if they exist (don't overwrite on draft save)
        cie_paper_document: existingActual?.cie_paper_document || null,
        evalution_analysis_document: existingActual?.evalution_analysis_document || null,
        marks_display_document: existingActual?.marks_display_document || null,
      }

      let response
      if (existingActual) {
        // Update existing record
        response = await supabase.from("actual_cies").update(draftData).eq("id", existingActual.id).select()
      } else {
        // Insert new record
        response = await supabase.from("actual_cies").insert(draftData).select()
      }

      if (response.error) {
        throw new Error(response.error.message)
      }

      toast.success("Draft saved successfully!")
      // Reload to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      toast.error("Error saving draft!")
      console.error("Error saving draft:", error)
    } finally {
      setIsDraftSaving(false)
    }
  }

  // Submit functionality - WITH optimized PDF uploads
  const handleSubmit = async (values: FormData, cieData: any) => {
    try {
      setIsSubmitting(true)

      const cieNumber = Number.parseInt(cieData.id.replace("cie", ""))
      const existingActual = getExistingActual(cieData.id)

      // Check if files are attached and show upload toast
      const filesToUpload = []
      if (values.cie_paper_file && values.cie_paper_file instanceof File) {
        filesToUpload.push("CIE Paper")
      }
      if (values.evaluation_analysis_file && values.evaluation_analysis_file instanceof File) {
        filesToUpload.push("Evaluation Analysis")
      }
      if (values.marks_display_document && values.marks_display_document instanceof File) {
        filesToUpload.push("Marks Sheet")
      }

      if (filesToUpload.length > 0) {
        toast.info(`Uploading ${filesToUpload.length} file(s): ${filesToUpload.join(", ")}`)
      }

      // Prepare upload promises for parallel execution
      const uploadPromises = []
      let ciePaperDocument = existingActual?.cie_paper_document || null
      let evaluationAnalysisDocument = existingActual?.evalution_analysis_document || null
      let marksDisplayDocument = existingActual?.marks_display_document || null

      // Create upload promises for parallel execution
      if (values.cie_paper_file && values.cie_paper_file instanceof File) {
        uploadPromises.push(
          handleFileUpload(values.cie_paper_file, "paper", cieData.id, existingActual?.cie_paper_document).then(
            (path) => {
              if (path) ciePaperDocument = path
            },
          ),
        )
      }

      if (values.evaluation_analysis_file && values.evaluation_analysis_file instanceof File) {
        uploadPromises.push(
          handleFileUpload(
            values.evaluation_analysis_file,
            "analysis",
            cieData.id,
            existingActual?.evalution_analysis_document,
          ).then((path) => {
            if (path) evaluationAnalysisDocument = path
          }),
        )
      }

      if (values.marks_display_document && values.marks_display_document instanceof File) {
        uploadPromises.push(
          handleFileUpload(
            values.marks_display_document,
            "marks",
            cieData.id,
            existingActual?.marks_display_document,
          ).then((path) => {
            if (path) marksDisplayDocument = path
          }),
        )
      }

      // Execute all uploads in parallel
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
        toast.success("All files uploaded successfully!")
      }

      // Final submission data
      const actualData = {
        actual_blooms: values.actual_blooms,
        actual_date: values.actual_date,
        actual_duration: values.actual_duration,
        actual_marks: values.actual_marks,
        actual_pedagogy: values.actual_pedagogy,
        actual_units: values.actual_units,
        cie_number: cieNumber,
        cie_paper_document: ciePaperDocument,
        co: values.co,
        pso: values.pso,
        created_at: new Date().toISOString(),
        evalution_analysis_document: evaluationAnalysisDocument,
        is_submitted: true, // Mark as submitted
        marks_display_date: values.marks_display_date,
        quality_review_completed: values.quality_review_completed || false,
        quality_review_date: values.quality_review_date,
        reason_for_change: values.reason_for_change,
        forms: formsData.id,
        marks_display_document: marksDisplayDocument,
      }

      let response
      if (existingActual) {
        // Update existing record
        response = await supabase.from("actual_cies").update(actualData).eq("id", existingActual.id).select()
      } else {
        // Insert new record
        response = await supabase.from("actual_cies").insert(actualData).select()
      }

      if (response.error) {
        throw new Error(response.error.message)
      }

      toast.success("CIE data submitted successfully!")
      // Reload to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      toast.error("Error while submitting data!")
      console.error("Error while submitting data", error)
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  const CieTabContent = ({ cieData }: { cieData: any }) => {
    const existingActual = getExistingActual(cieData.id)
    const isActive = isCieActive(cieData.date)

    // FIXED: Correct CO mapping calculation
    const plannedCoNumbers =
      cieData.co_mapping
        ?.map((coId: string) => {
          // Find the CO in the courseOutcomes array by ID
          const coIndex = extractedOptions.courseOutcomes.findIndex((co: any) => co.id === coId)
          return coIndex !== -1 ? `CO${coIndex + 1}` : null
        })
        .filter(Boolean) // Remove null values
        .join(", ") || "Not specified"

    // FIXED: Correct PSO mapping calculation
    const plannedPsoNumbers =
      cieData.pso_mapping
        ?.map((psoId: string) => {
          // Find the PSO in the pso_data array by ID
          const psoIndex = extractedOptions.psoOptions.findIndex((pso: any) => pso.id === psoId)
          return psoIndex !== -1 ? `PSO${psoIndex + 1}` : null
        })
        .filter(Boolean) // Remove null values
        .join(", ") || "Not specified"

    // Map Unit IDs to Unit Numbers
    const plannedUnitNumbers =
      cieData.units_covered
        ?.map((unitId: string) => {
          const unitIndex = extractedOptions.units.findIndex((u: any) => u.id === unitId)
          return unitIndex !== -1 ? `Unit ${unitIndex + 1}` : null
        })
        .filter(Boolean) // Remove null values
        .join(", ") || "Not specified"

    const defaultValues: FormData = {
      actual_units: existingActual?.actual_units || "",
      actual_pedagogy: existingActual?.actual_pedagogy || cieData.evaluation_pedagogy || "",
      actual_date: existingActual?.actual_date || "",
      actual_duration: existingActual?.actual_duration || cieData.duration?.toString() || "",
      actual_marks: existingActual?.actual_marks || cieData.marks || 0,
      co: existingActual?.co || plannedCoNumbers, // Use corrected format
      pso: existingActual?.pso || plannedPsoNumbers, // Use corrected format
      actual_blooms:
        existingActual?.actual_blooms || (cieData.blooms_taxonomy ? cieData.blooms_taxonomy.join(", ") : ""),
      reason_for_change: existingActual?.reason_for_change || "",
      quality_review_completed: existingActual?.quality_review_completed || false,
      quality_review_date: existingActual?.quality_review_date || "",
      marks_display_date: existingActual?.marks_display_date || "",
      cie_paper_file: null,
      evaluation_analysis_file: null,
      marks_display_document: null,
    }

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
    })

    if (!isActive) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">CIE Not Yet Conducted</h3>
          <p className="text-muted-foreground mb-4">This CIE is scheduled for {parseAndFormatDate(cieData.date)}</p>
          <Badge variant="secondary">Scheduled</Badge>
        </div>
      )
    }

    const onSubmit = (values: FormData) => {
      handleSubmit(values, cieData)
    }

    const onSaveDraft = () => {
      handleSaveDraft(form.getValues(), cieData)
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Upload Progress Indicator */}
          {uploadProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">{uploadProgress}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Planned Details Card */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <p className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">Planned Details</p>
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">CIE Type:</p>
                    <p className="text-muted-foreground">{cieData.type || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Date:</p>
                    <p className="text-muted-foreground">
                      {cieData.date ? parseAndFormatDate(cieData.date) : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Duration:</p>
                    <p className="text-muted-foreground">{cieData.duration || 0} minutes</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Marks:</p>
                    <p className="text-muted-foreground">{cieData.marks || 0} marks</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Planned Pedagogy:</p>
                    <p className="text-muted-foreground">{cieData.evaluation_pedagogy || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">CO Mapping:</p>
                    <div className="text-muted-foreground break-words max-w-full">
                      <div className="flex flex-wrap gap-1">
                        {cieData.co_mapping?.map((coId: string) => {
                          const coIndex = extractedOptions.courseOutcomes.findIndex((c: any) => c.id === coId)
                          const coNumber = coIndex !== -1 ? coIndex + 1 : "?"
                          return (
                            <Badge key={coId} variant="outline" className="text-xs">
                              CO{coNumber}
                            </Badge>
                          )
                        }) || <span>Not specified</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">PSO Mapping:</p>
                    <div className="text-muted-foreground break-words max-w-full">
                      <div className="flex flex-wrap gap-1">
                        {cieData.pso_mapping?.map((psoId: string) => {
                          const psoIndex = extractedOptions.psoOptions.findIndex((pso: any) => pso.id === psoId)
                          const psoNumber = psoIndex !== -1 ? psoIndex + 1 : "?"
                          return (
                            <Badge key={psoId} variant="outline" className="text-xs">
                              PSO{psoNumber}
                            </Badge>
                          )
                        }) || <span>Not specified</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Blooms Taxonomy:</p>
                    <p className="text-muted-foreground">
                      {cieData.blooms_taxonomy ? cieData.blooms_taxonomy.join(", ") : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Units Covered:</p>
                    <p className="text-muted-foreground">{plannedUnitNumbers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actual Details Form */}
            <div className="space-y-6 mt-5">
              <h3 className="text-lg font-medium">
                <p className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">
                  Actual Implementation Details
                </p>
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
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? parseAndFormatDate(field.value) : <span>Select date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
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
                        <Input type="number" placeholder="Enter duration" {...field} />
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select evaluation pedagogy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {/* Traditional Pedagogy Group */}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                          Traditional Pedagogy
                        </div>
                        {evaluationPedagogyOptions.traditional.map((pedagogy) => (
                          <SelectItem key={pedagogy} value={pedagogy} className="pl-4">
                            {pedagogy}
                          </SelectItem>
                        ))}

                        {/* Alternative Pedagogy Group */}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 mt-2">
                          Alternative Pedagogy
                        </div>
                        {evaluationPedagogyOptions.alternative.map((pedagogy) => (
                          <SelectItem key={pedagogy} value={pedagogy} className="pl-4">
                            {pedagogy}
                          </SelectItem>
                        ))}

                        {/* Other Group */}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 mt-2">
                          Other
                        </div>
                        {evaluationPedagogyOptions.other.map((pedagogy) => (
                          <SelectItem key={pedagogy} value={pedagogy} className="pl-4">
                            {pedagogy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Units Covered *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter unit numbers (e.g., 1, 2, 3)" className="min-h-[80px]" {...field} />
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
                        <Input placeholder="e.g., CO1, CO2" {...field} />
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
                        <Input placeholder="e.g., PSO1, PSO2" {...field} />
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
                      <Textarea placeholder="e.g., Remember, Understand, Apply" {...field} />
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
            <h3 className="text-lg font-medium">
              <p className="text-[#1A5CA1] font-manrope font-bold text-[20px] leading-[25px]">
                Additional Information & Documents
              </p>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="quality_review_completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Quality Review Completed</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                {form.watch("quality_review_completed") && (
                  <FormField
                    control={form.control}
                    name="quality_review_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col ml-6">
                        <FormLabel>Quality Review Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? parseAndFormatDate(field.value) : <span>Select review date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? parseAndFormatDate(field.value) : <span>Select date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
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
                                const file = e.target.files?.[0]
                                if (file) {
                                  onChange(file)
                                }
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
                                .getPublicUrl(existingActual.cie_paper_document)
                              window.open(data.publicUrl, "_blank")
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
                                const file = e.target.files?.[0]
                                if (file) {
                                  onChange(file)
                                }
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
                                .getPublicUrl(existingActual.marks_display_document)
                              window.open(data.publicUrl, "_blank")
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
                                const file = e.target.files?.[0]
                                if (file) {
                                  onChange(file)
                                }
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
                                .getPublicUrl(existingActual.evalution_analysis_document)
                              window.open(data.publicUrl, "_blank")
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
              {isDraftSaving ? "Saving Draft..." : "Save Draft"}
            </Button>
            <Button type="submit" disabled={isSubmitting || isDraftSaving} className="min-w-[120px]">
              {isSubmitting ? "Submitting..." : "Submit CIE Data"}
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  if (ciesFromForm.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No CIEs Found</h3>
          <p className="text-muted-foreground text-center">
            No CIE data found in the form. Please ensure CIEs are properly configured in the lesson plan.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="grid w-full grid-cols-auto gap-2"
          style={{ gridTemplateColumns: `repeat(${ciesFromForm.length}, 1fr)` }}
        >
          {ciesFromForm.map((cie: any) => {
            const isActive = isCieActive(cie.date)
            const existingActual = getExistingActual(cie.id)
            const isSubmitted = existingActual?.is_submitted
            const isDraft = existingActual && !isSubmitted

            return (
              <TabsTrigger key={cie.id} value={`cie-${cie.id}`} disabled={!isActive} className="relative">
                <div className="flex items-center gap-3">
                  <span>CIE {cie.id.replace("cie", "")}</span>
                  {isSubmitted && (
                    <Badge variant="outline" className="text-xs bg-green-200 border border-green-600">
                      Submitted
                    </Badge>
                  )}
                  {isDraft && (
                    <Badge variant="outline" className="text-xs bg-yellow-200 border border-yellow-600">
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
            )
          })}
        </TabsList>
        {ciesFromForm.map((cie: any) => (
          <TabsContent key={cie.id} value={`cie-${cie.id}`} className="mt-6">
            <CieTabContent cieData={cie} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
