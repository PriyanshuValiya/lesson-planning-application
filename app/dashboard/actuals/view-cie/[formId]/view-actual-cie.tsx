// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
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
  formsData: any
  actualCieData: any[]
  userRoleData: any
  departmentPsoPeoData: any
}

export default function ViewActualCie({
  formsData,
  actualCieData,
  userRoleData,
  departmentPsoPeoData,
}: ViewActualCieFormProps) {
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)

  useEffect(() => {
    if (actualCieData && actualCieData.length > 0) {
      setActiveTab(`cie-${actualCieData[0].id}`)
    }
  }, [actualCieData])

  const getExistingActual = (cieId: string) => {
    const CieNumber = Number.parseInt(cieId.replace("cie", ""))
    return actualCieData.find((actual) => actual.cie_number === CieNumber)
  }

  const isPracticalCie = (cieType: string) => {
    return cieType?.toLowerCase().includes("practical")
  }

  const handleViewDocument = async (documentPath: string, documentName: string) => {
    if (!documentPath) {
      toast.error(`No ${documentName} available`)
      return
    }

    try {
      const { data } = await supabase.storage.from("actual-cies").getPublicUrl(documentPath)

      if (data?.publicUrl) {
        window.open(data.publicUrl, "_blank")
      } else {
        toast.error(`Unable to access ${documentName}`)
      }
    } catch (error) {
      console.error("Error accessing document:", error)
      toast.error(`Error accessing ${documentName}`)
    }
  }

  const getDisplayPedagogy = (pedagogy: string, customPedagogy?: string) => {
    if (pedagogy === "Other" && customPedagogy) {
      return customPedagogy
    }
    return pedagogy
  }

  const formatUnitNumber = (unitNum: string) => {
    const num = Number.parseInt(unitNum.trim())
    return num > 0 ? `${num}` : "-"
  }

  const getPracticalDisplay = (practicalIds: string[], formsData: any) => {
    if (!Array.isArray(practicalIds) || practicalIds.length === 0) return "-"

    return practicalIds
      .map((practicalId) => {
        const practical = formsData.form.practicals?.find((p: any) => p.id === practicalId)
        if (practical) {
          // Extract practical number from ID or use a counter
          const practicalIndex = formsData.form.practicals.findIndex((p: any) => p.id === practicalId) + 1
          return `${practicalIndex}`
        }
        return practicalId
      })
      .join(", ")
  }

  const formatActualPracticals = (actualUnits: string, formsData: any) => {
    if (!actualUnits) return "-"

    const practicalIds = actualUnits.split(",").map((id) => id.trim())
    return practicalIds
      .map((practicalId) => {
        const practical = formsData.form.practicals?.find((p: any) => p.id === practicalId)
        if (practical) {
          const practicalIndex = formsData.form.practicals.findIndex((p: any) => p.id === practicalId) + 1
          return `${practicalIndex}`
        }
        // If it's not found in practicals, it might be a unit number
        return formatUnitNumber(practicalId)
      })
      .join(", ")
  }

  return (
    <div>
      {formsData.form.cies.map((cie: any, index: number) => {
        const actual = getExistingActual(cie.id)
        if (!actual) return null

        const isThisPractical = isPracticalCie(cie.type)

        return (
          <div key={index}>
            <h1 className="font-semibold text-xl py-2">CIE {index + 1}</h1>
            <Table className="border-1 border-gray-300">
              <TableCaption>{actual.number}</TableCaption>
              <TableHeader className="bg-gray-200">
                <TableRow className="border border-gray-300">
                  {[
                    "",
                    isThisPractical ? "Practicals" : "Units",
                    "Date",
                    "Marks",
                    "Duration",
                    "CO / PSO",
                    "Pedagogy",
                    "Blooms Taxonomy",
                  ].map((header, idx) => (
                    <TableHead key={idx} className="border whitespace-normal w-5 text-center border-gray-300 px-2 py-1">
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
                    {isThisPractical
                      ? // Display practicals for practical CIEs
                        Array.isArray(cie.practicals_covered) && cie.practicals_covered.length > 0
                        ? getPracticalDisplay(cie.practicals_covered, formsData)
                        : "-"
                      : // Display units for non-practical CIEs
                        Array.isArray(cie.units_covered) && cie.units_covered.length > 0
                        ? cie.units_covered
                            .map((unitId) => {
                              const unitIndex = formsData.form.unitPlanning.units.findIndex((u) => u.id === unitId) + 1
                              return unitIndex > 0 ? `${unitIndex}` : "-"
                            })
                            .join(", ")
                        : "-"}
                  </TableCell>
                  <TableCell className="border-1 border-gray-200">{cie.date || "-"}</TableCell>
                  <TableCell className=" border-1 border-gray-200">{cie.marks ? `${cie.marks}` : "-"}</TableCell>
                  <TableCell className=" border-1 border-gray-200">{cie.duration}</TableCell>
                  <TableCell className="border border-gray-200 text-center">
                    <div>
                      {[
                        ...(Array.isArray(cie.co_mapping) ? cie.co_mapping.map((_, i) => `CO${i + 1}`) : []),
                        ...(Array.isArray(cie.pso_mapping) ? cie.pso_mapping.map((_, i) => `PSO${i + 1}`) : []),
                      ].join(", ")}
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-200 text-center">
                    <div className="whitespace-normal w-50 mx-auto text-center">
                      {getDisplayPedagogy(cie.evaluation_pedagogy, cie.custom_pedagogy || cie.other_pedagogy)}
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-200 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {Array.isArray(cie.blooms_taxonomy) ? cie.blooms_taxonomy.join(", ") : "-"}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="text-center " key={`row2-${actual.id}`}>
                  <TableCell className="font-medium">Actual</TableCell>
                  <TableCell className="border-1 border-gray-200">
                    {isThisPractical
                      ? // Display actual practicals for practical CIEs
                        actual.actual_units
                        ? formatActualPracticals(actual.actual_units, formsData)
                        : "-"
                      : // Display actual units for non-practical CIEs
                        actual.actual_units
                        ? actual.actual_units
                            .split(",")
                            .map((unitNum) => formatUnitNumber(unitNum))
                            .join(", ")
                        : "-"}
                  </TableCell>
                  <TableCell className="border-1 border-gray-200">
                    {actual.actual_date ? format(parseISO(actual.actual_date), "dd-MM-yyyy") : "-"}
                  </TableCell>
                  <TableCell className=" border-1 border-gray-200">
                    {actual.actual_marks ? `${actual.actual_marks}` : "-"}
                  </TableCell>
                  <TableCell className=" border-1 border-gray-200">{actual.actual_duration}</TableCell>
                  <TableCell className="border border-gray-200 text-center">
                    {(actual.co?.split(",").map((_, i) => `CO${i + 1}`) ?? [])
                      .concat(actual.pso?.split(",").map((_, i) => `PSO${i + 1}`) ?? [])
                      .join(", ")}
                  </TableCell>
                  <TableCell className="border border-gray-200 text-center">
                    <div className="whitespace-normal w-50 mx-auto text-center">{actual.actual_pedagogy}</div>
                  </TableCell>
                  <TableCell className="border border-gray-200 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {actual.actual_blooms
                        ? actual.actual_blooms
                            .split(",")
                            .map((bloom) => bloom.trim())
                            .join(", ")
                        : "-"}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableHead className={`border border-gray-200 text-center align-middle p-2`}>
                    <p className={`whitespace-normal mx-auto text-sm leading-tight w-20`}>
                      Moderation <p className="text-xs">Reviews Date</p>
                    </p>
                    <div className="mt-1">
                      {actual.moderation_start_date ? (
                        format(parseISO(actual.moderation_start_date), "dd-MM-yyyy")
                      ) : (
                        <p className="text-xs">Not Reviewed</p>
                      )}<br />
                      {actual.moderation_end_date ? (
                        format(parseISO(actual.moderation_end_date), "dd-MM-yyyy")
                      ) : (
                        <p className="text-xs">Not Reviewed</p>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className={`border border-gray-200 text-center align-middle p-2`}>
                    <p className={`flex flex-col whitespace-normal mx-auto text-sm leading-tight w-20`}>
                      <p>View</p>
                      <button
                        className="underline cursor-pointer"
                        onClick={() => handleViewDocument(actual.marks_display_document, "Marks Display Document")}
                      >
                        {actual.marks_display_document ? (
                          <p className="mt-1">Mark Sheet</p>
                        ) : (
                          <p className="text-xs mt-1">Not Uploaded</p>
                        )}
                      </button>
                    </p>
                  </TableHead>
                  <TableHead colSpan={2} className={`border border-gray-200 text-center align-middle p-2`}>
                    <p className={`flex flex-col whitespace-normal mx-auto text-sm leading-tight w-20`}>
                      <p>View</p>
                      <button
                        className="underline cursor-pointer"
                        onClick={() => handleViewDocument(actual.cie_paper_document, "CIE Question Paper")}
                      >
                        {actual.cie_paper_document ? (
                          <p className="mt-1">CIE Paper</p>
                        ) : (
                          <p className="text-xs mt-1">Not Uploaded</p>
                        )}
                      </button>
                    </p>
                  </TableHead>
                  <TableHead colSpan={2} className={`border border-gray-200 text-center align-middle p-2`}>
                    <p className={`flex flex-col whitespace-normal mx-auto text-sm leading-tight`}>
                      <p>View</p>
                      <button
                        className="underline cursor-pointer"
                        onClick={() =>
                          handleViewDocument(actual.evalution_analysis_document, "Evaluation Analysis Report")
                        }
                      >
                        {actual.evalution_analysis_document ? (
                          <p className="mt-1">Evaluation Analysis Report</p>
                        ) : (
                          <p className="text-xs mt-1">Not Uploaded</p>
                        )}
                      </button>
                    </p>
                  </TableHead>
                  <TableHead colSpan={2} className={`border border-gray-200 p-2`}>
                    <div className="flex items-center justify-left h-full">
                      <p className={`text-sm font-medium text-gray-700 mb-1`}>Reason For Gap :</p>
                      <div
                        className={`ml-1 text-center ${
                          actual.reason_for_change ? "text-gray-700" : "text-gray-400 italic"
                        }`}
                      >
                        {actual.reason_for_change || "Not Provided"}
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )
      })}
    </div>
  )
}
