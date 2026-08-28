-- Teacher-managed Earn More service catalogue. These records do not enable
-- checkout, payouts, or settlement; those remain in the shared commerce flow.
CREATE TABLE "TeacherEarningService" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeacherEarningService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherEarningServicePlan" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "sessions" INTEGER,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeacherEarningServicePlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeacherEarningService_institutionId_teacherId_type_idx" ON "TeacherEarningService"("institutionId", "teacherId", "type");
CREATE INDEX "TeacherEarningService_institutionId_status_idx" ON "TeacherEarningService"("institutionId", "status");
CREATE INDEX "TeacherEarningServicePlan_serviceId_status_idx" ON "TeacherEarningServicePlan"("serviceId", "status");

ALTER TABLE "TeacherEarningService" ADD CONSTRAINT "TeacherEarningService_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherEarningService" ADD CONSTRAINT "TeacherEarningService_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherEarningServicePlan" ADD CONSTRAINT "TeacherEarningServicePlan_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "TeacherEarningService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
