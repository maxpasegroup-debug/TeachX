export function ownedPersonalClassroomWhere({ userId, institutionId, classroomId }) {
  if (!userId || !institutionId || !classroomId) throw new Error("Explicit teacher, tenant, and classroom scope are required.");
  return {
    id: classroomId,
    institutionId,
    batch: { faculty: { some: { facultyId: userId } } }
  };
}

export function invitedRosterStudentWhere({ institutionId, batchId, studentId }) {
  if (!institutionId || !batchId || !studentId) throw new Error("Explicit tenant, batch, and student scope are required.");
  return {
    id: studentId,
    institutionId,
    userType: "student",
    status: "INVITED",
    studentBatches: { some: { batchId } }
  };
}

export function rosterEnrollmentWhere({ institutionId, batchId, studentId }) {
  if (!institutionId || !batchId || !studentId) throw new Error("Explicit tenant, batch, and student scope are required.");
  return {
    batchId,
    studentId,
    student: { institutionId, userType: "student" }
  };
}
