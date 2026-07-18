import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { CourseBoard } from "@/features/courses/components/course-board";
import { getAcademicSetup } from "@/services/academic-setup-service";
import { getCoursesForInstitution } from "@/services/course-service";

export default async function CoursesPage() {
  const session = await auth();
  const [courses, setup] = await Promise.all([
    getCoursesForInstitution(session?.user.institutionId),
    getAcademicSetup(session?.user.institutionId)
  ]);

  return (
    <>
      <PageHeader description="Create courses and subjects without adding content, attendance, exams, or LMS features yet." eyebrow="Academic structure" title="Courses" />
      <CourseBoard academicYears={setup.academicYears} branches={setup.branches} courses={courses} departments={setup.departments} />
    </>
  );
}
