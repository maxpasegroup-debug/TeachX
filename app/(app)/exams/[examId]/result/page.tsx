import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getLeaderboard } from "@/services/leaderboard-service";
import { getExamsForInstitution } from "@/services/exam-service";
import { sentenceCase } from "@/lib/format";

export default async function ExamResultPage({ params }: { params: Promise<{ examId: string }> }) {
  const session = await auth();
  const { examId } = await params;
  const [exams, leaderboard] = await Promise.all([
    getExamsForInstitution(session?.user.institutionId),
    getLeaderboard(examId)
  ]);
  const exam = exams.find((item) => item.id === examId);

  return (
    <>
      <PageHeader description="Instant score, detailed answers, leaderboard, and analytics foundation." eyebrow="Exam result" title={exam?.name ?? "Result"} />
      <section className="grid gap-4 md:grid-cols-4">
        <Mini label="Attempts" value={(exam?.attempts.length ?? 0).toString()} />
        <Mini label="Results" value={(exam?.results.length ?? 0).toString()} />
        <Mini label="Questions" value={(exam?.questions.length ?? 0).toString()} />
        <Mini label="Leaderboard" value={leaderboard.length.toString()} />
      </section>
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold">Detailed Result</h2>
        <div className="mt-5 space-y-3">
          {exam?.questions.length ? exam.questions.map((item) => (
            <div className="rounded-lg bg-muted p-4" key={item.id}>
              <p className="font-medium">{item.question.question}</p>
              <p className="mt-2 text-sm text-muted-foreground">Correct Answer: {item.question.correctAnswer ?? "Manual review"} - Marks: {String(item.marks)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Explanation: {item.question.explanation ?? "No explanation added."}</p>
            </div>
          )) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">No questions attached.</p>}
        </div>
      </Card>
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        <div className="mt-5 space-y-3">
          {leaderboard.length ? leaderboard.map((item) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={item.id}>Rank {item.rank} - {sentenceCase(item.scope)} - Score {String(item.score)}</p>) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">No leaderboard yet.</p>}
        </div>
      </Card>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Card>;
}
