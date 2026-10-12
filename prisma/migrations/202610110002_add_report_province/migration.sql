-- Migration: 202610110002_add_report_province
-- Adds optional province column to Report to support nationwide Nepal administrative hierarchy.
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "province" TEXT;
