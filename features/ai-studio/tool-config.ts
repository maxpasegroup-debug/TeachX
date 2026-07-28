export type StudioField = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkboxes";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  wide?: boolean;
};

export type StudioToolConfig = {
  slug: string;
  title: string;
  category: string;
  description: string;
  fields: StudioField[];
  outputInstructions: string[];
};

const commonAcademic: StudioField[] = [
  { name: "grade", label: "Grade / Class", placeholder: "Class 8", required: true },
  { name: "subject", label: "Subject", placeholder: "Science", required: true },
  { name: "chapter", label: "Chapter / Topic", placeholder: "Force and Pressure", required: true }
];

export const studioToolConfigs: StudioToolConfig[] = [
  {
    slug: "lesson-generator", title: "AI Lesson Generator", category: "Planning",
    description: "Create a complete, classroom-ready lesson with measurable outcomes, activities, and homework.",
    fields: [
      ...commonAcademic,
      { name: "lessonObjective", label: "Lesson Objective", type: "textarea", placeholder: "What should students understand?", required: true, wide: true },
      { name: "learningOutcomes", label: "Learning Outcomes", type: "textarea", placeholder: "Students will be able to...", required: true, wide: true },
      { name: "bloomsTaxonomy", label: "Bloom's Taxonomy", type: "checkboxes", options: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"], wide: true },
      { name: "duration", label: "Duration (minutes)", type: "number", placeholder: "40", required: true },
      { name: "teachingMethod", label: "Teaching Method", type: "select", options: ["Direct instruction", "Inquiry-based", "Collaborative", "Project-based", "Flipped classroom", "Experiential"] },
      { name: "activitySuggestions", label: "Activity Preferences", type: "textarea", placeholder: "Materials, group size, or activity constraints", wide: true },
      { name: "homeworkSuggestions", label: "Homework Preferences", type: "textarea", placeholder: "Practice, research, reflection, or project", wide: true }
    ],
    outputInstructions: ["Include objective and measurable outcomes", "Map stages to the selected Bloom levels", "Provide a timed teaching sequence", "Include activity suggestions, checks for understanding, differentiation, resources, and homework"]
  },
  {
    slug: "worksheet-generator", title: "AI Worksheet Generator", category: "Practice",
    description: "Build a printable, marks-based worksheet with mixed question formats and an answer key.",
    fields: [
      ...commonAcademic,
      { name: "template", label: "Worksheet Template", type: "select", options: ["Classic classroom", "Compact practice", "Activity sheet", "Exam practice", "Revision worksheet"] },
      { name: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard", "Mixed"] },
      { name: "marks", label: "Total Marks", type: "number", placeholder: "40", required: true },
      { name: "sections", label: "Number of Sections", type: "number", placeholder: "5", required: true },
      { name: "questionTypes", label: "Question Types", type: "checkboxes", options: ["MCQ", "Fill Ups", "Match", "Short Answer", "Long Answer", "Diagram Questions"], wide: true },
      { name: "instructions", label: "Special Instructions", type: "textarea", placeholder: "Question counts, chapter emphasis, diagram requirements", wide: true },
      { name: "answerKey", label: "Answer Key", type: "select", options: ["Include detailed answer key", "Include concise answer key"] }
    ],
    outputInstructions: ["Use the selected template and sections", "Show marks beside every question and make the total exact", "Include every selected question type", "Add writing space and diagram prompts where appropriate", "Finish with a separately labelled answer key"]
  },
  {
    slug: "quiz-generator", title: "AI Quiz Generator", category: "Assessment",
    description: "Generate a reusable question bank or randomized timed quiz with explanations.",
    fields: [
      ...commonAcademic,
      { name: "mode", label: "Quiz Source", type: "select", options: ["Generate a quiz", "Generate a question bank", "Random selection from question bank"] },
      { name: "questionCount", label: "Number of Questions", type: "number", placeholder: "10", required: true },
      { name: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard", "Mixed"] },
      { name: "duration", label: "Time Limit (minutes)", type: "number", placeholder: "15" },
      { name: "questionTypes", label: "Question Types", type: "checkboxes", options: ["MCQ", "True / False", "Fill Ups", "Short Answer"], wide: true },
      { name: "explanations", label: "Explanations", type: "select", options: ["Explain every answer", "Answer key only"] }
    ],
    outputInstructions: ["Number questions automatically", "Provide clear timer and attempt instructions", "Randomize concepts rather than repeating them", "Finish with an answer key and the requested explanations"]
  },
  {
    slug: "question-paper-builder", title: "Question Paper Builder", category: "Assessment",
    description: "Create a blueprint-aligned examination paper with exact marks and print-ready formatting.",
    fields: [
      ...commonAcademic,
      { name: "totalMarks", label: "Total Marks", type: "number", placeholder: "80", required: true },
      { name: "duration", label: "Exam Duration (minutes)", type: "number", placeholder: "180", required: true },
      { name: "blueprint", label: "Blueprint", type: "textarea", placeholder: "Chapters, outcomes, and target marks", required: true, wide: true },
      { name: "marksDistribution", label: "Marks Distribution", type: "textarea", placeholder: "Section A: 20 × 1; Section B: 6 × 3...", required: true, wide: true },
      { name: "difficultyMix", label: "Difficulty Mix", placeholder: "Easy 30%, Medium 50%, Hard 20%" },
      { name: "internalChoice", label: "Internal Choice", type: "select", options: ["No internal choice", "Limited internal choice", "Internal choice in every long section"] },
      { name: "questionTypes", label: "Question Types", type: "checkboxes", options: ["MCQ", "Very Short", "Short Answer", "Long Answer", "Case Study", "Diagram"], wide: true }
    ],
    outputInstructions: ["Start with a blueprint table", "Make marks distribution total exactly", "Apply the difficulty mix and internal-choice rules", "Use automatic hierarchical numbering", "Produce a clean print layout followed by an answer key and marking scheme"]
  },
  {
    slug: "rubric-generator", title: "Rubric Generator", category: "Assessment",
    description: "Create an editable scoring table with criteria, performance levels, descriptors, and marks.",
    fields: [
      { name: "title", label: "Assessment / Task", placeholder: "Science project presentation", required: true },
      { name: "criteria", label: "Criteria", type: "textarea", placeholder: "Research, accuracy, presentation, teamwork", required: true, wide: true },
      { name: "levels", label: "Performance Levels", type: "text", placeholder: "Excellent, Proficient, Developing, Beginning", required: true, wide: true },
      { name: "marks", label: "Total Marks", type: "number", placeholder: "20", required: true },
      { name: "grade", label: "Grade / Class", placeholder: "Class 8" },
      { name: "notes", label: "Additional Expectations", type: "textarea", placeholder: "Evidence, observable behaviour, weighting", wide: true }
    ],
    outputInstructions: ["Output a valid markdown table that remains easy to edit", "Give observable descriptors for each criterion and level", "Show criterion weights and exact marks", "Make all awarded marks total exactly"]
  },
  {
    slug: "report-card-comments", title: "Report Card Comments", category: "Reports",
    description: "Draft balanced, student-specific comments with strengths and actionable next steps.",
    fields: [
      { name: "studentName", label: "Student Name", required: true },
      { name: "grade", label: "Grade / Class", required: true },
      { name: "academic", label: "Academic Performance", type: "textarea", required: true, wide: true },
      { name: "behaviour", label: "Behaviour", type: "textarea" },
      { name: "attendance", label: "Attendance", type: "textarea" },
      { name: "participation", label: "Participation", type: "textarea" },
      { name: "strengths", label: "Strengths", type: "textarea", required: true, wide: true },
      { name: "improvements", label: "Areas for Improvement", type: "textarea", wide: true },
      { name: "tone", label: "Tone", type: "select", options: ["Warm and encouraging", "Formal and concise", "Supportive and action-oriented"] }
    ],
    outputInstructions: ["Create a polished report-card-ready paragraph", "Balance academic, behaviour, attendance, and participation evidence", "Highlight strengths", "Give specific and constructive improvements", "Do not invent facts or labels"]
  },
  {
    slug: "parent-communication", title: "Parent Communication Assistant", category: "Communication",
    description: "Generate clear, respectful, and professional parent messages for common school situations.",
    fields: [
      { name: "messageType", label: "Message Type", type: "select", options: ["Meeting Request", "Homework Reminder", "Student Progress", "Appreciation", "Warning", "General Notice"], required: true },
      { name: "studentName", label: "Student Name", placeholder: "Optional for a general notice" },
      { name: "parentName", label: "Parent / Guardian Name" },
      { name: "details", label: "Message Details", type: "textarea", placeholder: "Facts, purpose, dates, and requested action", required: true, wide: true },
      { name: "channel", label: "Channel", type: "select", options: ["Email", "WhatsApp / SMS", "Printed letter", "School app"] },
      { name: "tone", label: "Tone", type: "select", options: ["Warm and professional", "Formal", "Firm but respectful", "Celebratory"] },
      { name: "sender", label: "Sender / Designation", placeholder: "Class Teacher" }
    ],
    outputInstructions: ["Use a professional subject or heading when suitable", "State the purpose and requested action clearly", "Preserve a respectful, non-judgmental tone", "Include an appropriate greeting and closing", "Use only facts supplied by the teacher"]
  },
  {
    slug: "presentation-generator", title: "Presentation Generator", category: "Presentation",
    description: "Create a slide-by-slide, export-ready classroom presentation with speaker notes.",
    fields: [
      { name: "topic", label: "Topic", required: true },
      { name: "grade", label: "Grade / Class", required: true },
      { name: "subject", label: "Subject", required: true },
      { name: "slideCount", label: "Number of Slides", type: "number", placeholder: "10", required: true },
      { name: "theme", label: "Theme", type: "select", options: ["Clean classroom", "Bright educational", "Minimal professional", "Science and technology", "Creative storytelling"] },
      { name: "speakerNotes", label: "Speaker Notes", type: "select", options: ["Detailed notes", "Brief talking points", "No notes"] },
      { name: "objectives", label: "Learning Goals / Must-cover Points", type: "textarea", wide: true }
    ],
    outputInstructions: ["Create exactly the requested number of slides", "For every slide include title, concise on-slide content, visual direction, and requested speaker notes", "Include an opening objective and closing recap/check", "Keep the layout ready to transfer to presentation software"]
  },
  {
    slug: "certificate-generator", title: "Certificate Generator", category: "Communication",
    description: "Create a personalized, print-ready certificate layout with signature and verification details.",
    fields: [
      { name: "studentName", label: "Student Name", required: true },
      { name: "course", label: "Course / Class" },
      { name: "event", label: "Event / Achievement", required: true },
      { name: "certificateType", label: "Certificate Type", type: "select", options: ["Achievement", "Participation", "Completion", "Appreciation", "Excellence"] },
      { name: "date", label: "Issue Date", type: "text", placeholder: "28 July 2026", required: true },
      { name: "signature", label: "Signature Name and Designation", required: true },
      { name: "qr", label: "QR Verification URL / Code", placeholder: "https://school.example/verify/..." },
      { name: "citation", label: "Citation / Award Reason", type: "textarea", wide: true }
    ],
    outputInstructions: ["Provide the exact certificate wording and a centered print-layout guide", "Place student, event, date, and signature clearly", "Include a labelled QR verification area using the supplied value", "Do not fabricate an institution name or verification link"]
  },
  {
    slug: "classroom-activity-generator", title: "Classroom Activity Generator", category: "Classroom",
    description: "Design engaging, practical classroom activities with timing, materials, and facilitation steps.",
    fields: [
      ...commonAcademic,
      { name: "activityType", label: "Activity Type", type: "select", options: ["Ice Breakers", "Group Activities", "Games", "STEM Activities", "Creative Activities"], required: true },
      { name: "duration", label: "Duration (minutes)", type: "number", placeholder: "25", required: true },
      { name: "classSize", label: "Class Size", type: "number", placeholder: "30" },
      { name: "materials", label: "Available Materials", type: "textarea", placeholder: "Paper, markers, lab kit, no special materials", wide: true },
      { name: "learningGoal", label: "Learning Goal", type: "textarea", required: true, wide: true }
    ],
    outputInstructions: ["Give the activity a memorable name", "List learning goal, materials, setup, timed steps, teacher prompts, safety notes, and reflection", "Make it practical for the supplied class size", "Add an inclusive adaptation and a quick assessment check"]
  },
  {
    slug: "homework-generator", title: "Homework Generator", category: "Practice",
    description: "Prepare focused homework with realistic timing, submission instructions, and answers.",
    fields: [
      ...commonAcademic,
      { name: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard", "Mixed"] },
      { name: "estimatedTime", label: "Estimated Time (minutes)", type: "number", placeholder: "30", required: true },
      { name: "questionCount", label: "Number of Tasks / Questions", type: "number", placeholder: "8", required: true },
      { name: "submissionInstructions", label: "Submission Instructions", type: "textarea", placeholder: "Due date, format, notebook or online submission", required: true, wide: true },
      { name: "answerKey", label: "Answer Key", type: "select", options: ["Detailed worked answers", "Concise answer key"] }
    ],
    outputInstructions: ["Keep the work achievable in the estimated time", "Use clear numbered tasks with progressive difficulty", "Repeat the submission instructions prominently", "Finish with a separately labelled answer key"]
  },
  {
    slug: "assessment-builder", title: "Assessment Builder", category: "Assessment",
    description: "Create an aligned assessment plan and instrument for any stage of learning.",
    fields: [
      ...commonAcademic,
      { name: "assessmentType", label: "Assessment Type", type: "select", options: ["Diagnostic", "Formative", "Summative", "Practical", "Viva", "Observation"], required: true },
      { name: "learningOutcomes", label: "Learning Outcomes", type: "textarea", required: true, wide: true },
      { name: "marks", label: "Total Marks", type: "number", placeholder: "25", required: true },
      { name: "duration", label: "Duration (minutes)", type: "number", placeholder: "45" },
      { name: "evidence", label: "Evidence / Skills to Observe", type: "textarea", wide: true },
      { name: "accommodations", label: "Accommodations / Differentiation", type: "textarea", wide: true }
    ],
    outputInstructions: ["Align every task to a stated learning outcome", "Use a structure appropriate to the selected assessment type", "Include instructions, tasks/prompts, evidence indicators, exact marks, scoring guidance, and feedback plan", "Add accommodations without lowering the measured outcome"]
  }
];

export function getStudioToolConfig(slug: string) {
  return studioToolConfigs.find((tool) => tool.slug === slug);
}
