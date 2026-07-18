"use client";

import { useActionState, useState } from "react";
import type { ExamWithDetails } from "@/services/exam-service";
import { saveExamAnswerAction, startExamAttemptAction, submitExamAttemptAction } from "@/features/exams/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ExamTakePage({ exam }: { exam: ExamWithDetails }) {
  const [index, setIndex] = useState(0);
  const [attemptId, setAttemptId] = useState(exam.attempts[0]?.id ?? "");
  const [startMessage, startAction, startPending] = useActionState(async (_: string | undefined, formData: FormData) => {
    const id = await startExamAttemptAction(undefined, formData);
    setAttemptId(id);
    return id;
  }, undefined);
  const [saveMessage, saveAction, savePending] = useActionState(saveExamAnswerAction, undefined);
  const [submitMessage, submitAction, submitPending] = useActionState(submitExamAttemptAction, undefined);
  const item = exam.questions[index];

  if (!attemptId) {
    return <Card className="p-10 text-center"><h1 className="text-3xl font-semibold">{exam.name}</h1><p className="mt-3 text-muted-foreground">{exam.instructions ?? "Read each question carefully."}</p><form action={startAction} className="mt-8"><input name="examId" type="hidden" value={exam.id} /><Button disabled={startPending} type="submit">Begin Exam</Button></form>{startMessage ? <p className="mt-3 text-sm text-muted-foreground">{startMessage}</p> : null}</Card>;
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div><p className="text-sm text-muted-foreground">Timer</p><h1 className="text-4xl font-semibold">00 {Math.floor(exam.durationSeconds / 60).toString().padStart(2, "0")} 00</h1></div>
        <div className="flex flex-wrap gap-2">{exam.questions.map((question, questionIndex) => <button className={`h-10 w-10 rounded-lg ${questionIndex === index ? "bg-primary text-primary-foreground" : "bg-muted"}`} key={question.id} onClick={() => setIndex(questionIndex)} type="button">{questionIndex + 1}</button>)}</div>
      </Card>
      <Card className="p-8">
        <p className="text-sm text-muted-foreground">Question {index + 1}</p>
        <h2 className="mt-3 text-2xl font-semibold leading-9">{item?.question.question}</h2>
        <form action={saveAction} className="mt-8 space-y-4">
          <input name="attemptId" type="hidden" value={attemptId} />
          <input name="questionId" type="hidden" value={item?.question.id} />
          {item?.question.options.length ? item.question.options.map((option) => <label className="flex items-center gap-3 rounded-lg bg-muted px-4 py-4" key={option.id}><input name="answer" type="radio" value={option.label} />{option.label}. {option.text}</label>) : <Input name="answer" placeholder="Write answer" />}
          <div className="flex flex-wrap gap-3">
            <Button disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))} type="button" variant="secondary">Previous</Button>
            <Button disabled={savePending} name="status" type="submit" value="ANSWERED">Save</Button>
            <Button name="status" type="submit" value="SKIPPED" variant="secondary">Skip</Button>
            <Button name="status" type="submit" value="MARKED_REVIEW" variant="secondary">Mark Review</Button>
            <Button disabled={index === exam.questions.length - 1} onClick={() => setIndex((value) => Math.min(exam.questions.length - 1, value + 1))} type="button" variant="secondary">Next</Button>
          </div>
        </form>
        {saveMessage ? <p className="mt-3 text-sm text-muted-foreground">{saveMessage}</p> : null}
      </Card>
      <form action={submitAction}><input name="attemptId" type="hidden" value={attemptId} /><Button disabled={submitPending} type="submit">Submit Exam</Button>{submitMessage ? <p className="mt-3 text-sm text-muted-foreground">{submitMessage}</p> : null}</form>
    </div>
  );
}
