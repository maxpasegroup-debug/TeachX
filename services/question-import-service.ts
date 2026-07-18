export type ParsedQuestion = {
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  marks?: string;
  negativeMarks?: string;
  imagePlaceholder?: string;
};

const labels: Record<string, keyof ParsedQuestion> = {
  question: "question",
  "option a": "optionA",
  "option b": "optionB",
  "option c": "optionC",
  "option d": "optionD",
  "correct answer": "correctAnswer",
  explanation: "explanation",
  marks: "marks",
  "negative marks": "negativeMarks",
  "image placeholder": "imagePlaceholder"
};

export function parseQuestionImport(rawText: string) {
  const blocks = rawText.split(/\n\s*\n/g).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block) => {
    const parsed: Partial<ParsedQuestion> = {};
    for (const line of block.split(/\r?\n/)) {
      const [rawKey, ...valueParts] = line.split(":");
      const key = labels[rawKey.trim().toLowerCase()];
      if (key) parsed[key] = valueParts.join(":").trim();
    }
    if (!parsed.question) parsed.question = block.split(/\r?\n/)[0]?.trim() ?? "";
    return parsed as ParsedQuestion;
  }).filter((question) => question.question);
}
