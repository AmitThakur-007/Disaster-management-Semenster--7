ALTER TABLE "Report" ADD COLUMN "severity" TEXT NOT NULL DEFAULT 'Medium';
ALTER TABLE "Report" ADD COLUMN "locality" TEXT;
ALTER TABLE "Report" ADD COLUMN "district" TEXT;
ALTER TABLE "Report" ADD COLUMN "municipality" TEXT;
ALTER TABLE "Report" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Report" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Report" ADD COLUMN "incidentAt" TIMESTAMP(3);
ALTER TABLE "Report" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Report" ADD COLUMN "verifierId" TEXT;
ALTER TABLE "Report" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "Report" ADD COLUMN "resolutionSummary" TEXT;
UPDATE "Report" SET "status" = CASE "status" WHEN 'Submitted' THEN 'Reported' WHEN 'Under review' THEN 'Verified' ELSE "status" END;
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'Reported';
CREATE INDEX "Report_status_severity_createdAt_idx" ON "Report"("status", "severity", "createdAt");
CREATE INDEX "Report_latitude_longitude_idx" ON "Report"("latitude", "longitude");
CREATE TABLE "ResponseOrganization" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "type" TEXT NOT NULL, "jurisdiction" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResponseOrganization_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ResponseTeam" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ResponseTeam_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TeamMember" (
  "teamId" TEXT NOT NULL, "userId" TEXT NOT NULL, CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("teamId", "userId")
);
CREATE TABLE "IncidentAssignment" (
  "id" TEXT NOT NULL, "reportId" TEXT NOT NULL, "teamId" TEXT NOT NULL, "assignedById" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "acknowledgedAt" TIMESTAMP(3),
  "progressNote" TEXT, "active" BOOLEAN NOT NULL DEFAULT true, CONSTRAINT "IncidentAssignment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "IncidentEvent" (
  "id" TEXT NOT NULL, "reportId" TEXT NOT NULL, "actorId" TEXT NOT NULL, "type" TEXT NOT NULL,
  "previousStatus" TEXT, "newStatus" TEXT, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IncidentEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResponseOrganization_name_key" ON "ResponseOrganization"("name");
CREATE UNIQUE INDEX "ResponseTeam_organizationId_name_key" ON "ResponseTeam"("organizationId", "name");
CREATE UNIQUE INDEX "IncidentAssignment_reportId_teamId_key" ON "IncidentAssignment"("reportId", "teamId");
CREATE INDEX "IncidentAssignment_teamId_active_idx" ON "IncidentAssignment"("teamId", "active");
CREATE INDEX "IncidentEvent_reportId_createdAt_idx" ON "IncidentEvent"("reportId", "createdAt");
ALTER TABLE "ResponseOrganization" ADD CONSTRAINT "ResponseOrganization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResponseTeam" ADD CONSTRAINT "ResponseTeam_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "ResponseOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ResponseTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IncidentAssignment" ADD CONSTRAINT "IncidentAssignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IncidentAssignment" ADD CONSTRAINT "IncidentAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ResponseTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IncidentAssignment" ADD CONSTRAINT "IncidentAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IncidentEvent" ADD CONSTRAINT "IncidentEvent_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IncidentEvent" ADD CONSTRAINT "IncidentEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
