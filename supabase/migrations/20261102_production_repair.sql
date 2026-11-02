-- RankPilot AI: Production Repair & Automated Auth Triggers
-- Execute this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Helper function: Check if user is an admin or superadmin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Master Auth Trigger: Auto-provision Profile, Organization, and Membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract full name or fallback to email username
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Determine initial role (founder / uzairseo accounts receive admin status automatically)
  IF NEW.email = 'founder@rankpilot.ai' 
     OR NEW.email LIKE '%@uzairseo.com'
     OR NEW.email = current_setting('app.initial_admin_email', true) THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- 1. Insert Profile
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (NEW.id, NEW.email, user_full_name, user_role, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = NOW();

  -- 2. Create Default Personal Organization
  org_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substring(NEW.id::text, 1, 8);
  INSERT INTO public.organizations (name, slug, plan, billing_email, created_at, updated_at)
  VALUES (user_full_name || '''s Agency', org_slug, 'agency', NEW.email, NOW(), NOW())
  RETURNING id INTO new_org_id;

  -- 3. Create Owner Membership
  INSERT INTO public.memberships (organization_id, user_id, role, created_at, updated_at)
  VALUES (new_org_id, NEW.id, 'owner', NOW(), NOW())
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill existing users in auth.users if missing
DO $$
DECLARE
  u RECORD;
  new_org_id UUID;
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    user_full_name := COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1));
    
    IF u.email = 'founder@rankpilot.ai' OR u.email LIKE '%@uzairseo.com' THEN
      user_role := 'admin';
    ELSE
      user_role := 'user';
    END IF;

    -- Upsert profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (u.id, u.email, user_full_name, user_role)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- If no organization membership exists, create one
    IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE user_id = u.id) THEN
      INSERT INTO public.organizations (name, slug, plan, billing_email)
      VALUES (user_full_name || '''s Agency', lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substring(u.id::text, 1, 8), 'agency', u.email)
      RETURNING id INTO new_org_id;

      INSERT INTO public.memberships (organization_id, user_id, role)
      VALUES (new_org_id, u.id, 'owner')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 5. Additional RLS Policies for Admin Oversight
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all organizations" ON public.organizations
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all websites" ON public.websites
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any website" ON public.websites
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all audit runs" ON public.audit_runs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

-- 6. High-Performance Foreign Key & Query Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON public.memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_websites_org ON public.websites(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_runs_website ON public.audit_runs(website_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_run ON public.audit_findings(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_action_items_org ON public.action_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_action_items_website ON public.action_items(website_id);
