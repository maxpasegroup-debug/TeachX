import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { BatchBoard } from "@/features/batches/components/batch-board";
import { getAcademicSetup } from "@/services/academic-setup-service";
import { getBatchesForInstitution } from "@/services/batch-service";
import { getCoursesForInstitution } from "@/services/course-service";
import { getAssignableFaculty } from "@/services/faculty-assignment-service";

export default async function BatchesPage() {
  const session = await auth();
  const [batches, courses, setup, faculty] = await Promise.all([
    getBatchesForInstitution(session?.user.institutionId),
    getCoursesForInstitution(session?.user.institutionId),
    getAcademicSetup(session?.user.institutionId),
    getAssignableFaculty(session?.user.institutionId)
  ]);

  return (
    <>
      <PageHeader description="Create batches, define capacity, set operating mode, and assign faculty for future classroom workflows." eyebrow="Batch engine" title="Batches" />
      <BatchBoard academicYears={setup.academicYears} batches={batches} branches={setup.branches} courses={courses} faculty={faculty} />
    </>
  );
}
