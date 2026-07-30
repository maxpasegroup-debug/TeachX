ALTER TABLE "Assignment" ADD COLUMN "maxMarks" DOUBLE PRECISION,
ADD COLUMN "allowResubmission" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "AssignmentSubmission" ADD COLUMN "draftText" TEXT,
ADD COLUMN "marks" DOUBLE PRECISION,
ADD COLUMN "maxMarks" DOUBLE PRECISION,
ADD COLUMN "rubric" JSONB,
ADD COLUMN "reviewedById" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "aiFeedback" JSONB;

CREATE TABLE "AssignmentSubmissionRevision" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "SubmissionStatus" NOT NULL,
  "text" TEXT,
  "attachments" JSONB,
  "submittedAt" TIMESTAMP(3),
  "feedback" TEXT,
  "marks" DOUBLE PRECISION,
  "maxMarks" DOUBLE PRECISION,
  "rubric" JSONB,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssignmentSubmissionRevision_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AssignmentSubmissionRevision_submissionId_version_key" ON "AssignmentSubmissionRevision"("submissionId", "version");
CREATE INDEX "AssignmentSubmissionRevision_submissionId_createdAt_idx" ON "AssignmentSubmissionRevision"("submissionId", "createdAt");
ALTER TABLE "AssignmentSubmissionRevision" ADD CONSTRAINT "AssignmentSubmissionRevision_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "AssignmentSubmission_reviewedById_idx" ON "AssignmentSubmission"("reviewedById");
CREATE INDEX "AssignmentSubmissionRevision_reviewedById_idx" ON "AssignmentSubmissionRevision"("reviewedById");
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmissionRevision" ADD CONSTRAINT "AssignmentSubmissionRevision_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AssignmentDoubt" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssignmentDoubt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AssignmentDoubtMessage" (
  "id" TEXT NOT NULL,
  "doubtId" TEXT NOT NULL,
  "authorId" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssignmentDoubtMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AssignmentDoubt_assignmentId_studentId_key" ON "AssignmentDoubt"("assignmentId","studentId");
CREATE INDEX "AssignmentDoubt_studentId_updatedAt_idx" ON "AssignmentDoubt"("studentId","updatedAt");
CREATE INDEX "AssignmentDoubtMessage_doubtId_createdAt_idx" ON "AssignmentDoubtMessage"("doubtId","createdAt");
ALTER TABLE "AssignmentDoubt" ADD CONSTRAINT "AssignmentDoubt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentDoubt" ADD CONSTRAINT "AssignmentDoubt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentDoubtMessage" ADD CONSTRAINT "AssignmentDoubtMessage_doubtId_fkey" FOREIGN KEY ("doubtId") REFERENCES "AssignmentDoubt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentDoubtMessage" ADD CONSTRAINT "AssignmentDoubtMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;