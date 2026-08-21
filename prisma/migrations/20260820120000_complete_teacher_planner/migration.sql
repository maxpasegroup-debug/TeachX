CREATE TYPE "PlannerItemKind" AS ENUM ('EVENT', 'MEETING', 'REMINDER', 'DEADLINE', 'TASK', 'LESSON');
CREATE TYPE "PlannerItemStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
CREATE TYPE "PlannerPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

ALTER TABLE "PlannerEvent"
ADD COLUMN "createdById" TEXT,
ADD COLUMN "kind" "PlannerItemKind" NOT NULL DEFAULT 'EVENT',
ADD COLUMN "status" "PlannerItemStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "priority" "PlannerPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "location" TEXT,
ADD COLUMN "classroomId" TEXT,
ADD COLUMN "lessonId" TEXT;

CREATE INDEX "PlannerEvent_institutionId_createdById_startsAt_idx" ON "PlannerEvent"("institutionId", "createdById", "startsAt");
CREATE INDEX "PlannerEvent_createdById_status_startsAt_idx" ON "PlannerEvent"("createdById", "status", "startsAt");

ALTER TABLE "PlannerEvent" ADD CONSTRAINT "PlannerEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlannerEvent" ADD CONSTRAINT "PlannerEvent_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlannerEvent" ADD CONSTRAINT "PlannerEvent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
