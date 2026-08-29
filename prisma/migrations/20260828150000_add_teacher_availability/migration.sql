-- Structured teacher availability is private booking preparation only. It is
-- additive and does not make a teacher bookable or change existing profiles.
CREATE TABLE "TeacherAvailability" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "sessionDurations" INTEGER[] NOT NULL DEFAULT ARRAY[30, 60],
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "maxSessionsPerDay" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeacherAvailability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherAvailabilityWeeklyRule" (
    "id" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeacherAvailabilityWeeklyRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherAvailabilityUnavailableDate" (
    "id" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherAvailabilityUnavailableDate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherAvailability_institutionId_teacherId_key" ON "TeacherAvailability"("institutionId", "teacherId");
CREATE INDEX "TeacherAvailability_teacherId_idx" ON "TeacherAvailability"("teacherId");
CREATE UNIQUE INDEX "TeacherAvailabilityWeeklyRule_availabilityId_weekday_key" ON "TeacherAvailabilityWeeklyRule"("availabilityId", "weekday");
CREATE UNIQUE INDEX "TeacherAvailabilityUnavailableDate_availabilityId_date_key" ON "TeacherAvailabilityUnavailableDate"("availabilityId", "date");
CREATE INDEX "TeacherAvailabilityUnavailableDate_availabilityId_date_idx" ON "TeacherAvailabilityUnavailableDate"("availabilityId", "date");

ALTER TABLE "TeacherAvailability" ADD CONSTRAINT "TeacherAvailability_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAvailability" ADD CONSTRAINT "TeacherAvailability_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAvailabilityWeeklyRule" ADD CONSTRAINT "TeacherAvailabilityWeeklyRule_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "TeacherAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAvailabilityUnavailableDate" ADD CONSTRAINT "TeacherAvailabilityUnavailableDate_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "TeacherAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
