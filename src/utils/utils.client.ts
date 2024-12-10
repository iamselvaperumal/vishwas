export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "shortOffset",
  }).format(date);
}

export function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

type SectionNames = {
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

export function formatClinicalDocumentation(data: any): string {
  const sectionNames: SectionNames = {
    CHIEF_COMPLAINT: "Chief Complaint",
    HISTORY_OF_PRESENT_ILLNESS: "History Of Present Illness",
    REVIEW_OF_SYSTEMS: "Review Of Systems",
    PAST_MEDICAL_HISTORY: "Past Medical History",
    ASSESSMENT: "Assessment",
    PLAN: "Plan",
    PHYSICAL_EXAMINATION: "Physical Examination",
    PAST_FAMILY_HISTORY: "Past Family History",
    PAST_SOCIAL_HISTORY: "Past Social History",
    DIAGNOSTIC_TESTING: "Diagnostic Testing",
  };

  return data?.ClinicalDocumentation.Sections.map((section: any) => {
    const sectionName =
      sectionNames[section.SectionName as keyof SectionNames] ||
      section.SectionName;
    const summaries = section.Summary.map(
      (summary: any) => summary.SummarizedSegment
    ).join("\n");
    return `${sectionName}\n${summaries || "No Clinical Entities"}`;
  }).join("\n\n");
}

export const productNames = [
  {
    lname: "apple",
    uname: "Apple",
  },
  {
    lname: "brinjal",
    uname: "Brinjal",
  },
  {
    lname: "broccoli",
    uname: "Broccoli",
  },
  {
    lname: "cabbage",
    uname: "Cabbage",
  },
  {
    lname: "carrot",
    uname: "Carrot",
  },
  {
    lname: "corn",
    uname: "Corn",
  },
  {
    lname: "garlic",
    uname: "Garlic",
  },
  {
    lname: "ginger",
    uname: "Ginger",
  },
  {
    lname: "green-chilli",
    uname: "Green Chilli",
  },
  {
    lname: "green-peas",
    uname: "Green Peas",
  },
  {
    lname: "lentils",
    uname: "Lentils",
  },
  {
    lname: "onion",
    uname: "Onion",
  },
  {
    lname: "potato",
    uname: "Potato",
  },
  {
    lname: "rice",
    uname: "Rice",
  },
  {
    lname: "tomato",
    uname: "Tomato",
  },
  {
    lname: "wheat",
    uname: "Wheat",
  },
];
