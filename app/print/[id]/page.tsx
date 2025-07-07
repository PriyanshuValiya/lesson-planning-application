"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { fetchViewLP } from "@/app/dashboard/actions/fetchViewLP";
import { isSubjectTheoryOnly, isSubjectPracticalOnly } from "@/utils/dateUtils";

const getAcademicYear = (dateString: string) => {
  if (!dateString) return "N/A";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = Number.parseInt(parts[2], 10);
    return `${year}-${(year % 100) + 1}`;
  }
  return "N/A";
};

export default function PrintLessonPlanPage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [lessonPlan, setLessonPlan] = useState<any>(null);
  const [userDataPlan, setUserDataPlan] = useState<any>(null);
  const hasPrinted = useRef(false);

  useEffect(() => {
    const loadLessonPlan = async () => {
      try {
        setIsLoading(true);
        const result = await fetchViewLP(params.id as string);
        if (result.success) {
          setLessonPlan(result.data);
          setUserDataPlan(result.userRoleData);
        } else {
          console.error(result || "Failed to load lesson plan");
        }
      } catch (error) {
        console.error("Error loading lesson plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadLessonPlan();
    }
  }, [params.id]);

  useEffect(() => {
    if (lessonPlan && !isLoading && !hasPrinted.current) {
      setTimeout(() => {
        window.print();
        hasPrinted.current = true;
      }, 200);
    }
  }, [lessonPlan, isLoading]);

  const handlePrint = () => {
    window.print();
  };

  // Helper function to format date in DDMMYYYY format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to get section numbers dynamically
  const getSectionNumber = (currentLessonPlan: any) => {
    // Accept lessonPlan as argument
    let sectionNumber = 2;
    const sections = [];
    // Only add Unit Details for non-practical-only subjects
    if (!isSubjectPracticalOnly(currentLessonPlan.subjects)) {
      sections.push({
        number: sectionNumber++,
        name: "UNIT DETAILS",
        type: "units",
      });
    }
    // Only add Practical Details for non-theory-only subjects
    if (!isSubjectTheoryOnly(currentLessonPlan.subjects)) {
      sections.push({
        number: sectionNumber++,
        name: "PRACTICAL DETAILS",
        type: "practicals",
      });
    }
    sections.push({
      number: sectionNumber++,
      name: "CIE DETAILS",
      type: "cie",
    });
    sections.push({
      number: sectionNumber++,
      name: "ADDITIONAL DETAILS",
      type: "additional",
    });
    sections.push({
      number: sectionNumber++,
      name: "COMPLETION STATUS",
      type: "completion",
    });
    return sections;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading lesson plan for printing...
      </div>
    );
  }

  if (!lessonPlan || !userDataPlan) {
    return (
      <div className="text-center text-red-500">
        Lesson plan not found or you don&apos;t have permission to view it.
      </div>
    );
  }

  // Now that lessonPlan is guaranteed to be not null, we can safely call getSectionNumber
  const sections = getSectionNumber(lessonPlan);

  return (
    <>
      {/* Print Button - Hidden during print */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print Lesson Plan
        </Button>
      </div>

      <div
        className="w-full p-8 bg-white text-black font-sans"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <style jsx global>{`
          @page {
            size: A4 landscape;
            margin: 15mm 10mm 15mm 10mm;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              width: 100%;
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif !important;
            }
            /* Hide all non-essential elements during print */
            .print\\:hidden {
              display: none !important;
            }
            /* Ensure proper page breaks */
            .page-break-before {
              page-break-before: always;
            }
            .page-break-after {
              page-break-after: always;
            }
            /* Section headers should not break */
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              page-break-after: avoid;
              page-break-inside: avoid;
            }
            /* Keep table headers with content */
            thead {
              display: table-header-group;
            }
            /* Table styling for print */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              page-break-inside: auto;
            }
            th,
            td {
              padding: 3px !important;
              border: 1px solid black !important;
              vertical-align: top !important;
              font-size: 8.5pt !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              white-space: normal !important;
            }
            /* Prevent table rows from breaking across pages when possible */
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            /* Specific table column widths for better layout */
            .unit-details-table th:nth-child(1),
            .unit-details-table td:nth-child(1) {
              width: 4% !important;
            }
            .unit-details-table th:nth-child(2),
            .unit-details-table td:nth-child(2) {
              width: 16% !important;
            }
            .unit-details-table th:nth-child(3),
            .unit-details-table td:nth-child(3) {
              width: 35% !important;
            }
            .unit-details-table th:nth-child(4),
            .unit-details-table td:nth-child(4),
            .unit-details-table th:nth-child(5),
            .unit-details-table td:nth-child(5) {
              width: 8% !important;
            }
            .unit-details-table th:nth-child(6),
            .unit-details-table td:nth-child(6),
            .unit-details-table th:nth-child(7),
            .unit-details-table td:nth-child(7) {
              width: 11% !important;
            }
            /* Section spacing */
            .mb-6 {
              margin-bottom: 12pt !important;
            }
            /* Header section */
            .text-center {
              text-align: center !important;
            }
            .text-xl {
              font-size: 12pt !important;
              font-weight: bold !important;
            }
            .text-lg {
              font-size: 11pt !important;
              font-weight: bold !important;
            }
            .text-md {
              font-size: 10pt !important;
              font-weight: 600 !important;
            }
            /* Ensure sections don't break awkwardly */
            .units-section {
              page-break-inside: avoid;
            }
            /* Digital signature at bottom */
            .text-right {
              text-align: right !important;
              margin-top: 20pt !important;
            }
            /* Force page breaks before major sections if needed */
            .section-break {
              page-break-before: always;
            }
            /* Add this to ensure each section starts on a new page */
            .units-section,
            .practicals-section,
            .cie-section,
            .additional-section {
              page-break-before: always;
            }
          }
        `}</style>

        {/* Header Section */}
        <div className="text-center mb-8 space-y-1">
          <h1 className="text-xl font-bold">
            Charotar University of Science and Technology (CHARUSAT)
          </h1>
          <h2 className="text-xl font-bold">
            {userDataPlan?.departments?.institutes?.name} (
            {userDataPlan?.departments?.institutes?.abbreviation_insti})
          </h2>
          <h3 className="text-xl font-bold">
            Department of {userDataPlan?.departments.name}
          </h3>
          <h4 className="text-xl font-bold">Lesson Planning Document (LPD)</h4>
        </div>

        {/* 1. GENERAL DETAILS */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">1. GENERAL DETAILS</h2>
          <table className="w-full border-collapse table-fixed">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Faculty Name:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.users.name}
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0 w-[10%]">
                  Faculty Email:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0 w-[25%]">
                  {lessonPlan.users.email}
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0 w-[11%]">
                  Department:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0 w-[25%]">
                  {lessonPlan.subjects.departments.name} (
                  {lessonPlan.subjects.departments.abbreviation_depart})
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Subject Code:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.subjects.code}
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0 w-[10%]">
                  Subject Name:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.subjects.name}
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Term Duration:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.subjects.metadata.term_start_date} to{" "}
                  {lessonPlan.subjects.metadata.term_end_date}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Semester:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.subjects.semester}
                  <sup>
                    {lessonPlan.subjects.semester === 1
                      ? "st"
                      : lessonPlan.subjects.semester === 2
                      ? "nd"
                      : lessonPlan.subjects.semester === 3
                      ? "rd"
                      : "th"}
                  </sup>{" "}
                  semester
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Division:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.form.generalDetails.division}
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Academic Year:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {getAcademicYear(
                    lessonPlan?.subjects?.metadata.term_start_date
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Lecture Hours/week:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.form.generalDetails.lecture_hours}
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Lab Hours/week:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.form.generalDetails.lab_hours}
                </td>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Credits:
                </td>
                <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                  {lessonPlan.form.generalDetails.credits}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Course Prerequisites:
                </td>
                <td
                  className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0"
                  colSpan={5}
                >
                  {lessonPlan.form.generalDetails.course_prerequisites || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                  Course Prerequisites Materials:
                </td>
                <td
                  className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0"
                  colSpan={5}
                >
                  {lessonPlan.form.generalDetails
                    .course_prerequisites_materials || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Render sections dynamically */}
        {sections.map((section) => {
          if (section.type === "units") {
            return (
              <div key="units" className="mb-6 units-section">
                <h2 className="text-lg font-bold mb-2">
                  {section.number}. {section.name}
                </h2>
                {(lessonPlan.form.unitPlanning?.units || []).map(
                  (unit: any, index: number) => (
                    <div
                      key={unit.id}
                      className={index > 0 ? "section-break" : ""}
                    >
                      <h3 className="text-lg font-semibold mb-2 mt-5">
                        Unit {index + 1}
                      </h3>
                      <table className="w-full border-collapse table-fixed mb-4">
                        <tbody>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                              Unit Name:
                            </td>
                            <td className="border border-black p-2 w-[30%]">
                              {unit.unit_name}
                            </td>
                            <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                              Faculty Name:
                            </td>
                            <td className="border border-black p-2 w-[30%]">
                              {unit.faculty_name}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Start Date:
                            </td>
                            <td className="border border-black p-2">
                              {formatDate(unit.probable_start_date)}
                            </td>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              End Date:
                            </td>
                            <td className="border border-black p-2">
                              {formatDate(unit.probable_end_date)}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                              No. of Lectures:
                            </td>
                            <td className="border border-black p-2 w-[30%]">
                              {unit.no_of_lectures}
                            </td>
                            <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                              CO Mapping:
                            </td>
                            <td className="border border-black p-2" colSpan={3}>
                              {unit.co_mapping
                                .map((coId: any) => {
                                  const outcomeIndex =
                                    lessonPlan.form.generalDetails.courseOutcomes.findIndex(
                                      (co: any) => co.id === coId
                                    );
                                  return outcomeIndex !== -1
                                    ? `CO${outcomeIndex + 1}`
                                    : coId;
                                })
                                .join(", ")}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Unit Topics:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.unit_topics}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Self Study Topics:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.self_study_topics || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Self Study Materials:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.self_study_materials || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Teaching Pedagogy:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.teaching_pedagogy.join(", ")}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Skill Mapping:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.skill_mapping.join(", ")}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Unit Materials:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.unit_materials || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Skill Objectives:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.skill_objectives || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Topics Beyond Unit:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.topics_beyond_unit || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 font-bold bg-gray-50">
                              Interlink Topics:
                            </td>
                            <td
                              className="border border-black p-2 text-sm break-words whitespace-normal"
                              colSpan={3}
                            >
                              {unit.interlink_topics || "N/A"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            );
          }

          if (section.type === "practicals") {
            return (
              <div
                key="practicals"
                className="mb-6 section-break practicals-section"
              >
                <h2 className="text-lg font-bold mb-2">
                  {section.number}. {section.name}
                </h2>
                {lessonPlan.form.practicals &&
                  lessonPlan.form.practicals.length > 0 && (
                    <div className="mb-6">
                      {lessonPlan.form.practicals.map(
                        (practical: any, index: number) => (
                          <div
                            key={index}
                            className={index > 0 ? "section-break" : ""}
                          >
                            <h3 className="text-lg font-semibold mb-2">
                              Practical {index + 1}
                            </h3>
                            <table className="w-full border-collapse table-fixed mb-4">
                              <tbody>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                                    Faculty Name:
                                  </td>
                                  <td className="border border-black p-2 w-[30%]">
                                    {lessonPlan.users.name}
                                  </td>
                                  <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                                    Lab Hours:
                                  </td>
                                  <td className="border border-black p-2 w-[30%]">
                                    {practical.lab_hours}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Probable Week:
                                  </td>
                                  <td className="border border-black p-2">
                                    {practical.probable_week}
                                  </td>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    CO Mapping:
                                  </td>
                                  <td className="border border-black p-2">
                                    {practical.co_mapping
                                      .map((coId: any) => {
                                        const outcomeIndex =
                                          lessonPlan.form.generalDetails.courseOutcomes.findIndex(
                                            (co: any) => co.id === coId
                                          );
                                        return outcomeIndex !== -1
                                          ? `CO${outcomeIndex + 1}`
                                          : coId;
                                      })
                                      .join(", ")}
                                  </td>
                                </tr>
                                {practical.pso_mapping.length > 0 && (
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      PSO Mapping:
                                    </td>
                                    <td
                                      className="border border-black p-2"
                                      colSpan={3}
                                    >
                                      {Array.isArray(practical.pso_mapping)
                                        ? practical.pso_mapping.join(", ")
                                        : practical.pso_mapping}
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Practical Aim:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {practical.practical_aim}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Practical Tasks:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {practical.practical_tasks}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Practical Pedagogy:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {practical.practical_pedagogy}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Evaluation Methods:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {Array.isArray(practical.evaluation_methods)
                                      ? practical.evaluation_methods.join(", ")
                                      : practical.evaluation_methods}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Associated Units:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {Array.isArray(practical.associated_units)
                                      ? practical.associated_units.join(", ")
                                      : practical.associated_units}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Blooms Taxonomy:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {Array.isArray(practical.blooms_taxonomy)
                                      ? practical.blooms_taxonomy.join(", ")
                                      : practical.blooms_taxonomy}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Skill Mapping:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {Array.isArray(practical.skill_mapping)
                                      ? practical.skill_mapping.join(", ")
                                      : practical.skill_mapping}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Skill Objectives:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {practical.skill_objectives}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Reference Material:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {practical.reference_material}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-black p-2 font-bold bg-gray-50">
                                    Software/Hardware Requirements:
                                  </td>
                                  <td
                                    className="border border-black p-2 text-sm break-words whitespace-normal"
                                    colSpan={3}
                                  >
                                    {practical.software_hardware_requirements}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            );
          }

          if (section.type === "cie") {
            // Define the order of evaluation types
            const evaluationTypeOrder = [
              "Course Prerequisites CIE",
              "Lecture CIE",
              "Practical CIE", // This will now include Internal Practical
              "Mid-term/Internal Exam",
            ];

            // Group CIE by evaluation type in the specified order
            const cieGroups: {
              type: string;
              cies: any[];
              showTotal: boolean;
            }[] = [
              {
                type: "Course Prerequisites CIE",
                cies: [],
                showTotal: false,
              },
              { type: "Lecture CIE", cies: [], showTotal: true },
              { type: "Practical CIE", cies: [], showTotal: true },
              { type: "Mid-term/Internal Exam", cies: [], showTotal: false },
            ];

            // Populate the groups
            lessonPlan.form.cies?.forEach((cie: any) => {
              const type = cie.type || "Other";
              // Combine Practical CIE and Internal Practical
              if (type === "Internal Practical") {
                cieGroups[2].cies.push({ ...cie, originalType: type });
              } else {
                const group = cieGroups.find((g) => g.type === type);
                if (group) {
                  group.cies.push(cie);
                }
              }
            });

            // Calculate overall totals
            const totalMarks =
              lessonPlan.form.cies?.reduce(
                (sum: number, cie: any) => sum + (cie.marks || 0),
                0
              ) || 0;

            const totalDuration =
              lessonPlan.form.cies?.reduce(
                (sum: number, cie: any) => sum + (cie.duration || 0),
                0
              ) || 0;

            // Format duration for totals (x hours xx minutes)
            const formatDurationTotal = (minutes: number) => {
              if (minutes >= 60) {
                const hours = Math.floor(minutes / 60);
                const mins = Math.floor(minutes % 60);
                return (
                  <div className="flex flex-col items-center">
                    <span>
                      {hours} hour{hours !== 1 ? "s" : ""}
                    </span>
                    {mins > 0 && <span>{mins} minutes</span>}
                  </div>
                );
              }
              return `${minutes} minutes`;
            };

            // Format duration for individual rows (just minutes)
            const formatDurationIndividual = (minutes: number) => {
              return `${minutes || 0}`;
            };

            // Track global index for numbering across all tables
            let globalIndex = 0;

            // Column width classes for consistent sizing
            const colClasses = {
              no: "w-[5%] min-w-[30px]",
              unit: "w-[12%] min-w-[100px]",
              date: "w-[8%] min-w-[80px]",
              marks: "w-[6%] min-w-[50px]",
              duration: "w-[8%] min-w-[70px]",
              evalType: "w-[12%] min-w-[100px]",
              blooms: "w-[12%] min-w-[100px]",
              pedagogy: "w-[14%] min-w-[120px]",
              copso: "w-[12%] min-w-[100px]",
              skills: "w-[8%] min-w-[70px]",
            };

            return (
              <div key="cie" className="mb-6 cie-section">
                <h2 className="text-lg font-bold mb-2">
                  {section.number}. {section.name}
                </h2>
                {/* Header Table - Only shown once */}
                <div className="mb-0">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.no}`}
                        >
                          No.
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.unit}`}
                        >
                          Unit Covered
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.date}`}
                        >
                          Date
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.marks}`}
                        >
                          Marks
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.duration}`}
                        >
                          Duration (mins)
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.evalType}`}
                        >
                          Evaluation Type
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.blooms}`}
                        >
                          Bloom's Taxonomy
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.pedagogy}`}
                        >
                          Evaluation Pedagogy
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.copso}`}
                        >
                          CO/PSO/PEO
                        </th>
                        <th
                          className={`border border-black p-2 font-bold text-center break-words ${colClasses.skills}`}
                        >
                          Skills
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                {/* Data Tables */}
                {cieGroups.map(({ type, cies, showTotal }) => {
                  if (cies.length === 0) return null;

                  const groupMarks = cies.reduce(
                    (sum, cie) => sum + (cie.marks || 0),
                    0
                  );
                  const groupDuration = cies.reduce(
                    (sum, cie) => sum + (cie.duration || 0),
                    0
                  );

                  return (
                    <div key={type} className="mb-2">
                      <table className="w-full border-collapse table-fixed">
                        <tbody>
                          {cies.map((cie) => {
                            globalIndex++;
                            return (
                              <tr key={cie.id || globalIndex}>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.no}`}
                                >
                                  {globalIndex}
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.unit}`}
                                >
                                  {(() => {
                                    if (typeof cie.units_covered === "string") {
                                      if (
                                        !cie.units_covered ||
                                        cie.units_covered.trim() === ""
                                      )
                                        return "-";
                                      const unitIds = cie.units_covered
                                        .split(",")
                                        .map((id: any) => id.trim());
                                      if (
                                        unitIds.some(
                                          (id: any) =>
                                            id.length > 20 && id.includes("-")
                                        )
                                      ) {
                                        const mappedUnits = unitIds
                                          .map((unitId: any) => {
                                            const unitIndex =
                                              lessonPlan.form.units?.findIndex(
                                                (u: any) => u.id === unitId
                                              );
                                            return unitIndex !== -1
                                              ? unitIndex + 1
                                              : null;
                                          })
                                          .filter((num: any) => num !== null);
                                        return mappedUnits.length > 0
                                          ? mappedUnits.join(", ")
                                          : "-";
                                      }
                                      return cie.units_covered;
                                    }
                                    if (Array.isArray(cie.units_covered)) {
                                      if (cie.units_covered.length === 0)
                                        return "-";
                                      const unitNumbers = cie.units_covered
                                        .map((unitId: any) => {
                                          const unitIndex =
                                            lessonPlan.form.units?.findIndex(
                                              (u: any) => u.id === unitId
                                            );
                                          return unitIndex !== -1
                                            ? unitIndex + 1
                                            : null;
                                        })
                                        .filter((num: any) => num !== null);
                                      return unitNumbers.length > 0
                                        ? unitNumbers.join(", ")
                                        : "-";
                                    }
                                    return "-";
                                  })()}
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.date}`}
                                >
                                  {cie.date ? cie.date.replace(/-/g, "/") : "-"}
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.marks}`}
                                >
                                  <div className="flex flex-col">
                                    <p>{cie?.marks || "-"}</p>
                                    <p className="text-sm">Marks</p>
                                  </div>
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.duration}`}
                                >
                                  <div className="flex flex-col">
                                    <p>
                                      {formatDurationIndividual(
                                        cie.duration || 0
                                      )}
                                    </p>
                                    <p className="text-sm">mins</p>
                                  </div>
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.evalType}`}
                                >
                                  {cie.originalType || cie.type || "-"}
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.blooms}`}
                                >
                                  {cie.blooms_taxonomy &&
                                  cie.blooms_taxonomy.length > 0
                                    ? cie.blooms_taxonomy.join(", ")
                                    : "-"}
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.pedagogy}`}
                                >
                                  {cie.evaluation_pedagogy || "-"}
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.copso}`}
                                >
                                  {(() => {
                                    const mappings = [];
                                    if (
                                      cie.co_mapping &&
                                      cie.co_mapping.length > 0
                                    ) {
                                      const coNumbers = cie.co_mapping.map(
                                        (coId: any, idx: number) =>
                                          `CO${idx + 1}`
                                      );
                                      mappings.push(...coNumbers);
                                    }
                                    if (
                                      cie.pso_mapping &&
                                      cie.pso_mapping.length > 0
                                    ) {
                                      const psoNumbers = cie.pso_mapping.map(
                                        (pso: any) => pso.toUpperCase()
                                      );
                                      mappings.push(...psoNumbers);
                                    }
                                    if (
                                      cie.peo_mapping &&
                                      cie.peo_mapping.length > 0
                                    ) {
                                      const peoNumbers = cie.peo_mapping.map(
                                        (peo: any) => peo.toUpperCase()
                                      );
                                      mappings.push(...peoNumbers);
                                    }
                                    return mappings.length > 0
                                      ? mappings.join(", ")
                                      : "-";
                                  })()}
                                </td>
                                <td
                                  className={`border border-black p-2 text-center break-words ${colClasses.skills}`}
                                >
                                  {cie.skill_mapping &&
                                  cie.skill_mapping.length > 0
                                    ? cie.skill_mapping
                                        .map((skill: any) =>
                                          typeof skill === "object"
                                            ? skill.skill
                                            : skill
                                        )
                                        .join(", ")
                                    : "-"}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Group Total Row - Only for tables that should show totals */}
                          {showTotal && (
                            <tr className="font-bold">
                              <td
                                className={`border border-black p-2 text-right ${colClasses.unit} w-[347px]`}
                                colSpan={3}
                              >
                                Total
                              </td>
                              <td
                                className={`border border-black p-2 text-center ${colClasses.marks} w-[84px]`}
                              >
                                <div className="flex flex-col">
                                  <p>{groupMarks}</p>
                                  <p className="text-sm">Marks</p>
                                </div>
                              </td>
                              <td
                                className={`border border-black p-2 text-center ${colClasses.duration} w-[111px]`}
                              >
                                {formatDurationTotal(groupDuration)}
                              </td>
                              <td
                                className={`border border-black p-2 text-center`}
                                colSpan={5}
                              >
                                {/* Merges last 5 columns */}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
                {/* Overall Total Row */}
                <div className="mt-2">
                  <table className="w-full border-collapse table-fixed">
                    <tbody>
                      <tr className="font-bold">
                        <td
                          className={`border border-black p-2 text-right w-[374px]`}
                          colSpan={2}
                        >
                          {/* Merges No., Unit, and Date columns */}
                          Overall Total
                        </td>
                        <td
                          className={`border border-black p-2 text-center ${colClasses.marks} w-[91px]`}
                        >
                          <div className="flex flex-col">
                            <p>{totalMarks}</p>
                            <p className="text-sm">Marks</p>
                          </div>
                        </td>
                        <td
                          className={`border border-black p-2 text-center ${colClasses.duration} w-[120px]`}
                        >
                          {formatDurationTotal(totalDuration)}
                        </td>
                        <td
                          className={`border border-black p-2 text-center`}
                          colSpan={5}
                        >
                          {/* Merges last 5 columns */}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          if (section.type === "additional") {
            return (
              <div key="additional" className="mb-6 additional-section">
                <h2 className="text-lg font-bold mb-2">
                  {section.number}. {section.name}
                </h2>
                {lessonPlan.form.additionalInfo &&
                  Object.keys(lessonPlan.form.additionalInfo).length > 0 && (
                    <div className="mb-6">
                      <table className="w-full border-collapse">
                        <tbody>
                          {lessonPlan.form.additionalInfo
                            .academic_integrity && (
                            <tr>
                              <td
                                className="border border-black p-3 font-bold bg-gray-50 align-top"
                                style={{ width: "250px", minWidth: "250px" }}
                              >
                                Academic Integrity:
                              </td>
                              <td
                                className="border border-black p-3 align-top"
                                style={{
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {
                                  lessonPlan.form.additionalInfo
                                    .academic_integrity
                                }
                              </td>
                            </tr>
                          )}
                          {lessonPlan.form.additionalInfo.attendance_policy && (
                            <tr>
                              <td
                                className="border border-black p-3 font-bold bg-gray-50 align-top"
                                style={{ width: "250px", minWidth: "250px" }}
                              >
                                Attendance Policy:
                              </td>
                              <td
                                className="border border-black p-3 align-top"
                                style={{
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {
                                  lessonPlan.form.additionalInfo
                                    .attendance_policy
                                }
                              </td>
                            </tr>
                          )}
                          {lessonPlan.form.additionalInfo.cie_guidelines && (
                            <tr>
                              <td
                                className="border border-black p-3 font-bold bg-gray-50 align-top"
                                style={{ width: "250px", minWidth: "250px" }}
                              >
                                CIE Guidelines:
                              </td>
                              <td
                                className="border border-black p-3 align-top"
                                style={{
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {lessonPlan.form.additionalInfo.cie_guidelines}
                              </td>
                            </tr>
                          )}
                          {lessonPlan.form.additionalInfo.classroom_conduct && (
                            <tr>
                              <td
                                className="border border-black p-3 font-bold bg-gray-50 align-top"
                                style={{ width: "250px", minWidth: "250px" }}
                              >
                                Classroom Conduct:
                              </td>
                              <td
                                className="border border-black p-3 align-top"
                                style={{
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {
                                  lessonPlan.form.additionalInfo
                                    .classroom_conduct
                                }
                              </td>
                            </tr>
                          )}
                          {lessonPlan.form.additionalInfo
                            .communication_channels && (
                            <tr>
                              <td
                                className="border border-black p-3 font-bold bg-gray-50 align-top"
                                style={{ width: "250px", minWidth: "250px" }}
                              >
                                Communication Channels:
                              </td>
                              <td
                                className="border border-black p-3 align-top"
                                style={{
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {
                                  lessonPlan.form.additionalInfo
                                    .communication_channels
                                }
                              </td>
                            </tr>
                          )}
                          {/* Add any other additional info fields here */}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            );
          }

          return null;
        })}

        {/* DIGITAL SIGNATURE */}
        <p className="text-right text-sm mt-10">
          This LPD was downloaded on {formatDate(new Date().toISOString())} by{" "}
          {lessonPlan.users.name}
        </p>
      </div>
    </>
  );
}
