CREATE TYPE "OperationalIncidentSeverity" AS ENUM ('SEV1', 'SEV2', 'SEV3');
CREATE TYPE "OperationalIncidentStatus" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED');

CREATE TABLE "OperationalIncident" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "severity" "OperationalIncidentSeverity" NOT NULL,
  "status" "OperationalIncidentStatus" NOT NULL DEFAULT 'INVESTIGATING',
  "affectedComponents" TEXT[],
  "publicVisible" BOOLEAN NOT NULL DEFAULT true,
  "isDrill" BOOLEAN NOT NULL DEFAULT false,
  "commanderId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "acknowledgedAt" TIMESTAMP(3),
  "identifiedAt" TIMESTAMP(3),
  "monitoringAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OperationalIncident_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalIncidentUpdate" (
  "id" TEXT NOT NULL,
  "incidentId" TEXT NOT NULL,
  "status" "OperationalIncidentStatus" NOT NULL,
  "internalNote" TEXT NOT NULL,
  "publicMessage" TEXT,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OperationalIncidentUpdate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlatformOperationalControl" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "maintenanceEnabled" BOOLEAN NOT NULL DEFAULT false,
  "maintenanceMessage" TEXT,
  "maintenanceStartsAt" TIMESTAMP(3),
  "maintenanceEndsAt" TIMESTAMP(3),
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformOperationalControl_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OperationalIncident_status_severity_startedAt_idx" ON "OperationalIncident"("status", "severity", "startedAt");
CREATE INDEX "OperationalIncident_publicVisible_status_startedAt_idx" ON "OperationalIncident"("publicVisible", "status", "startedAt");
CREATE INDEX "OperationalIncident_isDrill_resolvedAt_idx" ON "OperationalIncident"("isDrill", "resolvedAt");
CREATE INDEX "OperationalIncidentUpdate_incidentId_createdAt_idx" ON "OperationalIncidentUpdate"("incidentId", "createdAt");

ALTER TABLE "OperationalIncidentUpdate" ADD CONSTRAINT "OperationalIncidentUpdate_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "OperationalIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
