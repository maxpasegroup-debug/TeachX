import { auth } from "@/auth";
import { TeacherResourceLibrary } from "@/features/learning-marketplace/components/learning-marketplace-components";
import { getTeacherResourceLibrary } from "@/services/learning-marketplace-service";

export default async function TeacherResourcesPage() {
  const session = await auth();
  const data = await getTeacherResourceLibrary(session?.user.id, session?.user.institutionId);

  return <TeacherResourceLibrary data={data} />;
}
