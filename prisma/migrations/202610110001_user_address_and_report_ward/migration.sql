-- Migration: 202610110001_user_address_and_report_ward
-- Adds optional address fields to User for editable profile address.
-- Adds optional ward field to Report for Kathmandu ward selection.
-- All columns are nullable so existing records are unaffected.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "province"     TEXT,
  ADD COLUMN IF NOT EXISTS "district"     TEXT,
  ADD COLUMN IF NOT EXISTS "municipality" TEXT,
  ADD COLUMN IF NOT EXISTS "ward"         TEXT,
  ADD COLUMN IF NOT EXISTS "locality"     TEXT,
  ADD COLUMN IF NOT EXISTS "addressLat"   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "addressLng"   DOUBLE PRECISION;

ALTER TABLE "Report"
  ADD COLUMN IF NOT EXISTS "ward" TEXT;
