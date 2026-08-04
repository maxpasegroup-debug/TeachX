import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { StudentPlatformWorkspace } from "@/features/student-platform/components/student-platform-workspace";
import { getStudentPlatform, type StudentPlatformView } from "@/services/student-platform-service";
export default async function StudentPlatformPage({ view }: { view: StudentPlatformView }) { const session = await auth(); const data = await getStudentPlatform({ userId: session?.user.id, institutionId: session?.user.institutionId }); if (!data) notFound(); return <StudentPlatformWorkspace data={data} initialView={view}/>; }