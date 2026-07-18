"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Batch, Chapter, Course, Subject, Topic } from "@prisma/client";

import { addQuestionToExamAction, createExamAction, createQuestionAction, importQuestionsAction } from "@/features/exams/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";
import type { ExamWithDetails } from "@/services/exam-service";
import type { QuestionWithDetails } from "@/services/question-service";

type ExamManagementProps = {
  courses: (Course & { subjects?: Subject[] })[];
  batches: Batch[];
  chapters: (Chapter & { subject: Subject })[];
  topics: (Topic & { subject: Subject; chapter: Chapter | null })[];
  questions: QuestionWithDetails[];
  exams: ExamWithDetails[];
  studentMode?: boolean;
};

export function ExamManagement({ courses, batches, chapters, topics, questions, exams, studentMode = false }: ExamManagementProps) {
  if (studentMode) {
    return <StudentExamList exams={exams} />;
  }

  const subjects = courses.flatMap((course) => course.subjects ?? []);
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <Mini label="Questions" value={questions.length.toString()} />
        <Mini label="Published" value={questions.filter((q) => q.visibility === "PUBLISHED").length.toString()} />
        <Mini label="Exams" value={exams.length.toString()} />
        <Mini label="Attempts" value={exams.reduce((total, exam) => total + exam.attempts.length, 0).toString()} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <QuestionBuilder courses={courses} subjects={subjects} chapters={chapters} topics={topics} />
        <QuestionImport courses={courses} subjects={subjects} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <ExamBuilder batches={batches} chapters={chapters} courses={courses} subjects={subjects} topics={topics} />
        <QuestionBank exams={exams} questions={questions} />
      </section>
      <ExamList exams={exams} />
    </div>
  );
}

