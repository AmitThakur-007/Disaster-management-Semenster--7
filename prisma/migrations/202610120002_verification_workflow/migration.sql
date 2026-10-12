-- Migration: verification_workflow
-- Adds priority, assignmentInstructions, reopenReason/reopenedAt to Report
-- Adds respondedAt, dispatchedAt to IncidentAssignment
-- Creates VerificationRecommendation table

-- AlterTable Report
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'Normal';
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "assignmentInstructions" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "reopenReason" TEXT;
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "reopenedAt" TIMESTAMP(3);

-- AlterTable IncidentAssignment
ALTER TABLE "IncidentAssignment" ADD COLUMN IF NOT EXISTS "respondedAt" TIMESTAMP(3);
ALTER TABLE "IncidentAssignment" ADD COLUMN IF NOT EXISTS "dispatchedAt" TIMESTAMP(3);

-- CreateTable VerificationRecommendation
CREATE TABLE IF NOT EXISTS "VerificationRecommendation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "responderId" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "observations" TEXT,
    "visitedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VerificationRecommendation_reportId_createdAt_idx" ON "VerificationRecommendation"("reportId", "createdAt");

-- AddForeignKey (skip if already exists)
DO $$ BEGIN
  ALTER TABLE "VerificationRecommendation" ADD CONSTRAINT "VerificationRecommendation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "VerificationRecommendation" ADD CONSTRAINT "VerificationRecommendation_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
