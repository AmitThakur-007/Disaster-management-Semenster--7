-- AddColumn phone (optional for backward compatibility with existing accounts)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- AddColumn firstName and lastName (optional for backward-compat; existing records keep name)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Index for phone number searches (partial, only non-null rows)
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User" ("phone") WHERE "phone" IS NOT NULL;

-- Unique index for phone number (only enforce uniqueness on non-null values via partial index)
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_unique" ON "User" ("phone") WHERE "phone" IS NOT NULL;

-- Index for email-based searches (email already has a unique constraint, but an explicit index helps queries)
CREATE INDEX IF NOT EXISTS "User_email_search_idx" ON "User" ("email");