function QuestionBuilder({ courses, subjects, chapters, topics }: { courses: Course[]; subjects: Subject[]; chapters: Chapter[]; topics: Topic[] }) {
  const [message, action, pending] = useActionState(createQuestionAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Question Builder</h2>
      <p className="mt-1 text-sm text-muted-foreground">Manual rich question foundation with images, explanation, tags, topic and visibility.</p>
      <form action={action} className="mt-6 grid gap-4">
        <Select name="courseId"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
        <Select name="subjectId"><option value="">Subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        <div className="grid gap-4 md:grid-cols-2">
          <Select name="chapterId"><option value="">Chapter</option>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}</Select>
          <Select name="topicId"><option value="">Topic</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</Select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="type"><option value="MCQ">MCQ</option><option value="MULTIPLE_CORRECT">Multiple Correct</option><option value="TRUE_FALSE">True False</option><option value="SHORT_ANSWER">Short Answer</option><option value="LONG_ANSWER">Long Answer</option><option value="IMAGE">Image</option><option value="PARAGRAPH">Paragraph</option><option value="ASSERTION_REASON">Assertion Reason</option><option value="CASE_STUDY">Case Study</option></Select>
          <Select name="difficulty"><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option><option value="ADVANCED">Advanced</option></Select>
          <Select name="visibility"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select>
        </div>
        <Textarea name="question" placeholder="Question" />
        <div className="grid gap-4 md:grid-cols-2"><Input name="optionA" placeholder="Option A" /><Input name="optionB" placeholder="Option B" /><Input name="optionC" placeholder="Option C" /><Input name="optionD" placeholder="Option D" /></div>
        <div className="grid gap-4 md:grid-cols-3"><Input name="correctAnswer" placeholder="Correct Answer" /><Input name="marks" placeholder="Marks" /><Input name="negativeMarks" placeholder="Negative Marks" /></div>
        <Textarea name="explanation" placeholder="Explanation. AI explanation can plug in later." />
        <Button disabled={pending} type="submit">{pending ? "Saving" : "Save Question"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function QuestionImport({ courses, subjects }: { courses: Course[]; subjects: Subject[] }) {
  const [message, action, pending] = useActionState(importQuestionsAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Question Import Engine</h2>
      <p className="mt-1 text-sm text-muted-foreground">Paste from Word, Excel, CSV, bulk text, or AI assisted import later.</p>
      <form action={action} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Select name="courseId"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
          <Select name="subjectId"><option value="">Subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        </div>
        <Textarea className="min-h-72" name="rawText" placeholder={"Question: ...\nOption A: ...\nOption B: ...\nOption C: ...\nOption D: ...\nCorrect Answer: A\nExplanation: ...\nMarks: 1\nNegative Marks: 0"} />
        <Button disabled={pending} type="submit">{pending ? "Importing" : "Parse and Import"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function ExamBuilder({ courses, subjects, chapters, topics, batches }: { courses: Course[]; subjects: Subject[]; chapters: Chapter[]; topics: Topic[]; batches: Batch[] }) {
  const [message, action, pending] = useActionState(createExamAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Exam Builder</h2>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="name" placeholder="Exam name" />
        <Textarea name="description" placeholder="Description" />
        <Textarea name="instructions" placeholder="Instructions" />
        <div className="grid gap-4 md:grid-cols-2"><Select name="courseId"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select><Select name="batchId"><option value="">Batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select></div>
        <div className="grid gap-4 md:grid-cols-3"><Select name="subjectId"><option value="">Subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select><Select name="chapterId"><option value="">Chapter</option>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}</Select><Select name="topicId"><option value="">Topic</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</Select></div>
        <div className="grid gap-4 md:grid-cols-4"><Input name="duration" placeholder="HH:MM:SS" defaultValue="00:30:00" /><Input name="totalMarks" placeholder="Total Marks" /><Input name="passingMarks" placeholder="Passing Marks" /><Input name="attemptsAllowed" placeholder="Attempts" defaultValue="1" /></div>
        <div className="grid gap-4 md:grid-cols-3"><Select name="type"><option value="PRACTICE">Practice</option><option value="MOCK">Mock</option><option value="ASSIGNMENT">Assignment</option><option value="CLASS_TEST">Class Test</option><option value="FINAL">Final</option></Select><Select name="selectionMode"><option value="MANUAL">Manual</option><option value="RANDOM">Random</option><option value="TOPIC_WISE">Topic Wise</option><option value="DIFFICULTY_WISE">Difficulty Wise</option><option value="AI_READY">AI Ready</option></Select><Select name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option></Select></div>
        <div className="grid gap-4 md:grid-cols-2"><Input name="startsAt" type="datetime-local" /><Input name="endsAt" type="datetime-local" /></div>
        <Button disabled={pending} type="submit">{pending ? "Creating" : "Create Exam"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function QuestionBank({ questions, exams }: { questions: QuestionWithDetails[]; exams: ExamWithDetails[] }) {
  const [message, action, pending] = useActionState(addQuestionToExamAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Question Selection</h2>
      <form action={action} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_0.5fr_auto]">
        <Select name="examId"><option value="">Exam</option>{exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}</Select>
        <Select name="questionId"><option value="">Question</option>{questions.map((question) => <option key={question.id} value={question.id}>{question.question.slice(0, 70)}</option>)}</Select>
        <Input name="marks" placeholder="Marks" />
        <Button disabled={pending} type="submit">Add</Button>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <div className="mt-6 space-y-3">
        {questions.length ? questions.slice(0, 8).map((question) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={question.id}>{question.question} - {sentenceCase(question.difficulty)} - {question.subject.name}</p>) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">No questions yet.</p>}
      </div>
    </Card>
  );
}

function ExamList({ exams }: { exams: ExamWithDetails[] }) {
  return <section className="grid gap-4 lg:grid-cols-2">{exams.length ? exams.map((exam) => <Card className="p-6" key={exam.id}><p className="text-sm text-muted-foreground">{sentenceCase(exam.type)} - {sentenceCase(exam.status)}</p><h2 className="mt-2 text-2xl font-semibold">{exam.name}</h2><p className="mt-3 text-sm text-muted-foreground">{exam.questions.length} questions - {exam.durationSeconds} seconds - {exam.results.length} results</p><Link className="mt-5 inline-block text-sm font-medium text-muted-foreground hover:text-foreground" href={`/exams/${exam.id}/result`}>View Results</Link></Card>) : <Card className="p-10 text-center text-muted-foreground">No exams yet.</Card>}</section>;
}

function StudentExamList({ exams }: { exams: ExamWithDetails[] }) {
  return <section className="grid gap-4 lg:grid-cols-2">{exams.length ? exams.map((exam) => <Card className="p-6" key={exam.id}><p className="text-sm text-muted-foreground">{sentenceCase(exam.type)}</p><h2 className="mt-2 text-2xl font-semibold">{exam.name}</h2><p className="mt-3 text-sm text-muted-foreground">{exam.durationSeconds} seconds - Passing {String(exam.passingMarks)}</p><Link href={`/exams/${exam.id}/take`}><Button className="mt-5">Start Exam</Button></Link></Card>) : <Card className="p-10 text-center text-muted-foreground">No exams available.</Card>}</section>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Card>;
}
