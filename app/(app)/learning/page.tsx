import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { LearningHub } from "@/features/learning/components/learning-hub";
import { getStudentClassrooms } from "@/services/learning-service";

export default async function LearningPage() {
  const session = await auth();
  const classrooms = await getStudentClassrooms(session?.user.id, session?.user.institutionId);

  return (
    <>
      <PageHeader description="Only the courses you are enrolled in. Open a course to continue learning." eyebrow="Student learning" title="My Learning" />
      <LearningHub classrooms={classrooms} />
    </>
  );
}
