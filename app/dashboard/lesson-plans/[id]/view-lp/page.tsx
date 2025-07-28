//@ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDashboardContext } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { isSubjectTheoryOnly, isSubjectPracticalOnly } from "@/utils/dateUtils";
import { fetchViewLP } from "@/app/dashboard/actions/fetchViewLP";

const getAcademicYear = (dateString: string) => {
  if (!dateString) return "N/A";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = Number.parseInt(parts[2], 10);
    return `${year}-${(year % 100) + 1}`;
  }
  return "N/A";
};

function ViewLessonPlanPage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [lessonPlan, setLessonPlan] = useState<any>(null);
  const [userDataPlan, setUserDataPlan] = useState<any>(null);
  const { userData } = useDashboardContext();

  useEffect(() => {
    const loadLessonPlan = async () => {
      try {
        setIsLoading(true);
        const result = await fetchViewLP(params.id as string);
        if (result.success) {
          setLessonPlan(result.data);
          setUserDataPlan(result.userRoleData);
        } else {
          toast.error(result.error || "Failed to load lesson plan !!");
        }
      } catch (error) {
        console.error("Error loading lesson plan:", error);
        toast.error("Failed to load lesson plan");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id && userData?.id) {
      loadLessonPlan();
    }
  }, [params.id, userData?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-lg">Loading lesson plan...</p>
        </div>
      </div>
    );
  }

  if (!lessonPlan || !lessonPlan.form || !lessonPlan.subjects) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-lg text-red-500">
            Lesson plan data is incomplete or corrupted.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getSectionNumber = () => {
    let sectionNumber = 2;
    const sections = [];
    if (!isSubjectPracticalOnly(lessonPlan.subjects)) {
      sections.push({
        number: sectionNumber++,
        name: "UNIT DETAILS",
        type: "units",
      });
    }
    if (!isSubjectTheoryOnly(lessonPlan.subjects)) {
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

  const sections = getSectionNumber();

  console.log(lessonPlan.form);

  return (
    <div className="w-full p-5 bg-white text-black font-sans overflow-hidden">
      <style jsx>{`
        table {
          table-layout: fixed;
          width: 100%;
        }
        td,
        th {
          word-wrap: break-word;
          word-break: break-all;
          overflow-wrap: break-word;
          hyphens: auto;
        }
      `}</style>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            <div className="text-center mb-8 space-y-1">
              <h1 className="text-xl font-bold">
                Charotar University of Science and Technology (CHARUSAT)
              </h1>
              <h2 className="text-xl font-bold">
                {userDataPlan?.departments?.institutes?.name} (
                {userDataPlan?.departments?.institutes?.abbreviation_insti})
              </h2>
              <h3 className="text-xl font-bold">
                Department of {userDataPlan?.departments?.name || "N/A"}
              </h3>
              <h4 className="text-xl font-bold">
                Lesson Planning Document (LPD)
              </h4>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
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
                    {lessonPlan.users?.name || "N/A"}
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0 w-[10%]">
                    Faculty Email:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0 w-[25%]">
                    {lessonPlan.users?.email || "N/A"}
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0 w-[11%]">
                    Department:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0 w-[25%]">
                    {lessonPlan.subjects?.departments?.name || "N/A"} (
                    {lessonPlan.subjects?.departments?.abbreviation_depart ||
                      "N/A"}
                    )
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Subject Code:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.subjects?.code || "N/A"}
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0 w-[10%]">
                    Subject Name:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.subjects?.name || "N/A"}
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Term Duration:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.subjects?.metadata?.term_start_date} to{" "}
                    {lessonPlan.subjects?.metadata?.term_end_date}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Semester:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.subjects?.semester || "N/A"}
                    <sup>
                      {lessonPlan.subjects?.semester === 1
                        ? "st"
                        : lessonPlan.subjects?.semester === 2
                        ? "nd"
                        : lessonPlan.subjects?.semester === 3
                        ? "rd"
                        : "th"}
                    </sup>{" "}
                    semester
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Division:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.form?.generalDetails?.division || "N/A"}
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Academic Year:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {getAcademicYear(
                      lessonPlan.subjects?.metadata?.term_start_date
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Lecture Hours/week:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.form?.generalDetails?.lecture_hours || "N/A"}
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Lab Hour/week
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.form?.generalDetails?.lab_hours || "N/A"}
                  </td>
                  <td className="border border-black p-2 font-bold break-words overflow-hidden text-ellipsis max-w-0">
                    Credits:
                  </td>
                  <td className="border border-black p-2 break-words overflow-hidden text-ellipsis max-w-0">
                    {lessonPlan.form?.generalDetails?.credits || "N/A"}
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
                    {lessonPlan.form?.generalDetails?.course_prerequisites ||
                      "N/A"}
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
                    {lessonPlan.form?.generalDetails
                      ?.course_prerequisites_materials || "N/A"}
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
                  {(lessonPlan.form?.unitPlanning?.units || []).map(
                    (unit: any, index: number) => (
                      <div
                        key={unit?.id || index}
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
                                {unit?.unit_name || "N/A"}
                              </td>
                              <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                                Faculty Name:
                              </td>
                              <td className="border border-black p-2 w-[30%]">
                                {unit?.faculty_name || "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black p-2 font-bold bg-gray-50">
                                Start Date:
                              </td>
                              <td className="border border-black p-2">
                                {formatDate(unit?.probable_start_date)}
                              </td>
                              <td className="border border-black p-2 font-bold bg-gray-50">
                                End Date:
                              </td>
                              <td className="border border-black p-2">
                                {formatDate(unit?.probable_end_date)}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                                No. of Lectures:
                              </td>
                              <td className="border border-black p-2 w-[30%]">
                                {unit?.no_of_lectures || "N/A"}
                              </td>
                              <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                                CO Mapping:
                              </td>
                              <td
                                className="border border-black p-2"
                                colSpan={3}
                              >
                                {unit?.co_mapping
                                  ?.map((coId) => {
                                    const outcomeIndex =
                                      lessonPlan.form?.generalDetails?.courseOutcomes?.findIndex(
                                        (co) => co.id === coId
                                      );
                                    return outcomeIndex !== -1
                                      ? `CO${outcomeIndex + 1}`
                                      : coId;
                                  })
                                  .join(", ") || "N/A"}
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
                                {unit?.unit_topics || "N/A"}
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
                                {unit?.self_study_topics || "N/A"}
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
                                {unit?.self_study_materials || "N/A"}
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
                                {unit?.teaching_pedagogy
                                  ?.map((pedagogy) => {
                                    if (pedagogy.startsWith("Other: ")) {
                                      return pedagogy.replace("Other: ", "");
                                    }
                                    return pedagogy;
                                  })
                                  .join(", ") || "N/A"}
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
                                {unit?.skill_mapping?.join(", ") || "N/A"}
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
                                {unit?.unit_materials || "N/A"}
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
                                {unit?.skill_objectives || "N/A"}
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
                                {unit?.topics_beyond_unit || "N/A"}
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
                                {unit?.interlink_topics || "N/A"}
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
                  {lessonPlan.form?.practicals &&
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
                                      {lessonPlan.users?.name || "N/A"}
                                    </td>
                                    <td className="border border-black p-2 font-bold bg-gray-50 w-[20%]">
                                      Lab Hours:
                                    </td>
                                    <td className="border border-black p-2 w-[30%]">
                                      {practical?.lab_hours || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Probable Week:
                                    </td>
                                    <td className="border border-black p-2">
                                      {practical?.probable_week || "N/A"}
                                    </td>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      CO Mapping:
                                    </td>
                                    <td className="border border-black p-2">
                                      {practical?.co_mapping
                                        ?.map((coId) => {
                                          const outcomeIndex =
                                            lessonPlan.form?.generalDetails?.courseOutcomes?.findIndex(
                                              (co) => co.id === coId
                                            );
                                          return outcomeIndex !== -1
                                            ? `CO${outcomeIndex + 1}`
                                            : coId;
                                        })
                                        .join(", ") || "N/A"}
                                    </td>
                                  </tr>
                                  {practical?.pso_mapping?.length > 0 && (
                                    <tr>
                                      <td className="border border-black p-2 font-bold bg-gray-50">
                                        PSO Mapping:
                                      </td>
                                      <td
                                        className="border border-black p-2"
                                        colSpan={5}
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
                                      colSpan={5}
                                    >
                                      {practical?.practical_aim || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Practical Tasks:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {practical?.practical_tasks || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Practical Pedagogy:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {practical?.practical_pedagogy || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Evaluation Methods:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {Array.isArray(
                                        practical?.evaluation_methods
                                      )
                                        ? practical.evaluation_methods
                                            .map((method) => {
                                              // Remove "Other: " prefix if present
                                              if (
                                                method.startsWith("Other: ")
                                              ) {
                                                return method.replace(
                                                  "Other: ",
                                                  ""
                                                );
                                              }
                                              return method;
                                            })
                                            .join(", ")
                                        : practical?.evaluation_methods ||
                                          "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Associated Units:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {Array.isArray(
                                        practical?.associated_units
                                      )
                                        ? practical.associated_units.join(", ")
                                        : practical?.associated_units || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Blooms Taxonomy:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {Array.isArray(practical?.blooms_taxonomy)
                                        ? practical.blooms_taxonomy.join(", ")
                                        : practical?.blooms_taxonomy || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Skill Mapping:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {Array.isArray(practical?.skill_mapping)
                                        ? practical.skill_mapping.join(", ")
                                        : practical?.skill_mapping || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Skill Objectives:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {practical?.skill_objectives || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-50">
                                      Reference Material:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {practical?.reference_material || "N/A"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-black p-2 text-sm font-bold bg-gray-50">
                                      Software/Hardware Requirements:
                                    </td>
                                    <td
                                      className="border border-black p-2 text-sm break-words whitespace-normal"
                                      colSpan={5}
                                    >
                                      {practical?.software_hardware_requirements ||
                                        "N/A"}
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
              const evaluationTypeOrder = [
                "Course Prerequisites CIE",
                "Lecture CIE",
                "Practical CIE",
                "Mid-term/Internal Exam",
              ];

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

              lessonPlan.form?.cies?.forEach((cie: any) => {
                const type = cie?.type || "Other";
                if (type === "Internal Practical") {
                  cieGroups[2].cies.push({ ...cie, originalType: type });
                } else {
                  const group = cieGroups.find((g) => g.type === type);
                  if (group) {
                    group.cies.push(cie);
                  }
                }
              });

              const totalMarks =
                lessonPlan.form?.cies?.reduce(
                  (sum: number, cie: any) => sum + (cie?.marks || 0),
                  0
                ) || 0;

              const totalDuration =
                lessonPlan.form?.cies?.reduce(
                  (sum: number, cie: any) => sum + (cie?.duration || 0),
                  0
                ) || 0;

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

              const formatDurationIndividual = (minutes: number) => {
                return `${minutes || 0}`;
              };

              let globalIndex = 0;

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
                            <div className="flex flex-col">
                              <p>Unit/Practical</p>
                              <p>Covered</p>
                            </div>
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
                            <div className="flex flex-col">
                              <p>Duration</p>
                              <p>(mins)</p>
                            </div>
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
                  {cieGroups.map(({ type, cies, showTotal }) => {
                    if (cies.length === 0) return null;

                    const groupMarks = cies.reduce(
                      (sum, cie) => sum + (cie?.marks || 0),
                      0
                    );
                    const groupDuration = cies.reduce(
                      (sum, cie) => sum + (cie?.duration || 0),
                      0
                    );

                    return (
                      <div key={type} className="mb-2">
                        <table className="w-full border-collapse table-fixed">
                          <tbody>
                            {cies.map((cie) => {
                              globalIndex++;
                              return (
                                <tr key={cie?.id || globalIndex}>
                                  <td
                                    className={`border border-black p-2 text-center break-words ${colClasses.no}`}
                                  >
                                    {globalIndex}
                                  </td>
                                  <td
                                    className={`border border-black p-2 text-center break-words ${colClasses.unit}`}
                                  >
                                    {(() => {
                                      if (
                                        cie?.type === "Practical CIE" ||
                                        cie?.type === "Internal Practical"
                                      ) {
                                        if (
                                          cie?.practicals_covered &&
                                          cie.practicals_covered.length > 0
                                        ) {
                                          const practicalNumbers =
                                            cie.practicals_covered
                                              .map((p) => {
                                                const match = p.match(/\d+$/);
                                                return match ? match[0] : null;
                                              })
                                              .filter((num) => num !== null);
                                          return practicalNumbers.length > 0
                                            ? practicalNumbers.join(", ")
                                            : "-";
                                        }
                                        return "-";
                                      }

                                      if (
                                        typeof cie?.units_covered === "string"
                                      ) {
                                        if (
                                          !cie.units_covered ||
                                          cie.units_covered.trim() === ""
                                        )
                                          return "-";
                                        const unitIds = cie.units_covered
                                          .split(",")
                                          .map((id) => id.trim());
                                        if (
                                          unitIds.some(
                                            (id) =>
                                              id.length > 20 && id.includes("-")
                                          )
                                        ) {
                                          const mappedUnits = unitIds
                                            .map((unitId) => {
                                              const unitIndex =
                                                lessonPlan.form?.units?.findIndex(
                                                  (u: any) => u.id === unitId
                                                );
                                              return unitIndex !== -1
                                                ? unitIndex + 1
                                                : null;
                                            })
                                            .filter((num) => num !== null);
                                          return mappedUnits.length > 0
                                            ? mappedUnits.join(", ")
                                            : "-";
                                        }
                                        return cie.units_covered;
                                      }
                                      if (Array.isArray(cie?.units_covered)) {
                                        if (cie.units_covered.length === 0)
                                          return "-";
                                        const unitNumbers = cie.units_covered
                                          .map((unitId) => {
                                            const unitIndex =
                                              lessonPlan.form?.units?.findIndex(
                                                (u: any) => u.id === unitId
                                              );
                                            return unitIndex !== -1
                                              ? unitIndex + 1
                                              : null;
                                          })
                                          .filter((num) => num !== null);
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
                                    {cie?.date
                                      ? cie.date.replace(/-/g, "/")
                                      : "-"}
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
                                          cie?.duration || 0
                                        )}
                                      </p>
                                      <p className="text-sm">mins</p>
                                    </div>
                                  </td>
                                  <td
                                    className={`border border-black p-2 text-center break-words ${colClasses.evalType}`}
                                  >
                                    {cie?.type == "Lecture CIE"
                                      ? "Theory CIE"
                                      : cie?.type || "-"}
                                  </td>
                                  <td
                                    className={`border border-black p-2 text-center break-words ${colClasses.blooms}`}
                                  >
                                    {cie?.blooms_taxonomy &&
                                    cie.blooms_taxonomy.length > 0
                                      ? cie.blooms_taxonomy.join(", ")
                                      : "-"}
                                  </td>
                                  <td
                                    className={`border border-black p-2 text-center break-words ${colClasses.pedagogy}`}
                                  >
                                    {cie?.evaluation_pedagogy == "Other"
                                      ? cie?.other_pedagogy
                                      : cie?.evaluation_pedagogy}
                                  </td>
                                  <td
                                    className={`border border-black p-2 text-center break-words ${colClasses.copso}`}
                                  >
                                    {(() => {
                                      const mappings = [];
                                      if (
                                        cie?.co_mapping &&
                                        cie.co_mapping.length > 0
                                      ) {
                                        const coNumbers = cie.co_mapping.map(
                                          (coId: any, idx: number) =>
                                            `CO${idx + 1}`
                                        );
                                        mappings.push(...coNumbers);
                                      }
                                      if (
                                        cie?.pso_mapping &&
                                        cie.pso_mapping.length > 0
                                      ) {
                                        const psoNumbers = cie.pso_mapping.map(
                                          (pso: any) => pso.toUpperCase()
                                        );
                                        mappings.push(...psoNumbers);
                                      }
                                      if (
                                        cie?.peo_mapping &&
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
                                    {cie?.skill_mapping &&
                                    cie.skill_mapping.length > 0
                                      ? cie.skill_mapping
                                          .map((skill: any) => {
                                            if (typeof skill === "object") {
                                              // If skill is "Other", show the otherSkill value
                                              return skill.skill === "Other"
                                                ? skill.otherSkill || "Other"
                                                : skill.skill;
                                            }
                                            return skill;
                                          })
                                          .join(", ")
                                      : "-"}
                                  </td>
                                </tr>
                              );
                            })}
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
                                ></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                  <div className="mt-2">
                    <table className="w-full border-collapse table-fixed">
                      <tbody>
                        <tr className="font-bold">
                          <td
                            className={`border border-black p-2 text-right w-[347px]`}
                            colSpan={2}
                          >
                            Overall Total
                          </td>
                          <td
                            className={`border border-black p-2 text-center ${colClasses.marks} w-[84px]`}
                          >
                            <div className="flex flex-col">
                              <p>{totalMarks}</p>
                              <p className="text-sm">Marks</p>
                            </div>
                          </td>
                          <td
                            className={`border border-black p-2 text-center ${colClasses.duration} w-[111px]`}
                          >
                            {formatDurationTotal(totalDuration)}
                          </td>
                          <td
                            className={`border border-black p-2 text-center`}
                            colSpan={5}
                          ></td>
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
                            {lessonPlan.form.additionalInfo
                              .attendance_policy && (
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
                            {lessonPlan.form.additionalInfo
                              .lesson_planning_guidelines && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Lesson Planning Guidelines:
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
                                      .lesson_planning_guidelines
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
                                  {
                                    lessonPlan.form.additionalInfo
                                      .cie_guidelines
                                  }
                                </td>
                              </tr>
                            )}
                            {lessonPlan.form.additionalInfo
                              .self_study_guidelines && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Self Study/Homework Guidelines:
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
                                      .self_study_guidelines
                                  }
                                </td>
                              </tr>
                            )}
                            {lessonPlan.form.additionalInfo
                              .topics_beyond_syllabus && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Topics Beyond Syllabus:
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
                                      .topics_beyond_syllabus
                                  }
                                </td>
                              </tr>
                            )}
                            {lessonPlan.form.additionalInfo
                              .reference_materials && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Reference Material:
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
                                      .reference_materials
                                  }
                                </td>
                              </tr>
                            )}
                            {lessonPlan.form.additionalInfo
                              .classroom_conduct && (
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
                            {lessonPlan.form.additionalInfo
                              .interdisciplinary_integration && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Interdisciplinary/Industry/Research
                                  Integration:
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
                                      .interdisciplinary_integration
                                  }
                                </td>
                              </tr>
                            )}
                            {lessonPlan.form.additionalInfo
                              .fast_learner_planning && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Fast Learner Planning:
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
                                      .fast_learner_planning
                                  }
                                </td>
                              </tr>
                            )}
                            {lessonPlan.form.additionalInfo
                              .medium_learner_planning && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Medium Learner Planning:
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
                                      .medium_learner_planning
                                  }
                                </td>
                              </tr>
                            )}
                            {lessonPlan.form.additionalInfo
                              .slow_learner_planning && (
                              <tr>
                                <td
                                  className="border border-black p-3 font-bold bg-gray-50 align-top"
                                  style={{ width: "250px", minWidth: "250px" }}
                                >
                                  Slow Learner Planning:
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
                                      .slow_learner_planning
                                  }
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              );
            }

            if (section.type === "completion") {
              return (
                <div key="completion" className="mt-6">
                  <h2 className="text-lg font-bold mb-2">
                    {section.number}. {section.name}
                  </h2>
                  <div className="mt-6">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="border border-black p-3 font-bold bg-gray-50 w-1/2">
                            General Details Completed:
                          </td>
                          <td className="border border-black p-3">
                            <span
                              className={`px-3 py-1 rounded font-medium ${
                                lessonPlan.complete_general
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {lessonPlan.complete_general
                                ? "Submitted"
                                : "Pending"}
                            </span>
                          </td>
                        </tr>
                        {!isSubjectPracticalOnly(lessonPlan.subjects) && (
                          <tr>
                            <td className="border border-black p-3 font-bold bg-gray-50">
                              Unit Planning Completed:
                            </td>
                            <td className="border border-black p-3">
                              <span
                                className={`px-3 py-1 rounded font-medium ${
                                  lessonPlan.complete_unit
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {lessonPlan.complete_unit
                                  ? "Submitted"
                                  : "Pending"}
                              </span>
                            </td>
                          </tr>
                        )}
                        {!isSubjectTheoryOnly(lessonPlan.subjects) && (
                          <tr>
                            <td className="border border-black p-3 font-bold bg-gray-50">
                              Practical Planning Completed:
                            </td>
                            <td className="border border-black p-3">
                              <span
                                className={`px-3 py-1 rounded font-medium ${
                                  lessonPlan.complete_practical
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {lessonPlan.complete_practical
                                  ? "Submitted"
                                  : "Pending"}
                              </span>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="border border-black p-3 font-bold bg-gray-50">
                            CIE Planning Completed:
                          </td>
                          <td className="border border-black p-3">
                            <span
                              className={`px-3 py-1 rounded font-medium ${
                                lessonPlan.complete_cie
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {lessonPlan.complete_cie
                                ? "Submitted"
                                : "Pending"}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-3 font-bold bg-gray-50">
                            Additional Info Completed:
                          </td>
                          <td className="border border-black p-3">
                            <span
                              className={`px-3 py-1 rounded font-medium ${
                                lessonPlan.complete_additional
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {lessonPlan.complete_additional
                                ? "Submitted"
                                : "Pending"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default ViewLessonPlanPage;
