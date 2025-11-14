-- Ensure serial number columns and justificatif columns exist with correct defaults
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Produit'
          AND column_name = 'serialNumbers'
    ) THEN
        ALTER TABLE "Produit"
            ADD COLUMN "serialNumbers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
    END IF;
END
$$;

UPDATE "Produit"
SET "serialNumbers" = ARRAY[]::TEXT[]
WHERE "serialNumbers" IS NULL;

ALTER TABLE "Produit"
    ALTER COLUMN "serialNumbers" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Produit"
    ALTER COLUMN "serialNumbers" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'MouvementStock'
          AND column_name = 'serialNumbers'
    ) THEN
        ALTER TABLE "MouvementStock"
            ADD COLUMN "serialNumbers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
    END IF;
END
$$;

UPDATE "MouvementStock"
SET "serialNumbers" = ARRAY[]::TEXT[]
WHERE "serialNumbers" IS NULL;

ALTER TABLE "MouvementStock"
    ALTER COLUMN "serialNumbers" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "MouvementStock"
    ALTER COLUMN "serialNumbers" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'MouvementStock'
          AND column_name = 'justificatifFilename'
    ) THEN
        ALTER TABLE "MouvementStock"
            ADD COLUMN "justificatifFilename" TEXT;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'MouvementStock'
          AND column_name = 'justificatifMime'
    ) THEN
        ALTER TABLE "MouvementStock"
            ADD COLUMN "justificatifMime" TEXT;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'MouvementStock'
          AND column_name = 'justificatifData'
    ) THEN
        ALTER TABLE "MouvementStock"
            ADD COLUMN "justificatifData" BYTEA;
    END IF;
END
$$;
