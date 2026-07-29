import { auth } from "@/auth";
import { PracticeWorkspace } from "@/features/student-practice/components/practice-workspace";
import { getStudentPractice } from "@/services/student-practice-service";
export default async function Page(){const s=await auth();return <PracticeWorkspace data={await getStudentPractice(s?.user.id)}/>}