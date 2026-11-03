-- ==============================================================================
-- RANKPILOT AI: SYNC AUTH USERS TO PROFILES & SUPERADMIN ACCESS RESTORATION
-- Migration Date: November 3, 2026
-- Resolves: Signup user data showing in Supabase Auth but not in Admin Dashboard
-- ==============================================================================

-- 1. Ensure Profiles Table Has All Registered Users from auth.users
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
    u.id, 
    u.email, 
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'User'),
    CASE 
        WHEN u.email = 'uzairnoor1101@gmail.com' 
          OR u.email LIKE '%uzairnoor%' 
          OR u.email = 'founder@rankpilot.ai' 
          OR u.email LIKE '%@uzairseo.com' THEN 'superadmin'
        ELSE 'user'
    END,
    COALESCE(u.created_at, NOW()),
    NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    role = CASE 
        WHEN EXCLUDED.email = 'uzairnoor1101@gmail.com' 
          OR EXCLUDED.email LIKE '%uzairnoor%' 
          OR EXCLUDED.email = 'founder@rankpilot.ai' 
          OR EXCLUDED.email LIKE '%@uzairseo.com' THEN 'superadmin'
        ELSE COALESCE(public.profiles.role, 'user')
    END,
    updated_at = NOW();

-- 2. Update is_admin Security Function to Authoritatively Recognize Superadmins
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id 
      AND (
        role IN ('admin', 'superadmin')
        OR email = 'uzairnoor1101@gmail.com'
        OR email LIKE '%uzairnoor%'
        OR email = 'founder@rankpilot.ai'
        OR email LIKE '%@uzairseo.com'
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure Personal Workspaces & Memberships Exist for All Users
DO $$
DECLARE
    u_rec RECORD;
    new_org_id UUID;
    org_name TEXT;
    user_name TEXT;
BEGIN
    FOR u_rec IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
        user_name := COALESCE(u_rec.raw_user_meta_data->>'full_name', split_part(u_rec.email, '@', 1), 'User');
        org_name := user_name || '''s Agency';

        -- If founder and main organization exists, link membership
        IF (u_rec.email = 'uzairnoor1101@gmail.com' OR u_rec.email = 'founder@rankpilot.ai') 
           AND EXISTS (SELECT 1 FROM public.organizations WHERE id = '2fff7e42-627e-4582-8982-aa8463bf9fca') THEN
            INSERT INTO public.memberships (organization_id, user_id, role)
            VALUES ('2fff7e42-627e-4582-8982-aa8463bf9fca', u_rec.id, 'owner')
            ON CONFLICT (organization_id, user_id) DO NOTHING;
        ELSE
            -- Ensure every user has at least one active workspace membership
            IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE user_id = u_rec.id) THEN
                new_org_id := gen_random_uuid();
                INSERT INTO public.organizations (id, name, slug, plan)
                VALUES (new_org_id, org_name, 'org-' || SUBSTRING(new_org_id::text FROM 1 FOR 8), 'free')
                ON CONFLICT (id) DO NOTHING;

                INSERT INTO public.memberships (organization_id, user_id, role)
                VALUES (new_org_id, u_rec.id, 'owner')
                ON CONFLICT (organization_id, user_id) DO NOTHING;
            END IF;
        END IF;
    END LOOP;
END $$;

-- 4. Ensure RLS Policy on Profiles Permits Superadmin and Profile Owner Access
DROP POLICY IF EXISTS "Allow select profiles" ON public.profiles;
CREATE POLICY "Allow select profiles" ON public.profiles
FOR SELECT USING (
    id = auth.uid() OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
CREATE POLICY "Allow update profiles" ON public.profiles
FOR UPDATE USING (
    id = auth.uid() OR public.is_admin(auth.uid())
);

-- 5. Automate Future Signups with Exception-Safe Hook
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    org_name TEXT;
    user_name TEXT;
    user_role TEXT;
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User');
    org_name := user_name || '''s Agency';

    IF NEW.email = 'uzairnoor1101@gmail.com' 
       OR NEW.email LIKE '%uzairnoor%' 
       OR NEW.email = 'founder@rankpilot.ai' 
       OR NEW.email LIKE '%@uzairseo.com' THEN
        user_role := 'superadmin';
    ELSE
        user_role := 'user';
    END IF;

    -- Upsert Profile
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (NEW.id, NEW.email, user_name, user_role)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    -- Create Workspace & Membership
    BEGIN
        IF (NEW.email = 'uzairnoor1101@gmail.com' OR NEW.email = 'founder@rankpilot.ai') 
           AND EXISTS (SELECT 1 FROM public.organizations WHERE id = '2fff7e42-627e-4582-8982-aa8463bf9fca') THEN
            INSERT INTO public.memberships (organization_id, user_id, role)
            VALUES ('2fff7e42-627e-4582-8982-aa8463bf9fca', NEW.id, 'owner')
            ON CONFLICT (organization_id, user_id) DO NOTHING;
        ELSE
            new_org_id := gen_random_uuid();
            INSERT INTO public.organizations (id, name, slug, plan)
            VALUES (new_org_id, org_name, 'org-' || SUBSTRING(new_org_id::text FROM 1 FOR 8), 'free')
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO public.memberships (organization_id, user_id, role)
            VALUES (new_org_id, NEW.id, 'owner')
            ON CONFLICT (organization_id, user_id) DO NOTHING;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
