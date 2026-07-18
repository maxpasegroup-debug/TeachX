import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { MyClassroomsBoard } from "@/features/classrooms/components/my-classrooms-board";
import { getClassroomsForUser } from "@/services/classroom-service";

export default async function ClassroomsPage() {
  const session = await auth();
  const classrooms = await getClassroomsForUser(session?.user.id, session?.user.institutionId, session?.user.roles);

  return (
    <>
      <PageHeader description="Your daily teaching spaces. Open a classroom to teach, share, record, assign, and take attendance." eyebrow="Teacher workspace" title="My Classrooms" />
      <MyClassroomsBoard classrooms={classrooms} />
    </>
  );
}
