"use client";

import { useState } from "react";
import { Textarea } from "../ui/textarea";

export type SectionNames = {
  CHIEF_COMPLAINT: string;
  HISTORY_OF_PRESENT_ILLNESS: string;
  REVIEW_OF_SYSTEMS: string;
  PAST_MEDICAL_HISTORY: string;
  ASSESSMENT: string;
  PLAN: string;
  PHYSICAL_EXAMINATION: string;
  PAST_FAMILY_HISTORY: string;
  PAST_SOCIAL_HISTORY: string;
  DIAGNOSTIC_TESTING: string;
};

export type Summary = {
  SummarizedSegment: string;
};

export type Section = {
  SectionName: keyof SectionNames;
  Summary: Summary[];
};

export type ClinicalDocumentation = {
  Sections: Section[];
};

export type Data = {
  ClinicalDocumentation: ClinicalDocumentation;
};

export function FormattedClinicalSummary({
  data,
  isEditing,
  onSummaryChange,
}: {
  data: any | null;
  isEditing: boolean;
  onSummaryChange: (updatedData: any) => void;
}): JSX.Element {
  if (!data || !data.ClinicalDocumentation) {
    return <p>No Clinical Documentation Available</p>;
  }

  const sectionNames: SectionNames = {
    CHIEF_COMPLAINT: "Chief Complaint",
    PAST_FAMILY_HISTORY: "Past Family History",
    PAST_SOCIAL_HISTORY: "Past Social History",
    DIAGNOSTIC_TESTING: "Diagnostic Testing",
    HISTORY_OF_PRESENT_ILLNESS: "History Of Present Illness",
    REVIEW_OF_SYSTEMS: "Review Of Systems",
    PAST_MEDICAL_HISTORY: "Past Medical History",
    PHYSICAL_EXAMINATION: "Physical Examination",
    ASSESSMENT: "Assessment",
    PLAN: "Plan",
  };

  const sectionOrder = [
    "CHIEF_COMPLAINT",
    "PAST_FAMILY_HISTORY",
    "PAST_SOCIAL_HISTORY",
    "DIAGNOSTIC_TESTING",
    "HISTORY_OF_PRESENT_ILLNESS",
    "REVIEW_OF_SYSTEMS",
    "PAST_MEDICAL_HISTORY",
    "PHYSICAL_EXAMINATION",
    "ASSESSMENT",
    "PLAN",
  ];

  const [sections, setSections] = useState(data.ClinicalDocumentation.Sections);

  const sortedSections = sections.sort((a: Section, b: Section) => {
    return (
      sectionOrder.indexOf(a.SectionName) - sectionOrder.indexOf(b.SectionName)
    );
  });

  const handleSummaryChange = (
    sectionIndex: number,
    summaryIndex: number,
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].Summary[summaryIndex].SummarizedSegment =
      value;
    setSections(updatedSections);
    onSummaryChange({ ClinicalDocumentation: { Sections: updatedSections } }); // Call the handler
  };

  return (
    <div>
      {sortedSections.map((section: Section, sectionIndex: number) => {
        const sectionName =
          sectionNames[section.SectionName] || section.SectionName;
        const summaries = section.Summary.map(
          (summary, summaryIndex: number) =>
            isEditing ? (
              <textarea
                key={summaryIndex}
                className="mb-2 w-full p-2 border border-gray-300 rounded"
                value={summary.SummarizedSegment}
                onChange={(e) =>
                  handleSummaryChange(
                    sectionIndex,
                    summaryIndex,
                    e.target.value
                  )
                }
              />
            ) : (
              <p key={summaryIndex} className="mb-2">
                {summary.SummarizedSegment}
              </p>
            )
        );

        return (
          <div key={sectionIndex} className="mb-6">
            <h2 className="text-lg font-semibold mb-4 underline decoration-2 underline-offset-4">
              {sectionName}
            </h2>
            {summaries.length > 0 ? summaries : <p>No Clinical Entities</p>}
          </div>
        );
      })}
    </div>
  );
}
