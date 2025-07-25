// @ts-nocheck
'use client'
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

export default function ViewActualCie({
    formsData,
    actualCieData,
    userRoleData,
    departmentPsoPeoData,
}: ViewActualCieFormProps) {
    const supabase = createClientComponentClient();
    const ciesFromForm = actualCieData || [];
    const [activeTab, setActiveTab] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDraftSaving, setIsDraftSaving] = useState(false)
    console.log(actualCieData)
    console.log(actualCieData.length)

    return (
        <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList
                    className="grid w-full grid-cols-auto gap-2"
                    style={{ gridTemplateColumns: `repeat(${actualCieData.length}, 1fr)` }}>
                    {actualCieData.map((cie: any, index: number) => {

                        return (
                            <TabsTrigger key={cie.id} value={`cie-${cie.id}`} className="relative">
                                <div className="flex items-center gap-3">
                                    <span>CIE {index + 1}</span>
                                </div>
                            </TabsTrigger>

                        )
                    })}
                </TabsList>
                {actualCieData.map((cie: any) => (

                    <TabsContent key={cie.id} value={`cie-${cie.id}`} className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">

                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold">CIE Date</p>
                                    <p>{format(parseISO(cie.actual_date), "yyyy-MM-dd") || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Blooms Taxonomy Followed</p>
                                    <div className="flex flex-row space-x-2 py-1">
                                        {cie.actual_blooms?.split(',').map((blooms: string, index: number) => (
                                            <div key={index}>
                                                <Badge className="bg-gray-100 text-black">{blooms.trim()}</Badge>
                                            </div>
                                        ))}
                                    </div>


                                </div>
                                <div>
                                    <p className="font-semibold">Syllabus Units</p>
                                    <p>{cie.actual_units || "-"}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">CIE Duration</p>
                                    <p>{cie.actual_duration || '-'} Minutes</p>
                                </div>
                                <div>
                                    <p className="font-semibold">PSO</p>
                                    <p>{cie.pso || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Quality Review Date</p>
                                    {cie.quality_review_date && cie.quality_review_date.length > 0 && (
                                        <p>{format(parseISO(cie.quality_review_date), "yyyy-MM-dd")}</p>
                                    )|| "-"}
                                </div>

                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold">CIE Number</p>
                                    <p>{cie.cie_number || "-"}</p>

                                </div>
                                <div>
                                    <p className="font-semibold">Pedagogy Followed</p>
                                    <p>{cie.actual_pedagogy || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Maximum Marks</p>
                                    <p>{cie.actual_marks || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">CO Mapping</p>
                                    <div className="flex flex-row space-x-1 py-1">
                                        {cie.co?.split(',').map((co: string, index: number) => (
                                            <div key={index}>
                                                <Badge className="bg-gray-100 text-black">CO{index + 1}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold">Reason For Change</p>
                                    <p>
                                        {cie.reason_for_change || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold">Quality Review Completed</p>
                                    <p>
                                        {cie.quality_review_complete ? "Yes" : "No" || "-"}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </TabsContent>
                ))}










            </Tabs>
        </div>
    )




}
