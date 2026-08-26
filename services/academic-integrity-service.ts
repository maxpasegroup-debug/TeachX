import { prisma } from "@/lib/db";

const facultyRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

export type AcademicReferences = {
  courseId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  batchId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  academicYearId?: string | null;
  facultyId?: string | null;
  questionId?: string | null;
  examId?: string | null;
  timeSlotId?: string | null;
  roomId?: string | null;
  timetableEntryId?: string | null;
  classroomId?: string | null;
};

export async function requireAcademicReferences(institutionId: string, refs: AcademicReferences) {
  if (!institutionId) throw new Error("Institution context is required.");

  const [course, subject, chapter, topic, batch, branch, department, academicYear, faculty, question, exam, timeSlot, room, timetableEntry, classroom] = await Promise.all([
    refs.courseId ? prisma.course.findFirst({ where: { id: refs.courseId, institutionId }, select: { id: true } }) : null,
    refs.subjectId ? prisma.subject.findFirst({ where: { id: refs.subjectId, course: { institutionId }, ...(refs.courseId ? { courseId: refs.courseId } : {}) }, select: { id: true, courseId: true } }) : null,
    refs.chapterId ? prisma.chapter.findFirst({ where: { id: refs.chapterId, course: { institutionId }, ...(refs.courseId ? { courseId: refs.courseId } : {}), ...(refs.subjectId ? { subjectId: refs.subjectId } : {}) }, select: { id: true } }) : null,
    refs.topicId ? prisma.topic.findFirst({ where: { id: refs.topicId, course: { institutionId }, ...(refs.courseId ? { courseId: refs.courseId } : {}), ...(refs.subjectId ? { subjectId: refs.subjectId } : {}), ...(refs.chapterId ? { chapterId: refs.chapterId } : {}) }, select: { id: true } }) : null,
    refs.batchId ? prisma.batch.findFirst({ where: { id: refs.batchId, course: { institutionId }, ...(refs.courseId ? { courseId: refs.courseId } : {}) }, select: { id: true, courseId: true } }) : null,
    refs.branchId ? prisma.branch.findFirst({ where: { id: refs.branchId, institutionId }, select: { id: true } }) : null,
    refs.departmentId ? prisma.department.findFirst({ where: { id: refs.departmentId, institutionId }, select: { id: true } }) : null,
    refs.academicYearId ? prisma.academicYear.findFirst({ where: { id: refs.academicYearId, institutionId }, select: { id: true } }) : null,
    refs.facultyId ? prisma.user.findFirst({ where: { id: refs.facultyId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: facultyRoles } } } } }, select: { id: true } }) : null,
    refs.questionId ? prisma.question.findFirst({ where: { id: refs.questionId, course: { institutionId }, ...(refs.courseId ? { courseId: refs.courseId } : {}), ...(refs.subjectId ? { subjectId: refs.subjectId } : {}), ...(refs.chapterId ? { chapterId: refs.chapterId } : {}), ...(refs.topicId ? { topicId: refs.topicId } : {}) }, select: { id: true, courseId: true, subjectId: true } }) : null,
    refs.examId ? prisma.exam.findFirst({ where: { id: refs.examId, institutionId, ...(refs.courseId ? { courseId: refs.courseId } : {}), ...(refs.batchId ? { batchId: refs.batchId } : {}) }, select: { id: true, courseId: true, subjectId: true, chapterId: true, topicId: true, batchId: true } }) : null,
    refs.timeSlotId ? prisma.timeSlot.findFirst({ where: { id: refs.timeSlotId, institutionId }, select: { id: true } }) : null,
    refs.roomId ? prisma.room.findFirst({ where: { id: refs.roomId, institutionId }, select: { id: true } }) : null,
    refs.timetableEntryId ? prisma.timetableEntry.findFirst({ where: { id: refs.timetableEntryId, course: { institutionId } }, select: { id: true, courseId: true } }) : null,
    refs.classroomId ? prisma.classroom.findFirst({ where: { id: refs.classroomId, institutionId, ...(refs.courseId ? { courseId: refs.courseId } : {}), ...(refs.batchId ? { batchId: refs.batchId } : {}) }, select: { id: true, courseId: true, batchId: true } }) : null
  ]);

  const checks: Array<[unknown, unknown, string]> = [
    [refs.courseId, course, "course"], [refs.subjectId, subject, "subject"], [refs.chapterId, chapter, "chapter"],
    [refs.topicId, topic, "topic"], [refs.batchId, batch, "batch"], [refs.branchId, branch, "branch"],
    [refs.departmentId, department, "department"], [refs.academicYearId, academicYear, "academic year"],
    [refs.facultyId, faculty, "faculty member"], [refs.questionId, question, "question"], [refs.examId, exam, "exam"],
    [refs.timeSlotId, timeSlot, "time slot"], [refs.roomId, room, "room"], [refs.timetableEntryId, timetableEntry, "timetable entry"],
    [refs.classroomId, classroom, "classroom"]
  ];
  const invalid = checks.find(([requested, resolved]) => requested && !resolved);
  if (invalid) throw new Error(`The selected ${invalid[2]} is outside your institution or academic scope.`);

  if (exam && question) {
    if (exam.courseId !== question.courseId || (exam.subjectId && exam.subjectId !== question.subjectId)) {
      throw new Error("The selected question does not belong to this exam's academic scope.");
    }
    const scopedQuestion = await prisma.question.count({
      where: {
        id: question.id,
        ...(exam.chapterId ? { chapterId: exam.chapterId } : {}),
        ...(exam.topicId ? { topicId: exam.topicId } : {})
      }
    });
    if (scopedQuestion !== 1) throw new Error("The selected question does not belong to this exam's chapter or topic.");
  }

  if (timetableEntry && subject && timetableEntry.courseId !== subject.courseId) {
    throw new Error("The selected subject does not belong to this timetable entry's course.");
  }

  return { course, subject, chapter, topic, batch, branch, department, academicYear, faculty, question, exam, timeSlot, room, timetableEntry, classroom };
}
