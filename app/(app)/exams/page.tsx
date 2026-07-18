import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { ExamManagement } from "@/features/exams/components/exam-management";
import type { RoleKey } from "@/lib/constants/roles";
import { getBatchesForInstitution } from "@/services/batch-service";
import { getCoursesForInstitution } from "@/services/course-service";
import { getAvailableStudentExams, getExamsForInstitution } from "@/services/exam-service";
import { getQuestionBank, getQuestionSetup } from "@/services/question-service";

export default async function ExamsPage() {
  const session = await auth();
  const roles = session?.user.roles ?? [];
  const isStudent = roles.includes("STUDENT" as RoleKey);

  if (isStudent) {
    const exams = await getAvailableStudentExams(session?.user.id);
    return (
      <>
        <PageHeader description="Write exams, see results, and understand what to study next." eyebrow="Student exams" title="Exams" />
        <ExamManagement batches={[]} chapters={[]} courses={[]} exams={exams as never} questions={[]} studentMode topics={[]} />
      </>
    );
  }

  const [courses, batches, questions, exams, setup] = await Promise.all([
    getCoursesForInstitution(session?.user.institutionId),
    getBatchesForInstitution(session?.user.institutionId),
    getQuestionBank(session?.user.institutionId),
    getExamsForInstitution(session?.user.institutionId),
    getQuestionSetup(session?.user.institutionId)
  ]);

  return (
    <>
      <PageHeader description="Create question banks, import papers, build exams, schedule them, and review performance." eyebrow="Examination system" title="Exams" />
      <ExamManagement batches={batches} chapters={setup.chapters} courses={courses} exams={exams} questions={questions} topics={setup.topics} />
    </>
  );
}
