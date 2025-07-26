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
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, parse } from "date-fns"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface ViewActualCieFormProps {
    formsData: any;
    actualCieData: any[];
    userRoleData: any;
    departmentPsoPeoData: any;
}

export default function ViewActualCie({
    formsData,
    actualCieData,
    userRoleData,
    departmentPsoPeoData,
}: ViewActualCieFormProps) {
    const supabase = createClientComponentClient();
    const [activeTab, setActiveTab] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDraftSaving, setIsDraftSaving] = useState(false)
    useEffect(() => {
        if (actualCieData && actualCieData.length > 0) {
            setActiveTab(`cie-${actualCieData[0].id}`);
        }
    }, [actualCieData]);

    const getExistingActual = (cieId: string) => {
        const CieNumber = Number.parseInt(cieId.replace("cie", ""))
        return actualCieData.find((actual) => actual.cie_number === CieNumber)
    }

    console.log("test", formsData);


    return (
        <div>
            {formsData.form.cies.map((cie: any, index: number) => {
                const actual = getExistingActual(cie.id);
                if (!actual) return null;

                return (
                    <div key={index}>
                        <h1 className="font-semibold text-xl py-2">CIE {index + 1}</h1>
                        <Table className="border-1 mb-12 border-gray-300">
                            <TableCaption>{actual.number}</TableCaption>
                            <TableHeader className="bg-gray-200">
                                <TableRow className="border border-gray-300">
                                    {["", "Units", "Date", "Marks", "Duration", "CO/PSO", "Pedagogy", "Blooms Taxonomy"].map((header, idx) => (
                                        <TableHead
                                            key={idx}
                                            className="border whitespace-normal w-5 text-center border-gray-300 px-2 py-1"
                                        >
                                            {header === "Duration" ? (
                                                <div>
                                                    Duration
                                                    <div className="text-xs text-gray-500 leading-tight">(mins)</div>
                                                </div>
                                            ) : (
                                                header
                                            )}
                                        </TableHead>
                                    ))}

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="text-center" key={`row-${cie.id}`}>
                                    <TableCell className="font-medium">Planned</TableCell>
                                    <TableCell className="border-1 border-gray-200">
                                        {Array.isArray(formsData.form.unitPlanning?.units) &&
                                            Array.isArray(cie.units_covered) &&
                                            cie.units_covered.length > 0
                                            ? cie.units_covered
                                                .map((unitId) => {
                                                    const unit = formsData.form.unitPlanning.units.find((u) => u.id === unitId);
                                                    return unit?.unit_name ?? `-`;
                                                })
                                                .join(", ")
                                            : "-"}
                                    </TableCell>

                                    <TableCell className="border-1 border-gray-200">
                                        {formsData.form.cies[index].date || "-"}
                                    </TableCell>


                                    <TableCell className=" border-1 border-gray-200">{formsData.form.cies[index].marks ? `${formsData.form.cies[index].marks}` : "-"}</TableCell>
                                    <TableCell className=" border-1 border-gray-200">{formsData.form.cies[index].duration}
                                    </TableCell>
                                    <TableCell className="border border-gray-200 text-center">
                                        <div className="">
                                            {[
                                                ...(Array.isArray(formsData.form.cies[index].co_mapping)
                                                    ? formsData.form.cies[index].co_mapping.map((_, i) => `CO${i + 1}`)
                                                    : []),
                                                ...(Array.isArray(formsData.form.cies[index].pso_mapping)
                                                    ? formsData.form.cies[index].pso_mapping.map((_, i) => `PSO${i + 1}`)
                                                    : [])
                                            ].join(', ')}

                                        </div>
                                    </TableCell>

                                    <TableCell className="border border-gray-200 text-center">
                                        <div className="whitespace-normal w-50 mx-auto text-center">
                                            {formsData.form.cies[index].evaluation_pedagogy}
                                        </div>
                                    </TableCell>
                                    <TableCell className="border border-gray-200 text-center">
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {[
                                                ...(Array.isArray(formsData.form.cies[index].blooms_taxonomy)
                                                    ? formsData.form.cies[index].blooms_taxonomy.map((_, i) => `${_}`)
                                                    : []),
                                            ].join(', ')}
                                        </div>
                                    </TableCell>


                                </TableRow>
                                <TableRow className="text-center " key={`row2-${actual.id}`}>
                                    <TableCell className="font-medium">Actual</TableCell>
                                    <TableCell className="border-1 border-gray-200">
                                        {actual.actual_units
                                            ? (() => {
                                                const unitNames = actual.actual_units
                                                    .split(',')
                                                    .map((unitNumber) => {
                                                        const unitIndex = parseInt(unitNumber.trim()) - 1;
                                                        const unit = formsData.form.unitPlanning?.units?.[unitIndex];
                                                        return unit?.unit_name ?? null;
                                                    })
                                                    .filter(Boolean);

                                                return unitNames.length > 0 ? unitNames.join(', ') : "-";
                                            })()
                                            : "-"}
                                    </TableCell>


                                    <TableCell className="border-1 border-gray-200">{actual.actual_date ? format(parseISO(actual.actual_date), "dd-MM-yyyy") : "-"}</TableCell>
                                    <TableCell className=" border-1 border-gray-200">{actual.actual_marks ? `${actual.actual_marks}` : "-"}</TableCell>
                                    <TableCell className=" border-1 border-gray-200">{actual.actual_duration}</TableCell>
                                    <TableCell className="border border-gray-200 text-center">
                                        {(actual.co?.split(',').map((_, i) => `CO${i + 1}`) ?? [])
                                            .concat(actual.pso?.split(',').map((_, i) => `PSO${i + 1}`) ?? [])
                                            .join(',')}
                                    </TableCell>

                                    <TableCell className="border border-gray-200 text-center">
                                        <div className="whitespace-normal w-50 mx-auto text-center">
                                            {actual.actual_pedagogy}
                                        </div>
                                    </TableCell>

                                    <TableCell className="border border-gray-200 text-center">
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {actual.actual_blooms
                                                ? actual.actual_blooms
                                                    .split(',')
                                                    .map((bloom) => bloom.trim())
                                                    .join(', ')
                                                : "-"}

                                        </div>
                                    </TableCell>


                                </TableRow>
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableHead
                                        className={`border border-gray-200 text-center align-middle p-2`}>
                                        <p className={`whitespace-normal mx-auto text-sm leading-tight w-20`}>
                                            Quality Review Date</p>
                                        <div>{actual.quality_review_date ? format(parseISO(actual.quality_review_date), "dd-MM-yyyy") : "-"}</div>
                                    </TableHead>
                                    <TableHead
                                        className={`border border-gray-200 text-center align-middle p-2`}>
                                        <p className={`whitespace-normal mx-auto text-sm leading-tight w-20`}>
                                            Marks Display Document</p>
                                        <div className="text-gray-500 hover:underline italic text-[12px]"><Link className="" href="">{"View" || "Not Uploaded"}</Link></div>
                                    </TableHead>
                                    <TableHead colSpan={2}
                                        className={`border border-gray-200 text-center align-middle p-2`}>
                                        <p className={`whitespace-normal mx-auto text-sm leading-tight w-20`}>
                                            CIE Question Paper</p>
                                        <div className="text-gray-500 hover:underline italic text-[12px]"><Link className="" href="">{"View" || "Not Uploaded"}</Link></div>
                                    </TableHead>
                                    <TableHead colSpan={2}
                                        className={`border border-gray-200 text-center align-middle p-2`}>
                                        <p className={`whitespace-normal mx-auto text-sm leading-tight w-20`}>
                                            Evaluation Analysis Report</p>
                                        <div className="text-gray-500 hover:underline italic text-[12px]"><Link className="" href="">{"View" || "Not Uploaded"}</Link></div>
                                    </TableHead>
                                    <TableHead colSpan={2}
                                        className={`border border-gray-200 text-center align-middle p-2`}>
                                        <p className={`whitespace-normal mx-auto text-sm leading-tight w-20`}>
                                            Reason For Gap</p>
                                        <div className="text-gray-500 pt-2 hover:underline italic text-[12px]">{actual.reason_for_change || "Not Uploaded"}</div>
                                    </TableHead>

                                </TableRow>


                            </TableFooter>
                        </Table>
                    </div>
                );
            })}
        </div>
    )
}
