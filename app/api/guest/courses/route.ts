import { NextResponse } from "next/server";

import { getCoursesForInstitution } from "@/services/course-service";
import { getDefaultInstitution } from "@/services/institution-service";

export async function GET() {
  const institution = await getDefaultInstitution();
  const courses = await getCoursesForInstitution(institution?.id);
  return NextResponse.json({ courses });
}
