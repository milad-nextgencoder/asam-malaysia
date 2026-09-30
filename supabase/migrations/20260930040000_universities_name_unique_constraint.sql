-- Adds a UNIQUE guarantee on public.universities.name and repairs the IIUM
-- website URL. Safe to re-run.
--
-- Background: the original seed used ON CONFLICT (name) DO NOTHING, but no
-- unique constraint on name ever existed, so re-running it would duplicate rows.
--
-- RLS is NOT touched here. public.universities already has both policies
-- (asam_public_read_universities for anon/authenticated, and
-- asam_admin_manage_universities for admins), created by the DO block in
-- 20260927000000_asam_public_website_admin.sql. No security change is needed.

-- ---------------------------------------------------------------------------
-- 1. Collapse any pre-existing duplicate names.
-- ---------------------------------------------------------------------------
-- member_profiles.university_id references universities(id) ON DELETE SET NULL,
-- so duplicates are re-pointed at the surviving row before it is deleted. That
-- preserves every member's university selection; nothing is nulled out.
DO $$
DECLARE
  dup          record;
  survivor_id  uuid;
BEGIN
  FOR dup IN
    SELECT lower(btrim(name)) AS name_key, array_agg(id ORDER BY id) AS ids
    FROM public.universities
    GROUP BY lower(btrim(name))
    HAVING count(*) > 1
  LOOP
    -- Prefer the row referenced by the most members; break ties on lowest id
    -- so the choice is deterministic.
    SELECT u.id INTO survivor_id
    FROM public.universities u
    WHERE lower(btrim(u.name)) = dup.name_key
    ORDER BY (
      SELECT count(*) FROM public.member_profiles mp WHERE mp.university_id = u.id
    ) DESC, u.id ASC
    LIMIT 1;

    UPDATE public.member_profiles mp
    SET university_id = survivor_id
    WHERE mp.university_id = ANY (dup.ids)
      AND mp.university_id IS DISTINCT FROM survivor_id;

    DELETE FROM public.universities u
    WHERE lower(btrim(u.name)) = dup.name_key
      AND u.id <> survivor_id;
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Enforce uniqueness (case/whitespace insensitive).
-- ---------------------------------------------------------------------------
-- Idempotent by construction.
--
-- ADD CONSTRAINT ... UNIQUE USING INDEX renames the index to the constraint
-- name. So a naive `CREATE UNIQUE INDEX IF NOT EXISTS <old_name>` on a rerun
-- would find the old name gone, create a second redundant unique index, and
-- then skip the ALTER because the constraint already exists. Guarding on the
-- constraint alone avoids that, and the DROP clears any index left behind by a
-- previous partial run.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.universities'::regclass
      AND conname = 'universities_name_unique'
      AND contype = 'u'
  ) THEN
    DROP INDEX IF EXISTS public.universities_name_unique_idx;

    CREATE UNIQUE INDEX universities_name_unique_idx
      ON public.universities (lower(btrim(name)));

    ALTER TABLE public.universities
      ADD CONSTRAINT universities_name_unique
      UNIQUE USING INDEX universities_name_unique_idx;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Correct the IIUM website. The seed stored https://www.iium.edu.py, which
--    is Paraguay's country-code domain, not IIUM's official Malaysian site.
-- ---------------------------------------------------------------------------
UPDATE public.universities
SET website = 'https://www.iium.edu.my',
    updated_at = now()
WHERE name = 'Universiti Islam Antarabangsa Malaysia'
  AND website IS DISTINCT FROM 'https://www.iium.edu.my';
