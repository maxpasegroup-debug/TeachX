-- PostgreSQL shortens identifiers to 63 bytes. Align the explicit names in
-- the preceding hand-written migration with Prisma's canonical truncated names
-- so migrate diff remains clean in QA and CI.
ALTER INDEX "EarnMoreSettlement_institutionId_teacherId_status_availableAt_i"
  RENAME TO "EarnMoreSettlement_institutionId_teacherId_status_available_idx";

ALTER INDEX "TeacherLiveProgramRegistration_institutionId_learnerId_idempote"
  RENAME TO "TeacherLiveProgramRegistration_institutionId_learnerId_idem_key";

ALTER INDEX "TeacherLiveProgramRegistration_institutionId_programId_status_i"
  RENAME TO "TeacherLiveProgramRegistration_institutionId_programId_stat_idx";

ALTER INDEX "TeacherPayoutRequest_institutionId_teacherId_status_createdAt_i"
  RENAME TO "TeacherPayoutRequest_institutionId_teacherId_status_created_idx";

ALTER INDEX "TeacherServiceBooking_institutionId_learnerId_idempotencyKey_ke"
  RENAME TO "TeacherServiceBooking_institutionId_learnerId_idempotencyKe_key";
